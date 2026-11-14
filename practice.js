// Pratica al terminale (tappa M5): esercizi con i comandi dell'esame su un file system simulato
// (shell-sim.js, shell-commands.js, exercise-check.js).
//   #/terminale            elenco degli esercizi, per obiettivo
//   #/terminale/<id>       un esercizio: compito, obiettivi spuntati, terminale
//   #/terminale/libero     terminale libero, senza compito
// Il terminale: una riga di comando (↑ e ↓ richiamano i comandi precedenti) e l'output sopra, in
// una regione che i lettori di schermo leggono man mano (role="log").

const practice = { sh: null, exercise: null, done: false, historyIndex: 0, draft: "" };
const exerciseKey = exercise => `${exercise.exam}/${exercise.id}`;
const exercisesOf = (examId, objectiveId) => EXERCISES.filter(exercise => exercise.exam === examId && (!objectiveId || exercise.objective === objectiveId));
const exerciseHref = exercise => `#/terminale/${exercise.id}`;

// Il prompt come in Bash: utente@host:directory$ (~ per la home)
function promptText(sh) {
    const home = sh.vars.HOME || "/home/anna";
    const where = sh.cwd === home ? "~" : sh.cwd.startsWith(`${home}/`) ? `~${sh.cwd.slice(home.length)}` : sh.cwd;
    return `${sh.user}@lpi:${where}$ `;
}

// Quanti caratteri entrano in una riga del terminale (ls incolonna i nomi su questa larghezza)
function terminalColumns(element) {
    const probe = el("span", "", "0".repeat(10));
    probe.style.visibility = "hidden";
    probe.style.position = "absolute";
    element.appendChild(probe);
    const charWidth = probe.getBoundingClientRect().width / 10 || 8;
    probe.remove();
    const style = getComputedStyle(element);
    const inner = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    return Math.max(20, Math.min(120, Math.floor(inner / charWidth)));
}

// ---- Elenco degli esercizi ----

function renderPracticeList(exam) {
    const page = el("div", "page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Terminale", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", "Pratica al terminale"));
    const list = exercisesOf(exam.id);
    const done = list.filter(exercise => isPracticeDone(exercise)).length;
    head.appendChild(el("p", "lead", "Esercizi con i comandi dell'esame, su un piccolo Linux simulato nel browser: sei l'utente anna, nella tua home ci sono già file e directory. Puoi sbagliare senza paura: «Ricomincia» rimette tutto com'era."));
    page.appendChild(head);
    page.appendChild(progressBar(`Esercizi completati: ${done} su ${list.length}`, done, list.length));
    const free = el("p");
    free.appendChild(link("⌨ Terminale libero, senza esercizio", "#/terminale/libero", "button"));
    page.appendChild(free);
    allObjectives(exam).forEach(({ objective }) => {
        const own = exercisesOf(exam.id, objective.id);
        if (!own.length) return;
        const section = el("section", "block");
        const title = el("h2");
        title.id = `pratica-${objective.id.replace(".", "-")}`;
        title.append(el("span", "objective-id", objective.id), document.createTextNode(` ${objective.title}`));
        section.setAttribute("aria-labelledby", title.id);
        section.appendChild(title);
        section.appendChild(exerciseLinks(own));
        page.appendChild(section);
    });
    page.appendChild(el("p", "hint", "Il simulatore si comporta come Bash con LC_ALL=C (ordine alfabetico e date all'inglese); i messaggi di errore sono in italiano. Ogni soluzione è controllata anche con Bash vero."));
    page.appendChild(realLinuxSection());
    main.appendChild(page);
    return "Pratica al terminale";
}

// Gli stessi esercizi su un Linux vero: lo script palestra/palestra.sh (tools/build-palestra.js)
// crea l'utente anna con la stessa home e il comando lpi-esercizio
const PALESTRA = "palestra/palestra.sh";

function realLinuxSection() {
    const section = el("section", "block");
    const title = el("h2", "", "Con un Linux vero");
    title.id = "linux-vero";
    section.setAttribute("aria-labelledby", title.id);
    section.appendChild(title);
    section.appendChild(el("p", "", "Hai un Linux, anche in una macchina virtuale come VirtualBox? Con lo script della palestra ritrovi gli stessi esercizi nel terminale vero: crea l'utente anna, con gli stessi file del simulatore, e il comando lpi-esercizio, che prepara la home per un esercizio e ne mostra il compito."));
    const download = el("p");
    const anchor = link("⬇ Scarica palestra.sh", PALESTRA, "button");
    anchor.setAttribute("download", "palestra.sh");
    anchor.id = "palestra-download";
    download.appendChild(anchor);
    section.appendChild(download);
    section.appendChild(el("p", "", "Oppure, nel terminale di Linux, una riga alla volta (la prima scarica lo script, la seconda lo installa: serve la tua password):"));
    const commands = el("pre", "solution-code", [
        `wget ${new URL(PALESTRA, location.href).href}`,
        "sudo bash palestra.sh installa",
        "su - anna",
        "lpi-esercizio t2.3-01"
    ].join("\n"));
    commands.id = "palestra-comandi";
    section.appendChild(commands);
    section.appendChild(el("p", "hint", "La password di anna è anna. lpi-esercizio da solo mostra l'elenco degli esercizi; lpi-esercizio soluzione t2.3-01 mostra la soluzione; exit ti riporta al tuo utente. Lo script lavora solo nella home di anna: i tuoi file non vengono toccati."));
    return section;
}

function exerciseLinks(list) {
    const ul = el("ul", "exercise-list");
    list.forEach(exercise => {
        const item = el("li");
        const anchor = link(exercise.title, exerciseHref(exercise), "exercise-link");
        item.appendChild(anchor);
        if (isPracticeDone(exercise)) item.appendChild(el("span", "badge", "✓ fatto"));
        ul.appendChild(item);
    });
    return ul;
}

// ---- Un esercizio (o il terminale libero) ----

function renderPractice(exam, exercise) {
    practice.exercise = exercise;
    practice.done = false;
    const page = el("div", "page practice-page");
    page.appendChild(breadcrumb([["Obiettivi", "#/"], ["Terminale", "#/terminale"], [exercise ? exercise.title : "Terminale libero", null]]));
    const head = el("header", "page-head");
    head.appendChild(el("h1", "", exercise ? exercise.title : "Terminale libero"));
    if (exercise) {
        const objective = allObjectives(exam).find(item => item.objective.id === exercise.objective).objective;
        const context = el("p", "facts");
        context.append(document.createTextNode(`Obiettivo ${objective.id}: `), link(objective.title, objectiveHref(exam, objective)));
        head.appendChild(context);
        head.appendChild(richText(exercise.task, "p", "lead task"));
    } else {
        head.appendChild(el("p", "lead", "Prova i comandi che vuoi: il file system è quello degli esercizi. Scrivi help per l'elenco dei comandi disponibili."));
    }
    page.appendChild(head);

    let goals = null;
    if (exercise) {
        goals = el("ul", "goals");
        goals.id = "goals";
        goals.setAttribute("aria-label", "Obiettivi dell'esercizio");
        page.appendChild(goals);
    }

    // Il terminale
    const terminal = el("section", "terminal");
    terminal.setAttribute("aria-label", "Terminale");
    const output = el("div", "terminal-output");
    output.id = "terminal-output";
    output.setAttribute("role", "log");
    output.setAttribute("aria-live", "polite");
    output.tabIndex = 0;
    output.setAttribute("aria-label", "Output del terminale");
    const form = el("form", "terminal-line");
    const prompt = el("label", "terminal-prompt");
    prompt.htmlFor = "terminal-input";
    const input = el("input", "terminal-input");
    input.id = "terminal-input";
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("autocorrect", "off");
    form.append(prompt, input);
    terminal.append(output, form);
    page.appendChild(terminal);

    const tools = el("div", "pager practice-tools");
    const restart = el("button", "button", "Ricomincia");
    restart.type = "button";
    restart.id = "practice-restart";
    tools.appendChild(restart);
    let hintBox = null;
    if (exercise) {
        const hint = el("button", "button", "💡 Suggerimento");
        hint.type = "button";
        hint.id = "practice-hint";
        const solution = el("button", "button", "Mostra la soluzione");
        solution.type = "button";
        solution.id = "practice-solution";
        tools.append(hint, solution);
        hintBox = el("div", "practice-help");
        hintBox.id = "practice-help";
        hint.onclick = () => {
            hintBox.innerHTML = "";
            hintBox.appendChild(richText(exercise.hint, "p", "hint-text"));
            hintBox.firstChild.tabIndex = -1;
            hintBox.firstChild.focus();
        };
        solution.onclick = () => {
            hintBox.innerHTML = "";
            const intro = el("p", "", "Una soluzione possibile (provala nel terminale):");
            intro.tabIndex = -1;
            const pre = el("pre", "solution-code", exercise.solution.join("\n"));
            hintBox.append(intro, pre);
            intro.focus();
        };
    }
    page.appendChild(tools);
    if (hintBox) page.appendChild(hintBox);
    const success = el("section", "practice-success");
    success.id = "practice-success";
    success.hidden = true;
    page.appendChild(success);
    if (exercise) {
        const real = el("p", "hint");
        real.append(document.createTextNode("Su un Linux vero, con la palestra: "), el("code", "", `lpi-esercizio ${exercise.id}`), document.createTextNode(" ("), link("come si installa", "#/terminale"), document.createTextNode(")."));
        page.appendChild(real);
    }
    if (!exercise) page.appendChild(el("p", "hint", "Scrivi help per l'elenco dei comandi. Il simulatore si comporta come Bash con LC_ALL=C; i messaggi di errore sono in italiano."));
    main.appendChild(page);

    const start = () => {
        practice.sh = exercise ? exerciseShell(exercise, terminalColumns(output)) : createShell();
        practice.sh.columns = terminalColumns(output);
        practice.historyIndex = 0;
        practice.done = false;
        output.innerHTML = "";
        success.hidden = true;
        success.innerHTML = "";
        prompt.textContent = promptText(practice.sh);
        if (exercise) updateGoals(goals, exercise);
    };
    restart.onclick = () => {
        start();
        input.value = "";
        input.focus();
    };
    start();

    form.onsubmit = event => {
        event.preventDefault();
        const line = input.value;
        input.value = "";
        practice.historyIndex = 0;
        practice.sh.columns = terminalColumns(output);
        const echo = el("div", "terminal-command");
        echo.append(el("span", "terminal-prompt", promptText(practice.sh)), document.createTextNode(line));
        output.appendChild(echo);
        const result = simRun(practice.sh, line);
        if (result.clear) output.innerHTML = "";
        result.lines.forEach(item => output.appendChild(el("div", item.err ? "terminal-error" : "terminal-text", item.text === "" ? " " : item.text)));
        // Al massimo 400 righe: le più vecchie si tolgono
        while (output.childElementCount > 400) output.firstElementChild.remove();
        output.scrollTop = output.scrollHeight;
        prompt.textContent = promptText(practice.sh);
        if (exercise) {
            updateGoals(goals, exercise);
            if (!practice.done && exerciseDone(practice.sh, exercise)) {
                practice.done = true;
                setPracticeDone(exercise);
                showPracticeSuccess(exam, exercise, success);
            }
        }
    };
    // ↑ e ↓: i comandi già scritti
    input.onkeydown = event => {
        const history = practice.sh.history;
        if (event.key === "ArrowUp" && history.length) {
            if (practice.historyIndex === 0) practice.draft = input.value;
            practice.historyIndex = Math.min(history.length, practice.historyIndex + 1);
            input.value = history[history.length - practice.historyIndex];
            event.preventDefault();
        } else if (event.key === "ArrowDown" && practice.historyIndex > 0) {
            practice.historyIndex--;
            input.value = practice.historyIndex ? history[history.length - practice.historyIndex] : practice.draft;
            event.preventDefault();
        } else if (event.key === "l" && event.ctrlKey) {
            output.innerHTML = "";
            event.preventDefault();
        }
    };
    // Un clic sul terminale porta il fuoco sulla riga di comando (se non si sta selezionando testo)
    output.onclick = () => {
        if (!String(window.getSelection())) input.focus();
    };
    return exercise ? exercise.title : "Terminale libero";
}

function updateGoals(list, exercise) {
    list.innerHTML = "";
    exercise.goals.forEach(goal => {
        const met = goalMet(practice.sh, exercise, goal);
        const item = el("li", met ? "goal met" : "goal");
        item.append(el("span", "goal-mark", met ? "✓" : "○"), document.createTextNode(" "), richText(goal.text, "span"),
            el("span", "sr-only", met ? " (fatto)" : " (da fare)"));
        list.appendChild(item);
    });
}

function showPracticeSuccess(exam, exercise, box) {
    box.hidden = false;
    box.innerHTML = "";
    const title = el("h2", "", "✅ Esercizio completato!");
    title.tabIndex = -1;
    box.appendChild(title);
    box.appendChild(richText(exercise.explain, "p", "why"));
    const list = exercisesOf(exam.id);
    const next = list[list.indexOf(exercise) + 1];
    const actions = el("div", "pager");
    if (next) {
        const anchor = link(`Esercizio successivo: ${next.title} →`, exerciseHref(next), "button primary");
        anchor.id = "practice-next";
        actions.appendChild(anchor);
    }
    actions.appendChild(link("Tutti gli esercizi", "#/terminale", "button"));
    box.appendChild(actions);
    announce(`Esercizio completato: ${exercise.title}.`);
}
