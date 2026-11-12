// I comandi della shell simulata (shell-sim.js). Ognuno: run(sh, args, stdin, ctx) → { out, err, code }.
// ctx.tty: lo stdout va sullo schermo (ls incolonna i nomi) e non in una pipe o in un file.
// ctx.stdinInfo: { regular, size } se lo stdin è un file reindirizzato con < (wc allinea i numeri).
// I filtri sort, uniq, cut, tr, nl, tac, rev e sed usano il motore di Pipe Dreams.

const SIM_BUILTINS = new Set(["cd", "pwd", "echo", "export", "unset", "type", "history", "help", "clear", "exit", "true", "false"]);

// Comandi che esistono su un sistema vero ma non nel simulatore
const SIM_UNAVAILABLE = Object.fromEntries([
    ["vi", "gli editor non sono disponibili nel simulatore: per scrivere in un file usa echo con > o >>"],
    ["vim", "gli editor non sono disponibili nel simulatore: per scrivere in un file usa echo con > o >>"],
    ["nano", "gli editor non sono disponibili nel simulatore: per scrivere in un file usa echo con > o >>"],
    ...["ps", "top", "free", "kill", "df", "du", "ping", "ip", "ss", "netstat", "ifconfig", "host", "dmesg", "journalctl",
        "useradd", "userdel", "groupadd", "passwd", "su", "apt", "apt-get", "yum", "dnf", "dpkg", "rpm", "ssh", "locate", "updatedb", "awk", "xargs"]
        .map(name => [name, "comando non disponibile nel simulatore (su un sistema Linux vero esiste: lo trovi nelle domande e nelle lezioni)"])
]);

const BINARY_MARK = "\u0000LPI:";
const isBinary = data => data.startsWith(BINARY_MARK);
const binaryKind = data => isBinary(data) ? data.slice(BINARY_MARK.length, data.indexOf("\u0000", 1)) : null;
const binaryBody = data => data.slice(data.indexOf("\u0000", 1) + 1);
const makeBinary = (kind, body) => `${BINARY_MARK}${kind}\u0000${body}`;
const BINARY_NAMES = { tar: "archivio tar", gzip: "file compresso con gzip", bzip2: "file compresso con bzip2", xz: "file compresso con xz", zip: "archivio zip", elf: "programma" };

// Opzioni brevi (anche unite, come -la) e operandi. valued: lettere che vogliono un valore.
// long: { "nome-lungo": "lettera" }. "--" chiude le opzioni.
function parseOptions(args, letters, valued = "", long = {}) {
    const flags = {};
    const values = {};
    const operands = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--") {
            operands.push(...args.slice(i + 1));
            break;
        }
        if (arg.startsWith("--")) {
            const [key, value] = arg.slice(2).split(/=(.*)/s);
            if (key === "color" || key === "colour") continue;
            const letter = long[key];
            if (!letter) throw new SimUsage(`opzione non riconosciuta '${arg}'${letters ? ` (nel simulatore: ${[...letters + valued].map(c => `-${c}`).join(" ")})` : ""}`, 2);
            if (valued.includes(letter)) values[letter] = value ?? args[++i];
            else flags[letter] = true;
            continue;
        }
        if (arg.startsWith("-") && arg.length > 1 && !(/^-[0-9]/.test(arg) && !letters.includes(arg[1]))) {
            for (let j = 1; j < arg.length; j++) {
                const c = arg[j];
                if (valued.includes(c)) {
                    const rest = arg.slice(j + 1);
                    values[c] = rest !== "" ? rest : args[++i];
                    if (values[c] === undefined) throw new SimUsage(`l'opzione -${c} richiede un argomento`, 2);
                    break;
                }
                if (!letters.includes(c)) throw new SimUsage(`opzione non valida -- '${c}' (nel simulatore: ${[...letters + valued].map(l => `-${l}`).join(" ") || "nessuna opzione"})`, 2);
                flags[c] = true;
            }
            continue;
        }
        operands.push(arg);
    }
    return { flags, values, operands };
}

// Risultato che si costruisce un pezzo alla volta
function simOutput() {
    const result = { out: "", err: "", code: 0 };
    result.print = text => { result.out += `${text}\n`; };
    result.fail = (text, code = 1) => {
        result.err += `${text}\n`;
        result.code = Math.max(result.code, code);
    };
    return result;
}

// Contenuto di un file come testo (lancia SimError)
function simReadFile(sh, path) {
    const found = simGet(sh, path);
    if (found.node.type === "d") throw new SimError("EISDIR");
    if (!canAccess(sh, found.node, 4)) throw new SimError("EACCES");
    return found.node.data;
}

// I file indicati uno dopo l'altro, oppure lo stdin ("-" o nessun file)
function simReadInputs(sh, name, files, stdin, res) {
    if (!files.length) return stdin ?? "";
    let text = "";
    for (const file of files) {
        if (file === "-") {
            text += stdin ?? "";
            continue;
        }
        try {
            text += simReadFile(sh, file);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`${name}: ${file}: ${error.message}`);
        }
    }
    return text;
}

const shownText = data => isBinary(data) ? `[contenuto binario: ${BINARY_NAMES[binaryKind(data)] || "dati"}]\n` : data;
const quote = text => `'${text}'`;
const newNode = (sh, type, extra) => simNode(type, sh, extra);
const isWritableDir = (sh, dir) => canAccess(sh, dir, 2) && canAccess(sh, dir, 1);

// Sticky bit: nella directory si cancellano solo i propri file (o se si è il proprietario della directory)
function stickyAllows(sh, dir, node) {
    return !(dir.mode & 0o1000) || sh.user === "root" || node.owner === sh.user || dir.owner === sh.user;
}

// Numero di collegamenti (come in ls -l): per le directory 2 + sottodirectory, per i file i nomi che puntano al nodo
function linkCount(sh, node) {
    if (node.type === "d") return 2 + Object.values(node.children).filter(child => child.type === "d").length;
    let count = 0;
    const walk = dir => Object.values(dir.children).forEach(child => {
        if (child === node) count++;
        if (child.type === "d") walk(child);
    });
    walk(sh.root);
    return Math.max(1, count);
}

function modeString(node) {
    const type = node.type === "d" ? "d" : node.type === "l" ? "l" : "-";
    const bits = node.mode;
    const triplet = (shift, special, letter) => {
        const r = bits >> shift & 4 ? "r" : "-";
        const w = bits >> shift & 2 ? "w" : "-";
        const x = bits >> shift & 1;
        const s = bits & special;
        return r + w + (s ? (x ? letter : letter.toUpperCase()) : x ? "x" : "-");
    };
    return type + triplet(6, 0o4000, "s") + triplet(3, 0o2000, "s") + triplet(0, 0o1000, "t");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function lsDate(sh, time) {
    const date = new Date(time);
    const day = String(date.getDate()).padStart(2, " ");
    const recent = sh.clock - time < 182 * 24 * 3600000 && time <= sh.clock + 3600000;
    const tail = recent ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}` : ` ${date.getFullYear()}`;
    return `${MONTHS[date.getMonth()]} ${day} ${tail}`;
}

// Dimensione leggibile come ls -h e du -h: 4.0K, 13K, 1.2M
function humanSize(bytes) {
    if (bytes < 1024) return String(bytes);
    const units = "KMGT";
    let value = bytes;
    let unit = -1;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    if (value < 10) {
        const rounded = Math.ceil(value * 10) / 10;
        return rounded >= 10 ? `10${units[unit]}` : `${rounded.toFixed(1)}${units[unit]}`;
    }
    return `${Math.ceil(value)}${units[unit]}`;
}

const blocksOf = node => node.type === "d" ? 4 : node.type === "f" && node.data.length ? Math.ceil(fileSize(node) / 4096) * 4 : 0;
const displayWidth = text => [...text].length;

// Nomi incolonnati come ls su un terminale (GNU, «colonne verticali», larghezza sh.columns)
function lsColumns(names, width) {
    if (!names.length) return [];
    const MIN = 3;
    const maxCols = Math.max(1, Math.min(names.length, Math.floor(width / MIN)));
    const info = [];
    for (let cols = 1; cols <= maxCols; cols++) info.push({ cols, widths: new Array(cols).fill(MIN), lineLen: cols * MIN, valid: true });
    names.forEach((name, f) => {
        const length = displayWidth(name);
        info.forEach(item => {
            if (!item.valid) return;
            const rows = Math.ceil(names.length / item.cols);
            const col = Math.floor(f / rows);
            const real = length + (col === item.cols - 1 ? 0 : 2);
            if (item.widths[col] < real) {
                item.lineLen += real - item.widths[col];
                item.widths[col] = real;
                item.valid = item.lineLen < width;
            }
        });
    });
    const chosen = [...info].reverse().find(item => item.valid) || info[0];
    const rows = Math.ceil(names.length / chosen.cols);
    const lines = [];
    for (let row = 0; row < rows; row++) {
        let line = "";
        for (let col = 0; col < chosen.cols; col++) {
            const index = row + col * rows;
            if (index >= names.length) break;
            const name = names[index];
            const nextIndex = row + (col + 1) * rows;
            if (col < chosen.cols - 1 && nextIndex < names.length) line += name + " ".repeat(chosen.widths[col] - displayWidth(name));
            else line += name;
        }
        lines.push(line);
    }
    return lines;
}

// ---- ls ----

function lsRun(sh, args, stdin, ctx) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "alhRdtr1AFS", "", { all: "a", "almost-all": "A", recursive: "R", directory: "d", "human-readable": "h" });
    const targets = operands.length ? operands : ["."];
    const files = [];
    const dirs = [];
    for (const target of targets) {
        try {
            let found = simLookup(sh, target, false);
            if (!found.node) throw new SimError("ENOENT");
            if (found.node.type === "l" && !flags.l && !flags.d) found = simGet(sh, target);
            else if (found.node.type === "l" && target.endsWith("/")) found = simGet(sh, target);
            if (found.node.type === "d" && !flags.d) dirs.push({ name: target, node: found.node, path: found.path });
            else files.push({ name: target, node: found.node, path: found.path });
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`ls: impossibile accedere a ${quote(target)}: ${error.message}`, 2);
        }
    }
    const sortEntries = list => {
        const sorted = list.slice().sort((a, b) => {
            if (flags.t && a.node.mtime !== b.node.mtime) return b.node.mtime - a.node.mtime;
            if (flags.S && fileSize(a.node) !== fileSize(b.node)) return fileSize(b.node) - fileSize(a.node);
            return byteCompare(a.name, b.name);
        });
        return flags.r ? sorted.reverse() : sorted;
    };
    const suffix = node => !flags.F ? "" : node.type === "d" ? "/" : node.type === "l" ? "@" : node.mode & 0o111 ? "*" : "";
    const format = (list, withTotal) => {
        if (flags.l) {
            const rows = list.map(({ name, node }) => ({
                mode: modeString(node), links: String(linkCount(sh, node)), owner: node.owner, group: node.group,
                size: flags.h ? humanSize(fileSize(node)) : String(fileSize(node)), date: lsDate(sh, node.mtime),
                name: name + (node.type === "l" ? ` -> ${node.target}` : suffix(node))
            }));
            const width = key => Math.max(0, ...rows.map(row => row[key].length));
            const lines = rows.map(row => `${row.mode} ${row.links.padStart(width("links"))} ${row.owner.padEnd(width("owner"))} ${row.group.padEnd(width("group"))} ${row.size.padStart(width("size"))} ${row.date} ${row.name}`);
            if (withTotal) {
                const blocks = list.reduce((sum, { node }) => sum + blocksOf(node), 0);
                lines.unshift(`total ${flags.h ? humanSize(blocks * 1024) : blocks}`);
            }
            return lines;
        }
        const names = list.map(({ name, node }) => name + suffix(node));
        return ctx.tty && !flags["1"] ? lsColumns(names, sh.columns) : names;
    };
    const blocks = [];
    if (files.length) blocks.push(format(sortEntries(files), false).join("\n"));
    const showHeaders = files.length + dirs.length > 1 || flags.R || res.err;
    const listDir = (label, node, path) => {
        if (!canAccess(sh, node, 4)) {
            res.fail(`ls: impossibile aprire la directory ${quote(label)}: ${ERRORS.EACCES}`, 2);
            return;
        }
        let entries = sortedNames(node).filter(name => flags.a || flags.A || !name.startsWith(".")).map(name => ({ name, node: node.children[name] }));
        if (flags.a && !flags.A) {
            const parent = path === "/" ? node : simGet(sh, `${path}/..`).node;
            entries.push({ name: ".", node }, { name: "..", node: parent });
        }
        entries = sortEntries(entries);
        const text = format(entries, true).join("\n");
        blocks.push((showHeaders ? `${label}:\n` : "") + text);
        if (flags.R) {
            entries.filter(entry => entry.node.type === "d" && entry.name !== "." && entry.name !== "..").forEach(entry => {
                const childLabel = label.endsWith("/") ? `${label}${entry.name}` : `${label}/${entry.name}`;
                listDir(childLabel, entry.node, path === "/" ? `/${entry.name}` : `${path}/${entry.name}`);
            });
        }
    };
    sortEntries(dirs).forEach(dir => listDir(dir.name, dir.node, dir.path));
    const text = blocks.filter((block, i) => block !== "" || i > 0).join("\n\n");
    if (text !== "") res.out = text.replace(/\n*$/, "\n");
    return res;
}

// ---- Comandi su file e directory ----

function mkdirRun(sh, args) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "pv", "", { parents: "p", verbose: "v" });
    if (!operands.length) throw new SimUsage("manca l'operando: scrivi il nome della directory da creare");
    for (const target of operands) {
        try {
            if (flags.p) {
                const absolute = lexicalPath(sh, target);
                let path = "";
                for (const part of splitPath(absolute)) {
                    path += `/${part}`;
                    const found = simLookup(sh, path);
                    if (found.node) {
                        if (found.node.type !== "d") throw new SimError("ENOTDIR");
                        continue;
                    }
                    if (!isWritableDir(sh, found.parent)) throw new SimError("EACCES");
                    found.parent.children[found.name] = newNode(sh, "d");
                    found.parent.mtime = sh.clock;
                    if (flags.v) res.print(`mkdir: created directory ${quote(path)}`);
                }
                continue;
            }
            const found = simLookup(sh, target);
            if (found.node) throw new SimError("EEXIST");
            if (!isWritableDir(sh, found.parent)) throw new SimError("EACCES");
            found.parent.children[found.name] = newNode(sh, "d");
            found.parent.mtime = sh.clock;
            if (flags.v) res.print(`mkdir: created directory ${quote(target)}`);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`mkdir: impossibile creare la directory ${quote(target)}: ${error.message}`);
        }
    }
    return res;
}

function rmdirRun(sh, args) {
    const res = simOutput();
    const { operands } = parseOptions(args, "", "");
    if (!operands.length) throw new SimUsage("manca l'operando: scrivi il nome della directory vuota da eliminare");
    for (const target of operands) {
        try {
            const found = simLookup(sh, target, false);
            if (!found.node) throw new SimError("ENOENT");
            if (found.node.type !== "d") throw new SimError("ENOTDIR");
            if (Object.keys(found.node.children).length) throw new SimError("ENOTEMPTY");
            if (!isWritableDir(sh, found.parent) || !stickyAllows(sh, found.parent, found.node)) throw new SimError("EACCES");
            delete found.parent.children[found.name];
            found.parent.mtime = sh.clock;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`rmdir: rimozione di ${quote(target)} non riuscita: ${error.message}`);
        }
    }
    return res;
}

function touchRun(sh, args) {
    const res = simOutput();
    const { operands } = parseOptions(args, "", "");
    if (!operands.length) throw new SimUsage("manca l'operando: scrivi il nome del file");
    for (const target of operands) {
        try {
            const found = simLookup(sh, target);
            if (found.node) {
                if (!(found.node.owner === sh.user || sh.user === "root" || canAccess(sh, found.node, 2))) throw new SimError("EACCES");
                found.node.mtime = sh.clock;
                continue;
            }
            if (!isWritableDir(sh, found.parent)) throw new SimError("EACCES");
            found.parent.children[found.name] = newNode(sh, "f");
            found.parent.mtime = sh.clock;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`touch: impossibile eseguire touch di ${quote(target)}: ${error.message}`);
        }
    }
    return res;
}

// Copia profonda di un nodo (per cp)
function cloneNode(sh, node, preserve) {
    const copy = newNode(sh, node.type);
    copy.mode = preserve ? node.mode : node.mode & ~SIM_UMASK;
    if (preserve) {
        copy.mtime = node.mtime;
        if (sh.user === "root") {
            copy.owner = node.owner;
            copy.group = node.group;
        }
    }
    if (node.type === "f") copy.data = node.data;
    if (node.type === "l") copy.target = node.target;
    if (node.type === "d") Object.keys(node.children).forEach(name => { copy.children[name] = cloneNode(sh, node.children[name], preserve); });
    return copy;
}

const isInside = (node, maybeAncestor) => {
    if (node === maybeAncestor) return true;
    if (maybeAncestor.type !== "d") return false;
    return Object.values(maybeAncestor.children).some(child => child.type === "d" && isInside(node, child));
};

// Dove finisce un file copiato o spostato: dentro la directory di destinazione o al suo posto
function destination(sh, source, dest, many) {
    const found = simLookup(sh, dest);
    if (found.node && found.node.type === "d") {
        const inside = simLookup(sh, `${dest.replace(/\/+$/, "")}/${baseName(source)}`, false);
        return { ...inside, dir: found.node, shown: `${dest.replace(/\/+$/, "")}/${baseName(source)}` };
    }
    if (many) throw new SimUsage(`la destinazione ${quote(dest)} non è una directory`);
    if (dest.endsWith("/") && !found.node) throw new SimError("ENOTDIR");
    const raw = simLookup(sh, dest, false);
    return { ...raw, dir: raw.parent, shown: dest };
}

function cpRun(sh, args) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "rRapvf", "", { recursive: "r", archive: "a", verbose: "v", force: "f" });
    const recursive = flags.r || flags.R || flags.a;
    const preserve = flags.p || flags.a;
    if (operands.length < 2) throw new SimUsage(operands.length ? `manca la destinazione dopo ${quote(operands[0])}` : "mancano i file da copiare e la destinazione");
    const dest = operands[operands.length - 1];
    const sources = operands.slice(0, -1);
    for (const source of sources) {
        try {
            let found = simLookup(sh, source, !recursive);
            if (!found.node) throw new SimError("ENOENT");
            if (found.node.type === "d" && !recursive) {
                res.fail(`cp: -r non specificato; omissione della directory ${quote(source)}`);
                continue;
            }
            if (found.node.type !== "l" && !canAccess(sh, found.node, 4)) throw new SimError("EACCES");
            const target = destination(sh, source, dest, sources.length > 1);
            if (target.node === found.node) {
                res.fail(`cp: ${quote(source)} e ${quote(target.shown)} sono lo stesso file`);
                continue;
            }
            const intoItself = found.node.type === "d" && target.dir && isInside(target.dir, found.node);
            if (!target.parent || !isWritableDir(sh, target.parent)) throw new SimError(target.parent ? "EACCES" : "ENOENT");
            if (intoItself) {
                // GNU cp copia quello che c'era prima e poi segnala l'errore
                if (!target.node) target.parent.children[target.name] = cloneNode(sh, found.node, preserve);
                res.fail(`cp: impossibile copiare una directory, ${quote(source)}, in se stessa, ${quote(target.shown)}`);
                continue;
            }
            if (target.node && target.node.type === "d" && found.node.type !== "d") {
                res.fail(`cp: impossibile sovrascrivere la directory ${quote(target.shown)} con una non-directory`);
                continue;
            }
            if (target.node && target.node.type === "f" && found.node.type === "f") {
                if (!canAccess(sh, target.node, 2)) throw new SimError("EACCES");
                target.node.data = found.node.data;
                target.node.mtime = preserve ? found.node.mtime : sh.clock;
            } else if (target.node && target.node.type === "d" && found.node.type === "d") {
                // cp -r in una directory che esiste già: unisce il contenuto
                Object.keys(found.node.children).forEach(name => { target.node.children[name] = cloneNode(sh, found.node.children[name], preserve); });
            } else {
                target.parent.children[target.name] = cloneNode(sh, found.node, preserve);
            }
            target.parent.mtime = sh.clock;
            if (flags.v) res.print(`${quote(source)} -> ${quote(target.shown)}`);
        } catch (error) {
            if (error instanceof SimUsage) throw error;
            if (!(error instanceof SimError)) throw error;
            res.fail(`cp: impossibile fare stat di ${quote(source)}: ${error.message}`);
        }
    }
    return res;
}

function mvRun(sh, args) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "vf", "", { verbose: "v", force: "f" });
    if (operands.length < 2) throw new SimUsage(operands.length ? `manca la destinazione dopo ${quote(operands[0])}` : "mancano i file da spostare e la destinazione");
    const dest = operands[operands.length - 1];
    const sources = operands.slice(0, -1);
    for (const source of sources) {
        try {
            const found = simLookup(sh, source, false);
            if (!found.node) throw new SimError("ENOENT");
            const target = destination(sh, source, dest, sources.length > 1);
            if (target.node === found.node) continue;
            if (found.node.type === "d" && target.dir && isInside(target.dir, found.node)) {
                res.fail(`mv: impossibile spostare ${quote(source)} in una sua sottodirectory, ${quote(target.shown)}`);
                continue;
            }
            if (!isWritableDir(sh, found.parent) || !stickyAllows(sh, found.parent, found.node)) throw new SimError("EACCES");
            if (!target.parent || !isWritableDir(sh, target.parent)) throw new SimError(target.parent ? "EACCES" : "ENOENT");
            if (target.node && target.node.type === "d") {
                if (found.node.type !== "d") {
                    res.fail(`mv: impossibile sovrascrivere la directory ${quote(target.shown)} con una non-directory`);
                    continue;
                }
                if (Object.keys(target.node.children).length) {
                    res.fail(`mv: impossibile spostare ${quote(source)} in ${quote(target.shown)}: ${ERRORS.ENOTEMPTY}`);
                    continue;
                }
            }
            delete found.parent.children[found.name];
            target.parent.children[target.name] = found.node;
            found.parent.mtime = sh.clock;
            target.parent.mtime = sh.clock;
            if (flags.v) res.print(`renamed ${quote(source)} -> ${quote(target.shown)}`);
        } catch (error) {
            if (error instanceof SimUsage) throw error;
            if (!(error instanceof SimError)) throw error;
            res.fail(`mv: impossibile spostare ${quote(source)}: ${error.message}`);
        }
    }
    return res;
}

function rmRun(sh, args) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "rRfdvi", "", { recursive: "r", force: "f", dir: "d", verbose: "v", interactive: "i" });
    if (flags.i) throw new SimUsage("nel simulatore rm -i non può chiedere conferma: su un sistema vero chiede «y» o «n» per ogni file. Riprova senza -i");
    if (!operands.length) {
        if (flags.f) return res;
        throw new SimUsage("manca l'operando: scrivi il nome del file da eliminare");
    }
    const recursive = flags.r || flags.R;
    const removeTree = (dir, label) => {
        for (const name of sortedNames(dir)) {
            const child = dir.children[name];
            const childLabel = `${label.replace(/\/+$/, "")}/${name}`;
            if (child.type === "d") {
                if (!canAccess(sh, child, 4) || !isWritableDir(sh, child)) {
                    res.fail(`rm: impossibile rimuovere ${quote(childLabel)}: ${ERRORS.EACCES}`);
                    return false;
                }
                if (!removeTree(child, childLabel)) return false;
            }
            if (!isWritableDir(sh, dir)) {
                res.fail(`rm: impossibile rimuovere ${quote(childLabel)}: ${ERRORS.EACCES}`);
                return false;
            }
            delete dir.children[name];
            if (flags.v) res.print(`removed ${child.type === "d" ? "directory " : ""}${quote(childLabel)}`);
        }
        return true;
    };
    for (const target of operands) {
        if (/(^|\/)\.\.?\/*$/.test(target)) {
            res.fail(`rm: rifiuto di rimuovere le directory '.' o '..': si salta ${quote(target)}`);
            continue;
        }
        try {
            const found = simLookup(sh, target, false);
            if (!found.node) {
                if (!flags.f) res.fail(`rm: impossibile rimuovere ${quote(target)}: ${ERRORS.ENOENT}`);
                continue;
            }
            if (found.node.type === "d" && !recursive) {
                if (flags.d && !Object.keys(found.node.children).length) {
                    // rm -d: come rmdir
                } else {
                    res.fail(`rm: impossibile rimuovere ${quote(target)}: ${ERRORS.EISDIR}`);
                    continue;
                }
            }
            if (!isWritableDir(sh, found.parent) || !stickyAllows(sh, found.parent, found.node)) {
                res.fail(`rm: impossibile rimuovere ${quote(target)}: ${found.parent.mode & 0o1000 && isWritableDir(sh, found.parent) ? ERRORS.EPERM : ERRORS.EACCES}`);
                continue;
            }
            if (found.node.type === "d" && recursive && !removeTree(found.node, target)) continue;
            delete found.parent.children[found.name];
            found.parent.mtime = sh.clock;
            if (flags.v) res.print(`removed ${found.node.type === "d" ? "directory " : ""}${quote(target)}`);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`rm: impossibile rimuovere ${quote(target)}: ${error.message}`);
        }
    }
    return res;
}

function lnRun(sh, args) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "sfv", "", { symbolic: "s", force: "f", verbose: "v" });
    if (!operands.length) throw new SimUsage("manca l'operando: ln [-s] destinazione [nome del collegamento]");
    const target = operands[0];
    const linkName = operands.length > 1 ? operands[operands.length - 1] : baseName(target);
    if (operands.length > 2) throw new SimUsage("nel simulatore ln crea un collegamento alla volta");
    const kind = flags.s ? "simbolico" : "fisico";
    try {
        let place = simLookup(sh, linkName, false);
        if (place.node && (place.node.type === "d" || (place.node.type === "l" && !flags.f && simLookup(sh, linkName).node && simLookup(sh, linkName).node.type === "d"))) {
            place = simLookup(sh, `${linkName.replace(/\/+$/, "")}/${baseName(target)}`, false);
        }
        let node;
        if (flags.s) {
            node = newNode(sh, "l", { target, mode: 0o777 });
        } else {
            const source = simLookup(sh, target, false);
            if (!source.node) {
                res.fail(`ln: impossibile accedere a ${quote(target)}: ${ERRORS.ENOENT}`);
                return res;
            }
            if (source.node.type === "d") {
                res.fail(`ln: ${quote(target)}: link fisici non consentiti per le directory`);
                return res;
            }
            node = source.node;
        }
        if (place.node) {
            if (!flags.f) {
                res.fail(`ln: impossibile creare il collegamento ${kind} ${quote(linkName)}: ${ERRORS.EEXIST}`);
                return res;
            }
            if (place.node.type === "d") {
                res.fail(`ln: ${quote(linkName)}: impossibile sovrascrivere una directory`);
                return res;
            }
        }
        if (!isWritableDir(sh, place.parent)) throw new SimError("EACCES");
        place.parent.children[place.name] = node;
        place.parent.mtime = sh.clock;
        if (flags.v) res.print(`${quote(linkName)} -> ${quote(target)}`);
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        res.fail(`ln: impossibile creare il collegamento ${kind} ${quote(linkName)}: ${error.message}`);
    }
    return res;
}

// ---- Lettura dei file ----

function catRun(sh, args, stdin) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "n", "", { number: "n" });
    const files = operands.length ? operands : ["-"];
    let text = "";
    for (const file of files) {
        if (file === "-") {
            text += stdin ?? "";
            continue;
        }
        try {
            text += shownText(simReadFile(sh, file));
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.out += flags.n ? numbered(text) : text;
            text = "";
            res.fail(`cat: ${file}: ${error.message}`);
        }
    }
    res.out += flags.n ? numbered(text) : text;
    return res;
}

function numbered(text) {
    if (text === "") return "";
    const lines = text.split("\n");
    const last = lines.pop();
    const numberedLines = lines.map((line, i) => `${String(i + 1).padStart(6)}\t${line}\n`).join("");
    return numberedLines + (last !== "" ? `${String(lines.length + 1).padStart(6)}\t${last}` : "");
}

// head e tail: -n N, -nN, -N; tail anche -n +N (dalla riga N). Con più file, un titolo per file
function headTail(name) {
    return (sh, args, stdin) => {
        const res = simOutput();
        let count = 10;
        let fromStart = false;
        const files = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            let value = null;
            if (arg === "-n" || arg === "--lines") value = args[++i];
            else if (/^-n.+/.test(arg)) value = arg.slice(2);
            else if (/^--lines=/.test(arg)) value = arg.slice(8);
            else if (/^-[0-9]+$/.test(arg)) value = arg.slice(1);
            else if (arg.startsWith("-") && arg !== "-") throw new SimUsage(`opzione non valida '${arg}' (nel simulatore: -n N)`);
            else files.push(arg);
            if (value !== null) {
                if (value === undefined) throw new SimUsage("l'opzione -n richiede un numero");
                if (name === "tail" && /^\+[0-9]+$/.test(value)) {
                    fromStart = true;
                    count = Number(value.slice(1));
                } else if (/^[0-9]+$/.test(value)) {
                    count = Number(value);
                } else if (name === "head" && /^-[0-9]+$/.test(value)) {
                    count = -Number(value.slice(1));
                } else {
                    throw new SimUsage(`numero di righe non valido: ${quote(value)}`);
                }
            }
        }
        const pick = text => {
            const lines = text === "" ? [] : text.replace(/\n$/, "").split("\n");
            const ending = text.endsWith("\n");
            let kept;
            if (name === "head") kept = count >= 0 ? lines.slice(0, count) : lines.slice(0, Math.max(0, lines.length + count));
            else kept = fromStart ? lines.slice(Math.max(0, count - 1)) : count === 0 ? [] : lines.slice(-count);
            if (!kept.length) return "";
            const lastKept = (name === "head" ? kept.length === lines.length : true);
            return kept.join("\n") + (lastKept && !ending ? "" : "\n");
        };
        const inputs = files.length ? files : ["-"];
        inputs.forEach((file, index) => {
            let text;
            try {
                text = file === "-" ? stdin ?? "" : simReadFile(sh, file);
            } catch (error) {
                if (!(error instanceof SimError)) throw error;
                res.fail(`${name}: impossibile aprire ${quote(file)} per la lettura: ${error.message}`);
                return;
            }
            if (inputs.length > 1) res.out += `${index ? "\n" : ""}==> ${file === "-" ? "standard input" : file} <==\n`;
            res.out += pick(shownText(text));
        });
        return res;
    };
}

function wcRun(sh, args, stdin, ctx) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "lwcm", "", { lines: "l", words: "w", bytes: "c", chars: "m" });
    const show = flags.l || flags.w || flags.c || flags.m ? { l: flags.l, w: flags.w, m: flags.m, c: flags.c } : { l: true, w: true, c: true };
    const counts = text => ({
        l: (text.match(/\n/g) || []).length,
        w: text.split(/[ \t\n\v\f\r]+/).filter(Boolean).length,
        m: [...text].length,
        c: new TextEncoder().encode(text).length
    });
    const rows = [];
    let regular = true;
    let totalSize = 0;
    const inputs = operands.length ? operands : ["-"];
    for (const file of inputs) {
        if (file === "-") {
            rows.push({ name: operands.length ? "-" : null, values: counts(stdin ?? "") });
            if (ctx.stdinInfo && ctx.stdinInfo.regular) totalSize += ctx.stdinInfo.size;
            else regular = false;
            continue;
        }
        try {
            const data = simReadFile(sh, file);
            rows.push({ name: file, values: counts(data) });
            totalSize += new TextEncoder().encode(data).length;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`wc: ${file}: ${error.message}`);
        }
    }
    const keys = ["l", "w", "m", "c"].filter(key => show[key]);
    if (inputs.length > 1) {
        const total = {};
        keys.forEach(key => { total[key] = rows.reduce((sum, row) => sum + row.values[key], 0); });
        rows.push({ name: "total", values: total });
    }
    // Larghezza dei numeri come GNU: nessuna se c'è un solo numero da un solo file, 7 se si
    // legge da una pipe, altrimenti le cifre della dimensione totale dei file
    const width = keys.length === 1 && inputs.length === 1 ? 1 : !regular ? 7 : Math.max(1, String(totalSize).length);
    rows.forEach(row => res.print(keys.map(key => String(row.values[key]).padStart(width)).join(" ") + (row.name ? ` ${row.name}` : "")));
    return res;
}

function teeRun(sh, args, stdin) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "a", "", { append: "a" });
    const text = stdin ?? "";
    for (const file of operands) {
        try {
            const node = simOpenForWrite(sh, file, flags.a);
            node.data += text;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`tee: ${file}: ${error.message}`);
        }
    }
    res.out = text;
    return res;
}

// ---- grep ----

// Espressione regolare di base (BRE, quella di grep) → estesa (ERE, quella di grep -E)
function breToEre(pattern) {
    let out = "";
    let inClass = false;
    for (let i = 0; i < pattern.length; i++) {
        const c = pattern[i];
        if (inClass) {
            out += c;
            if (c === "]" && pattern[i - 1] !== "[" && !(pattern[i - 1] === "^" && pattern[i - 2] === "[")) inClass = false;
            continue;
        }
        if (c === "[") {
            inClass = true;
            out += c;
        } else if (c === "\\" && i + 1 < pattern.length) {
            const next = pattern[++i];
            out += "?+|(){}".includes(next) ? next : `\\${next}`;
        } else if ("?+|(){}".includes(c)) {
            out += `\\${c}`;
        } else {
            out += c;
        }
    }
    return out;
}

function grepRun(sh, args, stdin) {
    const res = simOutput();
    const { flags, values, operands } = parseOptions(args, "ivcnwoEFrRlLhHsq", "e", {
        "ignore-case": "i", "invert-match": "v", count: "c", "line-number": "n", "word-regexp": "w", "only-matching": "o",
        "extended-regexp": "E", "fixed-strings": "F", recursive: "r", "files-with-matches": "l", quiet: "q", "no-filename": "h"
    });
    let pattern = values.e;
    const rest = operands.slice();
    if (pattern === undefined) {
        if (!rest.length) throw new SimUsage("manca il testo da cercare: grep 'testo' file", 2);
        pattern = rest.shift();
    }
    let source;
    if (flags.F) source = pattern.replace(/[.*+?^${}()|[\]\\\/]/g, "\\$&");
    else {
        const ere = flags.E ? pattern : breToEre(pattern);
        const problem = erePatternError(ere);
        if (problem) throw new SimUsage(`espressione regolare non valida: ${problem}`, 2);
        source = ereToJs(ere);
    }
    if (flags.w) source = `(?<![A-Za-z0-9_])(?:${source})(?![A-Za-z0-9_])`;
    const regex = new RegExp(source, flags.i ? "i" : "");
    const globalRegex = new RegExp(source, flags.i ? "gi" : "g");
    const recursive = flags.r || flags.R;
    // I file da leggere: con -r si scende nelle directory
    const inputs = [];
    const targets = rest.length ? rest : [recursive ? "." : "-"];
    const addTree = (label, node) => {
        if (node.type === "d") {
            if (!canAccess(sh, node, 4)) {
                if (!flags.s) res.fail(`grep: ${label}: ${ERRORS.EACCES}`, 2);
                return;
            }
            sortedNames(node).forEach(name => {
                const child = node.children[name];
                if (child.type === "l") return;
                addTree(label === "." && !rest.length ? name : `${label.replace(/\/+$/, "")}/${name}`, child);
            });
        } else if (node.type === "f") {
            inputs.push({ name: label, node });
        }
    };
    for (const target of targets) {
        if (target === "-") {
            inputs.push({ name: "(standard input)", text: stdin ?? "" });
            continue;
        }
        try {
            const found = simGet(sh, target);
            if (found.node.type === "d") {
                if (recursive) addTree(target, found.node);
                else if (!flags.s) res.fail(`grep: ${target}: ${ERRORS.EISDIR}`, 2);
                continue;
            }
            inputs.push({ name: target, node: found.node });
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            if (!flags.s) res.fail(`grep: ${target}: ${error.message}`, 2);
        }
    }
    const prefixNames = !flags.h && (flags.H || inputs.length > 1 || recursive);
    let matchedAny = false;
    for (const input of inputs) {
        let text = input.text;
        if (text === undefined) {
            if (!canAccess(sh, input.node, 4)) {
                if (!flags.s) res.fail(`grep: ${input.name}: ${ERRORS.EACCES}`, 2);
                continue;
            }
            text = input.node.data;
        }
        if (isBinary(text)) {
            if (regex.test(binaryBody(text)) !== Boolean(flags.v)) {
                matchedAny = true;
                if (!flags.q && !flags.c) res.print(`grep: ${input.name}: binary file matches`);
            }
            continue;
        }
        const lines = text === "" ? [] : text.replace(/\n$/, "").split("\n");
        let count = 0;
        const prefix = prefixNames ? `${input.name}:` : "";
        lines.forEach((line, index) => {
            const hit = regex.test(line) !== Boolean(flags.v);
            if (!hit) return;
            count++;
            if (flags.c || flags.l || flags.L || flags.q) return;
            const number = flags.n ? `${index + 1}:` : "";
            if (flags.o && !flags.v) {
                for (const match of line.matchAll(globalRegex)) if (match[0] !== "") res.print(`${prefix}${number}${match[0]}`);
            } else {
                res.print(`${prefix}${number}${line}`);
            }
        });
        if (count) matchedAny = true;
        if (flags.q) continue;
        if (flags.c) res.print(`${prefix}${count}`);
        if (flags.l && count) res.print(input.name);
        if (flags.L && !count) res.print(input.name);
    }
    if (flags.q) res.out = "";
    if (res.code < 2) res.code = matchedAny ? 0 : 1;
    return res;
}

// ---- find ----

function findRun(sh, args) {
    const res = simOutput();
    const starts = [];
    let i = 0;
    while (i < args.length && !args[i].startsWith("-") && args[i] !== "!" && args[i] !== "(") starts.push(args[i++]);
    if (!starts.length) starts.push(".");
    const tests = [];
    let maxDepth = Infinity;
    let minDepth = 0;
    let negate = false;
    let doDelete = false;
    for (; i < args.length; i++) {
        const arg = args[i];
        const value = () => {
            const next = args[++i];
            if (next === undefined) throw new SimUsage(`manca l'argomento di ${quote(arg)}`);
            return next;
        };
        let test = null;
        if (arg === "!" || arg === "-not") {
            negate = true;
            continue;
        } else if (arg === "-name" || arg === "-iname") {
            const regex = globToRegex(value());
            const insensitive = arg === "-iname" ? new RegExp(regex.source, "is") : regex;
            test = entry => insensitive.test(entry.name);
        } else if (arg === "-type") {
            const type = value();
            if (!["f", "d", "l"].includes(type)) throw new SimUsage(`tipo sconosciuto in -type: ${quote(type)} (nel simulatore: f, d, l)`);
            test = entry => entry.node.type === type;
        } else if (arg === "-maxdepth") {
            maxDepth = Number(value());
            continue;
        } else if (arg === "-mindepth") {
            minDepth = Number(value());
            continue;
        } else if (arg === "-empty") {
            test = entry => entry.node.type === "d" ? !Object.keys(entry.node.children).length : entry.node.type === "f" && entry.node.data === "";
        } else if (arg === "-user") {
            const user = value();
            test = entry => entry.node.owner === user;
        } else if (arg === "-group") {
            const group = value();
            test = entry => entry.node.group === group;
        } else if (arg === "-perm") {
            const perm = parseInt(value(), 8);
            test = entry => (entry.node.mode & 0o7777) === perm;
        } else if (arg === "-print") {
            continue;
        } else if (arg === "-delete") {
            doDelete = true;
            continue;
        } else {
            throw new SimUsage(`espressione non disponibile nel simulatore: ${quote(arg)} (si possono usare -name, -iname, -type, -maxdepth, -mindepth, -empty, -user, -group, -perm, ! e -delete)`);
        }
        tests.push(negate ? entry => !test(entry) : test);
        negate = false;
    }
    const found = [];
    const visit = (label, name, node, depth, parent) => {
        const entry = { label, name, node, parent };
        if (depth >= minDepth && tests.every(t => t(entry))) found.push(entry);
        if (node.type !== "d" || depth >= maxDepth) return;
        if (!canAccess(sh, node, 4) || !canAccess(sh, node, 1)) {
            res.fail(`find: ${quote(label)}: ${ERRORS.EACCES}`);
            return;
        }
        sortedNames(node).forEach(child => visit(label.endsWith("/") ? label + child : `${label}/${child}`, child, node.children[child], depth + 1, node));
    };
    for (const start of starts) {
        try {
            const where = simLookup(sh, start, false);
            if (!where.node) throw new SimError("ENOENT");
            const node = where.node.type === "l" && start.endsWith("/") ? simGet(sh, start).node : where.node;
            visit(start, baseName(start), node, 0, where.parent);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`find: ${quote(start)}: ${error.message}`);
        }
    }
    if (doDelete) {
        // -delete: dal più profondo, come find (che implica -depth)
        found.slice().reverse().forEach(entry => {
            if (entry.node.type === "d" && Object.keys(entry.node.children).length) {
                res.fail(`find: impossibile eliminare ${quote(entry.label)}: ${ERRORS.ENOTEMPTY}`);
                return;
            }
            if (!entry.parent || !isWritableDir(sh, entry.parent)) {
                res.fail(`find: impossibile eliminare ${quote(entry.label)}: ${ERRORS.EACCES}`);
                return;
            }
            const key = Object.keys(entry.parent.children).find(name => entry.parent.children[name] === entry.node && name === entry.name);
            if (key) delete entry.parent.children[key];
        });
        return res;
    }
    found.forEach(entry => res.print(entry.label));
    return res;
}

// ---- Archivi e compressione ----

// Un archivio è l'elenco dei suoi elementi: { name, type, mode, mtime, data, target }
function tarCollect(sh, label, node, list, res) {
    if (node.type === "d") {
        if (!canAccess(sh, node, 4)) {
            res.fail(`tar: ${label}: impossibile aprire la directory: ${ERRORS.EACCES}`, 2);
            return;
        }
        list.push({ name: `${label.replace(/\/+$/, "")}/`, type: "d", mode: node.mode, mtime: node.mtime });
        sortedNames(node).forEach(name => tarCollect(sh, `${label.replace(/\/+$/, "")}/${name}`, node.children[name], list, res));
    } else if (node.type === "l") {
        list.push({ name: label, type: "l", mode: node.mode, mtime: node.mtime, target: node.target });
    } else {
        if (!canAccess(sh, node, 4)) {
            res.fail(`tar: ${label}: impossibile aprire: ${ERRORS.EACCES}`, 2);
            return;
        }
        list.push({ name: label, type: "f", mode: node.mode, mtime: node.mtime, data: node.data });
    }
}

const COMPRESSORS = { z: "gzip", j: "bzip2", J: "xz" };
const unwrapCompression = data => {
    let kind = binaryKind(data);
    while (kind === "gzip" || kind === "bzip2" || kind === "xz") {
        data = binaryBody(data);
        kind = binaryKind(data);
    }
    return data;
};

function tarRun(sh, args) {
    const res = simOutput();
    // Opzioni nello stile vecchio (tar czf archivio ...) o nuovo (tar -czf archivio ...)
    const words = args.slice();
    if (words.length && !words[0].startsWith("-")) words[0] = `-${words[0]}`;
    const flags = {};
    let file = null;
    let directory = null;
    const operands = [];
    const LONG = { create: "c", extract: "x", list: "t", gzip: "z", bzip2: "j", xz: "J", verbose: "v" };
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        if (word.startsWith("--")) {
            const [key, value] = word.slice(2).split(/=(.*)/s);
            if (key === "file") file = value ?? words[++i];
            else if (key === "directory") directory = value ?? words[++i];
            else if (LONG[key]) flags[LONG[key]] = true;
            else throw new SimUsage(`opzione non disponibile nel simulatore: ${quote(word)}`, 2);
        } else if (word.startsWith("-") && word.length > 1) {
            for (let j = 1; j < word.length; j++) {
                const c = word[j];
                if (c === "f" || c === "C") {
                    const rest = word.slice(j + 1);
                    const value = rest !== "" ? rest : words[++i];
                    if (value === undefined) throw new SimUsage(`l'opzione -${c} richiede un argomento`, 2);
                    if (c === "f") file = value;
                    else directory = value;
                    break;
                }
                if (!"cxtzjJv".includes(c)) throw new SimUsage(`opzione non valida -- '${c}' (nel simulatore: c x t z j J v f C)`, 2);
                flags[c] = true;
            }
        } else {
            operands.push(word);
        }
    }
    const modes = ["c", "x", "t"].filter(mode => flags[mode]);
    if (modes.length !== 1) throw new SimUsage("scegli una sola operazione: -c (crea), -x (estrai) o -t (elenca)", 2);
    if (!file) throw new SimUsage("nel simulatore indica sempre l'archivio con -f nome", 2);
    const compression = Object.keys(COMPRESSORS).filter(letter => flags[letter]);
    const base = directory || ".";
    const resolveIn = name => isAbsolute(name) ? name : `${base.replace(/\/+$/, "")}/${name}`;
    if (flags.c) {
        if (!operands.length) throw new SimUsage("non creo un archivio vuoto: indica i file e le directory da mettere dentro", 2);
        const list = [];
        let warned = false;
        for (const operand of operands) {
            try {
                const found = simLookup(sh, resolveIn(operand), false);
                if (!found.node) throw new SimError("ENOENT");
                let label = operand;
                if (label.startsWith("/")) {
                    label = label.replace(/^\/+/, "");
                    if (!warned) res.err += "tar: Rimozione di '/' iniziale dai nomi dei membri\n";
                    warned = true;
                }
                tarCollect(sh, label, found.node, list, res);
            } catch (error) {
                if (!(error instanceof SimError)) throw error;
                res.fail(`tar: ${operand}: impossibile fare stat: ${error.message}`, 2);
            }
        }
        if (res.code) {
            res.err += "tar: Uscita con stato di errore a causa di errori precedenti\n";
        }
        let data = makeBinary("tar", JSON.stringify(list));
        compression.forEach(letter => { data = makeBinary(COMPRESSORS[letter], data); });
        try {
            const node = simOpenForWrite(sh, file, false);
            node.data = data;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`tar: ${file}: impossibile aprire: ${error.message}`, 2);
            return res;
        }
        if (flags.v) list.forEach(entry => res.print(entry.name));
        return res;
    }
    // Lettura (t o x): la compressione si riconosce da sola, come fa GNU tar
    let list;
    try {
        const data = unwrapCompression(simReadFile(sh, file));
        if (binaryKind(data) !== "tar") {
            res.fail("tar: Questo non sembra un archivio tar", 2);
            res.fail("tar: Uscita con stato di errore a causa di errori precedenti", 2);
            return res;
        }
        list = JSON.parse(binaryBody(data));
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        res.fail(`tar: ${file}: impossibile aprire: ${error.message}`, 2);
        res.fail("tar: Error is not recoverable: exiting now", 2);
        return res;
    }
    const wanted = entry => !operands.length || operands.some(name => entry.name === name || entry.name === `${name.replace(/\/+$/, "")}/` || entry.name.startsWith(`${name.replace(/\/+$/, "")}/`));
    const selected = list.filter(wanted);
    if (flags.t) {
        selected.forEach(entry => {
            if (!flags.v) {
                res.print(entry.name);
                return;
            }
            const size = entry.type === "f" ? new TextEncoder().encode(entry.data).length : 0;
            const date = new Date(entry.mtime);
            const stamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            res.print(`${modeString({ type: entry.type, mode: entry.mode })} ${sh.user}/${SIM_USERS[sh.user].groups[0]} ${String(size).padStart(5)} ${stamp} ${entry.name}${entry.type === "l" ? ` -> ${entry.target}` : ""}`);
        });
        return res;
    }
    for (const entry of selected) {
        const path = resolveIn(entry.name.replace(/\/$/, ""));
        try {
            const found = simLookup(sh, path, false);
            if (!found.parent) throw new SimError("ENOENT");
            if (entry.type === "d") {
                if (!found.node) {
                    if (!isWritableDir(sh, found.parent)) throw new SimError("EACCES");
                    found.parent.children[found.name] = newNode(sh, "d", { mode: entry.mode, mtime: entry.mtime });
                }
            } else {
                if (found.node && found.node.type === "d") throw new SimError("EISDIR");
                if (!isWritableDir(sh, found.parent)) throw new SimError("EACCES");
                found.parent.children[found.name] = entry.type === "l"
                    ? newNode(sh, "l", { target: entry.target, mode: 0o777, mtime: entry.mtime })
                    : newNode(sh, "f", { data: entry.data, mode: entry.mode, mtime: entry.mtime });
            }
            if (flags.v) res.print(entry.name);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`tar: ${entry.name}: impossibile creare: ${error.message}`, 2);
        }
    }
    return res;
}

// gzip, bzip2, xz e i loro opposti. -k tiene l'originale, -d decomprime, -c scrive sullo stdout
function compressor(kind, extension, decompressDefault, toStdout) {
    return (sh, args, stdin) => {
        const res = simOutput();
        const name = toStdout ? `${kind === "gzip" ? "z" : kind === "bzip2" ? "bz" : "xz"}cat` : decompressDefault ? `un${kind === "gzip" ? "gzip" : kind === "bzip2" ? "bzip2" : "xz"}` : kind;
        const { flags, operands } = parseOptions(args, "kdcfv", "", { keep: "k", decompress: "d", stdout: "c", force: "f", verbose: "v" });
        const decompress = decompressDefault || flags.d;
        const stdout = toStdout || flags.c;
        const shownName = name === "unbzip2" ? "bunzip2" : name;
        if (!operands.length) {
            if (decompress) {
                const data = stdin ?? "";
                if (binaryKind(data) !== kind) res.fail(`${shownName}: stdin: not in ${kind} format`);
                else res.out = binaryBody(data);
            } else {
                res.out = makeBinary(kind, stdin ?? "");
            }
            return res;
        }
        for (const file of operands) {
            try {
                const found = simGet(sh, file, false);
                if (found.node.type === "d") {
                    res.fail(`${shownName}: ${file} is a directory -- ignored`, 2);
                    continue;
                }
                if (!canAccess(sh, found.node, 4)) throw new SimError("EACCES");
                if (decompress) {
                    if (!file.endsWith(extension)) {
                        res.fail(`${shownName}: ${file}: unknown suffix -- ignored`, 2);
                        continue;
                    }
                    if (binaryKind(found.node.data) !== kind) {
                        res.fail(`${shownName}: ${file}: not in ${kind} format`);
                        continue;
                    }
                    const plain = binaryBody(found.node.data);
                    if (stdout) {
                        res.out += isBinary(plain) ? shownText(plain) : plain;
                        continue;
                    }
                    const target = file.slice(0, -extension.length);
                    writeSibling(sh, file, target, plain, found.node, flags, res, shownName);
                } else {
                    if (file.endsWith(extension)) {
                        res.err += `${shownName}: ${file} already has ${extension} suffix -- unchanged\n`;
                        continue;
                    }
                    const packed = makeBinary(kind, found.node.data);
                    if (stdout) {
                        res.out += shownText(packed);
                        continue;
                    }
                    writeSibling(sh, file, file + extension, packed, found.node, flags, res, shownName);
                }
            } catch (error) {
                if (!(error instanceof SimError)) throw error;
                res.fail(`${shownName}: ${file}: ${error.message}`);
            }
        }
        return res;
    };
}

// Scrive il file compresso o decompresso accanto all'originale; senza -k toglie l'originale
function writeSibling(sh, source, target, data, original, flags, res, name) {
    const place = simLookup(sh, target, false);
    if (place.node && !flags.f) {
        res.fail(`${name}: ${target} already exists; not overwritten`, 2);
        return;
    }
    if (!isWritableDir(sh, place.parent)) throw new SimError("EACCES");
    place.parent.children[place.name] = newNode(sh, "f", { data, mode: original.mode, mtime: original.mtime });
    if (!flags.k) {
        const from = simLookup(sh, source, false);
        delete from.parent.children[from.name];
    }
    if (flags.v) res.err += `${source}:\t-- replaced with ${target}\n`;
}

function zipRun(sh, args) {
    const res = simOutput();
    const { flags, operands } = parseOptions(args, "rq", "", { recurse: "r", quiet: "q" });
    if (operands.length < 2) throw new SimUsage("si usa zip [-r] archivio.zip file...", 12);
    let archive = operands[0];
    if (!/\.zip$/.test(archive)) archive += ".zip";
    const list = [];
    for (const operand of operands.slice(1)) {
        try {
            const found = simGet(sh, operand);
            if (found.node.type === "d" && !flags.r) {
                list.push({ name: `${operand.replace(/\/+$/, "")}/`, type: "d", mode: found.node.mode, mtime: found.node.mtime });
                continue;
            }
            tarCollect(sh, operand, found.node, list, res);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.fail(`\tzip warning: name not matched: ${operand}`, 0);
        }
    }
    if (!list.length) {
        res.fail("\nzip error: Nothing to do!", 12);
        return res;
    }
    const node = simOpenForWrite(sh, archive, false);
    node.data = makeBinary("zip", JSON.stringify(list));
    if (!flags.q) list.forEach(entry => res.print(`  adding: ${entry.name} (stored 0%)`));
    return res;
}

function unzipRun(sh, args) {
    const res = simOutput();
    const { flags, values, operands } = parseOptions(args, "lqo", "d", {});
    if (!operands.length) throw new SimUsage("si usa unzip archivio.zip [-l] [-d directory]");
    let list;
    const archive = operands[0];
    try {
        const data = simReadFile(sh, archive);
        if (binaryKind(data) !== "zip") {
            res.fail(`  End-of-central-directory signature not found. ${archive} non è un archivio zip.`, 9);
            return res;
        }
        list = JSON.parse(binaryBody(data));
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        res.fail(`unzip:  cannot find or open ${archive}, ${archive}.zip or ${archive}.ZIP.`, 9);
        return res;
    }
    if (flags.l) {
        res.print(`Archive:  ${archive}`);
        res.print("  Length      Date    Time    Name");
        res.print("---------  ---------- -----   ----");
        let total = 0;
        list.forEach(entry => {
            const size = entry.type === "f" ? new TextEncoder().encode(entry.data).length : 0;
            total += size;
            const date = new Date(entry.mtime);
            res.print(`${String(size).padStart(9)}  ${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}   ${entry.name}`);
        });
        res.print("---------                     -------");
        res.print(`${String(total).padStart(9)}                     ${list.length} file${list.length === 1 ? "" : "s"}`);
        return res;
    }
    if (!flags.q) res.print(`Archive:  ${archive}`);
    const base = values.d || ".";
    if (values.d) mkdirRun(sh, ["-p", values.d]);
    for (const entry of list) {
        const path = `${base.replace(/\/+$/, "")}/${entry.name.replace(/\/$/, "")}`;
        const found = simLookup(sh, path, false);
        if (entry.type === "d") {
            if (!found.node) found.parent.children[found.name] = newNode(sh, "d", { mode: entry.mode, mtime: entry.mtime });
            if (!flags.q) res.print(`   creating: ${values.d ? `${values.d.replace(/\/+$/, "")}/` : ""}${entry.name}`);
        } else {
            found.parent.children[found.name] = newNode(sh, "f", { data: entry.data || "", mode: entry.mode, mtime: entry.mtime });
            if (!flags.q) res.print(`  inflating: ${values.d ? `${values.d.replace(/\/+$/, "")}/` : ""}${entry.name}`);
        }
    }
    return res;
}

// ---- Permessi e proprietà ----

// Modo simbolico (u+x, go-w, a=r, u=rw,g=r,o=) applicato a un modo esistente
function applySymbolic(mode, spec, isDir) {
    let result = mode;
    for (const clause of spec.split(",")) {
        const match = /^([ugoa]*)([-+=][rwxXst]*)+$/.exec(clause);
        if (!match) return null;
        const who = match[1] || "a";
        const actions = clause.slice(match[1].length).match(/[-+=][rwxXst]*/g);
        for (const action of actions) {
            const op = action[0];
            const perms = action.slice(1);
            let bits = 0;
            const all = who.includes("a");
            const users = { u: all || who.includes("u"), g: all || who.includes("g"), o: all || who.includes("o") };
            const triplet = (letterBits) => (users.u ? letterBits << 6 : 0) | (users.g ? letterBits << 3 : 0) | (users.o ? letterBits : 0);
            if (perms.includes("r")) bits |= triplet(4);
            if (perms.includes("w")) bits |= triplet(2);
            if (perms.includes("x") || (perms.includes("X") && (isDir || (mode & 0o111)))) bits |= triplet(1);
            if (perms.includes("s")) bits |= (users.u ? 0o4000 : 0) | (users.g ? 0o2000 : 0);
            if (perms.includes("t")) bits |= 0o1000;
            if (op === "+") result |= bits;
            else if (op === "-") result &= ~bits;
            else {
                const clear = triplet(7) | (users.u ? 0o4000 : 0) | (users.g ? 0o2000 : 0) | (all || users.o ? 0o1000 : 0);
                result = (result & ~clear) | bits;
            }
        }
    }
    return result;
}

function chmodRun(sh, args) {
    const res = simOutput();
    // Il modo può iniziare con - (chmod -w file): va letto prima delle opzioni
    const words = args.slice();
    let recursive = false;
    let verbose = false;
    const operands = [];
    for (const word of words) {
        if (word === "-R" || word === "--recursive") recursive = true;
        else if (word === "-v" || word === "--verbose") verbose = true;
        else operands.push(word);
    }
    if (operands.length < 2) throw new SimUsage("si usa chmod modo file, per esempio chmod 755 script.sh o chmod u+x script.sh");
    const [spec, ...files] = operands;
    const octal = /^[0-7]{1,4}$/.test(spec);
    const change = (label, node) => {
        if (node.owner !== sh.user && sh.user !== "root") {
            res.fail(`chmod: modifica dei permessi di ${quote(label)}: ${ERRORS.EPERM}`);
            return;
        }
        const next = octal ? parseInt(spec, 8) | (spec.length < 4 && node.type === "d" ? node.mode & 0o6000 : 0) : applySymbolic(node.mode, spec, node.type === "d");
        if (next === null) throw new SimUsage(`modo non valido: ${quote(spec)}`);
        if (verbose) res.print(`mode of ${quote(label)} changed from ${(node.mode & 0o7777).toString(8).padStart(4, "0")} (${modeString(node).slice(1)}) to ${(next & 0o7777).toString(8).padStart(4, "0")} (${modeString({ ...node, mode: next }).slice(1)})`);
        node.mode = next;
        if (recursive && node.type === "d") sortedNames(node).forEach(name => {
            const child = node.children[name];
            if (child.type !== "l") change(`${label.replace(/\/+$/, "")}/${name}`, child);
        });
    };
    if (!octal && applySymbolic(0, spec, false) === null) throw new SimUsage(`modo non valido: ${quote(spec)} (per esempio 644, 755, u+x, go-w)`);
    for (const file of files) {
        try {
            change(file, simGet(sh, file).node);
        } catch (error) {
            if (error instanceof SimUsage) throw error;
            if (!(error instanceof SimError)) throw error;
            res.fail(`chmod: impossibile accedere a ${quote(file)}: ${error.message}`);
        }
    }
    return res;
}

function chownRun(name) {
    return (sh, args) => {
        const res = simOutput();
        const { flags, operands } = parseOptions(args, "Rv", "", { recursive: "R", verbose: "v" });
        if (operands.length < 2) throw new SimUsage(name === "chown" ? "si usa chown utente[:gruppo] file" : "si usa chgrp gruppo file");
        const [spec, ...files] = operands;
        let owner = null;
        let group = null;
        if (name === "chgrp") group = spec;
        else {
            const at = spec.search(/[:.]/);
            owner = at === -1 ? spec : spec.slice(0, at) || null;
            group = at === -1 ? null : spec.slice(at + 1) || (owner && SIM_USERS[owner] ? SIM_USERS[owner].groups[0] : null);
        }
        if (owner && !SIM_USERS[owner]) throw new SimUsage(`utente non valido: ${quote(owner)}`);
        if (group && SIM_GROUPS[group] === undefined) throw new SimUsage(`gruppo non valido: ${quote(group)}`);
        const change = (label, node) => {
            const allowed = sh.user === "root" || (!owner || owner === node.owner) && node.owner === sh.user && (!group || SIM_USERS[sh.user].groups.includes(group));
            if (!allowed) {
                res.fail(`${name}: modifica ${owner ? "del proprietario" : "del gruppo"} di ${quote(label)}: ${ERRORS.EPERM}`);
                return;
            }
            if (owner) node.owner = owner;
            if (group) node.group = group;
            if (flags.v) res.print(`changed ownership of ${quote(label)} to ${node.owner}:${node.group}`);
            if (flags.R && node.type === "d") sortedNames(node).forEach(child => change(`${label.replace(/\/+$/, "")}/${child}`, node.children[child]));
        };
        for (const file of files) {
            try {
                change(file, simGet(sh, file).node);
            } catch (error) {
                if (!(error instanceof SimError)) throw error;
                res.fail(`${name}: impossibile accedere a ${quote(file)}: ${error.message}`);
            }
        }
        return res;
    };
}

function fileRun(sh, args) {
    const res = simOutput();
    const { operands } = parseOptions(args, "", "");
    if (!operands.length) throw new SimUsage("si usa file nome");
    // Come file: le descrizioni allineate dopo il nome più lungo
    const width = Math.max(...operands.map(name => displayWidth(name)));
    for (const name of operands) {
        try {
            const found = simLookup(sh, name, false);
            if (!found.node) throw new SimError("ENOENT");
            const node = found.node;
            let kind;
            if (node.type === "d") kind = "directory";
            else if (node.type === "l") kind = `symbolic link to ${node.target}`;
            else if (!canAccess(sh, node, 4)) kind = "regular file, no read permission";
            else if (node.data === "") kind = "empty";
            else if (isBinary(node.data)) kind = { tar: "POSIX tar archive (GNU)", gzip: "gzip compressed data", bzip2: "bzip2 compressed data, block size = 900k", xz: "XZ compressed data, checksum CRC64", zip: "Zip archive data", elf: "ELF 64-bit LSB pie executable" }[binaryKind(node.data)];
            else if (node.data.startsWith("#!ELF")) kind = "ELF 64-bit LSB pie executable, x86-64";
            else if (/^#!.*\bbash\b/.test(node.data)) kind = `Bourne-Again shell script, ${/^[\x00-\x7f]*$/.test(node.data) ? "ASCII" : "Unicode"} text executable`;
            else if (/^[\x00-\x7f]*$/.test(node.data)) kind = "ASCII text";
            else kind = "Unicode text, UTF-8 text";
            res.print(`${name}:${" ".repeat(width - displayWidth(name) + 1)}${kind}`);
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
            res.print(`${name}: cannot open \`${name}' (No such file or directory)`);
        }
    }
    return res;
}

// ---- Comandi interni e informazioni ----

function cdRun(sh, args) {
    const res = simOutput();
    const operands = args.filter(arg => arg !== "-L" && arg !== "-P");
    if (operands.length > 1) {
        res.fail("bash: cd: troppi argomenti");
        return res;
    }
    let target = operands[0];
    let print = false;
    if (target === undefined || target === "") target = sh.vars.HOME;
    else if (target === "-") {
        target = sh.vars.OLDPWD;
        if (!target) {
            res.fail("bash: cd: OLDPWD non impostata");
            return res;
        }
        print = true;
    }
    const logical = lexicalPath(sh, target);
    try {
        const found = simGet(sh, logical);
        if (found.node.type !== "d") throw new SimError("ENOTDIR");
        if (!canAccess(sh, found.node, 1)) throw new SimError("EACCES");
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        res.fail(`bash: cd: ${operands[0] ?? target}: ${error.message}`);
        return res;
    }
    sh.vars.OLDPWD = sh.cwd;
    sh.cwd = logical;
    sh.vars.PWD = logical;
    if (print) res.print(logical);
    return res;
}

function echoRun(sh, args) {
    let newline = true;
    let escapes = false;
    let i = 0;
    while (i < args.length && /^-[neE]+$/.test(args[i])) {
        if (args[i].includes("n")) newline = false;
        if (args[i].includes("e")) escapes = true;
        if (args[i].includes("E")) escapes = false;
        i++;
    }
    let text = args.slice(i).join(" ");
    if (escapes) text = text.replace(/\\(n|t|\\)/g, (_, c) => c === "n" ? "\n" : c === "t" ? "\t" : "\\");
    return { out: text + (newline ? "\n" : "") };
}

function typeRun(sh, args) {
    const res = simOutput();
    for (const name of args) {
        if (SIM_BUILTINS.has(name)) res.print(`${name} is a shell builtin`);
        else if (SIM_COMMANDS[name] || SIM_UNAVAILABLE[name]) res.print(`${name} is /usr/bin/${name}`);
        else res.fail(`bash: type: ${name}: non trovato`);
    }
    return res;
}

function whichRun(sh, args) {
    const res = simOutput();
    let found = false;
    for (const name of args) {
        if ((SIM_COMMANDS[name] && !SIM_BUILTINS.has(name)) || SIM_UNAVAILABLE[name]) {
            res.print(`/usr/bin/${name}`);
            found = true;
        } else {
            res.code = 1;
        }
    }
    if (!found) res.code = 1;
    return res;
}

const SIM_HELP = [
    "Comandi del simulatore (il resto dell'esame si ripassa con domande e lezioni):",
    "  file e directory: pwd cd ls mkdir rmdir touch cp mv rm ln file find",
    "  leggere e filtrare: cat less head tail wc grep sort uniq cut tr nl tac rev sed tee",
    "  archivi: tar gzip gunzip bzip2 bunzip2 xz unxz zcat bzcat xzcat zip unzip",
    "  permessi e utenti: chmod chown chgrp id whoami groups sudo",
    "  shell: echo export unset env type which history clear help",
    "Funzionano anche | ; && || > >> < 2> 2>&1 &>, le virgolette, $VARIABILI, ~ e i caratteri jolly * ? [ ].",
    "Con ↑ e ↓ richiami i comandi precedenti."
];

const SIM_COMMANDS = {
    pwd: { run: sh => ({ out: `${sh.cwd}\n` }) },
    cd: { run: cdRun },
    echo: { run: echoRun },
    export: {
        run: (sh, args) => {
            const res = simOutput();
            if (!args.length) {
                [...sh.exported].sort().forEach(name => res.print(`declare -x ${name}="${sh.vars[name] ?? ""}"`));
                return res;
            }
            for (const arg of args) {
                const at = arg.indexOf("=");
                const name = at === -1 ? arg : arg.slice(0, at);
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
                    res.fail(`bash: export: \`${arg}': non è un identificatore valido`);
                    continue;
                }
                if (at !== -1) sh.vars[name] = arg.slice(at + 1);
                sh.exported.add(name);
            }
            return res;
        }
    },
    unset: {
        run: (sh, args) => {
            args.forEach(name => {
                delete sh.vars[name];
                sh.exported.delete(name);
            });
            return {};
        }
    },
    env: { run: sh => ({ out: [...sh.exported].sort().filter(name => sh.vars[name] !== undefined).map(name => `${name}=${sh.vars[name]}\n`).join("") }) },
    printenv: {
        run: (sh, args) => {
            if (!args.length) return SIM_COMMANDS.env.run(sh);
            const values = args.filter(name => sh.exported.has(name) && sh.vars[name] !== undefined);
            return { out: values.map(name => `${sh.vars[name]}\n`).join(""), code: values.length === args.length ? 0 : 1 };
        }
    },
    type: { run: typeRun },
    which: { run: whichRun },
    history: { run: sh => ({ out: sh.history.map((line, i) => `${String(i + 1).padStart(5)}  ${line}\n`).join("") }) },
    help: { run: () => ({ out: SIM_HELP.join("\n") + "\n" }) },
    clear: { run: () => ({ clear: true }) },
    exit: { run: () => ({ err: "exit: nel simulatore il terminale resta aperto (per ricominciare l'esercizio usa «Ricomincia»)\n" }) },
    true: { run: () => ({}) },
    false: { run: () => ({ code: 1 }) },
    man: { run: (sh, args) => ({ err: `man: nel simulatore non ci sono le pagine di manuale${args[0] ? ` (su un sistema vero: man ${args[0]})` : ""}. Le opzioni dei comandi sono spiegate nelle domande e nelle lezioni.\n`, code: 16 }) },
    info: { run: () => ({ err: "info: nel simulatore non ci sono le pagine info.\n", code: 1 }) },
    id: {
        run: (sh, args) => {
            const name = args[0] || sh.user;
            const user = SIM_USERS[name];
            if (!user) return { err: `id: ${quote(name)}: utente inesistente\n`, code: 1 };
            const groups = user.groups.map(group => `${SIM_GROUPS[group]}(${group})`).join(",");
            return { out: `uid=${user.uid}(${name}) gid=${user.gid}(${user.groups[0]}) groups=${groups}\n` };
        }
    },
    whoami: { run: sh => ({ out: `${sh.user}\n` }) },
    groups: { run: (sh, args) => ({ out: `${args[0] ? `${args[0]} : ` : ""}${(SIM_USERS[args[0] || sh.user] || { groups: [] }).groups.join(" ")}\n` }) },
    hostname: { run: () => ({ out: "lpi\n" }) },
    uname: {
        run: (sh, args) => {
            const { flags } = parseOptions(args, "asnrm", "", { all: "a" });
            if (flags.a) return { out: "Linux lpi 6.8.0-49-generic #49-Ubuntu SMP x86_64 GNU/Linux\n" };
            const parts = [];
            if (flags.s || !Object.keys(flags).length) parts.push("Linux");
            if (flags.n) parts.push("lpi");
            if (flags.r) parts.push("6.8.0-49-generic");
            if (flags.m) parts.push("x86_64");
            return { out: `${parts.join(" ")}\n` };
        }
    },
    date: {
        run: sh => {
            const date = new Date(sh.clock);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const two = n => String(n).padStart(2, "0");
            return { out: `${days[date.getDay()]} ${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, " ")} ${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())} CET ${date.getFullYear()}\n` };
        }
    },
    ls: { run: lsRun, help: "ls -l, -a, -R, -d, -h, -t, -r" },
    mkdir: { run: mkdirRun },
    rmdir: { run: rmdirRun },
    touch: { run: touchRun },
    cp: { run: cpRun },
    mv: { run: mvRun },
    rm: { run: rmRun },
    ln: { run: lnRun },
    cat: { run: catRun },
    less: { run: (sh, args, stdin) => catRun(sh, args.filter(arg => !arg.startsWith("-")), stdin) },
    more: { run: (sh, args, stdin) => catRun(sh, args.filter(arg => !arg.startsWith("-")), stdin) },
    head: { run: headTail("head") },
    tail: { run: headTail("tail") },
    wc: { run: wcRun },
    tee: { run: teeRun },
    grep: { run: grepRun },
    egrep: { run: (sh, args, stdin) => grepRun(sh, ["-E", ...args], stdin) },
    find: { run: findRun },
    file: { run: fileRun },
    tar: { run: tarRun },
    gzip: { run: compressor("gzip", ".gz", false, false) },
    gunzip: { run: compressor("gzip", ".gz", true, false) },
    zcat: { run: compressor("gzip", ".gz", true, true) },
    bzip2: { run: compressor("bzip2", ".bz2", false, false) },
    bunzip2: { run: compressor("bzip2", ".bz2", true, false) },
    bzcat: { run: compressor("bzip2", ".bz2", true, true) },
    xz: { run: compressor("xz", ".xz", false, false) },
    unxz: { run: compressor("xz", ".xz", true, false) },
    xzcat: { run: compressor("xz", ".xz", true, true) },
    zip: { run: zipRun },
    unzip: { run: unzipRun },
    chmod: { run: chmodRun },
    chown: { run: chownRun("chown") },
    chgrp: { run: chownRun("chgrp") }
};

// ---- Filtri dal motore di Pipe Dreams ----
// Gli argomenti che non sono opzioni (né valori di opzioni) sono i file da leggere; il testo dei
// file (o lo stdin) diventa la lista di righe che il comando di Pipe Dreams elabora.
const PD_FILTERS = { sort: "tk", uniq: "", cut: "dfc", nl: "bsvw", tac: "", rev: "", sed: "e", tr: null };

Object.entries(PD_FILTERS).forEach(([name, valued]) => {
    SIM_COMMANDS[name] = {
        run: (sh, args, stdin) => {
            const res = simOutput();
            const options = [];
            const files = [];
            if (valued === null) {
                options.push(...args);
            } else {
                let scriptSeen = name !== "sed";
                for (let i = 0; i < args.length; i++) {
                    const arg = args[i];
                    if (arg.startsWith("-") && arg !== "-" && !(name === "sed" && !scriptSeen && !/^-[A-Za-z]+$/.test(arg))) {
                        options.push(arg);
                        // -t',' unito o -t ',' separato
                        const letter = arg[arg.length - 1];
                        if (/^-[A-Za-z]+$/.test(arg) && valued.includes(letter) && i + 1 < args.length) options.push(args[++i]);
                        if (name === "sed" && arg === "-e") scriptSeen = true;
                        continue;
                    }
                    if (!scriptSeen) {
                        options.push(arg);
                        scriptSeen = true;
                        continue;
                    }
                    files.push(arg);
                }
            }
            if (name === "uniq" && files.length > 1) throw new SimUsage("nel simulatore uniq legge un solo file (il secondo nome sarebbe il file in cui scrivere)");
            const text = simReadInputs(sh, name, files, stdin, res);
            // Pipe Dreams vuole sed -E: le espressioni di base (BRE) diventano estese
            if (name === "sed" && !options.some(option => option === "-E" || option === "-r")) {
                const index = options.findIndex(option => /^s./.test(option));
                if (index !== -1) {
                    const script = options[index];
                    const delimiter = script[1];
                    const parts = script.slice(2).split(delimiter);
                    if (parts.length === 3) options[index] = `s${delimiter}${breToEre(parts[0])}${delimiter}${parts[1]}${delimiter}${parts[2]}`;
                    options.unshift("-E");
                }
            }
            // cut -f senza -d: il separatore è il tabulatore, come in GNU cut
            if (name === "cut" && options.some(option => /^-f/.test(option)) && !options.some(option => /^-d/.test(option))) options.unshift("-d\t");
            let step;
            try {
                step = parseCommand([name, ...options]);
            } catch (error) {
                if (!(error instanceof ShellError)) throw error;
                throw new SimUsage(error.message.replace(new RegExp(`^${name}: `), "").replace(/nel gioco/g, "nel simulatore").replace(/dalla pipe/g, "dalla pipe o dai file"));
            }
            const lines = COMMANDS[step.cmd].run(textToLines(isBinary(text) ? shownText(text) : text), step.args || {});
            lines.forEach(line => {
                if (typeof line === "string") res.out += `${line}\n`;
                else res.fail(line.err);
            });
            return res;
        }
    };
});
