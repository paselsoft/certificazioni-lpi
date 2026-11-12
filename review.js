// Ripasso di oggi (tappa M3): una decina di domande scelte con le scatole di Leitner (store.js).
//   1. prima le domande che oggi tornano (scadute), dalla più vecchia e dalla scatola più bassa;
//   2. se c'è posto, domande mai viste: dagli obiettivi che stai studiando (segnati «studiato»
//      o con almeno una lezione letta), altrimenti da tutti, scegliendo l'obiettivo a caso in
//      proporzione al suo peso nell'esame.
// Le domande si mostrano con le schermate di quiz.js.

const REVIEW_SIZE = 10;

// Domande scadute (da ripassare oggi) e mai viste di un esame
function reviewPlan(exam, today = todayKey()) {
    const list = QUESTIONS.filter(q => q.exam === exam.id);
    const due = list.filter(q => answerOf(q) && answerOf(q).due <= today)
        .sort((a, b) => answerOf(a).due.localeCompare(answerOf(b).due) || answerOf(a).box - answerOf(b).box);
    const fresh = list.filter(q => !answerOf(q));
    return { due, fresh, answered: list.length - fresh.length, total: list.length };
}

const isStudying = (exam, objective) => isStudied(exam.id, objective.id) || objective.lessons.some(id => isRead(exam.id, id));

// Le domande del ripasso di oggi (al massimo size): prima le scadute, poi le nuove
function pickReview(exam, size = REVIEW_SIZE) {
    const { due, fresh } = reviewPlan(exam);
    const picked = due.slice(0, size);
    const pools = new Map();
    shuffle(fresh).forEach(q => {
        if (!pools.has(q.objective)) pools.set(q.objective, []);
        pools.get(q.objective).push(q);
    });
    const objectives = allObjectives(exam).map(item => item.objective);
    while (picked.length < size) {
        const open = objectives.filter(objective => pools.has(objective.id) && pools.get(objective.id).length);
        if (!open.length) break;
        const studying = open.filter(objective => isStudying(exam, objective));
        const candidates = studying.length ? studying : open;
        // Un obiettivo a caso, con probabilità proporzionale al peso
        let roll = Math.random() * candidates.reduce((sum, objective) => sum + objective.weight, 0);
        const chosen = candidates.find(objective => (roll -= objective.weight) < 0) || candidates[candidates.length - 1];
        picked.push(pools.get(chosen.id).pop());
    }
    return picked;
}

// Quante domande nelle scatole 1-5
function boxCounts(exam) {
    const counts = LEITNER_DAYS.map(() => 0);
    QUESTIONS.filter(q => q.exam === exam.id && answerOf(q)).forEach(q => { counts[answerOf(q).box - 1]++; });
    return counts;
}

// Il prossimo giorno con domande da ripassare, dopo oggi: { date, count } o null
function nextReview(exam, today = todayKey()) {
    const dates = QUESTIONS.filter(q => q.exam === exam.id && answerOf(q) && answerOf(q).due > today).map(q => answerOf(q).due).sort();
    if (!dates.length) return null;
    return { date: dates[0], count: dates.filter(date => date === dates[0]).length };
}

// «domani», «dopodomani», «fra 5 giorni»
function whenText(date, today = todayKey()) {
    const days = daysBetween(today, date);
    if (days <= 0) return "oggi";
    if (days === 1) return "domani";
    if (days === 2) return "dopodomani";
    return `fra ${days} giorni (${formatDate(date)})`;
}

function startReview(exam) {
    const picked = pickReview(exam);
    quiz.session = {
        kind: "review", exam: exam.id, objective: null, index: 0, results: [],
        questions: picked.map(q => ({ question: q, options: q.options ? (q.fixed ? q.options.slice() : shuffle(q.options)) : null }))
    };
    return picked.length;
}

// Riquadro della pagina principale: quante domande oggi, il pulsante, le scatole
function reviewCard(exam) {
    const { due, fresh, answered } = reviewPlan(exam);
    const box = el("section", "review-card");
    box.id = "review-card";
    box.setAttribute("aria-labelledby", "review-title");
    const title = el("h2", "", "🔄 Ripasso di oggi");
    title.id = "review-title";
    box.appendChild(title);
    const newToday = Math.min(fresh.length, Math.max(0, REVIEW_SIZE - due.length));
    const text = el("p", "review-status");
    text.id = "review-status";
    const start = link("", "#/ripasso", "button primary");
    start.id = "review-start";
    // Da qui parte sempre un ripasso nuovo, se quello di prima è finito
    start.onclick = () => {
        if (quiz.session && quiz.session.kind === "review" && quiz.session.index >= quiz.session.questions.length) quiz.session = null;
    };
    if (due.length) {
        text.textContent = `Da ripassare oggi: ${due.length} ${due.length === 1 ? "domanda" : "domande"}.`
            + (newToday ? ` Con ${newToday} ${newToday === 1 ? "nuova" : "nuove"} si arriva a ${Math.min(REVIEW_SIZE, due.length + newToday)}.` : "");
        start.textContent = `Inizia il ripasso (${Math.min(REVIEW_SIZE, due.length + newToday)} domande)`;
    } else if (fresh.length) {
        text.textContent = answered
            ? "✅ Per oggi niente da ripassare. Se vuoi, prova qualche domanda nuova."
            : "Il ripasso sceglie ogni giorno le domande giuste per te: comincia con qualche domanda nuova.";
        start.textContent = `${newToday} domande nuove`;
    } else {
        text.textContent = "✅ Hai risposto a tutte le domande e per oggi non c'è niente da ripassare.";
        start.hidden = true;
    }
    box.append(text, start);
    const next = !due.length && nextReview(exam);
    if (next) box.appendChild(el("p", "hint", `Prossimo ripasso: ${whenText(next.date)}, ${next.count} ${next.count === 1 ? "domanda" : "domande"}.`));
    if (answered) {
        const counts = boxCounts(exam);
        const list = el("p", "boxes hint");
        list.id = "boxes";
        list.textContent = `Nelle scatole: ${counts.map((count, index) => `${index + 1}ª ${count}`).join(" · ")}. `
            + "Ogni risposta giusta sposta la domanda nella scatola dopo e la fa tornare più tardi (1, 2, 4, 8, 16 giorni); una sbagliata la riporta nella prima.";
        box.appendChild(list);
    }
    return box;
}

// Pagina #/ripasso
function renderReview(exam) {
    const page = el("div", "page quiz-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Ripasso di oggi", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", "Ripasso di oggi"));
    page.appendChild(head);
    const body = el("div", "quiz-body");
    body.id = "quiz-body";
    page.appendChild(body);
    main.appendChild(page);
    const session = quiz.session;
    if (!session || session.kind !== "review" || session.exam !== exam.id) startReview(exam);
    if (!quiz.session.questions.length) {
        body.appendChild(el("p", "lead", "✅ Per oggi non c'è niente da ripassare e hai già visto tutte le domande."));
        const next = nextReview(exam);
        if (next) body.appendChild(el("p", "", `Prossimo ripasso: ${whenText(next.date)}, ${next.count} ${next.count === 1 ? "domanda" : "domande"}.`));
        body.appendChild(link("Pagina principale", "#/", "button"));
    } else if (quiz.session.index >= quiz.session.questions.length) {
        renderQuizEnd(exam, null, body);
    } else {
        renderQuestion(exam, null, body);
    }
    return "Ripasso di oggi";
}
