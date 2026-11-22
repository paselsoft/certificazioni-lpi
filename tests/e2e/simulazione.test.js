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

    "simulazioni più corte: breve (20 domande, 30 minuti) e di un argomento; storico e «Sono pronto?»": async ({ page }) => {
        await page.clock.install({ time: START });
        await open(page, { hash: "#/simulazione" });
        assert.equal(await page.textContent("#sim-start-breve"), "⏱ Breve: 20 domande, 30 minuti");
        assert.match(await page.textContent("#sim-start-argomento-3"), /^Argomento 3: .+ \(18 domande, 27 minuti\)$/);
        // Breve: metà del peso per obiettivo; le mezze domande avanzate agli obiettivi di peso dispari
        await page.click("#sim-start-breve");
        await page.waitForSelector("#sim-clock");
        assert.equal(await page.textContent("#sim-clock"), "⏱ Tempo rimasto: 30:00");
        assert.equal(await page.textContent("#sim-position"), "Domanda 1 di 20");
        const counts = await page.evaluate(() => {
            const result = {};
            simLoad().questions.forEach(entry => { const o = entry.id.split("-")[0]; result[o] = (result[o] || 0) + 1; });
            return allObjectives(currentExam()).map(({ objective }) => [objective.weight, result[objective.id] || 0]);
        });
        assert.ok(counts.every(([weight, count]) => count === Math.floor(weight / 2) || (weight % 2 === 1 && count === Math.ceil(weight / 2))), JSON.stringify(counts));
        assert.equal((await simData(page)).kind, "breve");
        for (let i = 0; i < 5; i++) {
            await answer(page, true);
            await page.click("#sim-next");
        }
        await page.click("#sim-end");
        await page.click("#sim-end-confirm");
        await ready(page, "#/simulazione/risultato");
        assert.equal(await page.textContent("#sim-score"), "5 giuste su 20 (25%)");
        assert.equal(await page.textContent(".sim-kind"), "Simulazione breve: 20 domande in 30 minuti.");
        assert.match(await page.textContent("main"), /su 30 minuti/);
        // Un argomento: solo le sue domande, un minuto e mezzo ciascuna
        await go(page, "#/simulazione");
        await page.click("#sim-start-argomento-3");
        await page.waitForSelector("#sim-clock");
        assert.equal(await page.textContent("#sim-clock"), "⏱ Tempo rimasto: 27:00");
        const ids = (await simData(page)).questions.map(entry => entry.id);
        assert.equal(ids.length, 18);
        assert.ok(ids.every(id => id.startsWith("3.")), ids.join(" "));
        await answer(page, true);
        await page.click("#sim-end");
        await page.click("#sim-end-confirm");
        await ready(page, "#/simulazione/risultato");
        assert.equal(await page.locator("#sim-topics tbody tr").count(), 1, "solo l'argomento 3");
        assert.match(await page.textContent(".sim-kind"), /^Simulazione dell'argomento 3: 18 domande in 27 minuti\.$/);
        const saved = (await stored(page)).simulations;
        assert.deepEqual(saved.map(item => [item.kind, item.total]), [["breve", 20], ["argomento-3", 18]]);
        assert.deepEqual(Object.keys(saved[1].topics), ["3"]);
        assert.ok(Object.keys(saved[1].objectives).every(id => id.startsWith("3.")));
        // Storico con il tipo; «Sono pronto?» conta solo la breve
        await go(page, "#/simulazione");
        assert.deepEqual(await page.$$eval("#history tbody tr td:nth-child(2)", cells => cells.map(cell => cell.textContent)), ["Argomento 3", "Breve"]);
        await go(page, "#/pronto");
        assert.match(await page.textContent("#ready-sims"), /^Ultima simulazione d'esame: 25% di risposte giuste\./);
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
        // Anche per obiettivo: tante domande quanto il peso, 30 giuste in tutto
        const weights = await page.evaluate(() => Object.fromEntries(allObjectives(EXAMS[0]).map(({ objective }) => [objective.id, objective.weight])));
        const perObjective = saved.simulations[0].objectives;
        assert.deepEqual(Object.keys(perObjective).sort(), Object.keys(weights).sort());
        Object.entries(perObjective).forEach(([id, [right, count]]) => assert.ok(count === weights[id] && right <= count, id));
        assert.equal(Object.values(perObjective).reduce((sum, pair) => sum + pair[0], 0), 30);
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
            { exam: "010-160", date: "2026-11-02", right: 50, total: 40, seconds: 3000, topics: {} },
            // Le voci per obiettivo rovinate si scartano, la simulazione resta
            { exam: "010-160", date: "2026-11-03", right: 20, total: 40, seconds: 3000, topics: {}, objectives: { "1.1": [1, 2], "1.2": [3, 2], "x": [0, 1] } }
        ] } });
        const backup = await page.evaluate(() => backupData().progress.simulations);
        assert.equal(backup.length, 2);
        assert.equal(backup[0].objectives, undefined);
        assert.deepEqual(backup[1].objectives, { "1.1": [1, 2] });
        assert.match(await page.textContent("#sim-latest"), /20 giuste su 40 \(50%\) il 03\/11\/2026/);
        await go(page, "#/simulazione");
        assert.match(await page.textContent("#history"), /01\/11\/2026.*22 su 40.*55% ✓.*50 min/);
    },

    "andamento: grafico delle simulazioni con la linea del 75%, descritto a parole, a 320 px": async ({ page }) => {
        const sim = (date, right) => ({ exam: "010-160", date, right, total: 40, seconds: 3000, topics: {} });
        // Una sola simulazione: niente grafico
        await open(page, { hash: "#/simulazione", progress: { simulations: [sim("2026-11-01", 22)] } });
        assert.equal(await page.locator("#history tbody tr").count(), 1);
        assert.equal(await page.locator("#sim-chart").count(), 0);
        // Quattro simulazioni: un punto per ognuna, in ordine di data; le due sopra il 75% piene
        await page.evaluate(sims => { progress.simulations = sims; saveProgress(false); },
            [sim("2026-11-01", 22), sim("2026-11-05", 26), sim("2026-11-09", 31), sim("2026-11-12", 33)]);
        await go(page, "#/");
        await go(page, "#/simulazione");
        assert.equal(await page.locator("#sim-chart circle").count(), 4);
        assert.equal(await page.locator("#sim-chart circle.is-above").count(), 2);
        assert.equal(await page.getAttribute("#sim-chart svg", "role"), "img");
        assert.equal(await page.textContent("#sim-chart-title"), "Andamento delle ultime 4 simulazioni: dal 55% del 01/11/2026 all'83% del 12/11/2026; il migliore 83%; 2 sopra il 75%. I numeri sono anche nella tabella.");
        assert.equal(await page.textContent("#sim-chart-caption"), "Dalla prima all'ultima di queste 4: dal 55% all'83% (+28 punti). La linea tratteggiata è il 75%, il risultato da raggiungere con margine.");
        assert.deepEqual(await page.evaluate(() => [withArticle("dal", 8), withArticle("al", 11), withArticle("al", 100), withArticle("dal", 81)]), ["dall'8%", "all'11%", "al 100%", "dall'81%"]);
        // Il punto più alto è in alto (y più piccola), la linea del 75% c'è
        const ys = await page.$$eval("#sim-chart circle", circles => circles.map(circle => Number(circle.getAttribute("cy"))));
        assert.ok(ys[3] < ys[0], `y: ${ys.join(", ")}`);
        assert.equal(await page.locator("#sim-chart .sim-chart-target").count(), 1);
        assert.equal(await page.textContent("#sim-chart circle:last-of-type title"), "12/11/2026: 83%");
        await page.setViewportSize({ width: 320, height: 700 });
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            const violations = await axeViolations(page);
            if (violations !== null) assert.deepEqual(violations, [], scheme);
        }
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
