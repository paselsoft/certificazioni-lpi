// Domande dell'argomento 3: Il Potere della Command Line.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// I risultati dei comandi sono stati provati in Bash. Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 3.1 Archiviazione dei File sulla Command Line ----
    {
        id: "3.1-01", type: "fill", ref: "3.1_01#Strumenti di Archiviazione", placeholder: "comando",
        text: "Scrivi il comando `tar` che crea l'archivio compresso con gzip `backup.tar.gz` con dentro la directory `documenti`.",
        answers: ["tar -czf backup.tar.gz documenti", "tar czf backup.tar.gz documenti", "tar -cvzf backup.tar.gz documenti", "tar -zcf backup.tar.gz documenti"],
        pattern: "^(sudo )?tar -?(?=[cvz]*c)(?=[cvz]*z)[cvz]{2,3}f backup\\.tar\\.gz documenti/?$",
        notAccepted: ["tar -xzf backup.tar.gz documenti", "tar -cf backup.tar.gz documenti", "tar -czf documenti backup.tar.gz"],
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
            { t: "Solo `relazione.txt.gz`: l'originale viene sostituito dalla versione compressa", ok: true, why: "`gzip` comprime e toglie l'originale; con `gzip -k` lo tiene. `gunzip` fa il contrario." },
            { t: "`relazione.txt` e `relazione.txt.gz`", ok: false, why: "Succede solo con l'opzione `-k` (keep)." },
            { t: "`relazione.zip`", ok: false, why: "Il formato zip è un altro, con i comandi `zip` e `unzip`." },
            { t: "`relazione.tar`", ok: false, why: "`gzip` comprime un singolo file, non crea archivi tar." }
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
            { t: "gzip è il più veloce, xz di solito comprime di più ma è più lento, bzip2 sta nel mezzo", ok: true, why: "Più si comprime, più tempo serve: si sceglie secondo cosa conta di più." },
            { t: "Comprimono tutti allo stesso modo, cambia solo l'estensione", ok: false, why: "Usano metodi diversi, con risultati e velocità diversi." },
            { t: "gzip comprime di più, xz è il più veloce", ok: false, why: "Di solito è il contrario." },
            { t: "Solo xz funziona con tar", ok: false, why: "tar li usa tutti: `z` per gzip, `j` per bzip2, `J` per xz." }
        ]
    },
    {
        id: "3.1-07", type: "single", ref: "3.1_01#Strumenti di Archiviazione",
        text: "Che cosa fa `tar -cf archivio.tar foto/`, senza altre opzioni?",
        options: [
            { t: "Mette la directory e i suoi file in un unico archivio, senza comprimerlo", ok: true, why: "tar raccoglie i file in uno solo; per comprimere servono `z`, `j` o `J` (oppure un compressore dopo)." },
            { t: "Crea un archivio compresso con gzip", ok: false, why: "Senza `z` non c'è compressione." },
            { t: "Copia la directory `foto` in `archivio.tar/`", ok: false, why: "`archivio.tar` è un file, non una directory." },
            { t: "Estrae `foto/` da `archivio.tar`", ok: false, why: "Per estrarre si usa `x`." }
        ]
    },
    {
        id: "3.1-08", type: "fill", ref: "3.1_01#Gestire i File ZIP", placeholder: "comando",
        text: "Scrivi il comando che estrae i file dell'archivio `foto.zip` nella directory corrente.",
        answers: ["unzip foto.zip"],
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
            { t: "zip", ok: false, why: "zip usa l'estensione `.zip`." }
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
            { t: "Manda l'output di `ls -l` come input a `less`", ok: true, why: "È una pipe: il secondo comando lavora sul risultato del primo, senza file intermedi." },
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
            { t: "Le righe che non iniziano con `#`: il file senza le righe di commento", ok: true, why: "`^#` trova le righe che iniziano con `#`; `-v` le esclude e mostra tutte le altre." },
            { t: "Solo le righe di commento", ok: false, why: "Senza `-v` sarebbe così." },
            { t: "Il numero delle righe di commento", ok: false, why: "Per contare si usa `-c`." },
            { t: "La versione di grep", ok: false, why: "La versione si chiede con `grep --version` (`-V`); `-v` è un'altra cosa." }
        ]
    },
    {
        id: "3.2-06", type: "fill", ref: "3.2_01#Pipe", placeholder: "comando",
        text: "Scrivi un comando che conta quante righe ha il file `nomi.txt`.",
        answers: ["wc -l nomi.txt", "wc --lines nomi.txt", "wc -l < nomi.txt", "cat nomi.txt | wc -l"],
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
            { t: "La prima riga del file", ok: false, why: "La prima riga si ottiene con `head -n 1`." },
            { t: "Il primo carattere di ogni riga", ok: false, why: "Per i caratteri si userebbe `cut -c1`." },
            { t: "Il file senza la prima colonna", ok: false, why: "`-f1` tiene il primo campo, non lo toglie." }
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
            { t: "Manda anche gli errori (canale 2) dove va l'output normale (canale 1), cioè nel file", ok: true, why: "Così in `tutto.log` finiscono sia i risultati sia i messaggi di errore." },
            { t: "Esegue il comando due volte", ok: false, why: "I numeri indicano i canali di output, non le ripetizioni." },
            { t: "Manda l'output normale nel canale degli errori", ok: false, why: "Sarebbe `1>&2` (o `>&2`)." },
            { t: "Scrive gli errori in un file chiamato `1`", ok: false, why: "La `&` dice che 1 è un canale, non un file." }
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
            { t: "A leggere un testo lungo una pagina alla volta, andando avanti e indietro; si esce con `q`", ok: true, why: "Si usa con un file (`less /var/log/syslog`) o alla fine di una pipe." },
            { t: "A ridurre la dimensione di un file", ok: false, why: "Per ridurre la dimensione si comprime con `gzip`, `bzip2` o `xz`." },
            { t: "A modificare un file", ok: false, why: "`less` mostra soltanto; per modificare servono editor come `nano` o `vi`." },
            { t: "A contare le righe", ok: false, why: "Per contare si usa `wc -l`." }
        ]
    },
    {
        id: "3.2-16", type: "single", ref: "3.2_02#Espressioni Regolari",
        text: "Perché `grep 'a*' parole.txt` mostra tutte le righe del file, anche quelle senza la lettera a?",
        options: [
            { t: "Perché `a*` vuol dire «zero o più a»: anche zero a va bene, e ogni riga ne contiene zero", ok: true, why: "Per trovare le righe con almeno una a basta `grep 'a'` (oppure `aa*`)." },
            { t: "Perché la shell sostituisce `a*` con i nomi dei file", ok: false, why: "Il modello è tra virgolette singole: la shell non lo tocca e arriva intero a `grep`." },
            { t: "Perché `*` in grep significa «qualsiasi riga»", ok: false, why: "`*` ripete il carattere che lo precede; da solo non vuol dire «qualsiasi riga»." },
            { t: "È un errore di grep", ok: false, why: "È il comportamento corretto delle espressioni regolari." }
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
            { t: "Il codice di uscita del comando: 0 se è andato bene, un altro numero se c'è stato un errore", ok: true, why: "Per esempio dopo `ls /nonesiste` vale 2; dopo `true` vale 0." },
            { t: "Il numero di argomenti del comando", ok: false, why: "Il numero di argomenti di uno script è in `$#`." },
            { t: "Il testo dell'ultimo messaggio di errore", ok: false, why: "`$?` contiene solo un numero." },
            { t: "Il numero del processo del comando", ok: false, why: "Il numero del processo della shell è in `$$`." }
        ]
    },
    {
        id: "3.3-08", type: "single", ref: "3.3_02#Codici di Uscita",
        text: "Per convenzione, che cosa significa il codice di uscita 0?",
        options: [
            { t: "Che il comando è terminato con successo", ok: true, why: "Qualsiasi valore diverso da 0 (da 1 a 255) indica un errore o una condizione particolare." },
            { t: "Che il comando ha dato errore", ok: false, why: "È il contrario: 0 vuol dire tutto bene." },
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
            { t: "Una riga: «numero 1 2 3»", ok: false, why: "`echo` viene eseguito una volta per ogni valore, non una volta sola." },
            { t: "Tre righe: «numero $n»", ok: false, why: "Tra virgolette doppie `$n` viene sostituito dal suo valore." },
            { t: "«numero 3»: solo l'ultimo valore", ok: false, why: "Il corpo del ciclo viene eseguito a ogni giro." }
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
            { t: "Se lo script non ha ricevuto esattamente un argomento, avvisa e termina con codice 1", ok: true, why: "`$#` è il numero di argomenti, `-ne` vuol dire «diverso da». Il codice 1 segnala l'errore a chi ha avviato lo script." },
            { t: "Se lo script ha ricevuto un argomento, termina", ok: false, why: "Termina quando il numero è diverso da 1." },
            { t: "Ripete il messaggio finché non arriva un argomento", ok: false, why: "`if` decide una volta sola; per ripetere servono i cicli." },
            { t: "Controlla se esiste un file chiamato 1", ok: false, why: "Il test confronta numeri (`$#` con 1), non controlla file." }
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
            { t: "Senza virgolette la shell divide il valore negli spazi e `rm` riceve tre nomi: `le`, `mie` e `foto.txt`", ok: true, why: "Le virgolette doppie tengono insieme il valore come un solo argomento, spazi compresi." },
            { t: "Perché senza virgolette la variabile non viene sostituita", ok: false, why: "Viene sostituita in tutti e due i casi; cambia come il valore viene diviso in parole." },
            { t: "Perché `rm` accetta solo nomi tra virgolette", ok: false, why: "`rm` non vede mai le virgolette: le usa la shell." },
            { t: "Non c'è differenza", ok: false, why: "C'è: con i nomi che contengono spazi il comando senza virgolette lavora sui file sbagliati." }
        ]
    }
]);
