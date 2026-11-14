#!/usr/bin/env bash
# Palestra LPI: gli esercizi al terminale di Certificazioni LPI su un Linux vero (per esempio
# Linux Mint in VirtualBox). Crea l'utente anna, con la stessa home del simulatore, e il comando
# lpi-esercizio, che prepara la home per un esercizio e ne mostra il compito.
#
#   sudo bash palestra.sh installa      una volta sola: crea anna (password: anna) e luca
#   su - anna                           diventi anna
#   lpi-esercizio                       l'elenco degli esercizi
#   lpi-esercizio t2.4-04               prepara la home di anna per l'esercizio e ne mostra il compito
#   lpi-esercizio soluzione t2.4-04     la soluzione
#   lpi-esercizio inizio                la home di anna come all'inizio
#   sudo lpi-esercizio disinstalla      toglie anna, luca e i file della palestra
#
# Questo file è scritto da tools/build-palestra.js a partire dagli esercizi dell'app: non
# modificarlo a mano. https://github.com/paselsoft/certificazioni-lpi
set -euo pipefail

ELENCO=$'t2.1-01  Una variabile\nt2.1-02  Il dollaro tra virgolette\nt2.1-03  Allungare il PATH\nt2.1-04  Che tipo di comando è?\nt2.3-01  Dove sono?\nt2.3-02  I file nascosti\nt2.3-03  Tutto il contenuto, anche dentro\nt2.3-04  Percorso relativo\nt2.3-05  Il più recente per primo\nt2.4-01  Directory annidate\nt2.4-02  Rinominare\nt2.4-03  Copiare una directory\nt2.4-04  Eliminare una directory piena\nt2.4-05  Tutti i .jpg in un colpo\nt2.4-06  Un solo carattere\nt3.1-01  Un archivio compresso\nt3.1-02  Estrarre un archivio\nt3.1-03  Guardare dentro senza estrarre\nt3.1-04  Comprimere un file\nt3.1-05  Un file zip\nt3.2-01  Gli errori nel log\nt3.2-02  Quanti errori?\nt3.2-03  I nomi degli utenti\nt3.2-04  Ordinata e senza doppioni\nt3.2-05  Aggiungere in fondo\nt3.2-06  L\'inizio del log\nt3.2-07  Senza messaggi di errore\nt3.2-08  Righe che iniziano così\nt3.3-01  Il primo script\nt5.3-01  Solo per me\nt5.3-02  Eseguibile per il proprietario\nt5.3-03  Togliere la lettura agli altri\nt5.3-04  Cambiare proprietario\nt5.3-05  Il gruppo può scrivere ovunque\nt5.4-01  Un link simbolico\nt5.4-02  Un hard link\nt5.4-03  Una directory per tutti\nt5.4-04  I permessi di /tmp'
APP_LOG=$'2026-11-12 08:00:01 INFO avvio del servizio\n2026-11-12 08:05:12 WARN disco quasi pieno\n2026-11-12 08:10:30 ERROR connessione al database fallita\n2026-11-12 08:10:31 INFO nuovo tentativo\n2026-11-12 08:10:35 ERROR connessione al database fallita\n2026-11-12 08:11:00 INFO connessione riuscita\n2026-11-12 09:00:00 error utente sconosciuto: mario\n'
SEGRETO=$'solo per luca\n'

# La home su cui lavorare: quella di anna (LPI_CASA serve solo ai controlli automatici)
CASA="${LPI_CASA:-/home/anna}"
ADESSO="$(date +%s)"
PREPARA=0

errore() {
    printf '%s\n' "$*" >&2
    exit 1
}

# ---- Le operazioni sui file (fanno qualcosa solo quando si prepara un esercizio) ----

cartella() {
    [ "$PREPARA" = 1 ] || return 0
    mkdir -p "$CASA/$1"
}

# file PERCORSO PERMESSI ETÀ_IN_MINUTI CONTENUTO
file() {
    [ "$PREPARA" = 1 ] || return 0
    printf '%s' "$4" > "$CASA/$1"
    chmod "$2" "$CASA/$1"
    touch -d "@$((ADESSO - $3 * 60))" "$CASA/$1"
}

collegamento() {
    [ "$PREPARA" = 1 ] || return 0
    ln -s "$2" "$CASA/$1"
}

# data CARTELLA PERMESSI ETÀ_IN_MINUTI
data() {
    [ "$PREPARA" = 1 ] || return 0
    chmod "$2" "$CASA/$1"
    touch -d "@$((ADESSO - $3 * 60))" "$CASA/$1"
}

esegui() {
    [ "$PREPARA" = 1 ] || return 0
    ( cd "$CASA" && eval "$1" ) >/dev/null
}

# Toglie dalla home tutto quello che non comincia con un punto (i file nascosti restano)
svuota() {
    local voce
    for voce in "$CASA"/* ; do
        [ -e "$voce" ] || [ -L "$voce" ] || continue
        # Le directory senza permessi (dopo un chmod 000) non si potrebbero cancellare
        [ -L "$voce" ] || find "$voce" -type d -exec chmod u+rwx {} + 2>/dev/null || true
        rm -rf "$voce"
    done
    # La directory dell'esercizio 5.4 sullo sticky bit, se l'ha creata anna
    if [ -z "${LPI_CASA:-}" ] && [ -d /tmp/scambio ] && [ -O /tmp/scambio ]; then
        rm -rf /tmp/scambio
    fi
}

# Si lavora solo sulla home di anna, e solo da anna: mai sulla tua home vera
controlla_utente() {
    if [ -z "${LPI_CASA:-}" ]; then
        [ "$(id -un)" = anna ] || errore "lpi-esercizio funziona solo per l'utente anna, per non toccare i tuoi file. Prima scrivi: su - anna   (la password è anna)"
    fi
    [ -d "$CASA" ] || errore "Non trovo la cartella $CASA. Hai eseguito sudo bash palestra.sh installa?"
}

base() {
    cartella documenti
    cartella foto
    cartella progetti
    file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
    file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
    file foto/mare.jpg 644 14400 $'JPEG mare\n'
    file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
    file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
    data progetti 755 4320
    data foto 755 4320
    data documenti 755 4320
}

# esercizio ID: imposta TITOLO, COMPITO, PARTENZA e SOLUZIONE (e, con PREPARA=1, prepara la home)
esercizio() {
    case "$1" in
    t2.1-01)
        TITOLO=$'Una variabile'
        COMPITO=$'Crea la variabile CITTA con il valore Roma, poi stampane il valore con echo.'
        PARTENZA=$''
        SOLUZIONE=$'CITTA=Roma\necho $CITTA'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.1-02)
        TITOLO=$'Il dollaro tra virgolette'
        COMPITO=$'Stampa con echo esattamente questa frase, simbolo del dollaro compreso: Il biglietto costa $5'
        PARTENZA=$''
        SOLUZIONE=$'echo \'Il biglietto costa $5\''
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.1-03)
        TITOLO=$'Allungare il PATH'
        COMPITO=$'I tuoi script stanno in /home/anna/bin. Aggiungi questa directory in fondo alla variabile PATH, senza perdere quelle che ci sono già, e rendi la variabile disponibile ai programmi.'
        PARTENZA=$''
        SOLUZIONE=$'export PATH=$PATH:/home/anna/bin'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.1-04)
        TITOLO=$'Che tipo di comando è?'
        COMPITO=$'Scopri con un solo comando se cd e cp sono comandi interni della shell o programmi esterni.'
        PARTENZA=$''
        SOLUZIONE=$'type cd cp'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.3-01)
        TITOLO=$'Dove sono?'
        COMPITO=$'Entra nella directory documenti della tua home e poi mostra il percorso completo della directory in cui ti trovi.'
        PARTENZA=$''
        SOLUZIONE=$'cd documenti\npwd'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.3-02)
        TITOLO=$'I file nascosti'
        COMPITO=$'Elenca il contenuto della tua home mostrando anche i file nascosti.'
        PARTENZA=$''
        SOLUZIONE=$'ls -a'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.3-03)
        TITOLO=$'Tutto il contenuto, anche dentro'
        COMPITO=$'Elenca il contenuto della directory progetti e di tutte le sue sottodirectory, con un solo comando.'
        PARTENZA=$''
        SOLUZIONE=$'ls -R progetti'
        cartella documenti
        cartella foto
        cartella progetti
        cartella progetti/sito
        cartella progetti/sito/css
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file progetti/appunti.txt 644 4320 $'idee\n'
        file progetti/sito/css/stile.css 644 4320 $'h1 { color: navy; }\n'
        file progetti/sito/index.html 644 4320 $'<h1>Ciao</h1>\n'
        data progetti/sito/css 755 0
        data progetti/sito 755 0
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.3-04)
        TITOLO=$'Percorso relativo'
        COMPITO=$'Sei in /home/anna/foto. Spostati in /home/anna/documenti usando un percorso relativo (che non inizia con /).'
        PARTENZA=$'/home/anna/foto'
        SOLUZIONE=$'cd ../documenti'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.3-05)
        TITOLO=$'Il più recente per primo'
        COMPITO=$'Elenca i file della directory documenti in formato lungo, mettendo per primi quelli modificati più di recente.'
        PARTENZA=$''
        SOLUZIONE=$'ls -lt documenti'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.4-01)
        TITOLO=$'Directory annidate'
        COMPITO=$'Crea la struttura di directory viaggi/2027/foto con un solo comando (nessuna delle tre esiste).'
        PARTENZA=$''
        SOLUZIONE=$'mkdir -p viaggi/2027/foto'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.4-02)
        TITOLO=$'Rinominare'
        COMPITO=$'Rinomina il file bozza.txt in relazione.txt.'
        PARTENZA=$''
        SOLUZIONE=$'mv bozza.txt relazione.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file bozza.txt 644 4320 $'Prima stesura della relazione.\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.4-03)
        TITOLO=$'Copiare una directory'
        COMPITO=$'Copia la directory foto, con tutto il contenuto, in una nuova directory foto-backup.'
        PARTENZA=$''
        SOLUZIONE=$'cp -r foto foto-backup'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.4-04)
        TITOLO=$'Eliminare una directory piena'
        COMPITO=$'Elimina la directory vecchi con tutto quello che contiene.'
        PARTENZA=$''
        SOLUZIONE=$'rm -r vecchi'
        cartella documenti
        cartella foto
        cartella progetti
        cartella vecchi
        cartella vecchi/sotto
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file vecchi/a.txt 644 4320 $'a\n'
        file vecchi/sotto/b.txt 644 4320 $'b\n'
        data vecchi/sotto 755 0
        data vecchi 755 0
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.4-05)
        TITOLO=$'Tutti i .jpg in un colpo'
        COMPITO=$'Nella tua home ci sono tre foto .jpg e due file .txt. Sposta tutte le foto nella directory foto con un solo comando, lasciando i .txt dove sono.'
        PARTENZA=$''
        SOLUZIONE=$'mv *.jpg foto'
        cartella documenti
        cartella foto
        cartella progetti
        file Duomo.jpg 644 4320 $'JPEG duomo\n'
        file cena.jpg 644 4320 $'JPEG cena\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file elenco.txt 644 4320 $'da fare\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file gita.jpg 644 4320 $'JPEG gita\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.4-06)
        TITOLO=$'Un solo carattere'
        COMPITO=$'Ci sono report1.txt ... report9.txt e report10.txt. Elimina con un solo comando i report da 1 a 9, ma non report10.txt.'
        PARTENZA=$''
        SOLUZIONE=$'rm report?.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file report1.txt 644 4320 $'report 1\n'
        file report10.txt 644 4320 $'report 10\n'
        file report2.txt 644 4320 $'report 2\n'
        file report3.txt 644 4320 $'report 3\n'
        file report4.txt 644 4320 $'report 4\n'
        file report5.txt 644 4320 $'report 5\n'
        file report6.txt 644 4320 $'report 6\n'
        file report7.txt 644 4320 $'report 7\n'
        file report8.txt 644 4320 $'report 8\n'
        file report9.txt 644 4320 $'report 9\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.1-01)
        TITOLO=$'Un archivio compresso'
        COMPITO=$'Crea l\'archivio documenti.tar.gz, compresso con gzip, con dentro la directory documenti.'
        PARTENZA=$''
        SOLUZIONE=$'tar -czf documenti.tar.gz documenti'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.1-02)
        TITOLO=$'Estrarre un archivio'
        COMPITO=$'Nella tua home c\'è sito.tar.gz. Estrai il suo contenuto nella directory corrente.'
        PARTENZA=$''
        SOLUZIONE=$'tar -xzf sito.tar.gz'
        cartella documenti
        cartella foto
        cartella progetti
        cartella sito
        cartella sito/css
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file sito/css/stile.css 644 4320 $'body { margin: 0; }\n'
        file sito/index.html 644 4320 $'<h1>Benvenuti</h1>\n'
        data sito/css 755 0
        data sito 755 0
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        esegui $'tar -czf sito.tar.gz sito'
        esegui $'rm -r sito'
        ;;
    t3.1-03)
        TITOLO=$'Guardare dentro senza estrarre'
        COMPITO=$'Mostra l\'elenco dei file contenuti in backup.tar.gz senza estrarli.'
        PARTENZA=$''
        SOLUZIONE=$'tar -tzf backup.tar.gz'
        cartella documenti
        cartella foto
        cartella lavoro
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file lavoro/costi.txt 644 4320 $'costi\n'
        file lavoro/piano.txt 644 4320 $'piano\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data lavoro 755 0
        data foto 755 4320
        data documenti 755 4320
        esegui $'tar -czf backup.tar.gz lavoro'
        esegui $'rm -r lavoro'
        ;;
    t3.1-04)
        TITOLO=$'Comprimere un file'
        COMPITO=$'Comprimi il file registro.log con gzip (al suo posto deve restare solo la versione compressa).'
        PARTENZA=$''
        SOLUZIONE=$'gzip registro.log'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file registro.log 644 4320 $'riga 1\nriga 2\nriga 3\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.1-05)
        TITOLO=$'Un file zip'
        COMPITO=$'Crea l\'archivio foto.zip con dentro la directory foto e tutto il suo contenuto.'
        PARTENZA=$''
        SOLUZIONE=$'zip -r foto.zip foto'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-01)
        TITOLO=$'Gli errori nel log'
        COMPITO=$'Mostra le righe del file /var/log/app.log che contengono la parola ERROR (in maiuscolo).'
        PARTENZA=$''
        SOLUZIONE=$'grep ERROR /var/log/app.log'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-02)
        TITOLO=$'Quanti errori?'
        COMPITO=$'Conta quante righe di /var/log/app.log contengono «error», scritto in qualsiasi modo (maiuscole o minuscole).'
        PARTENZA=$''
        SOLUZIONE=$'grep -ic error /var/log/app.log'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-03)
        TITOLO=$'I nomi degli utenti'
        COMPITO=$'Salva nel file utenti.txt i nomi degli utenti del sistema: il primo campo di ogni riga di /etc/passwd, dove i campi sono separati da :.'
        PARTENZA=$''
        SOLUZIONE=$'cut -d: -f1 /etc/passwd > utenti.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-04)
        TITOLO=$'Ordinata e senza doppioni'
        COMPITO=$'Scrivi nel file spesa-ordinata.txt la lista di documenti/spesa.txt in ordine alfabetico e senza ripetizioni.'
        PARTENZA=$''
        SOLUZIONE=$'sort documenti/spesa.txt | uniq > spesa-ordinata.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-05)
        TITOLO=$'Aggiungere in fondo'
        COMPITO=$'Aggiungi la riga burro in fondo a documenti/spesa.txt, senza cancellare quello che c\'è già.'
        PARTENZA=$''
        SOLUZIONE=$'echo burro >> documenti/spesa.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-06)
        TITOLO=$'L\'inizio del log'
        COMPITO=$'Mostra solo le prime 3 righe di /var/log/app.log.'
        PARTENZA=$''
        SOLUZIONE=$'head -n 3 /var/log/app.log'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-07)
        TITOLO=$'Senza messaggi di errore'
        COMPITO=$'Cerca con find, partendo da /, i file che si chiamano passwd, senza far comparire i messaggi «Permesso negato».'
        PARTENZA=$''
        SOLUZIONE=$'find / -name passwd 2>/dev/null'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.2-08)
        TITOLO=$'Righe che iniziano così'
        COMPITO=$'Mostra le righe di /etc/passwd che iniziano con anna (e solo quelle che iniziano così).'
        PARTENZA=$''
        SOLUZIONE=$'grep \'^anna\' /etc/passwd'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-01)
        TITOLO=$'Il primo script'
        COMPITO=$'Crea lo script saluta.sh con due righe: #!/bin/bash e echo Ciao. Poi rendilo eseguibile per il proprietario.'
        PARTENZA=$''
        SOLUZIONE=$'echo \'#!/bin/bash\' > saluta.sh\necho \'echo Ciao\' >> saluta.sh\nchmod u+x saluta.sh'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.3-01)
        TITOLO=$'Solo per me'
        COMPITO=$'Imposta i permessi del file diario.txt in modo che solo tu possa leggerlo e modificarlo: rw-------.'
        PARTENZA=$''
        SOLUZIONE=$'chmod 600 diario.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file diario.txt 644 4320 $'Caro diario...\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.3-02)
        TITOLO=$'Eseguibile per il proprietario'
        COMPITO=$'Lo script backup.sh ha i permessi rw-r--r--. Aggiungi il permesso di esecuzione solo per il proprietario.'
        PARTENZA=$''
        SOLUZIONE=$'chmod u+x backup.sh'
        cartella documenti
        cartella foto
        cartella progetti
        file backup.sh 644 4320 $'#!/bin/bash\ntar -czf backup.tar.gz documenti\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.3-03)
        TITOLO=$'Togliere la lettura agli altri'
        COMPITO=$'Togli agli «altri» (né proprietario né gruppo) il permesso di leggere note.txt, senza cambiare gli altri permessi.'
        PARTENZA=$''
        SOLUZIONE=$'chmod o-r note.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.3-04)
        TITOLO=$'Cambiare proprietario'
        COMPITO=$'Rendi luca il proprietario del file condiviso.txt. Solo l\'amministratore può farlo: usa sudo.'
        PARTENZA=$''
        SOLUZIONE=$'sudo chown luca condiviso.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file condiviso.txt 644 4320 $'Appunti in comune\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.3-05)
        TITOLO=$'Il gruppo può scrivere ovunque'
        COMPITO=$'Dai al gruppo il permesso di scrittura sulla directory progetti e su tutto quello che contiene, con un solo comando.'
        PARTENZA=$''
        SOLUZIONE=$'chmod -R g+w progetti'
        cartella documenti
        cartella foto
        cartella progetti
        cartella progetti/sito
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file progetti/note.txt 644 4320 $'note\n'
        file progetti/sito/index.html 644 4320 $'<h1>Ciao</h1>\n'
        data progetti/sito 755 0
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.4-01)
        TITOLO=$'Un link simbolico'
        COMPITO=$'Crea nella tua home il link simbolico hosts che punta al file /etc/hosts.'
        PARTENZA=$''
        SOLUZIONE=$'ln -s /etc/hosts hosts'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.4-02)
        TITOLO=$'Un hard link'
        COMPITO=$'Crea promemoria.txt, un hard link (non simbolico) al file note.txt.'
        PARTENZA=$''
        SOLUZIONE=$'ln note.txt promemoria.txt'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.4-03)
        TITOLO=$'Una directory per tutti'
        COMPITO=$'Crea la directory /tmp/scambio dove tutti gli utenti possono creare file, ma ognuno può cancellare solo i propri (come /tmp).'
        PARTENZA=$''
        SOLUZIONE=$'mkdir /tmp/scambio\nchmod 1777 /tmp/scambio'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t5.4-04)
        TITOLO=$'I permessi di /tmp'
        COMPITO=$'Mostra in formato lungo i permessi della directory /tmp stessa, non dei file che contiene.'
        PARTENZA=$''
        SOLUZIONE=$'ls -ld /tmp'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    *)
        errore "Non conosco l'esercizio «$1». Scrivi lpi-esercizio per vedere l'elenco."
        ;;
    esac
}

a_capo() {
    if command -v fold >/dev/null; then fold -s -w 78; else cat; fi
}

# Se il terminale era dentro una cartella della home, quella cartella è stata cancellata e
# ricreata: il terminale resta «nel vuoto» finché non si cambia directory
ero_dentro() {
    case "${PWD:-}" in
        "$CASA"/*) return 0 ;;
        *) return 1 ;;
    esac
}

prepara() {
    controlla_utente
    esercizio "$1"
    PREPARA=1
    svuota
    esercizio "$1"
    printf 'Esercizio %s: %s\n\n' "$1" "$TITOLO"
    printf '%s\n' "$COMPITO" | a_capo
    printf '\nLa home di anna è pronta.\n'
    if [ -n "$PARTENZA" ]; then
        printf 'Per cominciare scrivi: cd %s\n' "$PARTENZA"
    elif ero_dentro; then
        printf 'Per cominciare scrivi: cd   (la cartella in cui eri è stata ricreata: cd ti riporta nella home)\n'
    else
        printf 'Comincia pure da qui, dalla home di anna.\n'
    fi
    printf 'La soluzione: lpi-esercizio soluzione %s\n' "$1"
}

inizio() {
    controlla_utente
    PREPARA=1
    svuota
    base
    printf 'La home di anna è come all%sinizio.' "'"
    if ero_dentro; then printf ' Scrivi cd per tornarci.'; fi
    printf '\n'
}

installa() {
    [ "$(id -u)" = 0 ] || errore "Per installare servono i permessi di amministratore: sudo bash palestra.sh installa"
    local sorgente
    sorgente="$(readlink -f "$0")"
    [ -f "$sorgente" ] || errore "Scarica prima lo script in un file, poi: sudo bash palestra.sh installa"
    if ! command -v zip >/dev/null || ! command -v unzip >/dev/null; then
        if command -v apt-get >/dev/null; then
            echo "Installo zip e unzip..."
            apt-get install -y zip unzip >/dev/null || echo "Non sono riuscito a installare zip e unzip: gli esercizi con zip non funzioneranno."
        else
            echo "Mancano zip e unzip: installali per gli esercizi con zip."
        fi
    fi
    getent group sviluppo >/dev/null || groupadd sviluppo
    if ! id anna >/dev/null 2>&1; then
        useradd -m -s /bin/bash -c "Anna Rossi" anna
        echo "anna:anna" | chpasswd
        echo "Ho creato l'utente anna (password: anna)."
    fi
    usermod -aG sviluppo anna
    if getent group sudo >/dev/null; then usermod -aG sudo anna; fi
    chmod 750 /home/anna
    if ! id luca >/dev/null 2>&1; then
        useradd -m -s /bin/bash -c "Luca Bianchi" luca
        echo "Ho creato l'utente luca (senza password: non serve entrarci)."
    fi
    chmod 750 /home/luca
    printf '%s' "$SEGRETO" > /home/luca/segreto.txt
    chown luca:luca /home/luca/segreto.txt
    chmod 600 /home/luca/segreto.txt
    printf '%s' "$APP_LOG" > /var/log/app.log
    chmod 644 /var/log/app.log
    install -m 755 "$sorgente" /usr/local/bin/lpi-esercizio
    runuser -u anna -- /usr/local/bin/lpi-esercizio inizio >/dev/null
    cat <<'FINE'
La palestra è pronta. Adesso:
  su - anna                  diventi anna (password: anna)
  lpi-esercizio              l'elenco degli esercizi
  lpi-esercizio t2.3-01      prepara il primo esercizio
  exit                       torni al tuo utente
FINE
}

disinstalla() {
    [ "$(id -u)" = 0 ] || errore "Servono i permessi di amministratore: sudo lpi-esercizio disinstalla"
    if id anna >/dev/null 2>&1; then userdel -r anna 2>/dev/null || userdel anna; fi
    if id luca >/dev/null 2>&1; then userdel -r luca 2>/dev/null || userdel luca; fi
    if getent group sviluppo >/dev/null; then groupdel sviluppo; fi
    rm -f /var/log/app.log /usr/local/bin/lpi-esercizio
    rm -rf /tmp/scambio
    echo "Ho tolto anna, luca e i file della palestra."
}

case "${1:-}" in
    "" | elenco)
        printf 'Gli esercizi (scrivi lpi-esercizio e il codice, per esempio lpi-esercizio t2.3-01):\n\n%s\n' "$ELENCO"
        ;;
    installa) installa ;;
    disinstalla) disinstalla ;;
    inizio) inizio ;;
    soluzione)
        [ -n "${2:-}" ] || errore "Scrivi anche il codice dell'esercizio, per esempio: lpi-esercizio soluzione t2.3-01"
        esercizio "$2"
        printf 'Soluzione dell%sesercizio %s (%s):\n\n%s\n' "'" "$2" "$TITOLO" "$SOLUZIONE"
        ;;
    -h | --help | aiuto)
        sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
        ;;
    *) prepara "$1" ;;
esac
