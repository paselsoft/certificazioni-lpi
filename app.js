// L'app: pagine e navigazione. Ogni pagina ha il suo indirizzo dopo il # (così funzionano il tasto
// Indietro del browser e i segnalibri):
//   #/                               argomenti e obiettivi dell'esame, con i progressi
//   #/010-160/obiettivo/2.1          un obiettivo: peso, lezioni, aree, comandi, «studiato»
//   #/010-160/lezione/2.1_01         una lezione ufficiale, da leggere anche offline
//   #/010-160/lezione/2.1_01/Quoting una lezione, alla sezione con quel titolo
//   #/010-160/domande/2.1            le domande di un obiettivo (quiz.js)
//   #/ripasso                        ripasso di oggi, con le scatole di Leitner (review.js)
//   #/simulazione                    simulazione d'esame, 40 domande in 60 minuti (exam-sim.js)
//   #/simulazione/risultato          il risultato dell'ultima simulazione
//   #/terminale                      pratica al terminale (practice.js): elenco degli esercizi
//   #/terminale/t2.4-01              un esercizio; #/terminale/libero il terminale libero
//   #/backup                         backup dei progressi

const APP_NAME = "Certificazioni LPI";
const state = { exam: "010-160", firstRender: true, lesson: null, scrollTimer: null, focusTarget: null };

const main = document.getElementById("main");
const announcer = document.getElementById("announce");

const currentExam = () => EXAMS.find(exam => exam.id === state.exam) || EXAMS[0];
const allObjectives = exam => exam.topics.flatMap(topic => topic.objectives.map(objective => ({ topic, objective })));
const allLessons = exam => allObjectives(exam).flatMap(({ topic, objective }) =>
    objective.lessons.map((id, index) => ({ id, index, topic, objective })));
const totalWeight = exam => allObjectives(exam).reduce((sum, { objective }) => sum + objective.weight, 0);

const objectiveHref = (exam, objective) => `#/${exam.id}/obiettivo/${objective.id}`;
const lessonHref = (exam, lessonId) => `#/${exam.id}/lezione/${lessonId}`;
const quizHref = (exam, objective) => `#/${exam.id}/domande/${objective.id}`;
const lessonName = (objective, index) => objective.lessons.length > 1 ? `Lezione ${index + 1} di ${objective.lessons.length}` : "Lezione unica";

function link(text, href, className) {
    const node = el("a", className, text);
    node.href = href;
    return node;
}

function announce(text) {
    announcer.textContent = "";
    setTimeout(() => { announcer.textContent = text; }, 50);
}

function applySettings() {
    document.documentElement.dataset.textSize = settings.textSize;
}

// Percorso di briciole: Obiettivi › Argomento › ...
function breadcrumb(items) {
    const nav = el("nav", "breadcrumb");
    nav.setAttribute("aria-label", "Dove sei");
    const list = el("ol");
    items.forEach(([text, href], index) => {
        const item = el("li");
        if (href) item.appendChild(link(text, href));
        else {
            const here = el("span", "", text);
            here.setAttribute("aria-current", "page");
            item.appendChild(here);
        }
        list.appendChild(item);
        if (index < items.length - 1) item.setAttribute("data-sep", "›");
    });
    nav.appendChild(list);
    return nav;
}

// Una barra di avanzamento con il testo accanto
function progressBar(label, value, max) {
    const wrap = el("div", "meter");
    const text = el("span", "meter-label", label);
    const bar = el("progress");
    bar.max = max;
    bar.value = value;
    bar.setAttribute("aria-label", label);
    wrap.append(text, bar);
    return wrap;
}

// ---- Pagina principale: argomenti e obiettivi ----

function examSummary(exam) {
    const objectives = allObjectives(exam).map(item => item.objective);
    const studied = objectives.filter(objective => isStudied(exam.id, objective.id));
    const lessons = allLessons(exam);
    const read = lessons.filter(lesson => isRead(exam.id, lesson.id));
    return {
        studied: studied.length, objectives: objectives.length,
        studiedWeight: studied.reduce((sum, objective) => sum + objective.weight, 0), weight: totalWeight(exam),
        read: read.length, lessons: lessons.length,
        questions: QUESTIONS.filter(q => q.exam === exam.id).length,
        rightQuestions: QUESTIONS.filter(q => q.exam === exam.id && answerOf(q) && answerOf(q).result).length
    };
}

function renderHome(exam) {
    const page = el("div", "page");
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", `${exam.name} ${exam.version}`));
    head.appendChild(el("p", "lead", `Esame ${exam.id}: ${exam.questions} domande in ${exam.minutes} minuti. Si può sostenere ${exam.available}.`));
    page.appendChild(head);

    // Riprendi la lettura
    const last = progress.last && progress.last.lesson.split("/");
    const lastLesson = last && last[0] === exam.id && allLessons(exam).find(item => item.id === last[1]);
    if (lastLesson) {
        const resume = el("p", "resume");
        const go = link(`📖 Riprendi la lettura: ${lastLesson.objective.id} ${lastLesson.objective.title}, ${lessonName(lastLesson.objective, lastLesson.index).toLowerCase()}`, lessonHref(exam, lastLesson.id), "button primary");
        go.id = "resume";
        resume.appendChild(go);
        page.appendChild(resume);
    }

    page.appendChild(reviewCard(exam));

    const summary = examSummary(exam);
    const box = el("section", "summary");
    box.setAttribute("aria-labelledby", "summary-title");
    const title = el("h2", "", "I tuoi progressi");
    title.id = "summary-title";
    box.appendChild(title);
    box.appendChild(progressBar(`Obiettivi studiati: ${summary.studied} su ${summary.objectives} (peso ${summary.studiedWeight} su ${summary.weight})`, summary.studiedWeight, summary.weight));
    box.appendChild(progressBar(`Lezioni lette: ${summary.read} su ${summary.lessons}`, summary.read, summary.lessons));
    box.appendChild(progressBar(`Domande con l'ultima risposta giusta: ${summary.rightQuestions} su ${summary.questions}`, summary.rightQuestions, summary.questions));
    const exercises = exercisesOf(exam.id);
    const practiced = exercises.filter(isPracticeDone).length;
    box.appendChild(progressBar(`Esercizi al terminale: ${practiced} su ${exercises.length}`, practiced, exercises.length));
    const sims = progress.simulations.filter(item => item.exam === exam.id);
    if (sims.length) {
        const latest = sims[sims.length - 1];
        const line = el("p", "sim-latest");
        line.id = "sim-latest";
        line.append(document.createTextNode(`Ultima simulazione d'esame: ${latest.right} giuste su ${latest.total} (${Math.round(latest.right / latest.total * 100)}%) il ${formatDate(latest.date)}. `),
            link("Tutte le simulazioni", "#/simulazione"));
        box.appendChild(line);
    }
    box.appendChild(el("p", "hint", "Il peso dice quante domande, più o meno, arrivano da ogni obiettivo: le 40 domande dell'esame si dividono secondo i pesi."));
    box.id = "summary";
    page.appendChild(box);

    exam.topics.forEach(topic => {
        const section = el("section", "topic");
        const heading = el("h2", "topic-title");
        heading.id = `argomento-${topic.id}`;
        const weight = topic.objectives.reduce((sum, objective) => sum + objective.weight, 0);
        heading.append(el("span", "topic-number", `Argomento ${topic.id}`), document.createTextNode(` ${topic.title} `), el("span", "weight", `peso ${weight}`));
        section.setAttribute("aria-labelledby", heading.id);
        section.appendChild(heading);
        const list = el("ul", "objectives");
        topic.objectives.forEach(objective => {
            const item = el("li", "objective-item");
            const studied = isStudied(exam.id, objective.id);
            if (studied) item.classList.add("studied");
            const anchor = link("", objectiveHref(exam, objective), "objective-link");
            anchor.id = `obiettivo-${objective.id.replace(".", "-")}`;
            anchor.append(el("span", "objective-id", objective.id), el("span", "objective-title", objective.title));
            const read = objective.lessons.filter(id => isRead(exam.id, id)).length;
            const meta = el("span", "objective-meta");
            meta.append(el("span", "weight", `peso ${objective.weight}`),
                el("span", "lessons-read", `lezioni lette ${read} su ${objective.lessons.length}`));
            const stats = objectiveQuizStats(exam.id, objective.id);
            if (stats.answered) meta.appendChild(el("span", "lessons-read", `domande giuste ${stats.right} su ${stats.total}`));
            if (studied) meta.appendChild(el("span", "badge", "✓ studiato"));
            anchor.appendChild(meta);
            item.appendChild(anchor);
            list.appendChild(item);
        });
        section.appendChild(list);
        page.appendChild(section);
    });

    const source = el("footer", "page-source");
    const sourceText = el("p");
    sourceText.append(document.createTextNode("Argomenti, pesi, aree di conoscenza e comandi vengono dagli "),
        externalLink("obiettivi ufficiali LPI (traduzione italiana)", exam.objectivesUrl),
        document.createTextNode(`, controllati il ${formatDate(exam.checked)}. Le lezioni sono del Linux Professional Institute, con licenza CC BY-NC-ND 4.0: sono nell'app integrali e non modificate, e si leggono anche senza connessione. `),
        externalLink("Tutte le lezioni su learning.lpi.org", exam.url), document.createTextNode(" · "),
        externalLink("PDF delle lezioni in italiano", exam.pdf));
    source.appendChild(sourceText);
    const offline = el("p", "offline-status");
    offline.id = "offline-status";
    source.appendChild(offline);
    page.appendChild(source);
    main.appendChild(page);
    updateOfflineStatus(exam);
    return `${exam.name} ${exam.version}`;
}

// ---- Pagina di un obiettivo ----

function renderObjective(exam, topic, objective) {
    const page = el("div", "page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], [`Argomento ${topic.id}`, `#/#argomento-${topic.id}`], [objective.id, null]]));
    const head = el("header", "page-head");
    const title = el("h1");
    title.append(el("span", "objective-id", objective.id), document.createTextNode(` ${objective.title}`));
    head.appendChild(title);
    head.appendChild(el("p", "lead", objective.description));
    const facts = el("p", "facts");
    facts.textContent = `Peso ${objective.weight} su ${totalWeight(exam)} · Argomento ${topic.id}: ${topic.title}`;
    head.appendChild(facts);
    page.appendChild(head);

    const studied = el("label", "studied-toggle");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.id = "studied";
    box.checked = isStudied(exam.id, objective.id);
    box.onchange = () => {
        setStudied(exam.id, objective.id, box.checked);
        announce(box.checked ? `Obiettivo ${objective.id} segnato come studiato.` : `Obiettivo ${objective.id} non più segnato come studiato.`);
    };
    studied.append(box, document.createTextNode(" Ho studiato questo obiettivo"));
    page.appendChild(studied);

    const lessons = el("section", "block");
    lessons.setAttribute("aria-labelledby", "lezioni");
    const lessonsTitle = el("h2", "", "Lezioni ufficiali in italiano");
    lessonsTitle.id = "lezioni";
    lessons.appendChild(lessonsTitle);
    const list = el("ul", "lesson-list");
    objective.lessons.forEach((id, index) => {
        const item = el("li");
        const anchor = link(`📖 ${lessonName(objective, index)}`, lessonHref(exam, id), "button");
        item.appendChild(anchor);
        if (isRead(exam.id, id)) item.appendChild(el("span", "badge", "✓ letta"));
        list.appendChild(item);
    });
    lessons.appendChild(list);
    const online = el("p", "hint");
    online.append(document.createTextNode("Si leggono qui anche senza connessione. "), externalLink("Le stesse lezioni sul sito LPI", objective.url));
    lessons.appendChild(online);
    page.appendChild(lessons);

    const questions = el("section", "block");
    questions.setAttribute("aria-labelledby", "domande");
    const questionsTitle = el("h2", "", "Domande");
    questionsTitle.id = "domande";
    questions.appendChild(questionsTitle);
    const stats = objectiveQuizStats(exam.id, objective.id);
    const train = link(`🎯 Allenati con le ${stats.total} domande`, quizHref(exam, objective), "button primary");
    train.id = "train";
    // Da qui parte sempre una serie nuova, se quella di prima è finita
    train.onclick = () => {
        if (quiz.session && quiz.session.index >= quiz.session.questions.length) quiz.session = null;
    };
    questions.appendChild(train);
    questions.appendChild(el("p", "hint", stats.answered
        ? `Hai risposto a ${stats.answered} domande su ${stats.total}: l'ultima risposta è giusta per ${stats.right}.`
        : "Domande scritte per questa app, come quelle dell'esame: scelta singola, scelta multipla e completamento. Dopo ogni risposta trovi il perché e la parte della lezione da ripassare."));
    page.appendChild(questions);

    // Esercizi al terminale dell'obiettivo
    const own = exercisesOf(exam.id, objective.id);
    if (own.length) {
        const practiceBlock = el("section", "block");
        practiceBlock.setAttribute("aria-labelledby", "pratica");
        const practiceTitle = el("h2", "", "Pratica al terminale");
        practiceTitle.id = "pratica";
        practiceBlock.append(practiceTitle, exerciseLinks(own));
        page.appendChild(practiceBlock);
    }

    const terms = el("section", "block");
    terms.setAttribute("aria-labelledby", "termini");
    const termsTitle = el("h2", "", "File, termini e comandi da conoscere");
    termsTitle.id = "termini";
    terms.appendChild(termsTitle);
    const termList = el("ul", "terms");
    objective.terms.forEach(term => termList.appendChild(el("li", "", term)));
    terms.appendChild(termList);
    terms.appendChild(el("p", "hint", "È l'elenco ufficiale (parziale) dell'obiettivo: all'esame possono comparire anche le opzioni più comuni di questi comandi."));
    page.appendChild(terms);

    const areas = el("section", "block");
    areas.setAttribute("aria-labelledby", "aree");
    const areasTitle = el("h2", "", "Aree di conoscenza");
    areasTitle.id = "aree";
    areas.appendChild(areasTitle);
    const areaList = el("ul");
    objective.areas.forEach(area => areaList.appendChild(el("li", "", area)));
    areas.appendChild(areaList);
    page.appendChild(areas);

    // Obiettivo precedente e successivo
    const objectives = allObjectives(exam);
    const position = objectives.findIndex(item => item.objective === objective);
    const pager = el("nav", "pager");
    pager.setAttribute("aria-label", "Altri obiettivi");
    if (position > 0) {
        const prev = objectives[position - 1].objective;
        pager.appendChild(link(`← ${prev.id} ${prev.title}`, objectiveHref(exam, prev), "button"));
    }
    if (position < objectives.length - 1) {
        const next = objectives[position + 1].objective;
        pager.appendChild(link(`${next.id} ${next.title} →`, objectiveHref(exam, next), "button next"));
    }
    page.appendChild(pager);

    const source = el("footer", "page-source");
    const sourceText = el("p");
    sourceText.append(document.createTextNode("Descrizione, aree di conoscenza e comandi sono quelli degli "), externalLink("obiettivi ufficiali LPI", exam.objectivesUrl), document.createTextNode("."));
    source.appendChild(sourceText);
    page.appendChild(source);
    main.appendChild(page);
    return `${objective.id} ${objective.title}`;
}

// ---- Pagina di una lezione ----

function textSizeControls() {
    const group = el("div", "text-size");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Dimensione del testo");
    const label = el("span", "text-size-label");
    const smaller = el("button", "button small", "A−");
    const bigger = el("button", "button small", "A+");
    smaller.type = bigger.type = "button";
    smaller.setAttribute("aria-label", "Testo più piccolo");
    bigger.setAttribute("aria-label", "Testo più grande");
    const update = () => {
        const index = TEXT_SIZES.indexOf(settings.textSize);
        label.textContent = `Testo: ${settings.textSize.replace("-", " ")}`;
        smaller.disabled = index === 0;
        bigger.disabled = index === TEXT_SIZES.length - 1;
    };
    const change = step => {
        const index = Math.min(TEXT_SIZES.length - 1, Math.max(0, TEXT_SIZES.indexOf(settings.textSize) + step));
        settings.textSize = TEXT_SIZES[index];
        saveSettings();
        applySettings();
        update();
        announce(`Testo ${settings.textSize.replace("-", " ")}`);
    };
    smaller.onclick = () => change(-1);
    bigger.onclick = () => change(1);
    group.append(label, smaller, bigger);
    update();
    return group;
}

function renderLessonPage(exam, entry, lesson) {
    const { topic, objective, index } = entry;
    const page = el("div", "page lesson-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], [`${objective.id} ${objective.title}`, objectiveHref(exam, objective)], [lessonName(objective, index), null]]));

    const tools = el("div", "lesson-tools");
    tools.appendChild(el("p", "lesson-context", `${exam.name} ${exam.version} · Argomento ${topic.id} · ${objective.id} ${objective.title} · ${lessonName(objective, index).toLowerCase()}`));
    tools.appendChild(textSizeControls());
    page.appendChild(tools);

    const { article, sections } = renderLessonBody(lesson);
    // L'h1 della lezione è il titolo della pagina: l'indice delle sezioni va subito dopo
    const h1 = article.querySelector("h1");
    h1.tabIndex = -1;
    const index_ = el("nav", "lesson-index");
    index_.setAttribute("aria-label", "Sezioni della lezione");
    const indexList = el("ul");
    sections.forEach(heading => {
        const item = el("li");
        const button = el("button", "button small", heading.textContent);
        button.type = "button";
        button.onclick = () => {
            heading.scrollIntoView({ block: "start" });
            heading.focus({ preventScroll: true });
        };
        item.appendChild(button);
        indexList.appendChild(item);
    });
    index_.appendChild(indexList);
    h1.after(index_);
    page.appendChild(article);

    // Fine della lezione: letta, lezione precedente e successiva
    const end = el("section", "lesson-end");
    end.setAttribute("aria-label", "Fine della lezione");
    const readLabel = el("label", "studied-toggle");
    const readBox = document.createElement("input");
    readBox.type = "checkbox";
    readBox.id = "lesson-read";
    readBox.checked = isRead(exam.id, lesson.id);
    readBox.onchange = () => {
        setRead(exam.id, lesson.id, readBox.checked);
        announce(readBox.checked ? "Lezione segnata come letta." : "Lezione non più segnata come letta.");
    };
    readLabel.append(readBox, document.createTextNode(" Ho letto questa lezione"));
    end.appendChild(readLabel);
    const lessons = allLessons(exam);
    const position = lessons.findIndex(item => item.id === lesson.id);
    const pager = el("nav", "pager");
    pager.setAttribute("aria-label", "Altre lezioni");
    if (position > 0) {
        const prev = lessons[position - 1];
        pager.appendChild(link(`← ${prev.objective.id} ${lessonName(prev.objective, prev.index).toLowerCase()}`, lessonHref(exam, prev.id), "button"));
    }
    pager.appendChild(link(`Obiettivo ${objective.id}`, objectiveHref(exam, objective), "button"));
    if (position < lessons.length - 1) {
        const next = lessons[position + 1];
        pager.appendChild(link(`${next.objective.id} ${lessonName(next.objective, next.index).toLowerCase()} →`, lessonHref(exam, next.id), "button next"));
    }
    end.appendChild(pager);
    page.appendChild(end);
    page.appendChild(lessonSource(lesson));
    main.appendChild(page);
}

function renderLesson(exam, entry, heading) {
    const page = el("div", "page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], [`${entry.objective.id} ${entry.objective.title}`, objectiveHref(exam, entry.objective)], [lessonName(entry.objective, entry.index), null]]));
    const loading = el("p", "lead", "Carico la lezione...");
    loading.setAttribute("role", "status");
    page.appendChild(loading);
    main.appendChild(page);
    const route = location.hash;
    // Dove si era arrivati l'ultima volta in questa lezione
    const saved = !heading && progress.last && progress.last.lesson === lessonKey(exam.id, entry.id) ? progress.last.scroll : 0;
    return loadLesson(exam.id, entry.id).then(lesson => {
        if (location.hash !== route) return null;
        main.innerHTML = "";
        if (!lesson) {
            const error = el("div", "page");
            error.appendChild(breadcrumb([["Obiettivi", "#/"], [`${entry.objective.id} ${entry.objective.title}`, objectiveHref(exam, entry.objective)], [lessonName(entry.objective, entry.index), null]]));
            error.appendChild(el("h1", "", "La lezione non si è caricata"));
            const text = el("p", "lead");
            text.append(document.createTextNode("Riprova tra poco (ricarica la pagina), oppure leggila sul sito LPI: "), externalLink("lezione originale", `${entry.objective.url}${entry.id}/`));
            error.appendChild(text);
            main.appendChild(error);
            return "Lezione non caricata";
        }
        renderLessonPage(exam, entry, lesson);
        state.lesson = { exam: exam.id, id: entry.id };
        // Una sezione precisa (per esempio dal «Ripassa» di una domanda)
        const target = heading && [...main.querySelectorAll("article.lesson h2, article.lesson h3, article.lesson h4, article.lesson h5")]
            .find(node => node.textContent.trim() === heading);
        if (target) {
            target.tabIndex = -1;
            target.scrollIntoView({ block: "start" });
            state.focusTarget = target;
        } else if (saved > 0.01) {
            const height = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo(0, Math.round(saved * height));
            announce("Hai ripreso la lezione da dove eri arrivato.");
        }
        setLastLesson(exam.id, entry.id, saved);
        return lesson.title;
    });
}

// Ricorda fino a dove si è letta la lezione aperta (al massimo una volta al secondo)
window.addEventListener("scroll", () => {
    if (!state.lesson || state.scrollTimer) return;
    state.scrollTimer = setTimeout(() => {
        state.scrollTimer = null;
        if (!state.lesson) return;
        const height = document.documentElement.scrollHeight - window.innerHeight;
        setLastLesson(state.lesson.exam, state.lesson.id, height > 0 ? window.scrollY / height : 0);
    }, 1000);
}, { passive: true });

// ---- Backup ----

function renderBackup() {
    const page = el("div", "page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Backup", null]]));
    page.appendChild(el("h1", "", "Backup dei progressi"));
    page.appendChild(el("p", "lead", "I progressi restano in questo browser: obiettivi studiati, lezioni lette e dove eri arrivato, risposte alle domande e scatole del ripasso, simulazioni d'esame, esercizi al terminale. Con un backup li porti su un altro computer o li ritrovi se il browser viene svuotato."));

    const save = el("section", "block");
    save.setAttribute("aria-labelledby", "salva");
    const saveTitle = el("h2", "", "Salva");
    saveTitle.id = "salva";
    save.appendChild(saveTitle);
    const summary = examSummary(currentExam());
    const now = el("p", "", `Adesso: ${progressCounts(progress)}.`);
    now.id = "backup-now";
    save.appendChild(now);
    const download = el("button", "button primary", "⬇ Scarica il backup");
    download.type = "button";
    download.id = "backup-download";
    download.onclick = () => {
        const blob = new Blob([JSON.stringify(backupData(), null, 1)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = el("a");
        anchor.href = url;
        anchor.download = backupFileName();
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        announce(`Backup scaricato: ${backupFileName()}`);
    };
    save.appendChild(download);
    save.appendChild(el("p", "hint", "Il file si chiama come certificazioni-lpi-backup-2026-11-12.json e finisce nella cartella Download."));
    page.appendChild(save);
    page.appendChild(syncPanel());

    const restore = el("section", "block");
    restore.setAttribute("aria-labelledby", "ripristina");
    const restoreTitle = el("h2", "", "Ripristina");
    restoreTitle.id = "ripristina";
    restore.appendChild(restoreTitle);
    const fileLabel = el("label", "file-label", "Scegli il file di backup ");
    const file = document.createElement("input");
    file.type = "file";
    file.id = "backup-file";
    file.accept = ".json,application/json";
    fileLabel.appendChild(file);
    restore.appendChild(fileLabel);
    const result = el("div", "backup-result");
    result.id = "backup-result";
    result.setAttribute("role", "status");
    restore.appendChild(result);
    file.onchange = () => {
        result.innerHTML = "";
        const chosen = file.files[0];
        if (!chosen) return;
        const reader = new FileReader();
        reader.onload = () => showBackup(result, readBackup(reader.result));
        reader.onerror = () => showBackup(result, { error: "Il file non si legge." });
        reader.readAsText(chosen);
    };
    page.appendChild(restore);

    const reset = el("section", "block");
    reset.setAttribute("aria-labelledby", "azzera");
    const resetTitle = el("h2", "", "Ricomincia da capo");
    resetTitle.id = "azzera";
    reset.appendChild(resetTitle);
    const resetButton = el("button", "button", "Azzera i progressi...");
    resetButton.type = "button";
    resetButton.id = "reset";
    const resetBox = el("div", "backup-result");
    resetButton.onclick = () => {
        resetBox.innerHTML = "";
        resetBox.appendChild(el("p", "warning", `Cancello tutti i progressi di questo browser? Prima, se vuoi, scarica un backup.${syncWarning()}`));
        const yes = el("button", "button danger", "Sì, azzera");
        yes.type = "button";
        yes.id = "reset-confirm";
        yes.onclick = () => {
            replaceProgress({});
            resetBox.innerHTML = "";
            resetBox.appendChild(el("p", "ok", "Progressi azzerati."));
            announce("Progressi azzerati.");
        };
        const no = el("button", "button", "Annulla");
        no.type = "button";
        no.onclick = () => { resetBox.innerHTML = ""; resetButton.focus(); };
        resetBox.append(yes, document.createTextNode(" "), no);
        yes.focus();
    };
    reset.append(resetButton, resetBox);
    page.appendChild(reset);
    const build = el("p", "hint", `Versione dell'app: ${APP_BUILD}.`);
    build.id = "app-build";
    page.appendChild(build);
    main.appendChild(page);
    renderSyncPanel();
    return "Backup dei progressi";
}

// Riepilogo dei progressi salvati, per la pagina Backup: «2 obiettivi studiati, 3 lezioni lette, ...»
function progressCounts(data) {
    const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    return [
        count(Object.keys(data.studied).length, "obiettivo studiato", "obiettivi studiati"),
        count(Object.keys(data.read).length, "lezione letta", "lezioni lette"),
        count(Object.keys(data.answers).length, "domanda con almeno una risposta", "domande con almeno una risposta"),
        count(data.simulations.length, "simulazione d'esame", "simulazioni d'esame"),
        count(Object.keys(data.practice).length, "esercizio al terminale", "esercizi al terminale")
    ].join(", ");
}

// Con la sincronizzazione collegata, i progressi salvati su GitHub tornano alla prossima unione
const syncWarning = () => syncState.config
    ? " Attenzione: la sincronizzazione è collegata e riunirà i progressi salvati su GitHub. Per ripartire davvero da capo, scollegala prima su tutti i dispositivi." : "";

function showBackup(result, backup) {
    result.innerHTML = "";
    if (backup.error) {
        result.appendChild(el("p", "warning", backup.error));
        return;
    }
    result.appendChild(el("p", "", `Backup${backup.date ? ` del ${formatDate(backup.date)}` : ""}: ${progressCounts(backup.progress)}. Sostituisce i progressi di adesso.${syncWarning()}`));
    const apply = el("button", "button primary", "Ripristina questo backup");
    apply.type = "button";
    apply.id = "backup-apply";
    apply.onclick = () => {
        replaceProgress(backup.progress);
        result.innerHTML = "";
        const done = el("p", "ok", "Progressi ripristinati. ");
        done.appendChild(link("Torna agli obiettivi", "#/"));
        result.appendChild(done);
        announce("Progressi ripristinati.");
    };
    result.appendChild(apply);
}

// ---- Uso senza connessione ----

// Quante lezioni sono già salvate nel browser per l'uso offline (solo se c'è il service worker)
function updateOfflineStatus(exam) {
    const status = document.getElementById("offline-status");
    if (!status || !("caches" in window) || !navigator.serviceWorker || !navigator.serviceWorker.controller) return;
    const lessons = allLessons(exam);
    Promise.all(lessons.map(lesson => caches.match(`lessons/${exam.id}/${lesson.id}.js`, { ignoreSearch: true })))
        .then(found => {
            const saved = found.filter(Boolean).length;
            status.textContent = saved === lessons.length
                ? `💾 Tutte le ${saved} lezioni sono salvate in questo browser: si leggono anche senza connessione.`
                : `💾 Lezioni salvate per l'uso senza connessione: ${saved} su ${lessons.length}.`;
        })
        .catch(() => {});
}

if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("sw.js").then(() => navigator.serviceWorker.ready)
        .then(() => setTimeout(() => updateOfflineStatus(currentExam()), 500))
        .catch(() => {});
    navigator.serviceWorker.addEventListener("controllerchange", () => updateOfflineStatus(currentExam()));
}

// ---- Navigazione ----

function notFound() {
    const page = el("div", "page");
    page.appendChild(el("h1", "", "Pagina non trovata"));
    const text = el("p", "lead");
    text.appendChild(link("Torna agli obiettivi", "#/"));
    page.appendChild(text);
    main.appendChild(page);
    return "Pagina non trovata";
}

function finishRender(title, focusTarget) {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    focusTarget = focusTarget || state.focusTarget;
    state.focusTarget = null;
    if (!state.firstRender) {
        const heading = focusTarget || main.querySelector("h1");
        if (heading) {
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
        }
    }
    state.firstRender = false;
    // Segno che la pagina è pronta (lo usano anche i test)
    document.body.dataset.route = location.hash || "#/";
    document.querySelectorAll(".site-nav a").forEach(anchor => {
        const href = anchor.getAttribute("href");
        const hash = location.hash || "#/";
        const here = href === "#/" ? !/^#\/(backup|ripasso|simulazione|terminale)/.test(hash) : hash === href || hash.startsWith(`${href}/`);
        if (here) anchor.setAttribute("aria-current", "page");
        else anchor.removeAttribute("aria-current");
    });
}

function render() {
    const hash = location.hash || "#/";
    state.lesson = null;
    stopSimulationTimer();
    main.innerHTML = "";
    const exam = currentExam();
    let match;
    // #/#argomento-2: la pagina principale, all'argomento indicato
    if (hash === "#/" || hash === "#" || (match = hash.match(/^#\/#(argomento-\d+)$/))) {
        const title = renderHome(exam);
        const target = match && document.getElementById(match[1]);
        if (target) target.scrollIntoView({ block: "start" });
        else window.scrollTo(0, 0);
        finishRender(title === `${exam.name} ${exam.version}` ? "" : title, target || null);
        return;
    }
    window.scrollTo(0, 0);
    if (hash === "#/ripasso") {
        finishRender(renderReview(exam));
        return;
    }
    if (hash === "#/terminale") {
        finishRender(renderPracticeList(exam));
        return;
    }
    match = hash.match(/^#\/terminale\/([\w.-]+)$/);
    if (match) {
        const exercise = EXERCISES.find(item => item.exam === exam.id && item.id === match[1]);
        if (exercise || match[1] === "libero") {
            finishRender(renderPractice(exam, exercise || null));
            return;
        }
    }
    if (hash === "#/simulazione") {
        const title = renderSimulation(exam);
        // null: la prova è appena finita per tempo e la pagina passa al risultato
        if (title !== null) finishRender(title);
        return;
    }
    if (hash === "#/simulazione/risultato") {
        finishRender(renderSimulationResult(exam));
        return;
    }
    if (hash === "#/backup") {
        finishRender(renderBackup());
        return;
    }
    match = hash.match(/^#\/([\w.-]+)\/(obiettivo|lezione|domande)\/([\d._]+)(?:\/([^/]+))?$/);
    const routeExam = match && EXAMS.find(item => item.id === match[1]);
    if (routeExam) {
        state.exam = routeExam.id;
        if (match[2] === "obiettivo") {
            const found = allObjectives(routeExam).find(item => item.objective.id === match[3]);
            if (found && !match[4]) {
                finishRender(renderObjective(routeExam, found.topic, found.objective));
                return;
            }
        } else if (match[2] === "domande") {
            const found = allObjectives(routeExam).find(item => item.objective.id === match[3]);
            if (found && !match[4]) {
                finishRender(renderQuiz(routeExam, found.topic, found.objective));
                return;
            }
        } else {
            const entry = allLessons(routeExam).find(item => item.id === match[3]);
            if (entry) {
                const first = state.firstRender;
                let heading = null;
                try {
                    heading = match[4] ? decodeURIComponent(match[4]) : null;
                } catch (e) { /* indirizzo rovinato: si apre la lezione dall'inizio */ }
                renderLesson(routeExam, entry, heading).then(title => {
                    if (title === null) return;
                    state.firstRender = first;
                    finishRender(title);
                });
                return;
            }
        }
    }
    finishRender(notFound());
}

// Il collegamento «Vai al contenuto» non cambia l'indirizzo: porta solo il fuoco sul contenuto
document.getElementById("skip").addEventListener("click", event => {
    event.preventDefault();
    const heading = main.querySelector("h1") || main;
    heading.tabIndex = -1;
    heading.focus();
});

applySettings();
window.addEventListener("hashchange", render);
render();
