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

# esercizio ID: imposta TITOLO, COMPITO, PARTENZA, PRIMA (i comandi da scrivere prima, con sudo) e
# SOLUZIONE (e, con PREPARA=1, prepara la home)
esercizio() {
    case "$1" in
@@ESERCIZI@@
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
@@VERIFICHE@@
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
