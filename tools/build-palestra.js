// Scrive palestra/palestra.sh: lo script che porta gli esercizi al terminale su un Linux vero
// (per esempio Linux Mint in VirtualBox). Lo script crea l'utente anna con la stessa home del
// simulatore e il comando lpi-esercizio, che prepara la home per un esercizio e ne mostra il
// compito. I file vengono dal simulatore (shell-sim.js, simBaseTree) e da exercises/010-160.js:
// rigenerare lo script dopo ogni modifica degli esercizi.
// Uso: node tools/build-palestra.js [--check]   (--check: controlla che lo script sia aggiornato)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const target = path.join(root, "palestra", "palestra.sh");

function loadContext() {
    const context = vm.createContext({ TextEncoder });
    for (const file of ["data/exams.js", "lib/pipedreams-commands.js", "lib/pipedreams-terminal.js", "shell-sim.js", "shell-commands.js", "shell-help.js", "shell-system.js", "shell-network.js", "shell-users.js", "shell-accounts.js", "shell-editor.js", "shell-packages.js", "exercise-check.js", "exercises/010-160.js"]) {
        vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
    }
    return context;
}

// Una stringa per Bash, tra virgolette $'...'
const bashString = text => "$'" + text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\t/g, "\\t") + "'";
const quote = text => /^[\w./@%+-]+$/.test(text) ? text : bashString(text);
const plain = text => text.replace(/`/g, "");
const HOME = "/home/anna/";
const DEFAULT_AGE = 60 * 24 * 3;

// Le righe che ricreano la home di anna: directory, file e link, con permessi ed età (in minuti)
function homeLines(base, setup) {
    const lines = [];
    const under = list => Object.entries(list || {}).filter(([p]) => p.startsWith(HOME)).map(([p, spec]) => [p.slice(HOME.length), spec]);
    const spec = value => typeof value === "string" ? { content: value } : value || {};
    const dirs = new Map();
    [...under(base.dirs), ...under(setup.dirs)].forEach(([p, s]) => dirs.set(p, spec(s)));
    // Le directory intermedie dei file
    [...under(base.files), ...under(setup.files), ...under(base.links), ...under(setup.links)].forEach(([p]) => {
        const parts = p.split("/").slice(0, -1);
        // (nel simulatore nascono adesso, come con mkdir -p)
        parts.forEach((_, i) => { const d = parts.slice(0, i + 1).join("/"); if (!dirs.has(d)) dirs.set(d, { age: 0 }); });
    });
    [...dirs.keys()].sort().forEach(d => lines.push(`cartella ${quote(d)}`));
    const files = new Map();
    [...under(base.files), ...under(setup.files)].forEach(([p, s]) => files.set(p, spec(s)));
    [...files.keys()].sort().forEach(p => {
        if (p.split("/").pop().startsWith(".")) return; // .bashrc: resta quello del sistema
        const s = files.get(p);
        lines.push(`file ${quote(p)} ${s.mode || "644"} ${s.age === undefined ? DEFAULT_AGE : s.age} ${bashString(s.content || "")}`);
    });
    [...under(base.links), ...under(setup.links)].forEach(([p, s]) => lines.push(`collegamento ${quote(p)} ${quote(typeof s === "string" ? s : s.target)}`));
    // Le date delle directory alla fine, dalla più profonda (creare un file cambia la data della directory)
    [...dirs.keys()].sort().reverse().forEach(d => {
        const s = dirs.get(d);
        lines.push(`data ${quote(d)} ${s.mode || "755"} ${s.age === undefined ? DEFAULT_AGE : s.age}`);
    });
    return lines;
}

// I controlli di «lpi-esercizio verifica» per gli obiettivi di un esercizio. Su un Linux vero un
// programma separato vede i file, la directory corrente, le variabili esportate, gli utenti e i
// gruppi; non vede che cosa è comparso sullo schermo né i comandi scritti: quegli obiettivi
// vanno controllati a occhio
function verifyLines(exercise) {
    return exercise.goals.map(goal => {
        const text = bashString(plain(goal.text));
        if (goal.output !== undefined || goal.command !== undefined || goal.history !== undefined || goal.noErrors) return `occhio ${text}`;
        if (goal.cwd !== undefined) return `controlla_cwd ${text} ${quote(goal.cwd)}`;
        if (goal.user !== undefined) return `controlla_utente_shell ${text} ${quote(goal.user)}`;
        if (goal.variable !== undefined) {
            // Il PATH vero è diverso da quello del simulatore: conta la directory aggiunta in fondo
            if (goal.variable === "PATH") return `controlla_path ${text} ${quote(goal.value.split(":").pop())}`;
            if (!goal.exported) return `occhio ${text}`;
            return `controlla_variabile ${text} ${quote(goal.variable)} ${bashString(goal.value)}`;
        }
        if (goal.package !== undefined) return `controlla_pacchetto ${text} ${quote(goal.package)} ${goal.state}`;
        if (goal.account !== undefined) {
            const checks = [];
            if (goal.exists === false) checks.push("esiste=no");
            if (goal.shell !== undefined) checks.push(`shell=${goal.shell}`);
            if (goal.comment !== undefined) checks.push(`commento=${goal.comment}`);
            if (goal.uidBelow !== undefined) checks.push(`uidsotto=${goal.uidBelow}`);
            if (goal.groups !== undefined) checks.push(`gruppi=${goal.groups.join(",")}`);
            if (goal.locked !== undefined) checks.push(`bloccato=${goal.locked ? "si" : "no"}`);
            if (goal.password) checks.push("password=si");
            return `controlla_account ${text} ${quote(goal.account)} ${checks.map(bashString).join(" ")}`.trimEnd();
        }
        if (goal.group !== undefined && goal.path === undefined) {
            const checks = [];
            if (goal.exists === false) checks.push("esiste=no");
            if (goal.gid !== undefined) checks.push(`gid=${goal.gid}`);
            return `controlla_gruppo ${text} ${quote(goal.group)} ${checks.join(" ")}`.trimEnd();
        }
        if (goal.path !== undefined) {
            const checks = [];
            if (goal.is !== undefined) checks.push(`tipo=${goal.is}`);
            // realContent: il comando che produce il contenuto giusto su un sistema vero
            if (goal.realContent !== undefined) checks.push(`contenutocome=${goal.realContent}`);
            else if (goal.content !== undefined) checks.push(`contenuto=${goal.content}`);
            if (goal.mode !== undefined) checks.push(`permessi=${goal.mode}`);
            if (goal.modeHas !== undefined) checks.push(`permessiconti=${goal.modeHas}`);
            if (goal.owner !== undefined) checks.push(`proprietario=${goal.owner}`);
            if (goal.target !== undefined) checks.push(`destinazione=${goal.target}`);
            if (goal.sameAs !== undefined) checks.push(`stessidati=${goal.sameAs}`);
            if (goal.archive !== undefined) checks.push(`archivio=${goal.archive}`);
            if (goal.has !== undefined) checks.push(`contiene=${goal.has.join(",")}`);
            return `controlla_file ${text} ${quote(goal.path)} ${checks.map(bashString).join(" ")}`.trimEnd();
        }
        return `occhio ${text}`;
    });
}

function build() {
    const context = loadContext();
    const base = vm.runInContext("simBaseTree()", context);
    const exercises = vm.runInContext("EXERCISES", context).filter(exercise => exercise.exam === "010-160");
    const appLog = base.files["/var/log/app.log"].content;
    const secret = base.files["/home/luca/segreto.txt"].content;

    const cases = exercises.map(exercise => {
        const setup = exercise.setup || {};
        const body = [...homeLines(base, setup)];
        // I comandi con sudo (creare utenti e gruppi) cambierebbero il sistema vero: la palestra non
        // li esegue da sola, li mostra prima del compito
        const prepare = setup.prepare || [];
        prepare.filter(line => !/^sudo\b/.test(line)).forEach(line => body.push(`esegui ${bashString(line)}`));
        const first = prepare.filter(line => /^sudo\b/.test(line));
        const cwd = setup.cwd && setup.cwd !== "/home/anna" ? setup.cwd : "";
        return [
            `    ${exercise.id})`,
            `        TITOLO=${bashString(plain(exercise.title))}`,
            `        COMPITO=${bashString(plain(exercise.task))}`,
            `        PARTENZA=${bashString(cwd)}`,
            `        PRIMA=${bashString(first.join("\n"))}`,
            `        SOLUZIONE=${bashString(exercise.solution.join("\n"))}`,
            ...body.map(line => `        ${line}`),
            "        ;;"
        ].join("\n");
    });
    const checks = exercises.map(exercise => [`    ${exercise.id})`, ...verifyLines(exercise).map(line => `        ${line}`), "        ;;"].join("\n"));
    const list = exercises.map(exercise => `${exercise.id}  ${plain(exercise.title)}`).join("\n");
    const baseHome = homeLines(base, {});

    const template = fs.readFileSync(path.join(root, "palestra", "palestra.template.sh"), "utf8");
    // Sostituzioni con una funzione: nel testo ci sono $' che replace interpreterebbe
    return template
        .replace("@@ELENCO@@", () => bashString(list))
        .replace("@@APP_LOG@@", () => bashString(appLog))
        .replace("@@SEGRETO@@", () => bashString(secret))
        .replace("@@BASE@@", () => baseHome.map(line => `    ${line}`).join("\n"))
        .replace("@@ESERCIZI@@", () => cases.join("\n"))
        .replace("@@VERIFICHE@@", () => checks.join("\n"));
}

if (require.main === module) {
    const script = build();
    if (process.argv.includes("--check")) {
        const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
        if (current !== script) {
            console.error("palestra/palestra.sh non è aggiornato: esegui node tools/build-palestra.js");
            process.exit(1);
        }
        console.log("palestra/palestra.sh è aggiornato");
    } else {
        fs.writeFileSync(target, script, { mode: 0o755 });
        console.log(`Scritto ${path.relative(root, target)}`);
    }
}

module.exports = { build, loadContext };
