// «Sono pronto?» (#/pronto): un riepilogo per obiettivo che unisce domande, ripasso, simulazioni,
// lezioni ed esercizi al terminale, per capire dove si è deboli e se è ora di prenotare l'esame.
// Non salva niente di nuovo: legge i progressi che ci sono già (store.js).
//
// Per ogni obiettivo conta le domande la cui ULTIMA risposta è giusta, sul totale delle sue
// domande: quelle mai viste contano come non sapute (stima prudente).
//   Solido         almeno l'80% giuste
//   Da rinforzare  dal 50% al 79%
//   Debole         meno del 50%
//   Da iniziare    nessuna risposta
// La stima «se l'esame fosse oggi» è la somma, obiettivo per obiettivo, di peso × parte di domande
// giuste: all'esame ogni obiettivo ha tante domande quanto il suo peso (40 in tutto).
// La soglia vera dell'esame non è pubblica (docs/PIANO.md): l'app consiglia di arrivare all'80%
// nelle domande e al 75% nelle simulazioni, per avere margine.

const READY_SOLID = 0.8;
const READY_FAIR = 0.5;
const READY_SIM_TARGET = 0.75;
const READY_SIMS = 3;
const READY_WEAK = 4;
const READY_QUIZ_SIZE = 10;
const READY_HREF = "#/pronto";
const READY_QUIZ_HREF = "#/pronto/domande";

// I numeri di un obiettivo
function objectiveReadiness(exam, objective, today = todayKey()) {
    const list = questionsOf(exam.id, objective.id);
    const answered = list.filter(answerOf);
    const right = answered.filter(q => answerOf(q).result).length;
    const share = list.length ? right / list.length : 0;
    const exercises = exercisesOf(exam.id, objective.id);
    return {
        objective, total: list.length, answered: answered.length, right, share,
        wrong: answered.length - right,
        due: answered.filter(q => answerOf(q).due <= today).length,
        exercises: exercises.length, practiced: exercises.filter(isPracticeDone).length,
        lessons: objective.lessons.length, read: objective.lessons.filter(id => isRead(exam.id, id)).length,
        level: !answered.length ? "new" : share >= READY_SOLID ? "solid" : share >= READY_FAIR ? "fair" : "weak",
        // Domande d'esame che si possono ancora guadagnare su questo obiettivo
        gain: objective.weight * (1 - share)
    };
}

const READY_LEVELS = { solid: "✓ Solido", fair: "Da rinforzare", weak: "Debole", new: "Da iniziare" };

// Il quadro di tutto l'esame
function examReadiness(exam) {
    const rows = allObjectives(exam).map(({ topic, objective }) => Object.assign(objectiveReadiness(exam, objective), { topic }));
    const weight = totalWeight(exam);
    const total = rows.reduce((sum, row) => sum + row.total, 0);
    const answered = rows.reduce((sum, row) => sum + row.answered, 0);
    const estimate = rows.reduce((sum, row) => sum + row.objective.weight * row.share, 0);
    const sims = progress.simulations.filter(item => item.exam === exam.id).slice(-READY_SIMS);
    const simRight = sims.reduce((sum, item) => sum + item.right, 0);
    const simTotal = sims.reduce((sum, item) => sum + item.total, 0);
    const topics = {};
    sims.forEach(item => Object.keys(item.topics || {}).forEach(id => {
        const sum = topics[id] || (topics[id] = [0, 0]);
        sum[0] += item.topics[id][0];
        sum[1] += item.topics[id][1];
    }));
    // I più deboli: dove si guadagnano più domande d'esame (esclusi quelli già solidi)
    const weak = rows.filter(row => row.level !== "solid").sort((a, b) => b.gain - a.gain).slice(0, READY_WEAK);
    return {
        rows, weak, weight, total, answered, estimate, estimateShare: estimate / weight,
        sims: sims.length, simShare: simTotal ? simRight / simTotal : null, topics
    };
}

// Il giudizio, in parole: mai «supererai l'esame», perché la soglia vera non è pubblica
function readinessVerdict(data) {
    const percent = Math.round(data.estimateShare * 100);
    if (!data.answered) return { level: "new", text: "Non hai ancora risposto a nessuna domanda: comincia dal ripasso di oggi o dalle domande di un obiettivo." };
    if (data.answered < data.total / 2) {
        return { level: "new", text: `È presto per dirlo: hai risposto a ${data.answered} domande su ${data.total}. Le domande mai viste contano come non sapute, quindi la stima salirà man mano che studi.` };
    }
    if (data.estimateShare >= READY_SOLID) {
        if (data.sims >= 2 && data.simShare >= READY_SIM_TARGET) {
            return { level: "solid", text: `✅ Sei a buon punto: la stima è al ${percent}% delle domande e nelle ultime simulazioni hai superato il ${READY_SIM_TARGET * 100}%. Continua con il ripasso fino al giorno dell'esame.` };
        }
        return {
            level: "fair",
            text: data.sims >= 2
                ? `Quasi: le domande le sai (stima al ${percent}%), ma nelle ultime simulazioni sei sotto il ${READY_SIM_TARGET * 100}%. Fai altre simulazioni a tempo e rivedi gli errori.`
                : `Quasi: le domande le sai (stima al ${percent}%). Ora fai almeno due simulazioni d'esame a tempo, per provare anche i 60 minuti.`
        };
    }
    if (data.estimateShare >= 0.6) return { level: "fair", text: `Ci sei quasi: la stima è al ${percent}% delle domande. Lavora sugli obiettivi indicati qui sotto per arrivare all'${READY_SOLID * 100}%.` };
    return { level: "weak", text: `Non ancora: la stima è al ${percent}% delle domande. Parti dagli obiettivi indicati qui sotto: sono quelli che valgono più domande all'esame.` };
}

// Le domande per «Allenati sui punti deboli»: prima le sbagliate, poi le mai viste, poi quelle
// meno consolidate (scatole più basse), dagli obiettivi più deboli
function pickWeakQuestions(exam, size = READY_QUIZ_SIZE) {
    const ids = examReadiness(exam).weak.map(row => row.objective.id);
    const rank = q => {
        const entry = answerOf(q);
        return !entry ? 1 : !entry.result ? 0 : 1 + entry.box;
    };
    return shuffle(QUESTIONS.filter(q => q.exam === exam.id && ids.includes(q.objective)))
        .map(q => ({ q, rank: rank(q) })).sort((a, b) => a.rank - b.rank).slice(0, size).map(item => item.q);
}

function startWeakQuiz(exam) {
    const picked = pickWeakQuestions(exam);
    quiz.session = {
        kind: "weak", exam: exam.id, objective: null, index: 0, results: [],
        questions: picked.map(q => ({ question: q, options: q.options ? (q.fixed ? q.options.slice() : shuffle(q.options)) : null }))
    };
    return picked.length;
}

const percentText = share => `${Math.round(share * 100)}%`;

// Una riga: obiettivo, livello, barra delle domande giuste, dettagli e collegamenti
function readinessItem(exam, row) {
    const { objective } = row;
    const item = el("li", `ready-item ready-${row.level}`);
    item.id = `pronto-${objective.id.replace(".", "-")}`;
    const head = el("p", "ready-head");
    const name = link("", objectiveHref(exam, objective), "ready-name");
    name.append(el("span", "objective-id", objective.id), document.createTextNode(` ${objective.title}`));
    head.append(name, document.createTextNode(" "), el("span", "weight", `peso ${objective.weight}`), document.createTextNode(" "),
        el("span", `ready-level ready-level-${row.level}`, READY_LEVELS[row.level]));
    item.appendChild(head);
    item.appendChild(progressBar(`${objective.id}: domande giuste ${row.right} su ${row.total} (${percentText(row.share)})`, row.right, row.total));
    const facts = [];
    if (row.answered < row.total) facts.push(`mai viste ${row.total - row.answered}`);
    if (row.wrong) facts.push(`sbagliate l'ultima volta ${row.wrong}`);
    if (row.due) facts.push(`da ripassare oggi ${row.due}`);
    facts.push(`lezioni lette ${row.read} su ${row.lessons}`);
    if (row.exercises) facts.push(`esercizi al terminale ${row.practiced} su ${row.exercises}`);
    item.appendChild(el("p", "ready-facts hint", `${facts.join(" · ")}.`));
    const actions = el("p", "ready-actions");
    const questions = link(`Domande ${objective.id}`, quizHref(exam, objective));
    actions.appendChild(questions);
    if (row.exercises) actions.append(document.createTextNode(" · "), link(`Esercizi ${objective.id}`, "#/terminale"));
    item.appendChild(actions);
    return item;
}

// Pagina #/pronto
function renderReadiness(exam) {
    const data = examReadiness(exam);
    const page = el("div", "page ready-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Sono pronto?", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", "Sono pronto?"));
    head.appendChild(el("p", "lead", `Dove sei forte e dove sei debole, obiettivo per obiettivo, per l'esame ${exam.name} ${exam.version}.`));
    page.appendChild(head);

    // Il quadro generale
    const box = el("section", "summary");
    box.id = "ready-summary";
    box.setAttribute("aria-labelledby", "ready-summary-title");
    const title = el("h2", "", "A che punto sei");
    title.id = "ready-summary-title";
    box.appendChild(title);
    const verdict = readinessVerdict(data);
    const verdictText = el("p", `ready-verdict ready-verdict-${verdict.level}`, verdict.text);
    verdictText.id = "ready-verdict";
    box.appendChild(verdictText);
    const estimate = Math.round(data.estimate);
    const estimateBar = progressBar(`Se l'esame fosse oggi: circa ${estimate} domande giuste su ${data.weight} (${percentText(data.estimateShare)})`, data.estimate, data.weight);
    estimateBar.id = "ready-estimate";
    box.appendChild(estimateBar);
    const seen = progressBar(`Domande a cui hai risposto almeno una volta: ${data.answered} su ${data.total}`, data.answered, data.total);
    seen.id = "ready-seen";
    box.appendChild(seen);
    const sims = el("p", "ready-sims");
    sims.id = "ready-sims";
    if (data.sims) {
        sims.append(document.createTextNode(data.sims === 1
            ? `Ultima simulazione d'esame: ${percentText(data.simShare)} di risposte giuste. `
            : `Ultime ${data.sims} simulazioni d'esame: in media ${percentText(data.simShare)} di risposte giuste. `),
        link("Tutte le simulazioni", "#/simulazione"));
    } else {
        sims.append(document.createTextNode("Non hai ancora fatto simulazioni d'esame. "), link("Vai alla simulazione", "#/simulazione"));
    }
    box.appendChild(sims);
    box.appendChild(el("p", "hint", `Come si legge: per ogni obiettivo contano le domande con l'ultima risposta giusta; quelle mai viste contano come non sapute. La stima pesa ogni obiettivo quanto all'esame. È un'indicazione, non una promessa: quante risposte giuste servono davvero non è pubblico, per questo conviene arrivare all'${READY_SOLID * 100}% nelle domande e al ${READY_SIM_TARGET * 100}% nelle simulazioni.`));
    page.appendChild(box);

    // I più deboli
    const weak = el("section", "block ready-weak");
    weak.setAttribute("aria-labelledby", "ready-weak-title");
    const weakTitle = el("h2", "", "Da dove conviene ripartire");
    weakTitle.id = "ready-weak-title";
    weak.appendChild(weakTitle);
    if (data.weak.length) {
        weak.appendChild(el("p", "", "Gli obiettivi dove puoi guadagnare più domande all'esame: contano sia quanto sei indietro sia il peso."));
        const list = el("ol", "ready-weak-list");
        list.id = "ready-weak";
        data.weak.forEach(row => {
            const item = el("li");
            item.append(link(`${row.objective.id} ${row.objective.title}`, READY_HREF),
                document.createTextNode(`: ${READY_LEVELS[row.level].toLowerCase()}, domande giuste ${row.right} su ${row.total}, peso ${row.objective.weight}`));
            // Il collegamento porta alla riga dell'obiettivo, in questa stessa pagina
            item.firstChild.onclick = event => {
                event.preventDefault();
                const target = document.getElementById(`pronto-${row.objective.id.replace(".", "-")}`);
                target.scrollIntoView({ block: "start" });
                target.tabIndex = -1;
                target.focus({ preventScroll: true });
            };
            list.appendChild(item);
        });
        weak.appendChild(list);
        const start = link(`🎯 Allenati sui punti deboli (${Math.min(READY_QUIZ_SIZE, pickWeakQuestions(exam).length)} domande)`, READY_QUIZ_HREF, "button primary");
        start.id = "ready-start";
        // Da qui parte sempre una serie nuova
        start.onclick = () => { quiz.session = null; };
        const startLine = el("p");
        startLine.appendChild(start);
        weak.appendChild(startLine);
        weak.appendChild(el("p", "hint", "Prima le domande sbagliate, poi quelle mai viste, da questi obiettivi. Le risposte entrano nel ripasso come tutte le altre."));
    } else {
        const done = el("p", "ok", "✅ Tutti gli obiettivi sono solidi: continua con il ripasso di oggi e con le simulazioni.");
        done.id = "ready-all-solid";
        weak.appendChild(done);
    }
    page.appendChild(weak);

    // Tutti gli obiettivi, per argomento
    exam.topics.forEach(topic => {
        const section = el("section", "topic");
        const heading = el("h2", "topic-title");
        heading.id = `pronto-argomento-${topic.id}`;
        const rows = data.rows.filter(row => row.topic.id === topic.id);
        const weight = rows.reduce((sum, row) => sum + row.objective.weight, 0);
        heading.append(el("span", "topic-number", `Argomento ${topic.id}`), document.createTextNode(` ${topic.title} `), el("span", "weight", `peso ${weight}`));
        section.setAttribute("aria-labelledby", heading.id);
        section.appendChild(heading);
        const sum = data.topics[topic.id];
        if (sum && sum[1]) {
            const when = data.sims === 1 ? "Nell'ultima simulazione" : `Nelle ultime ${data.sims} simulazioni`;
            section.appendChild(el("p", "ready-topic-sims hint", `${when}: ${sum[0]} giuste su ${sum[1]} (${percentText(sum[0] / sum[1])}).`));
        }
        const list = el("ul", "ready-list");
        rows.forEach(row => list.appendChild(readinessItem(exam, row)));
        section.appendChild(list);
        page.appendChild(section);
    });
    main.appendChild(page);
    return "Sono pronto?";
}

// Pagina #/pronto/domande: una serie di domande dagli obiettivi più deboli
function renderWeakQuiz(exam) {
    const page = el("div", "page quiz-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Sono pronto?", READY_HREF], ["Punti deboli", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", "Allenati sui punti deboli"));
    page.appendChild(head);
    const body = el("div", "quiz-body");
    body.id = "quiz-body";
    page.appendChild(body);
    main.appendChild(page);
    const session = quiz.session;
    if (!session || session.kind !== "weak" || session.exam !== exam.id) startWeakQuiz(exam);
    if (!quiz.session.questions.length) {
        body.appendChild(el("p", "lead", "✅ Non ci sono punti deboli su cui allenarsi: tutti gli obiettivi sono solidi."));
        body.appendChild(link("Sono pronto?", READY_HREF, "button"));
    } else if (quiz.session.index >= quiz.session.questions.length) {
        renderQuizEnd(exam, null, body);
    } else {
        renderQuestion(exam, null, body);
    }
    return "Allenati sui punti deboli";
}
