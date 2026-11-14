// Controlla palestra/palestra.sh (lo script per esercitarsi su un Linux vero, scritto da
// tools/build-palestra.js):
//   1. è aggiornato rispetto agli esercizi;
//   2. per ogni esercizio prepara una home uguale a quella del simulatore: stessi file e
//      directory, stessi contenuti e permessi, stesse età (al minuto); gli archivi creati prima
//      dell'esercizio ci sono e contengono i file giusti;
//   3. senza LPI_CASA si rifiuta di lavorare per un utente che non sia anna;
//   4. elenco, soluzione e codice sconosciuto.
// Con --installa (serve root, su un sistema di prova come la CI): installa la palestra davvero,
// poi da anna prepara ogni esercizio, esegue la soluzione (tranne bash: false) e la disinstalla.
// Uso: node tools/check-palestra.js [--installa]
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");
const { build, loadContext } = require("./build-palestra");

const root = path.join(__dirname, "..");
const script = path.join(root, "palestra", "palestra.sh");
const problems = [];

if (fs.readFileSync(script, "utf8") !== build()) problems.push("palestra/palestra.sh non è aggiornato: esegui node tools/build-palestra.js");

const context = loadContext();
const exercises = vm.runInContext("EXERCISES", context);

const run = (args, env = {}) => spawnSync("bash", [script, ...args], { encoding: "utf8", env: { ...process.env, LC_ALL: "C.UTF-8", ...env } });

// Il contenuto della home: percorso → { type, mode, content, age (minuti) }, senza i file nascosti
function snapshot(home, now) {
    const result = {};
    const walk = (dir, rel) => {
        fs.readdirSync(dir).sort().forEach(name => {
            if (!rel && name.startsWith(".")) return;
            const full = path.join(dir, name);
            const key = rel ? `${rel}/${name}` : name;
            const stat = fs.lstatSync(full);
            const item = { mode: (stat.mode & 0o7777).toString(8), age: Math.round((now - stat.mtimeMs) / 60000) };
            if (stat.isSymbolicLink()) Object.assign(item, { type: "l", target: fs.readlinkSync(full), mode: undefined });
            else if (stat.isDirectory()) { item.type = "d"; walk(full, key); }
            else { item.type = "f"; item.content = fs.readFileSync(full); }
            result[key] = item;
        });
    };
    walk(home, "");
    return result;
}

// La home del simulatore per un esercizio (prima dei comandi di preparazione)
function simHome(setup) {
    vm.runInContext(`SIM_START = ${Date.now()};`, context);
    return vm.runInContext(`(setup => {
        const sh = createShell(setup);
        const out = {};
        const walk = (node, rel) => Object.keys(node.children).sort().forEach(name => {
            if (!rel && name.startsWith(".")) return;
            const child = node.children[name];
            const key = rel ? rel + "/" + name : name;
            out[key] = { type: child.type, mode: child.type === "l" ? undefined : child.mode.toString(8), age: Math.round((SIM_START - child.mtime) / 60000), content: child.data, target: child.target };
            if (child.type === "d") walk(child, key);
        });
        walk(simFindRaw(sh, "/home/anna"), "");
        return out;
    })`, context)(setup);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "palestra-"));
const home = path.join(tmp, "anna");
fs.mkdirSync(home);
fs.writeFileSync(path.join(home, ".bashrc"), "# resta\n");
try {
    for (const exercise of exercises) {
        const setup = exercise.setup || {};
        // Qualcosa da togliere: deve sparire (anche una directory senza permessi)
        fs.mkdirSync(path.join(home, "avanzo", "chiusa"), { recursive: true });
        fs.chmodSync(path.join(home, "avanzo", "chiusa"), 0);
        const result = run([exercise.id], { LPI_CASA: home });
        if (result.status !== 0) { problems.push(`${exercise.id}: lo script esce con ${result.status}: ${result.stderr}`); continue; }
        if (!result.stdout.includes(exercise.title.replace(/`/g, ""))) problems.push(`${exercise.id}: il titolo non compare`);
        const now = Date.now();
        const real = snapshot(home, now);
        if (!fs.existsSync(path.join(home, ".bashrc"))) problems.push(`${exercise.id}: i file nascosti non devono sparire`);
        const expected = simHome(setup);
        // I comandi di preparazione (tar, rm) si controllano a parte: tolgono file e creano archivi
        const archives = {};
        (setup.prepare || []).forEach(line => {
            let match = line.match(/^tar -czf (\S+) (\S+)$/);
            if (match) archives[match[1]] = match[2];
            match = line.match(/^rm -r (\S+)$/);
            if (match) Object.keys(expected).filter(key => key === match[1] || key.startsWith(`${match[1]}/`)).forEach(key => delete expected[key]);
        });
        Object.entries(archives).forEach(([archive, dir]) => {
            if (!real[archive]) { problems.push(`${exercise.id}: manca l'archivio ${archive}`); return; }
            const list = spawnSync("tar", ["-tzf", path.join(home, archive)], { encoding: "utf8" }).stdout.split("\n").filter(Boolean).map(name => name.replace(/\/$/, "")).sort();
            const want = Object.keys(simHome(setup)).filter(key => key === dir || key.startsWith(`${dir}/`)).sort();
            if (JSON.stringify(list) !== JSON.stringify(want)) problems.push(`${exercise.id}: ${archive} contiene ${list.join(", ")} invece di ${want.join(", ")}`);
            delete real[archive];
        });
        const keys = [...new Set([...Object.keys(real), ...Object.keys(expected)])].sort();
        for (const key of keys) {
            const a = real[key], b = expected[key];
            if (!a) { problems.push(`${exercise.id}: manca ${key}`); continue; }
            if (!b) { problems.push(`${exercise.id}: non dovrebbe esserci ${key}`); continue; }
            if (a.type !== b.type) problems.push(`${exercise.id}: ${key} è di tipo ${a.type} invece di ${b.type}`);
            if (a.mode !== b.mode) problems.push(`${exercise.id}: ${key} ha i permessi ${a.mode} invece di ${b.mode}`);
            if (a.type === "f" && a.content.toString("utf8") !== b.content) problems.push(`${exercise.id}: ${key} ha un contenuto diverso`);
            if (a.type === "l" && a.target !== b.target) problems.push(`${exercise.id}: ${key} punta a ${a.target} invece di ${b.target}`);
            if (Math.abs(a.age - b.age) > 1) problems.push(`${exercise.id}: ${key} ha ${a.age} minuti invece di ${b.age}`);
        }
    }

    // Solo per anna: senza LPI_CASA, da un altro utente, non tocca niente
    const env = { ...process.env };
    delete env.LPI_CASA;
    const refused = spawnSync("bash", [script, "t2.3-01"], { encoding: "utf8", env });
    if (refused.status === 0 || !/solo per l'utente anna/.test(refused.stderr)) problems.push("senza LPI_CASA, da un utente diverso da anna, lo script deve rifiutarsi");

    const list = run([]);
    if (list.status !== 0 || exercises.some(exercise => !list.stdout.includes(exercise.id))) problems.push("l'elenco non contiene tutti gli esercizi");
    const solution = run(["soluzione", "t2.4-04"]);
    if (solution.status !== 0 || !solution.stdout.includes("rm -r vecchi")) problems.push(`soluzione: ${solution.stdout}${solution.stderr}`);
    const unknown = run(["t9.9-99"], { LPI_CASA: home });
    if (unknown.status === 0 || !/Non conosco/.test(unknown.stderr)) problems.push("un codice sconosciuto deve dare errore");
    const start = run(["inizio"], { LPI_CASA: home });
    const startKeys = JSON.stringify(Object.keys(snapshot(home, Date.now())).sort());
    if (start.status !== 0 || startKeys !== JSON.stringify(Object.keys(simHome({})).sort())) problems.push(`inizio: la home non è quella di base (${startKeys})`);
} finally {
    spawnSync("chmod", ["-R", "u+rwx", tmp]);
    fs.rmSync(tmp, { recursive: true, force: true });
}

// ---- Installazione vera (CI) ----
if (process.argv.includes("--installa")) {
    if (process.getuid() !== 0) {
        problems.push("--installa richiede root");
    } else {
        const install = spawnSync("bash", [script, "installa"], { encoding: "utf8" });
        if (install.status !== 0) problems.push(`installa: ${install.stdout}${install.stderr}`);
        const asAnna = command => spawnSync("runuser", ["-u", "anna", "--", "bash", "-c", `cd /home/anna && ${command}`], { encoding: "utf8", env: { PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin", HOME: "/home/anna", LC_ALL: "C" } });
        const check = (what, ok) => { if (!ok) problems.push(`installa: ${what}`); };
        check("anna nel gruppo sviluppo", /\bsviluppo\b/.test(spawnSync("id", ["-nG", "anna"], { encoding: "utf8" }).stdout));
        check("/var/log/app.log", fs.readFileSync("/var/log/app.log", "utf8").includes("ERROR connessione al database fallita"));
        check("anna non legge il segreto di luca", asAnna("cat /home/luca/segreto.txt").status !== 0);
        for (const exercise of exercises.filter(item => item.bash !== false)) {
            const setup = exercise.setup || {};
            const lines = [`lpi-esercizio ${exercise.id} >/dev/null`, `cd ${setup.cwd || "/home/anna"}`, ...exercise.solution].join(" && ");
            const result = asAnna(lines);
            if (result.status !== 0) problems.push(`installa: ${exercise.id}, la soluzione non funziona da anna: ${result.error || result.stderr}`);
        }
        // Dopo la soluzione (chmod 600) l'esercizio ripreparato torna come all'inizio
        const again = asAnna("lpi-esercizio t5.3-01 >/dev/null && stat -c '%a %U' diario.txt");
        check(`lpi-esercizio riprepara l'esercizio: ${again.stdout.trim()} ${again.stderr.trim()}`, again.status === 0 && again.stdout.trim() === "644 anna");
        const remove = spawnSync("bash", ["/usr/local/bin/lpi-esercizio", "disinstalla"], { encoding: "utf8" });
        check(`disinstalla: ${remove.stderr}`, remove.status === 0 && spawnSync("id", ["anna"]).status !== 0 && !fs.existsSync("/var/log/app.log"));
    }
}

if (problems.length) {
    console.error(problems.join("\n"));
    console.error(`\n${problems.length} problemi`);
    process.exit(1);
}
console.log(`Palestra: ${exercises.length} esercizi preparati come nel simulatore${process.argv.includes("--installa") ? ", installazione e soluzioni da anna verificate" : ""}`);
