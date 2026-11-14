#!/usr/bin/env bash
# Prepara il sito da pubblicare (GitHub Pages o il container Proxmox): solo i file dell'app, senza
# strumenti, test e documenti. Scrive nel sito la versione (commit e data) e dà al service worker
# un nome di cache nuovo, così il browser installa la versione appena pubblicata.
# Uso: bash tools/build-site.sh CARTELLA      (dalla cartella del repository)
set -euo pipefail

out="${1:?indica la cartella del sito, per esempio _site}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

rm -rf "$out"
mkdir -p "$out"
cp index.html style.css manifest.webmanifest icon.svg ./*.js "$out/"
cp -r data lessons questions exercises lib "$out/"
# Lo script per esercitarsi su un Linux vero (senza il modello da cui è generato)
mkdir -p "$out/palestra"
cp palestra/palestra.sh "$out/palestra/"

if git rev-parse --short HEAD >/dev/null 2>&1; then
    sha="$(git rev-parse --short HEAD)"
    build="$sha del $(git log -1 --format=%cd --date=format:%d/%m/%Y)"
else
    sha="locale$(date +%s)"
    build="locale del $(date +%d/%m/%Y)"
fi
sed -i "s|^const APP_BUILD = \"sviluppo\";|const APP_BUILD = \"$build\";|" "$out/version.js"
grep -q "const APP_BUILD = \"$build\";" "$out/version.js"
sed -i "s|^const CACHE = \"certlpi-v[0-9]*\";|const CACHE = \"certlpi-$sha\";|" "$out/sw.js"
grep -q "const CACHE = \"certlpi-$sha\";" "$out/sw.js"
echo "Sito pronto in $out: versione $build"
