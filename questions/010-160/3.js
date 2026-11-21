// Domande dell'argomento 3: Il Potere della Command Line.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// I risultati dei comandi sono stati provati in Bash. Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 3.1 Archiviazione dei File sulla Command Line ----
    {
        id: "3.1-01", type: "fill", ref: "3.1_01#Strumenti di Archiviazione", placeholder: "comando",
        text: "Scrivi il comando `tar` che crea l'archivio compresso con gzip `backup.tar.gz` con dentro la directory `documenti`.",
        answers: ["tar -czf backup.tar.gz documenti", "tar czf backup.tar.gz documenti", "tar -cvzf backup.tar.gz documenti", "tar -zcf backup.tar.gz documenti"],
        pattern: "^(sudo )?tar (-?(?=[cvz]*c)(?=[cvz]*z)[cvz]{2,3}f|(?=[cvzf]*c)(?=[cvzf]*z)(?=[cvzf]*f)[cvzf]{3,4}|-c (-v )?-z (-v )?-f|-z (-v )?-c (-v )?-f|-(cz|zc) -f|-c -zf|-z -cf) backup\\.tar\\.gz documenti/?$",
        alsoAccepted: ["tar cfz backup.tar.gz documenti", "tar -c -z -f backup.tar.gz documenti", "tar -cz -f backup.tar.gz documenti", "tar -zcvf backup.tar.gz documenti/"],
        notAccepted: ["tar -xzf backup.tar.gz documenti", "tar -cf backup.tar.gz documenti", "tar -czf documenti backup.tar.gz", "tar -cfz backup.tar.gz documenti"],
        why: "`c` crea l'archivio, `z` lo comprime con gzip, `f` indica il nome del file (che va subito dopo). L'ordine di `c` e `z` non conta; `v` (facoltativa) elenca i file mentre lavora."
    },
    {
        id: "3.1-02", type: "single", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Che cosa fa `tar -xf archivio.tar`?",
        options: [
            { t: "Estrae i file dell'archivio nella directory corrente", ok: true, why: "`x` sta per extract (estrai), `f` indica il file dell'archivio." },
            { t: "Crea l'archivio `archivio.tar`", ok: false, why: "Per creare si usa `c`." },
            { t: "Mostra l'elenco dei file nell'archivio senza estrarli", ok: false, why: "Per l'elenco si usa `t`: `tar -tf archivio.tar`." },
            { t: "Cancella l'archivio", ok: false, why: "`tar` non cancella gli archivi." }
        ]
    },
    {
        id: "3.1-03", type: "single", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Come vedi quali file contiene `foto.tar.gz` senza estrarli?",
        options: [
            { t: "`tar -tzf foto.tar.gz`", ok: true, why: "`t` elenca il contenuto; `z` dice che è compresso con gzip (le versioni recenti di tar lo capiscono anche da sole)." },
            { t: "`tar -czf foto.tar.gz`", ok: false, why: "`c` crea un archivio nuovo: rischi di sovrascrivere quello che hai." },
            { t: "`cat foto.tar.gz`", ok: false, why: "Mostra il contenuto compresso del file, illeggibile." },
            { t: "`ls foto.tar.gz`", ok: false, why: "`ls` mostra il file, non quello che c'è dentro." }
        ]
    },
    {
        id: "3.1-04", type: "single", ref: "3.1_01#Strumenti di Compressione",
        text: "Nella directory c'è `relazione.txt`. Che cosa trovi dopo `gzip relazione.txt`?",
        options: [
            { t: "Solo `relazione.txt.gz`: l'originale viene sostituito", ok: true, why: "`gzip` comprime e toglie l'originale; con `gzip -k` lo tiene. `gunzip` fa il contrario." },
            { t: "`relazione.txt` e `relazione.txt.gz`, uno accanto all'altro", ok: false, why: "Succede solo con l'opzione `-k` (keep)." },
            { t: "`relazione.zip`, un archivio compresso con zip", ok: false, why: "Il formato zip è un altro, con i comandi `zip` e `unzip`." },
            { t: "`relazione.tar`, un archivio non compresso", ok: false, why: "`gzip` comprime un singolo file, non crea archivi tar." }
        ]
    },
    {
        id: "3.1-05", type: "multiple", ref: "3.1_01#Strumenti di Compressione",
        text: "Quali comandi decomprimono un file?",
        options: [
            { t: "`gunzip`", ok: true, why: "Decomprime i file `.gz` creati con `gzip`." },
            { t: "`bunzip2`", ok: true, why: "Decomprime i file `.bz2` creati con `bzip2`." },
            { t: "`xz`", ok: false, why: "Senza opzioni `xz` comprime; per decomprimere servono `unxz` o `xz -d`." },
            { t: "`bzip2`", ok: false, why: "Senza opzioni `bzip2` comprime." },
            { t: "`tar -c`", ok: false, why: "`c` crea un archivio." }
        ]
    },
    {
        id: "3.1-06", type: "single", ref: "3.1_01#Strumenti di Compressione",
        text: "In generale, come si confrontano gzip, bzip2 e xz?",
        options: [
            { t: "gzip: veloce; xz: comprime di più; bzip2: nel mezzo", ok: true, why: "Più si comprime, più tempo serve: si sceglie secondo cosa conta di più." },
            { t: "Comprimono tutti allo stesso modo: cambia solo l'estensione del file", ok: false, why: "Usano metodi diversi, con risultati e velocità diversi." },
            { t: "gzip comprime di più di tutti, mentre xz è il più veloce dei tre", ok: false, why: "Di solito è il contrario." },
            { t: "Solo xz funziona insieme a tar; gli altri si usano da soli", ok: false, why: "tar li usa tutti: `z` per gzip, `j` per bzip2, `J` per xz." }
        ]
    },
    {
        id: "3.1-07", type: "single", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Che cosa fa `tar -cf archivio.tar foto/`, senza altre opzioni?",
        options: [
            { t: "Archivia la directory senza comprimerla", ok: true, why: "tar raccoglie i file in uno solo; per comprimere servono `z`, `j` o `J` (oppure un compressore dopo)." },
            { t: "Crea un archivio compresso con gzip, come `archivio.tar.gz`", ok: false, why: "Senza `z` non c'è compressione." },
            { t: "Copia la directory `foto` dentro la directory `archivio.tar/`", ok: false, why: "`archivio.tar` è un file, non una directory." },
            { t: "Estrae la directory `foto/` dall'archivio `archivio.tar`", ok: false, why: "Per estrarre si usa `x`." }
        ]
    },
    {
        id: "3.1-08", type: "fill", ref: "3.1_01#Gestire i File ZIP", placeholder: "comando",
        text: "Scrivi il comando che estrae i file dell'archivio `foto.zip` nella directory corrente.",
        answers: ["unzip foto.zip"],
        pattern: "^unzip (\\./)?foto\\.zip$",
        alsoAccepted: ["unzip ./foto.zip"],
        notAccepted: ["zip foto.zip", "unzip -l foto.zip"],
        why: "`unzip` estrae gli archivi zip; `unzip -l foto.zip` invece elenca solo il contenuto."
    },
    {
        id: "3.1-09", type: "single", ref: "3.1_01#Gestire i File ZIP",
        text: "Vuoi mettere in `lavoro.zip` la directory `progetto` con tutto il suo contenuto. Quale comando usi?",
        options: [
            { t: "`zip -r lavoro.zip progetto`", ok: true, why: "Prima il nome dell'archivio, poi cosa metterci; `-r` entra nelle sottodirectory." },
            { t: "`zip lavoro.zip progetto`", ok: false, why: "Senza `-r` nell'archivio finisce solo la directory vuota, senza i file." },
            { t: "`unzip -r lavoro.zip progetto`", ok: false, why: "`unzip` estrae, non crea." },
            { t: "`zip progetto lavoro.zip`", ok: false, why: "L'ordine è sbagliato: il nome dell'archivio va per primo." }
        ]
    },
    {
        id: "3.1-10", type: "single", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Quale opzione di `tar` comprime l'archivio con xz?",
        options: [
            { t: "`-J` (maiuscola)", ok: true, why: "Per esempio `tar -cJf archivio.tar.xz foto`." },
            { t: "`-j` (minuscola)", ok: false, why: "`-j` usa bzip2." },
            { t: "`-z`", ok: false, why: "`-z` usa gzip." },
            { t: "`-x`", ok: false, why: "`-x` estrae." }
        ]
    },
    {
        id: "3.1-11", type: "single", ref: "3.1_01#Strumenti di Compressione",
        text: "Con quale programma è stato compresso un file chiamato `dati.tar.bz2`?",
        options: [
            { t: "bzip2", ok: true, why: "`.bz2` è l'estensione di bzip2; si decomprime con `bunzip2` oppure, essendo un tar, con `tar -xjf`." },
            { t: "gzip", ok: false, why: "gzip usa l'estensione `.gz`." },
            { t: "xz", ok: false, why: "xz usa l'estensione `.xz`." },
            { t: "compress", ok: false, why: "`compress` è il vecchio programma di Unix: i suoi file finiscono con `.Z`, non con `.bz2`." }
        ]
    },
    {
        id: "3.1-12", type: "single", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Che cosa fa l'opzione `-v` in `tar -cvf archivio.tar foto`?",
        options: [
            { t: "Scrive il nome di ogni file mentre lo mette nell'archivio", ok: true, why: "`-v` (verbose, dettagliato) mostra i file uno per uno; senza `-v`, `tar` lavora in silenzio." },
            { t: "Controlla alla fine che l'archivio non sia rovinato", ok: false, why: "`-v` non verifica niente: scrive solo i nomi dei file." },
            { t: "Comprime l'archivio con xz", ok: false, why: "Per xz l'opzione è `-J`." },
            { t: "Crea un archivio separato per ogni file della directory", ok: false, why: "`tar` crea sempre un solo archivio, quello indicato dopo `-f`." }
        ]
    },
    {
        id: "3.1-13", type: "single", ref: "3.1_01#Strumenti di Compressione",
        text: "Che cosa fa `bzip2 -d relazione.txt.bz2`?",
        options: [
            { t: "Decomprime il file: resta `relazione.txt`", ok: true, why: "`-d` (decompress) fa lo stesso di `bunzip2`: il file compresso viene sostituito da quello originale." },
            { t: "Cancella il file compresso senza decomprimerlo", ok: false, why: "`-d` sta per decompress, non per delete." },
            { t: "Lo comprime di nuovo, con più forza", ok: false, why: "Il livello di compressione si sceglie con i numeri, come `-9`; `-d` decomprime." },
            { t: "Ne mostra il contenuto senza cambiare niente", ok: false, why: "Per vederlo senza toccare il file si usa `bzcat` (o `bzip2 -dc`)." }
        ]
    },
    {
        id: "3.1-14", type: "single", ref: "3.1_01#Gestire i File ZIP",
        text: "Quale comando elenca i file contenuti in `foto.zip` senza estrarli?",
        options: [
            { t: "`unzip -l foto.zip`", ok: true, why: "`-l` (list) mostra nomi, dimensioni e date dei file nell'archivio zip." },
            { t: "`zip -l foto.zip`", ok: false, why: "In `zip`, `-l` converte i fine riga dei file di testo nel formato di Windows: non elenca niente." },
            { t: "`tar -tf foto.zip`", ok: false, why: "GNU tar legge gli archivi tar, non quelli zip: direbbe che il file non sembra un archivio tar." },
            { t: "`unzip -x foto.zip`", ok: false, why: "`-x` serve a escludere dei file quando si estrae: senza nomi dopo, estrae tutto." }
        ]
    },
    {
        id: "3.1-15", type: "multiple", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Quali di questi file sono, dal nome, archivi tar compressi?",
        options: [
            { t: "`backup.tar.gz`", ok: true, why: "Un archivio tar compresso con gzip." },
            { t: "`foto.tgz`", ok: true, why: "`.tgz` è l'abbreviazione di `.tar.gz`." },
            { t: "`dati.tar.xz`", ok: true, why: "Un archivio tar compresso con xz." },
            { t: "`note.zip`", ok: false, why: "Uno zip è un archivio, ma nel formato zip, non tar." },
            { t: "`relazione.txt.gz`", ok: false, why: "È un singolo file di testo compresso con gzip, non un archivio tar." }
        ]
    },

    // ---- 3.2 Ricerca ed Estrazione di Dati dai File ----
    {
        id: "3.2-01", type: "single", ref: "3.2_01#Redirigere lo Standard Output",
        text: "Che differenza c'è tra `ls > elenco.txt` e `ls >> elenco.txt`?",
        options: [
            { t: "`>` sostituisce il contenuto del file, `>>` aggiunge in fondo", ok: true, why: "Con `>` il file viene svuotato e riscritto; con `>>` il vecchio contenuto resta. Se il file non esiste, tutti e due lo creano." },
            { t: "`>>` sostituisce il contenuto del file, `>` aggiunge in fondo", ok: false, why: "È il contrario." },
            { t: "Nessuna: `>>` è solo un modo più sicuro di scrivere `>`", ok: false, why: "Il risultato è diverso se il file contiene già qualcosa." },
            { t: "`>>` manda nel file anche i messaggi di errore", ok: false, why: "Gli errori si redirigono con `2>`; `>>` riguarda solo l'output normale." }
        ]
    },
    {
        id: "3.2-02", type: "fill", ref: "3.2_01#Redirigere lo Standard Error", placeholder: "redirezione",
        text: "Completa il comando per buttare via i messaggi di errore (per esempio «Permesso negato»): `find / -name hosts ______`",
        answers: ["2>/dev/null", "2> /dev/null"],
        why: "`2>` redirige lo standard error (il canale 2); `/dev/null` è un file speciale che scarta tutto quello che riceve. I risultati normali continuano ad arrivare sullo schermo."
    },
    {
        id: "3.2-03", type: "single", ref: "3.2_01#Pipe",
        text: "Che cosa fa la barra verticale `|` in `ls -l | less`?",
        options: [
            { t: "Passa l'output di `ls -l` a `less`", ok: true, why: "È una pipe: il secondo comando lavora sul risultato del primo, senza file intermedi." },
            { t: "Esegue `less` solo se `ls -l` va a buon fine", ok: false, why: "Per questo si usa `&&`." },
            { t: "Salva l'output di `ls -l` in un file chiamato `less`", ok: false, why: "Per salvare in un file si usa `>`." },
            { t: "Esegue i due comandi in contemporanea, indipendenti", ok: false, why: "I due comandi sono collegati: il secondo legge quello che scrive il primo." }
        ]
    },
    {
        id: "3.2-04", type: "single", ref: "3.2_02#Cercare all’interno dei File con grep",
        text: "Quale opzione fa trovare a `grep` le righe con «errore», «Errore» ed «ERRORE»?",
        options: [
            { t: "`-i`", ok: true, why: "`grep -i errore file.log` ignora la differenza tra maiuscole e minuscole." },
            { t: "`-v`", ok: false, why: "`-v` mostra le righe che non contengono la parola." },
            { t: "`-c`", ok: false, why: "`-c` conta le righe trovate invece di mostrarle." },
            { t: "`-r`", ok: false, why: "`-r` cerca in tutti i file delle sottodirectory." }
        ]
    },
    {
        id: "3.2-05", type: "single", ref: "3.2_02#Cercare all’interno dei File con grep",
        text: "Che cosa mostra `grep -v '^#' configurazione.conf`?",
        options: [
            { t: "Le righe che non iniziano con `#`: il file senza commenti", ok: true, why: "`^#` trova le righe che iniziano con `#`; `-v` le esclude e mostra tutte le altre." },
            { t: "Solo le righe di commento, quelle che iniziano con `#`", ok: false, why: "Senza `-v` sarebbe così." },
            { t: "Il numero delle righe di commento presenti nel file", ok: false, why: "Per contare si usa `-c`." },
            { t: "La versione di grep e le sue opzioni", ok: false, why: "La versione si chiede con `grep --version` (`-V`); `-v` è un'altra cosa." }
        ]
    },
    {
        id: "3.2-06", type: "fill", ref: "3.2_01#Pipe", placeholder: "comando",
        text: "Scrivi un comando che conta quante righe ha il file `nomi.txt`.",
        answers: ["wc -l nomi.txt", "wc --lines nomi.txt", "wc -l < nomi.txt", "cat nomi.txt | wc -l"],
        pattern: "^(wc (-l|--lines) (\\./)?nomi\\.txt|wc (-l|--lines) ?< ?(\\./)?nomi\\.txt|cat (\\./)?nomi\\.txt ?\\| ?wc (-l|--lines)|grep -c ('{2}|\"{2}) nomi\\.txt)$",
        alsoAccepted: ["wc -l <nomi.txt", "cat nomi.txt|wc -l", "grep -c '' nomi.txt"],
        notAccepted: ["wc nomi.txt", "wc -w nomi.txt", "wc -c nomi.txt"],
        why: "`wc -l` conta le righe; `wc` da solo mostra righe, parole e byte."
    },
    {
        id: "3.2-07", type: "multiple", ref: "3.2_01#Pipe",
        text: "Il file `n.txt` contiene i numeri da 1 a 6, uno per riga. Quali comandi stampano solo le ultime tre righe (4, 5 e 6)?",
        options: [
            { t: "`tail -n 3 n.txt`", ok: true, why: "`tail` mostra la fine del file; `-n 3` dice quante righe." },
            { t: "`tail -3 n.txt`", ok: true, why: "È la forma breve, ancora accettata: stesso risultato." },
            { t: "`head -n -3 n.txt`", ok: false, why: "Mostra tutto tranne le ultime tre righe: 1, 2 e 3." },
            { t: "`tail -n +3 n.txt`", ok: false, why: "Con `+` si parte dalla riga 3: stampa 3, 4, 5 e 6." },
            { t: "`head -3 n.txt`", ok: false, why: "Mostra le prime tre righe: 1, 2 e 3." }
        ]
    },
    {
        id: "3.2-08", type: "single", ref: "3.2_01#Pipe",
        text: "Le righe di `/etc/passwd` hanno campi separati da `:`, e il primo è il nome dell'utente. Che cosa stampa `cut -d: -f1 /etc/passwd`?",
        options: [
            { t: "I nomi di tutti gli utenti, uno per riga", ok: true, why: "`-d:` dice che il separatore è `:`, `-f1` sceglie il primo campo." },
            { t: "La prima riga del file, quella di root", ok: false, why: "La prima riga si ottiene con `head -n 1`." },
            { t: "Il primo carattere di ogni riga del file", ok: false, why: "Per i caratteri si userebbe `cut -c1`." },
            { t: "Il file intero senza la prima colonna", ok: false, why: "`-f1` tiene il primo campo, non lo toglie." }
        ]
    },
    {
        id: "3.2-09", type: "single", ref: "3.2_02#Espressioni Regolari",
        text: "Quali righe trova `grep '^root' /etc/passwd`?",
        options: [
            { t: "Le righe che iniziano con «root»", ok: true, why: "In un'espressione regolare `^` indica l'inizio della riga (e `$` la fine)." },
            { t: "Tutte le righe che contengono «root» in qualsiasi punto", ok: false, why: "Così sarebbe senza `^`." },
            { t: "Le righe che non contengono «root»", ok: false, why: "Per escludere serve `-v`." },
            { t: "Le righe che finiscono con «root»", ok: false, why: "Per la fine della riga si usa `root$`." }
        ]
    },
    {
        id: "3.2-10", type: "single", ref: "3.2_02#Espressioni Regolari",
        text: "In un'espressione regolare (per esempio con `grep`), che cosa significa `*`?",
        options: [
            { t: "Zero o più ripetizioni del carattere che viene prima", ok: true, why: "`ab*c` trova «ac», «abc», «abbc»... Attenzione: è diverso da `*` nei nomi dei file della shell." },
            { t: "Qualsiasi sequenza di caratteri, come nei nomi dei file", ok: false, why: "Questo vale per il globbing della shell; nelle espressioni regolari «qualsiasi sequenza» si scrive `.*`." },
            { t: "Esattamente un carattere qualsiasi", ok: false, why: "Un carattere qualsiasi è `.`." },
            { t: "Una moltiplicazione", ok: false, why: "Le espressioni regolari descrivono testo, non fanno calcoli." }
        ]
    },
    {
        id: "3.2-11", type: "single", ref: "3.2_02#Espressioni Regolari",
        text: "Il file contiene le righe «casa», «cosa», «cesa» e «cassa». Quali trova `grep 'c[ao]sa'`?",
        options: [
            { t: "«casa» e «cosa»", ok: true, why: "`[ao]` vale un solo carattere, a oppure o, seguito da «sa»." },
            { t: "«casa», «cosa» e «cassa»", ok: false, why: "In «cassa» dopo la a viene un'altra s, non «sa»: la sequenza c, a/o, s, a non c'è." },
            { t: "Tutte e quattro", ok: false, why: "«cesa» ha una e, che non è tra le parentesi." },
            { t: "Nessuna: le parentesi quadre non si usano con grep", ok: false, why: "Le parentesi quadre sono una parte normale delle espressioni regolari." }
        ]
    },
    {
        id: "3.2-12", type: "multiple", ref: "3.2_02#Espressioni Regolari",
        text: "Il file contiene le parole «color», «colour», «colouur», «colr» e «coulor». Quali righe trova `grep -E 'colou?r'`?",
        options: [
            { t: "color", ok: true, why: "Con `-E` (espressioni regolari estese) `?` rende facoltativo il carattere prima: la u può mancare." },
            { t: "colour", ok: true, why: "La u c'è una volta: va bene." },
            { t: "colouur", ok: false, why: "`?` permette al massimo una u, qui ce ne sono due." },
            { t: "colr", ok: false, why: "Manca la o, che non è facoltativa." },
            { t: "coulor", ok: false, why: "Le lettere sono in un altro ordine." }
        ]
    },
    {
        id: "3.2-13", type: "single", ref: "3.2_01#Combinazioni",
        text: "Che cosa vuol dire `2>&1` in `comando > tutto.log 2>&1`?",
        options: [
            { t: "Manda anche gli errori (2) dove va l'output (1), nel file", ok: true, why: "Così in `tutto.log` finiscono sia i risultati sia i messaggi di errore." },
            { t: "Esegue il comando due volte e unisce i due risultati nel file", ok: false, why: "I numeri indicano i canali di output, non le ripetizioni." },
            { t: "Manda l'output normale nel canale degli errori, sullo schermo", ok: false, why: "Sarebbe `1>&2` (o `>&2`)." },
            { t: "Scrive gli errori in un altro file, che si chiama proprio `1`", ok: false, why: "La `&` dice che 1 è un canale, non un file." }
        ]
    },
    {
        id: "3.2-14", type: "single", ref: "3.2_01#Pipe",
        text: "Il file contiene le righe 10, 9 e 100. Che cosa stampa `sort -n`?",
        options: [
            { t: "9, 10, 100", ok: true, why: "`-n` ordina per valore numerico." },
            { t: "10, 100, 9", ok: false, why: "È l'ordine di `sort` senza `-n`, che confronta i caratteri uno per uno come in un dizionario." },
            { t: "100, 10, 9", ok: false, why: "Sarebbe l'ordine decrescente, con `sort -nr`." },
            { t: "10, 9, 100, cioè l'ordine originale", ok: false, why: "`sort` cambia sempre l'ordine secondo il criterio scelto." }
        ]
    },
    {
        id: "3.2-15", type: "single", ref: "3.2_01#Redirigere lo Standard Output",
        text: "A che cosa serve `less`?",
        options: [
            { t: "A leggere un testo lungo una pagina per volta", ok: true, why: "Si usa con un file (`less /var/log/syslog`) o alla fine di una pipe." },
            { t: "A ridurre la dimensione di un file, comprimendolo come gzip", ok: false, why: "Per ridurre la dimensione si comprime con `gzip`, `bzip2` o `xz`." },
            { t: "A modificare un file di testo direttamente nel terminale", ok: false, why: "`less` mostra soltanto; per modificare servono editor come `nano` o `vi`." },
            { t: "A contare le righe e le parole di un file, come `wc`", ok: false, why: "Per contare si usa `wc -l`." }
        ]
    },
    {
        id: "3.2-16", type: "single", ref: "3.2_02#Espressioni Regolari",
        text: "Perché `grep 'a*' parole.txt` mostra tutte le righe del file, anche quelle senza la lettera a?",
        options: [
            { t: "Perché `a*` vuol dire «zero o più a», e ogni riga ne ha almeno zero", ok: true, why: "Per trovare le righe con almeno una a basta `grep 'a'` (oppure `aa*`)." },
            { t: "Perché la shell sostituisce `a*` con i nomi dei file", ok: false, why: "Il modello è tra virgolette singole: la shell non lo tocca e arriva intero a `grep`." },
            { t: "Perché in grep `*` da solo significa «qualsiasi riga del file»", ok: false, why: "`*` ripete il carattere che lo precede; da solo non vuol dire «qualsiasi riga»." },
            { t: "È un errore di grep, che ignora i modelli troppo corti", ok: false, why: "È il comportamento corretto delle espressioni regolari." }
        ]
    },
    {
        id: "3.2-17", type: "single", ref: "3.2_01#Pipe",
        text: "Il file `note.txt` ha 12 righe. Che cosa stampa `wc -l note.txt`?",
        options: [
            { t: "`12 note.txt`", ok: true, why: "`wc -l` conta le righe (lines) e scrive il numero seguito dal nome del file. Con `wc -l < note.txt` scrive solo il numero." },
            { t: "Le prime 12 righe di `note.txt`", ok: false, why: "Questo lo farebbe `head -n 12 note.txt`: `wc` conta, non mostra il contenuto." },
            { t: "`12`, e sotto le righe numerate", ok: false, why: "`wc` non mostra mai il contenuto; per numerare le righe c'è `cat -n` (o `nl`)." },
            { t: "Il numero di parole del file", ok: false, why: "Le parole si contano con `wc -w`; `-l` conta le righe." }
        ]
    },
    {
        id: "3.2-18", type: "fill", ref: "3.2_01#Pipe", placeholder: "comando",
        text: "Scrivi il comando che mostra solo le prime 5 righe del file `registro.log`.",
        answers: ["head -n 5 registro.log", "head -5 registro.log", "head -n5 registro.log"],
        pattern: "^head (-n ?5|-5|--lines=5) (\\./)?registro\\.log$",
        alsoAccepted: ["head --lines=5 registro.log", "head -n 5 ./registro.log"],
        notAccepted: ["tail -n 5 registro.log", "head registro.log", "head -n 5"],
        why: "`head` mostra l'inizio di un file: senza opzioni le prime 10 righe, con `-n 5` (o `-5`) le prime 5. Il suo contrario è `tail`, che mostra la fine."
    },
    {
        id: "3.2-19", type: "single", ref: "3.2_01#Pipe",
        text: "Che cosa fa `tail -f /var/log/syslog`?",
        options: [
            { t: "Mostra la fine del file e resta aperto, aggiungendo le righe nuove", ok: true, why: "`-f` (follow) segue il file: ogni riga che il sistema aggiunge compare subito. Si esce con Ctrl+C. È il modo classico di guardare un registro mentre succede qualcosa." },
            { t: "Mostra le ultime righe e poi cancella il file per liberare spazio", ok: false, why: "`tail` legge soltanto: non cancella e non modifica mai il file." },
            { t: "Mostra il file dall'ultima riga alla prima", ok: false, why: "Per rovesciare l'ordine delle righe c'è `tac` (`cat` al contrario)." },
            { t: "Forza la scrittura nel registro dei messaggi ancora in memoria", ok: false, why: "La `f` non sta per «force»: sta per «follow», seguire il file." }
        ]
    },
    {
        id: "3.2-20", type: "single", ref: "3.2_01#Pipe",
        text: "Il file `numeri.txt` contiene, uno per riga, 10, 9 e 100. Che cosa stampa `sort -n numeri.txt`?",
        options: [
            { t: "9, 10, 100", ok: true, why: "`-n` ordina per valore numerico. Senza `-n`, `sort` confronta il testo carattere per carattere e mette 10 e 100 prima di 9." },
            { t: "10, 100, 9", ok: false, why: "Questo è l'ordine alfabetico, quello di `sort` senza `-n`: il carattere 1 viene prima del 9." },
            { t: "100, 10, 9", ok: false, why: "Dal più grande al più piccolo servirebbe anche `-r`: `sort -nr numeri.txt`." },
            { t: "10, 9, 100", ok: false, why: "È l'ordine del file: `sort` invece riordina sempre le righe." }
        ]
    },
    {
        id: "3.2-21", type: "single", ref: "3.2_01#Pipe",
        text: "Il file `spesa.txt` contiene, uno per riga: pane, latte, pane. Che cosa stampa `uniq spesa.txt`?",
        options: [
            { t: "Tutte e tre le righe: pane, latte, pane", ok: true, why: "`uniq` toglie solo i doppioni **uno sotto l'altro**. Qui i due «pane» sono separati da «latte», quindi restano. Per togliere tutti i doppioni si ordina prima: `sort spesa.txt | uniq`." },
            { t: "Due righe: pane e latte", ok: false, why: "Succederebbe con `sort spesa.txt | uniq` (che però stamperebbe latte e pane, in ordine) o con `sort -u`." },
            { t: "Solo latte, la riga che compare una volta", ok: false, why: "Le righe che compaiono una volta sola si ottengono con `uniq -u`, e sempre su un file ordinato." },
            { t: "Un errore, perché il file non è ordinato", ok: false, why: "`uniq` non controlla l'ordine: lavora comunque, confrontando ogni riga con quella precedente." }
        ]
    },
    {
        id: "3.2-22", type: "multiple", ref: "3.2_01#Pipe",
        text: "Quali comandi mostrano soltanto l'ultima riga del file `elenco.txt`?",
        options: [
            { t: "`tail -n 1 elenco.txt`", ok: true, why: "`tail` mostra la fine del file; `-n 1` ne prende una riga sola." },
            { t: "`cat elenco.txt | tail -1`", ok: true, why: "`tail` legge dalla pipe come da un file; `-1` è la forma breve di `-n 1`." },
            { t: "`head -n 1 elenco.txt`", ok: false, why: "`head` mostra l'inizio: questa è la prima riga, non l'ultima." },
            { t: "`wc -l elenco.txt`", ok: false, why: "`wc -l` conta le righe, non le mostra." },
            { t: "`tail elenco.txt`", ok: false, why: "Senza opzioni `tail` mostra le ultime 10 righe." }
        ]
    },
    {
        id: "3.2-23", type: "single", ref: "3.2_01#Pipe",
        text: "Che cosa stampa `sort -r nomi.txt`?",
        options: [
            { t: "Le righe in ordine alfabetico inverso, dalla Z alla A", ok: true, why: "`-r` (reverse) rovescia l'ordine di `sort`. Si combina con le altre opzioni: `sort -rn` ordina i numeri dal più grande." },
            { t: "Le righe di `nomi.txt` dall'ultima alla prima, senza ordinarle", ok: false, why: "Rovesciare il file senza ordinarlo è il lavoro di `tac`." },
            { t: "Le righe ordinate, e il file viene riscritto ordinato", ok: false, why: "`sort` scrive sullo schermo e non modifica il file; per salvarlo si usa `-o` o un reindirizzamento verso un file diverso." },
            { t: "Ogni riga scritta al contrario, lettera per lettera", ok: false, why: "Rovesciare le lettere di ogni riga è il lavoro di `rev`." }
        ]
    },
    {
        id: "3.2-24", type: "fill", ref: "3.2_01#Pipe", placeholder: "comando",
        text: "Scrivi un comando che conta le righe del file `/etc/passwd`, cioè quanti utenti ci sono.",
        answers: ["wc -l /etc/passwd", "wc -l < /etc/passwd", "cat /etc/passwd | wc -l"],
        pattern: "^(wc (-l|--lines) (< ?)?/etc/passwd|cat /etc/passwd \\| ?wc (-l|--lines)|wc (-l|--lines) ?< ?/etc/passwd)$",
        alsoAccepted: ["wc --lines /etc/passwd", "wc -l </etc/passwd", "cat /etc/passwd |wc -l"],
        notAccepted: ["wc -w /etc/passwd", "wc /etc/passwd -c", "grep -c /etc/passwd"],
        why: "`wc -l` conta le righe; ogni utente in `/etc/passwd` occupa una riga. `wc -l /etc/passwd` scrive anche il nome del file, `wc -l < /etc/passwd` solo il numero."
    },
    {
        id: "3.2-25", type: "single", ref: "3.2_01#Pipe",
        text: "Che cosa ottieni con `sort voti.txt | uniq -c`?",
        options: [
            { t: "Ogni voto una volta, con davanti quante volte compare", ok: true, why: "`sort` mette vicini i doppioni, `uniq` li riduce a una riga e `-c` (count) scrive davanti quante erano. È il modo classico per contare le ripetizioni." },
            { t: "Il numero dei voti diversi, scritto in un'unica riga", ok: false, why: "Per contare le righe diverse si aggiunge `wc -l`: `sort voti.txt | uniq | wc -l`." },
            { t: "Solo i voti che compaiono più di una volta, senza numeri", ok: false, why: "Questo lo farebbe `uniq -d`." },
            { t: "Il file ordinato, con le righe numerate da 1", ok: false, why: "La `c` di `uniq` sta per «count»: conta le ripetizioni, non numera le righe (che fa `cat -n`)." }
        ]
    },
    {
        id: "3.2-26", type: "single", ref: "3.2_01#Pipe",
        text: "Che cosa conta `wc -w lettera.txt`?",
        options: [
            { t: "Le parole del file", ok: true, why: "`-w` (words) conta le parole, cioè i gruppi di caratteri separati da spazi o a capo. `-l` conta le righe, `-c` i byte; senza opzioni `wc` li mostra tutti e tre." },
            { t: "Le righe vuote del file", ok: false, why: "`wc` non distingue le righe vuote; le conta insieme alle altre con `-l`." },
            { t: "Le pagine, se il file si stampasse", ok: false, why: "`wc` non conosce le pagine: conta righe, parole e byte." },
            { t: "Le volte che compare la lettera w", ok: false, why: "Per contare le righe con un certo testo si usa `grep -c`; la `w` di `wc -w` sta per «words»." }
        ]
    },
    {
        id: "3.2-27", type: "single", ref: "3.2_01#Pipe",
        text: "Il file `clienti.csv` ha righe come `Rossi,Milano,02 1234567`. Che cosa stampa `cut -d, -f2 clienti.csv`?",
        options: [
            { t: "La città di ogni riga: Milano, ...", ok: true, why: "`-d,` dice che i campi sono separati dalla virgola, `-f2` prende il secondo campo. Con `-f1,3` si prenderebbero il primo e il terzo." },
            { t: "Le prime due righe del file intero", ok: false, why: "Le prime righe si prendono con `head -n 2`: `cut` lavora sulle colonne, non sulle righe." },
            { t: "I primi due caratteri di ogni riga", ok: false, why: "I caratteri si scelgono con `cut -c`, per esempio `cut -c1-2`." },
            { t: "Il file senza il secondo campo di ogni riga", ok: false, why: "`-f2` sceglie il campo da tenere, non quello da togliere." }
        ]
    },

    // ---- 3.3 Trasformare i Comandi in uno Script ----
    {
        id: "3.3-01", type: "fill", ref: "3.3_01#Definire un Interprete", placeholder: "prima riga",
        text: "Scrivi la prima riga di uno script che deve essere eseguito da Bash, che si trova in `/bin/bash`.",
        answers: ["#!/bin/bash", "#! /bin/bash", "#!/usr/bin/env bash"],
        why: "`#!` (shebang) all'inizio della prima riga dice al sistema quale programma deve leggere lo script."
    },
    {
        id: "3.3-02", type: "single", ref: "3.3_01#Permessi di Esecuzione",
        text: "Hai scritto `backup.sh`. Quale comando lo rende eseguibile?",
        options: [
            { t: "`chmod +x backup.sh`", ok: true, why: "Aggiunge il permesso di esecuzione; poi si avvia con `./backup.sh`." },
            { t: "`run backup.sh`", ok: false, why: "Non esiste un comando `run`." },
            { t: "`export backup.sh`", ok: false, why: "`export` riguarda le variabili." },
            { t: "`chown +x backup.sh`", ok: false, why: "`chown` cambia il proprietario; i permessi si cambiano con `chmod`." }
        ]
    },
    {
        id: "3.3-03", type: "single", ref: "3.3_01#Comandi e PATH",
        text: "Lo script eseguibile `ciao.sh` è nella directory corrente, che non è nel `PATH`. Come lo avvii?",
        options: [
            { t: "`./ciao.sh`", ok: true, why: "`./` indica il percorso: «il file ciao.sh in questa directory». Senza percorso la shell lo cerca solo nelle directory del `PATH`." },
            { t: "`ciao.sh`", ok: false, why: "La shell lo cerca solo nel `PATH` e risponde «command not found»." },
            { t: "`run ciao.sh`", ok: false, why: "Non esiste un comando `run`." },
            { t: "`cd ciao.sh`", ok: false, why: "`cd` entra nelle directory; uno script è un file." }
        ]
    },
    {
        id: "3.3-04", type: "single", ref: "3.3_01#Argomenti",
        text: "Avvii `./saluta.sh Anna Luca`. Quanto vale `$1` dentro lo script?",
        options: [
            { t: "`Anna`", ok: true, why: "`$1` è il primo argomento, `$2` il secondo (`Luca`)." },
            { t: "`./saluta.sh`", ok: false, why: "Il nome dello script è in `$0`." },
            { t: "`Anna Luca`", ok: false, why: "Tutti gli argomenti insieme sono in `$@`." },
            { t: "`2`", ok: false, why: "Il numero degli argomenti è in `$#`." }
        ]
    },
    {
        id: "3.3-05", type: "single", ref: "3.3_01#Restituire il Numero di Argomenti",
        text: "Avvii `./conta.sh uno due tre`. Che cosa stampa `echo $#` dentro lo script?",
        options: [
            { t: "`3`", ok: true, why: "`$#` contiene quanti argomenti ha ricevuto lo script." },
            { t: "`uno due tre`", ok: false, why: "Questi sono gli argomenti, in `$@`." },
            { t: "`./conta.sh`", ok: false, why: "Il nome dello script è in `$0`." },
            { t: "Niente: `$#` è un commento", ok: false, why: "Il commento inizia con `#` a inizio parola; `$#` è una variabile speciale." }
        ]
    },
    {
        id: "3.3-06", type: "multiple", ref: "3.3_02#Gestire più Argomenti",
        text: "Lo script `prova.sh` contiene `echo \"$0 $# $1 $@\"`. Che cosa vale ogni variabile se lo avvii con `bash prova.sh uno due tre`?",
        options: [
            { t: "`$0` vale `prova.sh`", ok: true, why: "`$0` è il nome con cui è stato avviato lo script." },
            { t: "`$@` vale `uno due tre`", ok: true, why: "`$@` contiene tutti gli argomenti." },
            { t: "`$#` vale `4`", ok: false, why: "`$#` conta solo gli argomenti, non il nome dello script: vale 3." },
            { t: "`$1` vale `prova.sh`", ok: false, why: "`$1` è il primo argomento: `uno`." },
            { t: "`$0` vale `bash`", ok: false, why: "Con `bash prova.sh` il nome in `$0` è quello dello script." }
        ]
    },
    {
        id: "3.3-07", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Che cosa contiene la variabile `$?` subito dopo un comando?",
        options: [
            { t: "Il codice di uscita: 0 se è andato bene, un altro numero se no", ok: true, why: "Per esempio dopo `ls /nonesiste` vale 2; dopo `true` vale 0." },
            { t: "Il numero di argomenti ricevuti dall'ultimo comando eseguito", ok: false, why: "Il numero di argomenti di uno script è in `$#`." },
            { t: "Il testo dell'ultimo messaggio di errore scritto sullo schermo", ok: false, why: "`$?` contiene solo un numero." },
            { t: "Il numero del processo (PID) dell'ultimo comando avviato", ok: false, why: "Il numero del processo della shell è in `$$`." }
        ]
    },
    {
        id: "3.3-08", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Per convenzione, che cosa significa il codice di uscita 0?",
        options: [
            { t: "Che il comando è terminato con successo", ok: true, why: "Qualsiasi valore diverso da 0 (da 1 a 255) indica un errore o una condizione particolare." },
            { t: "Che il comando è finito con un errore grave", ok: false, why: "È il contrario: 0 vuol dire tutto bene." },
            { t: "Che il comando non ha prodotto output", ok: false, why: "Il codice di uscita non dice niente su quanto output c'è stato." },
            { t: "Che il comando è ancora in esecuzione", ok: false, why: "Il codice di uscita esiste solo quando il comando è finito." }
        ]
    },
    {
        id: "3.3-09", type: "single", ref: "3.3_02#Cicli For",
        text: "Che cosa stampa questo ciclo?",
        code: 'for n in 1 2 3; do\n    echo "numero $n"\ndone',
        options: [
            { t: "Tre righe: «numero 1», «numero 2», «numero 3»", ok: true, why: "Il ciclo ripete `echo` una volta per ogni valore dell'elenco; a ogni giro `n` prende il valore successivo." },
            { t: "Una riga sola: «numero 1 2 3»", ok: false, why: "`echo` viene eseguito una volta per ogni valore, non una volta sola." },
            { t: "Tre righe uguali: «numero $n», «numero $n», «numero $n»", ok: false, why: "Tra virgolette doppie `$n` viene sostituito dal suo valore." },
            { t: "Una riga: «numero 3», cioè solo l'ultimo valore", ok: false, why: "Il corpo del ciclo viene eseguito a ogni giro." }
        ]
    },
    {
        id: "3.3-10", type: "multiple", ref: "3.3_01#Editor di Testo Comuni",
        text: "Quali sono editor di testo che funzionano nel terminale, utili per scrivere script?",
        options: [
            { t: "`vi` (o `vim`)", ok: true, why: "È presente su quasi ogni sistema Unix e Linux; ha modalità diverse per scrivere e per dare comandi." },
            { t: "`nano`", ok: true, why: "È semplice: i comandi principali sono scritti in basso sullo schermo." },
            { t: "`less`", ok: false, why: "`less` mostra i file ma non li modifica." },
            { t: "GIMP", ok: false, why: "GIMP è un programma grafico per le immagini." },
            { t: "`cat`", ok: false, why: "`cat` stampa il contenuto dei file; non si possono modificare." }
        ]
    },
    {
        id: "3.3-11", type: "single", ref: "3.3_01#Editor di Testo Comuni",
        text: "In `vi`, dopo aver premuto Esc, che cosa scrivi per salvare il file e uscire?",
        options: [
            { t: "`:wq`", ok: true, why: "`w` salva (write), `q` esce (quit). `:q!` esce senza salvare." },
            { t: "`:q!`", ok: false, why: "Esce scartando le modifiche." },
            { t: "Ctrl+X", ok: false, why: "È il tasto per uscire da `nano`, non da `vi`." },
            { t: "`exit`", ok: false, why: "`exit` chiude la shell; in `vi` si usano i comandi con `:`." }
        ]
    },
    {
        id: "3.3-12", type: "single", ref: "3.3_01#Editor di Testo Comuni",
        text: "In `nano`, quali tasti salvano il file e quali escono?",
        options: [
            { t: "Ctrl+O salva, Ctrl+X esce", ok: true, why: "In basso nella finestra di `nano` ci sono i comandi principali: `^O` e `^X` vogliono dire Ctrl+O e Ctrl+X." },
            { t: "`:w` salva, `:q` esce", ok: false, why: "Sono i comandi di `vi`." },
            { t: "Ctrl+S salva, Ctrl+Q esce", ok: false, why: "Sono le combinazioni di molti programmi grafici; in `nano` si usano Ctrl+O e Ctrl+X (le versioni recenti accettano anche Ctrl+S)." },
            { t: "Esc salva, Invio esce", ok: false, why: "Non sono i comandi di `nano`." }
        ]
    },
    {
        id: "3.3-13", type: "single", ref: "3.3_01#Logica Condizionale",
        text: "Che cosa fa questo pezzo di script?",
        code: 'if [ $# -ne 1 ]; then\n    echo "Serve un argomento"\n    exit 1\nfi',
        options: [
            { t: "Se non c'è esattamente un argomento, avvisa ed esce con codice 1", ok: true, why: "`$#` è il numero di argomenti, `-ne` vuol dire «diverso da». Il codice 1 segnala l'errore a chi ha avviato lo script." },
            { t: "Se lo script ha un argomento, scrive il messaggio ed esce", ok: false, why: "Termina quando il numero è diverso da 1." },
            { t: "Ripete il messaggio finché l'utente non scrive un argomento", ok: false, why: "`if` decide una volta sola; per ripetere servono i cicli." },
            { t: "Controlla se nella directory esiste un file chiamato `1`", ok: false, why: "Il test confronta numeri (`$#` con 1), non controlla file." }
        ]
    },
    {
        id: "3.3-14", type: "fill", ref: "3.3_01#Variabili", placeholder: "output",
        text: "Che cosa stampa questo script? Scrivi la riga esatta.",
        code: '#!/bin/bash\nNOME=Anna\necho "Ciao, $NOME"',
        answers: ["Ciao, Anna"],
        why: "La variabile `NOME` vale `Anna`; tra virgolette doppie `$NOME` viene sostituita, e la virgola resta com'è."
    },
    {
        id: "3.3-15", type: "single", ref: "3.3_01#Permessi di Esecuzione",
        text: "Lo script `pulizia.sh` non ha il permesso di esecuzione. Come puoi comunque avviarlo?",
        options: [
            { t: "Con `bash pulizia.sh`", ok: true, why: "Così il programma eseguito è `bash`, che legge il file come testo: basta il permesso di lettura." },
            { t: "Con `./pulizia.sh`", ok: false, why: "Senza permesso di esecuzione la shell risponde «Permission denied»." },
            { t: "Non si può in nessun modo", ok: false, why: "Si può, passando il file a `bash`." },
            { t: "Con `cat pulizia.sh`", ok: false, why: "`cat` mostra il testo dello script, non lo esegue." }
        ]
    },
    {
        id: "3.3-16", type: "fill", ref: "3.3_02#Codici di Uscita", placeholder: "comando",
        text: "Quale comando, dentro uno script, lo termina subito con il codice di uscita 2?",
        answers: ["exit 2"],
        why: "`exit` seguito da un numero termina lo script con quel codice; chi l'ha avviato lo trova in `$?`."
    },
    {
        id: "3.3-17", type: "single", ref: "3.3_01#Uso delle Virgolette con le Variabili",
        text: "La variabile `FILE` vale `le mie foto.txt`. Perché è meglio scrivere `rm \"$FILE\"` invece di `rm $FILE`?",
        options: [
            { t: "Senza virgolette `rm` riceve tre nomi: `le`, `mie` e `foto.txt`", ok: true, why: "Le virgolette doppie tengono insieme il valore come un solo argomento, spazi compresi." },
            { t: "Perché senza virgolette la variabile non viene sostituita dal valore", ok: false, why: "Viene sostituita in tutti e due i casi; cambia come il valore viene diviso in parole." },
            { t: "Perché `rm` accetta solo nomi di file scritti tra virgolette", ok: false, why: "`rm` non vede mai le virgolette: le usa la shell." },
            { t: "Non c'è differenza: le virgolette servono solo a leggere meglio", ok: false, why: "C'è: con i nomi che contengono spazi il comando senza virgolette lavora sui file sbagliati." }
        ]
    },
    {
        id: "3.3-18", type: "single", ref: "3.3_02#Cicli For",
        text: "Nella directory ci sono `a.txt` e `b.txt`. Che cosa vale `f` durante il ciclo?",
        code: 'for f in *.txt; do\n    echo "Trovato: $f"\ndone',
        options: [
            { t: "Prima `a.txt`, poi `b.txt`", ok: true, why: "La shell sostituisce `*.txt` con i nomi dei file prima di cominciare; il ciclo gira una volta per nome, e `f` prende un nome alla volta." },
            { t: "Sempre la stringa `*.txt`, a ogni giro", ok: false, why: "Senza virgolette `*.txt` viene espanso nei nomi dei file. Resterebbe `*.txt` solo se non ci fosse nessun file `.txt`." },
            { t: "Il contenuto di `a.txt`, una riga per giro", ok: false, why: "Il ciclo scorre i nomi dei file, non il loro contenuto." },
            { t: "Il numero dei file trovati, cioè 2", ok: false, why: "Per contarli servirebbe altro, per esempio `ls *.txt | wc -l`." }
        ]
    },
    {
        id: "3.3-19", type: "fill", ref: "3.3_02#Cicli For", placeholder: "parola",
        text: "Completa il ciclo: `for nome in anna luca sara; ______ echo \"Ciao $nome\"; done`",
        answers: ["do"],
        why: "Un ciclo `for` ha tre parole fisse: `for VARIABILE in ELENCO`, poi `do` prima dei comandi da ripetere, e `done` alla fine. Su una sola riga si separano con `;`."
    },
    {
        id: "3.3-20", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Che cosa stampa `ls /nonesiste; echo $?`, dopo il messaggio di errore di `ls`?",
        options: [
            { t: "Un numero diverso da 0", ok: true, why: "`$?` vale il codice con cui è uscito il comando appena finito: `ls` non ha trovato la directory ed è uscito con un errore (con GNU `ls` il codice è 2)." },
            { t: "0, perché `echo` funziona sempre", ok: false, why: "`$?` si legge prima che `echo` finisca: vale per il comando precedente, cioè `ls`." },
            { t: "Niente: dopo un errore la riga si ferma", ok: false, why: "Con `;` il secondo comando parte comunque, anche se il primo fallisce. Si fermerebbe con `&&`." },
            { t: "Il testo del messaggio di errore", ok: false, why: "`$?` contiene solo un numero, da 0 a 255; il messaggio va sullo standard error." }
        ]
    },
    {
        id: "3.3-21", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "La directory `/archivio` non esiste. Che cosa succede con `cd /archivio && rm -r vecchi`?",
        options: [
            { t: "`cd` fallisce e `rm` non parte", ok: true, why: "`&&` esegue il secondo comando solo se il primo è uscito con 0. È una protezione importante: senza, `rm -r vecchi` cancellerebbe `vecchi` nella directory sbagliata." },
            { t: "`cd` fallisce, ma `rm` cancella `vecchi` dove ti trovi adesso", ok: false, why: "Succederebbe con `;` al posto di `&&`: per questo, prima di comandi pericolosi, si usa `&&`." },
            { t: "Prima viene creata `/archivio`, poi `rm` cancella", ok: false, why: "`cd` non crea directory: per crearle c'è `mkdir`." },
            { t: "I due comandi partono insieme, in parallelo", ok: false, why: "`&&` non avvia niente in parallelo: aspetta la fine del primo e ne guarda il codice di uscita." }
        ]
    },
    {
        id: "3.3-22", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Che cosa stampa `grep -q anna /etc/passwd || echo \"anna non c'è\"`, se anna è un utente del sistema?",
        options: [
            { t: "Niente", ok: true, why: "`grep -q` non scrive niente ed esce con 0 se trova il testo. `||` esegue il secondo comando solo se il primo fallisce: qui `grep` riesce, quindi `echo` non parte." },
            { t: "anna non c'è", ok: false, why: "Il messaggio comparirebbe solo se `grep` non trovasse anna: `||` vuol dire «altrimenti»." },
            { t: "La riga di anna in `/etc/passwd`", ok: false, why: "`-q` (quiet) zittisce `grep`: conta solo il codice di uscita." },
            { t: "La riga di anna, poi anna non c'è", ok: false, why: "Con `-q` `grep` non scrive, e con `||` il secondo comando parte solo se il primo fallisce." }
        ]
    },
    {
        id: "3.3-23", type: "multiple", ref: "3.3_02#Codici di Uscita",
        text: "Quali di questi comandi escono con il codice 0 (successo)?",
        options: [
            { t: "`true`", ok: true, why: "`true` non fa niente ed esce sempre con 0." },
            { t: "`test 5 -gt 3`", ok: true, why: "5 è maggiore di 3: la condizione è vera e `test` esce con 0." },
            { t: "`false`", ok: false, why: "`false` esce sempre con 1." },
            { t: "`ls /nonesiste`", ok: false, why: "La directory non esiste: `ls` dà errore ed esce con un codice diverso da 0." },
            { t: "`test 2 -eq 3`", ok: false, why: "2 non è uguale a 3: la condizione è falsa e `test` esce con 1." }
        ]
    },
    {
        id: "3.3-24", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Lo script `controlla.sh` finisce con la riga `exit 3`. Che cosa stampa `./controlla.sh; echo $?`, dopo l'output dello script?",
        options: [
            { t: "3", ok: true, why: "`exit` chiude lo script e sceglie il suo codice di uscita; chi lo ha lanciato lo trova in `$?`." },
            { t: "0", ok: false, why: "0 è il codice di successo: lo script l'avrebbe restituito con `exit 0`, o senza `exit` se l'ultimo comando riesce." },
            { t: "exit 3", ok: false, why: "`$?` contiene il numero, non il testo del comando." },
            { t: "1", ok: false, why: "Lo script ha scelto esplicitamente il codice 3." }
        ]
    },
    {
        id: "3.3-25", type: "fill", ref: "3.3_02#Codici di Uscita", placeholder: "variabile",
        text: "Completa il comando per vedere con quale codice è uscito il comando precedente: `echo ______`",
        answers: ["$?"],
        pattern: "^(\\$\\?|\"\\$\\?\"|\\$\\{\\?\\})$",
        alsoAccepted: ["\"$?\"", "${?}"],
        notAccepted: ["$#", "$0", "?"],
        why: "`$?` vale 0 se l'ultimo comando è andato bene e un altro numero se c'è stato un errore. Va letta subito: il comando successivo la sostituisce con il suo codice."
    },
    {
        id: "3.3-26", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Che differenza c'è tra `mkdir prova; cd prova` e `mkdir prova && cd prova`?",
        options: [
            { t: "Con `&&`, se `mkdir` fallisce, `cd` non parte", ok: true, why: "`;` separa due comandi indipendenti; `&&` collega il secondo al successo del primo. Se `prova` esiste già, `mkdir` fallisce: con `&&` ci si ferma lì." },
            { t: "Nessuna: sono due modi di scrivere la stessa cosa", ok: false, why: "La differenza c'è quando il primo comando fallisce: `;` va avanti comunque, `&&` no." },
            { t: "Con `;` i comandi partono insieme, con `&&` uno dopo l'altro", ok: false, why: "Anche con `;` i comandi partono uno dopo l'altro: è `&` che manda un comando in background." },
            { t: "Con `&&` la directory nasce già con i permessi giusti", ok: false, why: "`&&` non cambia quello che fanno i comandi: decide solo se il secondo parte." }
        ]
    },
    {
        id: "3.3-27", type: "single", ref: "3.3_02#Cicli For",
        text: "Che cosa stampa `for x in rosso verde blu; do echo $x; done | wc -l`?",
        options: [
            { t: "3", ok: true, why: "Il ciclo esegue `echo` tre volte, una riga per colore; tutto l'output del ciclo passa nella pipe e `wc -l` conta 3 righe." },
            { t: "1", ok: false, why: "Ogni giro del ciclo scrive una riga a sé: le righe sono tre." },
            { t: "rosso verde blu", ok: false, why: "I colori vanno nella pipe, non sullo schermo: arriva solo il conteggio di `wc -l`." },
            { t: "13", ok: false, why: "13 sono le lettere dei tre colori messe insieme; `wc -l` conta le righe, non i caratteri." }
        ]
    },
    {
        id: "3.3-28", type: "multiple", ref: "3.3_01#Rendere uno Script Eseguibile",
        text: "Lo script `saluta.sh` è nella directory corrente (che non è nel `PATH`) e ha i permessi `rwxr-xr-x`. Quali comandi lo eseguono?",
        options: [
            { t: "`./saluta.sh`", ok: true, why: "Con il percorso, la shell non deve cercarlo nel `PATH`; il permesso di esecuzione c'è." },
            { t: "`bash saluta.sh`", ok: true, why: "Così è Bash che legge il file: funzionerebbe anche senza il permesso di esecuzione." },
            { t: "`saluta.sh`", ok: false, why: "Senza percorso la shell cerca solo nel `PATH`, dove lo script non c'è: «command not found»." },
            { t: "`run saluta.sh`", ok: false, why: "Non c'è un comando `run` per avviare gli script." }
        ]
    },
    {
        id: "3.3-29", type: "single", ref: "3.3_01#Logica Condizionale",
        text: "Che cosa stampa questo comando? (`/etc` è una directory.)",
        code: "if [ -f /etc ]; then echo file; else echo altro; fi",
        options: [
            { t: "`altro`", ok: true, why: "`-f` è vero solo per un file normale: `/etc` esiste, ma è una directory. Per le directory c'è `-d`, per «esiste, di qualsiasi tipo» `-e`." },
            { t: "`file`", ok: false, why: "`-f` controlla che sia un file normale, e `/etc` non lo è." },
            { t: "Niente, perché la condizione è falsa", ok: false, why: "Quando la condizione è falsa si esegue il ramo `else`." },
            { t: "Un errore: `[` non è un comando", ok: false, why: "`[` è proprio un comando, lo stesso di `test`: per questo vuole gli spazi attorno." }
        ]
    },
    {
        id: "3.3-30", type: "fill", ref: "3.3_01#Logica Condizionale", placeholder: "opzione",
        text: "Completa la condizione che è vera se `dati.txt` esiste ed è un file normale: `if [ ___ dati.txt ]; then`",
        answers: ["-f"],
        why: "`-f` controlla che sia un file normale; `-d` che sia una directory; `-e` che esista, di qualsiasi tipo."
    }
]);
