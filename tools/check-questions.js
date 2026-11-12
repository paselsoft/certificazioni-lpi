// Controlla le domande (questions/<esame>/*.js):
//   - formato: id «obiettivo-numero» unico, obiettivo esistente, tipo, testo, opzioni con il loro
//     perché, risposte giuste (scelta singola: una sola; «scegli N»: almeno 2, non tutte;
//     completamento: almeno una risposta accettata e la spiegazione);
//   - il link alla lezione da ripassare: la lezione esiste e, se c'è, la sezione con quel titolo;
//   - copertura: per ogni obiettivo almeno 6 + 2 × peso domande (peso 1 → 8, peso 4 → 14), con
//     almeno una a scelta multipla e una di completamento;
//   - nessuna frase copiata dalle lezioni LPI (licenza CC BY-NC-ND: le domande si scrivono da
//     zero): nessuna sequenza di 8 parole uguale a una delle lezioni.
// Uso: node tools/check-questions.js [--stats]
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
const questionFiles = [];
for (const exam of EXAMS) {
    const dir = path.join("questions", exam.id);
    if (!fs.existsSync(path.join(root, dir))) continue;
    for (const file of fs.readdirSync(path.join(root, dir)).sort()) {
        questionFiles.push(`${dir}/${file}`);
        runFile(`${dir}/${file}`);
    }
    for (const file of fs.readdirSync(path.join(root, "lessons", exam.id))) runFile(`lessons/${exam.id}/${file}`);
}
const QUESTIONS = vm.runInContext("QUESTIONS", context);

const problems = [];
const COPY_WORDS = 8;
const text = node => typeof node === "string" ? node : node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1).map(text).join(" ");
const plain = node => typeof node === "string" ? node : node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1).map(plain).join("");
const words = value => (String(value).toLowerCase().replace(/[’`]/g, "'").match(/[\p{L}\p{N}]+/gu) || []);

// Tutte le sequenze di COPY_WORDS parole delle lezioni
const lessonShingles = new Map();
for (const lesson of Object.values(LESSONS)) {
    const list = words(lesson.body.map(text).join(" "));
    for (let i = 0; i + COPY_WORDS <= list.length; i++) lessonShingles.set(list.slice(i, i + COPY_WORDS).join(" "), lesson.id);
}

function headingsOf(lesson) {
    const found = [];
    const walk = nodes => nodes.forEach(node => {
        if (typeof node === "string") return;
        if (/^h[2-5]$/.test(node[0])) found.push(plain(node).trim());
        walk(node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1));
    });
    walk(lesson.body);
    return found;
}

const ids = new Set();
const texts = new Set();
const isText = value => typeof value === "string" && value.trim().length > 0;
for (const q of QUESTIONS) {
    const name = `${q.exam} ${q.id}`;
    const exam = EXAMS.find(item => item.id === q.exam);
    const objective = exam && exam.topics.flatMap(topic => topic.objectives).find(item => item.id === q.objective);
    if (!/^\d+\.\d+-\d\d$/.test(q.id)) problems.push(`${name}: id non valido (serve per esempio 2.1-03)`);
    if (ids.has(name)) problems.push(`${name}: id doppio`);
    ids.add(name);
    if (!objective) problems.push(`${name}: obiettivo ${q.objective} inesistente`);
    if (!isText(q.text)) problems.push(`${name}: testo mancante`);
    // Lo stesso testo va bene solo con codice diverso
    const whole = `${q.text}\n${q.code || ""}`;
    if (texts.has(whole)) problems.push(`${name}: stesso testo di un'altra domanda`);
    texts.add(whole);
    if ((String(q.text).match(/`/g) || []).length % 2) problems.push(`${name}: apici inversi non chiusi nel testo`);
    const pieces = [q.text, q.code || "", q.why || ""];
    if (q.type === "single" || q.type === "multiple") {
        if (!Array.isArray(q.options)) { problems.push(`${name}: opzioni mancanti`); continue; }
        const right = q.options.filter(option => option.ok === true).length;
        if (q.type === "single" && (q.options.length < 3 || right !== 1)) problems.push(`${name}: scelta singola con ${q.options.length} opzioni e ${right} giuste`);
        if (q.type === "multiple" && (q.options.length < 4 || right < 2 || right >= q.options.length)) problems.push(`${name}: scelta multipla con ${q.options.length} opzioni e ${right} giuste`);
        const seen = new Set();
        q.options.forEach((option, index) => {
            if (!isText(option.t) || !isText(option.why) || typeof option.ok !== "boolean") problems.push(`${name}: opzione ${index + 1} senza testo, perché o ok`);
            if (seen.has(option.t)) problems.push(`${name}: opzione ripetuta ${option.t}`);
            seen.add(option.t);
            for (const value of [option.t, option.why]) if ((String(value).match(/`/g) || []).length % 2) problems.push(`${name}: apici inversi non chiusi: ${value}`);
            pieces.push(option.t, option.why);
        });
        if (q.answers) problems.push(`${name}: answers vale solo per il completamento`);
    } else if (q.type === "fill") {
        if (!Array.isArray(q.answers) || !q.answers.length || !q.answers.every(isText)) problems.push(`${name}: risposte accettate mancanti`);
        if (!isText(q.why)) problems.push(`${name}: spiegazione mancante`);
        if (q.pattern !== undefined) {
            // Il modello deve accettare tutte le risposte elencate (normalizzate come in quiz.js)
            try {
                const re = new RegExp(q.pattern);
                if (!/^\^.*\$$/.test(q.pattern)) problems.push(`${name}: pattern deve iniziare con ^ e finire con $`);
                for (const answer of q.answers || []) {
                    let value = String(answer).trim().replace(/^\$\s+/, "").replace(/\s+/g, " ");
                    if (q.anyCase) value = value.toLowerCase();
                    if (!re.test(value)) problems.push(`${name}: pattern non accetta la risposta ${answer}`);
                }
                for (const wrong of q.notAccepted || []) if (re.test(wrong)) problems.push(`${name}: pattern accetta la risposta sbagliata ${wrong}`);
            } catch (error) {
                problems.push(`${name}: pattern non valido: ${error.message}`);
            }
        }
        if (q.options) problems.push(`${name}: un completamento non ha opzioni`);
    } else {
        problems.push(`${name}: tipo sconosciuto ${q.type}`);
    }
    // Lezione da ripassare: «2.1_01» oppure «2.1_01#Titolo della sezione»
    const [lessonId, heading] = String(q.ref || "").split("#");
    const lesson = LESSONS[`${q.exam}/${lessonId}`];
    if (!lesson) problems.push(`${name}: lezione da ripassare inesistente ${q.ref}`);
    else if (heading && !headingsOf(lesson).includes(heading)) problems.push(`${name}: nella lezione ${lessonId} non c'è la sezione «${heading}»`);
    // Frasi copiate dalle lezioni
    for (const piece of pieces) {
        const list = words(piece);
        for (let i = 0; i + COPY_WORDS <= list.length; i++) {
            const shingle = list.slice(i, i + COPY_WORDS).join(" ");
            if (lessonShingles.has(shingle)) {
                problems.push(`${name}: «${shingle}» è uguale a un passo della lezione ${lessonShingles.get(shingle)}`);
                break;
            }
        }
    }
}

// Copertura: domande in proporzione al peso, tipi diversi
const stats = [];
for (const exam of EXAMS) {
    for (const objective of exam.topics.flatMap(topic => topic.objectives)) {
        const list = QUESTIONS.filter(q => q.exam === exam.id && q.objective === objective.id);
        const need = 6 + 2 * objective.weight;
        const count = type => list.filter(q => q.type === type).length;
        stats.push(`${exam.id} ${objective.id} (peso ${objective.weight}): ${list.length} domande, ${count("single")} singole, ${count("multiple")} multiple, ${count("fill")} completamenti`);
        if (list.length < need) problems.push(`${exam.id} ${objective.id}: ${list.length} domande, ne servono almeno ${need} (peso ${objective.weight})`);
        if (list.length && (!count("multiple") || !count("fill"))) problems.push(`${exam.id} ${objective.id}: serve almeno una domanda a scelta multipla e una di completamento`);
    }
}

// I file delle domande sono nella pagina e nel service worker
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(root, "sw.js"), "utf8");
for (const file of questionFiles) {
    if (!html.includes(`src="${file}"`)) problems.push(`index.html: manca ${file}`);
    if (!sw.includes(`"${file}"`)) problems.push(`sw.js: manca ${file}`);
}

if (process.argv.includes("--stats")) stats.forEach(line => console.log(line));
problems.forEach(problem => console.log(problem));
console.log(`Domande: ${QUESTIONS.length} in ${questionFiles.length} file, ${problems.length} problemi`);
if (problems.length) process.exit(1);
