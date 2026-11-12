// Simulazione d'esame (M4): 40 domande secondo il peso, 60 minuti, domande segnate, quadro,
// ripresa dopo la chiusura, fine per tempo, risultato per argomento, storico, scatole del ripasso.
const { assert, open, go, ready, stored, overflow, axeViolations } = require("./helpers");

const START = new Date("2026-11-12T10:00:00");

// Risponde alla domanda mostrata (giusta o sbagliata) usando i controlli della pagina
async function answer(page, right = true) {
    await page.evaluate(right => {
        const data = simLoad();
        const entry = data.questions[data.index];
        const question = simQuestion(entry);
        if (question.type === "fill") {
            const input = document.getElementById("fill-answer");
            input.value = right ? question.answers[0] : "sbagliata";
            input.dispatchEvent(new Event("input"));
            return;
        }
        const options = simOptions(entry, question);
        const wanted = options.map(option => right ? option.ok : false);
        if (!right) wanted[options.findIndex(option => !option.ok)] = true;
        if (!right && question.type === "multiple") wanted[options.findIndex(option => option.ok)] = true;
        options.forEach((_, index) => {
            const box = document.getElementById(`option-${index}`);
            if (box.checked !== wanted[index]) box.click();
        });
    }, right);
}

const simData = page => page.evaluate(() => simLoad());

module.exports = {
    "inizio: regole, poi 40 domande distribuite secondo il peso, 60 minuti": async ({ page }) => {
        await page.clock.install({ time: START });
        await open(page, { hash: "#/simulazione" });
        assert.equal(await page.textContent("main h1"), "Simulazione d'esame");
        assert.match(await page.textContent("main"), /40 domande in 60 minuti/);
        assert.match(await page.textContent("main"), /si supera con 500/);
        assert.equal(await page.locator("#history").count(), 0);
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        assert.equal(await page.textContent("#sim-clock"), "⏱ Tempo rimasto: 60:00");
        assert.equal(await page.textContent("#sim-position"), "Domanda 1 di 40");
        assert.equal(await page.textContent("#sim-count"), "Risposte date: 0 su 40");
        assert.equal(await page.locator("#sim-grid button").count(), 40);
        const perObjective = await page.evaluate(() => {
            const counts = {};
            simLoad().questions.forEach(entry => { const o = entry.id.split("-")[0]; counts[o] = (counts[o] || 0) + 1; });
            return allObjectives(currentExam()).every(({ objective }) => counts[objective.id] === objective.weight) && Object.keys(counts).length;
        });
        assert.equal(perObjective, 19, "ogni obiettivo ha tante domande quanto il peso");
        assert.equal(new Set((await simData(page)).questions.map(entry => entry.id)).size, 40, "domande tutte diverse");
        await page.clock.runFor(61000);
        assert.equal(await page.textContent("#sim-clock"), "⏱ Tempo rimasto: 58:59");
        assert.equal(await page.getAttribute(".site-nav a[href='#/simulazione']", "aria-current"), "page");
    },

    "durante la prova: risposte salvate, segnate, quadro, si riprende dopo aver ricaricato": async ({ page }) => {
        await page.clock.install({ time: START });
        await open(page, { hash: "#/simulazione" });
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        assert.equal(await page.isDisabled("#sim-prev"), true);
        await answer(page);
        assert.equal(await page.textContent("#sim-count"), "Risposte date: 1 su 40");
        assert.match(await page.getAttribute("#sim-grid button >> nth=0", "class"), /answered/);
        await page.click("#sim-next");
        assert.equal(await page.textContent("#sim-position"), "Domanda 2 di 40");
        assert.equal(await page.evaluate(() => document.activeElement.id), "question-text");
        await page.click("#sim-flag");
        assert.equal(await page.getAttribute("#sim-flag", "aria-pressed"), "true");
        assert.equal(await page.textContent("#sim-count"), "Risposte date: 1 su 40 · segnate: 1");
        assert.equal(await page.getAttribute("#sim-grid button >> nth=1", "aria-label"), "Domanda 2: senza risposta, segnata da rivedere");
        assert.equal(await page.textContent("#sim-grid button >> nth=1"), "2★");
        // Dal quadro alla domanda 1: la risposta c'è ancora
        await page.click("#sim-grid button >> nth=0");
        assert.equal(await page.textContent("#sim-position"), "Domanda 1 di 40");
        const kept = await page.evaluate(() => {
            const fill = document.getElementById("fill-answer");
            return fill ? fill.value !== "" : document.querySelectorAll(".options input:checked").length > 0;
        });
        assert.ok(kept, "risposta conservata");
        // Ricaricando, la prova riprende dov'era, con il tempo che è passato
        await page.clock.runFor(5 * 60000);
        await page.reload();
        await page.waitForSelector("#sim-clock");
        assert.equal(await page.textContent("#sim-position"), "Domanda 1 di 40");
        assert.equal(await page.textContent("#sim-count"), "Risposte date: 1 su 40 · segnate: 1");
        assert.match(await page.textContent("#sim-clock"), /Tempo rimasto: 5[45]:\d\d/);
        // Si può uscire e tornare
        await go(page, "#/");
        await go(page, "#/simulazione");
        assert.equal(await page.textContent("#sim-count"), "Risposte date: 1 su 40 · segnate: 1");
    },

    "scelta multipla: avviso se il numero di risposte non è quello richiesto": async ({ page }) => {
        await page.clock.install({ time: START });
        await open(page, { hash: "#/simulazione" });
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        // Mette al primo posto una domanda «scegli 2», con le opzioni nell'ordine scritto
        await page.evaluate(() => {
            const data = simLoad();
            data.questions[0] = { exam: "010-160", id: "3.2-07", flagged: false, answer: [], order: [0, 1, 2, 3, 4] };
            simSave(data);
        });
        await page.reload();
        await page.waitForSelector("#sim-clock");
        assert.equal(await page.textContent(".question-legend"), "Scegli 2 risposte.");
        await page.click("#option-0");
        assert.equal(await page.textContent("#sim-note"), "Hai scelto 1 risposta: ne servono 2.");
        await page.click("#option-1");
        assert.equal(await page.textContent("#sim-note"), "");
        assert.deepEqual((await simData(page)).questions[0].answer, [0, 1]);
    },

    "fine: conferma, risultato, per argomento, domande da rivedere, storico e ripasso": async ({ page }) => {
        await page.clock.install({ time: START });
        await open(page, { hash: "#/simulazione" });
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        // 30 giuste, 2 sbagliate, 8 senza risposta
        for (let i = 0; i < 32; i++) {
            await answer(page, i < 30);
            await page.click("#sim-next");
        }
        await page.clock.runFor(20 * 60000);
        await page.click("#sim-end");
        assert.match(await page.textContent("#sim-confirm"), /Hai risposto a 32 domande su 40 \(8 senza risposta contano come sbagliate\)\. Termino l'esame\?/);
        assert.equal(await page.evaluate(() => document.activeElement.id), "sim-end-confirm");
        await page.click("#sim-end-confirm");
        await ready(page, "#/simulazione/risultato");
        assert.equal(await page.textContent("main h1"), "Risultato della simulazione");
        assert.equal(await page.textContent("#sim-score"), "30 giuste su 40 (75%)");
        assert.match(await page.textContent("main"), /✅ Sopra la soglia di riferimento del 50%\./);
        assert.match(await page.textContent("main"), /Tempo usato: 20 min/);
        const topics = await page.$$eval("#sim-topics tbody tr", rows => rows.map(row => row.cells[1].textContent));
        assert.equal(topics.length, 5);
        assert.equal(topics.reduce((sum, text) => sum + Number(text.split(" su ")[1]), 0), 40);
        assert.deepEqual(topics.map(text => Number(text.split(" su ")[1])), [7, 9, 9, 8, 7], "domande per argomento = peso dell'argomento");
        assert.equal(topics.reduce((sum, text) => sum + Number(text.split(" su ")[0]), 0), 30);
        assert.match(await page.textContent("#da-rivedere"), /Domande da rivedere \(10\)/);
        assert.equal(await page.locator(".sim-wrong h3:has-text('senza risposta')").count(), 8);
        assert.equal(await page.locator(".sim-wrong h3:has-text('sbagliata')").count(), 2);
        assert.equal(await page.locator(".sim-wrong .review-link").count(), 10);
        assert.equal(await page.locator("#history tbody tr").count(), 1);
        // Storico e scatole del ripasso (solo le domande con una risposta)
        const saved = await stored(page);
        assert.deepEqual(saved.simulations.map(item => [item.right, item.total]), [[30, 40]]);
        assert.ok(saved.simulations[0].seconds >= 1200 && saved.simulations[0].seconds < 1260, `tempo: ${saved.simulations[0].seconds} s`);
        const boxes = Object.values(saved.answers).map(entry => entry.box);
        assert.equal(boxes.length, 32);
        assert.equal(boxes.filter(box => box === 2).length, 30);
        assert.equal(boxes.filter(box => box === 1).length, 2);
        await go(page, "#/");
        assert.match(await page.textContent("#sim-latest"), /Ultima simulazione d'esame: 30 giuste su 40 \(75%\) il 12\/11\/2026/);
        // Una nuova simulazione riparte dall'inizio
        await go(page, "#/simulazione");
        assert.equal(await page.locator("#sim-start").count(), 1);
        assert.equal(await page.locator("#history tbody tr").count(), 1);
    },

    "tempo scaduto: la prova termina da sola, anche se la pagina era chiusa": async ({ page }) => {
        await page.clock.install({ time: START });
        await open(page, { hash: "#/simulazione" });
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        await answer(page);
        // Avvisi a 10 minuti dalla fine
        await page.clock.fastForward(50 * 60000 + 2000);
        await page.waitForFunction(() => /Mancano 10 minuti/.test(document.getElementById("announce").textContent));
        assert.match(await page.getAttribute("#sim-clock", "class"), /sim-clock/);
        await page.clock.fastForward(10 * 60000);
        await ready(page, "#/simulazione/risultato");
        assert.match(await page.textContent("main"), /Il tempo è scaduto/);
        assert.match(await page.textContent("main"), /Tempo usato: 60 min su 60 minuti/);
        assert.match(await page.textContent("#sim-score"), /^[01] giuste su 40/);

        // Una prova lasciata a metà e riaperta dopo la scadenza
        await go(page, "#/simulazione");
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        await go(page, "#/");
        await page.clock.fastForward(61 * 60000);
        await page.evaluate(() => { location.hash = "#/simulazione"; });
        await ready(page, "#/simulazione/risultato");
        assert.match(await page.textContent("main"), /Il tempo è scaduto/);
        assert.equal((await stored(page)).simulations.length, 2);
    },

    "lo storico entra nel backup; dati rovinati scartati": async ({ page }) => {
        await open(page, { progress: { simulations: [
            { exam: "010-160", date: "2026-11-01", right: 22, total: 40, seconds: 3000, topics: { "1": [4, 7] } },
            { exam: "010-160", date: "x", right: 22, total: 40, seconds: 3000, topics: {} },
            { exam: "010-160", date: "2026-11-02", right: 50, total: 40, seconds: 3000, topics: {} }
        ] } });
        const backup = await page.evaluate(() => backupData().progress.simulations);
        assert.equal(backup.length, 1);
        assert.match(await page.textContent("#sim-latest"), /22 giuste su 40 \(55%\) il 01\/11\/2026/);
        await go(page, "#/simulazione");
        assert.match(await page.textContent("#history"), /01\/11\/2026.*22 su 40.*55% ✓.*50 min/);
    },

    "simulazione: 320 px e nessuna violazione axe (prova e risultato)": async ({ page }) => {
        await page.clock.install({ time: START });
        await page.setViewportSize({ width: 320, height: 640 });
        await open(page, { hash: "#/simulazione" });
        await page.click("#sim-start");
        await page.waitForSelector("#sim-clock");
        await answer(page);
        await page.click("#sim-next");
        await page.click("#sim-flag");
        assert.ok(await overflow(page) <= 0, "prova");
        let violations = await axeViolations(page);
        if (violations !== null) assert.deepEqual(violations, [], "prova");
        await page.click("#sim-end");
        await page.click("#sim-end-confirm");
        await ready(page, "#/simulazione/risultato");
        assert.ok(await overflow(page) <= 0, "risultato");
        violations = await axeViolations(page);
        if (violations !== null) assert.deepEqual(violations, [], "risultato");
    }
};
