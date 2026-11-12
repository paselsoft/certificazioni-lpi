// Domande dell'argomento 2: Trovare il Proprio Modo di Operare su un Sistema Linux.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// I risultati dei comandi sono stati provati in Bash. Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 2.1 Nozioni di Base sulla Command Line ----
    {
        id: "2.1-01", type: "single", ref: "2.1_01#Virgolette Doppie",
        text: "La variabile `USER` vale `frank`. Che cosa stampa questo comando?",
        code: 'echo "Ciao $USER"',
        options: [
            { t: "`Ciao frank`", ok: true, why: "Tra virgolette doppie la shell sostituisce le variabili: `$USER` diventa `frank`. Le virgolette non vengono stampate." },
            { t: "`Ciao $USER`", ok: false, why: "Succederebbe con le virgolette singole, che non sostituiscono le variabili." },
            { t: "`\"Ciao frank\"`", ok: false, why: "Le virgolette servono alla shell per raggruppare il testo e non arrivano a `echo`." },
            { t: "Un errore, perché `$` non si può usare tra virgolette", ok: false, why: "Tra virgolette doppie `$` funziona: è proprio il modo normale di usare una variabile in un testo." }
        ]
    },
    {
        id: "2.1-02", type: "single", ref: "2.1_01#Virgolette Singole",
        text: "La variabile `USER` vale `frank`. Che cosa stampa questo comando?",
        code: "echo 'Ciao $USER'",
        options: [
            { t: "`Ciao $USER`", ok: true, why: "Tra virgolette singole la shell non tocca niente: il testo arriva a `echo` così com'è." },
            { t: "`Ciao frank`", ok: false, why: "La variabile verrebbe sostituita con le virgolette doppie, non con quelle singole." },
            { t: "`Ciao`", ok: false, why: "Il testo tra virgolette singole non si perde: arriva intero." },
            { t: "`'Ciao frank'`", ok: false, why: "Le virgolette non vengono stampate e la variabile non viene sostituita." }
        ]
    },
    {
        id: "2.1-03", type: "single", ref: "2.1_01#Caratteri di Escape",
        text: "Che cosa stampa questo comando?",
        code: "echo \\$HOME",
        options: [
            { t: "`$HOME`", ok: true, why: "La barra rovesciata `\\` toglie il significato speciale al carattere che segue: `$` diventa un carattere normale." },
            { t: "Il percorso della tua directory home, per esempio `/home/anna`", ok: false, why: "Senza la barra rovesciata succederebbe questo; con `\\` la variabile non viene sostituita." },
            { t: "`\\$HOME`", ok: false, why: "La barra rovesciata la consuma la shell: a `echo` arriva solo `$HOME`." },
            { t: "Niente: la riga è vuota", ok: false, why: "Il testo viene stampato, solo senza sostituire la variabile." }
        ]
    },
    {
        id: "2.1-04", type: "single", ref: "2.1_01#Quoting",
        text: "Che cosa stampa questo comando, scritto con quattro spazi tra le due parole e senza virgolette?",
        code: "echo uno    due",
        options: [
            { t: "`uno due`, con un solo spazio", ok: true, why: "Senza virgolette la shell divide la riga in parole: `echo` riceve due argomenti e li stampa separati da uno spazio." },
            { t: "`uno    due`, con quattro spazi", ok: false, why: "Gli spazi restano tutti solo con le virgolette: `echo \"uno    due\"`." },
            { t: "`unodue`, senza spazi", ok: false, why: "`echo` separa sempre gli argomenti con uno spazio." },
            { t: "Un errore: troppi spazi", ok: false, why: "Gli spazi in più non sono un errore: separano soltanto le parole." }
        ]
    },
    {
        id: "2.1-05", type: "single", ref: "2.1_01#Tipi di Comportamento dei Comandi",
        text: "Che cosa ti dice il comando `type cd`?",
        options: [
            { t: "Che `cd` è un comando interno (builtin) della shell", ok: true, why: "`cd` deve cambiare la directory della shell stessa, per questo è dentro Bash e non è un programma separato." },
            { t: "Che `cd` è il programma `/usr/bin/cd`", ok: false, why: "`type ls` risponde con un percorso, perché `ls` è un programma esterno; `cd` invece è interno." },
            { t: "Che tipo di file c'è nella directory corrente", ok: false, why: "Per il tipo di un file si usa il comando `file`; `type` parla dei comandi." },
            { t: "Il manuale del comando `cd`", ok: false, why: "Il manuale si apre con `man` (per i comandi interni, `help cd`)." }
        ]
    },
    {
        id: "2.1-06", type: "single", ref: "2.1_02#Lavorare con le Variabili Globali",
        text: "Che cosa fa `export` in `export EDITOR=nano`?",
        options: [
            { t: "Rende la variabile una variabile d'ambiente, visibile anche ai programmi avviati da quella shell", ok: true, why: "Senza `export` la variabile resta locale alla shell; con `export` passa ai processi figli, che possono leggerla." },
            { t: "Salva la variabile per sempre, anche dopo il riavvio", ok: false, why: "Vale solo per quella shell e i suoi figli: per renderla permanente si scrive in un file come `~/.bashrc`." },
            { t: "Esporta la variabile in un file chiamato EDITOR", ok: false, why: "`export` non scrive file." },
            { t: "Installa il programma nano", ok: false, why: "Imposta solo il nome dell'editor preferito; i programmi si installano con il gestore dei pacchetti." }
        ]
    },
    {
        id: "2.1-07", type: "fill", ref: "2.1_02#La Variabile PATH", placeholder: "comando",
        text: "Scrivi il comando che mostra il contenuto della variabile `PATH`.",
        answers: ["echo $PATH", "echo \"$PATH\"", "echo ${PATH}", "echo \"${PATH}\"", "printenv PATH"],
        why: "`echo $PATH` stampa il valore della variabile: il `$` davanti al nome dice alla shell di sostituirlo con il contenuto."
    },
    {
        id: "2.1-08", type: "single", ref: "2.1_02#La Variabile PATH",
        text: "Che cosa contiene la variabile `PATH`?",
        options: [
            { t: "L'elenco delle directory, separate da `:`, in cui la shell cerca i programmi quando scrivi un comando", ok: true, why: "Scrivendo `ls`, la shell cerca un file eseguibile `ls` in ognuna di quelle directory, nell'ordine." },
            { t: "Il percorso della directory corrente", ok: false, why: "La directory corrente la mostra `pwd` (ed è nella variabile `PWD`)." },
            { t: "Il percorso della directory home", ok: false, why: "La directory home è nella variabile `HOME`." },
            { t: "L'elenco dei comandi già eseguiti", ok: false, why: "I comandi già eseguiti si vedono con `history`." }
        ]
    },
    {
        id: "2.1-09", type: "multiple", ref: "2.1_02#Lavorare con le Variabili Locali",
        text: "Quali di queste righe assegnano correttamente un valore a una variabile in Bash?",
        options: [
            { t: "`NOME=Luca`", ok: true, why: "Nome, `=` e valore attaccati: è la forma giusta." },
            { t: "`NOME=\"Luca Rossi\"`", ok: true, why: "Con le virgolette il valore può contenere spazi." },
            { t: "`NOME = Luca`", ok: false, why: "Con gli spazi intorno a `=` Bash cerca un comando chiamato `NOME` e dà errore." },
            { t: "`$NOME=Luca`", ok: false, why: "Il `$` serve per leggere una variabile, non per assegnarla." },
            { t: "`NOME=Luca Rossi`", ok: false, why: "Senza virgolette Bash prova a eseguire il comando `Rossi`, con `NOME=Luca` solo per quel comando." }
        ]
    },
    {
        id: "2.1-10", type: "fill", ref: "2.1_01#Struttura della Command Line", placeholder: "comando",
        text: "Quale comando mostra l'elenco numerato dei comandi che hai scritto in precedenza?",
        answers: ["history"],
        why: "`history` mostra i comandi recenti; Bash li salva in `~/.bash_history` quando chiudi la shell. Con le frecce ↑ e ↓ li richiami."
    },
    {
        id: "2.1-11", type: "single", ref: "2.1_01#Struttura della Command Line",
        text: "Nel comando `ls -l /etc`, che cosa sono `-l` e `/etc`?",
        options: [
            { t: "`-l` è un'opzione (cambia il comportamento di `ls`), `/etc` è un argomento (ciò su cui lavora)", ok: true, why: "Prima il comando, poi le opzioni che di solito iniziano con `-`, poi gli argomenti." },
            { t: "Sono due comandi diversi eseguiti uno dopo l'altro", ok: false, why: "Per eseguire due comandi uno dopo l'altro si separano con `;`." },
            { t: "`-l` è il nome dell'utente, `/etc` la sua password", ok: false, why: "Il comando non ha niente a che fare con utenti e password." },
            { t: "`-l` è un argomento, `/etc` un'opzione", ok: false, why: "È il contrario: le opzioni sono quelle con il trattino." }
        ]
    },
    {
        id: "2.1-12", type: "single", ref: "2.1_02#La Variabile PATH",
        text: "Hai messo i tuoi script in `/home/anna/bin`. Come aggiungi questa directory a `PATH` senza perdere quelle che ci sono già?",
        options: [
            { t: "`export PATH=$PATH:/home/anna/bin`", ok: true, why: "Il nuovo valore è il vecchio (`$PATH`), più `:` e la nuova directory." },
            { t: "`export PATH=/home/anna/bin`", ok: false, why: "Così `PATH` contiene solo la tua directory: la shell non trova più `ls`, `cp` e gli altri comandi." },
            { t: "`export $PATH=$PATH:/home/anna/bin`", ok: false, why: "Il `$` davanti al nome da assegnare è sbagliato: si scrive `PATH=`." },
            { t: "`PATH + /home/anna/bin`", ok: false, why: "Bash non ha questa sintassi: proverebbe a eseguire un comando chiamato `PATH`." }
        ]
    },
    {
        id: "2.1-13", type: "single", ref: "2.1_01#Struttura della Command Line",
        text: "Qual è la shell predefinita nella maggior parte delle distribuzioni Linux?",
        options: [
            { t: "Bash (Bourne Again SHell)", ok: true, why: "Bash è la shell del progetto GNU e quella che si trova quasi ovunque; l'esame si basa su Bash." },
            { t: "PowerShell", ok: false, why: "PowerShell è la shell di Microsoft; esiste anche per Linux, ma non è quella predefinita." },
            { t: "GNOME", ok: false, why: "GNOME è un ambiente desktop grafico, non una shell a riga di comando." },
            { t: "Python", ok: false, why: "Python è un linguaggio di programmazione, non la shell del sistema." }
        ]
    },
    {
        id: "2.1-14", type: "single", ref: "2.1_02#Gestire le Variabili",
        text: "Quale comando cancella la variabile `COLORE` dalla shell?",
        options: [
            { t: "`unset COLORE`", ok: true, why: "Dopo `unset` la variabile non esiste più: `echo $COLORE` stampa una riga vuota." },
            { t: "`rm COLORE`", ok: false, why: "`rm` cancella file, non variabili." },
            { t: "`COLORE=delete`", ok: false, why: "Così la variabile vale la parola `delete`, ma esiste ancora." },
            { t: "`export -COLORE`", ok: false, why: "Questa sintassi non esiste." }
        ]
    },

    // ---- 2.2 Utilizzo della Command Line per Ottenere Aiuto ----
    {
        id: "2.2-01", type: "fill", ref: "2.2_01#Pagine Man", placeholder: "comando",
        text: "Scrivi il comando che apre la pagina del manuale del comando `ls`.",
        answers: ["man ls"],
        why: "`man ls` apre il manuale; si scorre con le frecce o la barra spaziatrice e si esce con `q`."
    },
    {
        id: "2.2-02", type: "single", ref: "2.2_01#Pagine Man",
        text: "Il manuale è diviso in sezioni numerate. Che cosa c'è nella sezione 5?",
        options: [
            { t: "I formati dei file, come i file di configurazione", ok: true, why: "Per esempio `man 5 passwd` descrive il file `/etc/passwd`. La sezione 1 ha i comandi per tutti, la 8 quelli di amministrazione." },
            { t: "I comandi per tutti gli utenti", ok: false, why: "Sono nella sezione 1." },
            { t: "I comandi per l'amministratore", ok: false, why: "Sono nella sezione 8." },
            { t: "I giochi", ok: false, why: "I giochi sono nella sezione 6." }
        ]
    },
    {
        id: "2.2-03", type: "fill", ref: "2.2_01#Pagine Man", placeholder: "comando",
        text: "Esistono il comando `passwd` e il file `/etc/passwd`. Scrivi il comando che apre la pagina di manuale del file, nella sezione 5.",
        answers: ["man 5 passwd", "man -s 5 passwd", "man -s5 passwd"],
        why: "Con il numero della sezione prima del nome (`man 5 passwd`) si sceglie quale pagina aprire; senza numero `man` apre la prima che trova, cioè quella del comando (sezione 1)."
    },
    {
        id: "2.2-04", type: "single", ref: "2.2_01#Pagine Man",
        text: "Non ricordi il nome di un comando, ma sai che riguarda la compressione. Che cosa ti aiuta?",
        options: [
            { t: "`man -k compress` (oppure `apropos compress`)", ok: true, why: "Cerca la parola nelle descrizioni brevi di tutte le pagine di manuale ed elenca i comandi che la contengono." },
            { t: "`man compress`", ok: false, why: "Apre la pagina di un comando chiamato esattamente `compress`, se esiste." },
            { t: "`locate compress`", ok: false, why: "`locate` cerca nomi di file, non descrizioni di comandi." },
            { t: "`history compress`", ok: false, why: "`history` mostra i comandi che hai già scritto." }
        ]
    },
    {
        id: "2.2-05", type: "single", ref: "2.2_01#Pagine Man",
        text: "Hai aperto una pagina con `man`. Quale tasto premi per cercare una parola nel testo?",
        options: [
            { t: "`/`, poi la parola e Invio", ok: true, why: "Con `/parola` cerchi in avanti; `n` va al risultato successivo. Si esce con `q`." },
            { t: "Ctrl+F", ok: false, why: "Nel visualizzatore di `man` Ctrl+F va avanti di una pagina, non cerca." },
            { t: "`s`", ok: false, why: "`s` non serve a cercare." },
            { t: "Non si può cercare dentro una pagina di manuale", ok: false, why: "Si può, con `/`." }
        ]
    },
    {
        id: "2.2-06", type: "single", ref: "2.2_01#Pagine Info",
        text: "Che cosa distingue le pagine `info` dalle pagine `man`?",
        options: [
            { t: "Sono organizzate in nodi collegati tra loro, come un piccolo ipertesto, e spesso sono più lunghe e dettagliate", ok: true, why: "Molti programmi GNU hanno la documentazione completa in `info`; ci si sposta tra i nodi con i collegamenti." },
            { t: "Sono solo in inglese, mentre `man` è sempre tradotto", ok: false, why: "La lingua dipende dalle traduzioni disponibili per ogni pagina, sia per `man` sia per `info`." },
            { t: "Spiegano solo i comandi interni di Bash", ok: false, why: "Per i comandi interni c'è `help`." },
            { t: "Si leggono solo con un browser", ok: false, why: "Si leggono nel terminale con il comando `info`." }
        ]
    },
    {
        id: "2.2-07", type: "single", ref: "2.2_01#La Directory /usr/share/doc/",
        text: "Che cosa trovi nella directory `/usr/share/doc/`?",
        options: [
            { t: "La documentazione dei pacchetti installati: file README, novità delle versioni, licenze, esempi", ok: true, why: "Ogni pacchetto ha di solito una sua sottodirectory, per esempio `/usr/share/doc/bash/`." },
            { t: "I documenti personali di tutti gli utenti", ok: false, why: "I documenti personali stanno nelle directory home, sotto `/home`." },
            { t: "Le pagine di manuale già impaginate", ok: false, why: "Le pagine di manuale stanno in `/usr/share/man/`." },
            { t: "I file di configurazione del sistema", ok: false, why: "La configurazione sta in `/etc`." }
        ]
    },
    {
        id: "2.2-08", type: "single", ref: "2.2_01#Il Comando locate",
        text: "Hai appena creato il file `appunti.txt`, ma `locate appunti.txt` non lo trova. Perché?",
        options: [
            { t: "`locate` cerca in un database aggiornato di tanto in tanto: il file nuovo non c'è ancora finché non si aggiorna con `updatedb`", ok: true, why: "Per questo `locate` è velocissimo ma non sempre aggiornato; `find` invece guarda il disco in quel momento." },
            { t: "`locate` trova solo i file di sistema, non quelli degli utenti", ok: false, why: "Il database comprende anche i file degli utenti (rispettando i permessi)." },
            { t: "`locate` cerca solo nella directory corrente", ok: false, why: "`locate` cerca in tutto il database, quindi in tutto il sistema." },
            { t: "Il nome contiene un punto e `locate` non lo accetta", ok: false, why: "I punti nei nomi non sono un problema." }
        ]
    },
    {
        id: "2.2-09", type: "fill", ref: "2.2_01#Il Comando locate", placeholder: "comando",
        text: "Quale comando aggiorna il database usato da `locate`? (Di solito si esegue come root.)",
        answers: ["updatedb", "sudo updatedb"],
        why: "`updatedb` percorre il file system e riscrive il database. Molte distribuzioni lo eseguono da sole ogni giorno."
    },
    {
        id: "2.2-10", type: "multiple", ref: "2.2_01#Aiuto Interno",
        text: "Quali comandi mostrano un aiuto breve direttamente nel terminale?",
        options: [
            { t: "`ls --help`", ok: true, why: "Quasi tutti i programmi GNU rispondono a `--help` con un riassunto delle opzioni." },
            { t: "`help cd`", ok: true, why: "`help` spiega i comandi interni di Bash, come `cd`, che non hanno una pagina `man` propria." },
            { t: "`aiuto ls`", ok: false, why: "Non esiste un comando `aiuto`." },
            { t: "`ls /help`", ok: false, why: "Così `ls` prova a elencare una directory chiamata `/help`." },
            { t: "`cd --manual`", ok: false, why: "`cd` non ha un'opzione `--manual`." }
        ]
    },
    {
        id: "2.2-11", type: "single", ref: "2.2_01#Il Comando find",
        text: "Che cosa fa il comando `find /home/anna -name \"*.pdf\"`?",
        options: [
            { t: "Cerca in `/home/anna` e in tutte le sue sottodirectory i file il cui nome finisce con `.pdf`", ok: true, why: "`find` scende in tutte le sottodirectory e controlla i file uno per uno, in quel momento." },
            { t: "Cerca la parola «pdf» dentro i file", ok: false, why: "Per cercare dentro i file si usa `grep`; `find` guarda i nomi e le proprietà dei file." },
            { t: "Cerca solo in `/home/anna`, senza entrare nelle sottodirectory", ok: false, why: "`find` entra nelle sottodirectory, a meno di limitarlo con `-maxdepth`." },
            { t: "Converte i file in PDF", ok: false, why: "`find` cerca e basta." }
        ]
    },

    // ---- 2.3 Utilizzo di Directory e Elenchi di File ----
    {
        id: "2.3-01", type: "single", ref: "2.3_01#Percorsi Relativi Speciali",
        text: "Sei in `/home/anna/documenti`. Dove ti porta `cd ..`?",
        options: [
            { t: "In `/home/anna`", ok: true, why: "`..` indica la directory che contiene quella corrente (la directory madre)." },
            { t: "In `/home`", ok: false, why: "Per salire di due livelli serve `cd ../..`." },
            { t: "In `/`", ok: false, why: "La radice si raggiunge con `cd /`." },
            { t: "Resti in `/home/anna/documenti`", ok: false, why: "Resti dove sei con `cd .`, perché `.` è la directory corrente." }
        ]
    },
    {
        id: "2.3-02", type: "single", ref: "2.3_02#Directory Home",
        text: "Che cosa fa `cd` scritto da solo, senza argomenti?",
        options: [
            { t: "Ti porta nella tua directory home", ok: true, why: "Equivale a `cd ~` o `cd $HOME`." },
            { t: "Ti porta nella radice `/`", ok: false, why: "Per la radice serve `cd /`." },
            { t: "Mostra la directory corrente", ok: false, why: "La directory corrente la mostra `pwd`." },
            { t: "Dà un errore perché manca la directory", ok: false, why: "Senza argomenti `cd` sceglie la home." }
        ]
    },
    {
        id: "2.3-03", type: "multiple", ref: "2.3_01#Percorsi Assoluti e Relativi",
        text: "Quali di questi sono percorsi assoluti?",
        options: [
            { t: "`/etc/hosts`", ok: true, why: "Inizia con `/`: parte dalla radice e vale da qualsiasi directory." },
            { t: "`/home/anna/foto`", ok: true, why: "Inizia con `/`, quindi è assoluto." },
            { t: "`documenti/lettera.txt`", ok: false, why: "Non inizia con `/`: è relativo alla directory corrente." },
            { t: "`../tmp`", ok: false, why: "Parte dalla directory madre di quella corrente: è relativo." },
            { t: "`./script.sh`", ok: false, why: "`.` è la directory corrente: è un percorso relativo." }
        ]
    },
    {
        id: "2.3-04", type: "fill", ref: "2.3_02#File e Directory Nascosti", placeholder: "opzione",
        text: "Quale opzione di `ls` mostra anche i file nascosti, quelli il cui nome inizia con un punto?",
        answers: ["-a", "--all", "-A", "--almost-all"],
        why: "`ls -a` mostra tutto, anche `.` e `..`; `ls -A` mostra i file nascosti ma non `.` e `..`."
    },
    {
        id: "2.3-05", type: "single", ref: "2.3_02#File e Directory Nascosti",
        text: "Che cosa rende «nascosto» un file come `.bashrc`?",
        options: [
            { t: "Il nome che inizia con un punto: `ls` non lo mostra se non si usa `-a`", ok: true, why: "È solo una convenzione: il file è normale e si apre come gli altri. Si usa soprattutto per i file di configurazione nella home." },
            { t: "Un permesso speciale che solo root può togliere", ok: false, why: "I permessi non c'entrano: basta il punto all'inizio del nome." },
            { t: "Il fatto che sta in una directory di sistema", ok: false, why: "Un file nascosto può stare in qualsiasi directory." },
            { t: "Il contenuto cifrato", ok: false, why: "I file nascosti non sono cifrati." }
        ]
    },
    {
        id: "2.3-06", type: "single", ref: "2.3_02#L’Opzione Formato di Elenco Lungo (Long List)",
        text: "Che cosa aggiunge l'opzione `-l` di `ls`?",
        options: [
            { t: "Una riga per file con tipo e permessi, proprietario, gruppo, dimensione e data di modifica", ok: true, why: "È il formato lungo; con `-h` le dimensioni diventano più leggibili (K, M, G)." },
            { t: "Solo i file più grandi", ok: false, why: "`-l` non filtra: mostra più informazioni su tutti i file." },
            { t: "I file elencati in ordine di lunghezza del nome", ok: false, why: "L'ordine resta alfabetico; cambia solo il formato." },
            { t: "I link simbolici e basta", ok: false, why: "Mostra tutti i file; i link si riconoscono dalla `l` all'inizio della riga." }
        ]
    },
    {
        id: "2.3-07", type: "fill", ref: "2.3_02#La Ricorsione in Bash", placeholder: "opzione",
        text: "Quale opzione di `ls` elenca anche il contenuto di tutte le sottodirectory (elenco ricorsivo)?",
        answers: ["-R", "--recursive"],
        why: "`ls -R`, con la R maiuscola. Attenzione: `ls -r` (minuscola) inverte solo l'ordine dell'elenco."
    },
    {
        id: "2.3-08", type: "single", ref: "2.3_02#Il Percorso Relativo Speciale per la Directory Home",
        text: "Che cosa indica `~luca` in un percorso?",
        options: [
            { t: "La directory home dell'utente `luca`", ok: true, why: "`~` da solo è la tua home; `~` seguito da un nome è la home di quell'utente, di solito `/home/luca`." },
            { t: "Un file temporaneo di `luca`", ok: false, why: "La tilde non indica file temporanei." },
            { t: "Una copia di riserva del file `luca`", ok: false, why: "Alcuni editor creano copie con la tilde in fondo (`luca~`), ma qui la tilde è all'inizio." },
            { t: "La directory corrente", ok: false, why: "La directory corrente è `.`." }
        ]
    },
    {
        id: "2.3-09", type: "single", ref: "2.3_01#Percorsi Relativi Speciali",
        text: "Sei in `/home/anna/foto`. In quale directory ti porta `cd ../../luca`?",
        options: [
            { t: "`/home/luca`", ok: true, why: "Il primo `..` porta in `/home/anna`, il secondo in `/home`, poi si entra in `luca`." },
            { t: "`/home/anna/luca`", ok: false, why: "Così sarebbe con un solo `..`." },
            { t: "`/luca`", ok: false, why: "Per arrivare alla radice servirebbero tre `..`." },
            { t: "`/home/anna/foto/luca`", ok: false, why: "Sarebbe `cd luca`, senza salire." }
        ]
    },
    {
        id: "2.3-10", type: "single", ref: "2.3_02#Altre Opzioni di ls",
        text: "Che cosa fa `ls -lh`?",
        options: [
            { t: "Elenco lungo con le dimensioni in forma leggibile, per esempio `4.0K` o `12M`", ok: true, why: "`-h` (human-readable) si combina con `-l`: invece dei byte mostra K, M, G." },
            { t: "Mostra l'aiuto di `ls`", ok: false, why: "L'aiuto si ottiene con `ls --help`; qui `-h` cambia il formato delle dimensioni." },
            { t: "Elenca solo i file nascosti", ok: false, why: "Per i nascosti serve `-a`." },
            { t: "Ordina i file dal più vecchio al più nuovo", ok: false, why: "Per ordinare per data si usa `-t` (e `-r` per invertire)." }
        ]
    },
    {
        id: "2.3-11", type: "fill", ref: "2.3_01#Ottenere la Posizione Corrente", placeholder: "comando",
        text: "Quale comando mostra il percorso completo della directory in cui ti trovi?",
        answers: ["pwd"],
        why: "`pwd` (print working directory) stampa per esempio `/home/anna/documenti`."
    },
    {
        id: "2.3-12", type: "single", ref: "2.3_02#Altre Opzioni di ls",
        text: "Quale comando elenca i file mettendo per primi quelli modificati più di recente?",
        options: [
            { t: "`ls -t`", ok: true, why: "`-t` ordina per data di modifica, dal più recente; con `-tr` si parte dal più vecchio." },
            { t: "`ls -r`", ok: false, why: "`-r` inverte l'ordine, che senza altre opzioni resta alfabetico." },
            { t: "`ls -d`", ok: false, why: "`-d` mostra le directory stesse invece del loro contenuto." },
            { t: "`ls -n`", ok: false, why: "`-n` mostra i numeri di utente e gruppo invece dei nomi." }
        ]
    },

    // ---- 2.4 Creazione, Spostamento ed Eliminazione di File ----
    {
        id: "2.4-01", type: "single", ref: "2.4_01#Distinzione tra Maiuscole e Minuscole",
        text: "Nella stessa directory ci sono `Report.txt` e `report.txt`. Che cosa succede?",
        options: [
            { t: "Sono due file diversi: in Linux i nomi distinguono maiuscole e minuscole", ok: true, why: "Per Linux `R` e `r` sono caratteri diversi, quindi i due nomi sono diversi." },
            { t: "È impossibile: il secondo sovrascrive il primo", ok: false, why: "Succede su Windows e (di solito) su macOS, non sui file system di Linux." },
            { t: "Linux li mostra come un solo file", ok: false, why: "`ls` li mostra tutti e due." },
            { t: "Il secondo viene rinominato da solo", ok: false, why: "Nessun rinomina automatica: sono semplicemente due file." }
        ]
    },
    {
        id: "2.4-02", type: "fill", ref: "2.4_01#Creare Directory", placeholder: "comando",
        text: "La directory `progetti` non esiste ancora. Scrivi il comando che crea `progetti/2027/foto` in un colpo solo, con le directory intermedie.",
        answers: ["mkdir -p progetti/2027/foto", "mkdir --parents progetti/2027/foto", "mkdir -p progetti/2027/foto/"],
        why: "Con `-p` (parents) `mkdir` crea anche le directory che mancano lungo il percorso; senza, darebbe errore."
    },
    {
        id: "2.4-03", type: "single", ref: "2.4_01#Creare i File",
        text: "Che cosa fa `touch nota.txt` se `nota.txt` esiste già?",
        options: [
            { t: "Aggiorna la data di ultima modifica del file, senza cambiarne il contenuto", ok: true, why: "Se il file non esiste lo crea vuoto; se esiste ne aggiorna solo le date." },
            { t: "Svuota il file", ok: false, why: "Per svuotarlo si potrebbe usare `> nota.txt`; `touch` non tocca il contenuto." },
            { t: "Crea `nota.txt.1`", ok: false, why: "`touch` non crea copie." },
            { t: "Dà errore", ok: false, why: "Nessun errore: è un uso normale di `touch`." }
        ]
    },
    {
        id: "2.4-04", type: "single", ref: "2.4_01#Rinominare i File",
        text: "Quale comando rinomina `bozza.txt` in `lettera.txt`?",
        options: [
            { t: "`mv bozza.txt lettera.txt`", ok: true, why: "In Linux rinominare vuol dire spostare con un nome nuovo: lo fa `mv`." },
            { t: "`cp bozza.txt lettera.txt`", ok: false, why: "`cp` crea una copia: alla fine avresti tutti e due i file." },
            { t: "`rn bozza.txt lettera.txt`", ok: false, why: "Non esiste un comando `rn`." },
            { t: "`touch bozza.txt lettera.txt`", ok: false, why: "`touch` creerebbe un file vuoto `lettera.txt` accanto a `bozza.txt`." }
        ]
    },
    {
        id: "2.4-05", type: "single", ref: "2.4_01#Eliminare File e Directory",
        text: "La directory `vecchi` contiene dei file. Che cosa succede con `rmdir vecchi`?",
        options: [
            { t: "Errore: `rmdir` elimina solo directory vuote", ok: true, why: "Bash risponde «Directory not empty». Per eliminarla con tutto il contenuto serve `rm -r vecchi`." },
            { t: "Elimina la directory e tutti i file dentro", ok: false, why: "Lo fa `rm -r`, non `rmdir`." },
            { t: "Elimina i file ma lascia la directory", ok: false, why: "`rmdir` non tocca i file." },
            { t: "Sposta la directory nel cestino", ok: false, why: "I comandi della shell non usano il cestino: quello che eliminano sparisce." }
        ]
    },
    {
        id: "2.4-06", type: "fill", ref: "2.4_01#Eliminare File e Directory", placeholder: "comando",
        text: "Scrivi il comando che elimina la directory `vecchi` con tutto quello che contiene.",
        answers: ["rm -r vecchi", "rm -R vecchi", "rm -rf vecchi", "rm -fr vecchi", "rm -Rf vecchi", "rm --recursive vecchi", "rm -r vecchi/"],
        why: "`rm -r` (ricorsivo) cancella la directory e tutto il suo contenuto. Con `-f` non chiede conferme: va usato con molta attenzione."
    },
    {
        id: "2.4-07", type: "single", ref: "2.4_01#Copiare File e Directory",
        text: "Che cosa succede con `cp foto backup` se `foto` è una directory?",
        options: [
            { t: "`cp` la salta e avvisa: per copiare una directory serve `cp -r`", ok: true, why: "Senza `-r` (ricorsivo) `cp` copia solo file e scrive che manca `-r`." },
            { t: "Copia la directory con tutto il contenuto", ok: false, why: "Succederebbe con `cp -r foto backup`." },
            { t: "Sposta la directory", ok: false, why: "Per spostare si usa `mv`." },
            { t: "Crea un link alla directory", ok: false, why: "I link si creano con `ln`." }
        ]
    },
    {
        id: "2.4-08", type: "multiple", ref: "2.4_01#Globbing",
        text: "Nella directory ci sono `file1.txt`, `fileA.txt`, `file10.txt`, `file.txt` e `File2.txt`. Quali nomi corrispondono al modello `file?.txt`?",
        options: [
            { t: "`file1.txt`", ok: true, why: "`?` sta per esattamente un carattere: qui è `1`." },
            { t: "`fileA.txt`", ok: true, why: "`?` vale qualsiasi carattere, anche una lettera." },
            { t: "`file10.txt`", ok: false, why: "Dopo «file» ci sono due caratteri, ma `?` ne vale uno solo." },
            { t: "`file.txt`", ok: false, why: "Manca il carattere: `?` ne richiede esattamente uno." },
            { t: "`File2.txt`", ok: false, why: "Inizia con la F maiuscola: il modello distingue maiuscole e minuscole." }
        ]
    },
    {
        id: "2.4-09", type: "single", ref: "2.4_01#Globbing",
        text: "Quali file elimina `rm *.jpg`?",
        options: [
            { t: "Tutti i file della directory corrente il cui nome finisce con `.jpg`, tranne quelli nascosti", ok: true, why: "`*` vale qualsiasi sequenza di caratteri, anche vuota; i nomi che iniziano con il punto però non vengono presi." },
            { t: "Tutti i file `.jpg` del computer", ok: false, why: "Il modello vale solo nella directory corrente, senza scendere nelle sottodirectory." },
            { t: "Solo il file che si chiama proprio `*.jpg`", ok: false, why: "La shell sostituisce `*.jpg` con i nomi che corrispondono prima di eseguire `rm`." },
            { t: "Anche i file `.JPG` con l'estensione maiuscola", ok: false, why: "Il modello distingue maiuscole e minuscole." }
        ]
    },
    {
        id: "2.4-10", type: "single", ref: "2.4_01#Globbing",
        text: "Nella directory ci sono `alfa`, `beta`, `casa` e `delta`. Che cosa stampa `echo [abc]*`?",
        options: [
            { t: "`alfa beta casa`", ok: true, why: "`[abc]` vale un solo carattere tra a, b e c; `*` il resto del nome. `delta` inizia con d e resta fuori." },
            { t: "`alfa beta casa delta`", ok: false, why: "`delta` inizia con una lettera che non è tra le parentesi." },
            { t: "`[abc]*`", ok: false, why: "Il modello resta così solo se nessun file corrisponde." },
            { t: "`abc`", ok: false, why: "Le parentesi indicano un carattere a scelta, non la parola «abc»." }
        ]
    },
    {
        id: "2.4-11", type: "single", ref: "2.4_01#Eliminare File e Directory",
        text: "A che cosa serve l'opzione `-i` in `rm -i *.txt`?",
        options: [
            { t: "Chiede conferma prima di eliminare ogni file", ok: true, why: "Per ogni file risponde `y` per eliminarlo o `n` per tenerlo: utile con i modelli come `*`." },
            { t: "Ignora i file che non esistono", ok: false, why: "Lo fa `-f`, che inoltre non chiede conferme." },
            { t: "Elimina anche i file nascosti", ok: false, why: "`-i` non cambia quali file vengono scelti." },
            { t: "Elimina le directory", ok: false, why: "Per le directory servono `-r` o `-d`." }
        ]
    },
    {
        id: "2.4-12", type: "single", ref: "2.4_01#Spostare i File",
        text: "La directory `documenti` esiste. Che cosa fa `mv nota.txt documenti`?",
        options: [
            { t: "Sposta `nota.txt` dentro `documenti`", ok: true, why: "Se l'ultimo argomento è una directory esistente, `mv` ci sposta dentro il file, con lo stesso nome." },
            { t: "Rinomina `nota.txt` in un file chiamato `documenti`", ok: false, why: "Succederebbe solo se `documenti` non esistesse." },
            { t: "Sostituisce la directory `documenti` con il file", ok: false, why: "`mv` non sovrascrive una directory con un file." },
            { t: "Copia `nota.txt` dentro `documenti`", ok: false, why: "`mv` sposta: dopo, il file non è più nella directory di partenza." }
        ]
    }
]);
