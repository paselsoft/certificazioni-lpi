// Controlla il glossario (data/glossary-<esame>.js):
//   - ogni voce ha termine, obiettivo esistente e spiegazione; nessun termine doppio;
//   - ogni obiettivo ha almeno 3 termini;
//   - spiegazioni brevi (al massimo 400 caratteri) e apici inversi chiusi;
//   - nessuna frase copiata dalle lezioni LPI (licenza CC BY-NC-ND: il glossario si scrive da
//     zero): nessuna sequenza di 8 parole uguale a una delle lezioni, come per le domande;
//   - il file è nella pagina e nel service worker.
// Uso: node tools/check-glossary.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const context = vm.createContext({});
const runFile = file => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
runFile("data/exams.js");
const glossaryFiles = [];
for (const file of fs.readdirSync(path.join(root, "data")).sort()) {
    if (/^exam-.+\.js$/.test(file)) runFile(`data/${file}`);
    if (/^glossary-.+\.js$/.test(file)) glossaryFiles.push(`data/${file}`);
}
glossaryFiles.forEach(runFile);
vm.runInContext("var LPI_LESSONS = {};", context);
const EXAMS = vm.runInContext("EXAMS", context);
for (const exam of EXAMS) {
    const dir = path.join(root, "lessons", exam.id);
    if (fs.existsSync(dir)) fs.readdirSync(dir).forEach(file => runFile(`lessons/${exam.id}/${file}`));
}
const GLOSSARY = vm.runInContext("GLOSSARY", context);
const LESSONS = vm.runInContext("LPI_LESSONS", context);

const problems = [];
const COPY_WORDS = 8;
const text = node => typeof node === "string" ? node : node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1).map(text).join(" ");
const words = value => (String(value).toLowerCase().replace(/[’`]/g, "'").match(/[\p{L}\p{N}]+/gu) || []);
const shingles = new Map();
for (const lesson of Object.values(LESSONS)) {
    const list = words(lesson.body.map(text).join(" "));
    for (let i = 0; i + COPY_WORDS <= list.length; i++) shingles.set(list.slice(i, i + COPY_WORDS).join(" "), lesson.id);
}

const seen = new Set();
for (const entry of GLOSSARY) {
    const name = `${entry.exam} «${entry.term}»`;
    const exam = EXAMS.find(item => item.id === entry.exam);
    const objective = exam && exam.topics.flatMap(topic => topic.objectives).find(item => item.id === entry.objective);
    if (typeof entry.term !== "string" || !entry.term.trim()) problems.push(`${name}: termine mancante`);
    if (!objective) problems.push(`${name}: obiettivo ${entry.objective} inesistente`);
    if (typeof entry.text !== "string" || !entry.text.trim()) problems.push(`${name}: spiegazione mancante`);
    else if (entry.text.length > 400) problems.push(`${name}: spiegazione troppo lunga (${entry.text.length} caratteri, al massimo 400)`);
    const key = `${entry.exam}/${String(entry.term).toLowerCase()}`;
    if (seen.has(key)) problems.push(`${name}: termine doppio`);
    seen.add(key);
    for (const piece of [entry.term, entry.text]) {
        if ((String(piece).match(/`/g) || []).length % 2) problems.push(`${name}: apici inversi non chiusi`);
        const list = words(piece);
        for (let i = 0; i + COPY_WORDS <= list.length; i++) {
            const shingle = list.slice(i, i + COPY_WORDS).join(" ");
            if (shingles.has(shingle)) {
                problems.push(`${name}: «${shingle}» è uguale a un passo della lezione ${shingles.get(shingle)}`);
                break;
            }
        }
    }
}
// Copertura: almeno 3 termini per obiettivo, negli esami che hanno un glossario
for (const exam of EXAMS) {
    const own = GLOSSARY.filter(entry => entry.exam === exam.id);
    if (!own.length) continue;
    for (const objective of exam.topics.flatMap(topic => topic.objectives)) {
        const count = own.filter(entry => entry.objective === objective.id).length;
        if (count < 3) problems.push(`${exam.id} ${objective.id}: ${count} termini nel glossario, ne servono almeno 3`);
    }
}
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
for (const file of [...glossaryFiles, "glossary.js"]) {
    if (!html.includes(`src="${file}"`)) problems.push(`index.html: manca ${file}`);
    if (!sw.includes(`"${file}"`)) problems.push(`sw.js: manca ${file}`);
}

problems.forEach(problem => console.log(problem));
console.log(`Glossario: ${GLOSSARY.length} termini in ${glossaryFiles.length} file, ${problems.length} problemi`);
if (problems.length) process.exit(1);
