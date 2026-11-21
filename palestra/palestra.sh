#!/usr/bin/env bash
# Palestra LPI: gli esercizi al terminale di Certificazioni LPI su un Linux vero (per esempio
# Linux Mint in VirtualBox). Crea l'utente anna, con la stessa home del simulatore, e il comando
# lpi-esercizio, che prepara la home per un esercizio e ne mostra il compito.
#
#   sudo bash palestra.sh installa      una volta sola: crea anna (password: anna) e luca
#   su - anna                           diventi anna
#   lpi-esercizio                       l'elenco degli esercizi
#   lpi-esercizio t2.4-04               prepara la home di anna per l'esercizio e ne mostra il compito
#   lpi-esercizio verifica              quali obiettivi dell'esercizio hai già raggiunto
#   lpi-esercizio soluzione t2.4-04     la soluzione
#   lpi-esercizio inizio                la home di anna come all'inizio
#   sudo lpi-esercizio disinstalla      toglie anna, luca e i file della palestra
#
# Questo file è scritto da tools/build-palestra.js a partire dagli esercizi dell'app: non
# modificarlo a mano. https://github.com/paselsoft/certificazioni-lpi
set -euo pipefail

ELENCO=$'t1.2-01  Che cosa è installato?\nt1.2-02  Installare un programma\nt1.2-03  Cercare un pacchetto\nt1.2-04  Di quale pacchetto è?\nt1.2-05  Togliere tutto\nt2.1-01  Una variabile\nt2.1-02  Il dollaro tra virgolette\nt2.1-03  Allungare il PATH\nt2.1-04  Che tipo di comando è?\nt2.2-01  La pagina di manuale\nt2.2-02  Non ricordo il nome\nt2.2-03  La sezione giusta\nt2.2-04  L\'aiuto veloce\nt2.2-05  Un comando interno\nt2.2-06  La documentazione dei pacchetti\nt2.2-07  Dov\'è quel file?\nt2.2-08  Il database non lo sa ancora\nt2.3-01  Dove sono?\nt2.3-02  I file nascosti\nt2.3-03  Tutto il contenuto, anche dentro\nt2.3-04  Percorso relativo\nt2.3-05  Il più recente per primo\nt2.4-01  Directory annidate\nt2.4-02  Rinominare\nt2.4-03  Copiare una directory\nt2.4-04  Eliminare una directory piena\nt2.4-05  Tutti i .jpg in un colpo\nt2.4-06  Un solo carattere\nt3.1-01  Un archivio compresso\nt3.1-02  Estrarre un archivio\nt3.1-03  Guardare dentro senza estrarre\nt3.1-04  Comprimere un file\nt3.1-05  Un file zip\nt3.2-01  Gli errori nel log\nt3.2-02  Quanti errori?\nt3.2-03  I nomi degli utenti\nt3.2-04  Ordinata e senza doppioni\nt3.2-05  Aggiungere in fondo\nt3.2-06  L\'inizio del log\nt3.2-07  Senza messaggi di errore\nt3.2-08  Righe che iniziano così\nt3.3-01  Il primo script\nt3.3-02  Senza il permesso di esecuzione\nt3.3-03  Con il punto e la barra\nt3.3-04  Il primo argomento\nt3.3-05  Quanti argomenti?\nt3.3-06  Il codice di uscita\nt3.3-07  Un comando tutto tuo\nt3.3-08  Un ciclo su una riga\nt3.3-09  Un saluto per ciascuno\nt3.3-10  Se il file esiste\nt3.3-11  Leggere uno script\nt3.3-12  Il primo file con nano\nt3.3-13  Aggiungere una riga con nano\nt3.3-14  Il primo file con vi\nt3.3-15  Togliere una riga con vi\nt3.3-16  Uno script scritto con vim\nt4.3-01  I processi del terminale\nt4.3-02  Tutti i processi\nt4.3-03  Trova un processo\nt4.3-04  Quanta memoria?\nt4.3-05  La memoria vista dal kernel\nt4.3-06  La cartella di un processo\nt4.3-07  I messaggi del kernel\nt4.3-08  Il registro di sistema\nt4.3-09  Il kernel sul disco\nt4.3-10  I dischi sono file\nt4.4-01  Il mio indirizzo IP\nt4.4-02  Il vecchio ifconfig\nt4.4-03  La porta verso Internet\nt4.4-04  La tabella di route\nt4.4-05  Quale server DNS?\nt4.4-06  Nomi senza DNS\nt4.4-07  Il NAS risponde?\nt4.4-08  Chiedere al DNS\nt4.4-09  Chi è in ascolto?\nt4.4-10  Gli indirizzi IPv6\nt5.1-01  Chi sono io?\nt5.1-02  Chi è collegato?\nt5.1-03  Che cosa stanno facendo?\nt5.1-04  Gli accessi di luca\nt5.1-05  Un utente di sistema\nt5.1-06  Dove stanno le password\nt5.1-07  Che cosa posso fare con sudo?\nt5.1-08  Diventare luca\nt5.1-09  Un comando come un altro utente\nt5.1-10  Il prompt di root\nt5.2-01  Un nuovo utente\nt5.2-02  Nome completo e shell\nt5.2-03  La riga del nuovo utente\nt5.2-04  Il modello delle home\nt5.2-05  Un gruppo nuovo\nt5.2-06  Aggiungere a un gruppo\nt5.2-07  Una password per luigi\nt5.2-08  Bloccare un account\nt5.2-09  Un utente di sistema\nt5.2-10  Eliminare un utente\nt5.2-11  Il numero di un utente\nt5.3-01  Solo per me\nt5.3-02  Eseguibile per il proprietario\nt5.3-03  Togliere la lettura agli altri\nt5.3-04  Cambiare proprietario\nt5.3-05  Il gruppo può scrivere ovunque\nt5.4-01  Un link simbolico\nt5.4-02  Un hard link\nt5.4-03  Una directory per tutti\nt5.4-04  I permessi di /tmp'
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

# esercizio ID: imposta TITOLO, COMPITO, PARTENZA, PRIMA (i comandi da scrivere prima, con sudo) e
# SOLUZIONE (e, con PREPARA=1, prepara la home)
esercizio() {
    case "$1" in
    t1.2-01)
        TITOLO=$'Che cosa è installato?'
        COMPITO=$'Con dpkg controlla se il pacchetto nano è installato e quale versione c\'è.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'dpkg -l nano'
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
    t1.2-02)
        TITOLO=$'Installare un programma'
        COMPITO=$'Il comando tree, che disegna l\'albero delle directory, non c\'è. Installa il pacchetto tree con apt-get, poi usalo per vedere la directory documenti.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo apt-get install tree\ntree documenti'
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
    t1.2-03)
        TITOLO=$'Cercare un pacchetto'
        COMPITO=$'Non ricordi il nome del programma per vedere i processi in modo interattivo. Cerca nei repository i pacchetti che hanno processes nel nome o nella descrizione.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'apt-cache search processes'
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
    t1.2-04)
        TITOLO=$'Di quale pacchetto è?'
        COMPITO=$'Scopri quale pacchetto ha installato il file /usr/bin/nano, poi elenca tutti i file di quel pacchetto.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'dpkg -S /usr/bin/nano\ndpkg -L nano'
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
    t1.2-05)
        TITOLO=$'Togliere tutto'
        COMPITO=$'Il server web nginx è installato ma non serve più. Toglilo del tutto con apt-get, compresi i suoi file di configurazione.'
        PARTENZA=$''
        PRIMA=$'sudo apt-get install nginx'
        SOLUZIONE=$'sudo apt-get purge -y nginx'
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
    t2.1-01)
        TITOLO=$'Una variabile'
        COMPITO=$'Crea la variabile CITTA con il valore Roma, poi stampane il valore con echo.'
        PARTENZA=$''
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
    t2.2-01)
        TITOLO=$'La pagina di manuale'
        COMPITO=$'Apri la pagina di manuale del comando cp e cerca l\'opzione che serve per copiare una directory.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'man cp'
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
    t2.2-02)
        TITOLO=$'Non ricordo il nome'
        COMPITO=$'Non ricordi come si chiama il comando che comprime i file. Cerca nel manuale tutte le pagine che parlano di comprime.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'man -k comprime'
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
    t2.2-03)
        TITOLO=$'La sezione giusta'
        COMPITO=$'passwd è sia un comando sia un file di configurazione. Apri la pagina di manuale che descrive il file /etc/passwd, non quella del comando.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'man 5 passwd'
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
    t2.2-04)
        TITOLO=$'L\'aiuto veloce'
        COMPITO=$'Senza aprire il manuale, fatti dire da mkdir stesso come si usa e quali opzioni ha.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'mkdir --help'
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
    t2.2-05)
        TITOLO=$'Un comando interno'
        COMPITO=$'cd è un comando interno della shell e non ha una sua pagina di manuale. Mostra il suo aiuto.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'help cd'
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
    t2.2-06)
        TITOLO=$'La documentazione dei pacchetti'
        COMPITO=$'I pacchetti installano la loro documentazione in una directory apposta sotto /usr/share. Trova lì dentro il file README del pacchetto tar e mostralo.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'cat /usr/share/doc/tar/README'
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
    t2.2-07)
        TITOLO=$'Dov\'è quel file?'
        COMPITO=$'Da qualche parte nella tua home c\'è un file che si chiama stile.css. Trovalo con il comando che cerca nel database dei nomi dei file.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'locate stile.css'
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
        file progetti/sito/css/stile.css 644 4320 $'h1 { color: navy; }\n'
        file progetti/sito/index.html 644 4320 $'<h1>Ciao</h1>\n'
        data progetti/sito/css 755 0
        data progetti/sito 755 0
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t2.2-08)
        TITOLO=$'Il database non lo sa ancora'
        COMPITO=$'Crea il file vuoto appena-nato.txt e cercalo con locate: non lo trova. Aggiorna il database di locate e cercalo di nuovo.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'touch appena-nato.txt\nlocate appena-nato\nsudo updatedb\nlocate appena-nato'
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
    t3.3-02)
        TITOLO=$'Senza il permesso di esecuzione'
        COMPITO=$'Nella tua home c\'è lo script orario.sh, che non ha il permesso di esecuzione. Avvialo lo stesso, senza cambiare i permessi.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'bash orario.sh'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file orario.sh 644 4320 $'#!/bin/bash\necho La lezione comincia alle 9\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-03)
        TITOLO=$'Con il punto e la barra'
        COMPITO=$'Lo script conta.sh conta i file della directory documenti. Rendilo eseguibile per il proprietario e avvialo dalla tua home scrivendo il suo percorso.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'chmod u+x conta.sh\n./conta.sh'
        cartella documenti
        cartella foto
        cartella progetti
        file conta.sh 644 4320 $'#!/bin/bash\nls documenti | wc -l\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-04)
        TITOLO=$'Il primo argomento'
        COMPITO=$'Crea lo script ciao.sh con una sola riga, che stampa Ciao,  seguito dal primo argomento ricevuto. Poi avvialo con bash passando l\'argomento Luca: deve comparire Ciao, Luca.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'echo \'echo "Ciao, $1"\' > ciao.sh\nbash ciao.sh Luca'
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
    t3.3-05)
        TITOLO=$'Quanti argomenti?'
        COMPITO=$'Lo script quanti.sh dice quanti argomenti ha ricevuto. Avvialo in modo che ne conti esattamente 2: il primo è Mario Rossi (nome e cognome insieme), il secondo è Milano.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'./quanti.sh \'Mario Rossi\' Milano'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file quanti.sh 755 4320 $'#!/bin/bash\necho "Argomenti ricevuti: $#"\necho "Il primo: $1"\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-06)
        TITOLO=$'Il codice di uscita'
        COMPITO=$'Lo script cerca.sh cerca la parola burro nella lista della spesa e non scrive niente. Avvialo, poi mostra il suo codice di uscita.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'./cerca.sh\necho $?'
        cartella documenti
        cartella foto
        cartella progetti
        file cerca.sh 755 4320 $'#!/bin/bash\ngrep -q burro documenti/spesa.txt\nexit $?\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-07)
        TITOLO=$'Un comando tutto tuo'
        COMPITO=$'Nella directory /home/anna/bin c\'è lo script saluta, già eseguibile. Fai in modo che la shell lo trovi scrivendo solo il nome, poi avvialo così: saluta.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'PATH=$PATH:~/bin\nsaluta'
        cartella bin
        cartella documenti
        cartella foto
        cartella progetti
        file bin/saluta 755 4320 $'#!/bin/bash\necho Ciao da saluta\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        data bin 755 0
        ;;
    t3.3-08)
        TITOLO=$'Un ciclo su una riga'
        COMPITO=$'Con un ciclo for scritto su una sola riga, stampa per ogni file .jpg della directory foto una riga come questa: Foto: foto/mare.jpg'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'for f in foto/*.jpg; do echo "Foto: $f"; done'
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
    t3.3-09)
        TITOLO=$'Un saluto per ciascuno'
        COMPITO=$'Leggi lo script saluti.sh con cat: saluta ogni persona che riceve come argomento. Avvialo in modo che saluti, in quest\'ordine, Anna, Luca e Sara.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'./saluti.sh Anna Luca Sara'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        file saluti.sh 755 4320 $'#!/bin/bash\n# Saluta tutti gli argomenti\nfor nome in "$@"; do\n    echo "Ciao, $nome!"\ndone\necho "Ho salutato $# persone"\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-10)
        TITOLO=$'Se il file esiste'
        COMPITO=$'Scrivi su una sola riga un if che controlla se nella tua home esiste il file note.txt e, se c\'è, stampa trovato.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'if [ -f note.txt ]; then echo trovato; fi'
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
    t3.3-11)
        TITOLO=$'Leggere uno script'
        COMPITO=$'Leggi lo script controlla.sh con cat e capisci quando esce con il codice 2. Avvialo in modo che succeda, poi mostra il codice di uscita.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'./controlla.sh nonesiste.txt\necho $?'
        cartella documenti
        cartella foto
        cartella progetti
        file controlla.sh 755 4320 $'#!/bin/bash\nif [ $# -ne 1 ]; then\n    echo "Uso: $0 FILE"\n    exit 1\nfi\nif [ -f "$1" ]; then\n    echo "$1 esiste"\nelse\n    echo "$1 non esiste"\n    exit 2\nfi\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-12)
        TITOLO=$'Il primo file con nano'
        COMPITO=$'Con l\'editor nano crea il file spesa.txt con tre righe: pane, latte e uova. Salva ed esci.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'nano spesa.txt\n(scrivi pane, Invio, latte, Invio, uova)\nCtrl+O, poi Invio: salva\nCtrl+X: esce'
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
    t3.3-13)
        TITOLO=$'Aggiungere una riga con nano'
        COMPITO=$'Apri amici.txt con nano e aggiungi in fondo la riga Sara. Esci con Ctrl+X e, quando nano lo chiede, salva.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'nano amici.txt\n(con le frecce vai sulla riga vuota in fondo e scrivi Sara)\nCtrl+X, poi S: salva\nInvio: conferma il nome del file'
        cartella documenti
        cartella foto
        cartella progetti
        file amici.txt 644 4320 $'Marco\nGiulia\n'
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-14)
        TITOLO=$'Il primo file con vi'
        COMPITO=$'Con l\'editor vi crea il file promemoria.txt con due righe: prima riga e seconda riga. Salva ed esci.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'vi promemoria.txt\ni (modo inserimento)\n(scrivi prima riga, Invio, seconda riga)\nEsc (torna ai comandi)\n:wq, poi Invio: salva ed esce'
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
    t3.3-15)
        TITOLO=$'Togliere una riga con vi'
        COMPITO=$'Con vi togli da elenco.txt la riga due, poi salva ed esci.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'vi elenco.txt\nj (scende sulla riga due)\ndd (cancella la riga)\n:wq, poi Invio: salva ed esce'
        cartella documenti
        cartella foto
        cartella progetti
        file documenti/lettera.txt 644 1440 $'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
        file documenti/spesa.txt 644 120 $'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
        file elenco.txt 644 4320 $'uno\ndue\ntre\n'
        file foto/mare.jpg 644 14400 $'JPEG mare\n'
        file foto/montagna.jpg 644 12960 $'JPEG montagna\n'
        file note.txt 644 300 $'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
        data progetti 755 4320
        data foto 755 4320
        data documenti 755 4320
        ;;
    t3.3-16)
        TITOLO=$'Uno script scritto con vim'
        COMPITO=$'Con vim scrivi lo script ciao.sh: la prima riga è #!/bin/bash, la seconda echo Ciao dallo script. Poi rendilo eseguibile e avvialo.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'vim ciao.sh\ni, poi le due righe: #!/bin/bash e echo Ciao dallo script\nEsc, :wq e Invio\nchmod u+x ciao.sh\n./ciao.sh'
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
    t4.3-01)
        TITOLO=$'I processi del terminale'
        COMPITO=$'Mostra i processi che stai usando in questo terminale.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ps'
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
    t4.3-02)
        TITOLO=$'Tutti i processi'
        COMPITO=$'Mostra tutti i processi del sistema, di tutti gli utenti, con il nome dell\'utente di ognuno.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ps aux'
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
    t4.3-03)
        TITOLO=$'Trova un processo'
        COMPITO=$'Dall\'elenco di tutti i processi tieni solo le righe che contengono sshd, il server per collegarsi da remoto.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ps aux | grep sshd'
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
    t4.3-04)
        TITOLO=$'Quanta memoria?'
        COMPITO=$'Mostra quanta memoria RAM e quanto spazio di swap ha il computer, con le unità leggibili (Mi, Gi).'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'free -h'
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
    t4.3-05)
        TITOLO=$'La memoria vista dal kernel'
        COMPITO=$'Il kernel mostra lo stato della memoria in un file dentro /proc. Trova in quel file la riga MemTotal e mostrala.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'grep MemTotal /proc/meminfo'
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
    t4.3-06)
        TITOLO=$'La cartella di un processo'
        COMPITO=$'Ogni processo ha una directory in /proc con il suo PID. Mostra il file status di quella della tua shell.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'cat /proc/$$/status'
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
    t4.3-07)
        TITOLO=$'I messaggi del kernel'
        COMPITO=$'Mostra solo i messaggi del kernel che parlano di dispositivi USB (la parola usb, maiuscola o minuscola).'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo dmesg | grep -i usb'
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
    t4.3-08)
        TITOLO=$'Il registro di sistema'
        COMPITO=$'Mostra le ultime 5 righe del registro di sistema /var/log/syslog.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo tail -n 5 /var/log/syslog'
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
    t4.3-09)
        TITOLO=$'Il kernel sul disco'
        COMPITO=$'Mostra in formato lungo il contenuto della directory dove stanno il kernel di Linux e i file per avviarlo.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ls -l /boot'
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
    t4.3-10)
        TITOLO=$'I dischi sono file'
        COMPITO=$'In Linux anche i dischi compaiono come file, in /dev. Mostra in formato lungo tutti quelli che iniziano con sd.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ls -l /dev/sd*'
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
    t4.4-01)
        TITOLO=$'Il mio indirizzo IP'
        COMPITO=$'Mostra gli indirizzi di rete del computer con il comando ip, e trova l\'indirizzo IPv4 della scheda enp0s3.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ip addr show'
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
    t4.4-02)
        TITOLO=$'Il vecchio ifconfig'
        COMPITO=$'Mostra la configurazione della scheda enp0s3 con il comando storico, quello che c\'era prima di ip.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ifconfig enp0s3'
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
    t4.4-03)
        TITOLO=$'La porta verso Internet'
        COMPITO=$'Mostra la tabella di instradamento con il comando ip, e trova l\'indirizzo del router (il gateway predefinito).'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ip route show'
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
    t4.4-04)
        TITOLO=$'La tabella di route'
        COMPITO=$'Mostra la stessa tabella con il comando storico route, con gli indirizzi in numeri invece che in nomi.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'route -n'
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
    t4.4-05)
        TITOLO=$'Quale server DNS?'
        COMPITO=$'Mostra il file di configurazione che dice al computer a quale server DNS chiedere gli indirizzi dei nomi.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'cat /etc/resolv.conf'
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
    t4.4-06)
        TITOLO=$'Nomi senza DNS'
        COMPITO=$'Nel file dove si scrivono a mano i nomi dei computer della rete, trova la riga del nas e mostrala.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'grep nas /etc/hosts'
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
    t4.4-07)
        TITOLO=$'Il NAS risponde?'
        COMPITO=$'Controlla se il nas è raggiungibile, mandandogli esattamente 3 pacchetti.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ping -c 3 nas'
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
    t4.4-08)
        TITOLO=$'Chiedere al DNS'
        COMPITO=$'Chiedi al server DNS gli indirizzi di www.lpi.org.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'host www.lpi.org'
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
    t4.4-09)
        TITOLO=$'Chi è in ascolto?'
        COMPITO=$'Mostra le porte TCP in ascolto sul computer, con i numeri delle porte invece dei nomi dei servizi.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ss -tln'
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
    t4.4-10)
        TITOLO=$'Gli indirizzi IPv6'
        COMPITO=$'Mostra solo gli indirizzi IPv6 del computer.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ip -6 addr show'
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
    t5.1-01)
        TITOLO=$'Chi sono io?'
        COMPITO=$'Mostra il tuo numero di utente (UID), il tuo gruppo principale e tutti i gruppi di cui fai parte, con un solo comando.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'id'
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
    t5.1-02)
        TITOLO=$'Chi è collegato?'
        COMPITO=$'Mostra gli utenti collegati adesso al computer, con il terminale e l\'ora di accesso.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'who'
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
    t5.1-03)
        TITOLO=$'Che cosa stanno facendo?'
        COMPITO=$'Mostra chi è collegato e che cosa sta facendo, con un comando di una lettera sola.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'w'
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
    t5.1-04)
        TITOLO=$'Gli accessi di luca'
        COMPITO=$'Mostra lo storico degli accessi al computer, ma solo quelli dell\'utente luca.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'last luca'
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
    t5.1-05)
        TITOLO=$'Un utente di sistema'
        COMPITO=$'Mostra la riga dell\'utente www-data in /etc/passwd e guarda il suo ultimo campo: la shell.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'grep www-data /etc/passwd'
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
    t5.1-06)
        TITOLO=$'Dove stanno le password'
        COMPITO=$'Le password cifrate stanno in /etc/shadow. Prova a leggerlo, poi mostra la riga di anna con i permessi dell\'amministratore.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo grep anna /etc/shadow'
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
    t5.1-07)
        TITOLO=$'Che cosa posso fare con sudo?'
        COMPITO=$'Chiedi a sudo che cosa ti permette di fare.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo -l'
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
    t5.1-08)
        TITOLO=$'Diventare luca'
        COMPITO=$'Apri una shell di login come utente luca, in modo da trovarti nella sua home. Poi controlla chi sei.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo su - luca\nwhoami'
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
    t5.1-09)
        TITOLO=$'Un comando come un altro utente'
        COMPITO=$'Leggi il file /home/luca/segreto.txt come se fossi luca, senza diventare root e senza aprire una shell.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo -u luca cat /home/luca/segreto.txt'
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
    t5.1-10)
        TITOLO=$'Il prompt di root'
        COMPITO=$'Apri una shell di login come root con sudo, guarda la directory in cui ti trovi e poi torna ad anna.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo -i\npwd\nexit'
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
    t5.2-01)
        TITOLO=$'Un nuovo utente'
        COMPITO=$'Crea l\'utente luigi in modo che abbia anche la sua directory home in /home.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo useradd -m luigi'
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
    t5.2-02)
        TITOLO=$'Nome completo e shell'
        COMPITO=$'Crea l\'utente sara, con la home, con il nome completo Sara Neri e con la shell /bin/bash (quella predefinita è /bin/sh).'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo useradd -m -c \'Sara Neri\' -s /bin/bash sara'
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
    t5.2-03)
        TITOLO=$'La riga del nuovo utente'
        COMPITO=$'L\'utente luigi è già stato creato. Mostra la sua riga in /etc/passwd e guarda il suo UID: il primo numero libero da 1000 in su.'
        PARTENZA=$''
        PRIMA=$'sudo useradd -m -c \'Luigi Verdi\' -s /bin/bash luigi'
        SOLUZIONE=$'grep luigi /etc/passwd'
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
    t5.2-04)
        TITOLO=$'Il modello delle home'
        COMPITO=$'Mostra tutto il contenuto, compresi i file nascosti, della directory che viene copiata nella home di ogni nuovo utente.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'ls -a /etc/skel'
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
    t5.2-05)
        TITOLO=$'Un gruppo nuovo'
        COMPITO=$'Crea il gruppo progetto.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo groupadd progetto'
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
    t5.2-06)
        TITOLO=$'Aggiungere a un gruppo'
        COMPITO=$'luigi fa già parte del gruppo progetto. Aggiungilo anche al gruppo sviluppo, senza toglierlo da progetto.'
        PARTENZA=$''
        PRIMA=$'sudo groupadd progetto\nsudo useradd -m -G progetto luigi'
        SOLUZIONE=$'sudo usermod -aG sviluppo luigi'
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
    t5.2-07)
        TITOLO=$'Una password per luigi'
        COMPITO=$'luigi non ha ancora una password (account bloccato). Impostagli la password Primavera26 e poi controlla lo stato della password.'
        PARTENZA=$''
        PRIMA=$'sudo useradd -m luigi'
        SOLUZIONE=$'echo \'luigi:Primavera26\' | sudo chpasswd\nsudo passwd -S luigi'
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
    t5.2-08)
        TITOLO=$'Bloccare un account'
        COMPITO=$'luca è in vacanza: blocca la sua password, senza cancellarla, in modo che nessuno possa entrare come luca.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo passwd -l luca'
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
    t5.2-09)
        TITOLO=$'Un utente di sistema'
        COMPITO=$'Crea l\'utente di sistema servizio, per un programma: senza home e con la shell /usr/sbin/nologin, così nessuno può entrare con lui.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'sudo useradd -r -s /usr/sbin/nologin servizio'
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
    t5.2-10)
        TITOLO=$'Eliminare un utente'
        COMPITO=$'L\'utente prova non serve più: eliminalo insieme alla sua directory home.'
        PARTENZA=$''
        PRIMA=$'sudo useradd -m prova'
        SOLUZIONE=$'sudo userdel -r prova'
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
    t5.2-11)
        TITOLO=$'Il numero di un utente'
        COMPITO=$'Mostra solo il numero dell\'utente (UID) di luca, senza il resto.'
        PARTENZA=$''
        PRIMA=$''
        SOLUZIONE=$'id -u luca'
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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
        PRIMA=$''
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

# ---- verifica: gli obiettivi dell'esercizio sul sistema vero ----

FATTI=0
DA_FARE=0
A_OCCHIO=0

fatto() { FATTI=$((FATTI + 1)); printf '  ✓ %s\n' "$1"; }
da_fare() { DA_FARE=$((DA_FARE + 1)); printf '  ✗ %s\n' "$1"; }
occhio() { A_OCCHIO=$((A_OCCHIO + 1)); printf '  ? %s (controlla a occhio)\n' "$1"; }
esito() { if [ "$2" = 0 ]; then fatto "$1"; else da_fare "$1"; fi; }

# Un percorso dell'esercizio: /home/anna diventa la home su cui lavora lo script
percorso() {
    case "$1" in
        /home/anna) printf '%s' "$CASA" ;;
        /home/anna/*) printf '%s' "$CASA${1#/home/anna}" ;;
        *) printf '%s' "$1" ;;
    esac
}

controlla_cwd() {
    [ "$(pwd -P)" = "$(cd "$(percorso "$2")" 2>/dev/null && pwd -P)" ]
    esito "$1" $?
}

controlla_utente_shell() {
    [ "$(id -un)" = "$2" ]
    esito "$1" $?
}

# Una variabile esportata: lpi-esercizio la riceve dalla shell (quelle non esportate non le vede)
controlla_variabile() {
    [ "$(printenv "$2")" = "$3" ]
    esito "$1" $?
}

# Il PATH: deve finire con la directory aggiunta, e contenere ancora /usr/bin
controlla_path() {
    case ":$PATH:" in
        *:/usr/bin:*) case "$PATH" in *:"$2") esito "$1" 0; return ;; esac ;;
    esac
    esito "$1" 1
}

# controlla_file TESTO PERCORSO [tipo=dir|file|link|absent] [contenuto=...] [permessi=644]
#   [contenutocome=COMANDO] [permessiconti=100] [proprietario=...] [destinazione=...] [stessidati=PERCORSO]
#   [archivio=tar|tar.gz|gzip|zip] [contiene=nome,nome]
controlla_file() {
    local testo="$1" file elenco kind="" voce nome
    file="$(percorso "$2")"
    shift 2
    for voce in "$@"; do
        case "$voce" in
            tipo=absent) if [ -e "$file" ] || [ -L "$file" ]; then da_fare "$testo"; return; fi ;;
            tipo=dir) [ -d "$file" ] || { da_fare "$testo"; return; } ;;
            tipo=file) [ -f "$file" ] || { da_fare "$testo"; return; } ;;
            tipo=link) [ -L "$file" ] || { da_fare "$testo"; return; } ;;
            *) [ -e "$file" ] || [ -L "$file" ] || { da_fare "$testo"; return; } ;;
        esac
        case "$voce" in
            contenuto=*) [ "$(cat "$file" 2>/dev/null; printf x)" = "${voce#contenuto=}x" ] || { da_fare "$testo"; return; } ;;
            # Il contenuto che quel comando produce su questo sistema (per esempio i suoi utenti)
            contenutocome=*) [ "$(cat "$file" 2>/dev/null; printf x)" = "$(bash -c "${voce#contenutocome=}" 2>/dev/null; printf x)" ] || { da_fare "$testo"; return; } ;;
            permessi=*) [ "$((8#$(stat -c %a "$file")))" = "$((8#${voce#permessi=}))" ] || { da_fare "$testo"; return; } ;;
            permessiconti=*) [ $((8#$(stat -c %a "$file") & 8#${voce#permessiconti=})) = $((8#${voce#permessiconti=})) ] || { da_fare "$testo"; return; } ;;
            proprietario=*) [ "$(stat -c %U "$file")" = "${voce#proprietario=}" ] || { da_fare "$testo"; return; } ;;
            destinazione=*) [ "$(readlink "$file")" = "${voce#destinazione=}" ] || { da_fare "$testo"; return; } ;;
            stessidati=*) [ "$(stat -c %d:%i "$file")" = "$(stat -c %d:%i "$(percorso "${voce#stessidati=}")" 2>/dev/null)" ] || { da_fare "$testo"; return; } ;;
            archivio=*) kind="${voce#archivio=}" ;;
        esac
    done
    if [ -n "$kind" ]; then
        case "$kind" in
            tar) elenco="$(tar -tf "$file" 2>/dev/null)" && ! gzip -t "$file" 2>/dev/null ;;
            tar.gz) elenco="$(tar -tzf "$file" 2>/dev/null)" ;;
            gzip) gzip -t "$file" 2>/dev/null; elenco="" ;;
            zip) elenco="$(unzip -Z1 "$file" 2>/dev/null)" ;;
        esac || { da_fare "$testo"; return; }
        for voce in "$@"; do
            case "$voce" in
                contiene=*)
                    for nome in $(printf '%s' "${voce#contiene=}" | tr ',' ' '); do
                        printf '%s\n' "$elenco" | sed 's:/$::' | grep -qxF "$nome" || { da_fare "$testo"; return; }
                    done ;;
            esac
        done
    fi
    fatto "$testo"
}

# controlla_account TESTO NOME [esiste=no] [shell=...] [commento=...] [uidsotto=N] [gruppi=a,b]
#   [bloccato=si|no] [password=si]  (lo stato della password si legge solo da root)
controlla_account() {
    local testo="$1" nome="$2" riga voce stato="" gruppo
    shift 2
    riga="$(getent passwd "$nome")"
    for voce in "$@"; do
        if [ "$voce" = esiste=no ]; then esito "$testo" "$([ -z "$riga" ]; echo $?)"; return; fi
    done
    [ -n "$riga" ] || { da_fare "$testo"; return; }
    for voce in "$@"; do
        case "$voce" in
            shell=*) [ "$(printf '%s' "$riga" | cut -d: -f7)" = "${voce#shell=}" ] || { da_fare "$testo"; return; } ;;
            commento=*) [ "$(printf '%s' "$riga" | cut -d: -f5 | cut -d, -f1)" = "${voce#commento=}" ] || { da_fare "$testo"; return; } ;;
            uidsotto=*) [ "$(printf '%s' "$riga" | cut -d: -f3)" -lt "${voce#uidsotto=}" ] || { da_fare "$testo"; return; } ;;
            gruppi=*)
                for gruppo in $(printf '%s' "${voce#gruppi=}" | tr ',' ' '); do
                    id -nG "$nome" | tr ' ' '\n' | grep -qxF "$gruppo" || { da_fare "$testo"; return; }
                done ;;
            bloccato=* | password=*)
                if [ "$(id -u)" != 0 ]; then occhio "$testo: sudo passwd -S $nome"; return; fi
                stato="$(passwd -S "$nome" | cut -d' ' -f2)"
                case "$voce" in
                    bloccato=si) [ "$stato" = L ] || { da_fare "$testo"; return; } ;;
                    bloccato=no) [ "$stato" != L ] || { da_fare "$testo"; return; } ;;
                    password=si) [ "$stato" = P ] || { da_fare "$testo"; return; } ;;
                esac ;;
        esac
    done
    fatto "$testo"
}

controlla_gruppo() {
    local testo="$1" riga
    riga="$(getent group "$2")"
    case "${3:-}" in
        esiste=no) esito "$testo" "$([ -z "$riga" ]; echo $?)" ;;
        gid=*) esito "$testo" "$([ "$(printf '%s' "$riga" | cut -d: -f3)" = "${3#gid=}" ]; echo $?)" ;;
        *) esito "$testo" "$([ -n "$riga" ]; echo $?)" ;;
    esac
}

# Un pacchetto: installato (ii), tolto con la configurazione rimasta (rc) o del tutto assente
controlla_pacchetto() {
    local testo="$1" stato
    stato="$(dpkg-query -W -f='${db:Status-Abbrev}' "$2" 2>/dev/null | tr -d ' ' || true)"
    case "$3" in
        absent) esito "$testo" "$([ -z "$stato" ] || [ "$stato" = un ]; echo $?)" ;;
        *) esito "$testo" "$([ "$stato" = "$3" ]; echo $?)" ;;
    esac
}

verifica_obiettivi() {
    case "$1" in
    t1.2-01)
        occhio $'Compare la riga di nano, con lo stato ii e la versione'
        ;;
    t1.2-02)
        controlla_pacchetto $'Il pacchetto tree è installato' tree ii
        occhio $'tree documenti mostra l\'albero'
        ;;
    t1.2-03)
        occhio $'Nei risultati compare htop'
        ;;
    t1.2-04)
        occhio $'Hai chiesto a dpkg di chi è /usr/bin/nano'
        occhio $'Compare l\'elenco dei file del pacchetto nano'
        ;;
    t1.2-05)
        controlla_pacchetto $'nginx non c\'è più, nemmeno come «rc»' nginx absent
        controlla_file $'/etc/nginx/nginx.conf non c\'è più' /etc/nginx/nginx.conf $'tipo=absent'
        ;;
    t2.1-01)
        occhio $'La variabile CITTA vale Roma'
        occhio $'echo mostra il valore della variabile'
        ;;
    t2.1-02)
        occhio $'Sullo schermo compare Il biglietto costa $5'
        ;;
    t2.1-03)
        controlla_path $'PATH finisce con :/home/anna/bin e contiene ancora /usr/bin' /home/anna/bin
        ;;
    t2.1-04)
        occhio $'Compare la risposta per cd e per cp'
        ;;
    t2.2-01)
        occhio $'Sullo schermo c\'è la pagina di manuale di cp'
        ;;
    t2.2-02)
        occhio $'Compare l\'elenco delle pagine che contengono comprime'
        ;;
    t2.2-03)
        occhio $'Sullo schermo c\'è la pagina PASSWD(5)'
        ;;
    t2.2-04)
        occhio $'mkdir mostra il suo aiuto breve'
        ;;
    t2.2-05)
        occhio $'Compare l\'aiuto di cd'
        ;;
    t2.2-06)
        occhio $'Sullo schermo c\'è il README di tar'
        ;;
    t2.2-07)
        occhio $'locate mostra il percorso di stile.css'
        ;;
    t2.2-08)
        controlla_file $'appena-nato.txt esiste' /home/anna/appena-nato.txt $'tipo=file'
        occhio $'Dopo l\'aggiornamento locate lo trova'
        ;;
    t2.3-01)
        controlla_cwd $'Sei in /home/anna/documenti' /home/anna/documenti
        occhio $'Hai mostrato il percorso con pwd'
        ;;
    t2.3-02)
        occhio $'Nell\'elenco compare .bashrc'
        ;;
    t2.3-03)
        occhio $'L\'elenco arriva fino a stile.css'
        ;;
    t2.3-04)
        controlla_cwd $'Sei in /home/anna/documenti' /home/anna/documenti
        occhio $'Il percorso del comando cd è relativo'
        ;;
    t2.3-05)
        occhio $'Elenco lungo di documenti, dal più recente'
        ;;
    t2.4-01)
        controlla_file $'Esiste viaggi/2027/foto' /home/anna/viaggi/2027/foto $'tipo=dir'
        occhio $'Con un solo comando mkdir'
        ;;
    t2.4-02)
        controlla_file $'bozza.txt non c\'è più' /home/anna/bozza.txt $'tipo=absent'
        controlla_file $'relazione.txt ha il testo della bozza' /home/anna/relazione.txt $'tipo=file' $'contenuto=Prima stesura della relazione.\n'
        ;;
    t2.4-03)
        controlla_file $'foto-backup/mare.jpg esiste' /home/anna/foto-backup/mare.jpg $'tipo=file' $'contenuto=JPEG mare\n'
        controlla_file $'foto è ancora al suo posto' /home/anna/foto/mare.jpg $'tipo=file'
        ;;
    t2.4-04)
        controlla_file $'vecchi non esiste più' /home/anna/vecchi $'tipo=absent'
        ;;
    t2.4-05)
        controlla_file $'Le tre foto sono in foto' /home/anna/foto/Duomo.jpg $'tipo=file'
        controlla_file $'gita.jpg è in foto' /home/anna/foto/gita.jpg $'tipo=file'
        controlla_file $'Nella home non ci sono più .jpg' /home/anna/cena.jpg $'tipo=absent'
        controlla_file $'elenco.txt è rimasto nella home' /home/anna/elenco.txt $'tipo=file'
        ;;
    t2.4-06)
        controlla_file $'report1.txt ... report9.txt eliminati' /home/anna/report5.txt $'tipo=absent'
        controlla_file $'report9.txt eliminato' /home/anna/report9.txt $'tipo=absent'
        controlla_file $'report10.txt è ancora lì' /home/anna/report10.txt $'tipo=file'
        ;;
    t3.1-01)
        controlla_file $'documenti.tar.gz è un archivio tar compresso con gzip con dentro documenti/lettera.txt' /home/anna/documenti.tar.gz $'archivio=tar.gz' $'contiene=documenti/lettera.txt,documenti/spesa.txt'
        ;;
    t3.1-02)
        controlla_file $'C\'è sito/index.html' /home/anna/sito/index.html $'tipo=file' $'contenuto=<h1>Benvenuti</h1>\n'
        controlla_file $'C\'è sito/css/stile.css' /home/anna/sito/css/stile.css $'tipo=file'
        ;;
    t3.1-03)
        occhio $'Compare l\'elenco con lavoro/piano.txt'
        ;;
    t3.1-04)
        controlla_file $'C\'è registro.log.gz, compresso con gzip' /home/anna/registro.log.gz $'archivio=gzip'
        controlla_file $'registro.log non c\'è più' /home/anna/registro.log $'tipo=absent'
        ;;
    t3.1-05)
        controlla_file $'foto.zip contiene foto/mare.jpg e foto/montagna.jpg' /home/anna/foto.zip $'archivio=zip' $'contiene=foto/mare.jpg,foto/montagna.jpg'
        ;;
    t3.2-01)
        occhio $'Compaiono le due righe con ERROR'
        ;;
    t3.2-02)
        occhio $'Compare il numero 3'
        ;;
    t3.2-03)
        controlla_file $'utenti.txt contiene i nomi, uno per riga' /home/anna/utenti.txt $'tipo=file' $'contenutocome=cut -d: -f1 /etc/passwd'
        ;;
    t3.2-04)
        controlla_file $'spesa-ordinata.txt è ordinata e senza doppioni' /home/anna/spesa-ordinata.txt $'tipo=file' $'contenuto=latte\nmele\npane\nuova\n'
        ;;
    t3.2-05)
        controlla_file $'spesa.txt ha le righe di prima più burro' /home/anna/documenti/spesa.txt $'tipo=file' $'contenuto=pane\nlatte\nmele\npane\nuova\nlatte\npane\nburro\n'
        ;;
    t3.2-06)
        occhio $'Compaiono le prime 3 righe'
        ;;
    t3.2-07)
        occhio $'Compare /etc/passwd'
        occhio $'Nessun messaggio di errore sullo schermo'
        ;;
    t3.2-08)
        occhio $'Compare solo la riga di anna'
        ;;
    t3.3-01)
        controlla_file $'saluta.sh contiene le due righe' /home/anna/saluta.sh $'tipo=file' $'contenuto=#!/bin/bash\necho Ciao\n'
        controlla_file $'saluta.sh è eseguibile per il proprietario' /home/anna/saluta.sh $'permessiconti=100'
        ;;
    t3.3-02)
        occhio $'Lo script scrive il suo messaggio'
        controlla_file $'I permessi di orario.sh sono rimasti rw-r--r--' /home/anna/orario.sh $'permessi=644'
        ;;
    t3.3-03)
        controlla_file $'conta.sh è eseguibile per il proprietario' /home/anna/conta.sh $'permessiconti=100'
        occhio $'Lo hai avviato con ./conta.sh e mostra il numero dei file'
        ;;
    t3.3-04)
        controlla_file $'ciao.sh esiste' /home/anna/ciao.sh $'tipo=file'
        occhio $'Avviato con l\'argomento Luca, lo script mostra Ciao, Luca'
        ;;
    t3.3-05)
        occhio $'Lo script conta 2 argomenti e il primo è Mario Rossi'
        ;;
    t3.3-06)
        occhio $'Dopo lo script, echo mostra il suo codice di uscita'
        ;;
    t3.3-07)
        occhio $'Scrivendo solo saluta lo script parte'
        ;;
    t3.3-08)
        occhio $'Il ciclo stampa una riga per ogni foto'
        ;;
    t3.3-09)
        occhio $'Lo script saluta Anna, Luca e Sara'
        ;;
    t3.3-10)
        occhio $'L\'if controlla il file e stampa trovato'
        ;;
    t3.3-11)
        occhio $'Dopo lo script, echo mostra il codice di uscita 2'
        ;;
    t3.3-12)
        controlla_file $'spesa.txt contiene le tre righe' /home/anna/spesa.txt $'contenuto=pane\nlatte\nuova\n'
        occhio $'Hai usato nano'
        ;;
    t3.3-13)
        controlla_file $'amici.txt contiene Marco, Giulia e Sara' /home/anna/amici.txt $'contenuto=Marco\nGiulia\nSara\n'
        occhio $'Hai usato nano'
        ;;
    t3.3-14)
        controlla_file $'promemoria.txt contiene le due righe' /home/anna/promemoria.txt $'contenuto=prima riga\nseconda riga\n'
        occhio $'Hai usato vi (o vim)'
        ;;
    t3.3-15)
        controlla_file $'In elenco.txt restano uno e tre' /home/anna/elenco.txt $'contenuto=uno\ntre\n'
        occhio $'Hai usato vi (o vim)'
        ;;
    t3.3-16)
        controlla_file $'ciao.sh è eseguibile per il proprietario' /home/anna/ciao.sh $'permessiconti=100'
        occhio $'Lo script, avviato, scrive Ciao dallo script'
        ;;
    t4.3-01)
        occhio $'Compare l\'elenco con la tua shell (bash) e il comando stesso'
        ;;
    t4.3-02)
        occhio $'Compaiono anche i processi di root e di luca'
        ;;
    t4.3-03)
        occhio $'Compaiono solo le righe con sshd'
        ;;
    t4.3-04)
        occhio $'free mostra la memoria in Mi e Gi'
        ;;
    t4.3-05)
        occhio $'Compare la riga MemTotal letta da /proc/meminfo'
        ;;
    t4.3-06)
        occhio $'Compare lo stato della shell: Name: bash'
        ;;
    t4.3-07)
        occhio $'Compaiono i messaggi del kernel sull\'USB'
        ;;
    t4.3-08)
        occhio $'Compaiono le ultime 5 righe di syslog'
        ;;
    t4.3-09)
        occhio $'Compare il contenuto di /boot, con vmlinuz'
        ;;
    t4.3-10)
        occhio $'Compaiono sda, le sue partizioni e la chiavetta sdb'
        ;;
    t4.4-01)
        occhio $'Compaiono gli indirizzi, con 192.168.1.50/24'
        ;;
    t4.4-02)
        occhio $'Compaiono indirizzo e maschera di rete di enp0s3'
        ;;
    t4.4-03)
        occhio $'Compare la riga default via 192.168.1.1'
        ;;
    t4.4-04)
        occhio $'route mostra il gateway 192.168.1.1'
        ;;
    t4.4-05)
        occhio $'Compare il contenuto di /etc/resolv.conf'
        ;;
    t4.4-06)
        occhio $'Compare la riga del nas di /etc/hosts'
        ;;
    t4.4-07)
        occhio $'ping manda 3 pacchetti al nas e riceve 3 risposte'
        ;;
    t4.4-08)
        occhio $'Compaiono l\'indirizzo IPv4 e quello IPv6 di www.lpi.org'
        ;;
    t4.4-09)
        occhio $'Compaiono le porte in ascolto, con la 22 di ssh'
        ;;
    t4.4-10)
        occhio $'Compaiono solo righe inet6, con l\'indirizzo fe80::'
        ;;
    t5.1-01)
        occhio $'Compaiono uid, gid e gruppi di anna'
        ;;
    t5.1-02)
        occhio $'Compaiono anna e luca'
        ;;
    t5.1-03)
        occhio $'Compare il programma che sta usando luca'
        ;;
    t5.1-04)
        occhio $'Compaiono solo gli accessi di luca'
        ;;
    t5.1-05)
        occhio $'Compare la riga di www-data, con la shell nologin'
        ;;
    t5.1-06)
        occhio $'Compare la riga di anna di /etc/shadow'
        ;;
    t5.1-07)
        occhio $'sudo mostra i tuoi permessi'
        ;;
    t5.1-08)
        controlla_utente_shell $'Sei l\'utente luca' luca
        controlla_cwd $'Sei nella home di luca' /home/luca
        occhio $'whoami risponde luca'
        ;;
    t5.1-09)
        occhio $'Compare il contenuto di segreto.txt'
        ;;
    t5.1-10)
        occhio $'Hai aperto una shell di login di root'
        occhio $'Con exit sei tornata ad anna'
        ;;
    t5.2-01)
        controlla_account $'L\'utente luigi esiste' luigi
        controlla_file $'C\'è la sua home, /home/luigi, di sua proprietà' /home/luigi $'tipo=dir' $'proprietario=luigi'
        ;;
    t5.2-02)
        controlla_account $'sara esiste, si chiama Sara Neri e usa /bin/bash' sara $'shell=/bin/bash' $'commento=Sara Neri'
        controlla_file $'C\'è la sua home' /home/sara $'tipo=dir' $'proprietario=sara'
        ;;
    t5.2-03)
        occhio $'Compare la riga di luigi, con UID 1002'
        ;;
    t5.2-04)
        occhio $'Compaiono .bashrc e .profile di /etc/skel'
        ;;
    t5.2-05)
        controlla_gruppo $'Il gruppo progetto esiste' progetto
        ;;
    t5.2-06)
        controlla_account $'luigi è sia in progetto sia in sviluppo' luigi $'gruppi=progetto,sviluppo'
        ;;
    t5.2-07)
        controlla_account $'luigi ha una password' luigi $'password=si'
        occhio $'passwd -S mostra lo stato P (password impostata)'
        ;;
    t5.2-08)
        controlla_account $'La password di luca è bloccata' luca $'bloccato=si'
        ;;
    t5.2-09)
        controlla_account $'servizio esiste, con UID sotto 1000 e shell nologin' servizio $'shell=/usr/sbin/nologin' $'uidsotto=1000'
        controlla_file $'Non ha una home' /home/servizio $'tipo=absent'
        ;;
    t5.2-10)
        controlla_account $'L\'utente prova non c\'è più' prova $'esiste=no'
        controlla_file $'Anche la sua home è sparita' /home/prova $'tipo=absent'
        ;;
    t5.2-11)
        occhio $'Compare l\'UID di luca: 1001'
        ;;
    t5.3-01)
        controlla_file $'I permessi di diario.txt sono rw-------' /home/anna/diario.txt $'permessi=600'
        ;;
    t5.3-02)
        controlla_file $'I permessi di backup.sh sono rwxr--r--' /home/anna/backup.sh $'permessi=744'
        ;;
    t5.3-03)
        controlla_file $'I permessi di note.txt sono rw-r-----' /home/anna/note.txt $'permessi=640'
        ;;
    t5.3-04)
        controlla_file $'Il proprietario di condiviso.txt è luca' /home/anna/condiviso.txt $'proprietario=luca'
        ;;
    t5.3-05)
        controlla_file $'Il gruppo può scrivere in progetti' /home/anna/progetti $'permessi=775'
        controlla_file $'Anche in progetti/sito' /home/anna/progetti/sito $'permessi=775'
        controlla_file $'E su progetti/sito/index.html' /home/anna/progetti/sito/index.html $'permessi=664'
        ;;
    t5.4-01)
        controlla_file $'hosts è un link simbolico a /etc/hosts' /home/anna/hosts $'tipo=link' $'destinazione=/etc/hosts'
        ;;
    t5.4-02)
        controlla_file $'promemoria.txt e note.txt sono lo stesso file' /home/anna/promemoria.txt $'stessidati=/home/anna/note.txt'
        ;;
    t5.4-03)
        controlla_file $'/tmp/scambio ha i permessi rwxrwxrwt' /tmp/scambio $'tipo=dir' $'permessi=1777'
        ;;
    t5.4-04)
        occhio $'Compare la riga di /tmp con drwxrwxrwt'
        ;;
    esac
}

verifica() {
    controlla_utente
    local id="${1:-}"
    [ -n "$id" ] || id="$(cat "$CASA/.lpi-esercizio" 2>/dev/null || true)"
    [ -n "$id" ] || errore "Quale esercizio? Preparane uno (lpi-esercizio t2.3-01) oppure scrivi: lpi-esercizio verifica t2.3-01"
    esercizio "$id"
    printf 'Esercizio %s: %s\n\n' "$id" "$TITOLO"
    verifica_obiettivi "$id"
    printf '\n'
    if [ "$DA_FARE" -gt 0 ]; then
        printf 'Obiettivi raggiunti: %s; ancora da fare: %s.' "$FATTI" "$DA_FARE"
    elif [ "$A_OCCHIO" -gt 0 ]; then
        printf 'Tutti gli obiettivi che si possono controllare sono raggiunti (%s).' "$FATTI"
    else
        printf 'Esercizio completato! Tutti gli obiettivi sono raggiunti.'
    fi
    if [ "$A_OCCHIO" -gt 0 ]; then
        printf ' Quelli con ? riguardano che cosa hai visto sullo schermo: confrontalo con lpi-esercizio soluzione %s.' "$id"
    fi
    printf '\n'
    [ "$DA_FARE" = 0 ]
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
    if [ -n "$PRIMA" ]; then
        printf '\nQuesto esercizio parte da utenti o gruppi che non vengono creati da soli.\n'
        printf 'Se non l%shai già fatto, scrivi prima (la password di anna è anna):\n%s\n' "'" "$PRIMA"
    fi
    printf 'Quando hai finito: lpi-esercizio verifica\n'
    printf 'La soluzione: lpi-esercizio soluzione %s\n' "$1"
    # L'esercizio in corso, per lpi-esercizio verifica (è un file nascosto: svuota non lo tocca)
    printf '%s\n' "$1" > "$CASA/.lpi-esercizio"
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
    verifica) verifica "${2:-}" ;;
    soluzione)
        [ -n "${2:-}" ] || errore "Scrivi anche il codice dell'esercizio, per esempio: lpi-esercizio soluzione t2.3-01"
        esercizio "$2"
        printf 'Soluzione dell%sesercizio %s (%s):\n\n%s\n' "'" "$2" "$TITOLO" "$SOLUZIONE"
        ;;
    -h | --help | aiuto)
        sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
        ;;
    *) prepara "$1" ;;
esac
