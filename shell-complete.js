// Il completamento con Tab nella shell simulata: la prima parola di un comando si completa con
// i nomi dei comandi, le altre con i nomi dei file e delle directory (le directory con la / in
// fondo; i file nascosti solo se la parola inizia con un punto), come in Bash.
// simComplete(sh, testo) → { text, options }: text è la riga completata (uguale se non c'è niente
// da aggiungere), options i nomi possibili quando sono più di uno.

// La parola su cui si trova il cursore (alla fine della riga) e se è la prima di un comando
function completionWord(text) {
    const match = /(^|[\s;|&<>])([^\s;|&<>]*)$/.exec(text);
    const word = match ? match[2] : "";
    const before = text.slice(0, text.length - word.length);
    // Prima parola: all'inizio, o dopo ; | && || (non dopo un reindirizzamento)
    const first = /(^|[;|&]\s*)$/.test(before.replace(/\s+$/, "")) || before.trim() === "" || /[;|&]\s*$/.test(before);
    const afterRedirect = /[<>]\s*$/.test(before);
    return { word, before, first: first && !afterRedirect };
}

const commonPrefix = list => list.reduce((prefix, item) => {
    let i = 0;
    while (i < prefix.length && i < item.length && prefix[i] === item[i]) i++;
    return prefix.slice(0, i);
});

// Gli spazi e i caratteri speciali nei nomi si proteggono con \ (come fa Bash)
const escapeName = name => name.replace(/([\s'"\\$`*?[\]|&;<>()!#])/g, "\\$1");

function completePath(sh, word) {
    const slash = word.lastIndexOf("/");
    const dirText = slash === -1 ? "" : word.slice(0, slash + 1);
    const prefix = word.slice(slash + 1).replace(/\\(.)/g, "$1");
    let dirPath = dirText === "" ? "." : dirText;
    if (dirPath.startsWith("~")) dirPath = (sh.vars.HOME || "/") + dirPath.slice(1);
    let dir;
    try {
        dir = simLookup(sh, dirPath).node;
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        return [];
    }
    if (!dir || dir.type !== "d" || !canAccess(sh, dir, 4)) return [];
    return sortedNames(dir)
        .filter(name => name.startsWith(prefix) && (prefix.startsWith(".") || !name.startsWith(".")))
        .map(name => {
            let node = dir.children[name];
            // Un link a una directory si completa come una directory
            if (node.type === "l") {
                try {
                    node = simLookup(sh, `${dirPath.replace(/\/?$/, "/")}${name}`).node || node;
                } catch (error) {
                    if (!(error instanceof SimError)) throw error;
                }
            }
            return { name, value: dirText + escapeName(name), dir: node.type === "d" };
        });
}

function simComplete(sh, text) {
    const { word, before, first } = completionWord(text);
    let matches;
    if (first && !word.includes("/")) {
        const names = new Set([...Object.keys(SIM_COMMANDS).filter(name => simCommandFor(sh, name)), ...SIM_BUILTINS]);
        matches = [...names].filter(name => name.startsWith(word) && /^[a-z]/.test(name)).sort()
            .map(name => ({ name, value: name, dir: false }));
    } else {
        matches = completePath(sh, word);
    }
    if (!matches.length) return { text, options: [] };
    if (matches.length === 1) {
        const only = matches[0];
        return { text: before + only.value + (only.dir ? "/" : " "), options: [] };
    }
    // Più nomi possibili: si completa la parte comune; se non c'è niente da aggiungere, si mostrano
    const shared = commonPrefix(matches.map(match => match.value));
    if (shared.length > word.length) return { text: before + shared, options: [] };
    return { text, options: matches.map(match => match.name + (match.dir ? "/" : "")) };
}
