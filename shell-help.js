// L'aiuto dalla riga di comando nella shell simulata (obiettivo 2.2): man (anche -k e -f),
// apropos, whatis, info, COMANDO --help, help per i comandi interni, locate e updatedb.
// Le pagine sono scritte da zero per questa app, in italiano e in breve: non sono le pagine di
// manuale vere, ma hanno la stessa forma (NOME, SINTASSI, DESCRIZIONE, OPZIONI, VEDI ANCHE).
// Si carica dopo shell-commands.js, a cui aggiunge i comandi.

const MAN_SECTIONS = { 1: "Comandi utente", 5: "Formati dei file", 8: "Comandi di amministrazione" };

// name, section, summary (la riga di NOME, usata anche da man -k), synopsis, description
// (paragrafi), options ([opzione, spiegazione]), see
const SIM_MAN = [
    {
        name: "ls", section: 1, summary: "elenca il contenuto delle directory",
        synopsis: ["ls [OPZIONE]... [FILE]..."],
        description: ["Mostra i nomi dei file indicati o, senza argomenti, il contenuto della directory corrente, in ordine alfabetico."],
        options: [["-a, --all", "mostra anche i nomi che iniziano con un punto"], ["-l", "formato lungo: permessi, proprietario, dimensione, data"],
            ["-h, --human-readable", "con -l, dimensioni leggibili (K, M, G)"], ["-R, --recursive", "elenca anche le sottodirectory"],
            ["-d, --directory", "mostra le directory stesse, non il loro contenuto"], ["-t", "ordina per data di modifica, dal più recente"], ["-r", "inverte l'ordine"]],
        see: ["cp(1)", "find(1)"]
    },
    {
        name: "cp", section: 1, summary: "copia file e directory",
        synopsis: ["cp [OPZIONE]... ORIGINE DESTINAZIONE", "cp [OPZIONE]... ORIGINE... DIRECTORY"],
        description: ["Copia ORIGINE in DESTINAZIONE, oppure più file dentro DIRECTORY. Una directory si copia solo con -r."],
        options: [["-r, -R, --recursive", "copia le directory con tutto il loro contenuto"], ["-i", "chiede conferma prima di sovrascrivere"],
            ["-p", "conserva permessi, proprietario e date"], ["-v", "scrive che cosa sta facendo"]],
        see: ["mv(1)", "rm(1)"]
    },
    {
        name: "mv", section: 1, summary: "sposta o rinomina file",
        synopsis: ["mv [OPZIONE]... ORIGINE DESTINAZIONE", "mv [OPZIONE]... ORIGINE... DIRECTORY"],
        description: ["Rinomina ORIGINE in DESTINAZIONE, oppure sposta uno o più file dentro DIRECTORY."],
        options: [["-i", "chiede conferma prima di sovrascrivere"], ["-n", "non sovrascrive i file che esistono già"], ["-v", "scrive che cosa sta facendo"]],
        see: ["cp(1)", "rm(1)"]
    },
    {
        name: "rm", section: 1, summary: "elimina file o directory",
        synopsis: ["rm [OPZIONE]... FILE..."],
        description: ["Elimina i file indicati. Non c'è un cestino: quello che viene eliminato non si recupera. Le directory si eliminano solo con -r."],
        options: [["-r, -R, --recursive", "elimina le directory e tutto il loro contenuto"], ["-f, --force", "non chiede conferme e ignora i file che non esistono"],
            ["-i", "chiede conferma per ogni file"]],
        see: ["rmdir(1)", "mv(1)"]
    },
    {
        name: "mkdir", section: 1, summary: "crea directory",
        synopsis: ["mkdir [OPZIONE]... DIRECTORY..."],
        description: ["Crea le directory indicate, se non esistono già."],
        options: [["-p, --parents", "crea anche le directory intermedie che mancano; nessun errore se esistono"], ["-m MODO", "imposta i permessi, come con chmod"],
            ["-v", "scrive un messaggio per ogni directory creata"]],
        see: ["rmdir(1)"]
    },
    {
        name: "cat", section: 1, summary: "concatena i file e li scrive sullo schermo",
        synopsis: ["cat [OPZIONE]... [FILE]..."],
        description: ["Scrive il contenuto dei file uno dopo l'altro. Senza file legge quello che riceve da una pipe."],
        options: [["-n, --number", "numera tutte le righe"]],
        see: ["less(1)", "head(1)", "tail(1)"]
    },
    {
        name: "grep", section: 1, summary: "mostra le righe che corrispondono a un modello",
        synopsis: ["grep [OPZIONE]... MODELLO [FILE]..."],
        description: ["Cerca MODELLO in ogni FILE (o in quello che riceve da una pipe) e scrive le righe che lo contengono. Il modello è un'espressione regolare."],
        options: [["-i, --ignore-case", "non distingue maiuscole e minuscole"], ["-v, --invert-match", "mostra le righe che NON corrispondono"],
            ["-c, --count", "scrive solo quante righe corrispondono"], ["-n, --line-number", "aggiunge il numero di riga"],
            ["-r, --recursive", "cerca in tutti i file di una directory"], ["-q, --quiet", "non scrive niente: conta solo il codice di uscita"]],
        see: ["find(1)", "sed(1)"]
    },
    {
        name: "find", section: 1, summary: "cerca file in un albero di directory",
        synopsis: ["find [DIRECTORY]... [CRITERIO]..."],
        description: ["Scende nelle directory indicate e scrive i file che soddisfano i criteri. Cerca nel file system com'è adesso: è più lento di locate, ma sempre aggiornato."],
        options: [["-name MODELLO", "il nome corrisponde al modello (con * e ? tra virgolette)"], ["-type f|d|l", "solo file, solo directory o solo link"],
            ["-size N", "per dimensione"], ["-mtime N", "per data di modifica, in giorni"]],
        see: ["locate(1)", "grep(1)"]
    },
    {
        name: "locate", section: 1, summary: "trova i file per nome, cercando in un database",
        synopsis: ["locate [OPZIONE]... MODELLO..."],
        description: ["Scrive i percorsi che contengono MODELLO. Non guarda il disco ma un database preparato da updatedb: è velocissimo, ma non conosce i file creati dopo l'ultimo aggiornamento."],
        options: [["-i, --ignore-case", "non distingue maiuscole e minuscole"], ["-c, --count", "scrive solo quanti percorsi ha trovato"]],
        see: ["updatedb(8)", "find(1)"]
    },
    {
        name: "updatedb", section: 8, summary: "aggiorna il database usato da locate",
        synopsis: ["updatedb"],
        description: ["Legge tutto il file system e riscrive il database di locate. Di solito parte da solo una volta al giorno; a mano serve l'amministratore: sudo updatedb."],
        options: [],
        see: ["locate(1)"]
    },
    {
        name: "tar", section: 1, summary: "crea, elenca ed estrae archivi di file",
        synopsis: ["tar -c [-z|-j|-J] -f ARCHIVIO FILE...", "tar -t -f ARCHIVIO", "tar -x -f ARCHIVIO [-C DIRECTORY]"],
        description: ["Riunisce più file e directory in un solo archivio, e li ritira fuori. Da solo non comprime: per comprimere si aggiunge -z, -j o -J."],
        options: [["-c", "crea un archivio"], ["-t", "elenca il contenuto di un archivio"], ["-x", "estrae i file da un archivio"],
            ["-f ARCHIVIO", "il nome dell'archivio"], ["-z", "comprime con gzip (.tar.gz)"], ["-j", "comprime con bzip2 (.tar.bz2)"],
            ["-J", "comprime con xz (.tar.xz)"], ["-v", "scrive i nomi dei file man mano"], ["-C DIRECTORY", "estrae in questa directory"]],
        see: ["gzip(1)", "zip(1)"]
    },
    {
        name: "gzip", section: 1, summary: "comprime o espande file",
        synopsis: ["gzip [OPZIONE]... FILE...", "gunzip FILE..."],
        description: ["Comprime ogni FILE e lo sostituisce con FILE.gz. gunzip (o gzip -d) fa il contrario."],
        options: [["-d", "espande invece di comprimere"], ["-k", "conserva anche il file originale"], ["-c", "scrive il risultato sullo schermo, senza toccare il file"]],
        see: ["tar(1)", "bzip2(1)", "xz(1)"]
    },
    {
        name: "zip", section: 1, summary: "comprime file in un archivio zip",
        synopsis: ["zip [OPZIONE]... ARCHIVIO FILE...", "unzip ARCHIVIO"],
        description: ["Crea un archivio compresso nel formato zip, comune anche fuori da Linux. Per estrarlo si usa unzip."],
        options: [["-r", "aggiunge le directory con tutto il loro contenuto"], ["-q", "non scrive messaggi"]],
        see: ["tar(1)", "gzip(1)"]
    },
    {
        name: "chmod", section: 1, summary: "cambia i permessi dei file",
        synopsis: ["chmod [OPZIONE]... MODO FILE..."],
        description: ["Imposta i permessi di lettura (r), scrittura (w) ed esecuzione (x) per il proprietario (u), il gruppo (g) e gli altri (o). MODO può essere simbolico, come u+x, oppure numerico, come 644."],
        options: [["-R, --recursive", "cambia anche il contenuto delle directory"]],
        see: ["chown(1)", "ls(1)"]
    },
    {
        name: "passwd", section: 1, summary: "cambia la password di un utente",
        synopsis: ["passwd [UTENTE]"],
        description: ["Senza argomenti cambia la propria password, chiedendo prima quella vecchia. Solo l'amministratore può cambiare la password di un altro utente."],
        options: [["-l", "blocca l'account"], ["-u", "sblocca l'account"]],
        see: ["passwd(5)", "useradd(8)"]
    },
    {
        name: "passwd", section: 5, summary: "il file degli utenti, /etc/passwd",
        synopsis: ["/etc/passwd"],
        description: ["Contiene una riga per ogni utente, con sette campi separati dai due punti: nome, password (una x: quella vera è in /etc/shadow), numero dell'utente (UID), numero del gruppo (GID), descrizione, directory home, shell.",
            "Esempio: anna:x:1000:1000:Anna Rossi:/home/anna:/bin/bash"],
        options: [],
        see: ["passwd(1)", "group(5)", "shadow(5)"]
    },
    {
        name: "man", section: 1, summary: "mostra le pagine del manuale di sistema",
        synopsis: ["man [SEZIONE] PAGINA", "man -k PAROLA", "man -f PAGINA"],
        description: ["Mostra la pagina di manuale di un comando, di un file di configurazione o di altro. Le pagine sono divise in sezioni: 1 comandi utente, 5 formati dei file, 8 comandi di amministrazione.",
            "Se lo stesso nome è in più sezioni, senza numero si apre la prima: man passwd apre il comando, man 5 passwd il file. Su un sistema vero la pagina si scorre con le frecce e si chiude con q."],
        options: [["-k PAROLA", "cerca PAROLA nei nomi e nelle descrizioni brevi di tutte le pagine (come apropos)"], ["-f PAGINA", "mostra solo la descrizione breve (come whatis)"]],
        see: ["apropos(1)", "whatis(1)", "info(1)"]
    },
    {
        name: "apropos", section: 1, summary: "cerca nei nomi e nelle descrizioni delle pagine di manuale",
        synopsis: ["apropos PAROLA..."],
        description: ["Scrive le pagine di manuale il cui nome o la cui descrizione breve contiene PAROLA. È lo stesso di man -k: serve quando non si ricorda il nome del comando."],
        options: [],
        see: ["man(1)", "whatis(1)"]
    },
    {
        name: "whatis", section: 1, summary: "mostra la descrizione breve di una pagina di manuale",
        synopsis: ["whatis PAGINA..."],
        description: ["Scrive, in una riga, a che cosa serve un comando. È lo stesso di man -f."],
        options: [],
        see: ["man(1)", "apropos(1)"]
    },
    {
        name: "info", section: 1, summary: "legge la documentazione nel formato Info",
        synopsis: ["info [ARGOMENTO]"],
        description: ["Le pagine Info sono spesso più ampie delle pagine man e sono divise in nodi collegati tra loro, un po' come le pagine di un sito. Senza argomenti mostra il menu di partenza.",
            "Su un sistema vero ci si muove con n (nodo successivo), p (precedente), u (su di un livello), Invio su un collegamento e q per uscire."],
        options: [],
        see: ["man(1)"]
    }
];

const manFind = (name, section) => SIM_MAN.filter(page => page.name === name && (!section || page.section === section)).sort((a, b) => a.section - b.section)[0];

// Testo a capo sulla larghezza del terminale, con un rientro
function manWrap(text, indent, width) {
    const lines = [];
    let line = "";
    for (const word of text.split(" ")) {
        if (line && indent + line.length + 1 + word.length > width) {
            lines.push(" ".repeat(indent) + line);
            line = word;
        } else {
            line = line ? `${line} ${word}` : word;
        }
    }
    if (line) lines.push(" ".repeat(indent) + line);
    return lines;
}

function manPageText(page, columns = 80) {
    const width = Math.max(30, Math.min(columns, 78));
    const title = `${page.name.toUpperCase()}(${page.section})`;
    const lines = [`${title}  ${MAN_SECTIONS[page.section]}  ${title}`, "", "NOME", ...manWrap(`${page.name} - ${page.summary}`, 7, width), "", "SINTASSI"];
    page.synopsis.forEach(line => lines.push(...manWrap(line, 7, width)));
    lines.push("", "DESCRIZIONE");
    page.description.forEach((paragraph, index) => {
        if (index) lines.push("");
        lines.push(...manWrap(paragraph, 7, width));
    });
    if (page.options.length) {
        lines.push("", "OPZIONI");
        page.options.forEach(([option, text]) => lines.push(...manWrap(option, 7, width), ...manWrap(text, 14, width)));
    }
    if (page.see.length) lines.push("", "VEDI ANCHE", ...manWrap(page.see.join(", "), 7, width));
    return lines.join("\n") + "\n";
}

// La riga di man -k, apropos e whatis
const manSummaryLine = page => `${`${page.name} (${page.section})`.padEnd(20)} - ${page.summary}`;

function aproposRun(name, words) {
    const res = simOutput();
    if (!words.length) {
        res.fail(`${name}: che cosa cerco? Scrivi una parola, per esempio: ${name === "man" ? "man -k" : name} directory`);
        return res;
    }
    for (const word of words) {
        const needle = word.toLowerCase();
        const found = SIM_MAN.filter(page => page.name.includes(needle) || page.summary.toLowerCase().includes(needle));
        if (!found.length) res.fail(`${word}: niente di appropriato.`, 16);
        found.forEach(page => res.print(manSummaryLine(page)));
    }
    return res;
}

function whatisRun(name, words) {
    const res = simOutput();
    if (!words.length) {
        res.fail(`${name}: di quale pagina vuoi la descrizione? Per esempio: whatis ls`);
        return res;
    }
    for (const word of words) {
        const found = SIM_MAN.filter(page => page.name === word);
        if (!found.length) res.fail(`${word}: niente di appropriato.`, 16);
        found.forEach(page => res.print(manSummaryLine(page)));
    }
    return res;
}

function manRun(sh, args) {
    if (args[0] === "-k") return aproposRun("man", args.slice(1));
    if (args[0] === "-f") return whatisRun("man", args.slice(1));
    if (args[0] && args[0].startsWith("-")) return { err: `man: nel simulatore ci sono solo le opzioni -k e -f (vedi man man)\n`, code: 1 };
    let words = [...args];
    let section = null;
    if (/^[1-9]$/.test(words[0] || "") && words.length > 1) section = Number(words.shift());
    if (!words.length) return { err: "Quale pagina di manuale vuoi?\nPer esempio, prova «man man».\n", code: 1 };
    const res = simOutput();
    words.forEach((word, index) => {
        const page = manFind(word, section);
        if (page) {
            if (index) res.out += "\n";
            res.out += manPageText(page, sh.columns);
        } else if (section && manFind(word)) {
            res.fail(`Nessuna voce di manuale per ${word} nella sezione ${section}`, 16);
        } else if (SIM_COMMANDS[word] || SIM_UNAVAILABLE[word]) {
            res.fail(`Nessuna voce di manuale per ${word} (su un sistema vero c'è; nel simulatore ci sono le pagine di: ${[...new Set(SIM_MAN.map(item => item.name))].join(", ")})`, 16);
        } else {
            res.fail(`Nessuna voce di manuale per ${word}`, 16);
        }
    });
    return res;
}

// info: il menu di partenza, oppure il nodo di un argomento
function infoRun(sh, args) {
    const width = Math.max(30, Math.min(sh.columns || 80, 78));
    const topics = args.filter(arg => !arg.startsWith("-"));
    const moves = "In info ci si muove con: n (nodo successivo), p (precedente), u (su), q (esci).";
    if (!topics.length) {
        const menu = SIM_MAN.filter(page => page.section === 1).map(page => `* ${page.name}: (${page.name}).`.padEnd(24) + ` ${page.summary}`);
        return { out: ["File: dir,  Node: Top,  This is the top of the INFO tree", "", ...manWrap("Questo è il menu di partenza di Info: ogni riga che inizia con * porta a un argomento.", 0, width), "", "* Menu:", "", ...menu, "", ...manWrap(moves, 0, width)].join("\n") + "\n" };
    }
    const page = manFind(topics[0]);
    if (!page) return { err: `info: nessuna voce di menu «${topics[0]}» nel nodo «(dir)Top»\n`, code: 1 };
    const lines = [`File: ${page.name}.info,  Node: Top,  Up: (dir)`, "", `${page.name}: ${page.summary}`, "*".repeat(Math.min(width, page.name.length + page.summary.length + 2)), ""];
    page.description.forEach(paragraph => lines.push(...manWrap(paragraph, 0, width), ""));
    if (page.options.length) {
        lines.push("* Menu: le opzioni", "");
        page.options.forEach(([option, text]) => lines.push(`'${option}'`, ...manWrap(text, 5, width)));
        lines.push("");
    }
    lines.push(...manWrap(moves, 0, width));
    return { out: lines.join("\n") + "\n" };
}

// COMANDO --help: l'aiuto breve, scritto dal comando stesso (null se il simulatore non ce l'ha)
function simHelpText(name) {
    const page = manFind(name);
    if (!page || page.section === 5) return null;
    const lines = page.synopsis.map((line, index) => `${index ? "  o: " : "Uso: "}${line}`);
    lines.push(`${page.summary[0].toUpperCase()}${page.summary.slice(1)}.`);
    if (page.options.length) {
        lines.push("");
        const width = Math.max(...page.options.map(([option]) => option.length));
        page.options.forEach(([option, text]) => lines.push(`  ${option.padEnd(width)}  ${text}`));
    }
    lines.push("", `Per saperne di più: man ${page.name}`);
    return lines.join("\n") + "\n";
}

// help NOME: l'aiuto dei comandi interni della shell, che non hanno una pagina di manuale
const SIM_BUILTIN_HELP = {
    cd: ["cd [DIRECTORY]", "Cambia la directory corrente. Senza argomenti torna nella home; «cd -» torna nella directory di prima; «cd ..» sale di un livello."],
    pwd: ["pwd", "Scrive il percorso completo della directory corrente."],
    echo: ["echo [-n] [ARGOMENTO]...", "Scrive gli argomenti, separati da uno spazio, e va a capo. Con -n non va a capo."],
    export: ["export NOME[=VALORE]...", "Rende una variabile disponibile anche ai programmi e agli script avviati dalla shell."],
    unset: ["unset NOME...", "Elimina una variabile."],
    type: ["type NOME...", "Dice come la shell interpreta un nome: comando interno o programma, e dove si trova."],
    history: ["history", "Mostra l'elenco numerato dei comandi già scritti."],
    exit: ["exit [N]", "Chiude la shell o lo script con il codice di uscita N (senza N: quello dell'ultimo comando)."],
    test: ["test ESPRESSIONE", "Valuta una condizione ed esce con 0 se è vera, 1 se è falsa. Per esempio: test -f FILE, test -d DIRECTORY, test A = B, test 3 -lt 5."],
    "[": ["[ ESPRESSIONE ]", "Come test, ma l'ultimo argomento deve essere ]. Servono gli spazi dopo [ e prima di ]."],
    help: ["help [NOME]", "Mostra l'aiuto di un comando interno della shell. Per i programmi si usano man NOME e NOME --help."],
    break: ["break", "Esce dal ciclo for in corso."],
    continue: ["continue", "Passa subito al giro successivo del ciclo for."],
    true: ["true", "Non fa niente, con successo: il codice di uscita è 0."],
    false: ["false", "Non fa niente, senza successo: il codice di uscita è 1."],
    clear: ["clear", "Pulisce lo schermo del terminale."]
};

function helpRun(sh, args) {
    if (!args.length) return { out: SIM_HELP.join("\n") + "\n" };
    const res = simOutput();
    const width = Math.max(30, Math.min(sh.columns || 80, 78));
    for (const name of args) {
        const entry = SIM_BUILTIN_HELP[name];
        if (entry) {
            res.print(`${name}: ${entry[0]}`);
            manWrap(entry[1], 4, width).forEach(line => res.print(line));
        } else {
            res.fail(`bash: help: nessun argomento della guida corrisponde a «${name}». ${SIM_COMMANDS[name] ? `È un programma, non un comando interno: prova «man ${name}» o «${name} --help».` : "Prova «man -k " + name + "»."}`);
        }
    }
    return res;
}

// ---- locate e updatedb ----

// Un percorso è visibile a locate se l'utente può arrivarci
function locateVisible(sh, path) {
    try {
        return Boolean(simLookup(sh, path, false).node);
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
        return false;
    }
}

function locateRun(sh, args) {
    const { flags, operands } = parseOptions(args, "ic", "", { "ignore-case": "i", count: "c" });
    if (!operands.length) return { err: "locate: nessun modello da cercare. Per esempio: locate passwd\n", code: 1 };
    const fold = text => flags.i ? text.toLowerCase() : text;
    const matchers = operands.map(pattern => {
        // Con i caratteri jolly il modello deve corrispondere a tutto il percorso
        if (/[*?[]/.test(pattern)) {
            const regex = new RegExp(`^${pattern.split("").map(c => c === "*" ? ".*" : c === "?" ? "." : c.replace(/[.+^${}()|\\\]]/g, "\\$&")).join("")}$`, flags.i ? "i" : "");
            return path => regex.test(path);
        }
        return path => fold(path).includes(fold(pattern));
    });
    const found = (sh.locateDb || []).filter(path => matchers.some(match => match(path)) && locateVisible(sh, path));
    if (flags.c) return { out: `${found.length}\n`, code: found.length ? 0 : 1 };
    return { out: found.map(path => `${path}\n`).join(""), code: found.length ? 0 : 1 };
}

function updatedbRun(sh) {
    if (sh.user !== "root") return { err: "updatedb: impossibile aggiornare «/var/lib/plocate/plocate.db»: Permesso negato (il database si aggiorna da amministratore: sudo updatedb)\n", code: 1 };
    sh.locateDb = simAllPaths(sh);
    return {};
}

delete SIM_UNAVAILABLE.locate;
delete SIM_UNAVAILABLE.updatedb;
Object.assign(SIM_COMMANDS, {
    man: { run: manRun },
    apropos: { run: (sh, args) => aproposRun("apropos", args) },
    whatis: { run: (sh, args) => whatisRun("whatis", args) },
    info: { run: infoRun },
    help: { run: helpRun },
    locate: { run: locateRun },
    updatedb: { run: updatedbRun }
});
