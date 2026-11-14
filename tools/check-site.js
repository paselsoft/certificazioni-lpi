// Controlla il sito preparato da tools/build-site.sh, prima di pubblicarlo: ci sono tutti i file
// usati da index.html e dal service worker (anche ogni lezione), non ci sono strumenti, test e
// documenti, la versione e il nome della cache del service worker sono stati scritti.
// Uso: node tools/check-site.js _site
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const site = path.resolve(process.argv[2] || "_site");
const problems = [];
const has = file => fs.existsSync(path.join(site, file));

const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const used = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(match => match[1]);
const sw = fs.readFileSync(path.join(site, "sw.js"), "utf8");
const appFiles = JSON.parse(sw.match(/const APP_FILES = (\[[\s\S]*?\]);/)[1]);
// Le lezioni le elenca il service worker dai dati degli esami
const context = vm.createContext({});
for (const file of ["data/exams.js", ...fs.readdirSync(path.join(site, "data")).filter(name => /^exam-/.test(name)).map(name => `data/${name}`)]) {
    vm.runInContext(fs.readFileSync(path.join(site, file), "utf8"), context);
}
const lessons = vm.runInContext("EXAMS.flatMap(exam => exam.topics.flatMap(topic => topic.objectives.flatMap(objective => objective.lessons.map(lesson => `lessons/${exam.id}/${lesson}.js`))))", context);
for (const file of new Set([...used, ...appFiles.filter(file => file !== "./"), ...lessons])) {
    if (!has(file)) problems.push(`manca ${file}`);
}
if (!has("palestra/palestra.sh")) problems.push("manca palestra/palestra.sh");
for (const extra of ["palestra/palestra.template.sh", "tools", "tests", "docs", "deploy", "node_modules", ".git", ".github", "README.md", "CLAUDE.md"]) {
    if (has(extra)) problems.push(`non dovrebbe esserci: ${extra}`);
}
if (/const APP_BUILD = "sviluppo";/.test(fs.readFileSync(path.join(site, "version.js"), "utf8"))) problems.push("version.js: la versione non è stata scritta");
if (/const CACHE = "certlpi-v\d+";/.test(sw)) problems.push("sw.js: il nome della cache non è stato aggiornato");
problems.forEach(problem => console.log(problem));
console.log(`Sito ${site}: ${used.length + appFiles.length + lessons.length} riferimenti controllati, ${problems.length} problemi`);
if (problems.length) process.exit(1);
