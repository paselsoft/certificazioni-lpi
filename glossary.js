// Glossario (#/glossario): i termini degli obiettivi d'esame con una spiegazione breve
// (data/glossary-<esame>.js), in ordine alfabetico, con una casella di ricerca che filtra mentre
// scrivi (nel termine e nella spiegazione, senza badare a maiuscole e accenti).
//   #/glossario          tutti i termini
//   #/glossario/2.1      solo quelli di un obiettivo (dalla pagina dell'obiettivo)
//   #/glossario/carte    ripasso con le carte (anche #/glossario/2.1/carte): si vede il termine,
//                        si prova a ricordare, si gira; «lo sapevo» o «no» spostano la carta nelle
//                        scatole del ripasso (store.js, progress.cards), come le domande
// Ogni voce porta all'obiettivo, dove ci sono la lezione ufficiale, le domande e gli esercizi.

const GLOSSARY_HREF = "#/glossario";
const glossaryOf = (examId, objectiveId) => GLOSSARY.filter(entry => entry.exam === examId && (!objectiveId || entry.objective === objectiveId));
// Per cercare e ordinare: minuscole, senza accenti e senza i simboli all'inizio (come «/etc/» o «~»)
const glossaryKey = text => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const glossarySortKey = text => glossaryKey(text).replace(/^[^a-z0-9]+/, "");
const glossaryLetter = term => {
    const first = glossarySortKey(term)[0] || "#";
    return /[a-z]/.test(first) ? first.toUpperCase() : "#";
};
const glossarySlug = term => glossaryKey(term).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const glossaryId = term => `termine-${glossarySlug(term)}`;
const CARDS_SIZE = 10;
const cardsHref = objectiveId => objectiveId ? `${GLOSSARY_HREF}/${objectiveId}/carte` : `${GLOSSARY_HREF}/carte`;
const cards = { session: null };

// Le carte di oggi: prima quelle che tornano oggi (dalla più in ritardo), poi quelle mai viste
function cardsToday(exam, objectiveId, today = todayKey()) {
    const entries = glossaryOf(exam.id, objectiveId);
    const due = entries.filter(entry => {
        const card = cardOf(exam.id, glossarySlug(entry.term));
        return card && card.due <= today;
    }).sort((a, b) => cardOf(exam.id, glossarySlug(a.term)).due.localeCompare(cardOf(exam.id, glossarySlug(b.term)).due));
    const fresh = entries.filter(entry => !cardOf(exam.id, glossarySlug(entry.term)));
    return { due, fresh };
}

// Il pulsante per le carte, con quante ce ne sono oggi
function cardsButton(exam, objectiveId) {
    const { due, fresh } = cardsToday(exam, objectiveId);
    const box = el("div", "cards-start");
    const start = link("🔄 Ripassa con le carte", cardsHref(objectiveId), "button primary");
    start.id = "cards-start";
    // Da qui parte sempre una serie nuova
    start.onclick = () => { cards.session = null; };
    box.appendChild(start);
    box.appendChild(el("p", "hint", due.length || fresh.length
        ? `Oggi: ${due.length === 1 ? "1 carta da ripassare" : `${due.length} carte da ripassare`}, ${fresh.length === 1 ? "1 mai vista" : `${fresh.length} mai viste`}. Vedi il termine, prova a ricordare che cos'è, poi gira la carta.`
        : "Per oggi hai ripassato tutte le carte: torneranno nei prossimi giorni."));
    return box;
}

function startCards(exam, objectiveId) {
    const { due, fresh } = cardsToday(exam, objectiveId);
    const picked = [...due, ...shuffle(fresh)].slice(0, CARDS_SIZE);
    cards.session = { exam: exam.id, objective: objectiveId, entries: picked, index: 0, flipped: false, results: [] };
}

// Pagina #/glossario/carte (o #/glossario/2.1/carte)
function renderCards(exam, objectiveId = null) {
    const objective = objectiveId && allObjectives(exam).find(item => item.objective.id === objectiveId);
    const page = el("div", "page cards-page");
    page.appendChild(breadcrumb(objective
        ? [["Obiettivi", "#/"], ["Glossario", GLOSSARY_HREF], [objective.objective.id, `${GLOSSARY_HREF}/${objective.objective.id}`], ["Carte", null]]
        : [["Obiettivi", "#/"], ["Glossario", GLOSSARY_HREF], ["Carte", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", objective ? `Carte del glossario: ${objective.objective.id}` : "Carte del glossario"));
    page.appendChild(head);
    const body = el("div", "cards-body");
    body.id = "cards-body";
    page.appendChild(body);
    main.appendChild(page);
    const session = cards.session;
    if (!session || session.exam !== exam.id || session.objective !== objectiveId) startCards(exam, objectiveId);
    renderCardStep(exam, body);
    return objective ? `Carte ${objective.objective.id}` : "Carte del glossario";
}

function renderCardStep(exam, body) {
    const session = cards.session;
    body.innerHTML = "";
    if (!session.entries.length) {
        body.appendChild(el("p", "lead", "✅ Per oggi non ci sono carte: hai ripassato tutti i termini. Torneranno nei prossimi giorni, quelli che sapevi meno prima degli altri."));
        body.appendChild(link("Glossario", GLOSSARY_HREF, "button"));
        return;
    }
    if (session.index >= session.entries.length) {
        renderCardsEnd(exam, body);
        return;
    }
    const entry = session.entries[session.index];
    const found = allObjectives(exam).find(item => item.objective.id === entry.objective);
    body.appendChild(progressBar(`Carta ${session.index + 1} di ${session.entries.length}`, session.index, session.entries.length));
    const card = el("section", "glossary-card");
    card.setAttribute("aria-labelledby", "card-term");
    const term = el("h2", "card-term", entry.term);
    term.id = "card-term";
    term.tabIndex = -1;
    card.appendChild(term);
    card.appendChild(el("p", "hint", `Obiettivo ${entry.objective}${found ? `: ${found.objective.title}` : ""}`));
    if (!session.flipped) {
        card.appendChild(el("p", "", "Che cos'è? Prova a dirlo con parole tue, poi gira la carta."));
        const flip = el("button", "button primary", "Gira la carta");
        flip.type = "button";
        flip.id = "card-flip";
        flip.onclick = () => {
            session.flipped = true;
            renderCardStep(exam, body);
            const back = document.getElementById("card-back");
            back.tabIndex = -1;
            back.focus();
        };
        card.appendChild(flip);
        body.appendChild(card);
        return;
    }
    const back = el("div", "card-back");
    back.id = "card-back";
    back.appendChild(richText(entry.text, "p"));
    const report = el("p", "hint");
    report.appendChild(reportLink("termine del glossario", `«${entry.term}»`, entry.text));
    back.appendChild(report);
    card.appendChild(back);
    card.appendChild(el("p", "", "Lo sapevi?"));
    const actions = el("div", "pager card-actions");
    const answer = right => {
        recordCard(exam.id, glossarySlug(entry.term), right);
        session.results.push({ entry, right });
        session.index++;
        session.flipped = false;
        renderCardStep(exam, body);
        const next = document.getElementById("card-term") || document.getElementById("cards-result");
        if (next) next.focus();
    };
    const yes = el("button", "button primary", "✓ Lo sapevo");
    yes.type = "button";
    yes.id = "card-yes";
    yes.onclick = () => answer(true);
    const no = el("button", "button", "✗ Non lo sapevo");
    no.type = "button";
    no.id = "card-no";
    no.onclick = () => answer(false);
    actions.append(yes, no);
    card.appendChild(actions);
    card.appendChild(el("p", "hint", "Quelle che sapevi tornano tra qualche giorno, le altre domani."));
    body.appendChild(card);
}

function renderCardsEnd(exam, body) {
    const session = cards.session;
    const right = session.results.filter(item => item.right).length;
    const result = el("h2", "", `Lo sapevi: ${right} su ${session.results.length}`);
    result.id = "cards-result";
    result.tabIndex = -1;
    body.appendChild(result);
    const missed = session.results.filter(item => !item.right);
    if (missed.length) {
        body.appendChild(el("p", "", missed.length === 1 ? "Questa torna domani:" : "Queste tornano domani:"));
        const list = el("ul", "cards-missed");
        missed.forEach(({ entry }) => {
            const item = el("li");
            item.appendChild(link(entry.term, `${GLOSSARY_HREF}/${entry.objective}`));
            list.appendChild(item);
        });
        body.appendChild(list);
    } else {
        body.appendChild(el("p", "ok", "✅ Tutte giuste: queste carte torneranno tra qualche giorno."));
    }
    const actions = el("div", "pager");
    const { due, fresh } = cardsToday(exam, session.objective);
    if (due.length || fresh.length) {
        const again = el("button", "button primary", "Altre carte");
        again.type = "button";
        again.id = "cards-again";
        again.onclick = () => {
            startCards(exam, session.objective);
            renderCardStep(exam, body);
            const term = document.getElementById("card-term");
            if (term) term.focus();
        };
        actions.appendChild(again);
    }
    actions.appendChild(link("Glossario", session.objective ? `${GLOSSARY_HREF}/${session.objective}` : GLOSSARY_HREF, "button"));
    body.appendChild(actions);
    announce(`Carte finite: lo sapevi per ${right} su ${session.results.length}.`);
}

function renderGlossary(exam, objectiveId = null) {
    const objective = objectiveId && allObjectives(exam).find(item => item.objective.id === objectiveId);
    const entries = glossaryOf(exam.id, objective ? objective.objective.id : null)
        .slice().sort((a, b) => glossarySortKey(a.term).localeCompare(glossarySortKey(b.term), "it"));
    const page = el("div", "page glossary-page");
    page.appendChild(breadcrumb(objective ? [["Obiettivi", "#/"], ["Glossario", GLOSSARY_HREF], [objective.objective.id, null]] : [["Obiettivi", "#/"], ["Glossario", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", objective ? `Glossario: ${objective.objective.id} ${objective.objective.title}` : "Glossario"));
    head.appendChild(el("p", "lead", objective
        ? `I termini dell'obiettivo ${objective.objective.id}, spiegati in breve.`
        : `I termini degli obiettivi d'esame di ${exam.name} ${exam.version}, spiegati in breve. Ogni voce porta all'obiettivo, con la lezione ufficiale, le domande e gli esercizi.`));
    page.appendChild(head);
    if (objective) {
        const back = el("p");
        back.append(link("Tutti i termini", GLOSSARY_HREF), document.createTextNode(" · "), link(`Obiettivo ${objective.objective.id}`, objectiveHref(exam, objective.objective)));
        page.appendChild(back);
    }

    // Le carte
    page.appendChild(cardsButton(exam, objective ? objective.objective.id : null));

    // La ricerca
    const search = el("div", "glossary-search");
    const label = el("label", "", "Cerca un termine");
    label.htmlFor = "glossary-query";
    const input = el("input");
    input.type = "search";
    input.id = "glossary-query";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("aria-describedby", "glossary-count");
    search.append(label, input);
    page.appendChild(search);
    const count = el("p", "hint glossary-count");
    count.id = "glossary-count";
    count.setAttribute("role", "status");
    page.appendChild(count);

    // Le voci, per lettera
    const list = el("div", "glossary-list");
    const groups = new Map();
    entries.forEach(entry => {
        const letter = glossaryLetter(entry.term);
        if (!groups.has(letter)) groups.set(letter, []);
        groups.get(letter).push(entry);
    });
    const items = [];
    groups.forEach((group, letter) => {
        const section = el("section", "glossary-letter");
        const heading = el("h2", "", letter === "#" ? "Simboli e percorsi" : letter);
        heading.id = `lettera-${letter === "#" ? "simboli" : letter.toLowerCase()}`;
        section.setAttribute("aria-labelledby", heading.id);
        const dl = el("dl");
        group.forEach(entry => {
            const found = allObjectives(exam).find(item => item.objective.id === entry.objective);
            const dt = el("dt", "glossary-term");
            dt.id = glossaryId(entry.term);
            dt.textContent = entry.term;
            const dd = el("dd", "glossary-text");
            dd.appendChild(richText(entry.text, "p"));
            const more = el("p", "glossary-more");
            more.append(link(`Obiettivo ${entry.objective}${found ? `: ${found.objective.title}` : ""}`, found ? objectiveHref(exam, found.objective) : "#/"),
                document.createTextNode(" · "), reportLink("termine del glossario", `«${entry.term}»`, entry.text));
            dd.appendChild(more);
            dl.append(dt, dd);
            items.push({ entry, dt, dd, section, key: glossaryKey(`${entry.term} ${entry.text}`) });
        });
        section.append(heading, dl);
        list.appendChild(section);
    });
    page.appendChild(list);
    const empty = el("p", "glossary-empty");
    empty.id = "glossary-empty";
    empty.hidden = true;
    page.appendChild(empty);

    // Filtra mentre scrivi: tutte le parole cercate devono comparire (in qualsiasi ordine)
    const filter = () => {
        const words = glossaryKey(input.value).split(/\s+/).filter(Boolean);
        let shown = 0;
        items.forEach(item => {
            const visible = words.every(word => item.key.includes(word));
            item.dt.hidden = !visible;
            item.dd.hidden = !visible;
            if (visible) shown++;
        });
        list.querySelectorAll(".glossary-letter").forEach(section => {
            section.hidden = !section.querySelector("dt:not([hidden])");
        });
        count.textContent = words.length
            ? `${shown === 1 ? "1 termine trovato" : `${shown} termini trovati`} su ${items.length}.`
            : `${items.length === 1 ? "1 termine" : `${items.length} termini`}.`;
        empty.hidden = shown > 0;
        empty.textContent = shown ? "" : `Nessun termine con «${input.value.trim()}». Prova con una parola più corta, o cerca nelle lezioni.`;
    };
    input.addEventListener("input", filter);
    filter();
    main.appendChild(page);
    return objective ? `Glossario ${objective.objective.id}` : "Glossario";
}
