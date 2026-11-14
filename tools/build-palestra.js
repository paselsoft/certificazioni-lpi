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
    for (const file of ["data/exams.js", "lib/pipedreams-commands.js", "lib/pipedreams-terminal.js", "shell-sim.js", "shell-commands.js", "exercise-check.js", "exercises/010-160.js"]) {
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

function build() {
    const context = loadContext();
    const base = vm.runInContext("simBaseTree()", context);
    const exercises = vm.runInContext("EXERCISES", context).filter(exercise => exercise.exam === "010-160");
    const appLog = base.files["/var/log/app.log"].content;
    const secret = base.files["/home/luca/segreto.txt"].content;

    const cases = exercises.map(exercise => {
        const setup = exercise.setup || {};
        const body = [...homeLines(base, setup)];
        (setup.prepare || []).forEach(line => body.push(`esegui ${bashString(line)}`));
        const cwd = setup.cwd && setup.cwd !== "/home/anna" ? setup.cwd : "";
        return [
            `    ${exercise.id})`,
            `        TITOLO=${bashString(plain(exercise.title))}`,
            `        COMPITO=${bashString(plain(exercise.task))}`,
            `        PARTENZA=${bashString(cwd)}`,
            `        SOLUZIONE=${bashString(exercise.solution.join("\n"))}`,
            ...body.map(line => `        ${line}`),
            "        ;;"
        ].join("\n");
    });
    const list = exercises.map(exercise => `${exercise.id}  ${plain(exercise.title)}`).join("\n");
    const baseHome = homeLines(base, {});

    const template = fs.readFileSync(path.join(root, "palestra", "palestra.template.sh"), "utf8");
    // Sostituzioni con una funzione: nel testo ci sono $' che replace interpreterebbe
    return template
        .replace("@@ELENCO@@", () => bashString(list))
        .replace("@@APP_LOG@@", () => bashString(appLog))
        .replace("@@SEGRETO@@", () => bashString(secret))
        .replace("@@BASE@@", () => baseHome.map(line => `    ${line}`).join("\n"))
        .replace("@@ESERCIZI@@", () => cases.join("\n"));
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
