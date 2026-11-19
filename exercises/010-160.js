// Esercizi al terminale per Linux Essentials 1.6, scritti per questa app.
// Ogni esercizio parte dal file system di base (shell-sim.js, simBaseTree) più setup:
//   setup: { files, dirs, links, cwd, prepare: [comandi eseguiti prima, senza mostrarli] }
//   goals: ciò che va raggiunto, ognuno con il testo mostrato (text):
//     { cwd }                                    la directory corrente
//     { user }                                   l'utente della shell (dopo su o sudo -i)
//     { history: "regex" }                       uno dei comandi scritti nell'esercizio
//     { account, exists, shell, comment, uidBelow, groups, locked, password }   un utente
//     { group, exists, gid }                     un gruppo
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

    // ---- 2.2 Aiuto dalla riga di comando ----
    // (le pagine del simulatore sono scritte per l'app: non si confrontano con un sistema vero)
    {
        id: "t2.2-01", title: "La pagina di manuale", bash: false,
        task: "Apri la pagina di manuale del comando `cp` e cerca l'opzione che serve per copiare una directory.",
        goals: [{ text: "Sullo schermo c'è la pagina di manuale di `cp`", output: "same", command: "^man\\s+(1\\s+)?cp\\s*$" }],
        hint: "Il manuale si apre con `man` seguito dal nome del comando.",
        solution: ["man cp"],
        explain: "Ogni pagina ha le stesse parti: NOME, SINTASSI, DESCRIZIONE, OPZIONI. Su un sistema vero si scorre con le frecce, si cerca con `/parola` e si esce con `q`. L'opzione cercata è `-r`."
    },
    {
        id: "t2.2-02", title: "Non ricordo il nome", bash: false,
        task: "Non ricordi come si chiama il comando che comprime i file. Cerca nel manuale tutte le pagine che parlano di `comprime`.",
        goals: [{ text: "Compare l'elenco delle pagine che contengono `comprime`", output: "same", command: "^(man\\s+-k|apropos)\\s+comprime\\s*$" }],
        hint: "`man` ha un'opzione per cercare una parola nelle descrizioni brevi di tutte le pagine: `-k`. C'è anche un comando che fa solo questo.",
        solution: ["man -k comprime"],
        explain: "`man -k parola` e `apropos parola` sono la stessa cosa: cercano nel nome e nella descrizione breve di ogni pagina. Tra parentesi c'è il numero della sezione."
    },
    {
        id: "t2.2-03", title: "La sezione giusta", bash: false,
        task: "`passwd` è sia un comando sia un file di configurazione. Apri la pagina di manuale che descrive il file `/etc/passwd`, non quella del comando.",
        goals: [{ text: "Sullo schermo c'è la pagina `PASSWD(5)`", output: "same", command: "^man\\s+5\\s+passwd\\s*$" }],
        hint: "Scopri in quali sezioni c'è `passwd` con `whatis passwd` (o `man -f passwd`). Il numero della sezione si scrive tra `man` e il nome.",
        solution: ["man 5 passwd"],
        explain: "Le sezioni più usate: 1 comandi utente, 5 formati dei file di configurazione, 8 comandi di amministrazione. Senza numero, `man passwd` apre la prima che trova: la 1."
    },
    {
        id: "t2.2-04", title: "L'aiuto veloce", bash: false,
        task: "Senza aprire il manuale, fatti dire da `mkdir` stesso come si usa e quali opzioni ha.",
        goals: [{ text: "`mkdir` mostra il suo aiuto breve", output: "same", command: "^mkdir\\s+--help\\s*$" }],
        hint: "Quasi tutti i programmi accettano un'opzione lunga che stampa un riassunto: due trattini e la parola inglese per «aiuto».",
        solution: ["mkdir --help"],
        explain: "`--help` è scritto dal programma stesso ed è più corto della pagina di manuale: comodo per ricordare un'opzione al volo."
    },
    {
        id: "t2.2-05", title: "Un comando interno", bash: false,
        task: "`cd` è un comando interno della shell e non ha una sua pagina di manuale. Mostra il suo aiuto.",
        goals: [{ text: "Compare l'aiuto di `cd`", output: "same", command: "^help\\s+cd\\s*$" }],
        hint: "Prova `type cd` e poi `man cd`. Per i comandi interni Bash ha un suo comando di aiuto.",
        solution: ["help cd"],
        explain: "`type` dice se un nome è un comando interno. Per quelli c'è `help nome`; per i programmi `man nome` e `nome --help`."
    },
    {
        id: "t2.2-06", title: "La documentazione dei pacchetti", bash: false,
        task: "I pacchetti installano la loro documentazione in una directory apposta sotto `/usr/share`. Trova lì dentro il file `README` del pacchetto `tar` e mostralo.",
        goals: [{ text: "Sullo schermo c'è il `README` di `tar`", output: "same", command: "/usr/share/doc/tar/README|^cd\\b.*&&|README" }],
        hint: "La directory è `/usr/share/doc`: dentro c'è una directory per ogni pacchetto. Guarda con `ls`, poi usa `cat`.",
        solution: ["cat /usr/share/doc/tar/README"],
        explain: "In `/usr/share/doc/PACCHETTO` si trovano di solito `README`, le novità delle versioni e la licenza: informazioni che nelle pagine di manuale non ci sono."
    },
    {
        id: "t2.2-07", title: "Dov'è quel file?", bash: false,
        task: "Da qualche parte nella tua home c'è un file che si chiama `stile.css`. Trovalo con il comando che cerca nel database dei nomi dei file.",
        setup: { files: { "/home/anna/progetti/sito/css/stile.css": "h1 { color: navy; }\n", "/home/anna/progetti/sito/index.html": "<h1>Ciao</h1>\n" } },
        goals: [{ text: "`locate` mostra il percorso di `stile.css`", output: "same", command: "^locate\\s" }],
        hint: "Il comando è `locate` seguito da una parte del nome.",
        solution: ["locate stile.css"],
        explain: "`locate` non guarda il disco: cerca in un database, per questo risponde subito. `find ~ -name stile.css` trova lo stesso file leggendo le directory una per una."
    },
    {
        id: "t2.2-08", title: "Il database non lo sa ancora", bash: false,
        task: "Crea il file vuoto `appena-nato.txt` e cercalo con `locate`: non lo trova. Aggiorna il database di `locate` e cercalo di nuovo.",
        goals: [
            { text: "`appena-nato.txt` esiste", path: "/home/anna/appena-nato.txt", is: "file" },
            { text: "Dopo l'aggiornamento `locate` lo trova", output: "same", command: "^locate\\s" }
        ],
        hint: "Il database si aggiorna con `updatedb`, che deve leggere tutto il disco: serve `sudo`.",
        solution: ["touch appena-nato.txt", "locate appena-nato", "sudo updatedb", "locate appena-nato"],
        explain: "Il database di `locate` viene rifatto di solito una volta al giorno. Per i file appena creati serve `sudo updatedb`, oppure `find`, che guarda sempre il disco."
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
        goals: [{ text: "`utenti.txt` contiene i nomi, uno per riga", path: "/home/anna/utenti.txt", is: "file", content: "root\nanna\nluca\nwww-data\nsyslog\n" }],
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
        explain: "La prima riga (shebang) dice quale interprete usare; `chmod u+x` dà il permesso di esecuzione. Adesso puoi avviarlo con `./saluta.sh`: provalo."
    },
    {
        id: "t3.3-02", title: "Senza il permesso di esecuzione",
        task: "Nella tua home c'è lo script `orario.sh`, che non ha il permesso di esecuzione. Avvialo lo stesso, senza cambiare i permessi.",
        setup: { files: { "/home/anna/orario.sh": "#!/bin/bash\necho La lezione comincia alle 9\n" } },
        goals: [
            { text: "Lo script scrive il suo messaggio", output: "same", command: "^(bash|sh)\\s" },
            { text: "I permessi di `orario.sh` sono rimasti `rw-r--r--`", path: "/home/anna/orario.sh", mode: "644" }
        ],
        hint: "Prova prima `./orario.sh` e leggi l'errore. Poi passa il file all'interprete: `bash` seguito dal nome dello script.",
        solution: ["bash orario.sh"],
        explain: "Con `bash orario.sh` è Bash a leggere il file: basta il permesso di lettura. Per `./orario.sh` serve invece il permesso di esecuzione."
    },
    {
        id: "t3.3-03", title: "Con il punto e la barra",
        task: "Lo script `conta.sh` conta i file della directory `documenti`. Rendilo eseguibile per il proprietario e avvialo dalla tua home scrivendo il suo percorso.",
        setup: { files: { "/home/anna/conta.sh": "#!/bin/bash\nls documenti | wc -l\n" } },
        goals: [
            { text: "`conta.sh` è eseguibile per il proprietario", path: "/home/anna/conta.sh", modeHas: "100" },
            { text: "Lo hai avviato con `./conta.sh` e mostra il numero dei file", output: "same", command: "^\\./conta\\.sh\\s*$" }
        ],
        hint: "Prima `chmod u+x`. Poi scrivi solo `conta.sh` e guarda cosa risponde la shell: la directory corrente non è nel `PATH`, quindi serve `./` davanti.",
        solution: ["chmod u+x conta.sh", "./conta.sh"],
        explain: "La shell cerca i comandi solo nelle directory di `PATH`. `./conta.sh` è un percorso: «il file conta.sh in questa directory»."
    },
    {
        id: "t3.3-04", title: "Il primo argomento",
        task: "Crea lo script `ciao.sh` con una sola riga, che stampa `Ciao, ` seguito dal primo argomento ricevuto. Poi avvialo con `bash` passando l'argomento `Luca`: deve comparire `Ciao, Luca`.",
        goals: [
            { text: "`ciao.sh` esiste", path: "/home/anna/ciao.sh", is: "file" },
            { text: "Avviato con l'argomento `Luca`, lo script mostra `Ciao, Luca`", output: "same", command: "^bash\\s+(\\./)?ciao\\.sh\\s+Luca\\s*$" }
        ],
        hint: "Dentro lo script il primo argomento è `$1`. Scrivi la riga nel file con `echo '...' > ciao.sh`: le virgolette singole servono perché `$1` arrivi nel file così com'è.",
        solution: ["echo 'echo \"Ciao, $1\"' > ciao.sh", "bash ciao.sh Luca"],
        explain: "`$1` è il primo argomento, `$2` il secondo e così via; `$0` è il nome dello script. Con le virgolette doppie al posto delle singole, `$1` sarebbe stato sostituito subito, prima di scrivere nel file."
    },
    {
        id: "t3.3-05", title: "Quanti argomenti?",
        task: "Lo script `quanti.sh` dice quanti argomenti ha ricevuto. Avvialo in modo che ne conti esattamente 2: il primo è `Mario Rossi` (nome e cognome insieme), il secondo è `Milano`.",
        setup: { files: { "/home/anna/quanti.sh": { content: "#!/bin/bash\necho \"Argomenti ricevuti: $#\"\necho \"Il primo: $1\"\n", mode: "755" } } },
        goals: [{ text: "Lo script conta 2 argomenti e il primo è `Mario Rossi`", output: "same", command: "quanti\\.sh\\s" }],
        hint: "Lo spazio separa gli argomenti. Per tenere insieme nome e cognome servono le virgolette.",
        solution: ["./quanti.sh 'Mario Rossi' Milano"],
        explain: "`$#` è il numero degli argomenti. Senza virgolette, `Mario Rossi Milano` sarebbero stati 3 argomenti."
    },
    {
        id: "t3.3-06", title: "Il codice di uscita",
        task: "Lo script `cerca.sh` cerca la parola `burro` nella lista della spesa e non scrive niente. Avvialo, poi mostra il suo codice di uscita.",
        setup: { files: { "/home/anna/cerca.sh": { content: "#!/bin/bash\ngrep -q burro documenti/spesa.txt\nexit $?\n", mode: "755" } } },
        goals: [{ text: "Dopo lo script, `echo` mostra il suo codice di uscita", output: "same", command: "^echo\\b.*\\$\\?" }],
        hint: "Il codice di uscita dell'ultimo comando è nella variabile speciale `$?`. Va letta subito dopo lo script.",
        solution: ["./cerca.sh", "echo $?"],
        explain: "0 vuol dire «tutto bene», un altro numero «qualcosa non va»: qui 1, perché `grep` non ha trovato la parola. Uno script sceglie il suo codice con `exit`."
    },
    {
        id: "t3.3-07", title: "Un comando tutto tuo",
        task: "Nella directory `/home/anna/bin` c'è lo script `saluta`, già eseguibile. Fai in modo che la shell lo trovi scrivendo solo il nome, poi avvialo così: `saluta`.",
        setup: { files: { "/home/anna/bin/saluta": { content: "#!/bin/bash\necho Ciao da saluta\n", mode: "755" } } },
        goals: [{ text: "Scrivendo solo `saluta` lo script parte", output: "same", command: "^saluta\\s*$" }],
        hint: "La shell cerca i comandi nelle directory elencate in `PATH`, separate da `:`. Aggiungi `/home/anna/bin` (o `~/bin`) in fondo, senza perdere le altre: il vecchio valore è `$PATH`.",
        solution: ["PATH=$PATH:~/bin", "saluta"],
        explain: "Con la directory nel `PATH` lo script si usa come un comando qualsiasi, da ogni directory. Per averlo sempre, la stessa riga va in `~/.bashrc`."
    },
    {
        id: "t3.3-08", title: "Un ciclo su una riga",
        task: "Con un ciclo `for` scritto su una sola riga, stampa per ogni file `.jpg` della directory `foto` una riga come questa: `Foto: foto/mare.jpg`",
        goals: [{ text: "Il ciclo stampa una riga per ogni foto", output: "same", command: "^for\\s+\\w+\\s+in\\s.*\\bdone\\s*$" }],
        hint: "La forma è `for f in ELENCO; do COMANDO; done`. L'elenco può essere `foto/*.jpg`; dentro il ciclo il nome del file è `$f`.",
        solution: ["for f in foto/*.jpg; do echo \"Foto: $f\"; done"],
        explain: "La shell sostituisce `foto/*.jpg` con i nomi dei file; il ciclo esegue il comando una volta per ognuno, con il nome nella variabile `f`. In uno script si scrive su più righe: `for`, `do`, i comandi, `done`."
    },
    {
        id: "t3.3-09", title: "Un saluto per ciascuno",
        task: "Leggi lo script `saluti.sh` con `cat`: saluta ogni persona che riceve come argomento. Avvialo in modo che saluti, in quest'ordine, `Anna`, `Luca` e `Sara`.",
        setup: { files: { "/home/anna/saluti.sh": { content: "#!/bin/bash\n# Saluta tutti gli argomenti\nfor nome in \"$@\"; do\n    echo \"Ciao, $nome!\"\ndone\necho \"Ho salutato $# persone\"\n", mode: "755" } } },
        goals: [{ text: "Lo script saluta Anna, Luca e Sara", output: "same", command: "saluti\\.sh\\s" }],
        hint: "`\"$@\"` sono tutti gli argomenti, uno per uno: scrivili dopo il nome dello script, separati da spazi.",
        solution: ["./saluti.sh Anna Luca Sara"],
        explain: "`for nome in \"$@\"` ripete i comandi per ogni argomento. Le virgolette intorno a `$@` tengono intero anche un argomento con uno spazio, come `'Mario Rossi'`."
    },
    {
        id: "t3.3-10", title: "Se il file esiste",
        task: "Scrivi su una sola riga un `if` che controlla se nella tua home esiste il file `note.txt` e, se c'è, stampa `trovato`.",
        goals: [{ text: "L'`if` controlla il file e stampa `trovato`", output: "same", command: "^if\\s+(\\[|test)\\s+-[ef]\\s+\\S*note\\.txt.*\\bfi\\s*$" }],
        hint: "La forma è `if CONDIZIONE; then COMANDO; fi`. La condizione «è un file» si scrive `[ -f nome ]`, con gli spazi dopo `[` e prima di `]`.",
        solution: ["if [ -f note.txt ]; then echo trovato; fi"],
        explain: "`[` è un comando (lo stesso di `test`): esce con 0 se la condizione è vera, e `if` guarda proprio il codice di uscita. `-f` file, `-d` directory, `-e` esiste; per i numeri `-eq`, `-ne`, `-lt`, `-gt`."
    },
    {
        id: "t3.3-11", title: "Leggere uno script",
        task: "Leggi lo script `controlla.sh` con `cat` e capisci quando esce con il codice 2. Avvialo in modo che succeda, poi mostra il codice di uscita.",
        setup: { files: { "/home/anna/controlla.sh": { content: "#!/bin/bash\nif [ $# -ne 1 ]; then\n    echo \"Uso: $0 FILE\"\n    exit 1\nfi\nif [ -f \"$1\" ]; then\n    echo \"$1 esiste\"\nelse\n    echo \"$1 non esiste\"\n    exit 2\nfi\n", mode: "755" } } },
        goals: [{ text: "Dopo lo script, `echo` mostra il codice di uscita 2", output: "same", command: "^echo\\b.*\\$\\?" }],
        hint: "Senza argomenti (o con più di uno) lo script esce con 1. Con un argomento solo guarda se è un file: prova con un nome che non esiste.",
        solution: ["./controlla.sh nonesiste.txt", "echo $?"],
        explain: "`$# -ne 1` vuol dire «il numero degli argomenti è diverso da 1». Il ramo `else` scatta quando `[ -f \"$1\" ]` è falso: lì lo script sceglie di uscire con 2."
    },

    // ---- 4.3 Dove sono memorizzati i dati ----
    // (processi, memoria, kernel e registri sono quelli di un computer finto: non si confrontano con Bash)
    {
        id: "t4.3-01", title: "I processi del terminale", bash: false,
        task: "Mostra i processi che stai usando in questo terminale.",
        goals: [{ text: "Compare l'elenco con la tua shell (`bash`) e il comando stesso", output: "words", words: ["PID", "bash", "ps"], command: "^ps\\s*$" }],
        hint: "Il comando che elenca i processi è `ps`; da solo mostra quelli del terminale corrente.",
        solution: ["ps"],
        explain: "Ogni programma in esecuzione è un processo con un numero, il PID. Nell'elenco c'è anche `ps`, che quando lo leggi è già finito: ogni volta ha un PID nuovo. Il PID della shell è anche in `$$`."
    },
    {
        id: "t4.3-02", title: "Tutti i processi", bash: false,
        task: "Mostra tutti i processi del sistema, di tutti gli utenti, con il nome dell'utente di ognuno.",
        goals: [{ text: "Compaiono anche i processi di root e di luca", output: "words", words: ["root", "luca", "syslog"], command: "^ps\\s+(aux|-ef|-eF|-e\\s+-f|-f\\s+-e|axu|uax)\\s*$" }],
        hint: "Ci sono due modi classici: lo stile BSD, tre lettere senza trattino (`aux`), e lo stile Unix, `-ef`.",
        solution: ["ps aux"],
        explain: "`ps aux` mostra utente, PID, uso di CPU e memoria, stato e comando; `ps -ef` mostra anche il PPID, il processo padre. Il processo con PID 1 è il primo avviato dal kernel: `/sbin/init` (systemd)."
    },
    {
        id: "t4.3-03", title: "Trova un processo", bash: false,
        task: "Dall'elenco di tutti i processi tieni solo le righe che contengono `sshd`, il server per collegarsi da remoto.",
        goals: [{ text: "Compaiono solo le righe con `sshd`", output: "words", words: ["sshd"], command: "^ps\\s.*\\|\\s*grep\\s.*sshd" }],
        hint: "Manda l'uscita di `ps aux` a `grep` con una pipe.",
        solution: ["ps aux | grep sshd"],
        explain: "Nell'elenco compare anche `grep sshd`: mentre `ps` legge i processi, `grep` è già in esecuzione. Su un sistema vero capita lo stesso."
    },
    {
        id: "t4.3-04", title: "Quanta memoria?", bash: false,
        task: "Mostra quanta memoria RAM e quanto spazio di swap ha il computer, con le unità leggibili (Mi, Gi).",
        goals: [{ text: "`free` mostra la memoria in Mi e Gi", output: "same", command: "^free\\s+(-h|--human)\\s*$" }],
        hint: "Il comando è `free`; l'opzione per le unità leggibili è la stessa di `ls` e `du`.",
        solution: ["free -h"],
        explain: "`total` è la RAM installata, `used` quella usata dai programmi, `buff/cache` quella che il kernel usa come cache e libera quando serve, `available` quella davvero disponibile. Swap è la memoria sul disco."
    },
    {
        id: "t4.3-05", title: "La memoria vista dal kernel", bash: false,
        task: "Il kernel mostra lo stato della memoria in un file dentro `/proc`. Trova in quel file la riga `MemTotal` e mostrala.",
        goals: [{ text: "Compare la riga `MemTotal` letta da `/proc/meminfo`", output: "words", words: ["MemTotal:"], command: "/proc/meminfo" }],
        hint: "Guarda cosa c'è in `/proc` con `ls /proc`. Il file è `meminfo`: cerca la riga con `grep`.",
        solution: ["grep MemTotal /proc/meminfo"],
        explain: "`/proc` non è sul disco: i suoi file li crea il kernel nel momento in cui li leggi, per questo `ls -l` li mostra grandi 0. `free` legge proprio `/proc/meminfo`."
    },
    {
        id: "t4.3-06", title: "La cartella di un processo", bash: false,
        task: "Ogni processo ha una directory in `/proc` con il suo PID. Mostra il file `status` di quella della tua shell.",
        goals: [{ text: "Compare lo stato della shell: `Name: bash`", output: "words", words: ["Name:", "bash", "4242"], command: "^(cat|head|less|more)\\s.*/proc/(4242|self|\\$\\$|\\$\\{\\$\\})/status" }],
        hint: "Il PID della shell è nella variabile speciale `$$`: prova `echo $$`. Il file è `/proc/PID/status`.",
        solution: ["cat /proc/$$/status"],
        explain: "In `/proc/PID/` ci sono le informazioni di quel processo: `status`, `cmdline` (il comando con cui è partito) e altre. `/proc/self` è un link al processo che lo legge."
    },
    {
        id: "t4.3-07", title: "I messaggi del kernel", bash: false,
        task: "Mostra solo i messaggi del kernel che parlano di dispositivi USB (la parola `usb`, maiuscola o minuscola).",
        goals: [{ text: "Compaiono i messaggi del kernel sull'USB", output: "same", command: "dmesg\\b.*\\|\\s*grep\\s" }],
        hint: "I messaggi del kernel si leggono con `dmesg`. Prova prima da solo: su molti sistemi serve `sudo`. Poi filtra con `grep -i`.",
        solution: ["sudo dmesg | grep -i usb"],
        explain: "Il kernel tiene i suoi messaggi in memoria (il ring buffer): avvio, dischi, schede di rete, chiavette inserite. Il numero tra parentesi quadre sono i secondi dall'accensione."
    },
    {
        id: "t4.3-08", title: "Il registro di sistema", bash: false,
        task: "Mostra le ultime 5 righe del registro di sistema `/var/log/syslog`.",
        goals: [{ text: "Compaiono le ultime 5 righe di `syslog`", output: "same", command: "tail\\b.*syslog" }],
        hint: "Le ultime righe si leggono con `tail -n 5`. Il file appartiene al gruppo `adm`: se ti dice «Permesso negato», usa `sudo`.",
        solution: ["sudo tail -n 5 /var/log/syslog"],
        explain: "In `/var/log` ci sono i registri: `syslog` (messaggi generali), `auth.log` (accessi e `sudo`), `kern.log` (kernel). Sui sistemi con systemd gli stessi messaggi si leggono anche con `journalctl`."
    },
    {
        id: "t4.3-09", title: "Il kernel sul disco", bash: false,
        task: "Mostra in formato lungo il contenuto della directory dove stanno il kernel di Linux e i file per avviarlo.",
        goals: [{ text: "Compare il contenuto di `/boot`, con `vmlinuz`", output: "same", command: "^ls\\s+-[a-zA-Z]*l[a-zA-Z]*\\s+/boot/?\\s*$" }],
        hint: "La directory è `/boot`. Per il formato lungo `ls -l`.",
        solution: ["ls -l /boot"],
        explain: "`vmlinuz-VERSIONE` è il kernel compresso, `initrd.img-VERSIONE` il piccolo sistema che lo aiuta a partire, `grub` il boot loader. La versione è la stessa di `uname -r`."
    },
    {
        id: "t4.3-10", title: "I dischi sono file", bash: false,
        task: "In Linux anche i dischi compaiono come file, in `/dev`. Mostra in formato lungo tutti quelli che iniziano con `sd`.",
        goals: [{ text: "Compaiono `sda`, le sue partizioni e la chiavetta `sdb`", output: "same", command: "^ls\\s+-[a-zA-Z]*l[a-zA-Z]*\\s+/dev/sd\\*\\s*$" }],
        hint: "Usa `ls -l` con il carattere jolly: `/dev/sd*`.",
        solution: ["ls -l /dev/sd*"],
        explain: "La prima lettera `b` vuol dire dispositivo a blocchi (dischi); `c` a caratteri (come `/dev/null`). Al posto della dimensione ci sono due numeri, maggiore e minore. `sda` è il primo disco, `sda1` la sua prima partizione, `sdb` la chiavetta inserita."
    },

    // ---- 4.4 Il computer in rete ----
    // (la rete del simulatore è finta e fissa; gli indirizzi su Internet sono quelli riservati agli esempi)
    {
        id: "t4.4-01", title: "Il mio indirizzo IP", bash: false,
        task: "Mostra gli indirizzi di rete del computer con il comando `ip`, e trova l'indirizzo IPv4 della scheda `enp0s3`.",
        goals: [{ text: "Compaiono gli indirizzi, con `192.168.1.50/24`", output: "words", words: ["192.168.1.50/24"], command: "^ip\\s+(-4\\s+)?(a|ad|addr|address)(\\s+(show|list))?(\\s+(dev\\s+)?enp0s3)?\\s*$" }],
        hint: "Il comando è `ip addr show`, che si può abbreviare in `ip a`. L'indirizzo IPv4 è sulla riga che inizia con `inet`.",
        solution: ["ip addr show"],
        explain: "`192.168.1.50/24`: l'indirizzo e, dopo la barra, quanti bit indicano la rete (24, cioè 255.255.255.0). `lo` è l'interfaccia di loopback, sempre `127.0.0.1`: il computer che parla con se stesso."
    },
    {
        id: "t4.4-02", title: "Il vecchio ifconfig", bash: false,
        task: "Mostra la configurazione della scheda `enp0s3` con il comando storico, quello che c'era prima di `ip`.",
        goals: [{ text: "Compaiono indirizzo e maschera di rete di `enp0s3`", output: "words", words: ["192.168.1.50", "netmask", "255.255.255.0"], command: "^ifconfig\\b" }],
        hint: "Il comando storico è `ifconfig` (pacchetto net-tools). Seguito dal nome della scheda mostra solo quella.",
        solution: ["ifconfig enp0s3"],
        explain: "`ifconfig` scrive la maschera per esteso (`netmask 255.255.255.0`), `ip` la scrive come `/24`. Sui sistemi recenti `ifconfig` spesso non è installato: si usa `ip`."
    },
    {
        id: "t4.4-03", title: "La porta verso Internet", bash: false,
        task: "Mostra la tabella di instradamento con il comando `ip`, e trova l'indirizzo del router (il gateway predefinito).",
        goals: [{ text: "Compare la riga `default via 192.168.1.1`", output: "words", words: ["default", "via", "192.168.1.1"], command: "^ip\\s+(-4\\s+)?(r|ro|rou|rout|route)(\\s+(show|list))?\\s*$" }],
        hint: "Il comando è `ip route show` (o solo `ip route`, `ip r`).",
        solution: ["ip route show"],
        explain: "La riga `default` dice dove vanno i pacchetti per tutte le reti che il computer non conosce: al router `192.168.1.1`. L'altra riga dice che la rete locale `192.168.1.0/24` si raggiunge direttamente."
    },
    {
        id: "t4.4-04", title: "La tabella di route", bash: false,
        task: "Mostra la stessa tabella con il comando storico `route`, con gli indirizzi in numeri invece che in nomi.",
        goals: [{ text: "`route` mostra il gateway `192.168.1.1`", output: "same", command: "^route\\s+-n\\s*$" }],
        hint: "L'opzione per avere solo numeri è `-n`, la stessa di `netstat` e `ss`.",
        solution: ["route -n"],
        explain: "Con `-n` non si traducono i numeri in nomi: `0.0.0.0` al posto di `default`, `192.168.1.1` al posto di `_gateway`. Il flag `G` indica la riga che passa da un gateway."
    },
    {
        id: "t4.4-05", title: "Quale server DNS?", bash: false,
        task: "Mostra il file di configurazione che dice al computer a quale server DNS chiedere gli indirizzi dei nomi.",
        goals: [{ text: "Compare il contenuto di `/etc/resolv.conf`", output: "same", command: "/etc/resolv\\.conf" }],
        hint: "È un file in `/etc` che si chiama `resolv.conf`.",
        solution: ["cat /etc/resolv.conf"],
        explain: "`nameserver` è il server DNS, qui il router `192.168.1.1`; `search casa.lan` aggiunge quel dominio ai nomi brevi, così `nas` diventa `nas.casa.lan`."
    },
    {
        id: "t4.4-06", title: "Nomi senza DNS", bash: false,
        task: "Nel file dove si scrivono a mano i nomi dei computer della rete, trova la riga del `nas` e mostrala.",
        goals: [{ text: "Compare la riga del `nas` di `/etc/hosts`", output: "words", words: ["192.168.1.10", "nas"], command: "/etc/hosts" }],
        hint: "Il file è `/etc/hosts`. Cerca la riga con `grep`.",
        solution: ["grep nas /etc/hosts"],
        explain: "In `/etc/hosts` ogni riga è un indirizzo seguito da uno o più nomi. Il computer lo guarda prima di chiedere al DNS: va bene per pochi computer di casa."
    },
    {
        id: "t4.4-07", title: "Il NAS risponde?", bash: false,
        task: "Controlla se il `nas` è raggiungibile, mandandogli esattamente 3 pacchetti.",
        goals: [{ text: "`ping` manda 3 pacchetti al `nas` e riceve 3 risposte", output: "same", command: "^ping\\b(?=.*\\s-c\\s*3\\b)(?=.*\\snas\\b)" }],
        hint: "Il comando è `ping`. Su un sistema vero continua all'infinito: il numero di pacchetti si sceglie con `-c`.",
        solution: ["ping -c 3 nas"],
        explain: "Ogni risposta mostra il tempo di andata e ritorno. `0% packet loss` vuol dire che il NAS è acceso e raggiungibile. Senza `-c`, su Linux `ping` si ferma con Ctrl+C."
    },
    {
        id: "t4.4-08", title: "Chiedere al DNS", bash: false,
        task: "Chiedi al server DNS gli indirizzi di `www.lpi.org`.",
        goals: [{ text: "Compaiono l'indirizzo IPv4 e quello IPv6 di `www.lpi.org`", output: "same", command: "^host\\s+www\\.lpi\\.org\\.?\\s*$" }],
        hint: "Il comando che interroga il DNS è `host`, seguito dal nome.",
        solution: ["host www.lpi.org"],
        explain: "`has address` è l'indirizzo IPv4 (record A), `has IPv6 address` quello IPv6 (record AAAA). `host` chiede direttamente al DNS e non guarda `/etc/hosts`. Gli indirizzi del simulatore sono di esempio, non quelli veri."
    },
    {
        id: "t4.4-09", title: "Chi è in ascolto?", bash: false,
        task: "Mostra le porte TCP in ascolto sul computer, con i numeri delle porte invece dei nomi dei servizi.",
        goals: [{ text: "Compaiono le porte in ascolto, con la 22 di ssh", output: "words", words: ["LISTEN", "0.0.0.0:22"], command: "^(ss|netstat)\\s+-(?=[tulnp]*t)(?=[tulnp]*l)(?=[tulnp]*n)[tulnp]+\\s*$" }],
        hint: "Il comando moderno è `ss` (quello storico `netstat`). Le opzioni: `-t` TCP, `-l` in ascolto, `-n` numeri; si scrivono insieme.",
        solution: ["ss -tln"],
        explain: "La porta 22 è quella di `ssh`; `0.0.0.0` vuol dire «su tutti gli indirizzi», `127.0.0.1` solo dal computer stesso. Con `-u` si aggiungono le porte UDP, con `-p` (da root) i programmi."
    },
    {
        id: "t4.4-10", title: "Gli indirizzi IPv6", bash: false,
        task: "Mostra solo gli indirizzi IPv6 del computer.",
        goals: [{ text: "Compaiono solo righe `inet6`, con l'indirizzo `fe80::`", output: "words", words: ["inet6", "fe80::a00:27ff:fe4e:66a1/64"], command: "^ip\\s+-6\\s+(a|ad|addr|address)(\\s+(show|list))?(\\s+\\S+)?\\s*$" }],
        hint: "`ip` ha un'opzione per scegliere la famiglia di indirizzi: `-4` o `-6`, prima di `addr`.",
        solution: ["ip -6 addr show"],
        explain: "Gli indirizzi IPv6 sono lunghi 128 bit e si scrivono in esadecimale; `::` sostituisce una serie di zeri. `fe80::` è l'indirizzo locale al collegamento, sempre presente; `::1` è il loopback."
    },

    // ---- 5.1 Sicurezza di base e tipi di utente ----
    // (accessi e sessioni sono quelli finti del simulatore: non si confrontano con Bash)
    {
        id: "t5.1-01", title: "Chi sono io?", bash: false,
        task: "Mostra il tuo numero di utente (UID), il tuo gruppo principale e tutti i gruppi di cui fai parte, con un solo comando.",
        goals: [{ text: "Compaiono uid, gid e gruppi di anna", output: "same", command: "^id\\s*(anna)?\\s*$" }],
        hint: "Il comando è corto: due lettere, come «identità».",
        solution: ["id"],
        explain: "anna ha UID 1000: gli utenti normali partono da 1000, root ha 0, gli utenti di sistema stanno sotto 1000. Il gruppo `sudo` le permette di usare `sudo`."
    },
    {
        id: "t5.1-02", title: "Chi è collegato?", bash: false,
        task: "Mostra gli utenti collegati adesso al computer, con il terminale e l'ora di accesso.",
        goals: [{ text: "Compaiono anna e luca", output: "same", command: "^who\\s*$" }],
        hint: "Il comando è la parola inglese per «chi».",
        solution: ["who"],
        explain: "Ogni riga è una sessione: utente, terminale (`pts/0` è un terminale remoto o grafico, `tty1` la console), ora di accesso e, tra parentesi, da dove."
    },
    {
        id: "t5.1-03", title: "Che cosa stanno facendo?", bash: false,
        task: "Mostra chi è collegato e che cosa sta facendo, con un comando di una lettera sola.",
        goals: [{ text: "Compare il programma che sta usando luca", output: "words", words: ["USER", "WHAT", "luca", "top"], command: "^w\\s*$" }],
        hint: "È la prima lettera di `who`.",
        solution: ["w"],
        explain: "`w` aggiunge l'intestazione di `uptime` e, per ogni utente, da quanto è inattivo (IDLE) e il comando che sta usando (WHAT): luca ha aperto `top`."
    },
    {
        id: "t5.1-04", title: "Gli accessi di luca", bash: false,
        task: "Mostra lo storico degli accessi al computer, ma solo quelli dell'utente `luca`.",
        goals: [{ text: "Compaiono solo gli accessi di luca", output: "same", command: "^last\\s+luca\\s*$" }],
        hint: "Lo storico degli accessi si legge con `last`; il nome di un utente dopo il comando filtra le righe.",
        solution: ["last luca"],
        explain: "`last` legge il file `/var/log/wtmp`: chi è entrato, da dove, quando e per quanto tempo (`still logged in` se è ancora dentro). `last reboot` mostra le accensioni; `sudo lastb` i tentativi falliti."
    },
    {
        id: "t5.1-05", title: "Un utente di sistema", bash: false,
        task: "Mostra la riga dell'utente `www-data` in `/etc/passwd` e guarda il suo ultimo campo: la shell.",
        goals: [{ text: "Compare la riga di `www-data`, con la shell `nologin`", output: "words", words: ["www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin"], command: "/etc/passwd|getent\\s+passwd" }],
        hint: "Cerca la riga con `grep` nel file `/etc/passwd`.",
        solution: ["grep www-data /etc/passwd"],
        explain: "Sette campi separati da `:`: nome, password (la `x` vuol dire che sta in `/etc/shadow`), UID, GID, descrizione, home, shell. `www-data` è un utente di sistema: UID sotto 1000 e shell `nologin`, quindi nessuno può entrare con lui."
    },
    {
        id: "t5.1-06", title: "Dove stanno le password", bash: false,
        task: "Le password cifrate stanno in `/etc/shadow`. Prova a leggerlo, poi mostra la riga di anna con i permessi dell'amministratore.",
        goals: [{ text: "Compare la riga di anna di `/etc/shadow`", output: "words", words: ["anna:$6$Kq3vT8e1$Yb7n2Q0cW4x9Lr:20390:0:99999:7:::"], command: "^sudo\\s.*/etc/shadow" }],
        hint: "Da anna `cat /etc/shadow` dà «Permesso negato»: il file è di root. Metti `sudo` davanti a un `grep anna /etc/shadow`.",
        solution: ["sudo grep anna /etc/shadow"],
        explain: "`/etc/passwd` lo leggono tutti; `/etc/shadow` solo root (e il gruppo `shadow`), perché contiene le password cifrate: `$6$` indica l'algoritmo SHA-512. Un `*` o un `!` vuol dire che con quell'utente non si entra con una password."
    },
    {
        id: "t5.1-07", title: "Che cosa posso fare con sudo?", bash: false,
        task: "Chiedi a `sudo` che cosa ti permette di fare.",
        goals: [{ text: "`sudo` mostra i tuoi permessi", output: "same", command: "^sudo\\s+-l\\s*$" }],
        hint: "C'è un'opzione di `sudo` che elenca (in inglese «list») i permessi.",
        solution: ["sudo -l"],
        explain: "`(ALL : ALL) ALL`: anna può eseguire qualsiasi comando come qualsiasi utente. Il permesso viene da `/etc/sudoers`, che lo dà al gruppo `sudo`: prova `sudo cat /etc/sudoers`."
    },
    {
        id: "t5.1-08", title: "Diventare luca", bash: false,
        task: "Apri una shell di login come utente `luca`, in modo da trovarti nella sua home. Poi controlla chi sei.",
        goals: [
            { text: "Sei l'utente luca", user: "luca" },
            { text: "Sei nella home di luca", cwd: "/home/luca" },
            { text: "`whoami` risponde `luca`", output: "same", command: "^whoami\\s*$" }
        ],
        hint: "`su - luca` chiederebbe la password di luca, che non conosci. Ma tu puoi usare `sudo`: `sudo su - luca`. Il trattino vuol dire «shell di login».",
        solution: ["sudo su - luca", "whoami"],
        explain: "Il prompt ora dice `luca@lpi`. Con `exit` torni ad anna. luca non è nel gruppo `sudo`: da luca prova `sudo ls`, ti risponde che non è nel file sudoers."
    },
    {
        id: "t5.1-09", title: "Un comando come un altro utente", bash: false,
        task: "Leggi il file `/home/luca/segreto.txt` come se fossi `luca`, senza diventare root e senza aprire una shell.",
        goals: [{ text: "Compare il contenuto di `segreto.txt`", output: "same", command: "^sudo\\s+-u\\s+luca\\s" }],
        hint: "`sudo` esegue un comando come root, ma con `-u UTENTE` lo esegue come un altro utente.",
        solution: ["sudo -u luca cat /home/luca/segreto.txt"],
        explain: "Il file ha permessi `rw-------`: lo legge solo luca (e root). Con `sudo -u luca` il comando gira come luca, che ne è il proprietario."
    },
    {
        id: "t5.1-10", title: "Il prompt di root", bash: false,
        task: "Apri una shell di login come `root` con `sudo`, guarda la directory in cui ti trovi e poi torna ad anna.",
        goals: [
            { text: "Hai aperto una shell di login di root", history: "^sudo\\s+(-i|su(\\s+(-|-l|--login))?(\\s+root)?)\\s*$" },
            { text: "Con `exit` sei tornata ad anna", user: "anna", command: "^exit\\s*$" }
        ],
        hint: "Per una shell di login di root c'è `sudo -i`. Per tornare indietro: `exit`.",
        solution: ["sudo -i", "pwd", "exit"],
        explain: "Il prompt di root finisce con `#`, quello degli utenti normali con `$`. La home di root è `/root`, non `/home/root`. Da root niente è vietato: meglio usarlo il meno possibile, e uscire subito."
    },

    // ---- 5.2 Creazione di utenti e gruppi ----
    // (gli utenti si creano nel simulatore: sul Linux vero della palestra resterebbero, quindi niente confronto con Bash)
    {
        id: "t5.2-01", title: "Un nuovo utente", bash: false,
        task: "Crea l'utente `luigi` in modo che abbia anche la sua directory home in `/home`.",
        goals: [
            { text: "L'utente `luigi` esiste", account: "luigi" },
            { text: "C'è la sua home, `/home/luigi`, di sua proprietà", path: "/home/luigi", is: "dir", owner: "luigi" }
        ],
        hint: "Il comando è `useradd`, e serve `sudo`. Senza l'opzione `-m` (make home) la home non viene creata.",
        solution: ["sudo useradd -m luigi"],
        explain: "`useradd` scrive l'utente in `/etc/passwd`, `/etc/shadow` e `/etc/group` (un gruppo con lo stesso nome). Con `-m` crea la home copiandoci dentro i file di `/etc/skel`."
    },
    {
        id: "t5.2-02", title: "Nome completo e shell", bash: false,
        task: "Crea l'utente `sara`, con la home, con il nome completo `Sara Neri` e con la shell `/bin/bash` (quella predefinita è `/bin/sh`).",
        goals: [
            { text: "`sara` esiste, si chiama `Sara Neri` e usa `/bin/bash`", account: "sara", comment: "Sara Neri", shell: "/bin/bash" },
            { text: "C'è la sua home", path: "/home/sara", is: "dir", owner: "sara" }
        ],
        hint: "`-c` per il commento (il nome completo, tra virgolette perché ha uno spazio), `-s` per la shell, `-m` per la home.",
        solution: ["sudo useradd -m -c 'Sara Neri' -s /bin/bash sara"],
        explain: "Il nome completo finisce nel quinto campo di `/etc/passwd`, la shell nel settimo. Controlla con `grep sara /etc/passwd`."
    },
    {
        id: "t5.2-03", title: "La riga del nuovo utente", bash: false,
        task: "L'utente `luigi` è già stato creato. Mostra la sua riga in `/etc/passwd` e guarda il suo UID: il primo numero libero da 1000 in su.",
        setup: { prepare: ["sudo useradd -m -c 'Luigi Verdi' -s /bin/bash luigi"] },
        goals: [{ text: "Compare la riga di `luigi`, con UID 1002", output: "words", words: ["luigi:x:1002:1003:Luigi", "Verdi:/home/luigi:/bin/bash"], command: "/etc/passwd|getent\\s+passwd" }],
        hint: "Cerca la riga con `grep` in `/etc/passwd`.",
        solution: ["grep luigi /etc/passwd"],
        explain: "UID 1002: 1000 è anna, 1001 è luca. Il GID è 1003 e non 1002, perché il numero 1002 è già del gruppo `sviluppo`: `useradd` prende il primo libero."
    },
    {
        id: "t5.2-04", title: "Il modello delle home", bash: false,
        task: "Mostra tutto il contenuto, compresi i file nascosti, della directory che viene copiata nella home di ogni nuovo utente.",
        goals: [{ text: "Compaiono `.bashrc` e `.profile` di `/etc/skel`", output: "same", command: "^ls\\s+-[a-zA-Z]*[aA][a-zA-Z]*\\s+/etc/skel/?\\s*$" }],
        hint: "La directory è `/etc/skel` (da «skeleton», scheletro). I file iniziano con un punto: serve `ls -a`.",
        solution: ["ls -a /etc/skel"],
        explain: "Quello che metti in `/etc/skel` arriva nella home di ogni utente creato dopo con `useradd -m`: per esempio un `.bashrc` con gli alias per tutti."
    },
    {
        id: "t5.2-05", title: "Un gruppo nuovo", bash: false,
        task: "Crea il gruppo `progetto`.",
        goals: [{ text: "Il gruppo `progetto` esiste", group: "progetto" }],
        hint: "Il comando è `groupadd`, con `sudo`.",
        solution: ["sudo groupadd progetto"],
        explain: "Il gruppo finisce in `/etc/group` con il primo GID libero da 1000 in su; con `-g NUMERO` lo scegli tu. Guarda con `tail -n 1 /etc/group`."
    },
    {
        id: "t5.2-06", title: "Aggiungere a un gruppo", bash: false,
        task: "`luigi` fa già parte del gruppo `progetto`. Aggiungilo anche al gruppo `sviluppo`, senza toglierlo da `progetto`.",
        setup: { prepare: ["sudo groupadd progetto", "sudo useradd -m -G progetto luigi"] },
        goals: [{ text: "`luigi` è sia in `progetto` sia in `sviluppo`", account: "luigi", groups: ["progetto", "sviluppo"] }],
        hint: "`usermod -G` imposta i gruppi secondari; da solo SOSTITUISCE quelli che c'erano. Con `-a` (append) li aggiunge.",
        solution: ["sudo usermod -aG sviluppo luigi"],
        explain: "Errore classico: `usermod -G sviluppo luigi`, senza `-a`, avrebbe tolto luigi da `progetto`. Controlla con `id luigi` o `groups luigi`."
    },
    {
        id: "t5.2-07", title: "Una password per luigi", bash: false,
        task: "`luigi` non ha ancora una password (account bloccato). Impostagli la password `Primavera26` e poi controlla lo stato della password.",
        setup: { prepare: ["sudo useradd -m luigi"] },
        goals: [
            { text: "`luigi` ha una password", account: "luigi", password: true },
            { text: "`passwd -S` mostra lo stato `P` (password impostata)", output: "words", words: ["luigi", "P"], command: "^sudo\\s+passwd\\s+-S\\s+luigi\\s*$" }
        ],
        hint: "Di solito si usa `sudo passwd luigi`, che chiede la password due volte. Nel simulatore non si può digitare: usa `echo 'luigi:Primavera26' | sudo chpasswd`. Poi `sudo passwd -S luigi`.",
        solution: ["echo 'luigi:Primavera26' | sudo chpasswd", "sudo passwd -S luigi"],
        explain: "`passwd -S` mostra lo stato: `L` bloccato, `P` password impostata, `NP` nessuna password. In `/etc/shadow` la password è cifrata (`$6$...`): non si può leggere."
    },
    {
        id: "t5.2-08", title: "Bloccare un account", bash: false,
        task: "luca è in vacanza: blocca la sua password, senza cancellarla, in modo che nessuno possa entrare come luca.",
        goals: [{ text: "La password di luca è bloccata", account: "luca", locked: true }],
        hint: "`passwd` ha un'opzione per bloccare (lock) e una per sbloccare (unlock).",
        solution: ["sudo passwd -l luca"],
        explain: "Il blocco mette un `!` davanti alla password cifrata in `/etc/shadow`: guarda con `sudo grep luca /etc/shadow`. Con `sudo passwd -u luca` torna com'era."
    },
    {
        id: "t5.2-09", title: "Un utente di sistema", bash: false,
        task: "Crea l'utente di sistema `servizio`, per un programma: senza home e con la shell `/usr/sbin/nologin`, così nessuno può entrare con lui.",
        goals: [
            { text: "`servizio` esiste, con UID sotto 1000 e shell `nologin`", account: "servizio", uidBelow: 1000, shell: "/usr/sbin/nologin" },
            { text: "Non ha una home", path: "/home/servizio", is: "absent" }
        ],
        hint: "L'opzione per un utente di sistema è `-r`; la shell si sceglie con `-s`.",
        solution: ["sudo useradd -r -s /usr/sbin/nologin servizio"],
        explain: "Gli utenti di sistema hanno UID sotto 1000 (`useradd -r` parte da 999 e scende) e servono ai programmi, non alle persone: come `www-data` per il server web."
    },
    {
        id: "t5.2-10", title: "Eliminare un utente", bash: false,
        task: "L'utente `prova` non serve più: eliminalo insieme alla sua directory home.",
        setup: { prepare: ["sudo useradd -m prova"] },
        goals: [
            { text: "L'utente `prova` non c'è più", account: "prova", exists: false },
            { text: "Anche la sua home è sparita", path: "/home/prova", is: "absent" }
        ],
        hint: "Il comando è `userdel`; da solo lascia la home. L'opzione per rimuoverla è `-r`.",
        solution: ["sudo userdel -r prova"],
        explain: "Senza `-r` la home resta, e `ls -l` mostra come proprietario un numero (l'UID) invece del nome. Un utente collegato non si elimina: prova `sudo userdel luca`."
    },
    {
        id: "t5.2-11", title: "Il numero di un utente", bash: false,
        task: "Mostra solo il numero dell'utente (UID) di `luca`, senza il resto.",
        goals: [{ text: "Compare l'UID di luca: `1001`", output: "same", command: "^id\\s+-u\\s+luca\\s*$" }],
        hint: "`id` ha un'opzione per mostrare solo l'UID: `-u` (user).",
        solution: ["id -u luca"],
        explain: "`id -u` mostra l'UID, `id -g` il GID del gruppo principale, `id -G` tutti i gruppi; con `-n` i nomi al posto dei numeri. root ha sempre UID 0."
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
