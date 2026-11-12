#!/bin/sh
# Installa Certificazioni LPI dentro un sistema Alpine Linux (per esempio un container LXC di
# Proxmox), come Pipe Dreams (deploy/pipedreams-setup.sh di paselsoft/PipeDreams):
#   - nginx serve l'app in HTTPS con un certificato firmato da una piccola autorità (CA) locale;
#   - l'app viene da GitHub e il sito si prepara con tools/build-site.sh, come per GitHub Pages;
#   - un Linux vero per esercitarsi: bash, i comandi GNU, tar, gzip, bzip2, xz, zip, le pagine
#     man e l'utente anna con nella home gli stessi file del terminale simulato dell'app.
#
# Uso (come root, dentro Alpine):
#   sh certlpi-setup.sh --ip 192.168.1.50 [--https-port 8444] [--repo URL]
#   sh certlpi-setup.sh --aggiorna                     scarica l'ultima versione dell'app
#   sh certlpi-setup.sh --ip NUOVO_IP --certificato    nuovo certificato per un altro indirizzo
#
# --ip è l'indirizzo che scrivi nel browser (in modalità NAT quello di Proxmox, non del container).
# --https-port è la porta che usa il browser: serve per il rimando da http a https.
# Per le prove: CERTLPI_NO_OPENRC=1 avvia nginx senza OpenRC; CERTLPI_SOLO_FUNZIONI=1 con
# «. certlpi-setup.sh» carica solo le funzioni; CERTLPI_DIR e CERTLPI_CONF cambiano le cartelle.
set -eu

REPO="https://github.com/paselsoft/certificazioni-lpi.git"
DIR="${CERTLPI_DIR:-/srv/certlpi}"
CONF="${CERTLPI_CONF:-/etc/certlpi}"
IP=""
HTTPS_PORT="443"
ACTION="installa"

while [ $# -gt 0 ]; do
    case "$1" in
        --ip) IP="$2"; shift 2 ;;
        --https-port) HTTPS_PORT="$2"; shift 2 ;;
        --repo) REPO="$2"; shift 2 ;;
        --aggiorna) ACTION="aggiorna"; shift ;;
        --certificato) ACTION="certificato"; shift ;;
        *) echo "Opzione sconosciuta: $1" >&2; exit 2 ;;
    esac
done

# nginx, openssl e git per l'app; bash e i comandi GNU come nel terminale simulato; gli strumenti
# di archiviazione dell'obiettivo 3.1; shadow per useradd, groupadd e passwd (obiettivo 5.2);
# procps e iproute2-ss per ps e ss veri (4.3, 4.4); le pagine del manuale (2.2): mandoc è il
# comando man, mandoc-apropos aggiunge man -k e apropos, texinfo il comando info, docs la
# documentazione dei pacchetti.
[ -z "${CERTLPI_SOLO_FUNZIONI:-}" ] || ACTION="nessuna"

PACCHETTI="nginx openssl git bash coreutils grep sed findutils diffutils less tar gzip bzip2 xz zip unzip file shadow procps iproute2-ss mandoc mandoc-apropos man-pages texinfo docs"

say() { printf '\033[1;32m==>\033[0m %s\n' "$*"; }

installa_pacchetti() {
    apk update >/dev/null
    # shellcheck disable=SC2086 # l'elenco va diviso in parole
    apk add --no-progress $PACCHETTI >/dev/null
    # Indice di man -k e apropos: si aspetta quello che mandoc rifà da solo, poi lo si rifà
    attesa=0
    while pgrep -x makewhatis >/dev/null 2>&1 && [ "$attesa" -lt 120 ]; do
        sleep 1
        attesa=$((attesa + 1))
    done
    makewhatis >/dev/null 2>&1 || true
}

# Scarica (o aggiorna) il repository e prepara il sito in $DIR/site
aggiorna_app() {
    if [ -d "$DIR/src/.git" ]; then
        say "Aggiorno l'app ($DIR/src)"
        git -C "$DIR/src" pull --ff-only
    else
        say "Scarico l'app da $REPO"
        mkdir -p "$DIR"
        git clone --depth 1 "$REPO" "$DIR/src"
    fi
    bash "$DIR/src/tools/build-site.sh" "$DIR/site.nuovo"
    rm -rf "$DIR/site"
    mv "$DIR/site.nuovo" "$DIR/site"
    say "Versione: $(sed -n 's/^const APP_BUILD = "\(.*\)";/\1/p' "$DIR/site/version.js")"
}

# Autorità locale (una volta sola, dura 10 anni) e certificato del server per IP (825 giorni:
# è il massimo che accettano Safari e macOS per i certificati dei siti)
certificati() {
    [ -n "$IP" ] || { echo "Serve --ip: l'indirizzo che scriverai nel browser" >&2; exit 2; }
    mkdir -p "$CONF"
    chmod 711 "$CONF"
    if [ ! -f "$CONF/ca.key" ]; then
        say "Creo l'autorità di certificazione locale"
        openssl genrsa -out "$CONF/ca.key" 2048 2>/dev/null
        openssl req -x509 -new -key "$CONF/ca.key" -sha256 -days 3650 \
            -subj "/CN=Certificazioni LPI CA locale" \
            -addext "basicConstraints=critical,CA:TRUE" \
            -addext "keyUsage=critical,keyCertSign,cRLSign" \
            -out "$CONF/ca.crt"
    fi
    say "Creo il certificato per $IP"
    cat > "$CONF/server.ext" <<EOF
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = IP:$IP, DNS:lpi, DNS:lpi.local
EOF
    openssl genrsa -out "$CONF/server.key" 2048 2>/dev/null
    openssl req -new -key "$CONF/server.key" -subj "/CN=$IP" -out "$CONF/server.csr"
    openssl x509 -req -in "$CONF/server.csr" -CA "$CONF/ca.crt" -CAkey "$CONF/ca.key" -CAcreateserial \
        -days 825 -sha256 -extfile "$CONF/server.ext" -out "$CONF/server.crt" 2>/dev/null
    rm -f "$CONF/server.csr"
    chmod 644 "$CONF/ca.crt" "$CONF/server.crt"
    chmod 600 "$CONF/ca.key" "$CONF/server.key"
    echo "$IP" > "$CONF/ip"
}

configura_nginx() {
    # shellcheck disable=SC2016 # $host e $request_uri sono variabili di nginx
    if [ "$HTTPS_PORT" = "443" ]; then target='https://$host$request_uri'; else target="https://\$host:$HTTPS_PORT\$request_uri"; fi
    rm -f /etc/nginx/http.d/default.conf
    mkdir -p /etc/nginx/http.d
    cat > /etc/nginx/http.d/certlpi.conf <<EOF
# Certificazioni LPI (creato da certlpi-setup.sh)
server {
    listen 80 default_server;
    # Il certificato dell'autorità locale si scarica anche senza https
    location = /certlpi-ca.crt {
        alias $CONF/ca.crt;
        default_type application/x-x509-ca-cert;
    }
    location / {
        return 301 $target;
    }
}

server {
    listen 443 ssl default_server;
    ssl_certificate $CONF/server.crt;
    ssl_certificate_key $CONF/server.key;
    root $DIR/site;
    index index.html;

    location ~ /\\. {
        deny all;
    }
    location = /certlpi-ca.crt {
        alias $CONF/ca.crt;
        default_type application/x-x509-ca-cert;
    }
    location / {
        # L'app si aggiorna da sola (service worker): niente copie vecchie nella cache
        add_header Cache-Control "no-cache";
        try_files \$uri \$uri/ =404;
    }
}
EOF
    grep -q "webmanifest" /etc/nginx/mime.types || sed -i 's#^}#    application/manifest+json webmanifest;\n}#' /etc/nginx/mime.types
    nginx -t
}

avvia_nginx() {
    if [ -n "${CERTLPI_NO_OPENRC:-}" ]; then
        nginx -s reload 2>/dev/null || nginx
    else
        rc-update add nginx default >/dev/null
        rc-service nginx restart
    fi
}

# Niente «incolla protetta»: passando per la console di Proxmox i suoi segnali arrivano spezzati
incolla_semplice() {
    grep -qs 'enable-bracketed-paste' "$1/.inputrc" || echo 'set enable-bracketed-paste off' >> "$1/.inputrc"
}

# Un file con il suo contenuto, di proprietà di anna, solo se non c'è già
file_di_anna() {
    if [ ! -e "$1" ]; then
        printf '%b' "$2" > "$1"
        chown "anna:$(id -gn anna)" "$1"
    fi
}

# Utenti e file come nel terminale simulato dell'app: si rifanno gli esercizi su un Linux vero
utenti_per_esercitarsi() {
    say "Utenti per esercitarsi: anna (con i file degli esercizi) e luca"
    getent group sviluppo >/dev/null || groupadd sviluppo
    id anna >/dev/null 2>&1 || useradd -m -s /bin/bash -G sviluppo -c "Anna Rossi" anna
    id luca >/dev/null 2>&1 || useradd -m -s /bin/bash -G sviluppo -c "Luca Bianchi" luca
    chmod 750 /home/anna /home/luca
    for d in documenti foto progetti; do
        [ -d "/home/anna/$d" ] || { mkdir "/home/anna/$d"; chown "anna:$(id -gn anna)" "/home/anna/$d"; }
    done
    file_di_anna /home/anna/note.txt 'Ripassare i permessi\nProvare tar e gzip\nLeggere la lezione 3.2\n'
    file_di_anna /home/anna/documenti/lettera.txt 'Gentile Luca,\nti scrivo per la riunione di lunedì.\nA presto,\nAnna\n'
    file_di_anna /home/anna/documenti/spesa.txt 'pane\nlatte\nmele\npane\nuova\nlatte\npane\n'
    file_di_anna /home/anna/foto/mare.jpg 'JPEG mare\n'
    file_di_anna /home/anna/foto/montagna.jpg 'JPEG montagna\n'
    if [ ! -e /var/log/app.log ]; then
        printf '%s\n' "2026-11-12 08:00:01 INFO avvio del servizio" "2026-11-12 08:05:12 WARN disco quasi pieno" \
            "2026-11-12 08:10:30 ERROR connessione al database fallita" "2026-11-12 08:10:31 INFO nuovo tentativo" \
            "2026-11-12 08:10:35 ERROR connessione al database fallita" "2026-11-12 08:11:00 INFO connessione riuscita" \
            "2026-11-12 09:00:00 error utente sconosciuto: mario" > /var/log/app.log
        chmod 644 /var/log/app.log
    fi
    for home in /root /home/anna; do
        printf '%s\n' "PS1='\\[\\e[1;32m\\]\\u@\\h\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]\\\$ '" > "$home/.bashrc"
        printf '[ -f ~/.bashrc ] && . ~/.bashrc\n' > "$home/.bash_profile"
        incolla_semplice "$home"
    done
    chown "anna:$(id -gn anna)" /home/anna/.bashrc /home/anna/.bash_profile /home/anna/.inputrc
}

shell_gnu() {
    say "Shell di root: bash con i comandi GNU"
    sed -i 's#^\(root:.*:\)/bin/sh$#\1/bin/bash#' /etc/passwd
    cat > /etc/motd <<'EOF'

  Certificazioni LPI - un Linux vero per esercitarsi per Linux Essentials.
  Per lavorare come negli esercizi dell'app:  su - anna
  (anna ha nella home gli stessi file del terminale simulato). Per tornare root: exit
  Qui ci sono anche le pagine del manuale: man ls, man -k parola, info.

EOF
}

case "$ACTION" in
    nessuna) ;;
    aggiorna)
        say "Aggiorno i pacchetti"
        installa_pacchetti
        aggiorna_app
        ;;
    certificato)
        certificati
        configura_nginx
        avvia_nginx
        ;;
    installa)
        say "Installo i pacchetti"
        installa_pacchetti
        aggiorna_app
        certificati
        configura_nginx
        avvia_nginx
        shell_gnu
        utenti_per_esercitarsi
        say "Fatto."
        ;;
esac
