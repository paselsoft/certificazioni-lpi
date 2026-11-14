// Progressi e preferenze, salvati nel browser (localStorage), con backup in un file.
//
// progress = {
//   studied: { "010-160:2.1": "2026-11-12" },        obiettivi segnati «studiato» (con la data)
//   read:    { "010-160/2.1_01": "2026-11-12" },     lezioni segnate «letta» (con la data)
//   last:    { lesson: "010-160/2.1_01", scroll: 0.4 } ultima lezione aperta e dove si era arrivati
//   answers: { "010-160/2.1-03": { ok: 2, ko: 1, last: "2026-11-12", result: true, box: 2, due: "2026-11-14" } }
//            per ogni domanda: risposte giuste e sbagliate, data e esito dell'ultima risposta,
//            scatola del ripasso (1-5) e giorno in cui torna (vedi «Ripasso» più sotto)
//   simulations: [ { exam: "010-160", date: "2026-11-12", right: 31, total: 40, seconds: 2520,
//                    topics: { "1": [6, 7], ... } } ]   storico delle simulazioni d'esame
//   practice: { "010-160/t2.4-01": "2026-11-12" }    esercizi al terminale completati
//   removed: { "studied|010-160:2.1": "2026-11-14T10:00:00.000Z" }  spunte tolte e quando (per la
//            sincronizzazione: senza, una spunta tolta tornerebbe dagli altri dispositivi)
// Le spunte nuove hanno l'ora esatta (ISO), le risposte anche «at»: con più dispositivi vince
// l'azione più recente (mergeProgress, sync.js).
// }
// Le chiavi contengono il codice dell'esame: i progressi di esami diversi restano separati.

const STORE_KEYS = { progress: "certlpi.progress.v1", settings: "certlpi.settings.v1" };
const BACKUP_APP = "certificazioni-lpi";
const BACKUP_MAX_LENGTH = 1000000;
const TEXT_SIZES = ["normale", "grande", "molto-grande"];

const isPlainObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
const isCount = value => Number.isInteger(value) && value >= 0;
const SIMULATIONS_KEPT = 100;
// Una data (AAAA-MM-GG) oppure un istante preciso (ISO, come 2026-11-14T10:00:00.000Z)
const isStamp = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/.test(value);
const nowStamp = () => new Date().toISOString();
const isDate = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const formatDate = key => key.split("-").reverse().join("/");

// Il giorno (AAAA-MM-GG) che viene n giorni dopo key, nel calendario locale
function addDays(key, days) {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day + days);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Giorni tra due date (b - a)
const dayNumber = key => {
    const [year, month, day] = key.split("-").map(Number);
    return Date.UTC(year, month - 1, day) / 86400000;
};
const daysBetween = (a, b) => dayNumber(b) - dayNumber(a);

// ---- Ripasso (scatole di Leitner) ----
// Ogni domanda a cui hai risposto sta in una scatola da 1 a 5. Risposta giusta: sale di una
// scatola (al massimo la 5). Risposta sbagliata: torna nella 1. La scatola dice dopo quanti
// giorni la domanda torna nel ripasso: le sbagliate tornano presto, le giuste sempre più di rado.
const LEITNER_DAYS = [1, 2, 4, 8, 16];

// Tiene solo i valori con la forma giusta: un salvataggio rovinato o un backup modificato a mano
// non devono bloccare l'app
function cleanProgress(data) {
    const source = isPlainObject(data) ? data : {};
    const pick = (object, validKey) => Object.fromEntries(Object.entries(isPlainObject(object) ? object : {})
        .filter(([key, value]) => validKey.test(key) && isStamp(value)));
    const progress = {
        studied: pick(source.studied, /^[\w.-]+:\d+\.\d+$/),
        read: pick(source.read, /^[\w.-]+\/\d+\.\d+_\d+$/),
        last: null,
        answers: {},
        simulations: [],
        practice: pick(source.practice, /^[\w.-]+\/t\d+\.\d+-\d+$/),
        removed: pick(source.removed, /^(studied\|[\w.-]+:\d+\.\d+|read\|[\w.-]+\/\d+\.\d+_\d+|practice\|[\w.-]+\/t\d+\.\d+-\d+)$/)
    };
    if (Array.isArray(source.simulations)) {
        progress.simulations = source.simulations.filter(item => isPlainObject(item) && typeof item.exam === "string"
            && isDate(item.date) && isCount(item.right) && isCount(item.total) && item.total > 0 && item.right <= item.total
            && isCount(item.seconds) && isPlainObject(item.topics)
            && Object.values(item.topics).every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(isCount) && pair[0] <= pair[1]))
            .map(item => ({ exam: item.exam, date: item.date, right: item.right, total: item.total, seconds: item.seconds, topics: item.topics }))
            .slice(-SIMULATIONS_KEPT);
    }
    Object.entries(isPlainObject(source.answers) ? source.answers : {}).forEach(([key, value]) => {
        if (/^[\w.-]+\/\d+\.\d+-\d+$/.test(key) && isPlainObject(value) && isCount(value.ok) && isCount(value.ko)
            && value.ok + value.ko > 0 && isDate(value.last) && typeof value.result === "boolean") {
            // Le risposte date prima del ripasso (tappa M2) non hanno la scatola: si ricava dall'esito
            const box = Number.isInteger(value.box) && value.box >= 1 && value.box <= LEITNER_DAYS.length ? value.box : value.result ? 2 : 1;
            const due = isDate(value.due) ? value.due : addDays(value.last, LEITNER_DAYS[box - 1]);
            progress.answers[key] = { ok: value.ok, ko: value.ko, last: value.last, result: value.result, box, due };
            if (isStamp(value.at) && value.at.includes("T")) progress.answers[key].at = value.at;
        }
    });
    const last = source.last;
    if (isPlainObject(last) && typeof last.lesson === "string" && /^[\w.-]+\/\d+\.\d+_\d+$/.test(last.lesson)) {
        const scroll = Number(last.scroll);
        progress.last = { lesson: last.lesson, scroll: scroll >= 0 && scroll <= 1 ? scroll : 0 };
    }
    return progress;
}

function readStored(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        return null;
    }
}

function writeStored(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        return false;
    }
}

let progress = cleanProgress(readStored(STORE_KEYS.progress));

function cleanSettings(data) {
    const source = isPlainObject(data) ? data : {};
    return { textSize: TEXT_SIZES.includes(source.textSize) ? source.textSize : "normale" };
}

let settings = cleanSettings(readStored(STORE_KEYS.settings));

// Salva i progressi; con la sincronizzazione collegata, li manda anche su GitHub qualche secondo
// dopo (sync.js). sync false: solo qui (per esempio il punto di lettura della lezione)
function saveProgress(sync = true) {
    const ok = writeStored(STORE_KEYS.progress, progress);
    if (sync && typeof scheduleSync === "function") scheduleSync();
    return ok;
}
const saveSettings = () => writeStored(STORE_KEYS.settings, settings);

const objectiveKey = (examId, objectiveId) => `${examId}:${objectiveId}`;
const lessonKey = (examId, lessonId) => `${examId}/${lessonId}`;

const isStudied = (examId, objectiveId) => Boolean(progress.studied[objectiveKey(examId, objectiveId)]);
const isRead = (examId, lessonId) => Boolean(progress.read[lessonKey(examId, lessonId)]);

// Mette o toglie una spunta (studied, read, practice) registrando quando: con la
// sincronizzazione vince l'azione più recente fra i dispositivi
function setMark(kind, key, value) {
    if (value) {
        if (!progress[kind][key]) progress[kind][key] = nowStamp();
        delete progress.removed[`${kind}|${key}`];
    } else if (progress[kind][key]) {
        delete progress[kind][key];
        progress.removed[`${kind}|${key}`] = nowStamp();
    }
    saveProgress();
}

const setStudied = (examId, objectiveId, value) => setMark("studied", objectiveKey(examId, objectiveId), value);

const isPracticeDone = exercise => Boolean(progress.practice[`${exercise.exam}/${exercise.id}`]);
const setPracticeDone = exercise => setMark("practice", `${exercise.exam}/${exercise.id}`, true);
const setRead = (examId, lessonId, value) => setMark("read", lessonKey(examId, lessonId), value);

// Dove si è arrivati a leggere: vale per questo dispositivo e non si sincronizza
function setLastLesson(examId, lessonId, scroll) {
    progress.last = { lesson: lessonKey(examId, lessonId), scroll: Math.min(1, Math.max(0, scroll || 0)) };
    saveProgress(false);
}

const questionKey = question => `${question.exam}/${question.id}`;
const answerOf = question => progress.answers[questionKey(question)] || null;

// Registra una risposta a una domanda
// Registra una risposta: conteggi, esito e nuova scatola. Restituisce la voce aggiornata.
function recordAnswer(question, right) {
    const key = questionKey(question);
    // Una domanda nuova parte dalla scatola 1: giusta → 2, sbagliata → resta nella 1
    const entry = progress.answers[key] || { ok: 0, ko: 0, box: 1 };
    const box = right ? Math.min(LEITNER_DAYS.length, entry.box + 1) : 1;
    const today = todayKey();
    progress.answers[key] = {
        ok: entry.ok + (right ? 1 : 0), ko: entry.ko + (right ? 0 : 1), last: today, result: right,
        box, due: addDays(today, LEITNER_DAYS[box - 1]), at: nowStamp()
    };
    saveProgress();
    return progress.answers[key];
}

// ---- Unione (sincronizzazione fra dispositivi) ----

// Unisce i progressi di due dispositivi: non si perde niente, e se la stessa cosa è cambiata su
// tutti e due vince la modifica più recente.
//   - spunte (studied, read, practice): ci sono se l'ultima azione è stata metterle;
//   - risposte alle domande: per ogni domanda la più recente, con la sua scatola del ripasso;
//   - simulazioni: tutte, senza doppioni, in ordine di data;
//   - punto di lettura (last): quello di questo dispositivo (a).
function mergeProgress(a, b) {
    const later = (x, y) => (x === undefined ? y : y === undefined ? x : x >= y ? x : y);
    const removed = { ...a.removed };
    Object.entries(b.removed).forEach(([key, when]) => { removed[key] = later(removed[key], when); });
    const merged = { studied: {}, read: {}, practice: {}, removed, last: a.last || b.last, answers: {}, simulations: [] };
    ["studied", "read", "practice"].forEach(kind => {
        new Set([...Object.keys(a[kind]), ...Object.keys(b[kind])]).forEach(key => {
            const marked = later(a[kind][key], b[kind][key]);
            const gone = removed[`${kind}|${key}`];
            // Un istante senza ora (solo la data, dai backup vecchi) vale come inizio del giorno
            if (gone !== undefined && gone >= marked) return;
            merged[kind][key] = marked;
            delete removed[`${kind}|${key}`];
        });
    });
    const answerTime = entry => entry.at || entry.last;
    new Set([...Object.keys(a.answers), ...Object.keys(b.answers)]).forEach(key => {
        const x = a.answers[key];
        const y = b.answers[key];
        merged.answers[key] = !x ? y : !y ? x
            : answerTime(y) > answerTime(x) || (answerTime(y) === answerTime(x) && y.ok + y.ko > x.ok + x.ko) ? y : x;
    });
    const seen = new Set();
    merged.simulations = [...a.simulations, ...b.simulations]
        .filter(item => {
            const id = JSON.stringify(item);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        })
        .map((item, index) => ({ item, index }))
        .sort((x, y) => x.item.date.localeCompare(y.item.date) || x.index - y.index)
        .map(({ item }) => item)
        .slice(-SIMULATIONS_KEPT);
    return merged;
}

// ---- Backup ----

function backupData(data = progress) {
    return { app: BACKUP_APP, version: 1, date: todayKey(), progress: cleanProgress(data) };
}

const backupFileName = () => `certificazioni-lpi-backup-${todayKey()}.json`;

// Legge il contenuto di un file di backup: { progress, date } oppure { error }
function readBackup(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return { error: "Il file è vuoto." };
    if (trimmed.length > BACKUP_MAX_LENGTH) return { error: "Il file è troppo grande per essere un backup." };
    let data;
    try {
        data = JSON.parse(trimmed);
    } catch (e) {
        return { error: "Il file non è un backup di Certificazioni LPI, oppure è danneggiato." };
    }
    if (!isPlainObject(data) || data.app !== BACKUP_APP || !isPlainObject(data.progress)) {
        return { error: "Il file non è un backup di Certificazioni LPI." };
    }
    return { progress: cleanProgress(data.progress), date: isDate(data.date) ? data.date : "" };
}

function replaceProgress(newProgress) {
    progress = cleanProgress(newProgress);
    saveProgress();
}
