// Service worker: l'app e tutte le lezioni funzionano anche senza connessione.
// Alla prima visita salva nel browser i file dell'app e le lezioni di ogni esame (l'elenco viene
// dai dati degli esami, così una lezione nuova entra da sola). Strategia «prima la rete»: online si
// riceve sempre la versione più recente (e la copia salvata si aggiorna), offline si usa la copia.
// Per far installare una nuova versione basta cambiare CACHE.
const CACHE = "certlpi-v7";

importScripts("data/exams.js", "data/exam-010-160.js");

const APP_FILES = [
    "./", "index.html", "style.css", "manifest.webmanifest", "icon.svg",
    "version.js", "data/exams.js", "data/exam-010-160.js", "store.js", "lesson-view.js", "app.js", "sync.js", "quiz.js", "review.js", "exam-sim.js",
    "lib/pipedreams-commands.js", "lib/pipedreams-terminal.js", "shell-sim.js", "shell-commands.js", "exercise-check.js", "practice.js", "exercises/010-160.js",
    "questions/010-160/1.js", "questions/010-160/2.js", "questions/010-160/3.js", "questions/010-160/4.js", "questions/010-160/5.js"
];
const LESSON_FILES = EXAMS.flatMap(exam => exam.topics.flatMap(topic => topic.objectives.flatMap(objective =>
    objective.lessons.map(lesson => `lessons/${exam.id}/${lesson}.js`))));

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES.concat(LESSON_FILES))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
    // Elimina le copie delle versioni precedenti
    event.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
        .then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
    event.respondWith(fetch(request)
        .then(response => {
            if (response.ok) {
                const copy = response.clone();
                caches.open(CACHE).then(cache => cache.put(request, copy));
            }
            return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true })
            .then(found => found || (request.mode === "navigate" ? caches.match("index.html") : undefined))
            .then(found => found || Response.error())));
});
