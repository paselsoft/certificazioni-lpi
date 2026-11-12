#!/usr/bin/env python3
# Importa il testo integrale delle lezioni ufficiali LPI in italiano di Linux Essentials 1.6
# (010-160), per leggerle nell'app anche senza connessione: un file per lezione in
# lessons/010-160/, per esempio lessons/010-160/2.1_01.js. Viene da Pipe Dreams
# (tools/import-lpi-lessons.py), con l'elenco delle lezioni preso da learning.lpi.org.
#
# Le lezioni sono del Linux Professional Institute, con licenza CC BY-NC-ND 4.0: si possono
# condividere senza scopo commerciale, citando la fonte e SENZA MODIFICHE. Per questo lo script
# non tocca il testo: toglie solo l'impaginazione del sito (menu, colonne, classi CSS) e tiene la
# struttura (titoli, paragrafi, elenchi, tabelle, blocchi di codice, note, citazioni). Gli spazi
# fuori dai blocchi di codice si riducono a uno, come fa il browser. Poi controlla che il testo
# sia identico all'originale, carattere per carattere, e i blocchi di codice anche negli spazi.
#
# Uso: python3 tools/import-lpi-lessons.py        (scarica da learning.lpi.org con curl)
#      python3 tools/import-lpi-lessons.py DIR    (usa DIR/le.html e DIR/lessons/1.1_01.html, ...
#                                                  già scaricati)
# Dopo: node tools/check-data.js
import datetime
import html.parser
import json
import os
import re
import subprocess
import sys

EXAM = "010-160"
INDEX_URL = f"https://learning.lpi.org/it/learning-materials/{EXAM}/"
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
INLINE = {"code", "strong", "em", "kbd", "sup", "sub", "cite", "a"}
KEEP = {"h1", "h2", "h3", "h4", "h5", "p", "pre", "ul", "ol", "li", "dl", "dt", "dd", "table", "tr", "th", "td", "blockquote"} | INLINE
VOID = {"col", "br", "img", "input", "meta", "link", "hr"}
NOTES = {"tip": "Suggerimento", "warning": "Attenzione", "important": "Importante", "caution": "Attenzione"}


def lesson_url(lesson):
    objective = lesson.split("_")[0]
    return f"{INDEX_URL}{objective.split('.')[0]}/{objective}/{lesson}/"


def lesson_list(folder):
    """Le lezioni elencate nella pagina dell'esame su learning.lpi.org, in ordine."""
    if folder:
        with open(os.path.join(folder, "le.html"), encoding="utf-8") as handle:
            index = handle.read()
    else:
        index = subprocess.run(["curl", "-sSf", INDEX_URL], check=True, capture_output=True, text=True).stdout
    found = re.findall(rf'href="{re.escape(INDEX_URL)}\d/(\d\.\d)/(\1_\d\d)/"', index)
    lessons = sorted({lesson for _, lesson in found}, key=lambda item: [int(part) for part in re.split(r"[._]", item)])
    if not lessons:
        sys.exit("nessuna lezione trovata su learning.lpi.org")
    return lessons


class Lesson(html.parser.HTMLParser):
    """Albero della lezione: un testo è una stringa, un elemento è [tag, figli...];
    i link sono ["a", href, figli...], le note ["note", "Nota" o "Suggerimento", figli...]."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = ["lesson"]
        self.stack = []      # (tag html, nodo in cui finiscono i figli o None)
        self.inside = False
        self.depth = 0
        self.pre = 0
        self.skip = 0        # dentro la cella con l'icona di una nota

    def current(self):
        for _, node in reversed(self.stack):
            if node is not None:
                return node
        return self.root

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        cls = attrs.get("class", "") or ""
        if not self.inside:
            if tag == "section" and cls == "lesson__content":
                self.inside = True
                self.depth = 1
            return
        if tag in VOID:
            # Gli a capo forzati (per esempio nella firma di una citazione) restano
            if tag == "br" and not self.skip:
                self.current().append(["br"])
            return
        self.depth += 1
        if self.skip:
            self.skip += 1
            self.stack.append((tag, None))
            return
        node = None
        if tag == "div" and cls.startswith("admonitionblock"):
            kind = (cls.split() + [""])[1]
            node = ["note", NOTES.get(kind, "Nota")]
        elif tag == "td" and cls == "icon":
            self.skip = 1
        elif tag == "div" and cls == "title":
            node = ["caption"]
        elif tag == "div" and cls == "attribution":
            node = ["attribution"]
        elif tag == "a":
            href = attrs.get("href", "")
            node = ["a", href if re.match(r"^https?://", href) else ""]
        elif tag in KEEP:
            node = [tag]
        if tag == "pre":
            self.pre += 1
        if node is not None:
            # Le tabelle delle note diventano solo il loro contenuto
            if self.stack and any(n and n[0] == "note" for _, n in self.stack[-1:]) and tag == "table":
                node = None
            elif node[0] in ("tr", "td") and self.in_note():
                node = None
        if node is not None:
            self.current().append(node)
        self.stack.append((tag, node))

    def in_note(self):
        for _, node in reversed(self.stack):
            if node is not None:
                return node[0] == "note"
        return False

    def handle_endtag(self, tag):
        if not self.inside or tag in VOID:
            return
        self.depth -= 1
        if self.depth == 0:
            self.inside = False
            return
        while self.stack:
            open_tag, _ = self.stack.pop()
            if self.skip:
                self.skip -= 1
            if open_tag == "pre":
                self.pre -= 1
            if open_tag == tag:
                break

    def handle_data(self, data):
        if not self.inside or self.skip:
            return
        target = self.current()
        if not self.pre:
            data = re.sub(r"\s+", " ", data)
            if data == " " and target[0] not in INLINE and target[0] not in ("p", "li", "dt", "dd", "td", "th", "caption", "note", "attribution"):
                return
        head = 2 if target[0] in ("a", "note") else 1
        if len(target) > head and isinstance(target[-1], str):
            target[-1] += data
        else:
            target.append(data)


def tidy(node):
    """Toglie gli spazi all'inizio e alla fine dei blocchi (non nel codice) e i nodi vuoti."""
    if isinstance(node, str):
        return node
    head = 2 if node[0] in ("a", "note") else 1
    children = [tidy(child) for child in node[head:]]
    if node[0] not in ("pre", "code") and node[0] not in INLINE:
        if children and isinstance(children[0], str):
            children[0] = children[0].lstrip()
        if children and isinstance(children[-1], str):
            children[-1] = children[-1].rstrip()
    children = [child for child in children if child != "" and not (isinstance(child, list) and child[0] in ("p", "ul", "ol", "dl", "table", "tr") and len(child) == 1)]
    return node[:head] + children


def text_of(node):
    if isinstance(node, str):
        return node
    head = 2 if node[0] in ("a", "note") else 1
    return "".join(text_of(child) for child in node[head:])


def walk(nodes):
    for node in nodes:
        if isinstance(node, list):
            yield node
            yield from walk(node[2 if node[0] in ("a", "note") else 1:])


def fetch(lesson, folder):
    if folder:
        with open(os.path.join(folder, "lessons", f"{lesson}.html"), encoding="utf-8") as handle:
            return handle.read()
    return subprocess.run(["curl", "-sSf", lesson_url(lesson)], check=True, capture_output=True, text=True).stdout


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else None
    today = datetime.date.today().isoformat()
    out_dir = os.path.join(ROOT, "lessons", EXAM)
    os.makedirs(out_dir, exist_ok=True)
    total = 0
    lessons = lesson_list(folder)
    for lesson in lessons:
        source = fetch(lesson, folder)
        parser = Lesson()
        parser.feed(source)
        tree = tidy(parser.root)
        body = tree[1:]
        title = text_of(next(child for child in body if isinstance(child, list) and child[0] == "h1"))
        # Controllo: lo stesso testo dell'originale, carattere per carattere (spazi a parte),
        # e i blocchi di codice identici anche negli spazi
        section = source[source.index('<section class="lesson__content">'):]
        section = section[:section.index("</section>")]
        section = re.sub(r'<td class="icon">.*?</td>', "", section, flags=re.S)
        original = re.sub(r"\s+", "", html.unescape(re.sub(r"<[^>]+>", "", section)))
        if original != re.sub(r"\s+", "", "".join(text_of(child) for child in body)):
            sys.exit(f"{lesson}: il testo estratto è diverso dall'originale")
        blocks = [html.unescape(re.sub(r"<[^>]+>", "", block)) for block in re.findall(r"<pre[^>]*>(.*?)</pre>", section, re.S)]
        if blocks != [text_of(node) for node in walk(body) if node[0] == "pre"]:
            sys.exit(f"{lesson}: un blocco di codice è diverso dall'originale")
        notice = re.search(r'<aside class="lesson__license smallprint">.*?<p>(.*?)</p>', source, re.S)
        notice = re.sub(r"\s+", " ", html.unescape(re.sub(r"<br\s*/?>", "\n", notice.group(1)))).strip()
        data = json.dumps({
            "id": lesson, "exam": EXAM, "objective": lesson.split("_")[0], "title": title, "url": lesson_url(lesson),
            "fetched": today, "notice": notice, "body": body
        }, ensure_ascii=False, separators=(",", ":"))
        with open(os.path.join(out_dir, f"{lesson}.js"), "w", encoding="utf-8") as out:
            out.write("// Lezione ufficiale LPI in italiano, testo integrale e non modificato (licenza CC BY-NC-ND 4.0,\n")
            out.write("// Linux Professional Institute, https://learning.lpi.org). Generato da tools/import-lpi-lessons.py:\n")
            out.write("// non modificare a mano. Si carica quando si apre la lezione (lesson-view.js).\n")
            out.write(f'LPI_LESSONS["{EXAM}/{lesson}"] = {data};\n')
        total += len(data)
    print(f"{len(lessons)} lezioni, {total // 1024} KB: " + ", ".join(lessons))


main()
