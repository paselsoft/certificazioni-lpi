// Simulazione d'esame (tappa M4): 40 domande in 60 minuti, come Linux Essentials 010-160.
//   - Le domande: per ogni obiettivo tante quanto il suo peso (all'esame c'è una domanda per ogni
//     punto di peso), scelte a caso, poi mescolate.
//   - Durante la prova niente spiegazioni: si va avanti e indietro, si cambiano le risposte, si
//     segnano le domande da rivedere; il quadro mostra tutte le 40 domande.
//   - Il tempo conta dall'inizio, anche se si chiude la pagina (la prova è salvata nel browser e si
//     riprende); allo scadere la prova termina da sola.
//   - Alla fine: risposte giuste, soglia di riferimento, risultato per argomento, le domande da
//     rivedere con le spiegazioni. Il risultato va nello storico (progress.simulations, anche nel
//     backup) e le risposte date entrano nelle scatole del ripasso.
// Il punteggio ufficiale va da 200 a 800 e si supera con 500, ma quante risposte giuste servono
// non è pubblico (dipende dalle domande): qui la soglia del 50% è solo un riferimento.

const SIM_KEY = "certlpi.simulation.v1";
const SIM_REFERENCE = 0.5;
const SIM_ANNOUNCE_MINUTES = [10, 5, 1];
const sim = { timer: null, announced: new Set(), confirm: false };

const simLoad = () => {
    const data = readStored(SIM_KEY);
    return isPlainObject(data) && Array.isArray(data.questions) && Number.isFinite(data.deadline) ? data : null;
};
const simSave = data => writeStored(SIM_KEY, data);
const simQuestion = entry => QUESTIONS.find(q => q.exam === entry.exam && q.id === entry.id);
const simOptions = (entry, question) => entry.order ? entry.order.map(index => question.options[index]) : null;

function simAnswered(entry) {
    return Array.isArray(entry.answer) ? entry.answer.length > 0 : String(entry.answer || "").trim() !== "";
}

function simCorrect(question, entry) {
    if (!simAnswered(entry)) return false;
    if (question.type === "fill") return isRightFill(question, entry.answer);
    const right = question.options.map((option, index) => option.ok ? index : -1).filter(index => index >= 0);
    return right.length === entry.answer.length && right.every(index => entry.answer.includes(index));
}

function minutesText(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return minutes ? `${minutes} min${rest ? ` ${rest} s` : ""}` : `${rest} s`;
}

const clockText = ms => {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

// Una prova nuova: per ogni obiettivo tante domande quanto il peso
function simCreate(exam) {
    const picked = allObjectives(exam).flatMap(({ objective }) => shuffle(questionsOf(exam.id, objective.id)).slice(0, objective.weight));
    const started = Date.now();
    const data = {
        exam: exam.id, started, deadline: started + exam.minutes * 60000, index: 0, finished: false,
        questions: shuffle(picked).map(q => ({
            exam: exam.id, id: q.id, flagged: false, answer: q.type === "fill" ? "" : [],
            order: q.options ? (q.fixed ? q.options.map((_, index) => index) : shuffle(q.options.map((_, index) => index))) : null
        }))
    };
    simSave(data);
    sim.announced = new Set();
    sim.confirm = false;
    return data;
}

// Chiude la prova: risultato, storico, scatole del ripasso
function simFinish(exam, data, reason) {
    const ended = Math.min(Date.now(), data.deadline);
    const topics = {};
    exam.topics.forEach(topic => { topics[topic.id] = [0, 0]; });
    let right = 0;
    data.questions.forEach(entry => {
        const question = simQuestion(entry);
        const ok = simCorrect(question, entry);
        const topic = question.objective.split(".")[0];
        topics[topic][1]++;
        if (ok) {
            topics[topic][0]++;
            right++;
        }
        if (simAnswered(entry)) recordAnswer(question, ok);
    });
    const seconds = Math.max(0, Math.round((ended - data.started) / 1000));
    progress.simulations.push({ exam: exam.id, date: todayKey(), right, total: data.questions.length, seconds, topics });
    progress.simulations = progress.simulations.slice(-SIMULATIONS_KEPT);
    saveProgress();
    Object.assign(data, { finished: true, ended, reason, right, seconds, topics });
    simSave(data);
    stopSimulationTimer();
}

function stopSimulationTimer() {
    clearInterval(sim.timer);
    sim.timer = null;
}

// ---- Pagine ----

// Contenitore di una tabella che, su schermi stretti, scorre di lato da sola (anche da tastiera)
function tableWrap(table, label) {
    const wrap = el("div", "table-wrap");
    wrap.tabIndex = 0;
    wrap.setAttribute("role", "region");
    wrap.setAttribute("aria-label", label);
    wrap.appendChild(table);
    return wrap;
}

function simHistory(exam) {
    const list = progress.simulations.filter(item => item.exam === exam.id).slice().reverse();
    if (!list.length) return null;
    const section = el("section", "block");
    section.setAttribute("aria-labelledby", "storico");
    const title = el("h2", "", "Le tue simulazioni");
    title.id = "storico";
    section.appendChild(title);
    const table = el("table", "history");
    table.id = "history";
    const head = el("tr");
    ["Data", "Giuste", "Percentuale", "Tempo"].forEach(text => {
        const th = el("th", "", text);
        th.scope = "col";
        head.appendChild(th);
    });
    const thead = el("thead");
    thead.appendChild(head);
    const tbody = el("tbody");
    list.forEach(item => {
        const row = el("tr");
        const percent = Math.round(item.right / item.total * 100);
        [formatDate(item.date), `${item.right} su ${item.total}`, `${percent}%${percent / 100 >= SIM_REFERENCE ? " ✓" : ""}`, minutesText(item.seconds)]
            .forEach(text => row.appendChild(el("td", "", text)));
        tbody.appendChild(row);
    });
    table.append(thead, tbody);
    section.appendChild(tableWrap(table, "Storico delle simulazioni"));
    if (list.length > 1) {
        const best = Math.max(...list.map(item => Math.round(item.right / item.total * 100)));
        section.appendChild(el("p", "hint", `Il tuo risultato migliore: ${best}%. Il segno ✓ indica i risultati sopra la soglia di riferimento del ${SIM_REFERENCE * 100}%.`));
    }
    return section;
}

function simReferenceNote() {
    return el("p", "hint", `All'esame vero il punteggio va da 200 a 800 e si supera con 500. Quante risposte giuste servono non è pubblico: dipende dalle domande che capitano, perché hanno difficoltà diverse. Qui usiamo come riferimento il ${SIM_REFERENCE * 100}% (500 è a metà tra 200 e 800): è solo un'indicazione, quindi conviene stare con un buon margine sopra.`);
}

function renderSimulationStart(exam, page) {
    page.appendChild(el("p", "lead", `${exam.questions} domande in ${exam.minutes} minuti, come all'esame ${exam.name} ${exam.id}: ogni obiettivo ha tante domande quanto il suo peso.`));
    const rules = el("ul", "sim-rules");
    ["Puoi andare avanti e indietro e cambiare le risposte fino alla fine.",
        "Con «Segna per rivedere» ritrovi le domande in dubbio nel quadro di tutte le domande.",
        "Le spiegazioni arrivano alla fine, con il risultato per argomento.",
        "Il tempo continua anche se chiudi la pagina: riaprendola ritrovi la prova dove l'avevi lasciata. Allo scadere la prova termina da sola."]
        .forEach(text => rules.appendChild(el("li", "", text)));
    page.appendChild(rules);
    page.appendChild(simReferenceNote());
    const start = el("button", "button primary", "⏱ Inizia la simulazione");
    start.type = "button";
    start.id = "sim-start";
    start.onclick = () => {
        simCreate(exam);
        render();
    };
    page.appendChild(start);
    const history = simHistory(exam);
    if (history) page.appendChild(history);
}

// La domanda corrente della prova, con le risposte salvate a ogni cambio
function renderSimQuestion(exam, data, body, focus) {
    body.innerHTML = "";
    const entry = data.questions[data.index];
    const question = simQuestion(entry);
    const options = simOptions(entry, question);
    const count = data.questions.length;

    const text = richText(question.text, "h2", "question-text");
    text.id = "question-text";
    text.tabIndex = -1;
    const number = el("p", "question-objective", `Domanda ${data.index + 1} di ${count}`);
    number.id = "sim-position";
    body.append(number, text);
    if (question.code) {
        const wrap = el("div", "question-code");
        wrap.tabIndex = 0;
        wrap.setAttribute("role", "region");
        wrap.setAttribute("aria-label", "Codice della domanda");
        wrap.appendChild(el("pre", "", question.code));
        body.appendChild(wrap);
    }
    const fieldset = el("fieldset", "question-form");
    fieldset.setAttribute("aria-describedby", "question-text");
    const choose = correctCount(question);
    fieldset.appendChild(el("legend", "question-legend", question.type === "fill" ? "Scrivi la risposta." : question.type === "multiple" ? `Scegli ${choose} risposte.` : "Scegli una risposta."));
    const note = el("p", "form-message");
    note.id = "sim-note";
    note.setAttribute("aria-live", "polite");
    const save = () => {
        simSave(data);
        updateSimOverview(data);
    };
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
        input.value = entry.answer;
        input.oninput = () => {
            entry.answer = input.value;
            save();
        };
        fieldset.append(label, input);
    } else {
        const list = el("ul", "options");
        options.forEach((option, index) => {
            const item = el("li");
            const label = el("label", "option");
            const input = document.createElement("input");
            input.type = question.type === "multiple" ? "checkbox" : "radio";
            input.name = "answer";
            input.id = `option-${index}`;
            input.checked = entry.answer.includes(entry.order[index]);
            input.onchange = () => {
                entry.answer = [...list.querySelectorAll("input")].map((box, i) => box.checked ? entry.order[i] : -1).filter(i => i >= 0).sort((a, b) => a - b);
                if (question.type === "multiple") {
                    note.textContent = entry.answer.length && entry.answer.length !== choose ? `Hai scelto ${entry.answer.length} ${entry.answer.length === 1 ? "risposta" : "risposte"}: ne servono ${choose}.` : "";
                }
                save();
            };
            label.append(input, richText(option.t, "span", "option-text"));
            item.appendChild(label);
            list.appendChild(item);
        });
        fieldset.appendChild(list);
    }
    body.append(fieldset, note);

    const nav = el("div", "pager sim-nav");
    const prev = el("button", "button", "← Precedente");
    prev.type = "button";
    prev.id = "sim-prev";
    prev.disabled = data.index === 0;
    const flag = el("button", "button", entry.flagged ? "★ Segnata da rivedere" : "☆ Segna per rivedere");
    flag.type = "button";
    flag.id = "sim-flag";
    flag.setAttribute("aria-pressed", String(entry.flagged));
    flag.onclick = () => {
        entry.flagged = !entry.flagged;
        flag.textContent = entry.flagged ? "★ Segnata da rivedere" : "☆ Segna per rivedere";
        flag.setAttribute("aria-pressed", String(entry.flagged));
        save();
    };
    const next = el("button", "button primary next", data.index + 1 < count ? "Successiva →" : "Vai al quadro");
    next.type = "button";
    next.id = "sim-next";
    const go = index => {
        data.index = index;
        sim.confirm = false;
        simSave(data);
        renderSimQuestion(exam, data, body, true);
        updateSimOverview(data);
        window.scrollTo(0, 0);
    };
    prev.onclick = () => go(data.index - 1);
    next.onclick = () => {
        if (data.index + 1 < count) go(data.index + 1);
        else document.getElementById("sim-overview-title").focus();
    };
    nav.append(prev, flag, next);
    body.appendChild(nav);
    sim.goTo = go;
    if (question.type === "multiple" && entry.answer.length && entry.answer.length !== choose) {
        note.textContent = `Hai scelto ${entry.answer.length} ${entry.answer.length === 1 ? "risposta" : "risposte"}: ne servono ${choose}.`;
    }
    if (focus) text.focus();
}

// Il quadro di tutte le domande: risposta data, segnata, corrente
function updateSimOverview(data) {
    const grid = document.getElementById("sim-grid");
    if (!grid) return;
    grid.querySelectorAll("button").forEach((button, index) => {
        const entry = data.questions[index];
        const answered = simAnswered(entry);
        button.className = `sim-cell${answered ? " answered" : ""}${entry.flagged ? " flagged" : ""}`;
        button.textContent = `${index + 1}${entry.flagged ? "★" : ""}`;
        button.setAttribute("aria-label", `Domanda ${index + 1}: ${answered ? "risposta data" : "senza risposta"}${entry.flagged ? ", segnata da rivedere" : ""}`);
        if (index === data.index) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
    });
    const answered = data.questions.filter(simAnswered).length;
    const flagged = data.questions.filter(entry => entry.flagged).length;
    document.getElementById("sim-count").textContent = `Risposte date: ${answered} su ${data.questions.length}${flagged ? ` · segnate: ${flagged}` : ""}`;
}

function renderSimulationExam(exam, data, page) {
    const bar = el("div", "sim-bar");
    const clock = el("p", "sim-clock");
    clock.id = "sim-clock";
    clock.setAttribute("role", "timer");
    const count = el("p", "sim-count");
    count.id = "sim-count";
    bar.append(clock, count);
    page.appendChild(bar);
    const body = el("div", "quiz-body");
    body.id = "quiz-body";
    page.appendChild(body);

    const overview = el("section", "sim-overview");
    overview.setAttribute("aria-labelledby", "sim-overview-title");
    const title = el("h2", "", "Tutte le domande");
    title.id = "sim-overview-title";
    title.tabIndex = -1;
    overview.appendChild(title);
    overview.appendChild(el("p", "hint", "Le domande con lo sfondo pieno hanno una risposta; la stella indica quelle segnate da rivedere."));
    const grid = el("div", "sim-grid");
    grid.id = "sim-grid";
    data.questions.forEach((_, index) => {
        const button = el("button", "sim-cell");
        button.type = "button";
        button.onclick = () => sim.goTo(index);
        grid.appendChild(button);
    });
    overview.appendChild(grid);
    const end = el("button", "button", "Termina l'esame...");
    end.type = "button";
    end.id = "sim-end";
    const confirmBox = el("div", "sim-confirm");
    confirmBox.id = "sim-confirm";
    const showConfirm = () => {
        confirmBox.innerHTML = "";
        const answered = data.questions.filter(simAnswered).length;
        const flagged = data.questions.filter(entry => entry.flagged).length;
        const missing = data.questions.length - answered;
        confirmBox.appendChild(el("p", "warning", `Hai risposto a ${answered} domande su ${data.questions.length}${missing ? ` (${missing} senza risposta contano come sbagliate)` : ""}${flagged ? `; ${flagged} segnate da rivedere` : ""}. Termino l'esame?`));
        const yes = el("button", "button primary", "Sì, termina e vedi il risultato");
        yes.type = "button";
        yes.id = "sim-end-confirm";
        yes.onclick = () => {
            simFinish(exam, data, "fine");
            location.hash = "#/simulazione/risultato";
        };
        const no = el("button", "button", "Torna alle domande");
        no.type = "button";
        no.onclick = () => {
            confirmBox.innerHTML = "";
            end.focus();
        };
        confirmBox.append(yes, document.createTextNode(" "), no);
        yes.focus();
    };
    end.onclick = showConfirm;
    overview.append(end, confirmBox);
    page.appendChild(overview);
    main.appendChild(page);

    renderSimQuestion(exam, data, body);
    updateSimOverview(data);

    // Il cronometro: aggiorna il tempo, avvisa a 10, 5 e 1 minuto, chiude la prova allo scadere
    const tick = () => {
        const left = data.deadline - Date.now();
        if (left <= 0) {
            simFinish(exam, data, "tempo");
            location.hash = "#/simulazione/risultato";
            return;
        }
        clock.textContent = `⏱ Tempo rimasto: ${clockText(left)}`;
        clock.classList.toggle("low", left <= 5 * 60000);
        SIM_ANNOUNCE_MINUTES.forEach(minutes => {
            if (left <= minutes * 60000 && left > (minutes - 1) * 60000 && !sim.announced.has(minutes)) {
                sim.announced.add(minutes);
                announce(`Mancano ${minutes === 1 ? "un minuto" : `${minutes} minuti`} alla fine dell'esame.`);
            }
        });
    };
    stopSimulationTimer();
    tick();
    sim.timer = setInterval(tick, 1000);
}

// Pagina #/simulazione: inizio, oppure la prova in corso
function renderSimulation(exam) {
    const data = simLoad();
    if (data && !data.finished && data.exam === exam.id && Date.now() >= data.deadline) {
        // Il tempo è finito mentre la pagina era chiusa
        simFinish(exam, data, "tempo");
        location.replace("#/simulazione/risultato");
        return null;
    }
    const page = el("div", "page quiz-page sim-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Simulazione d'esame", null]]));
    const pageHead = el("header", "page-head");
    pageHead.appendChild(el("h1", "", "Simulazione d'esame"));
    page.appendChild(pageHead);
    if (data && !data.finished && data.exam === exam.id) {
        renderSimulationExam(exam, data, page);
    } else {
        renderSimulationStart(exam, page);
        main.appendChild(page);
    }
    return "Simulazione d'esame";
}

// Pagina #/simulazione/risultato: l'ultima prova finita
function renderSimulationResult(exam) {
    const data = simLoad();
    const page = el("div", "page quiz-page sim-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Simulazione d'esame", "#/simulazione"], ["Risultato", null]]));
    const pageHead = el("header", "page-head");
    pageHead.appendChild(el("h1", "", "Risultato della simulazione"));
    page.appendChild(pageHead);
    main.appendChild(page);
    if (!data || !data.finished || data.exam !== exam.id) {
        page.appendChild(el("p", "lead", "Non c'è ancora una simulazione finita."));
        page.appendChild(link("Vai alla simulazione", "#/simulazione", "button primary"));
        return "Risultato della simulazione";
    }
    const total = data.questions.length;
    const percent = Math.round(data.right / total * 100);
    const above = data.right / total >= SIM_REFERENCE;
    const score = el("p", "sim-score");
    score.id = "sim-score";
    score.textContent = `${data.right} giuste su ${total} (${percent}%)`;
    page.appendChild(score);
    page.appendChild(el("p", above ? "ok" : "warning", above
        ? `✅ Sopra la soglia di riferimento del ${SIM_REFERENCE * 100}%.`
        : `Sotto la soglia di riferimento del ${SIM_REFERENCE * 100}%: ripassa gli argomenti con il risultato più basso.`));
    page.appendChild(simReferenceNote());
    page.appendChild(el("p", "", `Tempo usato: ${minutesText(data.seconds)} su ${exam.minutes} minuti.`
        + (data.reason === "tempo" ? " Il tempo è scaduto: le domande senza risposta contano come sbagliate." : "")));

    // Risultato per argomento
    const topics = el("section", "block");
    topics.setAttribute("aria-labelledby", "per-argomento");
    const topicsTitle = el("h2", "", "Per argomento");
    topicsTitle.id = "per-argomento";
    topics.appendChild(topicsTitle);
    const table = el("table", "history");
    table.id = "sim-topics";
    const head = el("tr");
    ["Argomento", "Giuste", "Percentuale"].forEach(text => {
        const th = el("th", "", text);
        th.scope = "col";
        head.appendChild(th);
    });
    const thead = el("thead");
    thead.appendChild(head);
    const tbody = el("tbody");
    exam.topics.forEach(topic => {
        const [right, count] = data.topics[topic.id];
        const row = el("tr");
        const name = el("td");
        name.appendChild(link(`${topic.id}. ${topic.title}`, `#/#argomento-${topic.id}`));
        row.append(name, el("td", "", `${right} su ${count}`), el("td", "", `${count ? Math.round(right / count * 100) : 0}%`));
        tbody.appendChild(row);
    });
    table.append(thead, tbody);
    topics.appendChild(tableWrap(table, "Risultato per argomento"));
    page.appendChild(topics);

    // Le domande sbagliate o senza risposta, con le spiegazioni
    const wrong = data.questions.map((entry, index) => ({ entry, index, question: simQuestion(entry) }))
        .filter(({ entry, question }) => !simCorrect(question, entry));
    const review = el("section", "block");
    review.setAttribute("aria-labelledby", "da-rivedere");
    const reviewTitle = el("h2", "", wrong.length ? `Domande da rivedere (${wrong.length})` : "Domande da rivedere");
    reviewTitle.id = "da-rivedere";
    review.appendChild(reviewTitle);
    if (!wrong.length) review.appendChild(el("p", "ok", "Nessuna: tutte giuste!"));
    wrong.forEach(({ entry, index, question }) => {
        const item = el("article", "sim-wrong");
        const head = el("h3", "", `Domanda ${index + 1} · Obiettivo ${question.objective} · ${simAnswered(entry) ? "sbagliata" : "senza risposta"}`);
        item.appendChild(head);
        item.appendChild(richText(question.text, "p", "sim-wrong-text"));
        if (question.code) {
            const code = el("div", "question-code");
            code.tabIndex = 0;
            code.setAttribute("role", "region");
            code.setAttribute("aria-label", `Codice della domanda ${index + 1}`);
            code.appendChild(el("pre", "", question.code));
            item.appendChild(code);
        }
        const options = simOptions(entry, question);
        const chosen = options ? entry.order.map((original, i) => entry.answer.includes(original) ? i : -1).filter(i => i >= 0) : [];
        item.appendChild(explanation(question, options, chosen, question.type === "fill" ? entry.answer.trim() : undefined));
        const more = el("p", "review");
        more.appendChild(reviewLink(exam, question));
        item.appendChild(more);
        review.appendChild(item);
    });
    page.appendChild(review);

    const actions = el("div", "pager");
    const again = link("⏱ Nuova simulazione", "#/simulazione", "button primary");
    again.id = "sim-again";
    actions.append(again, link("🔄 Ripasso di oggi", "#/ripasso", "button"));
    page.appendChild(actions);
    page.appendChild(el("p", "hint", "Le risposte date in questa simulazione sono entrate nelle scatole del ripasso: le sbagliate tornano domani."));
    const history = simHistory(exam);
    if (history) page.appendChild(history);
    return "Risultato della simulazione";
}
