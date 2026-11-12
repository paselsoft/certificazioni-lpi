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
            "/usr/share/doc": { owner: "root" }, "/usr/share/doc/bash": { owner: "root" },
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
            "/usr/share/doc/bash/README": { owner: "root", content: "Bash: la shell del progetto GNU.\n" }
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
        lastOutput: "", lastErrors: "", lastCommand: "", tty: true
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
    return sh;
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
        // $NOME, ${NOME}, $?, $$ ; restituisce l'indice dell'ultimo carattere letto
        word = word || [];
        if (text[i + 1] === "{") {
            const end = text.indexOf("}", i + 2);
            if (end === -1) throw new SimSyntaxError("bash: sostituzione errata: manca la } di chiusura");
            word.push({ t: "var", name: text.slice(i + 2, end), q });
            return end;
        }
        if (text[i + 1] === "?" || text[i + 1] === "$" || text[i + 1] === "#") {
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
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const atWordStart = word === null;
        if (c === " " || c === "\t" || c === "\n") {
            pushWord();
        } else if (c === "#" && atWordStart) {
            break;
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
        } else if (c === "~" && atWordStart) {
            const match = /^~([a-z_][a-z0-9_-]*)?(?=$|[\/\s;|&<>])/.exec(text.slice(i));
            if (match) {
                word = [{ t: "tilde", user: match[1] || "" }];
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

// Struttura: elenco di { pipeline: [comando], op } dove op (;, &&, ||) collega alla successiva.
// Comando: { words, redirects: [{ fd, op, to, target }] }
function simParse(text) {
    const tokens = simTokenize(text);
    const list = [];
    let pipeline = [];
    let command = { words: [], redirects: [] };
    const endCommand = (token) => {
        if (!command.words.length && !command.redirects.length) throw new SimSyntaxError(`bash: errore di sintassi vicino al token inatteso '${token}'`);
        pipeline.push(command);
        command = { words: [], redirects: [] };
    };
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type === "word") {
            command.words.push(token.parts);
        } else if (token.type === "redir") {
            if (token.op === ">&") {
                command.redirects.push(token);
                continue;
            }
            const next = tokens[i + 1];
            if (!next || next.type !== "word") throw new SimSyntaxError("bash: errore di sintassi: dopo il reindirizzamento serve il nome di un file");
            command.redirects.push({ ...token, target: next.parts });
            i++;
        } else if (token.op === "|") {
            endCommand("|");
        } else {
            endCommand(token.op);
            list.push({ pipeline, op: token.op });
            pipeline = [];
        }
    }
    if (command.words.length || command.redirects.length) pipeline.push(command);
    else if (pipeline.length) throw new SimSyntaxError("bash: errore di sintassi: la riga finisce con |");
    if (pipeline.length) list.push({ pipeline, op: null });
    else if (list.length && list[list.length - 1].op !== ";") throw new SimSyntaxError(`bash: errore di sintassi: la riga finisce con ${list[list.length - 1].op}`);
    return list;
}

// ---- Espansione: variabili, ~, divisione in parole, caratteri jolly ----

function simVar(sh, name) {
    if (name === "?") return String(sh.status);
    if (name === "$") return "4242";
    if (name === "#") return "0";
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
        display.push({ text: error.message, err: true });
        sh.lastErrors = error.message;
        sh.status = 2;
        return { lines: display, clear: false };
    }
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
        if (result.clear) {
            clear = true;
            display.length = 0;
        }
        previous = item;
    }
    sh.clock += 60000;
    const lines = [];
    for (const chunk of display) {
        textLines(chunk.text).forEach(line => lines.push({ text: line, err: chunk.err }));
    }
    return { lines, clear };
}

// Testo → righe da mostrare (senza l'a capo finale)
function textLines(text) {
    if (text === "") return [];
    return text.replace(/\n$/, "").split("\n");
}

function simRunPipeline(sh, pipeline, display) {
    let input = null;
    let inputInfo = null;
    let clear = false;
    sh.lastOutput = "";
    for (let index = 0; index < pipeline.length; index++) {
        const command = pipeline[index];
        const last = index === pipeline.length - 1;
        // Dove vanno stdout (1) e stderr (2): "terminal", "pipe", oppure un file
        const route = { 1: last ? { kind: "terminal" } : { kind: "pipe" }, 2: { kind: "terminal" } };
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
            const words = command.words.flatMap((parts, i) => i === 0 ? simExpandWord(sh, parts) : simExpandWord(sh, parts));
            result = simExecute(sh, words, stdin, { stdinInfo, tty: sh.tty && route[1].kind === "terminal" });
            if (result.clear) clear = true;
        }
        // Consegna stdout e stderr secondo la loro destinazione (prima stdout, poi stderr)
        let piped = "";
        for (const fd of [1, 2]) {
            const text = fd === 1 ? result.out : result.err;
            if (!text) continue;
            const target = route[fd];
            if (target.kind === "terminal") {
                display.push({ text, err: fd === 2 });
                if (fd === 1) {
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
        if (["-i", "-s", "su", "bash"].includes(args[0])) return { out: "", err: "sudo: nel simulatore usa sudo davanti a un comando alla volta, per esempio sudo chown luca file\n", code: 1 };
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
        if (name.includes("/")) return simRunPath(sh, name);
        return { out: "", err: `bash: ${name}: comando non trovato\n`, code: 127 };
    }
    if (args.includes("--help")) {
        return { out: `${name}: nel simulatore --help non è disponibile. Le opzioni si ripassano nelle lezioni: ${command.help || "vedi l'elenco con il comando help"}\n`, err: "", code: 0 };
    }
    try {
        const result = command.run(sh, args, stdin, ctx) || {};
        return { out: result.out || "", err: result.err || "", code: result.code || 0, clear: result.clear };
    } catch (error) {
        if (error instanceof SimUsage) return { out: "", err: `${name}: ${error.message}\n`, code: error.code };
        throw error;
    }
}

// ./script.sh o /percorso/programma: il simulatore non esegue programmi, ma dà gli errori giusti
function simRunPath(sh, path) {
    try {
        const found = simGet(sh, path);
        if (found.node.type === "d") return { out: "", err: `bash: ${path}: ${ERRORS.EISDIR}\n`, code: 126 };
        if (!canAccess(sh, found.node, 1)) return { out: "", err: `bash: ${path}: ${ERRORS.EACCES}\n`, code: 126 };
        return { out: "", err: `bash: ${path}: il simulatore non esegue programmi e script (il permesso di esecuzione c'è: su un sistema vero partirebbe)\n`, code: 126 };
    } catch (error) {
        if (error instanceof SimError) return { out: "", err: `bash: ${path}: ${error.message}\n`, code: 127 };
        throw error;
    }
}

// Errore d'uso di un comando (opzione non valida, argomento mancante)
class SimUsage extends Error {
    constructor(message, code = 1) {
        super(message);
        this.code = code;
    }
}
