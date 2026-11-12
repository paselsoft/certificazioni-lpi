// Domande per obiettivo (tappa M2): «studia un obiettivo» con le sue domande, una alla volta.
// Tipi, come all'esame vero:
//   single    scelta singola (radio)
//   multiple  scelta multipla, «scegli N» (caselle); giusta solo se sono esatte tutte
//   fill      completamento: si scrive il comando, l'opzione o il nome (answers: le risposte
//             accettate, la prima è quella mostrata; pattern: espressione regolare facoltativa)
// Dopo ogni risposta: giusto o sbagliato, il perché di ogni opzione e il link alla parte della
// lezione ufficiale da ripassare. Le domande sono in questions/<esame>/, scritte da zero.
//
// Nei testi, `così` diventa codice.

const quiz = { session: null };

// Testo con `codice` tra apici inversi: nodi di testo e <code>, mai HTML
function richText(text, tag = "span", className) {
    const node = el(tag, className);
    String(text).split("`").forEach((part, index) => {
        if (!part) return;
        node.appendChild(index % 2 ? el("code", "", part) : document.createTextNode(part));
    });
    return node;
}

const questionsOf = (examId, objectiveId) => QUESTIONS.filter(q => q.exam === examId && q.objective === objectiveId);
const correctCount = question => question.options ? question.options.filter(option => option.ok).length : 1;

function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

// Risposta scritta: spazi in più, il prompt «$ » e le maiuscole (se la domanda lo permette) non contano
function normalizeAnswer(text, question) {
    let value = String(text).trim().replace(/^\$\s+/, "").replace(/\s+/g, " ");
    if (question.anyCase) value = value.toLowerCase();
    return value;
}

// Giusta se è una delle risposte accettate, oppure se corrisponde a pattern (un'espressione
// regolare, per le risposte che si possono scrivere in tanti modi, come le opzioni di tar)
function isRightFill(question, text) {
    const given = normalizeAnswer(text, question);
    return question.answers.some(answer => normalizeAnswer(answer, question) === given)
        || Boolean(question.pattern && new RegExp(question.pattern).test(given));
}

// Esito delle domande di un obiettivo: quante hanno avuto giusta l'ultima risposta
function objectiveQuizStats(examId, objectiveId) {
    const list = questionsOf(examId, objectiveId);
    const answered = list.filter(answerOf);
    return { total: list.length, answered: answered.length, right: answered.filter(q => answerOf(q).result).length };
}

// Link alla lezione (e alla sezione) da ripassare
function reviewLink(exam, question) {
    const [lessonId, heading] = question.ref.split("#");
    const entry = allLessons(exam).find(item => item.id === lessonId);
    const label = `📖 Ripassa: ${entry.objective.id} ${lessonName(entry.objective, entry.index).toLowerCase()}${heading ? `, «${heading}»` : ""}`;
    return link(label, lessonHref(exam, lessonId) + (heading ? `/${encodeURIComponent(heading)}` : ""), "review-link");
}

// ---- Sessione ----

// Una serie di domande: quelle di un obiettivo, oppure (objective null, per il ripasso) quelle
// dell'esame indicate in onlyIds
function startQuiz(exam, objective, onlyIds) {
    const pool = objective ? questionsOf(exam.id, objective.id) : QUESTIONS.filter(q => q.exam === exam.id);
    const list = pool.filter(q => !onlyIds || onlyIds.includes(q.id));
    quiz.session = {
        kind: objective ? "objective" : "review", exam: exam.id, objective: objective ? objective.id : null,
        questions: shuffle(list).map(q => ({ question: q, options: q.options ? (q.fixed ? q.options.slice() : shuffle(q.options)) : null })),
        index: 0, results: []
    };
}

function renderQuiz(exam, topic, objective) {
    const session = quiz.session;
    if (!session || session.exam !== exam.id || session.objective !== objective.id) startQuiz(exam, objective);
    const page = el("div", "page quiz-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], [`${objective.id} ${objective.title}`, objectiveHref(exam, objective)], ["Domande", null]]));
    const head = el("header", "page-head");
    const title = el("h1");
    title.append(document.createTextNode("Domande: "), el("span", "objective-id", objective.id), document.createTextNode(` ${objective.title}`));
    head.appendChild(title);
    page.appendChild(head);
    const body = el("div", "quiz-body");
    body.id = "quiz-body";
    page.appendChild(body);
    main.appendChild(page);
    if (!quiz.session.questions.length) {
        body.appendChild(el("p", "lead", "Per questo obiettivo non ci sono ancora domande."));
    } else if (quiz.session.index >= quiz.session.questions.length) {
        renderQuizEnd(exam, objective, body);
    } else {
        renderQuestion(exam, objective, body);
    }
    return `Domande ${objective.id} ${objective.title}`;
}

function renderQuestion(exam, objective, body, focus) {
    const session = quiz.session;
    const { question, options } = session.questions[session.index];
    body.innerHTML = "";
    const count = session.questions.length;
    body.appendChild(progressBar(`Domanda ${session.index + 1} di ${count}`, session.index, count));
    // Nel ripasso le domande sono di obiettivi diversi: si dice di quale
    if (!objective) {
        const found = allObjectives(exam).find(item => item.objective.id === question.objective);
        body.appendChild(el("p", "question-objective", `Obiettivo ${found.objective.id}: ${found.objective.title}`));
    }

    const text = richText(question.text, "h2", "question-text");
    text.id = "question-text";
    text.tabIndex = -1;
    body.appendChild(text);
    if (question.code) {
        const wrap = el("div", "question-code");
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "Codice della domanda");
        wrap.appendChild(el("pre", "", question.code));
        body.appendChild(wrap);
    }

    const form = el("form", "question-form");
    form.id = "question-form";
    form.noValidate = true;
    const fieldset = el("fieldset");
    fieldset.setAttribute("aria-describedby", "question-text");
    const choose = correctCount(question);
    const legend = el("legend", "question-legend", question.type === "fill" ? "Scrivi la risposta." : question.type === "multiple" ? `Scegli ${choose} risposte.` : "Scegli una risposta.");
    fieldset.appendChild(legend);
    if (question.type === "fill") {
        const label = el("label", "fill-label", "La tua risposta");
        label.htmlFor = "fill-answer";
        const input = el("input", "fill-input");
        input.id = "fill-answer";
        input.type = "text";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.setAttribute("autocapitalize", "off");
        if (question.placeholder) input.placeholder = question.placeholder;
        fieldset.append(label, input);
    } else {
        const list = el("ul", "options");
        options.forEach((option, index) => {
            const item = el("li");
            const label = el("label", "option");
            const input = document.createElement("input");
            input.type = question.type === "multiple" ? "checkbox" : "radio";
            input.name = "answer";
            input.value = String(index);
            input.id = `option-${index}`;
            label.append(input, richText(option.t, "span", "option-text"));
            item.appendChild(label);
            list.appendChild(item);
        });
        fieldset.appendChild(list);
    }
    form.appendChild(fieldset);
    const message = el("p", "form-message");
    message.id = "form-message";
    message.setAttribute("role", "alert");
    form.appendChild(message);
    const check = el("button", "button primary", "Controlla");
    check.type = "submit";
    check.id = "check";
    form.appendChild(check);
    body.appendChild(form);

    const feedback = el("section", "feedback");
    feedback.id = "feedback";
    feedback.hidden = true;
    feedback.setAttribute("aria-labelledby", "feedback-title");
    body.appendChild(feedback);

    form.onsubmit = event => {
        event.preventDefault();
        if (!feedback.hidden) return;
        let right;
        let chosen = [];
        if (question.type === "fill") {
            const value = form.querySelector("#fill-answer").value;
            if (!value.trim()) {
                message.textContent = "Scrivi una risposta, poi premi Controlla.";
                return;
            }
            right = isRightFill(question, value);
        } else {
            chosen = [...form.querySelectorAll("input:checked")].map(input => Number(input.value));
            if (!chosen.length) {
                message.textContent = question.type === "multiple" ? `Scegli ${choose} risposte, poi premi Controlla.` : "Scegli una risposta, poi premi Controlla.";
                return;
            }
            if (question.type === "multiple" && chosen.length !== choose) {
                message.textContent = `Le risposte giuste sono ${choose}: ne hai scelte ${chosen.length}.`;
                return;
            }
            right = options.every((option, index) => option.ok === chosen.includes(index));
        }
        message.textContent = "";
        const entry = recordAnswer(question, right);
        session.results[session.index] = right;
        form.querySelectorAll("input").forEach(input => { input.disabled = true; });
        check.hidden = true;
        showFeedback(exam, objective, body, feedback, question, options, chosen, right, entry);
    };
    if (focus) text.focus();
}

// Quando la domanda torna nel ripasso, secondo la sua scatola
function returnText(entry) {
    const days = LEITNER_DAYS[entry.box - 1];
    return `🔄 Scatola ${entry.box} di ${LEITNER_DAYS.length}: questa domanda torna nel ripasso ${days === 1 ? "domani" : `fra ${days} giorni`}.`;
}

// La spiegazione di una domanda: per il completamento la risposta giusta e il perché (given: la
// risposta scritta, se va mostrata); per le altre ogni opzione con il suo perché, segnate quelle
// giuste e quelle scelte (chosen: indici in options). La usa anche la simulazione (exam-sim.js).
function explanation(question, options, chosen, given) {
    const box = document.createDocumentFragment();
    if (question.type === "fill") {
        if (given !== undefined) {
            const yours = el("p", "fill-given");
            yours.append(document.createTextNode("La tua risposta: "), given ? el("code", "", given) : el("em", "", "nessuna"));
            box.appendChild(yours);
        }
        const answer = el("p", "fill-solution");
        answer.append(document.createTextNode(question.answers.length > 1 ? "Risposte accettate: " : "Risposta giusta: "));
        question.answers.forEach((item, index) => {
            if (index) answer.append(document.createTextNode(", "));
            answer.append(el("code", "", item));
        });
        box.appendChild(answer);
        box.appendChild(richText(question.why, "p", "why"));
        return box;
    }
    const list = el("ul", "explanations");
    options.forEach((option, index) => {
        const item = el("li", option.ok ? "is-right" : "is-wrong");
        const mark = el("p", "explanation-head");
        mark.append(el("span", "mark", option.ok ? "✓ Giusta" : "✗ Sbagliata"));
        if (chosen.includes(index)) mark.append(el("span", "picked", " (la tua scelta)"));
        mark.append(document.createTextNode(": "), richText(option.t, "span", "option-text"));
        item.append(mark, richText(option.why, "p", "why"));
        list.appendChild(item);
    });
    box.appendChild(list);
    return box;
}

function showFeedback(exam, objective, body, feedback, question, options, chosen, right, entry) {
    feedback.hidden = false;
    feedback.className = `feedback ${right ? "right" : "wrong"}`;
    const title = el("h2", "feedback-title", right ? "✅ Giusto!" : "Non è giusto");
    title.id = "feedback-title";
    title.tabIndex = -1;
    feedback.appendChild(title);
    feedback.appendChild(explanation(question, options, chosen));
    const review = el("p", "review");
    review.appendChild(reviewLink(exam, question));
    if (entry) feedback.appendChild(el("p", "return-text hint", returnText(entry)));
    feedback.appendChild(review);
    const next = el("button", "button primary", quiz.session.index + 1 < quiz.session.questions.length ? "Domanda successiva →" : "Vedi il risultato");
    next.type = "button";
    next.id = "next";
    next.onclick = () => {
        quiz.session.index++;
        if (quiz.session.index >= quiz.session.questions.length) {
            renderQuizEnd(exam, objective, body);
            body.querySelector("h2").focus();
        } else {
            renderQuestion(exam, objective, body, true);
        }
        window.scrollTo(0, 0);
    };
    feedback.appendChild(next);
    title.focus();
}

function renderQuizEnd(exam, objective, body) {
    const session = quiz.session;
    body.innerHTML = "";
    const right = session.results.filter(Boolean).length;
    const total = session.questions.length;
    const title = el("h2", "quiz-result", `Risultato: ${right} giuste su ${total}`);
    title.tabIndex = -1;
    title.id = "quiz-result";
    body.appendChild(title);
    body.appendChild(progressBar(`${Math.round(right / total * 100)}% di risposte giuste`, right, total));
    const list = el("ol", "result-list");
    session.questions.forEach(({ question }, index) => {
        const item = el("li", session.results[index] ? "is-right" : "is-wrong");
        item.append(el("span", "mark", session.results[index] ? "✓ " : "✗ "), richText(question.text, "span"));
        if (!session.results[index]) {
            item.append(document.createTextNode(" "), reviewLink(exam, question));
        }
        list.appendChild(item);
    });
    body.appendChild(list);

    const actions = el("div", "pager");
    const wrong = session.questions.filter((_, index) => !session.results[index]).map(({ question }) => question.id);
    if (wrong.length) {
        const again = el("button", "button primary", wrong.length === 1 ? "Ripeti la sbagliata" : `Ripeti le ${wrong.length} sbagliate`);
        again.type = "button";
        again.id = "retry-wrong";
        again.onclick = () => {
            startQuiz(exam, objective, wrong);
            renderQuestion(exam, objective, body, true);
        };
        actions.appendChild(again);
    }
    if (objective) {
        const restart = el("button", "button", "Ricomincia tutte");
        restart.type = "button";
        restart.id = "restart";
        restart.onclick = () => {
            startQuiz(exam, objective);
            renderQuestion(exam, objective, body, true);
        };
        actions.appendChild(restart);
        actions.appendChild(link(`Obiettivo ${objective.id}`, objectiveHref(exam, objective), "button"));
    } else {
        // Ripasso: altre domande (se ce ne sono ancora per oggi o di nuove), poi la pagina principale
        const { due, fresh } = reviewPlan(exam);
        if (due.length || fresh.length) {
            const more = el("button", "button", due.length ? "Continua il ripasso" : "Altre domande nuove");
            more.type = "button";
            more.id = "review-more";
            more.onclick = () => {
                startReview(exam);
                renderQuestion(exam, null, body, true);
            };
            actions.appendChild(more);
        } else {
            body.appendChild(el("p", "ok", "✅ Per oggi il ripasso è finito: hai risposto a tutte le domande in programma."));
        }
        actions.appendChild(link("Pagina principale", "#/", "button"));
    }
    body.appendChild(actions);
}
