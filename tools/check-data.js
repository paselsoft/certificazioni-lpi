// Controlla i dati dell'app: esami e obiettivi (data/), lezioni copiate (lessons/) e file usati da
// index.html e dal service worker.
//   - pesi che sommano come all'esame (40 per Linux Essentials), argomenti e obiettivi completi;
//   - ogni lezione dell'obiettivo ha il suo file, del suo obiettivo, con titolo, sezioni, data e
//     avviso di licenza CC BY-NC-ND 4.0, e usa solo elementi che il lettore sa mostrare;
//   - nessun file di lezione fuori dagli obiettivi; i file elencati esistono.
// Uso: node tools/check-data.js            (solo dati)
//      node tools/check-data.js --online   (anche: ogni link risponde; serve la rete)
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const context = vm.createContext({});
const runFile = file => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
runFile("data/exams.js");
for (const file of fs.readdirSync(path.join(root, "data")).filter(name => /^exam-.+\.js$/.test(name))) runFile(`data/${file}`);
vm.runInContext("var LPI_LESSONS = {};", context);
const EXAMS = vm.runInContext("EXAMS", context);
const LESSONS = vm.runInContext("LPI_LESSONS", context);

const problems = [];
const urls = new Set();
const EXPECTED = { "010-160": { weight: 40, topics: 5, objectives: 19 } };
// Elementi che il lettore (lesson-view.js) sa mostrare
const TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "p", "pre", "code", "strong", "em", "kbd", "sup", "sub", "cite",
    "ul", "ol", "li", "dl", "dt", "dd", "table", "tr", "th", "td", "blockquote", "br", "a", "note", "caption", "attribution"]);
const NOTES = new Set(["Nota", "Suggerimento", "Attenzione", "Importante"]);

function walk(nodes, visit) {
    for (const node of nodes) {
        if (typeof node === "string") continue;
        visit(node);
        walk(node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1), visit);
    }
}

let lessonCount = 0;
for (const exam of EXAMS) {
    const expected = EXPECTED[exam.id];
    const objectives = exam.topics.flatMap(topic => topic.objectives);
    const weight = objectives.reduce((sum, item) => sum + item.weight, 0);
    if (!expected) problems.push(`${exam.id}: esame sconosciuto, aggiungilo a EXPECTED`);
    else {
        if (weight !== expected.weight) problems.push(`${exam.id}: pesi ${weight} invece di ${expected.weight}`);
        if (exam.topics.length !== expected.topics) problems.push(`${exam.id}: ${exam.topics.length} argomenti invece di ${expected.topics}`);
        if (objectives.length !== expected.objectives) problems.push(`${exam.id}: ${objectives.length} obiettivi invece di ${expected.objectives}`);
    }
    for (const field of ["name", "version", "url", "pdf", "objectivesUrl", "checked", "available"]) {
        if (!exam[field]) problems.push(`${exam.id}: manca ${field}`);
    }
    urls.add(exam.url).add(exam.pdf).add(exam.objectivesUrl);
    const ids = new Set();
    const dir = path.join(root, "lessons", exam.id);
    for (const topic of exam.topics) {
        if (!topic.title || !topic.objectives.length) problems.push(`${exam.id} argomento ${topic.id}: vuoto`);
        for (const objective of topic.objectives) {
            const name = `${exam.id} ${objective.id}`;
            if (ids.has(objective.id)) problems.push(`${name}: doppio`);
            ids.add(objective.id);
            if (!objective.id.startsWith(`${topic.id}.`)) problems.push(`${name}: non è dell'argomento ${topic.id}`);
            if (!objective.title || !(objective.weight >= 1)) problems.push(`${name}: titolo o peso mancante`);
            if (!objective.description || !objective.areas.length || !objective.terms.length) problems.push(`${name}: descrizione, aree o termini mancanti`);
            if (objective.url !== `${exam.url}${topic.id}/${objective.id}/`) problems.push(`${name}: link non valido ${objective.url}`);
            urls.add(objective.url);
            if (!objective.lessons.length) problems.push(`${name}: nessuna lezione`);
            for (const lessonId of objective.lessons) {
                lessonCount++;
                const file = path.join(dir, `${lessonId}.js`);
                if (!fs.existsSync(file)) { problems.push(`${name}: manca il file della lezione lessons/${exam.id}/${lessonId}.js`); continue; }
                vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
                const lesson = LESSONS[`${exam.id}/${lessonId}`];
                if (!lesson) { problems.push(`${name}: il file della lezione ${lessonId} non la registra`); continue; }
                const label = `${name} lezione ${lessonId}`;
                if (lesson.id !== lessonId || lesson.exam !== exam.id || lesson.objective !== objective.id) problems.push(`${label}: è di un altro obiettivo`);
                if (lesson.url !== `${objective.url}${lessonId}/`) problems.push(`${label}: link non valido ${lesson.url}`);
                if (!/Creative Commons Attribution-NonCommercial-NoDerivatives 4\.0/.test(lesson.notice)) problems.push(`${label}: senza avviso di licenza`);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(lesson.fetched)) problems.push(`${label}: data di copia mancante`);
                const top = lesson.body.filter(node => Array.isArray(node));
                if (top.filter(node => node[0] === "h1").length !== 1) problems.push(`${label}: serve un solo titolo h1`);
                if (top.filter(node => node[0] === "h2").length < 4) problems.push(`${label}: incompleta (meno di 4 sezioni)`);
                walk(lesson.body, node => {
                    if (!TAGS.has(node[0])) problems.push(`${label}: elemento che il lettore non conosce: ${node[0]}`);
                    if (node[0] === "note" && !NOTES.has(node[1])) problems.push(`${label}: nota sconosciuta ${node[1]}`);
                });
                urls.add(lesson.url);
            }
        }
    }
    if (fs.existsSync(dir)) {
        for (const file of fs.readdirSync(dir)) {
            const id = file.replace(/\.js$/, "");
            if (!objectives.some(objective => objective.lessons.includes(id))) problems.push(`lessons/${exam.id}/${file}: non è di nessun obiettivo`);
        }
    }
}

// File usati dalla pagina e dal service worker
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const used = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(match => match[1]);
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
const swFiles = JSON.parse(sw.match(/const APP_FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, "\""));
for (const file of new Set([...used, ...swFiles])) {
    if (file !== "./" && !fs.existsSync(path.join(root, file))) problems.push(`file mancante: ${file}`);
}
for (const file of used) {
    if (!swFiles.includes(file)) problems.push(`sw.js: ${file} non è tra i file salvati per l'uso offline`);
}
for (const file of fs.readdirSync(path.join(root, "data"))) {
    if (!swFiles.includes(`data/${file}`) || !html.includes(`data/${file}`)) problems.push(`data/${file}: manca in index.html o in sw.js`);
    if (/^exam-/.test(file) && !sw.includes(`"data/${file}"`)) problems.push(`sw.js: importScripts senza data/${file}`);
}

async function checkOnline(list) {
    const failed = [];
    for (const url of list) {
        try {
            const response = await fetch(url, { method: url.endsWith(".pdf") ? "HEAD" : "GET", redirect: "follow" });
            if (!response.ok) failed.push(`${response.status} ${url}`);
        } catch (error) {
            failed.push(`errore ${url}: ${error.message}`);
        }
    }
    return failed;
}

(async () => {
    let online = "";
    if (process.argv.includes("--online")) {
        const failed = await checkOnline([...urls]);
        problems.push(...failed.map(line => `link: ${line}`));
        online = `, ${urls.size} link controllati`;
    }
    problems.forEach(problem => console.log(problem));
    const objectives = EXAMS.reduce((sum, exam) => sum + exam.topics.reduce((n, topic) => n + topic.objectives.length, 0), 0);
    console.log(`Dati: ${EXAMS.length} esami, ${objectives} obiettivi, ${lessonCount} lezioni${online}, ${problems.length} problemi`);
    if (problems.length) process.exit(1);
})();
