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

ELENCO=@@ELENCO@@
APP_LOG=@@APP_LOG@@
SEGRETO=@@SEGRETO@@

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
@@BASE@@
}

# esercizio ID: imposta TITOLO, COMPITO, PARTENZA e SOLUZIONE (e, con PREPARA=1, prepara la home)
esercizio() {
    case "$1" in
@@ESERCIZI@@
    *)
        errore "Non conosco l'esercizio «$1». Scrivi lpi-esercizio per vedere l'elenco."
        ;;
    esac
}

a_capo() {
    if command -v fold >/dev/null; then fold -s -w 78; else cat; fi
}

prepara() {
    controlla_utente
    esercizio "$1"
    PREPARA=1
    svuota
    esercizio "$1"
    printf 'Esercizio %s: %s\n\n' "$1" "$TITOLO"
    printf '%s\n' "$COMPITO" | a_capo
    printf '\nLa home di anna è pronta. Per cominciare scrivi: cd %s\n' "${PARTENZA}"
    printf 'La soluzione: lpi-esercizio soluzione %s\n' "$1"
}

inizio() {
    controlla_utente
    PREPARA=1
    svuota
    base
    printf 'La home di anna è come all%sinizio. Scrivi cd per tornarci.\n' "'"
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
