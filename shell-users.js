// Utenti e sicurezza di base, nella shell simulata (obiettivo 5.1): chi è collegato (who, w), gli
// accessi passati (last, lastb), sudo (anche -l, -u, -i, -s e sudo su) e su, con una shell dentro
// l'altra da cui si esce con exit; getent. Gli accessi sono finti e fissi, coerenti con i processi
// di shell-system.js: anna e luca sono collegati via ssh da 192.168.1.20.
// Si carica dopo shell-commands.js, a cui aggiunge i comandi.

// Le sessioni: utente, terminale, da dove, minuti fa (inizio) e durata in minuti (null: ancora aperta)
const SIM_LOGINS = [
    { user: "anna", tty: "tty1", from: "", ago: 60 * 24 * 9 + 90, minutes: 215 },
    { user: "anna", tty: "pts/0", from: "192.168.1.20", ago: 60 * 24 * 3 + 210, minutes: 95 },
    { user: "reboot", tty: "system boot", from: "6.8.0-49-generic", ago: 2 * 24 * 60 + 48, minutes: null },
    { user: "anna", tty: "pts/0", from: "192.168.1.20", ago: 60 * 24 + 1018, minutes: 98 },
    { user: "luca", tty: "pts/1", from: "192.168.1.20", ago: 95, minutes: null },
    { user: "anna", tty: "pts/0", from: "192.168.1.20", ago: 12, minutes: null }
];
// I tentativi falliti (lastb, solo root): quello di sshd in /var/log/auth.log
const SIM_BAD_LOGINS = [{ user: "admin", tty: "ssh:notty", from: "203.0.113.7", ago: 31, minutes: 0 }];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad2 = number => String(number).padStart(2, "0");
const loginClock = date => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
const isoMinute = date => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${loginClock(date)}`;
const loginDate = login => new Date(SIM_START - login.ago * 60000);

// Chi è collegato adesso: le sessioni ancora aperte (non il riavvio)
const openSessions = () => SIM_LOGINS.filter(login => login.minutes === null && login.user !== "reboot").sort((a, b) => a.tty.localeCompare(b.tty));

function whoRun(sh, args) {
    const words = args.filter(arg => !arg.startsWith("-"));
    const flags = args.filter(arg => arg.startsWith("-")).join("");
    if (flags && !/^(-[Hbq])+$/.test(flags.replace(/-/g, "-"))) return { err: "who: nel simulatore ci sono le opzioni -H, -b e -q (e «who am i»)\n", code: 1 };
    if (flags.includes("b")) return { out: `         system boot  ${isoMinute(new Date(SIM_START - (2 * 24 * 60 + 48) * 60000))}\n` };
    let list = openSessions();
    // who am i: solo la sessione di questo terminale
    if (words.length === 2) list = list.filter(login => login.tty === "pts/0").map(login => ({ ...login, user: (sh.sessions && sh.sessions.length ? sh.sessions[0].user : sh.user) }));
    if (flags.includes("q")) return { out: `${list.map(login => login.user).join(" ")}\n# users=${list.length}\n` };
    const lines = list.map(login => `${login.user.padEnd(8)} ${login.tty.padEnd(12)} ${isoMinute(loginDate(login))} (${login.from})`);
    if (flags.includes("H")) lines.unshift("NAME     LINE         TIME             COMMENT");
    return { out: lines.length ? lines.join("\n") + "\n" : "" };
}

// w: chi è collegato e che cosa sta facendo, con l'intestazione di uptime
function wRun(sh, args) {
    const only = args.find(arg => !arg.startsWith("-"));
    const header = args.includes("-h");
    const what = { "pts/0": "w", "pts/1": "top" };
    const idle = { "pts/0": "0.00s", "pts/1": "1:12m" };
    const cpu = { "pts/0": ["0.04s", "0.00s"], "pts/1": ["0.31s", "0.30s"] };
    let list = openSessions();
    if (only) list = list.filter(login => login.user === only);
    const lines = header ? [] : [uptimeLine(sh), "USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU  WHAT"];
    list.forEach(login => lines.push(`${login.user.padEnd(8)} ${login.tty.padEnd(8)} ${login.from.padEnd(16)} ${loginClock(loginDate(login)).padEnd(8)} ${idle[login.tty].padStart(5)}  ${cpu[login.tty][0].padStart(5)}  ${cpu[login.tty][1].padStart(5)}  ${what[login.tty]}`));
    return { out: lines.join("\n") + "\n" };
}

function lastLines(list, filter, count) {
    let rows = [...list].sort((a, b) => a.ago - b.ago);
    if (filter.length) rows = rows.filter(login => filter.includes(login.user) || filter.includes(login.tty));
    if (count !== null) rows = rows.slice(0, count);
    return rows.map(login => {
        const start = loginDate(login);
        const when = `${DAYS[start.getDay()]} ${MONTHS[start.getMonth()]} ${String(start.getDate()).padStart(2)} ${loginClock(start)}`;
        let end;
        if (login.minutes === null) end = login.user === "reboot" ? "  still running" : "  still logged in";
        else {
            const stop = new Date(start.getTime() + login.minutes * 60000);
            end = ` - ${loginClock(stop)}  (${pad2(Math.floor(login.minutes / 60))}:${pad2(login.minutes % 60)})`;
        }
        return `${login.user.padEnd(8)} ${login.tty.padEnd(12)} ${login.from.padEnd(16)} ${when}${end}`;
    });
}

function lastRun(sh, args, name) {
    let count = null;
    const filter = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-n") count = Number(args[++i]);
        else if (/^-\d+$/.test(args[i])) count = Number(args[i].slice(1));
        else if (args[i].startsWith("-")) return { err: `${name}: nel simulatore c'è l'opzione -n NUMERO (per esempio ${name} -n 3)\n`, code: 1 };
        else filter.push(args[i]);
    }
    if (name === "lastb" && sh.user !== "root") return { err: "lastb: /var/log/btmp: Permesso negato (i tentativi falliti li legge solo root: sudo lastb)\n", code: 1 };
    const rows = lastLines(name === "lastb" ? SIM_BAD_LOGINS : SIM_LOGINS, filter, count);
    const begins = new Date(SIM_START - (60 * 24 * 11) * 60000);
    const file = name === "lastb" ? "btmp" : "wtmp";
    return { out: `${rows.join("\n")}${rows.length ? "\n" : ""}\n${file} begins ${DAYS[begins.getDay()]} ${MONTHS[begins.getMonth()]} ${String(begins.getDate()).padStart(2)} 09:00:12 ${begins.getFullYear()}\n` };
}

// getent passwd|group [NOME]: le righe dei database degli utenti e dei gruppi
function getentRun(sh, args) {
    const [database, key] = args;
    if (!["passwd", "group", "shadow"].includes(database)) return { err: "getent: nel simulatore ci sono i database passwd, group e shadow (per esempio getent passwd anna)\n", code: 1 };
    if (database === "shadow" && sh.user !== "root") return { code: 2 };
    const text = database === "passwd" ? passwdText(sh) : database === "group" ? groupText(sh) : shadowText(sh);
    const lines = text.trim().split("\n").filter(line => !key || line.split(":")[0] === key || line.split(":")[2] === key);
    if (!lines.length) return { code: 2 };
    return { out: lines.join("\n") + "\n" };
}

// ---- Cambiare utente: su e sudo ----

// Una shell nuova di un altro utente, dentro quella di prima: exit la chiude e torna indietro.
// login (su -, sudo -i): la home dell'utente e le sue variabili; altrimenti si resta nella directory
function startSession(sh, user, login) {
    const info = usersOf(sh)[user];
    if (!info) return { err: `su: l'utente ${user} non esiste\n`, code: 1 };
    if (/nologin|false/.test(info.shell)) return { out: "This account is currently not available.\n", code: 1 };
    sh.sessions = sh.sessions || [];
    sh.sessions.push({ user: sh.user, cwd: sh.cwd, vars: { ...sh.vars }, exported: new Set(sh.exported) });
    sh.user = user;
    Object.assign(sh.vars, { HOME: info.home, SHELL: info.shell, USER: user, LOGNAME: user });
    if (login) {
        sh.cwd = info.home;
        sh.vars.PWD = info.home;
        sh.vars.OLDPWD = undefined;
        delete sh.vars.OLDPWD;
    }
    return {};
}

// exit in una shell aperta con su o sudo: si torna a quella di prima
function endSession(sh) {
    const previous = sh.sessions.pop();
    sh.user = previous.user;
    sh.cwd = previous.cwd;
    sh.vars = previous.vars;
    sh.exported = previous.exported;
    return { out: "logout\n" };
}

// asRoot: su lanciato con sudo, che non chiede password
function suRun(sh, args, asRoot = false) {
    let login = false, command = null;
    const words = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-" || args[i] === "-l" || args[i] === "--login") login = true;
        else if (args[i] === "-c") command = args[++i];
        else if (args[i].startsWith("-")) return { err: `su: nel simulatore ci sono «-» (o -l) e -c COMANDO\n`, code: 1 };
        else words.push(args[i]);
    }
    const user = words[0] || "root";
    if (!usersOf(sh)[user]) return { err: `su: l'utente ${user} non esiste o la voce utente non contiene tutti i campi richiesti\n`, code: 1 };
    // Da root su non chiede password; agli altri chiederebbe quella dell'utente di destinazione
    if (sh.user !== "root" && !asRoot) {
        return { err: `Password: \nsu: nel simulatore la password non si può scrivere. Chi ha i permessi di amministratore usa sudo: sudo su - ${user === "root" ? "" : user}`.trimEnd() + (user === "root" ? " (oppure sudo -i)" : "") + "\n", code: 1 };
    }
    if (command !== null) return suCommand(sh, user, command);
    return startSession(sh, user, login);
}

// su -c COMANDO UTENTE: un comando solo, come quell'utente
function suCommand(sh, user, command) {
    const saved = sh.user;
    sh.user = user;
    try {
        const display = [];
        let list;
        try {
            list = simParse(command);
        } catch (error) {
            if (!(error instanceof SimSyntaxError)) throw error;
            return { err: `${error.message}\n`, code: 2 };
        }
        simRunList(sh, list, display);
        return { chunks: display, out: display.filter(c => !c.err).map(c => c.text).join(""), err: display.filter(c => c.err).map(c => c.text).join(""), code: sh.status };
    } finally {
        sh.user = saved;
    }
}

const canSudo = (sh, user) => user === "root" || Boolean(usersOf(sh)[user] && usersOf(sh)[user].groups.includes("sudo"));

// sudo COMANDO (come root), sudo -u UTENTE COMANDO, sudo -l, sudo -i / -s / su / bash (una shell)
function simSudo(sh, args, stdin, ctx) {
    if (!args.length) return { out: "", err: "sudo: scrivi il comando da eseguire come root, per esempio sudo chown luca file\n", code: 1 };
    // Solo chi è nel gruppo sudo (lo dice /etc/sudoers) può usarlo
    if (!canSudo(sh, sh.user)) return { out: "", err: `${sh.user} is not in the sudoers file.\n`, code: 1 };
    let target = "root";
    let words = [...args];
    if (words[0] === "-l") return { out: `User ${sh.user} may run the following commands on lpi:\n    (ALL : ALL) ALL\n` };
    if (words[0] === "-u") {
        target = words[1];
        if (!target) return { err: "sudo: dopo -u serve il nome di un utente\n", code: 1 };
        if (!usersOf(sh)[target]) return { err: `sudo: unknown user ${target}\n`, code: 1 };
        words = words.slice(2);
        if (!words.length) return { err: "sudo: dopo sudo -u UTENTE scrivi il comando\n", code: 1 };
    }
    if (words[0] === "-i") return startSession(sh, target, true);
    if (words[0] === "-s" || (words[0] === "bash" && words.length === 1)) return startSession(sh, target, false);
    // sudo su [-] [UTENTE]: su eseguito da root, che non chiede password (exit riporta a chi l'ha lanciato)
    if (words[0] === "su") return suRun(sh, words.slice(1), true);
    if (words[0].startsWith("-")) return { err: `sudo: nel simulatore ci sono -l, -u UTENTE, -i e -s\n`, code: 1 };
    if (SIM_BUILTINS.has(words[0])) return { out: "", err: `sudo: ${words[0]}: comando non trovato (è un comando interno della shell)\n`, code: 1 };
    const user = sh.user;
    sh.user = target;
    try {
        return simExecute(sh, words, stdin, ctx);
    } finally {
        sh.user = user;
    }
}

Object.assign(SIM_COMMANDS, {
    who: { run: whoRun },
    w: { run: wRun },
    last: { run: (sh, args) => lastRun(sh, args, "last") },
    lastb: { run: (sh, args) => lastRun(sh, args, "lastb") },
    getent: { run: getentRun },
    su: { run: suRun }
});
delete SIM_UNAVAILABLE.su;
