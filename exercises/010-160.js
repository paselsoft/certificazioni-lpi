// Esercizi al terminale per Linux Essentials 1.6, scritti per questa app.
// Ogni esercizio parte dal file system di base (shell-sim.js, simBaseTree) più setup:
//   setup: { files, dirs, links, cwd, prepare: [comandi eseguiti prima, senza mostrarli] }
//   goals: ciò che va raggiunto, ognuno con il testo mostrato (text):
//     { cwd }                                    la directory corrente
//     { path, is: "dir" | "file" | "link" | "absent", content, mode, owner, target, sameAs }
//     { path, archive: "tar" | "tar.gz" | "gzip" | "zip", has: [nomi] }
//     { variable, value, exported }
//     { output: "same" }                         l'ultimo comando mostra lo stesso testo della soluzione
//     { output: "words", words: [...] }          l'ultimo comando mostra (almeno) queste parole
//     { command: "regex" }                       com'è scritto l'ultimo comando
//     { noErrors: true }                         l'ultimo comando non mostra errori
//   solution: i comandi di una soluzione (tools/check-shell.js li prova anche in Bash vero, se
//   bash non è false); hint: un suggerimento; explain: cosa ricordare, dopo la soluzione.
// Nei testi, `così` diventa codice.
addExercises("010-160", [
    // ---- 2.1 Nozioni di base sulla command line ----
    {
        id: "t2.1-01", title: "Una variabile",
        task: "Crea la variabile `CITTA` con il valore `Roma`, poi stampane il valore con `echo`.",
        goals: [
            { text: "La variabile `CITTA` vale `Roma`", variable: "CITTA", value: "Roma" },
            { text: "`echo` mostra il valore della variabile", output: "same", command: "^echo\\b.*\\$\\{?CITTA" }
        ],
        hint: "Per assegnare: nome, `=` e valore, senza spazi. Per leggere: `$` davanti al nome.",
        solution: ["CITTA=Roma", "echo $CITTA"],
        explain: "`CITTA=Roma` crea una variabile della shell; `$CITTA` viene sostituito dal suo valore prima di eseguire `echo`."
    },
    {
        id: "t2.1-02", title: "Il dollaro tra virgolette",
        task: "Stampa con `echo` esattamente questa frase, simbolo del dollaro compreso: `Il biglietto costa $5`",
        goals: [{ text: "Sullo schermo compare `Il biglietto costa $5`", output: "same", command: "^echo\\b" }],
        hint: "Tra virgolette doppie `$5` verrebbe sostituito (dal quinto argomento, che non c'è). Servono le virgolette singole, oppure `\\$`.",
        solution: ["echo 'Il biglietto costa $5'"],
        explain: "Le virgolette singole tengono tutto com'è scritto: niente variabili, niente caratteri jolly. In alternativa `echo \"Il biglietto costa \\$5\"`."
    },
    {
        id: "t2.1-03", title: "Allungare il PATH", bash: false,
        task: "I tuoi script stanno in `/home/anna/bin`. Aggiungi questa directory in fondo alla variabile `PATH`, senza perdere quelle che ci sono già, e rendi la variabile disponibile ai programmi.",
        goals: [{ text: "`PATH` finisce con `:/home/anna/bin` e contiene ancora `/usr/bin`", variable: "PATH", value: "/usr/local/bin:/usr/bin:/bin:/home/anna/bin", exported: true }],
        hint: "Il nuovo valore è il vecchio (`$PATH`), più `:`, più la nuova directory. Davanti, `export`.",
        solution: ["export PATH=$PATH:/home/anna/bin"],
        explain: "Con `export PATH=$PATH:/home/anna/bin` la shell cerca i comandi anche nella nuova directory, dopo le altre. Per renderlo permanente si scrive la stessa riga in `~/.bashrc`."
    },
    {
        id: "t2.1-04", title: "Che tipo di comando è?",
        task: "Scopri con un solo comando se `cd` e `cp` sono comandi interni della shell o programmi esterni.",
        goals: [{ text: "Compare la risposta per `cd` e per `cp`", output: "same", command: "^type\\b" }],
        hint: "Il comando che descrive come la shell interpreta un nome è `type`.",
        solution: ["type cd cp"],
        explain: "`cd` è un comando interno (deve cambiare la directory della shell stessa); `cp` è un programma in `/usr/bin`."
    },

    // ---- 2.3 Directory ed elenchi di file ----
    {
        id: "t2.3-01", title: "Dove sono?",
        task: "Entra nella directory `documenti` della tua home e poi mostra il percorso completo della directory in cui ti trovi.",
        goals: [
            { text: "Sei in `/home/anna/documenti`", cwd: "/home/anna/documenti" },
            { text: "Hai mostrato il percorso con `pwd`", output: "same", command: "^pwd\\b" }
        ],
        hint: "`cd` per entrare, `pwd` per vedere dove sei.",
        solution: ["cd documenti", "pwd"],
        explain: "`pwd` stampa il percorso assoluto della directory corrente: qui `/home/anna/documenti`."
    },
    {
        id: "t2.3-02", title: "I file nascosti",
        task: "Elenca il contenuto della tua home mostrando anche i file nascosti.",
        goals: [{ text: "Nell'elenco compare `.bashrc`", output: "words", words: [".bashrc", "documenti", "note.txt"], command: "^ls\\b" }],
        hint: "I file nascosti hanno il nome che inizia con un punto; `ls` li mostra con un'opzione.",
        solution: ["ls -a"],
        explain: "`ls -a` mostra tutto, anche `.` e `..`; `ls -A` mostra i nascosti ma non `.` e `..`."
    },
    {
        id: "t2.3-03", title: "Tutto il contenuto, anche dentro",
        task: "Elenca il contenuto della directory `progetti` e di tutte le sue sottodirectory, con un solo comando.",
        setup: { files: { "/home/anna/progetti/sito/index.html": "<h1>Ciao</h1>\n", "/home/anna/progetti/sito/css/stile.css": "h1 { color: navy; }\n", "/home/anna/progetti/appunti.txt": "idee\n" } },
        goals: [{ text: "L'elenco arriva fino a `stile.css`", output: "words", words: ["progetti/sito:", "progetti/sito/css:", "stile.css"], command: "^ls\\b" }],
        hint: "Serve l'elenco ricorsivo: un'opzione di `ls` con la R maiuscola.",
        solution: ["ls -R progetti"],
        explain: "`ls -R` scende in ogni sottodirectory e ne mostra il contenuto con un titolo. Attenzione: `ls -r` (minuscola) inverte solo l'ordine."
    },
    {
        id: "t2.3-04", title: "Percorso relativo",
        task: "Sei in `/home/anna/foto`. Spostati in `/home/anna/documenti` usando un percorso relativo (che non inizia con `/`).",
        setup: { cwd: "/home/anna/foto" },
        goals: [
            { text: "Sei in `/home/anna/documenti`", cwd: "/home/anna/documenti" },
            { text: "Il percorso del comando `cd` è relativo", command: "^cd\\s+[^/~\\s]" }
        ],
        hint: "`..` è la directory che contiene quella dove sei.",
        solution: ["cd ../documenti"],
        explain: "`..` porta in `/home/anna`, poi si entra in `documenti`. Il percorso assoluto sarebbe `/home/anna/documenti` (o `~/documenti`)."
    },
    {
        id: "t2.3-05", title: "Il più recente per primo",
        task: "Elenca i file della directory `documenti` in formato lungo, mettendo per primi quelli modificati più di recente.",
        goals: [{ text: "Elenco lungo di `documenti`, dal più recente", output: "same", command: "^ls\\b" }],
        hint: "Formato lungo con `-l`, ordinamento per data con `-t`.",
        solution: ["ls -lt documenti"],
        explain: "`ls -lt` ordina per data di modifica, dal più recente; con `-ltr` si parte dal più vecchio."
    },

    // ---- 2.4 Creazione, spostamento ed eliminazione di file ----
    {
        id: "t2.4-01", title: "Directory annidate",
        task: "Crea la struttura di directory `viaggi/2027/foto` con un solo comando (nessuna delle tre esiste).",
        goals: [{ text: "Esiste `viaggi/2027/foto`", path: "/home/anna/viaggi/2027/foto", is: "dir" }, { text: "Con un solo comando `mkdir`", command: "^mkdir\\b" }],
        hint: "`mkdir` da solo si lamenta se manca la directory madre: c'è un'opzione che crea anche quelle intermedie.",
        solution: ["mkdir -p viaggi/2027/foto"],
        explain: "`mkdir -p` crea tutte le directory che mancano lungo il percorso, e non dà errore se esistono già."
    },
    {
        id: "t2.4-02", title: "Rinominare",
        task: "Rinomina il file `bozza.txt` in `relazione.txt`.",
        setup: { files: { "/home/anna/bozza.txt": "Prima stesura della relazione.\n" } },
        goals: [
            { text: "`bozza.txt` non c'è più", path: "/home/anna/bozza.txt", is: "absent" },
            { text: "`relazione.txt` ha il testo della bozza", path: "/home/anna/relazione.txt", is: "file", content: "Prima stesura della relazione.\n" }
        ],
        hint: "In Linux rinominare vuol dire spostare con un altro nome.",
        solution: ["mv bozza.txt relazione.txt"],
        explain: "`mv vecchio nuovo` rinomina; se `nuovo` fosse una directory esistente, ci sposterebbe dentro il file."
    },
    {
        id: "t2.4-03", title: "Copiare una directory",
        task: "Copia la directory `foto`, con tutto il contenuto, in una nuova directory `foto-backup`.",
        goals: [
            { text: "`foto-backup/mare.jpg` esiste", path: "/home/anna/foto-backup/mare.jpg", is: "file", content: "JPEG mare\n" },
            { text: "`foto` è ancora al suo posto", path: "/home/anna/foto/mare.jpg", is: "file" }
        ],
        hint: "`cp` da solo salta le directory: serve l'opzione ricorsiva.",
        solution: ["cp -r foto foto-backup"],
        explain: "`cp -r` (o `-R`) copia la directory e tutto quello che contiene. Se `foto-backup` esistesse già, la copia finirebbe in `foto-backup/foto`."
    },
    {
        id: "t2.4-04", title: "Eliminare una directory piena",
        task: "Elimina la directory `vecchi` con tutto quello che contiene.",
        setup: { files: { "/home/anna/vecchi/a.txt": "a\n", "/home/anna/vecchi/sotto/b.txt": "b\n" } },
        goals: [{ text: "`vecchi` non esiste più", path: "/home/anna/vecchi", is: "absent" }],
        hint: "`rmdir` elimina solo directory vuote; `rm` ha un'opzione ricorsiva.",
        solution: ["rm -r vecchi"],
        explain: "`rm -r` elimina la directory e il suo contenuto, senza cestino. Con `-f` non chiede conferme: va usato con attenzione."
    },
    {
        id: "t2.4-05", title: "Tutti i .jpg in un colpo",
        task: "Nella tua home ci sono tre foto `.jpg` e due file `.txt`. Sposta tutte le foto nella directory `foto` con un solo comando, lasciando i `.txt` dove sono.",
        setup: { files: { "/home/anna/gita.jpg": "JPEG gita\n", "/home/anna/cena.jpg": "JPEG cena\n", "/home/anna/Duomo.jpg": "JPEG duomo\n", "/home/anna/elenco.txt": "da fare\n" } },
        goals: [
            { text: "Le tre foto sono in `foto`", path: "/home/anna/foto/Duomo.jpg", is: "file" },
            { text: "`gita.jpg` è in `foto`", path: "/home/anna/foto/gita.jpg", is: "file" },
            { text: "Nella home non ci sono più `.jpg`", path: "/home/anna/cena.jpg", is: "absent" },
            { text: "`elenco.txt` è rimasto nella home", path: "/home/anna/elenco.txt", is: "file" }
        ],
        hint: "Il carattere jolly `*` vale qualsiasi sequenza di caratteri: `*.jpg` sono tutti i nomi che finiscono con `.jpg`.",
        solution: ["mv *.jpg foto"],
        explain: "La shell sostituisce `*.jpg` con l'elenco dei file prima di eseguire `mv`; quando ci sono più file da spostare, l'ultimo argomento dev'essere una directory."
    },
    {
        id: "t2.4-06", title: "Un solo carattere",
        task: "Ci sono `report1.txt` ... `report9.txt` e `report10.txt`. Elimina con un solo comando i report da 1 a 9, ma non `report10.txt`.",
        setup: { files: Object.fromEntries([...Array(10)].map((_, i) => [`/home/anna/report${i + 1}.txt`, `report ${i + 1}\n`])) },
        goals: [
            { text: "`report1.txt` ... `report9.txt` eliminati", path: "/home/anna/report5.txt", is: "absent" },
            { text: "`report9.txt` eliminato", path: "/home/anna/report9.txt", is: "absent" },
            { text: "`report10.txt` è ancora lì", path: "/home/anna/report10.txt", is: "file" }
        ],
        hint: "`?` vale esattamente un carattere: `report?.txt` non prende `report10.txt`.",
        solution: ["rm report?.txt"],
        explain: "`report?.txt` corrisponde ai nomi con un solo carattere al posto del `?`. Anche `rm report[1-9].txt` funziona."
    },

    // ---- 3.1 Archiviazione ----
    {
        id: "t3.1-01", title: "Un archivio compresso",
        task: "Crea l'archivio `documenti.tar.gz`, compresso con gzip, con dentro la directory `documenti`.",
        goals: [{ text: "`documenti.tar.gz` è un archivio tar compresso con gzip con dentro `documenti/lettera.txt`", path: "/home/anna/documenti.tar.gz", archive: "tar.gz", has: ["documenti/lettera.txt", "documenti/spesa.txt"] }],
        hint: "`tar` con `c` (crea), `z` (gzip) e `f` seguita dal nome dell'archivio; poi cosa metterci.",
        solution: ["tar -czf documenti.tar.gz documenti"],
        explain: "`tar -czf archivio.tar.gz cosa`: l'ordine conta solo per `f`, che dev'essere seguita dal nome dell'archivio."
    },
    {
        id: "t3.1-02", title: "Estrarre un archivio",
        task: "Nella tua home c'è `sito.tar.gz`. Estrai il suo contenuto nella directory corrente.",
        setup: { files: { "/home/anna/sito/index.html": "<h1>Benvenuti</h1>\n", "/home/anna/sito/css/stile.css": "body { margin: 0; }\n" }, prepare: ["tar -czf sito.tar.gz sito", "rm -r sito"] },
        goals: [{ text: "C'è `sito/index.html`", path: "/home/anna/sito/index.html", is: "file", content: "<h1>Benvenuti</h1>\n" }, { text: "C'è `sito/css/stile.css`", path: "/home/anna/sito/css/stile.css", is: "file" }],
        hint: "`x` estrae; GNU tar riconosce da solo la compressione, ma puoi aggiungere `z`.",
        solution: ["tar -xzf sito.tar.gz"],
        explain: "`tar -xf archivio` estrae nella directory corrente; con `-C directory` si sceglie un'altra destinazione."
    },
    {
        id: "t3.1-03", title: "Guardare dentro senza estrarre",
        task: "Mostra l'elenco dei file contenuti in `backup.tar.gz` senza estrarli.",
        setup: { files: { "/home/anna/lavoro/piano.txt": "piano\n", "/home/anna/lavoro/costi.txt": "costi\n" }, prepare: ["tar -czf backup.tar.gz lavoro", "rm -r lavoro"] },
        goals: [{ text: "Compare l'elenco con `lavoro/piano.txt`", output: "same", command: "^tar\\b" }],
        hint: "L'operazione di tar che elenca il contenuto è `t`.",
        solution: ["tar -tzf backup.tar.gz"],
        explain: "`tar -tf` (t come «table of contents») mostra cosa c'è nell'archivio; con `v` aggiunge permessi, dimensioni e date."
    },
    {
        id: "t3.1-04", title: "Comprimere un file",
        task: "Comprimi il file `registro.log` con gzip (al suo posto deve restare solo la versione compressa).",
        setup: { files: { "/home/anna/registro.log": "riga 1\nriga 2\nriga 3\n" } },
        goals: [
            { text: "C'è `registro.log.gz`, compresso con gzip", path: "/home/anna/registro.log.gz", archive: "gzip" },
            { text: "`registro.log` non c'è più", path: "/home/anna/registro.log", is: "absent" }
        ],
        hint: "Basta il nome del programma seguito dal nome del file.",
        solution: ["gzip registro.log"],
        explain: "`gzip file` crea `file.gz` e toglie l'originale (con `-k` lo tiene). Per tornare indietro: `gunzip registro.log.gz`."
    },
    {
        id: "t3.1-05", title: "Un file zip",
        task: "Crea l'archivio `foto.zip` con dentro la directory `foto` e tutto il suo contenuto.",
        goals: [{ text: "`foto.zip` contiene `foto/mare.jpg` e `foto/montagna.jpg`", path: "/home/anna/foto.zip", archive: "zip", has: ["foto/mare.jpg", "foto/montagna.jpg"] }],
        hint: "Con `zip` il primo nome è l'archivio; per entrare nelle directory serve `-r`.",
        solution: ["zip -r foto.zip foto"],
        explain: "`zip -r archivio.zip directory`; per estrarre `unzip archivio.zip`, per vedere il contenuto `unzip -l archivio.zip`."
    },

    // ---- 3.2 Ricerca ed estrazione di dati dai file ----
    {
        id: "t3.2-01", title: "Gli errori nel log",
        task: "Mostra le righe del file `/var/log/app.log` che contengono la parola `ERROR` (in maiuscolo).",
        goals: [{ text: "Compaiono le due righe con `ERROR`", output: "same", command: "\\bgrep\\b" }],
        hint: "`grep testo file`.",
        solution: ["grep ERROR /var/log/app.log"],
        explain: "`grep` mostra le righe che contengono il testo; distingue maiuscole e minuscole, a meno di usare `-i`."
    },
    {
        id: "t3.2-02", title: "Quanti errori?",
        task: "Conta quante righe di `/var/log/app.log` contengono «error», scritto in qualsiasi modo (maiuscole o minuscole).",
        goals: [{ text: "Compare il numero 3", output: "same", command: "\\bgrep\\b" }],
        hint: "Due opzioni di `grep`: una ignora maiuscole e minuscole, l'altra conta. Oppure una pipe verso `wc -l`.",
        solution: ["grep -ic error /var/log/app.log"],
        explain: "`grep -i -c` (o `grep -i error file | wc -l`) dà 3: due righe con `ERROR` e una con `error`."
    },
    {
        id: "t3.2-03", title: "I nomi degli utenti",
        task: "Salva nel file `utenti.txt` i nomi degli utenti del sistema: il primo campo di ogni riga di `/etc/passwd`, dove i campi sono separati da `:`.",
        goals: [{ text: "`utenti.txt` contiene i nomi, uno per riga", path: "/home/anna/utenti.txt", is: "file", content: "root\nanna\nluca\nwww-data\n" }],
        hint: "`cut` con il separatore (`-d`) e il campo (`-f`); poi `>` per scrivere nel file.",
        solution: ["cut -d: -f1 /etc/passwd > utenti.txt"],
        explain: "`cut -d: -f1` taglia ogni riga ai `:` e tiene il primo pezzo; `>` crea (o sostituisce) il file con l'output."
    },
    {
        id: "t3.2-04", title: "Ordinata e senza doppioni",
        task: "Scrivi nel file `spesa-ordinata.txt` la lista di `documenti/spesa.txt` in ordine alfabetico e senza ripetizioni.",
        goals: [{ text: "`spesa-ordinata.txt` è ordinata e senza doppioni", path: "/home/anna/spesa-ordinata.txt", is: "file", content: "latte\nmele\npane\nuova\n" }],
        hint: "`uniq` toglie solo i doppioni vicini: prima bisogna ordinare. Oppure `sort -u`.",
        solution: ["sort documenti/spesa.txt | uniq > spesa-ordinata.txt"],
        explain: "`sort | uniq` (o `sort -u`) è la coppia classica; con `uniq -c` si contano anche le ripetizioni."
    },
    {
        id: "t3.2-05", title: "Aggiungere in fondo",
        task: "Aggiungi la riga `burro` in fondo a `documenti/spesa.txt`, senza cancellare quello che c'è già.",
        goals: [{ text: "`spesa.txt` ha le righe di prima più `burro`", path: "/home/anna/documenti/spesa.txt", is: "file", content: "pane\nlatte\nmele\npane\nuova\nlatte\npane\nburro\n" }],
        hint: "`>` sostituirebbe tutto il contenuto; con due `>` si aggiunge.",
        solution: ["echo burro >> documenti/spesa.txt"],
        explain: "`>>` aggiunge in fondo al file (e lo crea se non esiste); `>` lo svuota prima di scrivere."
    },
    {
        id: "t3.2-06", title: "L'inizio del log",
        task: "Mostra solo le prime 3 righe di `/var/log/app.log`.",
        goals: [{ text: "Compaiono le prime 3 righe", output: "same", command: "\\bhead\\b" }],
        hint: "`head` mostra l'inizio; `-n` dice quante righe.",
        solution: ["head -n 3 /var/log/app.log"],
        explain: "`head -n 3` (o `head -3`) mostra le prime 3 righe; `tail -n 3` le ultime 3."
    },
    {
        id: "t3.2-07", title: "Senza messaggi di errore", bash: false,
        task: "Cerca con `find`, partendo da `/`, i file che si chiamano `passwd`, senza far comparire i messaggi «Permesso negato».",
        goals: [
            { text: "Compare `/etc/passwd`", output: "words", words: ["/etc/passwd"], command: "^find\\b" },
            { text: "Nessun messaggio di errore sullo schermo", noErrors: true }
        ],
        hint: "I messaggi di errore escono dal canale 2: si mandano in `/dev/null` con `2>`.",
        solution: ["find / -name passwd 2>/dev/null"],
        explain: "`2>/dev/null` butta via lo standard error; i risultati (standard output) arrivano comunque sullo schermo."
    },
    {
        id: "t3.2-08", title: "Righe che iniziano così",
        task: "Mostra le righe di `/etc/passwd` che iniziano con `anna` (e solo quelle che iniziano così).",
        goals: [{ text: "Compare solo la riga di anna", output: "same", command: "\\bgrep\\b.*\\^" }],
        hint: "Nelle espressioni regolari `^` indica l'inizio della riga.",
        solution: ["grep '^anna' /etc/passwd"],
        explain: "`^anna` trova «anna» solo all'inizio della riga; le virgolette evitano sorprese con i caratteri speciali."
    },

    // ---- 3.3 Script ----
    {
        id: "t3.3-01", title: "Il primo script",
        task: "Crea lo script `saluta.sh` con due righe: `#!/bin/bash` e `echo Ciao`. Poi rendilo eseguibile per il proprietario.",
        goals: [
            { text: "`saluta.sh` contiene le due righe", path: "/home/anna/saluta.sh", is: "file", content: "#!/bin/bash\necho Ciao\n" },
            { text: "`saluta.sh` è eseguibile per il proprietario", path: "/home/anna/saluta.sh", modeHas: "100" }
        ],
        hint: "Senza editor: `echo '...' > file` scrive la prima riga, `>>` aggiunge la seconda. Poi `chmod`.",
        solution: ["echo '#!/bin/bash' > saluta.sh", "echo 'echo Ciao' >> saluta.sh", "chmod u+x saluta.sh"],
        explain: "La prima riga (shebang) dice quale interprete usare; `chmod u+x` dà il permesso di esecuzione. Su un sistema vero lo avvieresti con `./saluta.sh` (il simulatore non esegue gli script)."
    },

    // ---- 5.3 Permessi e proprietà ----
    {
        id: "t5.3-01", title: "Solo per me",
        task: "Imposta i permessi del file `diario.txt` in modo che solo tu possa leggerlo e modificarlo: `rw-------`.",
        setup: { files: { "/home/anna/diario.txt": "Caro diario...\n" } },
        goals: [{ text: "I permessi di `diario.txt` sono `rw-------`", path: "/home/anna/diario.txt", mode: "600" }],
        hint: "In forma numerica: lettura 4 + scrittura 2 per il proprietario, 0 per gruppo e altri.",
        solution: ["chmod 600 diario.txt"],
        explain: "`chmod 600` = rw- per il proprietario, niente per gli altri. In forma simbolica: `chmod u=rw,go= diario.txt`."
    },
    {
        id: "t5.3-02", title: "Eseguibile per il proprietario",
        task: "Lo script `backup.sh` ha i permessi `rw-r--r--`. Aggiungi il permesso di esecuzione solo per il proprietario.",
        setup: { files: { "/home/anna/backup.sh": "#!/bin/bash\ntar -czf backup.tar.gz documenti\n" } },
        goals: [{ text: "I permessi di `backup.sh` sono `rwxr--r--`", path: "/home/anna/backup.sh", mode: "744" }],
        hint: "Forma simbolica: chi (`u`), `+`, cosa (`x`).",
        solution: ["chmod u+x backup.sh"],
        explain: "`chmod u+x` aggiunge l'esecuzione al proprietario e lascia il resto com'è; `chmod 744` fa lo stesso in forma numerica."
    },
    {
        id: "t5.3-03", title: "Togliere la lettura agli altri",
        task: "Togli agli «altri» (né proprietario né gruppo) il permesso di leggere `note.txt`, senza cambiare gli altri permessi.",
        goals: [{ text: "I permessi di `note.txt` sono `rw-r-----`", path: "/home/anna/note.txt", mode: "640" }],
        hint: "`o` sono gli altri, `-` toglie, `r` è la lettura.",
        solution: ["chmod o-r note.txt"],
        explain: "Da `rw-r--r--` (644) a `rw-r-----` (640)."
    },
    {
        id: "t5.3-04", title: "Cambiare proprietario", bash: false,
        task: "Rendi `luca` il proprietario del file `condiviso.txt`. Solo l'amministratore può farlo: usa `sudo`.",
        setup: { files: { "/home/anna/condiviso.txt": "Appunti in comune\n" } },
        goals: [{ text: "Il proprietario di `condiviso.txt` è `luca`", path: "/home/anna/condiviso.txt", owner: "luca" }],
        hint: "`chown nuovo-proprietario file`, preceduto da `sudo`.",
        solution: ["sudo chown luca condiviso.txt"],
        explain: "Senza `sudo` il sistema risponde «Operazione non permessa»: un utente normale non può regalare i propri file. Con `chown luca:sviluppo` si cambia anche il gruppo."
    },
    {
        id: "t5.3-05", title: "Il gruppo può scrivere ovunque",
        task: "Dai al gruppo il permesso di scrittura sulla directory `progetti` e su tutto quello che contiene, con un solo comando.",
        setup: { files: { "/home/anna/progetti/sito/index.html": "<h1>Ciao</h1>\n", "/home/anna/progetti/note.txt": "note\n" } },
        goals: [
            { text: "Il gruppo può scrivere in `progetti`", path: "/home/anna/progetti", mode: "775" },
            { text: "Anche in `progetti/sito`", path: "/home/anna/progetti/sito", mode: "775" },
            { text: "E su `progetti/sito/index.html`", path: "/home/anna/progetti/sito/index.html", mode: "664" }
        ],
        hint: "`g+w` aggiunge la scrittura al gruppo; un'opzione di `chmod` scende in tutte le sottodirectory.",
        solution: ["chmod -R g+w progetti"],
        explain: "`chmod -R` applica la modifica a tutto l'albero: la forma simbolica `g+w` lascia invariati gli altri permessi di ogni file."
    },

    // ---- 5.4 Directory e file speciali ----
    {
        id: "t5.4-01", title: "Un link simbolico",
        task: "Crea nella tua home il link simbolico `hosts` che punta al file `/etc/hosts`.",
        goals: [{ text: "`hosts` è un link simbolico a `/etc/hosts`", path: "/home/anna/hosts", is: "link", target: "/etc/hosts" }],
        hint: "`ln` con l'opzione per i link simbolici; prima la destinazione, poi il nome del link.",
        solution: ["ln -s /etc/hosts hosts"],
        explain: "`ln -s destinazione nome`: l'ordine è come in `cp`. `ls -l hosts` mostra `hosts -> /etc/hosts`."
    },
    {
        id: "t5.4-02", title: "Un hard link",
        task: "Crea `promemoria.txt`, un hard link (non simbolico) al file `note.txt`.",
        goals: [{ text: "`promemoria.txt` e `note.txt` sono lo stesso file", path: "/home/anna/promemoria.txt", sameAs: "/home/anna/note.txt" }],
        hint: "È `ln` senza opzioni.",
        solution: ["ln note.txt promemoria.txt"],
        explain: "Un hard link è un altro nome per gli stessi dati: `ls -l` mostra 2 come numero di collegamenti, e cancellando `note.txt` i dati restano in `promemoria.txt`."
    },
    {
        id: "t5.4-03", title: "Una directory per tutti", bash: false,
        task: "Crea la directory `/tmp/scambio` dove tutti gli utenti possono creare file, ma ognuno può cancellare solo i propri (come `/tmp`).",
        goals: [{ text: "`/tmp/scambio` ha i permessi `rwxrwxrwt`", path: "/tmp/scambio", is: "dir", mode: "1777" }],
        hint: "Lettura, scrittura ed esecuzione per tutti (777) più lo sticky bit (1 davanti).",
        solution: ["mkdir /tmp/scambio", "chmod 1777 /tmp/scambio"],
        explain: "Lo sticky bit (la `t` finale) impedisce di cancellare i file degli altri; `chmod +t` lo aggiunge in forma simbolica."
    },
    {
        id: "t5.4-04", title: "I permessi di /tmp", bash: false,
        task: "Mostra in formato lungo i permessi della directory `/tmp` stessa, non dei file che contiene.",
        goals: [{ text: "Compare la riga di `/tmp` con `drwxrwxrwt`", output: "words", words: ["drwxrwxrwt", "/tmp"], command: "^ls\\b" }],
        hint: "`ls -l` su una directory ne mostra il contenuto: un'altra opzione mostra la directory stessa.",
        solution: ["ls -ld /tmp"],
        explain: "`ls -ld` mostra la riga della directory: la `t` finale è lo sticky bit."
    }
]);
