// Controllo degli esercizi al terminale (tappa M5): prepara la shell di un esercizio e verifica i
// suoi obiettivi (il formato è descritto in exercises/010-160.js). Non usa la pagina: lo usano
// sia practice.js sia tools/check-shell.js.

// La shell di partenza: file system di base, più setup, più i comandi di preparazione
function exerciseShell(exercise, columns = 80) {
    const setup = exercise.setup || {};
    const sh = createShell(setup);
    sh.columns = columns;
    (setup.prepare || []).forEach(command => simRun(sh, command));
    if (setup.cwd) {
        sh.cwd = setup.cwd;
        sh.vars.PWD = setup.cwd;
    }
    sh.vars.OLDPWD = undefined;
    delete sh.vars.OLDPWD;
    sh.history = [];
    sh.lastOutput = "";
    sh.lastErrors = "";
    sh.lastCommand = "";
    sh.status = 0;
    return sh;
}

// Lo stdout dell'ultimo comando della soluzione (per gli obiettivi output: "same")
const expectedCache = new Map();
function expectedOutput(exercise, columns) {
    const key = `${exercise.exam}/${exercise.id}/${columns}`;
    if (!expectedCache.has(key)) {
        const sh = exerciseShell(exercise, columns);
        exercise.solution.forEach(command => simRun(sh, command));
        expectedCache.set(key, sh.lastOutput);
    }
    return expectedCache.get(key);
}

// Il nodo a un percorso, senza i limiti dei permessi dell'utente
function inspectPath(sh, path, follow) {
    const user = sh.user;
    sh.user = "root";
    try {
        return simLookup(sh, path, follow).node;
    } catch (error) {
        return null;
    } finally {
        sh.user = user;
    }
}

// Gli elementi di un archivio, se è del tipo richiesto ("tar", "tar.gz", "gzip", "zip"); altrimenti null
function archiveEntries(node, kind) {
    if (!node || node.type !== "f") return null;
    const layers = kind === "tar.gz" ? ["gzip", "tar"] : kind === "tar.bz2" ? ["bzip2", "tar"] : kind === "tar.xz" ? ["xz", "tar"] : [kind];
    let data = node.data;
    for (const layer of layers) {
        if (binaryKind(data) !== layer) return null;
        data = binaryBody(data);
    }
    if (kind === "gzip") return [];
    try {
        return JSON.parse(data).map(entry => entry.name);
    } catch (error) {
        return null;
    }
}

function goalMet(sh, exercise, goal) {
    if (goal.command && !new RegExp(goal.command).test(sh.lastCommand.trim())) return false;
    if (goal.cwd !== undefined && sh.cwd.replace(/\/+$/, "") !== goal.cwd) return false;
    if (goal.variable !== undefined) {
        if (sh.vars[goal.variable] !== goal.value) return false;
        if (goal.exported && !sh.exported.has(goal.variable)) return false;
    }
    if (goal.output === "same" && sh.lastOutput !== expectedOutput(exercise, sh.columns)) return false;
    if (goal.output === "words") {
        const words = new Set(sh.lastOutput.split(/\s+/));
        if (!goal.words.every(word => words.has(word))) return false;
    }
    if (goal.noErrors && sh.lastErrors !== "") return false;
    if (goal.path !== undefined) {
        const node = inspectPath(sh, goal.path, goal.is !== "link");
        if (goal.is === "absent") return !node;
        if (!node) return false;
        if (goal.is === "dir" && node.type !== "d") return false;
        if (goal.is === "file" && node.type !== "f") return false;
        if (goal.is === "link" && node.type !== "l") return false;
        if (goal.content !== undefined && node.data !== goal.content) return false;
        if (goal.mode !== undefined && (node.mode & 0o7777) !== parseInt(goal.mode, 8)) return false;
        if (goal.modeHas !== undefined && (node.mode & parseInt(goal.modeHas, 8)) !== parseInt(goal.modeHas, 8)) return false;
        if (goal.owner !== undefined && node.owner !== goal.owner) return false;
        if (goal.target !== undefined && node.target !== goal.target) return false;
        if (goal.sameAs !== undefined && inspectPath(sh, goal.sameAs, false) !== node) return false;
        if (goal.archive !== undefined) {
            const entries = archiveEntries(node, goal.archive);
            if (!entries) return false;
            if (goal.has && !goal.has.every(name => entries.includes(name))) return false;
        }
    }
    return true;
}

const exerciseDone = (sh, exercise) => exercise.goals.every(goal => goalMet(sh, exercise, goal));
