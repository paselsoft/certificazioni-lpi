// Verifica che la shell simulata (shell-sim.js, shell-commands.js) si comporti come Bash e le GNU
// coreutils vere, come tools/check-shell.js di Pipe Dreams:
//   1. le soluzioni degli esercizi (tranne quelli con bash: false) e un elenco di casi tipici;
//   2. per ogni riga: stdout uguale, errori presenti o assenti allo stesso modo, stesso codice di
//      uscita (find e tar elencano i file in ordine di disco: si confrontano ordinati);
//   3. alla fine: stessi file e directory nella home e in /tmp, con contenuti, permessi, link e
//      contenuto degli archivi;
//   4. ls a colonne (su un terminale) come ls -C -w80.
// Il file system del simulatore viene ricreato in una directory temporanea; i percorsi assoluti
// dei comandi vengono spostati lì dentro. I testi degli errori non si confrontano (il simulatore
// li scrive in italiano). Richiede Linux con bash, GNU coreutils, tar, gzip, bzip2, xz, zip e unzip.
// Uso: node tools/check-shell.js [filtro]
process.env.TZ = "UTC";
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const context = vm.createContext({ TextEncoder });
for (const file of ["data/exams.js", "lib/pipedreams-commands.js", "lib/pipedreams-terminal.js", "shell-sim.js", "shell-commands.js", "exercise-check.js", "exercises/010-160.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}
// L'orologio del simulatore parte da adesso (al minuto), così le date di ls -l coincidono
vm.runInContext(`SIM_START = ${Math.floor(Date.now() / 60000) * 60000};`, context);
const sim = (code, values = {}) => vm.runInContext(`(${code})`, context)(values);

// Casi tipici, eseguiti dalla home di anna sul file system di base: ogni caso è una sequenza di righe
const CASES = [
    ["ls"], ["ls -a"], ["ls -A"], ["ls -l"], ["ls -lA"], ["ls -lh documenti"], ["ls -R"], ["ls -d documenti foto"], ["ls -t documenti"],
    ["ls -r"], ["ls -F"], ["ls documenti note.txt"], ["ls nonc"], ["ls -1 foto"], ["ls -l documenti foto"], ["ls -ltr documenti"], ["ls -S foto"], ["ls -l /home/anna/documenti"],
    ["cd documenti", "pwd"], ["cd ..", "pwd"], ["cd documenti", "cd", "pwd"], ["cd nonc"], ["cd note.txt"], ["cd documenti", "cd -"], ["cd /etc", "ls hosts passwd"],
    ["echo ciao   mondo"], ["echo 'a   b'"], ["echo \"$HOME\""], ["echo $NONESISTE fine"], ["A=5", "echo $A$A"], ["echo -n x"], ["echo *.txt"], ["echo d*"], ["echo nulla*"],
    ["echo ~"], ["echo foto/*"], ["echo documenti/[ls]*"], ["echo ?ote.txt"], ["X='a b'", "touch $X", "ls"], ["X='a b'", "touch \"$X\"", "ls"],
    ["cat note.txt"], ["cat -n note.txt"], ["cat note.txt nonc"], ["cat documenti"], ["cat note.txt documenti/spesa.txt"],
    ["head -n 2 note.txt"], ["head -2 note.txt documenti/spesa.txt"], ["tail -n 1 note.txt"], ["tail -n +2 note.txt"], ["head -n -1 note.txt"], ["tail -3 documenti/spesa.txt"],
    ["wc note.txt"], ["wc -l note.txt documenti/spesa.txt"], ["wc -w < note.txt"], ["cat note.txt | wc"], ["wc -c note.txt"], ["wc < note.txt"], ["cat note.txt | wc -l"], ["wc -lw note.txt nonc"],
    ["sort documenti/spesa.txt"], ["sort -r documenti/spesa.txt | uniq"], ["sort documenti/spesa.txt | uniq -c"], ["sort -u documenti/spesa.txt"], ["uniq documenti/spesa.txt"],
    ["cut -d: -f1,3 /etc/passwd"], ["cut -c1-3 note.txt"], ["tr a-z A-Z < note.txt"], ["tac note.txt"], ["rev note.txt"], ["sed 's/pane/PANE/' documenti/spesa.txt"],
    ["sort -t: -k3,3 -n /etc/passwd"], ["nl note.txt"], ["cut -f2 /etc/hosts"],
    ["grep pane documenti/spesa.txt"], ["grep -v pane documenti/spesa.txt"], ["grep -c pane documenti/spesa.txt"], ["grep -n e note.txt"], ["grep -i ripassare note.txt"],
    ["grep -r pane ."], ["grep -l pane documenti/*"], ["grep 'p.ne' documenti/spesa.txt"], ["grep '^l' documenti/spesa.txt"], ["grep 'e$' documenti/spesa.txt"],
    ["grep -E 'pane|latte' documenti/spesa.txt"], ["grep 'pane\\|latte' documenti/spesa.txt"], ["grep -w pan documenti/spesa.txt"], ["grep -o 'a.' note.txt"], ["grep x nonc"],
    ["grep -c ERROR /var/log/app.log /etc/hosts"], ["grep 'colou\\?r' note.txt"], ["grep -E '[0-9]{2}:[0-9]{2}:3[0-9]' /var/log/app.log"], ["grep 'a*' note.txt | wc -l"], ["grep -q pane documenti/spesa.txt"], ["grep pane"],
    ["find . -name '*.txt'"], ["find . -type d"], ["find documenti"], ["find . -maxdepth 1 -type f"], ["find . -iname 'NOTE*'"], ["find . -empty"], ["find nonc"], ["find . ! -name '*.txt' -type f"],
    ["mkdir a", "ls -d a"], ["mkdir a/b"], ["mkdir -p a/b/c", "ls -R a"], ["mkdir documenti"], ["touch nuovo", "ls"], ["rmdir documenti"], ["rmdir foto/mare.jpg"], ["mkdir -p v/w", "rmdir v/w v", "ls"],
    ["cp note.txt copia.txt", "cat copia.txt"], ["cp documenti x"], ["cp -r documenti x", "ls x"], ["cp note.txt documenti", "ls documenti"], ["cp note.txt foto/ documenti", "ls documenti"], ["cp nonc x"],
    ["cp -r foto documenti", "ls -R documenti"], ["cp -r documenti documenti/sotto"], ["cp note.txt note.txt"],
    ["mv note.txt documenti", "ls documenti"], ["mv documenti docs", "ls"], ["mv foto foto/sub"], ["mv nonc x"], ["mv note.txt foto/mare.jpg", "cat foto/mare.jpg"], ["mkdir d", "mv documenti foto d", "ls -R d"],
    ["rm note.txt", "ls"], ["rm documenti"], ["rm -r documenti", "ls"], ["rm nonc"], ["rm -f nonc"], ["rm -rf foto documenti", "ls"], ["rm ."], ["rm -d progetti", "ls"], ["rm foto/*.jpg", "ls foto"],
    ["ln -s note.txt link", "cat link"], ["ln note.txt hard", "ls -l note.txt hard"], ["ln -s nonc rotto", "cat rotto"], ["ln documenti h"], ["ln -s /etc/hosts", "cat hosts"], ["ln -s note.txt foto", "ls foto"],
    ["ln -s note.txt l", "ln -s note.txt l"], ["ln -s note.txt l", "rm note.txt", "cat l"],
    ["chmod 600 note.txt", "ls -l note.txt"], ["chmod u+x,g-r note.txt", "ls -l note.txt"], ["chmod 755 documenti", "ls -ld documenti"], ["chmod -R go-rwx documenti", "ls -l documenti"],
    ["chmod +t documenti", "ls -ld documenti"], ["chmod 999 note.txt"], ["chmod a=r note.txt", "echo x > note.txt"], ["chmod 000 documenti", "ls documenti"], ["chmod o=rwx,g= note.txt", "ls -l note.txt"],
    ["chmod u-x documenti", "cd documenti"], ["chmod 4755 note.txt", "ls -l note.txt"], ["chmod g+s documenti", "ls -ld documenti"], ["chmod -w documenti", "touch documenti/x"],
    ["tar -cf a.tar documenti", "tar -tf a.tar"], ["tar -czf a.tgz documenti note.txt", "tar -tzf a.tgz"], ["tar -cvzf a.tgz documenti"], ["tar -cf a.tar nonc"],
    ["tar czf a.tar.gz foto", "mkdir out", "tar -xzf a.tar.gz -C out", "ls -R out"], ["tar -xf nonc.tar"], ["tar -cjf a.tar.bz2 foto", "tar -tf a.tar.bz2"], ["tar -cJf a.tar.xz foto", "rm -r foto", "tar -xf a.tar.xz", "ls foto"],
    ["tar -cf a.tar documenti", "rm -r documenti", "tar -xvf a.tar", "cat documenti/spesa.txt"], ["tar -tf note.txt"],
    ["gzip note.txt", "ls"], ["gzip -k note.txt", "ls"], ["gzip note.txt", "gunzip note.txt.gz", "cat note.txt"], ["gzip note.txt", "zcat note.txt.gz"], ["bzip2 note.txt", "bunzip2 note.txt.bz2", "cat note.txt"],
    ["xz note.txt", "unxz note.txt.xz", "ls"], ["gzip nonc"], ["gzip note.txt", "gzip note.txt.gz"], ["gzip -d note.txt"], ["xz -k note.txt", "xzcat note.txt.xz"], ["bzip2 -k note.txt", "bzcat note.txt.bz2"],
    ["zip -r f.zip foto > /dev/null", "mkdir u", "cd u", "unzip -q ../f.zip", "ls -R"], ["zip -q f foto/mare.jpg", "ls"],
    ["file note.txt documenti"], ["type cd ls"], ["ls | wc -l"], ["ls -a | head -n 3"], ["ls > elenco.txt", "cat elenco.txt"], ["sort < documenti/spesa.txt"], ["cat nonc 2>/dev/null", "echo $?"],
    ["ls nonc note.txt > out.txt 2>&1", "wc -l out.txt", "rm out.txt"], ["true && echo si"], ["false || echo no"], ["false && echo mai; echo dopo"], ["echo uno; echo due | tr a-z A-Z"],
    ["echo a > f", "echo b >> f", "cat f"], ["grep pane documenti/spesa.txt | sort | uniq -c"], ["echo $?"], ["ls nonc", "echo $?"], ["cat < nonc"], ["echo x > documenti"],
    ["ls nonc &> tutto.txt", "wc -l tutto.txt", "rm tutto.txt"], ["ls note.txt nonc 2>&1 >/dev/null | wc -l"], ["echo ciao | tee copia.txt", "cat copia.txt"], ["cat /etc/hosts | grep -v '^#' | cut -f2 | sort"],
    ["head -n 3 /var/log/app.log | tail -n 1"], ["grep -h ERROR /var/log/app.log | cut -d' ' -f2 | sort -r"], ["export X=1", "echo $X"], ["unset HOME", "echo [$HOME]"]
];

// ls a colonne su un terminale largo 80: si confronta con ls -C -w80 -T0
const COLUMN_CASES = ["ls", "ls -a", "ls /etc", "ls documenti foto", "ls -R", "ls /usr/share/doc /var/log"];

// ---- Ricreare il file system del simulatore in una directory vera ----

const SKIP = new Set(["/usr/bin", "/proc", "/sys", "/dev"]);

function materialize(sh, dir) {
    const nodes = [];
    const walk = (node, simPath) => {
        const real = path.join(dir, simPath);
        if (node.type === "d") {
            if (simPath !== "/") fs.mkdirSync(real);
            Object.keys(node.children).sort().forEach(name => {
                const childPath = simPath === "/" ? `/${name}` : `${simPath}/${name}`;
                if (!SKIP.has(childPath)) walk(node.children[name], childPath);
            });
        } else if (node.type === "f") {
            fs.writeFileSync(real, node.data);
        } else {
            fs.symlinkSync(node.target.startsWith("/") ? path.join(dir, node.target) : node.target, real);
        }
        nodes.push({ node, real });
    };
    walk(sh.root, "/");
    // Prima le date, poi i permessi, dal più profondo (cambiare i permessi non cambia le date)
    nodes.forEach(({ node, real }) => {
        const time = new Date(node.mtime);
        if (node.type === "l") fs.lutimesSync(real, time, time);
        else fs.utimesSync(real, time, time);
    });
    nodes.forEach(({ node, real }) => { if (node.type !== "l") fs.chmodSync(real, node.mode & 0o7777); });
}

// I percorsi assoluti dei comandi spostati dentro la directory temporanea (tranne /dev/null)
const translate = (line, dir) => line.replace(/(^|[\s'"=])(\/(?!dev\/null)[^\s'"]*)/g, (_, before, p) => `${before}${dir}${p}`);
const shellQuote = text => `'${text.replace(/'/g, "'\\''")}'`;

// Esegue le righe in Bash: per ognuna stdout, stderr e codice di uscita
function runBash(dir, cwd, prepare, lines, columns) {
    const out = path.join(dir, ".out");
    fs.mkdirSync(out);
    const script = [
        "umask 022",
        `export LC_ALL=C TZ=UTC HOME=${shellQuote(`${dir}/home/anna`)}`,
        `cd ${shellQuote(dir + cwd)}`,
        ...prepare.map(line => `{ ${translate(line, dir)} ; } >/dev/null 2>&1`),
        // $? passa da una riga all'altra come in un terminale
        ...lines.map((line, i) => `{ ${translate(columns ? line.replace(/^ls\b/, "ls -C -w80 -T0") : line, dir)} ; } >${shellQuote(`${out}/${i}.out`)} 2>${shellQuote(`${out}/${i}.err`)}; s=$?; echo $s >${shellQuote(`${out}/${i}.code`)}; (exit $s)`)
    ].join("\n");
    // Da amministratore i permessi non fermerebbero niente: si esegue come nobody
    if (asRoot) {
        spawnSync("chown", ["-R", "65534:65534", dir]);
        spawnSync("setpriv", ["--reuid=65534", "--regid=65534", "--clear-groups", "bash", "--norc", "--noprofile", "-c", script], { encoding: "utf8" });
    } else {
        spawnSync("bash", ["--norc", "--noprofile", "-c", script], { encoding: "utf8" });
    }
    const results = lines.map((_, i) => ({
        stdout: fs.readFileSync(`${out}/${i}.out`, "utf8").split(dir).join(""),
        stderr: fs.readFileSync(`${out}/${i}.err`, "utf8"),
        code: Number(fs.readFileSync(`${out}/${i}.code`, "utf8"))
    }));
    fs.rmSync(out, { recursive: true });
    return results;
}

// Lo stato finale della home e di /tmp: percorso → descrizione
function simSnapshot(sh) {
    return sim(`({ sh }) => {
        const result = {};
        const walk = (node, label) => {
            const mode = (node.mode & 0o7777).toString(8);
            if (node.type === "d") {
                result[label] = "d " + mode;
                Object.keys(node.children).sort().forEach(name => walk(node.children[name], label + "/" + name));
            } else if (node.type === "l") {
                result[label] = "l -> " + node.target;
            } else if (isBinary(node.data)) {
                const layers = [];
                let data = node.data;
                while (isBinary(data)) {
                    layers.push(binaryKind(data));
                    data = binaryBody(data);
                }
                const inner = layers[layers.length - 1] === "tar" || layers[layers.length - 1] === "zip"
                    ? JSON.parse(data).map(entry => entry.name).sort().join(",") : data;
                result[label] = "f " + mode + " " + layers.join("+") + " " + JSON.stringify(inner);
            } else {
                result[label] = "f " + mode + " " + JSON.stringify(node.data);
            }
        };
        ["/home/anna", "/tmp"].forEach(start => {
            const node = simFindRaw(sh, start);
            if (node) walk(node, start);
        });
        return result;
    }`, { sh });
}

function realSnapshot(dir, simState) {
    const result = {};
    const walk = (real, label) => {
        let stat;
        try {
            stat = fs.lstatSync(real);
        } catch (error) {
            return;
        }
        const mode = (stat.mode & 0o7777).toString(8);
        if (stat.isSymbolicLink()) {
            result[label] = `l -> ${fs.readlinkSync(real).split(dir).join("")}`;
        } else if (stat.isDirectory()) {
            result[label] = `d ${mode}`;
            let names = [];
            try {
                names = fs.readdirSync(real).sort();
            } catch (error) {
                fs.chmodSync(real, 0o700);
                names = fs.readdirSync(real).sort();
            }
            names.forEach(name => walk(path.join(real, name), `${label}/${name}`));
        } else {
            const expected = simState[label] || "";
            const layers = /^f \d+ ([a-z0-9+]+) /.exec(expected);
            if (layers && /^(tar|gzip|bzip2|xz|zip)/.test(layers[1])) {
                // Un archivio: si confrontano i nomi che contiene, o il testo decompresso
                const kinds = layers[1].split("+");
                const last = kinds[kinds.length - 1];
                let inner;
                if (last === "tar") inner = spawnSync("tar", ["-tf", real], { encoding: "utf8" }).stdout.trim().split("\n").filter(Boolean).sort().join(",");
                else if (last === "zip") inner = spawnSync("unzip", ["-Z1", real], { encoding: "utf8" }).stdout.trim().split("\n").filter(Boolean).sort().join(",");
                else inner = spawnSync(last, ["-dc", real], { encoding: "utf8" }).stdout;
                result[label] = `f ${mode} ${kinds.join("+")} ${JSON.stringify(inner)}`;
            } else {
                let data;
                try {
                    data = fs.readFileSync(real, "utf8");
                } catch (error) {
                    fs.chmodSync(real, 0o600);
                    data = fs.readFileSync(real, "utf8");
                    fs.chmodSync(real, stat.mode & 0o7777);
                }
                result[label] = `f ${mode} ${JSON.stringify(data)}`;
            }
        }
    };
    ["/home/anna", "/tmp"].forEach(start => walk(path.join(dir, start), start));
    return result;
}

// Il nome e il gruppo di chi esegue i comandi, sostituiti con anna nelle righe di ls -l
const asRoot = process.getuid() === 0;
const realUser = asRoot ? "nobody" : spawnSync("id", ["-un"], { encoding: "utf8" }).stdout.trim();
const realGroup = asRoot ? "nogroup" : spawnSync("id", ["-gn"], { encoding: "utf8" }).stdout.trim();
const ownerFix = text => text.split(`${realUser} ${realGroup}`).join("anna anna");

const sortedIf = (line, text) => /\b(find|tar)\b/.test(line) ? text.split("\n").filter(Boolean).sort().join("\n") : text;

function checkCase(label, exercise, lines, columns, problems) {
    const sh = sim("({ exercise }) => exercise ? exerciseShell(exercise) : createShell()", { exercise });
    const setup = exercise ? exercise.setup || {} : {};
    // Il file system prima della preparazione, che Bash rifà da sé
    const fresh = sim("({ setup }) => createShell(setup)", { setup });
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lpi-shell-"));
    fs.chmodSync(dir, 0o755);
    try {
        materialize(fresh, dir);
        sim("({ sh, columns }) => { sh.tty = columns; sh.columns = 80; }", { sh, columns });
        const simResults = lines.map(line => {
            const run = sim("({ sh, line }) => simRun(sh, line)", { sh, line });
            return { stdout: sim("({ sh }) => sh.lineOutput", { sh }), stderr: run.lines.some(item => item.err), code: sim("({ sh }) => sh.status", { sh }) };
        });
        const realResults = runBash(dir, setup.cwd || "/home/anna", setup.prepare || [], lines, columns);
        lines.forEach((line, i) => {
            const a = simResults[i];
            const b = realResults[i];
            const simOut = sortedIf(line, a.stdout);
            const realOut = sortedIf(line, ownerFix(b.stdout));
            if (simOut !== realOut) problems.push(`${label} «${line}»: stdout diverso\n    simulatore: ${JSON.stringify(simOut)}\n    bash:       ${JSON.stringify(realOut)}`);
            if (a.stderr !== (b.stderr !== "")) problems.push(`${label} «${line}»: errori ${a.stderr ? "solo nel simulatore" : `solo in bash: ${JSON.stringify(b.stderr)}`}`);
            if (a.code !== b.code) problems.push(`${label} «${line}»: codice di uscita ${a.code} invece di ${b.code}`);
        });
        if (!columns) {
            const simState = simSnapshot(sh);
            const realState = realSnapshot(dir, simState);
            const keys = new Set([...Object.keys(simState), ...Object.keys(realState)]);
            [...keys].sort().forEach(key => {
                if (simState[key] !== realState[key]) problems.push(`${label}: ${key}\n    simulatore: ${simState[key] || "(non c'è)"}\n    bash:       ${realState[key] || "(non c'è)"}`);
            });
        }
    } finally {
        spawnSync("chmod", ["-R", "u+rwx", dir]);
        fs.rmSync(dir, { recursive: true, force: true });
    }
}

const filter = (process.argv[2] || "").toLowerCase();
const problems = [];
let count = 0;
const exercises = vm.runInContext("EXERCISES", context).filter(ex => ex.bash !== false);
for (const exercise of exercises) {
    if (filter && !exercise.id.includes(filter)) continue;
    checkCase(`esercizio ${exercise.id}`, exercise, exercise.solution, false, problems);
    count++;
}
CASES.forEach((lines, i) => {
    if (filter && !lines.join(" ").toLowerCase().includes(filter)) return;
    checkCase(`caso ${i + 1}`, null, lines, false, problems);
    count++;
});
COLUMN_CASES.forEach(line => {
    if (filter && !line.includes(filter)) return;
    checkCase("colonne", null, [line], true, problems);
    count++;
});
problems.forEach(problem => console.log(problem));
console.log(`Shell simulata: ${count} sequenze confrontate con Bash, ${problems.length} differenze`);
if (problems.length) process.exit(1);
