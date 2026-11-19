// Creare utenti e gruppi, nella shell simulata (obiettivo 5.2): useradd, groupadd, usermod,
// userdel, groupdel, passwd (-S, -l, -u, -d) e chpasswd. Cambiano gli utenti e i gruppi della
// shell (sh.users, sh.groups, sh.shadow) e riscrivono /etc/passwd, /etc/group e /etc/shadow.
// Come su Ubuntu: useradd senza -m non crea la home, la shell predefinita è /bin/sh, ogni utente
// ha un gruppo con il suo nome, le home nuove hanno permessi 750 e una copia di /etc/skel.
// Si carica dopo shell-commands.js, a cui aggiunge i comandi.

const SIM_DAY = () => Math.floor(SIM_START / 86400000);
const VALID_NAME = /^[a-z_][a-z0-9_-]*\$?$/;

// Riscrive i tre file degli utenti dopo una modifica (i permessi dei file restano quelli)
function simSyncAccountFiles(sh) {
    const files = { "/etc/passwd": passwdText(sh), "/etc/group": groupText(sh), "/etc/shadow": shadowText(sh) };
    for (const [path, text] of Object.entries(files)) {
        const node = simFindRaw(sh, path);
        if (!node) continue;
        node.data = text;
        node.mtime = sh.clock;
    }
}

// Solo root può cambiare gli utenti: gli altri ricevono l'errore di useradd e compagni
function needRoot(sh, name) {
    if (sh.user === "root") return null;
    return { err: `${name}: Permesso negato.\n${name}: impossibile bloccare /etc/${name.startsWith("group") ? "group" : "passwd"}; riprovare più tardi.\n`, code: 1 };
}

const usedUids = sh => new Set(Object.values(sh.users).map(user => user.uid));
const usedGids = sh => new Set(Object.values(sh.groups));
// Il primo numero libero: da 1000 in su per gli utenti normali, da 999 in giù per quelli di sistema
function freeId(used, system) {
    if (system) {
        for (let id = 999; id >= 100; id--) if (!used.has(id)) return id;
    }
    for (let id = 1000; ; id++) if (!used.has(id)) return id;
}

// Le opzioni con un valore (-d HOME) e quelle senza (-m), anche unite: -mG gruppo
function accountOptions(args, letters, valued) {
    const flags = {}, values = {}, operands = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (/^-[A-Za-z]+$/.test(arg)) {
            for (let j = 1; j < arg.length; j++) {
                const letter = arg[j];
                if (valued.includes(letter)) {
                    const value = arg.slice(j + 1) || args[++i];
                    if (value === undefined) return { error: `l'opzione -${letter} vuole un valore` };
                    values[letter] = value;
                    break;
                }
                if (!letters.includes(letter)) return { error: `opzione non valida: -${letter}` };
                flags[letter] = true;
            }
        } else {
            operands.push(arg);
        }
    }
    return { flags, values, operands };
}

// Crea la home di un utente copiando /etc/skel (con i file nascosti), di sua proprietà, con permessi 750
function createHome(sh, name, home) {
    const user = sh.users[name];
    const existing = simFindRaw(sh, home);
    if (existing) return `useradd: attenzione: la directory home esiste già.\nuseradd: non verrà copiato alcun file dalla directory skel.\n`;
    const parentPath = home.replace(/\/[^/]+\/?$/, "") || "/";
    const parent = simFindRaw(sh, parentPath);
    if (!parent || parent.type !== "d") return `useradd: impossibile creare la directory ${home}\n`;
    const copy = (source, target) => {
        const node = { ...source, owner: name, group: user.groups[0], mtime: sh.clock };
        if (source.type === "d") {
            node.children = Object.create(null);
            Object.entries(source.children).forEach(([child, item]) => { node.children[child] = copy(item, node); });
        }
        return node;
    };
    const skel = simFindRaw(sh, "/etc/skel") || simNode("d", null);
    const node = copy(skel, null);
    node.mode = 0o750;
    parent.children[home.split("/").filter(Boolean).pop()] = node;
    parent.mtime = sh.clock;
    return "";
}

function useraddRun(sh, args) {
    const denied = needRoot(sh, "useradd");
    if (denied) return denied;
    const { flags, values, operands, error } = accountOptions(args, "mMrN", "dsgGcu");
    if (error) return { err: `useradd: ${error}\nUso: useradd [-m] [-d HOME] [-s SHELL] [-c COMMENTO] [-g GRUPPO] [-G GRUPPI] [-u UID] [-r] NOME\n`, code: 2 };
    if (operands.length !== 1) return { err: "Uso: useradd [-m] [-d HOME] [-s SHELL] [-c COMMENTO] [-g GRUPPO] [-G GRUPPI] [-u UID] [-r] NOME\n", code: 2 };
    const name = operands[0];
    if (!VALID_NAME.test(name) || name.length > 32) return { err: `useradd: nome utente «${name}» non valido (minuscole, cifre, - e _, senza iniziare con una cifra)\n`, code: 3 };
    if (sh.users[name]) return { err: `useradd: l'utente «${name}» esiste già\n`, code: 9 };
    const extra = values.G ? values.G.split(",") : [];
    for (const group of [values.g, ...extra].filter(Boolean)) {
        if (sh.groups[group] === undefined && !Object.entries(sh.groups).some(([, gid]) => String(gid) === group)) return { err: `useradd: il gruppo «${group}» non esiste\n`, code: 6 };
    }
    let uid;
    if (values.u !== undefined) {
        uid = Number(values.u);
        if (!/^\d+$/.test(values.u)) return { err: `useradd: UID «${values.u}» non valido\n`, code: 3 };
        if (usedUids(sh).has(uid)) return { err: `useradd: UID ${uid} non unico\n`, code: 4 };
    } else {
        uid = freeId(usedUids(sh), flags.r);
    }
    // Il gruppo principale: quello indicato con -g, altrimenti un gruppo nuovo con lo stesso nome
    let primary = values.g;
    if (primary && /^\d+$/.test(primary)) primary = Object.keys(sh.groups).find(group => String(sh.groups[group]) === primary);
    if (!primary) {
        if (sh.groups[name] !== undefined) return { err: `useradd: il gruppo ${name} esiste. Se si vuole aggiungere questo utente a quel gruppo, usare -g.\n`, code: 9 };
        const gid = usedGids(sh).has(uid) ? freeId(usedGids(sh), flags.r) : uid;
        sh.groups[name] = gid;
        primary = name;
    }
    const home = values.d || `/home/${name}`;
    sh.users[name] = { uid, gid: sh.groups[primary], home, shell: values.s || "/bin/sh", groups: [primary, ...extra.filter(group => group !== primary)], name: values.c ?? "" };
    sh.shadow[name] = { hash: "!", day: SIM_DAY() };
    let err = "";
    if (flags.m && !flags.M) err = createHome(sh, name, home);
    simSyncAccountFiles(sh);
    return { err };
}

function groupaddRun(sh, args) {
    const denied = needRoot(sh, "groupadd");
    if (denied) return denied;
    const { flags, values, operands, error } = accountOptions(args, "rf", "g");
    if (error || operands.length !== 1) return { err: `${error ? `groupadd: ${error}\n` : ""}Uso: groupadd [-g GID] [-r] NOME\n`, code: 2 };
    const name = operands[0];
    if (!VALID_NAME.test(name)) return { err: `groupadd: «${name}» non è un nome di gruppo valido\n`, code: 3 };
    if (sh.groups[name] !== undefined) {
        if (flags.f) return {};
        return { err: `groupadd: il gruppo «${name}» esiste già\n`, code: 9 };
    }
    let gid;
    if (values.g !== undefined) {
        gid = Number(values.g);
        if (!/^\d+$/.test(values.g)) return { err: `groupadd: GID «${values.g}» non valido\n`, code: 3 };
        if (usedGids(sh).has(gid)) return { err: `groupadd: GID «${gid}» già esistente\n`, code: 4 };
    } else {
        gid = freeId(usedGids(sh), flags.r);
    }
    sh.groups[name] = gid;
    simSyncAccountFiles(sh);
    return {};
}

function usermodRun(sh, args) {
    const denied = needRoot(sh, "usermod");
    if (denied) return denied;
    const { flags, values, operands, error } = accountOptions(args, "aLU", "GgscdlU".replace("U", ""));
    if (error || operands.length !== 1) return { err: `${error ? `usermod: ${error}\n` : ""}Uso: usermod [-a -G GRUPPI] [-g GRUPPO] [-s SHELL] [-c COMMENTO] [-d HOME] [-L] [-U] NOME\n`, code: 2 };
    const name = operands[0];
    const user = sh.users[name];
    if (!user) return { err: `usermod: l'utente «${name}» non esiste\n`, code: 6 };
    if (flags.a && !values.G) return { err: "usermod: l'opzione -a (append) si usa solo con -G\n", code: 2 };
    for (const group of [values.g, ...(values.G ? values.G.split(",") : [])].filter(Boolean)) {
        if (sh.groups[group] === undefined) return { err: `usermod: il gruppo «${group}» non esiste\n`, code: 6 };
    }
    if (values.g) {
        user.groups = [values.g, ...user.groups.slice(1).filter(group => group !== values.g)];
        user.gid = sh.groups[values.g];
    }
    // -G senza -a SOSTITUISCE i gruppi secondari: quelli che non sono nell'elenco si perdono
    if (values.G) {
        const listed = values.G.split(",");
        const secondary = flags.a ? [...user.groups.slice(1), ...listed] : listed;
        user.groups = [user.groups[0], ...secondary.filter((group, index) => group !== user.groups[0] && secondary.indexOf(group) === index)];
    }
    if (values.s) user.shell = values.s;
    if (values.c !== undefined) user.name = values.c;
    if (values.d) user.home = values.d;
    const entry = sh.shadow[name];
    const hashOf = item => typeof item === "object" ? item.hash : item || "!";
    if (flags.L) sh.shadow[name] = { hash: `!${hashOf(entry).replace(/^!/, "")}`, day: typeof entry === "object" ? entry.day : SIM_SHADOW_DAY };
    if (flags.U) sh.shadow[name] = { hash: hashOf(entry).replace(/^!/, "") || "!", day: typeof entry === "object" ? entry.day : SIM_SHADOW_DAY };
    simSyncAccountFiles(sh);
    return {};
}

// I processi degli utenti collegati (shell-system.js): non si possono eliminare
const loggedIn = name => SIM_PROCESSES.find(process => process.user === name && process.comm === "bash");

function userdelRun(sh, args) {
    const denied = needRoot(sh, "userdel");
    if (denied) return denied;
    const { flags, operands, error } = accountOptions(args, "rf", "");
    if (error || operands.length !== 1) return { err: `${error ? `userdel: ${error}\n` : ""}Uso: userdel [-r] NOME\n`, code: 2 };
    const name = operands[0];
    const user = sh.users[name];
    if (!user) return { err: `userdel: l'utente «${name}» non esiste\n`, code: 6 };
    const process = loggedIn(name);
    if (process && !flags.f) return { err: `userdel: l'utente ${name} è attualmente usato dal processo ${process.pid}\n`, code: 8 };
    if (name === "root") return { err: "userdel: nel simulatore root non si elimina\n", code: 8 };
    let err = "";
    if (flags.r) {
        const parentPath = user.home.replace(/\/[^/]+\/?$/, "") || "/";
        const parent = simFindRaw(sh, parentPath);
        const homeName = user.home.split("/").filter(Boolean).pop();
        if (parent && parent.children && parent.children[homeName]) {
            delete parent.children[homeName];
            parent.mtime = sh.clock;
        } else {
            err = `userdel: directory ${user.home} non trovata\n`;
        }
    }
    // I file rimasti mostrano il numero dell'utente al posto del nome, come su un sistema vero
    const walk = node => {
        if (node.owner === name) node.owner = String(user.uid);
        if (node.type === "d") Object.values(node.children).forEach(walk);
    };
    walk(sh.root);
    delete sh.users[name];
    delete sh.shadow[name];
    // Il gruppo con lo stesso nome se ne va con l'utente, se nessun altro lo usa come principale
    if (sh.groups[name] !== undefined && !Object.values(sh.users).some(other => other.groups[0] === name)) {
        const gid = sh.groups[name];
        delete sh.groups[name];
        Object.values(sh.users).forEach(other => { other.groups = other.groups.filter(group => group !== name); });
        const walkGroups = node => {
            if (node.group === name) node.group = String(gid);
            if (node.type === "d") Object.values(node.children).forEach(walkGroups);
        };
        walkGroups(sh.root);
    }
    simSyncAccountFiles(sh);
    return { err };
}

function groupdelRun(sh, args) {
    const denied = needRoot(sh, "groupdel");
    if (denied) return denied;
    if (args.length !== 1 || args[0].startsWith("-")) return { err: "Uso: groupdel NOME\n", code: 2 };
    const name = args[0];
    if (sh.groups[name] === undefined) return { err: `groupdel: il gruppo «${name}» non esiste\n`, code: 6 };
    const owner = Object.entries(sh.users).find(([, user]) => user.groups[0] === name);
    if (owner) return { err: `groupdel: impossibile rimuovere il gruppo primario dell'utente «${owner[0]}»\n`, code: 8 };
    delete sh.groups[name];
    Object.values(sh.users).forEach(user => { user.groups = user.groups.filter(group => group !== name); });
    simSyncAccountFiles(sh);
    return {};
}

// passwd: la password vera non si può digitare nel simulatore; -S, -l, -u e -d sì
function passwdRun(sh, args) {
    const { flags, operands, error } = accountOptions(args, "Slud", "");
    if (error) return { err: `passwd: ${error}\n`, code: 2 };
    const name = operands[0] || sh.user;
    if (!sh.users[name]) return { err: `passwd: l'utente «${name}» non esiste\n`, code: 1 };
    const other = name !== sh.user;
    if ((other || flags.l || flags.u || flags.d) && sh.user !== "root") return { err: `passwd: Permesso negato.\n`, code: 1 };
    const entry = sh.shadow[name];
    const hash = typeof entry === "object" ? entry.hash : entry || "!";
    const day = typeof entry === "object" ? entry.day : SIM_SHADOW_DAY;
    if (flags.S) {
        const status = hash === "" ? "NP" : hash.startsWith("!") || hash === "*" ? "L" : "P";
        const date = new Date(day * 86400000).toISOString().slice(0, 10);
        return { out: `${name} ${status} ${date} 0 99999 7 -1\n` };
    }
    if (flags.l) {
        sh.shadow[name] = { hash: `!${hash.replace(/^!/, "")}`, day };
        simSyncAccountFiles(sh);
        return { out: "passwd: informazioni sulla scadenza della password modificate.\n" };
    }
    if (flags.u) {
        if (hash === "!" || hash === "!*") return { err: "passwd: sbloccare la password lascerebbe l'account senza password\npasswd: password non modificata.\n", code: 3 };
        sh.shadow[name] = { hash: hash.replace(/^!/, ""), day };
        simSyncAccountFiles(sh);
        return { out: "passwd: informazioni sulla scadenza della password modificate.\n" };
    }
    if (flags.d) {
        sh.shadow[name] = { hash: "", day: SIM_DAY() };
        simSyncAccountFiles(sh);
        return { out: "passwd: informazioni sulla scadenza della password modificate.\n" };
    }
    return {
        out: `Cambio password per ${name}.\n`,
        err: `passwd: nel simulatore la password non si può digitare. Per impostarla senza digitarla: echo '${name}:NUOVAPASSWORD' | sudo chpasswd\n(su un sistema vero passwd la chiede due volte, senza mostrarla mentre la scrivi)\n`,
        code: 1
    };
}

// Una stringa che sembra un hash SHA-512 (non lo è: il simulatore non cifra niente)
function fakeHash(name, password) {
    let value = 0;
    for (const c of `${name}:${password}`) value = (Math.imul(value, 31) + c.charCodeAt(0)) >>> 0;
    const letters = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let text = "";
    for (let i = 0; i < 22; i++) {
        value = (Math.imul(value, 1103515245) + 12345) >>> 0;
        text += letters[(value >>> 16) % 64];
    }
    return `$6$${text.slice(0, 8)}$${text.slice(8)}`;
}

// chpasswd: legge righe UTENTE:PASSWORD dallo stdin (solo root)
function chpasswdRun(sh, args, stdin) {
    if (sh.user !== "root") return { err: "chpasswd: Permesso negato.\n", code: 1 };
    const lines = (stdin || "").split("\n").filter(Boolean);
    if (!lines.length) return { err: "chpasswd: niente da leggere: si usa così, echo 'utente:password' | sudo chpasswd\n", code: 1 };
    let err = "", code = 0;
    lines.forEach((line, index) => {
        const at = line.indexOf(":");
        const name = at === -1 ? "" : line.slice(0, at);
        if (at === -1 || !sh.users[name]) {
            err += `chpasswd: riga ${index + 1}: ${at === -1 ? "manca il carattere «:»" : `l'utente «${name}» non esiste`}\n`;
            code = 1;
            return;
        }
        sh.shadow[name] = { hash: fakeHash(name, line.slice(at + 1)), day: SIM_DAY() };
    });
    simSyncAccountFiles(sh);
    return { err, code };
}

Object.assign(SIM_COMMANDS, {
    useradd: { run: useraddRun },
    groupadd: { run: groupaddRun },
    usermod: { run: usermodRun },
    userdel: { run: userdelRun },
    groupdel: { run: groupdelRun },
    passwd: { run: passwdRun },
    chpasswd: { run: chpasswdRun }
});
["useradd", "userdel", "groupadd", "passwd"].forEach(name => delete SIM_UNAVAILABLE[name]);
