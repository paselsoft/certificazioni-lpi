// Lettore delle lezioni ufficiali LPI in italiano: il testo integrale e non modificato
// (licenza CC BY-NC-ND 4.0), da leggere anche senza connessione. Viene dal lettore di Pipe Dreams
// (lpi-lesson-view.js). Ogni lezione è un file lessons/<esame>/<lezione>.js, creato da
// tools/import-lpi-lessons.py, che si carica solo quando la si apre. Tutto il testo della lezione
// entra nella pagina con nodi di testo (mai come HTML).

const LPI_LESSONS = {};
const lessonLoading = {};

// Carica il file di una lezione una volta sola; restituisce una Promise con la lezione o null
function loadLesson(examId, lessonId) {
    const key = lessonKey(examId, lessonId);
    if (LPI_LESSONS[key]) return Promise.resolve(LPI_LESSONS[key]);
    if (!lessonLoading[key]) {
        lessonLoading[key] = new Promise(resolve => {
            const script = document.createElement("script");
            script.src = `lessons/${examId}/${lessonId}.js`;
            script.onload = () => resolve(LPI_LESSONS[key] || null);
            script.onerror = () => {
                script.remove();
                delete lessonLoading[key];
                resolve(null);
            };
            document.head.appendChild(script);
        });
    }
    return lessonLoading[key];
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function externalLink(text, href) {
    const link = el("a", "external", text);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener";
    return link;
}

// I tag della lezione che diventano lo stesso elemento HTML
const LESSON_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "p", "pre", "code", "strong", "em", "kbd", "sup", "sub", "cite",
    "ul", "ol", "li", "dl", "dt", "dd", "table", "tr", "th", "td", "blockquote", "br"]);
const NOTE_CLASSES = { Nota: "note", Suggerimento: "tip", Attenzione: "warning", Importante: "warning" };

// Un nodo della lezione (testo o [tag, figli...]) diventato elemento della pagina.
// sections raccoglie i titoli h2 (Introduzione, Esercizi Guidati, ...) per l'indice;
// counts numera tabelle ed esempi di codice (ognuno ha un nome diverso per i lettori di schermo).
function lessonNode(node, sections, counts = { table: 0, pre: 0 }) {
    if (typeof node === "string") return document.createTextNode(node);
    const [tag] = node;
    if (tag === "a") {
        const [, href, ...children] = node;
        const link = href ? externalLink("", href) : el("span");
        children.forEach(child => link.appendChild(lessonNode(child, sections, counts)));
        return link;
    }
    if (tag === "note") {
        const [, label, ...children] = node;
        const box = el("div", `lesson-note lesson-note-${NOTE_CLASSES[label] || "note"}`);
        box.appendChild(el("strong", "lesson-note-label", label));
        children.forEach(child => box.appendChild(lessonNode(child, sections, counts)));
        return box;
    }
    let element;
    if (tag === "caption") element = el("p", "lesson-caption");
    else if (tag === "attribution") element = el("p", "lesson-attribution");
    else if (LESSON_TAGS.has(tag)) element = el(tag);
    else element = el("span");
    node.slice(1).forEach(child => element.appendChild(lessonNode(child, sections, counts)));
    if (tag === "h2") {
        element.id = `sezione-${sections.length + 1}`;
        element.tabIndex = -1;
        sections.push(element);
    }
    // Le tabelle e i blocchi di codice stanno in un contenitore che scorre da solo se serve:
    // la pagina non scorre mai di lato, nemmeno a 320 px
    if (tag === "table" || tag === "pre") {
        const wrap = el("div", tag === "table" ? "lesson-table" : "lesson-pre");
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        counts[tag]++;
        wrap.setAttribute("aria-label", `${tag === "table" ? "Tabella" : "Esempio di codice"} ${counts[tag]}`);
        wrap.appendChild(element);
        return wrap;
    }
    return element;
}

// La lezione come elementi della pagina: { article, sections }
function renderLessonBody(lesson) {
    const sections = [];
    const counts = { table: 0, pre: 0 };
    const article = el("article", "lesson");
    article.lang = "it";
    lesson.body.forEach(node => article.appendChild(lessonNode(node, sections, counts)));
    return { article, sections };
}

// Avviso di licenza e fonte, sotto ogni lezione
function lessonSource(lesson) {
    const source = el("footer", "lesson-source");
    source.append(el("p", "", lesson.notice));
    const info = el("p");
    info.append(document.createTextNode(`Testo integrale e non modificato della lezione ufficiale del Linux Professional Institute, tradotta in italiano dai volontari LPI e copiata da learning.lpi.org il ${formatDate(lesson.fetched)}. `),
        externalLink("Lezione originale", lesson.url), document.createTextNode(" · "),
        externalLink("Licenza CC BY-NC-ND 4.0", "https://creativecommons.org/licenses/by-nc-nd/4.0/deed.it"));
    source.append(info);
    return source;
}
