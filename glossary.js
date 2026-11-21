// Glossario (#/glossario): i termini degli obiettivi d'esame con una spiegazione breve
// (data/glossary-<esame>.js), in ordine alfabetico, con una casella di ricerca che filtra mentre
// scrivi (nel termine e nella spiegazione, senza badare a maiuscole e accenti).
//   #/glossario          tutti i termini
//   #/glossario/2.1      solo quelli di un obiettivo (dalla pagina dell'obiettivo)
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
const glossaryId = term => `termine-${glossaryKey(term).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

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
            more.appendChild(link(`Obiettivo ${entry.objective}${found ? `: ${found.objective.title}` : ""}`, found ? objectiveHref(exam, found.objective) : "#/"));
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
