// Gli editor di testo nella shell simulata (obiettivo 3.3, «vi e nano»): i comandi nano, vi e vim.
// Il comando prepara solo l'apertura (sh.pendingEditor: quale editor, quale file, il testo, con
// quale utente); la pagina del terminale (editor-view.js) mostra l'editor e, quando si salva,
// scrive il file con simEditorSave, con i permessi dell'utente che l'ha aperto (anche root, con
// sudo nano). Come i programmi veri, l'editor ha bisogno del terminale: non si apre in una pipe,
// con l'output reindirizzato o dentro uno script.
// Si carica dopo shell-commands.js, a cui aggiunge i comandi.

function simEditorRun(name) {
    return (sh, args, stdin, ctx = {}) => {
        const res = simOutput();
        const kind = name === "nano" ? "nano" : "vi";
        if (!ctx.tty || stdin !== null || sh.depth || sh.pendingEditor) {
            res.fail(`${name}: nel simulatore l'editor si apre solo sulla riga di comando, da solo: non in una pipe, con > o in uno script`);
            return res;
        }
        // Le opzioni (come vim -R o nano -l) nel simulatore non cambiano niente
        const files = args.filter(arg => !/^[-+]/.test(arg));
        if (files.length > 1) {
            res.fail(`${name}: nel simulatore si apre un file alla volta`);
            return res;
        }
        const path = files.length ? files[0] : null;
        const spec = { kind, name, path, text: "", isNew: false, user: sh.user, message: "" };
        if (path !== null) {
            try {
                const found = simLookup(sh, path);
                if (!found.node) {
                    spec.isNew = true;
                } else if (found.node.type === "d") {
                    res.fail(`${name}: ${path}: ${ERRORS.EISDIR}`);
                    return res;
                } else if (!canAccess(sh, found.node, 4)) {
                    spec.unreadable = true;
                    spec.message = ERRORS.EACCES;
                } else {
                    spec.text = found.node.data;
                }
            } catch (error) {
                if (!(error instanceof SimError)) throw error;
                // La directory non esiste o non si può attraversare: l'editor si apre vuoto, ma
                // salvare non funzionerà
                spec.isNew = true;
                spec.message = error.message;
            }
        }
        sh.pendingEditor = spec;
        return res;
    };
}

// Scrive il testo nel file, con i permessi di chi ha aperto l'editor.
// Restituisce { ok: true, isNew } oppure { ok: false, error }
function simEditorSave(sh, editor, path, text) {
    const user = sh.user;
    sh.user = editor.user;
    try {
        const isNew = !simLookup(sh, path).node;
        const node = simOpenForWrite(sh, path, false);
        node.data = text;
        node.mtime = sh.clock;
        sh.clock += 1000;
        return { ok: true, isNew };
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        return { ok: false, error: error.message };
    } finally {
        sh.user = user;
    }
}

// Le pagine di manuale (shell-help.js), scritte da zero per questa app
SIM_MAN.push(
    {
        name: "nano", section: 1, summary: "editor di testo semplice, con i comandi sempre in vista",
        synopsis: ["nano [FILE]"],
        description: [
            "Apre FILE (o un file nuovo, se non esiste) e si scrive subito. In basso c'è l'elenco dei comandi: ^ vuol dire Ctrl, quindi ^O è Ctrl+O.",
            "Ctrl+O salva: nano chiede il nome del file, Invio conferma. Ctrl+X esce: se ci sono modifiche non salvate chiede se salvarle (S sì, N no, Ctrl+C annulla)."
        ],
        options: [["Ctrl+O", "salva il file (write Out)"], ["Ctrl+X", "esce"], ["Ctrl+K", "taglia la riga del cursore"], ["Ctrl+U", "incolla la riga tagliata"],
            ["Ctrl+W", "cerca un testo (nel simulatore no: nel browser chiuderebbe la scheda)"], ["Ctrl+C", "mostra la posizione del cursore; nelle domande annulla"], ["Ctrl+G", "la guida"]],
        see: ["vi(1)"]
    },
    {
        name: "vi", section: 1, summary: "editor di testo con i modi comandi e inserimento (su Linux di solito è vim)",
        synopsis: ["vi [FILE]", "vim [FILE]"],
        description: [
            "Si parte nel modo comandi: i tasti sono comandi, non testo. i (insert) passa al modo inserimento, dove si scrive; Esc torna al modo comandi.",
            "Dal modo comandi, : apre la riga dei comandi in basso: :w salva, :q esce, :wq (o :x, o ZZ) salva ed esce, :q! esce senza salvare. Se ci sono modifiche, :q da solo si rifiuta di uscire."
        ],
        options: [["i, a", "scrive prima o dopo il cursore"], ["I, A", "scrive all'inizio o alla fine della riga"], ["o, O", "apre una riga nuova sotto o sopra"],
            ["Esc", "torna al modo comandi"], ["h j k l", "sinistra, giù, su, destra (anche le frecce)"], ["0, $", "inizio e fine della riga"], ["gg, G", "prima e ultima riga"],
            ["x", "cancella il carattere"], ["dd", "taglia la riga"], ["yy", "copia la riga"], ["p, P", "incolla sotto o sopra"], ["u", "annulla l'ultima modifica"],
            ["/testo", "cerca testo (n: il successivo)"], [":w, :q, :wq, :q!", "salva, esce, salva ed esce, esce senza salvare"]],
        see: ["nano(1)", "vim(1)"]
    },
    {
        name: "vim", section: 1, summary: "Vi IMproved, la versione migliorata di vi",
        synopsis: ["vim [FILE]"],
        description: ["Funziona come vi, con molte aggiunte (colori, annulla a più livelli, aiuto con :help). Su molte distribuzioni il comando vi apre vim."],
        options: [],
        see: ["vi(1)"]
    }
);

Object.assign(SIM_COMMANDS, {
    nano: { run: simEditorRun("nano") },
    vi: { run: simEditorRun("vi") },
    vim: { run: simEditorRun("vim") }
});
