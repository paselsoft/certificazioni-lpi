// Shell simulata per la pratica al terminale (tappa M5): un piccolo file system in memoria e un
// interprete con il sottoinsieme di Bash che serve all'esame. I comandi sono in shell-commands.js;
// i filtri di testo (sort, uniq, cut, tr, nl, sed...) vengono dal motore di Pipe Dreams
// (lib/pipedreams-commands.js e lib/pipedreams-terminal.js, copiati senza modifiche).
//
// Come si comporta: come Bash con LC_ALL=C (ordinamento byte per byte, date all'inglese), ma con i
// messaggi di errore in italiano. tools/check-shell.js confronta le soluzioni degli esercizi e
// altri casi con Bash e GNU coreutils veri.
//
// Il file system: ogni nodo è { type: "d" | "f" | "l", mode, owner, group, mtime, children (d),
// data (f), target (l) }. Un hard link è lo stesso nodo in due directory.

// Ora di partenza dell'orologio del simulatore (tools/check-shell.js la sposta a «adesso»)
var SIM_START = new Date(2026, 10, 12, 10, 0, 0).getTime();
const SIM_USERS = {
    root: { uid: 0, gid: 0, home: "/root", shell: "/bin/bash", groups: ["root"] },
    anna: { uid: 1000, gid: 1000, home: "/home/anna", shell: "/bin/bash", groups: ["anna", "sudo", "sviluppo"], name: "Anna Rossi" },
    luca: { uid: 1001, gid: 1001, home: "/home/luca", shell: "/bin/bash", groups: ["luca", "sviluppo"], name: "Luca Bianchi" },
    "www-data": { uid: 33, gid: 33, home: "/var/www", shell: "/usr/sbin/nologin", groups: ["www-data"], name: "www-data" }
};
const SIM_GROUPS = { root: 0, adm: 4, sudo: 27, "www-data": 33, anna: 1000, luca: 1001, sviluppo: 1002 };
const SIM_UMASK = 0o022;

const ERRORS = {
    ENOENT: "File o directory non esistente",
    ENOTDIR: "Non è una directory",
    EACCES: "Permesso negato",
    EISDIR: "È una directory",
    EEXIST: "File esistente",
    ENOTEMPTY: "Directory non vuota",
    ELOOP: "Troppi livelli di collegamenti simbolici",
    EPERM: "Operazione non permessa",
    EINVAL: "Argomento non valido"
};

class SimError extends Error {
    constructor(code) {
        super(ERRORS[code] || code);
        this.code = code;
    }
}

// ---- Nodi ----

function simNode(type, sh, extra = {}) {
    const node = {
        type,
        mode: type === "d" ? 0o777 & ~SIM_UMASK : type === "l" ? 0o777 : 0o666 & ~SIM_UMASK,
        owner: sh ? sh.user : "root",
        group: sh ? SIM_USERS[sh.user].groups[0] : "root",
        mtime: sh ? sh.clock : SIM_START
    };
    if (type === "d") node.children = Object.create(null);
    if (type === "f") node.data = "";
    return Object.assign(node, extra);
}

const sortedNames = dir => Object.keys(dir.children).sort(byteCompare);
function byteCompare(a, b) {
    // Ordine di LC_ALL=C: byte per byte (UTF-8)
    const x = new TextEncoder().encode(a);
    const y = new TextEncoder().encode(b);
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i];
    return x.length - y.length;
}

const fileSize = node => node.type === "f" ? new TextEncoder().encode(node.data).length : node.type === "l" ? node.target.length : 4096;

// ---- Percorsi ----

const isAbsolute = path => path.startsWith("/");
const splitPath = path => path.split("/").filter(part => part !== "");

// Percorso assoluto «logico»: . e .. risolti sul testo, come fa cd
function lexicalPath(sh, path) {
    const parts = [];
    for (const part of splitPath(isAbsolute(path) ? path : `${sh.cwd}/${path}`)) {
        if (part === ".") continue;
        if (part === "..") parts.pop();
        else parts.push(part);
    }
    return `/${parts.join("/")}`;
}

const baseName = path => {
    const parts = splitPath(path);
    return parts.length ? parts[parts.length - 1] : "/";
};

// Permessi dell'utente corrente su un nodo: bit 4 lettura, 2 scrittura, 1 esecuzione
function canAccess(sh, node, bit) {
    if (sh.user === "root") return bit !== 1 || node.type === "d" || (node.mode & 0o111) !== 0;
    const user = SIM_USERS[sh.user];
    const shift = node.owner === sh.user ? 6 : user.groups.includes(node.group) ? 3 : 0;
    return ((node.mode >> shift) & bit) !== 0;
}

// Trova un percorso. follow: segue il link simbolico anche nell'ultimo pezzo.
// Restituisce { node, parent, name, path } (node assente se l'ultimo pezzo non esiste) oppure lancia SimError.
function simLookup(sh, path, follow = true, depth = 0) {
    if (path === "") throw new SimError("ENOENT");
    const parts = splitPath(isAbsolute(path) ? path : `${sh.cwd}/${path}`);
    const stack = [{ name: "", node: sh.root }];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const current = stack[stack.length - 1].node;
        if (part === ".") continue;
        if (part === "..") {
            if (stack.length > 1) stack.pop();
            continue;
        }
        if (current.type !== "d") throw new SimError("ENOTDIR");
        if (!canAccess(sh, current, 1)) throw new SimError("EACCES");
        const child = current.children[part];
        const last = i === parts.length - 1;
        if (!child) {
            if (last) return { node: null, parent: current, name: part, path: pathOf(stack, part) };
            throw new SimError("ENOENT");
        }
        if (child.type === "l" && (!last || follow)) {
            if (depth > 40) throw new SimError("ELOOP");
            const base = pathOf(stack);
            const target = isAbsolute(child.target) ? child.target : `${base === "/" ? "" : base}/${child.target}`;
            const rest = parts.slice(i + 1).join("/");
            return simLookup(sh, rest ? `${target}/${rest}` : target, follow, depth + 1);
        }
        stack.push({ name: part, node: child });
    }
    const top = stack[stack.length - 1];
    const parent = stack.length > 1 ? stack[stack.length - 2].node : sh.root;
    return { node: top.node, parent, name: top.name, path: pathOf(stack) };
}

function pathOf(stack, extra) {
    const names = stack.slice(1).map(item => item.name);
    if (extra !== undefined) names.push(extra);
    return `/${names.join("/")}`;
}

// Il nodo di un percorso che deve esistere
function simGet(sh, path, follow = true) {
    const found = simLookup(sh, path, follow);
    if (!found.node) throw new SimError("ENOENT");
    return found;
}

// ---- Creazione del file system di partenza ----

// Aggiunge un nodo a un percorso assoluto, creando le directory intermedie (per gli esercizi)
function simPut(sh, path, node) {
    const parts = splitPath(path);
    let dir = sh.root;
    for (const part of parts.slice(0, -1)) {
        // Le directory intermedie prendono il proprietario della directory che le contiene
        if (!dir.children[part]) dir.children[part] = simNode("d", null, { mode: 0o755, mtime: SIM_START, owner: dir.owner, group: dir.group });
        dir = dir.children[part];
    }
    dir.children[parts[parts.length - 1]] = node;
    return node;
}

// opzioni comuni nelle descrizioni: { owner, mode (testo ottale), mtime (minuti prima dell'inizio) }
function simFromSpec(type, spec) {
    const options = typeof spec === "string" ? { content: spec } : spec || {};
    const owner = options.owner || "anna";
    const node = simNode(type, null, {
        owner,
        group: options.group || SIM_USERS[owner].groups[0],
        mtime: SIM_START - (options.age === undefined ? 60 * 24 * 3 : options.age) * 60000
    });
    if (options.mode) node.mode = parseInt(options.mode, 8);
    else node.mode = type === "d" ? 0o755 : 0o644;
    if (type === "f") node.data = options.content || "";
    if (type === "l") {
        node.target = options.target;
        node.mode = 0o777;
    }
    return node;
}

// Testo di /etc/passwd e /etc/group dagli utenti del simulatore
function passwdText() {
    return Object.entries(SIM_USERS).map(([name, user]) =>
        `${name}:x:${user.uid}:${user.gid}:${user.name || name}:${user.home}:${user.shell}`).join("\n") + "\n";
}
function groupText() {
    return Object.entries(SIM_GROUPS).map(([name, gid]) => {
        const members = Object.entries(SIM_USERS).filter(([user, info]) => info.groups.includes(name) && info.groups[0] !== name).map(([user]) => user);
        return `${name}:x:${gid}:${members.join(",")}`;
    }).join("\n") + "\n";
}

// Il file system di base, uguale in tutti gli esercizi: la home di anna con qualche file, i file
// di sistema dell'esame (/etc, /var/log, /tmp...) e i programmi in /usr/bin
function simBaseTree() {
    return {
        dirs: {
            "/root": { owner: "root", mode: "700" },
            "/bin": { owner: "root" }, "/usr": { owner: "root" }, "/usr/bin": { owner: "root" }, "/usr/local/bin": { owner: "root" },
            "/usr/share/doc": { owner: "root" }, "/usr/share/doc/bash": { owner: "root" }, "/usr/share/doc/tar": { owner: "root" }, "/usr/share/doc/grep": { owner: "root" },
            "/etc": { owner: "root" }, "/etc/skel": { owner: "root" }, "/var": { owner: "root" }, "/var/log": { owner: "root" },
            "/var/www": { owner: "root" },
            "/tmp": { owner: "root", mode: "1777" }, "/var/tmp": { owner: "root", mode: "1777" },
            "/home": { owner: "root" },
            "/home/anna": { mode: "750" },
            "/home/anna/documenti": {}, "/home/anna/foto": {}, "/home/anna/progetti": {},
            "/home/luca": { owner: "luca", mode: "750" },
            "/proc": { owner: "root", mode: "555" }, "/dev": { owner: "root" }, "/boot": { owner: "root" }, "/sys": { owner: "root", mode: "555" }
        },
        files: {
            "/etc/passwd": { owner: "root", content: passwdText() },
            "/etc/group": { owner: "root", content: groupText() },
            "/etc/shadow": { owner: "root", group: "root", mode: "640", content: "root:*:20000:0:99999:7:::\nanna:$6$sale$hash:20000:0:99999:7:::\n" },
            "/etc/hostname": { owner: "root", content: "lpi\n" },
            "/etc/hosts": { owner: "root", content: "127.0.0.1\tlocalhost\n127.0.1.1\tlpi\n192.168.1.10\tnas\n" },
            "/etc/resolv.conf": { owner: "root", content: "nameserver 192.168.1.1\nsearch casa.lan\n" },
            "/etc/skel/.bashrc": { owner: "root", content: "# ~/.bashrc: letto da Bash a ogni nuova shell\nalias ll='ls -l'\n" },
            "/home/anna/.bashrc": { content: "# ~/.bashrc: letto da Bash a ogni nuova shell\nalias ll='ls -l'\n", age: 60 * 24 * 30 },
            "/home/anna/note.txt": { content: "Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n", age: 60 * 5 },
            "/home/anna/documenti/lettera.txt": { content: "Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n", age: 60 * 24 },
            "/home/anna/documenti/spesa.txt": { content: "pane\nlatte\nmele\npane\nuova\nlatte\npane\n", age: 60 * 2 },
            "/home/anna/foto/mare.jpg": { content: "JPEG mare\n", age: 60 * 24 * 10 },
            "/home/anna/foto/montagna.jpg": { content: "JPEG montagna\n", age: 60 * 24 * 9 },
            "/home/luca/segreto.txt": { owner: "luca", mode: "600", content: "solo per luca\n" },
            "/var/log/syslog": { owner: "root", group: "adm", mode: "640", content: "" },
            "/var/log/app.log": {
                owner: "root", mode: "644",
                content: "2026-11-12 08:00:01 INFO avvio del servizio\n2026-11-12 08:05:12 WARN disco quasi pieno\n2026-11-12 08:10:30 ERROR connessione al database fallita\n2026-11-12 08:10:31 INFO nuovo tentativo\n2026-11-12 08:10:35 ERROR connessione al database fallita\n2026-11-12 08:11:00 INFO connessione riuscita\n2026-11-12 09:00:00 error utente sconosciuto: mario\n"
            },
            "/usr/share/doc/bash/README": { owner: "root", content: "Bash: la shell del progetto GNU.\n" },
            // La documentazione che i pacchetti installano in /usr/share/doc (testi scritti per l'app)
            "/usr/share/doc/tar/README": { owner: "root", content: "tar: il programma per gli archivi\n\nQuesto pacchetto installa il comando tar e la sua documentazione.\nLa pagina di manuale si legge con: man tar\nLe novita' di ogni versione sono nel file NEWS.\n" },
            "/usr/share/doc/tar/NEWS": { owner: "root", content: "Versione 1.35: correzioni e piccoli miglioramenti.\nVersione 1.34: gli archivi .tar.xz si riconoscono da soli.\n" },
            "/usr/share/doc/tar/copyright": { owner: "root", content: "tar e' software libero, distribuito con la licenza GNU GPL versione 3 o successive.\n" },
            "/usr/share/doc/grep/README": { owner: "root", content: "grep: cerca le righe che corrispondono a un modello\n\nLa pagina di manuale si legge con: man grep\n" },
            "/usr/share/doc/grep/copyright": { owner: "root", content: "grep e' software libero, distribuito con la licenza GNU GPL versione 3 o successive.\n" }
        },
        links: {}
    };
}

// Una shell nuova. setup aggiunge o sostituisce file, directory e link: { dirs, files, links, cwd }
function createShell(setup = {}) {
    const sh = {
        root: simNode("d", null, { mode: 0o755 }),
        cwd: "/home/anna", user: "anna", clock: SIM_START, status: 0, history: [], columns: 80,
        vars: { HOME: "/home/anna", USER: "anna", LOGNAME: "anna", SHELL: "/bin/bash", PATH: "/usr/local/bin:/usr/bin:/bin", PWD: "/home/anna", LANG: "C" },
        exported: new Set(["HOME", "USER", "LOGNAME", "SHELL", "PATH", "PWD", "LANG"]),
        lastOutput: "", lastErrors: "", lastCommand: "", tty: true,
        // Gli argomenti dello script in esecuzione ($1, $2..., $#, $@), il suo nome ($0), quanti
        // script sono aperti uno dentro l'altro e lo stdin che lo script ha ricevuto
        args: [], arg0: "bash", depth: 0, stdin: null, loops: 0
    };
    const base = simBaseTree();
    const add = (type, list) => Object.entries(list || {}).forEach(([path, spec]) => {
        const node = simFromSpec(type, type === "l" ? { target: spec.target || spec, owner: spec.owner } : spec);
        // Una directory che esiste già (creata come intermedia) prende le proprietà indicate
        const existing = type === "d" && simFindRaw(sh, path);
        if (existing && existing.type === "d") Object.assign(existing, { mode: node.mode, owner: node.owner, group: node.group, mtime: node.mtime });
        else simPut(sh, path, node);
    });
    add("d", base.dirs);
    add("d", setup.dirs);
    add("f", base.files);
    add("f", setup.files);
    add("l", base.links);
    add("l", setup.links);
    // I programmi: un file eseguibile in /usr/bin per ogni comando esterno, come su un sistema vero
    Object.keys(SIM_COMMANDS).filter(name => !SIM_BUILTINS.has(name)).forEach(name => {
        simPut(sh, `/usr/bin/${name}`, simNode("f", null, { mode: 0o755, data: "#!ELF (programma)\n" }));
    });
    (setup.remove || []).forEach(path => {
        const parts = splitPath(path);
        const parent = simFindRaw(sh, `/${parts.slice(0, -1).join("/")}`);
        if (parent) delete parent.children[parts[parts.length - 1]];
    });
    if (setup.cwd) {
        sh.cwd = setup.cwd;
        sh.vars.PWD = setup.cwd;
    }
    // Il database di locate: i percorsi che esistono adesso (lo aggiorna solo updatedb)
    sh.locateDb = simAllPaths(sh);
    return sh;
}

// Tutti i percorsi del file system, in ordine (per il database di locate)
function simAllPaths(sh) {
    const paths = [];
    const walk = (node, path) => sortedNames(node).forEach(name => {
        const child = node.children[name];
        const childPath = `${path}/${name}`;
        if (childPath === "/proc" || childPath === "/sys" || childPath === "/dev" || childPath === "/tmp") return;
        paths.push(childPath);
        if (child.type === "d") walk(child, childPath);
    });
    walk(sh.root, "");
    return paths;
}

// Nodo a un percorso assoluto senza controlli (per costruire il file system)
function simFindRaw(sh, path) {
    let node = sh.root;
    for (const part of splitPath(path)) {
        if (!node || node.type !== "d") return null;
        node = node.children[part];
    }
    return node || null;
}

// ---- Lettura della riga di comando ----
// Le parole sono liste di pezzi: { t: "lit", text, q } (q: virgolettato), { t: "var", name, q },
// { t: "tilde", user }. Variabili, ~ e caratteri jolly si espandono al momento di eseguire.

class SimSyntaxError extends Error {}

function simTokenize(text) {
    const tokens = [];
    let word = null;
    const pushWord = () => {
        if (word) tokens.push({ type: "word", parts: word });
        word = null;
    };
    const addLit = (textPart, q) => {
        word = word || [];
        const last = word[word.length - 1];
        if (last && last.t === "lit" && last.q === q) last.text += textPart;
        else word.push({ t: "lit", text: textPart, q });
    };
    const readVar = (i, q) => {
        // $NOME, ${NOME}, $?, $$, $#, $@, $*, $0-$9 ; restituisce l'indice dell'ultimo carattere letto
        word = word || [];
        if (text[i + 1] === "{") {
            const end = text.indexOf("}", i + 2);
            if (end === -1) throw new SimSyntaxError("bash: sostituzione errata: manca la } di chiusura");
            word.push({ t: "var", name: text.slice(i + 2, end), q });
            return end;
        }
        if (/^[?$#@*0-9]$/.test(text[i + 1] || "")) {
            word.push({ t: "var", name: text[i + 1], q });
            return i + 1;
        }
        const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(text.slice(i + 1));
        if (!match) {
            addLit("$", q);
            return i;
        }
        word.push({ t: "var", name: match[0], q });
        return i + match[0].length;
    };
    // In un'assegnazione ~ vale anche dopo = e dopo ogni : (PATH=$PATH:~/bin)
    const tildeInAssignment = () => {
        const first = word && word[0];
        if (!first || first.t !== "lit" || first.q || !/^[A-Za-z_][A-Za-z0-9_]*=/.test(first.text)) return false;
        const last = word[word.length - 1];
        return last.t === "lit" && !last.q && /[=:]$/.test(last.text);
    };
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const atWordStart = word === null;
        if (c === " " || c === "\t") {
            pushWord();
        } else if (c === "\n") {
            // In uno script l'a capo separa i comandi, come ;
            pushWord();
            tokens.push({ type: "op", op: "\n" });
        } else if (c === "#" && atWordStart) {
            // Commento: fino alla fine della riga
            const end = text.indexOf("\n", i);
            if (end === -1) break;
            i = end - 1;
        } else if (c === "'") {
            const end = text.indexOf("'", i + 1);
            if (end === -1) throw new SimSyntaxError("bash: manca l'apice singolo di chiusura '");
            addLit(text.slice(i + 1, end), true);
            i = end;
        } else if (c === '"') {
            let j = i + 1;
            word = word || [];
            let opened = false;
            while (j < text.length && text[j] !== '"') {
                if (text[j] === "\\" && ['"', "\\", "$", "`"].includes(text[j + 1])) {
                    addLit(text[j + 1], true);
                    j += 2;
                } else if (text[j] === "$") {
                    j = readVar(j, true) + 1;
                } else {
                    addLit(text[j], true);
                    j++;
                }
                opened = true;
            }
            if (j >= text.length) throw new SimSyntaxError('bash: mancano le virgolette di chiusura "');
            if (!opened) addLit("", true);
            i = j;
        } else if (c === "\\") {
            if (i + 1 < text.length) addLit(text[++i], true);
        } else if (c === "$") {
            i = readVar(i, false);
        } else if (c === "`") {
            throw new SimSyntaxError("bash: la sostituzione di comandi con `...` non è disponibile nel simulatore");
        } else if (c === "~" && (atWordStart || tildeInAssignment())) {
            const match = /^~([a-z_][a-z0-9_-]*)?(?=$|[\/\s;|&<>:])/.exec(text.slice(i));
            if (match) {
                word = word || [];
                word.push({ t: "tilde", user: match[1] || "" });
                i += match[0].length - 1;
            } else {
                addLit("~", false);
            }
        } else if (c === "|" || c === ";" || c === "&") {
            pushWord();
            const two = text.slice(i, i + 2);
            if (two === "||" || two === "&&") {
                tokens.push({ type: "op", op: two });
                i++;
            } else if (two === "&>") {
                tokens.push({ type: "redir", fd: "&", op: ">" });
                i++;
            } else if (c === "&") {
                throw new SimSyntaxError("bash: nel simulatore non si possono avviare comandi in background con &");
            } else {
                tokens.push({ type: "op", op: c });
            }
        } else if (c === ">" || c === "<") {
            // Un numero attaccato davanti (2>, 1>) indica il canale
            let fd = c === "<" ? 0 : 1;
            if (word && word.length === 1 && word[0].t === "lit" && !word[0].q && /^[012]$/.test(word[0].text)) {
                fd = Number(word[0].text);
                word = null;
            }
            pushWord();
            if (c === ">" && text[i + 1] === ">") {
                tokens.push({ type: "redir", fd, op: ">>" });
                i++;
            } else if (c === ">" && text[i + 1] === "&") {
                const match = /^&([012])/.exec(text.slice(i + 1));
                if (!match) throw new SimSyntaxError("bash: reindirizzamento non valido: si usa per esempio 2>&1");
                tokens.push({ type: "redir", fd, op: ">&", to: Number(match[1]) });
                i += 2;
            } else if (c === "<" && text[i + 1] === "<") {
                throw new SimSyntaxError("bash: il here document (<<) non è disponibile nel simulatore");
            } else {
                tokens.push({ type: "redir", fd, op: c });
            }
        } else if (c === "(" || c === ")") {
            throw new SimSyntaxError(`bash: errore di sintassi vicino al token inatteso '${c}' (le parentesi non sono disponibili nel simulatore)`);
        } else {
            addLit(c, false);
        }
    }
    pushWord();
    return tokens;
}

// Struttura: elenco di { pipeline: [comando], op, negate } dove op (;, &&, ||) collega alla
// successiva e negate è il ! davanti alla pipeline.
// Comando semplice: { words, redirects: [{ fd, op, to, target }] }
// Ciclo: { kind: "for", name, items (null: "$@"), body: elenco, redirects }
// Condizione: { kind: "if", branches: [{ condition: elenco, body: elenco }], otherwise: elenco o null, redirects }

// Manca la fine di un for o di un if: in uno script si leggono altre righe
class SimIncomplete extends SimSyntaxError {}

const SIM_KEYWORDS = new Set(["for", "in", "do", "done", "if", "then", "elif", "else", "fi"]);
const SIM_NO_KEYWORDS = { while: "i cicli while", until: "i cicli until", case: "il costrutto case", function: "le funzioni", select: "il costrutto select" };

function simParse(text) {
    const tokens = simTokenize(text);
    let pos = 0;
    const peek = () => tokens[pos];
    const show = token => !token ? "newline" : token.type === "op" ? (token.op === "\n" ? "newline" : token.op) : token.type === "redir" ? token.op : token.parts.map(part => part.text ?? `$${part.name}`).join("");
    const unexpected = token => new SimSyntaxError(`bash: errore di sintassi vicino al token inatteso '${show(token)}'`);
    // Una parola chiave vale solo scritta così com'è, senza virgolette
    const keyword = token => token && token.type === "word" && token.parts.length === 1 && token.parts[0].t === "lit" && !token.parts[0].q && SIM_KEYWORDS.has(token.parts[0].text) ? token.parts[0].text : null;
    const plain = token => token && token.type === "word" && token.parts.length === 1 && token.parts[0].t === "lit" && !token.parts[0].q ? token.parts[0].text : null;
    const isOp = (token, op) => token && token.type === "op" && token.op === op;
    const skipNewlines = () => { while (isOp(peek(), "\n")) pos++; };
    const expect = (word, missing) => {
        skipNewlines();
        if (!peek()) throw new SimIncomplete(`bash: errore di sintassi: fine inattesa, manca \`${missing}'`);
        if (keyword(peek()) !== word) throw unexpected(peek());
        pos++;
    };

    function redirect(command) {
        const token = tokens[pos++];
        if (token.op === ">&") {
            command.redirects.push(token);
            return;
        }
        const next = peek();
        if (!next || next.type !== "word") throw new SimSyntaxError("bash: errore di sintassi: dopo il reindirizzamento serve il nome di un file");
        command.redirects.push({ ...token, target: next.parts });
        pos++;
    }

    // Un elenco di comandi, fino a una delle parole chiave in stops (o alla fine)
    function list(stops) {
        const items = [];
        skipNewlines();
        while (peek() && !stops.includes(keyword(peek()))) {
            const item = pipeline();
            const token = peek();
            if (isOp(token, "&&") || isOp(token, "||")) {
                pos++;
                skipNewlines();
                if (!peek()) throw new SimSyntaxError(`bash: errore di sintassi: la riga finisce con ${token.op}`);
                items.push({ ...item, op: token.op });
            } else if (isOp(token, ";") || isOp(token, "\n")) {
                pos++;
                skipNewlines();
                items.push({ ...item, op: ";" });
            } else {
                items.push({ ...item, op: null });
                break;
            }
        }
        return items;
    }

    function pipeline() {
        let negate = false;
        if (plain(peek()) === "!") {
            negate = true;
            pos++;
        }
        const commands = [command()];
        while (isOp(peek(), "|")) {
            pos++;
            skipNewlines();
            if (!peek()) throw new SimSyntaxError("bash: errore di sintassi: la riga finisce con |");
            commands.push(command());
        }
        return { pipeline: commands, negate };
    }

    function command() {
        const word = keyword(peek());
        let result;
        if (word === "for") result = forLoop();
        else if (word === "if") result = condition();
        else if (word && word !== "in") throw unexpected(peek());
        else if (SIM_NO_KEYWORDS[plain(peek())]) throw new SimSyntaxError(`bash: ${plain(peek())}: nel simulatore ${SIM_NO_KEYWORDS[plain(peek())]} non sono disponibili (ci sono for e if)`);
        else {
            result = { words: [], redirects: [] };
            while (peek() && peek().type !== "op") {
                if (peek().type === "word") result.words.push(tokens[pos++].parts);
                else redirect(result);
            }
            if (!result.words.length && !result.redirects.length) throw unexpected(peek());
            return result;
        }
        // Dopo done e fi possono esserci dei reindirizzamenti: done > elenco.txt
        while (peek() && peek().type === "redir") redirect(result);
        if (peek() && peek().type === "word") throw unexpected(peek());
        return result;
    }

    function body(stops, after) {
        const items = list(stops);
        if (!items.length) {
            if (!peek()) throw new SimIncomplete(`bash: errore di sintassi: fine inattesa, manca \`${after}'`);
            throw unexpected(peek());
        }
        return items;
    }

    function forLoop() {
        pos++;
        const name = plain(peek());
        // Un nome non valido (for 1a in ...) si scopre quando il ciclo viene eseguito, come in Bash
        if (!name) {
            if (!peek()) throw new SimSyntaxError("bash: errore di sintassi: dopo for serve il nome di una variabile");
            throw unexpected(peek());
        }
        pos++;
        let items = null;
        if (keyword(peek()) === "in") {
            pos++;
            items = [];
            while (peek() && peek().type === "word") items.push(tokens[pos++].parts);
        }
        if (peek() && !isOp(peek(), ";") && !isOp(peek(), "\n")) throw unexpected(peek());
        if (peek()) pos++;
        expect("do", "do");
        const loop = body(["done"], "done");
        expect("done", "done");
        return { kind: "for", name, items, body: loop, redirects: [] };
    }

    function condition() {
        pos++;
        const branches = [];
        let otherwise = null;
        for (;;) {
            const test = body(["then"], "then");
            expect("then", "then");
            branches.push({ condition: test, body: body(["elif", "else", "fi"], "fi") });
            if (!peek()) throw new SimIncomplete("bash: errore di sintassi: fine inattesa, manca `fi'");
            const word = keyword(peek());
            if (!["elif", "else", "fi"].includes(word)) throw unexpected(peek());
            pos++;
            if (word === "elif") continue;
            if (word === "else") {
                otherwise = body(["fi"], "fi");
                expect("fi", "fi");
            }
            break;
        }
        return { kind: "if", branches, otherwise, redirects: [] };
    }

    const result = list([]);
    if (peek()) throw unexpected(peek());
    return result;
}

// ---- Espansione: variabili, ~, divisione in parole, caratteri jolly ----

function simVar(sh, name) {
    if (name === "?") return String(sh.status);
    if (name === "$") return "4242";
    if (name === "#") return String(sh.args.length);
    if (name === "@" || name === "*") return sh.args.join(" ");
    if (name === "0") return sh.arg0;
    if (/^[0-9]+$/.test(name)) return sh.args[Number(name) - 1] ?? "";
    return sh.vars[name] ?? "";
}

// Una parola diventa zero o più argomenti
function simExpandWord(sh, parts, { glob = true } = {}) {
    // fields: elenco di campi; ogni campo è un elenco di pezzi { text, active } (active: i
    // caratteri jolly valgono, perché non erano tra virgolette)
    const fields = [[]];
    let quotedSomething = false;
    for (const part of parts) {
        if (part.t === "lit") {
            if (part.q) quotedSomething = true;
            fields[fields.length - 1].push({ text: part.text, active: !part.q });
        } else if (part.t === "tilde") {
            const home = part.user ? (SIM_USERS[part.user] || {}).home : sh.vars.HOME;
            fields[fields.length - 1].push({ text: home || `~${part.user}`, active: false });
        } else if (part.name === "@" && part.q) {
            // "$@": ogni argomento resta una parola a sé, anche con gli spazi; senza argomenti, niente
            sh.args.forEach((arg, index) => {
                if (index > 0) fields.push([]);
                fields[fields.length - 1].push({ text: arg, active: false });
                quotedSomething = true;
            });
        } else {
            const value = simVar(sh, part.name);
            if (part.q) {
                quotedSomething = true;
                fields[fields.length - 1].push({ text: value, active: false });
            } else {
                // Senza virgolette il valore si divide negli spazi
                const pieces = value.split(/[ \t\n]+/);
                pieces.forEach((piece, index) => {
                    if (index > 0) fields.push([]);
                    if (piece !== "") fields[fields.length - 1].push({ text: piece, active: true });
                });
            }
        }
    }
    const result = [];
    for (const field of fields) {
        const plain = field.map(piece => piece.text).join("");
        if (plain === "" && !quotedSomething) continue;
        const hasGlob = glob && field.some(piece => piece.active && /[*?[]/.test(piece.text));
        if (hasGlob) {
            const matches = simGlob(sh, field);
            if (matches.length) {
                result.push(...matches);
                continue;
            }
        }
        result.push(plain);
    }
    return result;
}

// Caratteri jolly: *, ?, [...] su ogni pezzo del percorso. I file nascosti solo se il pezzo
// inizia con un punto scritto. Risultati in ordine C; se niente corrisponde, la parola resta com'è.
function simGlob(sh, field) {
    // Pattern con i caratteri non attivi protetti da \
    let pattern = "";
    for (const piece of field) pattern += piece.active ? piece.text : piece.text.replace(/[*?[\]\\]/g, "\\$&");
    const absolute = pattern.startsWith("/");
    const parts = pattern.split("/").filter(part => part !== "");
    let current = [{ path: absolute ? "/" : "", shown: absolute ? "/" : "" }];
    for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        const next = [];
        const magic = /(^|[^\\])[*?[]/.test(part);
        for (const item of current) {
            const dirPath = item.path || ".";
            let dir;
            try {
                dir = simGet(sh, dirPath).node;
            } catch (e) {
                continue;
            }
            if (!magic) {
                const literal = part.replace(/\\(.)/g, "$1");
                const shown = item.shown + (item.shown && !item.shown.endsWith("/") ? "/" : "") + literal;
                next.push({ path: item.path ? `${item.path.replace(/\/$/, "")}/${literal}` : literal, shown });
                continue;
            }
            if (dir.type !== "d" || !canAccess(sh, dir, 4)) continue;
            const regex = globToRegex(part);
            for (const name of sortedNames(dir)) {
                if (name.startsWith(".") && !part.startsWith(".") && !part.startsWith("\\.")) continue;
                if (!regex.test(name)) continue;
                const shown = item.shown + (item.shown && !item.shown.endsWith("/") ? "/" : "") + name;
                next.push({ path: item.path ? `${item.path.replace(/\/$/, "")}/${name}` : name, shown });
            }
        }
        current = next;
    }
    // I percorsi letterali alla fine devono esistere
    return current.filter(item => {
        try {
            simLookup(sh, item.path, false);
            return Boolean(simLookup(sh, item.path, false).node);
        } catch (e) {
            return false;
        }
    }).map(item => item.shown + (pattern.endsWith("/") ? "/" : ""));
}

function globToRegex(part) {
    let source = "";
    for (let i = 0; i < part.length; i++) {
        const c = part[i];
        if (c === "\\" && i + 1 < part.length) source += part[++i].replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
        else if (c === "*") source += ".*";
        else if (c === "?") source += ".";
        else if (c === "[") {
            const end = part.indexOf("]", i + 2);
            if (end === -1) {
                source += "\\[";
                continue;
            }
            let body = part.slice(i + 1, end);
            const negate = body.startsWith("!") || body.startsWith("^");
            if (negate) body = body.slice(1);
            source += `[${negate ? "^" : ""}${body.replace(/\\/g, "\\\\")}]`;
            i = end;
        } else source += c.replace(/[.+^${}()|\]\/]/g, "\\$&");
    }
    return new RegExp(`^${source}$`, "s");
}

// ---- Esecuzione ----

// Esegue una riga. Restituisce { lines: [{ text, err }], clear } e aggiorna sh.lastOutput
// (lo stdout arrivato sullo schermo, per gli esercizi)
function simRun(sh, text) {
    const display = [];
    sh.lastCommand = text;
    if (text.trim()) sh.history.push(text);
    sh.lastOutput = "";
    sh.lastErrors = "";
    sh.lineOutput = "";
    let list;
    try {
        list = simParse(text);
    } catch (error) {
        if (!(error instanceof SimSyntaxError)) throw error;
        // Nel terminale non si continua sulla riga dopo: for e if si scrivono su una riga sola
        if (error instanceof SimIncomplete) error.message += " (nel terminale scrivi tutto su una riga, separando con ; per esempio: for f in a b; do echo $f; done)";
        display.push({ text: error.message, err: true });
        sh.lastErrors = error.message;
        sh.status = 2;
        return { lines: display, clear: false };
    }
    const clear = simRunList(sh, list, display);
    sh.clock += 60000;
    const lines = [];
    for (const chunk of display) {
        textLines(chunk.text).forEach(line => lines.push({ text: line, err: chunk.err }));
    }
    return { lines, clear };
}

// Esegue i comandi di una riga già analizzata (collegati da ;, && e ||), scrivendo in display.
// Restituisce true se lo schermo va pulito (clear)
function simRunList(sh, list, display) {
    let clear = false;
    let previous = null;
    for (const item of list) {
        if (previous && previous.op === "&&" && sh.status !== 0) {
            previous = item;
            continue;
        }
        if (previous && previous.op === "||" && sh.status === 0) {
            previous = item;
            continue;
        }
        const result = simRunPipeline(sh, item.pipeline, display);
        if (item.negate) sh.status = sh.status === 0 ? 1 : 0;
        if (result.clear) {
            clear = true;
            display.length = 0;
        }
        previous = item;
    }
    return clear;
}

// Testo → righe da mostrare (senza l'a capo finale)
function textLines(text) {
    if (text === "") return [];
    return text.replace(/\n$/, "").split("\n");
}

function simRunPipeline(sh, pipeline, display) {
    // Dentro uno script il primo comando legge lo stdin dello script (./conta.sh < file)
    let input = sh.stdin;
    let inputInfo = input === null ? null : { regular: false };
    let clear = false;
    sh.lastOutput = "";
    for (let index = 0; index < pipeline.length; index++) {
        const command = pipeline[index];
        const last = index === pipeline.length - 1;
        // Dove vanno stdout (1) e stderr (2): "terminal", "pipe", oppure un file
        // (err: sul terminale conta come errore, anche per lo stdout mandato lì con >&2)
        const route = { 1: last ? { kind: "terminal", err: false } : { kind: "pipe" }, 2: { kind: "terminal", err: true } };
        let stdin = input;
        let stdinInfo = inputInfo;
        let failed = null;
        // I reindirizzamenti si applicano da sinistra a destra, prima di eseguire il comando
        for (const redirect of command.redirects) {
            try {
                if (redirect.op === ">&") {
                    route[redirect.fd] = { ...route[redirect.to] };
                    continue;
                }
                const names = simExpandWord(sh, redirect.target);
                if (names.length !== 1) throw new SimRedirectError(`bash: ${redirect.target.map(p => p.text || "").join("")}: reindirizzamento ambiguo`);
                const name = names[0];
                if (redirect.op === "<") {
                    const found = simGet(sh, name);
                    if (found.node.type === "d") throw new SimRedirectError(`bash: ${name}: ${ERRORS.EISDIR}`);
                    if (!canAccess(sh, found.node, 4)) throw new SimRedirectError(`bash: ${name}: ${ERRORS.EACCES}`);
                    stdin = found.node.data;
                    stdinInfo = { regular: true, size: fileSize(found.node) };
                    continue;
                }
                const target = name === "/dev/null" ? { kind: "null" } : { kind: "file", path: name, append: redirect.op === ">>" };
                if (target.kind === "file") simOpenForWrite(sh, name, target.append);
                if (redirect.fd === "&") {
                    route[1] = target;
                    route[2] = { ...target };
                } else {
                    route[redirect.fd] = target;
                }
            } catch (error) {
                if (error instanceof SimError) failed = `bash: ${redirect.target ? simExpandWord(sh, redirect.target).join(" ") : ""}: ${error.message}`;
                else if (error instanceof SimRedirectError) failed = error.message;
                else throw error;
                break;
            }
        }
        let result;
        if (failed) {
            result = { out: "", err: `${failed}\n`, code: 1 };
        } else {
            const tty = sh.tty && route[1].kind === "terminal";
            if (command.kind) {
                result = simRunCompound(sh, command, stdin, tty);
            } else {
                const words = command.words.flatMap(parts => simExpandWord(sh, parts));
                result = simExecute(sh, words, stdin, { stdinInfo, tty });
            }
            if (result.clear) clear = true;
        }
        // Consegna stdout e stderr secondo la loro destinazione (prima stdout, poi stderr; uno
        // script li consegna nell'ordine in cui i suoi comandi li hanno scritti)
        let piped = "";
        const chunks = result.chunks || [{ text: result.out, err: false }, { text: result.err, err: true }];
        for (const chunk of chunks) {
            const fd = chunk.err ? 2 : 1;
            const text = chunk.text;
            if (!text) continue;
            const target = route[fd];
            if (target.kind === "terminal") {
                display.push({ text, err: target.err });
                if (!target.err) {
                    sh.lastOutput += text;
                    sh.lineOutput += text;
                } else {
                    sh.lastErrors += text;
                }
            } else if (target.kind === "pipe") {
                piped += text;
            } else if (target.kind === "file") {
                try {
                    simAppend(sh, target.path, text);
                } catch (error) {
                    display.push({ text: `bash: ${target.path}: ${error.message}\n`, err: true });
                    sh.lastErrors += `bash: ${target.path}: ${error.message}\n`;
                }
            }
        }
        input = piped;
        inputInfo = { regular: false };
        sh.status = result.code;
    }
    return { clear };
}

class SimRedirectError extends Error {}

// break e continue dentro un ciclo for
class SimLoopControl extends Error {
    constructor(kind) {
        super(kind);
        this.kind = kind;
    }
}

// Esegue un for o un if nella shell corrente. L'output dei comandi interni viene raccolto, così
// si può reindirizzare tutto insieme (done > file, fi | sort); il codice di uscita è quello
// dell'ultimo comando eseguito (0 se il ciclo non gira o nessun ramo dell'if è vero)
function simRunCompound(sh, command, stdin, tty) {
    const saved = { tty: sh.tty, stdin: sh.stdin, lastOutput: sh.lastOutput, lineOutput: sh.lineOutput, lastErrors: sh.lastErrors };
    sh.tty = tty;
    if (stdin !== null) sh.stdin = stdin;
    const display = [];
    try {
        if (command.kind === "for" && !/^[A-Za-z_][A-Za-z0-9_]*$/.test(command.name)) {
            display.push({ text: `bash: \`${command.name}': non è un identificatore valido\n`, err: true });
            sh.status = 1;
        } else if (command.kind === "for") {
            const values = command.items === null ? [...sh.args] : command.items.flatMap(parts => simExpandWord(sh, parts));
            sh.status = 0;
            sh.loops++;
            try {
                for (const value of values) {
                    sh.vars[command.name] = value;
                    try {
                        simRunList(sh, command.body, display);
                    } catch (error) {
                        if (!(error instanceof SimLoopControl)) throw error;
                        display.push(...(error.pending || []));
                        sh.status = 0;
                        if (error.kind === "break") break;
                    }
                }
            } finally {
                sh.loops--;
            }
        } else {
            let matched = false;
            for (const branch of command.branches) {
                simRunList(sh, branch.condition, display);
                if (sh.status === 0) {
                    simRunList(sh, branch.body, display);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                sh.status = 0;
                if (command.otherwise) simRunList(sh, command.otherwise, display);
            }
        }
    } catch (error) {
        // exit, break e continue attraversano il comando: quello che era già stato scritto non si perde
        if (error instanceof SimExit || error instanceof SimLoopControl) error.pending = [...display, ...(error.pending || [])];
        throw error;
    } finally {
        Object.assign(sh, saved);
    }
    return {
        chunks: display,
        out: display.filter(chunk => !chunk.err).map(chunk => chunk.text).join(""),
        err: display.filter(chunk => chunk.err).map(chunk => chunk.text).join(""),
        code: sh.status
    };
}

// Apre un file per scriverci (> lo svuota, >> no), creandolo se non c'è
function simOpenForWrite(sh, path, append) {
    const found = simLookup(sh, path);
    if (found.node) {
        if (found.node.type === "d") throw new SimError("EISDIR");
        if (!canAccess(sh, found.node, 2)) throw new SimError("EACCES");
        if (!append) {
            found.node.data = "";
            found.node.mtime = sh.clock;
        }
        return found.node;
    }
    if (!canAccess(sh, found.parent, 2)) throw new SimError("EACCES");
    const node = simNode("f", sh);
    found.parent.children[found.name] = node;
    found.parent.mtime = sh.clock;
    return node;
}

function simAppend(sh, path, text) {
    const found = simGet(sh, path);
    found.node.data += text;
    found.node.mtime = sh.clock;
}

// Esegue un comando già espanso: assegnazioni, sudo, comandi interni ed esterni
function simExecute(sh, words, stdin, ctx) {
    // Assegnazioni davanti al comando: da sole impostano variabili della shell
    let i = 0;
    const assignments = [];
    while (i < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i])) assignments.push(words[i++]);
    const rest = words.slice(i);
    // Davanti a un comando valgono solo per lui: X=1 ./script.sh
    if (rest.length && assignments.length) ctx = { ...ctx, env: { ...(ctx.env || {}), ...Object.fromEntries(assignments.map(word => [word.slice(0, word.indexOf("=")), word.slice(word.indexOf("=") + 1)])) } };
    if (!rest.length) {
        assignments.forEach(word => {
            const at = word.indexOf("=");
            sh.vars[word.slice(0, at)] = word.slice(at + 1);
        });
        return { out: "", err: "", code: 0 };
    }
    const [name, ...args] = rest;
    if (name === "sudo") {
        if (!args.length) return { out: "", err: "sudo: scrivi il comando da eseguire come root, per esempio sudo chown luca file\n", code: 1 };
        if (SIM_BUILTINS.has(args[0])) return { out: "", err: `sudo: ${args[0]}: comando non trovato (è un comando interno della shell)\n`, code: 1 };
        if (["-i", "-s", "su"].includes(args[0]) || (args[0] === "bash" && args.length === 1)) return { out: "", err: "sudo: nel simulatore usa sudo davanti a un comando alla volta, per esempio sudo chown luca file\n", code: 1 };
        const user = sh.user;
        sh.user = "root";
        try {
            return simExecute(sh, args, stdin, ctx);
        } finally {
            sh.user = user;
        }
    }
    const command = SIM_COMMANDS[name];
    if (!command) {
        if (SIM_UNAVAILABLE[name]) return { out: "", err: `${name}: ${SIM_UNAVAILABLE[name]}\n`, code: 127 };
        if (name.includes("/")) return simRunPath(sh, name, args, stdin, ctx);
        // Come Bash: il nome si cerca nelle directory di PATH (la directory corrente non c'è)
        const inPath = simSearchPath(sh, name);
        if (inPath) return simRunPath(sh, inPath, args, stdin, ctx);
        return { out: "", err: `bash: ${name}: comando non trovato\n`, code: 127 };
    }
    if (args.includes("--help")) {
        // L'aiuto breve del comando (shell-help.js), per quelli che hanno una pagina di manuale
        const usage = simHelpText(name);
        if (usage) return { out: usage, err: "", code: 0 };
        return { out: `${name}: nel simulatore --help non è disponibile. Le opzioni si ripassano nelle lezioni: ${command.help || "vedi l'elenco con il comando help"}\n`, err: "", code: 0 };
    }
    try {
        const result = command.run(sh, args, stdin, ctx) || {};
        return { out: result.out || "", err: result.err || "", code: result.code || 0, clear: result.clear, chunks: result.chunks };
    } catch (error) {
        if (error instanceof SimUsage) return { out: "", err: `${name}: ${error.message}\n`, code: error.code };
        throw error;
    }
}

// Il primo file eseguibile con questo nome nelle directory di PATH (i comandi del simulatore
// sono già stati riconosciuti prima)
function simSearchPath(sh, name) {
    for (const dir of (sh.vars.PATH || "").split(":")) {
        if (!dir) continue;
        const path = `${dir.replace(/\/+$/, "")}/${name}`;
        try {
            const found = simLookup(sh, path);
            if (found.node && found.node.type === "f" && canAccess(sh, found.node, 1)) return path;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
        }
    }
    return null;
}

// ./script.sh o /percorso/programma: serve il permesso di esecuzione. Uno script (un file di
// testo, con o senza #!/bin/bash in testa) viene eseguito; i programmi in /usr/bin sono i comandi
// del simulatore
function simRunPath(sh, path, args = [], stdin = null, ctx = {}) {
    try {
        const found = simGet(sh, path);
        if (found.node.type === "d") return { out: "", err: `bash: ${path}: ${ERRORS.EISDIR}\n`, code: 126 };
        if (!canAccess(sh, found.node, 1)) return { out: "", err: `bash: ${path}: ${ERRORS.EACCES}\n`, code: 126 };
        const data = found.node.data;
        if (data.startsWith("#!ELF")) {
            const command = baseName(path);
            if (SIM_COMMANDS[command] && !SIM_BUILTINS.has(command)) return simExecute(sh, [command, ...args], stdin, ctx);
        }
        if (data.startsWith("#!ELF") || isBinary(data)) return { out: "", err: `bash: ${path}: impossibile eseguire il file binario: il simulatore esegue solo script\n`, code: 126 };
        // Per leggere lo script serve anche il permesso di lettura
        if (!canAccess(sh, found.node, 4)) return { out: "", err: `bash: ${path}: ${ERRORS.EACCES}\n`, code: 126 };
        const shebang = /^#!\s*(\S+)(?:[ \t]+(\S+))?/.exec(data);
        if (shebang) {
            const interpreter = baseName(shebang[1]) === "env" ? shebang[2] || "" : baseName(shebang[1]);
            if (!["bash", "sh"].includes(interpreter)) return { out: "", err: `bash: ${path}: ${shebang[1]}: interprete non disponibile nel simulatore (qui gli script sono di Bash: #!/bin/bash)\n`, code: 126 };
        }
        return simRunScript(sh, data, path, args, stdin, ctx);
    } catch (error) {
        if (error instanceof SimError) return { out: "", err: `bash: ${path}: ${error.message}\n`, code: 127 };
        throw error;
    }
}

// exit dentro uno script: lo ferma con questo codice di uscita
class SimExit extends Error {
    constructor(code, complaint = "") {
        super("exit");
        this.code = code;
        this.complaint = complaint;
    }
}

const SIM_MAX_DEPTH = 20;

// Esegue il testo di uno script, una riga alla volta, come un processo figlio: riceve solo le
// variabili esportate, e quello che cambia (variabili, directory corrente) non torna a chi lo ha
// lanciato. name diventa $0, args diventano $1, $2... Restituisce stdout e stderr (chunks li tiene
// nell'ordine in cui sono stati scritti) e il codice di uscita: quello dell'ultimo comando, o di exit.
function simRunScript(sh, text, name, args, stdin, ctx = {}) {
    if (sh.depth >= SIM_MAX_DEPTH) return { out: "", err: `bash: ${name}: troppi script aperti uno dentro l'altro (lo script richiama se stesso?)\n`, code: 126 };
    const saved = {};
    for (const key of ["vars", "exported", "cwd", "args", "arg0", "tty", "stdin", "loops", "lastOutput", "lineOutput", "lastErrors"]) saved[key] = sh[key];
    sh.loops = 0;
    const env = ctx.env || {};
    sh.vars = { ...Object.fromEntries([...sh.exported].filter(key => sh.vars[key] !== undefined).map(key => [key, sh.vars[key]])), ...env };
    sh.exported = new Set([...sh.exported, ...Object.keys(env)]);
    sh.args = args;
    sh.arg0 = name;
    sh.tty = Boolean(ctx.tty);
    sh.stdin = stdin;
    sh.depth++;
    sh.status = 0;
    const display = [];
    let code;
    try {
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            // Un for o un if può occupare più righe: si leggono finché il comando è completo
            let list;
            let chunk = lines[i];
            const first = i;
            let problem = null;
            for (;;) {
                try {
                    list = simParse(chunk);
                    break;
                } catch (error) {
                    if (!(error instanceof SimSyntaxError)) throw error;
                    if (error instanceof SimIncomplete && i + 1 < lines.length) {
                        chunk += `\n${lines[++i]}`;
                        continue;
                    }
                    problem = error;
                    break;
                }
            }
            if (problem) {
                // Come Bash: un errore di sintassi ferma lo script
                display.push({ text: `${name}: riga ${first + 1}: ${problem.message.replace(/^bash: /, "")}\n`, err: true });
                sh.status = 2;
                break;
            }
            simRunList(sh, list, display);
        }
        code = sh.status;
    } catch (error) {
        if (!(error instanceof SimExit)) throw error;
        display.push(...(error.pending || []));
        if (error.complaint) display.push({ text: `${name}: ${error.complaint}\n`, err: true });
        code = error.code;
    } finally {
        Object.assign(sh, saved);
        sh.depth--;
    }
    return {
        chunks: display,
        out: display.filter(chunk => !chunk.err).map(chunk => chunk.text).join(""),
        err: display.filter(chunk => chunk.err).map(chunk => chunk.text).join(""),
        code
    };
}

// Errore d'uso di un comando (opzione non valida, argomento mancante)
class SimUsage extends Error {
    constructor(message, code = 1) {
        super(message);
        this.code = code;
    }
}
