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
// La palestra non deve mai eseguire da sola un comando con sudo (creerebbe utenti veri)
if (/^\s*esegui \$'sudo\b/m.test(fs.readFileSync(script, "utf8"))) problems.push("palestra/palestra.sh esegue da solo un comando con sudo");

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
        const zips = {};
        (setup.prepare || []).forEach(line => {
            let match = line.match(/^tar -czf (\S+) (\S+)$/);
            if (match) archives[match[1]] = match[2];
            match = line.match(/^zip -qr (\S+) (\S+)$/);
            if (match) zips[match[1]] = match[2];
            match = line.match(/^rm -r (\S+)$/);
            if (match) Object.keys(expected).filter(key => key === match[1] || key.startsWith(`${match[1]}/`)).forEach(key => delete expected[key]);
            // gzip FILE: resta FILE.gz, compresso davvero
            match = line.match(/^gzip (\S+)$/);
            if (match) {
                delete expected[match[1]];
                if (!real[`${match[1]}.gz`]) problems.push(`${exercise.id}: manca ${match[1]}.gz`);
                else if (spawnSync("gzip", ["-t", path.join(home, `${match[1]}.gz`)]).status !== 0) problems.push(`${exercise.id}: ${match[1]}.gz non è compresso con gzip`);
                delete real[`${match[1]}.gz`];
            }
        });
        Object.entries(zips).forEach(([archive, dir]) => {
            if (!real[archive]) { problems.push(`${exercise.id}: manca l'archivio ${archive}`); return; }
            const list = spawnSync("unzip", ["-Z1", path.join(home, archive)], { encoding: "utf8" }).stdout.split("\n").filter(Boolean).map(name => name.replace(/\/$/, "")).sort();
            const want = Object.keys(simHome(setup)).filter(key => key === dir || key.startsWith(`${dir}/`)).sort();
            if (JSON.stringify(list) !== JSON.stringify(want)) problems.push(`${exercise.id}: ${archive} contiene ${list.join(", ")} invece di ${want.join(", ")}`);
            delete real[archive];
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
            // Il codice di uscita finale deve essere quello del simulatore (uno script può uscire con 1)
            const expected = vm.runInContext(`(exercise => { const sh = exerciseShell(exercise); exercise.solution.forEach(line => simRun(sh, line)); return sh.status; })`, context)(exercise);
            const lines = `lpi-esercizio ${exercise.id} >/dev/null && cd ${setup.cwd || "/home/anna"} || exit 99\n${exercise.solution.join("\n")}`;
            const result = asAnna(lines);
            if (result.status !== expected) problems.push(`installa: ${exercise.id}, da anna la soluzione esce con ${result.status} invece di ${expected}: ${result.error || result.stderr}`);
            // lpi-esercizio verifica sul sistema vero dice quello che dice il simulatore: prima della
            // soluzione «da fare» se un obiettivo controllabile non è raggiunto, dopo tutto fatto
            const before = vm.runInContext(`(exercise => { const sh = exerciseShell(exercise); return exercise.goals.filter(goal => !(goal.output !== undefined || goal.command !== undefined || goal.history !== undefined || goal.noErrors || (goal.variable !== undefined && !goal.exported && goal.variable !== "PATH"))).some(goal => !goalMet(sh, exercise, goal)); })`, context)(exercise);
            const verify = asAnna(`lpi-esercizio ${exercise.id} >/dev/null && cd ${setup.cwd || "/home/anna"} || exit 99\nlpi-esercizio verifica > /tmp/prima.txt; echo $? > /tmp/prima.codice\n${exercise.solution.join("\n")}\nlpi-esercizio verifica`);
            const firstCode = Number(fs.readFileSync("/tmp/prima.codice", "utf8"));
            if (before && firstCode !== 1) problems.push(`installa: ${exercise.id}, prima della soluzione verifica dovrebbe dire «ancora da fare»: ${fs.readFileSync("/tmp/prima.txt", "utf8")}`);
            if (!before && firstCode !== 0) problems.push(`installa: ${exercise.id}, prima della soluzione verifica non dovrebbe trovare obiettivi da fare: ${fs.readFileSync("/tmp/prima.txt", "utf8")}`);
            if (verify.status !== 0 || /✗/.test(verify.stdout)) problems.push(`installa: ${exercise.id}, dopo la soluzione verifica dice: ${verify.stdout}${verify.stderr}`);
        }
        fs.rmSync("/tmp/prima.txt", { force: true });
        fs.rmSync("/tmp/prima.codice", { force: true });
        // Senza un esercizio preparato, verifica lo chiede; con un codice sconosciuto dà errore
        const noExercise = asAnna("rm -f ~/.lpi-esercizio; lpi-esercizio verifica");
        check(`verifica senza esercizio: ${noExercise.stderr.trim()}`, noExercise.status !== 0 && /Quale esercizio\?/.test(noExercise.stderr));
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
