#!/usr/bin/env python3
# Crea data/exam-010-160.js con gli obiettivi d'esame di Linux Essentials 1.6, presi così come
# sono pubblicati (sono pubblici):
#   - wiki.lpi.org, traduzione italiana degli obiettivi: argomenti, titoli, pesi, descrizione,
#     aree di conoscenza e l'elenco dei file, termini e comandi;
#   - wiki.lpi.org, versione inglese: controllo che pesi e numero di voci coincidano;
#   - learning.lpi.org/it: il link a ogni obiettivo e l'elenco delle sue lezioni in italiano.
#
# Uso: python3 tools/import-objectives.py        (scarica le pagine con curl)
#      python3 tools/import-objectives.py DIR    (usa DIR/wiki-it.html, DIR/wiki.html, DIR/le.html)
# Dopo: node tools/check-data.js
import datetime
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
EXAM = "010-160"
PAGES = {
    "wiki-it.html": "https://wiki.lpi.org/wiki/LinuxEssentials_Objectives_V1.6(IT)",
    "wiki.html": "https://wiki.lpi.org/wiki/Linux_Essentials_Objectives_V1.6",
    "le.html": f"https://learning.lpi.org/it/learning-materials/{EXAM}/",
}


def fetch(name, folder):
    if folder:
        with open(os.path.join(folder, name), encoding="utf-8") as handle:
            return handle.read()
    return subprocess.run(["curl", "-sSf", PAGES[name]], check=True, capture_output=True, text=True).stdout


def clean(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", fragment))).strip()


def parse_wiki(source):
    """Argomenti e obiettivi della pagina della wiki (h3 = argomento, h4 = obiettivo)."""
    body = source[source.index("mw-parser-output"):]
    body = body[:body.index("printfooter")]
    topics = []
    # Ogni h3/h4 con il testo che lo segue fino al titolo successivo
    parts = re.split(r"(<h[34][^>]*>.*?</h[34]>)", body, flags=re.S)
    for index, part in enumerate(parts):
        heading = re.match(r"<h([34])[^>]*>(.*?)</h[34]>", part, re.S)
        if not heading:
            continue
        title = clean(heading.group(2))
        if heading.group(1) == "3":
            match = re.match(r"^(?:Topic|Argomento) (\d+): (.+)$", title)
            if match:
                topics.append({"id": match.group(1), "title": match.group(2), "objectives": []})
            continue
        match = re.match(r"^(\d+\.\d+) (.+) \((?:weight|peso): (\d+)\)$", title)
        if not match or not topics:
            continue
        text = parts[index + 1]
        lists = [[clean(item) for item in re.findall(r"<li>(.*?)</li>", block, re.S)]
                 for block in re.findall(r"<ul>(.*?)</ul>", text, re.S)]
        description = re.search(r"(?:Description|Descrizione)\s*</[^>]+>\s*(?:<[^>]+>\s*)*([^<]+)", text)
        topics[-1]["objectives"].append({
            "id": match.group(1), "title": match.group(2), "weight": int(match.group(3)),
            "description": clean(description.group(1)) if description else "",
            "areas": lists[0] if lists else [],
            "terms": lists[1] if len(lists) > 1 else [],
        })
    return topics


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else None
    topics = parse_wiki(fetch("wiki-it.html", folder))
    english = parse_wiki(fetch("wiki.html", folder))
    index = fetch("le.html", folder)

    # Controlli: stessi obiettivi, pesi e numero di voci della versione inglese
    flat = [obj for topic in topics for obj in topic["objectives"]]
    flat_en = [obj for topic in english for obj in topic["objectives"]]
    if len(topics) != 5 or len(flat) != 19:
        sys.exit(f"attesi 5 argomenti e 19 obiettivi, trovati {len(topics)} e {len(flat)}")
    for obj, obj_en in zip(flat, flat_en):
        if (obj["id"], obj["weight"], len(obj["areas"]), len(obj["terms"])) != (obj_en["id"], obj_en["weight"], len(obj_en["areas"]), len(obj_en["terms"])):
            sys.exit(f"{obj['id']}: la traduzione italiana non coincide con gli obiettivi in inglese")
        if not obj["description"] or not obj["areas"] or not obj["terms"]:
            sys.exit(f"{obj['id']}: descrizione, aree o termini mancanti")
    if sum(obj["weight"] for obj in flat) != 40:
        sys.exit("la somma dei pesi non è 40")

    base = f"https://learning.lpi.org/it/learning-materials/{EXAM}/"
    for topic in topics:
        for obj in topic["objectives"]:
            obj["url"] = f"{base}{topic['id']}/{obj['id']}/"
            found = sorted(set(re.findall(rf'href="{re.escape(obj["url"])}({re.escape(obj["id"])}_\d\d)/"', index)))
            if not found:
                sys.exit(f"{obj['id']}: nessuna lezione su learning.lpi.org")
            obj["lessons"] = found

    exam = {
        "id": EXAM,
        "name": "Linux Essentials",
        "version": "1.6",
        "questions": 40,
        "minutes": 60,
        "available": "fino ad aprile 2027",
        "url": base,
        "pdf": f"https://learning.lpi.org/pdfstore/LPI-Learning-Material-{EXAM}-it.pdf",
        "objectivesUrl": PAGES["wiki-it.html"],
        "checked": datetime.date.today().isoformat(),
        "topics": topics,
    }
    data = json.dumps(exam, ensure_ascii=False, indent=1)
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    with open(os.path.join(ROOT, "data", f"exam-{EXAM}.js"), "w", encoding="utf-8") as out:
        out.write("// Obiettivi d'esame di Linux Essentials 1.6 (010-160), come li pubblica il Linux Professional\n")
        out.write("// Institute: traduzione italiana della wiki LPI, lezioni da learning.lpi.org/it.\n")
        out.write("// Generato da tools/import-objectives.py: non modificare a mano.\n")
        out.write(f"EXAMS.push({data});\n")
    lessons = sum(len(obj["lessons"]) for obj in flat)
    print(f"{EXAM}: {len(topics)} argomenti, {len(flat)} obiettivi, peso 40, {lessons} lezioni")


main()
