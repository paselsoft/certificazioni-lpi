// Ripasso di oggi (M3): scatole di Leitner. Le sbagliate tornano il giorno dopo, le giuste sempre
// più di rado (1, 2, 4, 8, 16 giorni); il ripasso prende prima le scadute, poi le nuove dagli
// obiettivi che si stanno studiando. L'orologio del browser è fermato su un giorno preciso.
const { assert, open, go, ready, stored, overflow, axeViolations } = require("./helpers");

const DAY = "2026-11-12T10:00:00";
const at = (page, date) => page.clock.setFixedTime(new Date(date));

// Risponde alla domanda mostrata, giusta o sbagliata
async function answer(page, right) {
    await page.evaluate(right => {
        const { question, options } = quiz.session.questions[quiz.session.index];
        if (question.type === "fill") {
            document.getElementById("fill-answer").value = right ? question.answers[0] : "risposta sbagliata";
        } else {
            options.forEach((option, index) => { document.getElementById(`option-${index}`).checked = false; });
            // Giusta: le opzioni giuste. Sbagliata: una sola opzione sbagliata (o, se servono più
            // risposte, la giusta sostituita da una sbagliata)
            const wrong = options.findIndex(option => !option.ok);
            const marks = options.map(option => option.ok);
            if (!right) marks[marks.indexOf(true)] = false, marks[wrong] = true;
            marks.forEach((on, index) => { document.getElementById(`option-${index}`).checked = on; });
        }
        document.getElementById("check").click();
    }, right);
}

const currentId = page => page.evaluate(() => quiz.session.questions[quiz.session.index].question.id);

module.exports = {
    "primo giorno: domande nuove dagli obiettivi che stai studiando": async ({ page }) => {
        await at(page, DAY);
        await open(page, { progress: { studied: { "010-160:3.2": "2026-11-12" } } });
        assert.match(await page.textContent("#review-status"), /comincia con qualche domanda nuova/);
        assert.equal(await page.textContent("#review-start"), "10 domande nuove");
        assert.equal(await page.locator("#boxes").count(), 0);
        await page.click("#review-start");
        await ready(page, "#/ripasso");
        assert.equal(await page.textContent("main h1"), "Ripasso di oggi");
        const objectives = await page.evaluate(() => quiz.session.questions.map(item => item.question.objective));
        assert.equal(objectives.length, 10);
        assert.deepEqual([...new Set(objectives)], ["3.2"], "solo dall'obiettivo segnato come studiato");
        assert.match(await page.textContent(".question-objective"), /^Obiettivo 3\.2: Ricerca ed Estrazione di Dati dai File$/);
        assert.equal(await page.getAttribute(".site-nav a[href='#/ripasso']", "aria-current"), "page");
    },

    "senza obiettivi in studio: domande da tutti gli argomenti, secondo il peso": async ({ page }) => {
        await at(page, DAY);
        await open(page, { hash: "#/ripasso" });
        // Molti ripassi di prova: le domande arrivano da tanti obiettivi, di più da quelli che pesano di più
        const counts = await page.evaluate(() => {
            const seen = {};
            for (let i = 0; i < 300; i++) pickReview(currentExam()).forEach(q => { seen[q.objective] = (seen[q.objective] || 0) + 1; });
            return seen;
        });
        assert.equal(Object.keys(counts).length, 19, "tutti gli obiettivi");
        assert.ok(counts["3.3"] > counts["1.3"] * 2, `peso 4 contro peso 1: ${counts["3.3"]} e ${counts["1.3"]}`);
    },

    "scatole: sbagliata torna domani, giusta fra 2 giorni, poi sempre più di rado": async ({ page }) => {
        await at(page, DAY);
        await open(page, { progress: { studied: { "010-160:5.3": "2026-11-12" } } });
        await go(page, "#/ripasso");
        const wrongId = await currentId(page);
        await answer(page, false);
        assert.equal(await page.textContent("#feedback-title"), "Non è giusto");
        assert.equal(await page.textContent(".return-text"), "🔄 Scatola 1 di 5: questa domanda torna nel ripasso domani.");
        await page.click("#next");
        const rightId = await currentId(page);
        await answer(page, true);
        assert.equal(await page.textContent(".return-text"), "🔄 Scatola 2 di 5: questa domanda torna nel ripasso fra 2 giorni.");
        let answers = (await stored(page)).answers;
        assert.deepEqual([answers[`010-160/${wrongId}`].box, answers[`010-160/${wrongId}`].due], [1, "2026-11-13"]);
        assert.deepEqual([answers[`010-160/${rightId}`].box, answers[`010-160/${rightId}`].due], [2, "2026-11-14"]);
        await go(page, "#/");
        assert.match(await page.textContent("#boxes"), /^Nelle scatole: 1ª 1 · 2ª 1 · 3ª 0 · 4ª 0 · 5ª 0\./);
        assert.match(await page.textContent("#review-status"), /niente da ripassare/);
        assert.match(await page.textContent("#review-card"), /Prossimo ripasso: domani, 1 domanda\./);

        // Il giorno dopo torna la sbagliata, per prima
        await at(page, "2026-11-13T09:00:00");
        await page.reload();
        await page.waitForSelector("#review-status");
        assert.match(await page.textContent("#review-status"), /^Da ripassare oggi: 1 domanda\. Con 9 nuove si arriva a 10\.$/);
        await page.click("#review-start");
        await ready(page, "#/ripasso");
        assert.equal(await currentId(page), wrongId);
        await answer(page, true);
        assert.match(await page.textContent(".return-text"), /Scatola 2 di 5: .* fra 2 giorni/);

        // Due giorni dopo la prima risposta tornano le domande nella scatola 2; giuste ancora: scatola 3, 4 giorni
        await at(page, "2026-11-14T09:00:00");
        await page.reload();
        await ready(page, "#/ripasso");
        assert.equal(await currentId(page), rightId);
        await answer(page, true);
        assert.match(await page.textContent(".return-text"), /Scatola 3 di 5: .* fra 4 giorni/);
        answers = (await stored(page)).answers;
        assert.deepEqual([answers[`010-160/${rightId}`].box, answers[`010-160/${rightId}`].due, answers[`010-160/${rightId}`].ok], [3, "2026-11-18", 2]);
    },

    "la scatola 5 è la più alta; una sbagliata riporta nella 1": async ({ page }) => {
        await at(page, DAY);
        await open(page, { progress: { answers: { "010-160/2.4-04": { ok: 6, ko: 0, last: "2026-10-20", result: true, box: 5, due: "2026-11-05" } } } });
        await go(page, "#/ripasso");
        assert.equal(await currentId(page), "2.4-04", "la scaduta viene prima delle nuove");
        await answer(page, true);
        assert.match(await page.textContent(".return-text"), /Scatola 5 di 5: .* fra 16 giorni/);
        await page.evaluate(() => { quiz.session = null; });
        await page.evaluate(() => {
            progress.answers["010-160/2.4-04"].due = "2026-11-01";
            saveProgress();
        });
        await page.reload();
        await ready(page, "#/ripasso");
        await answer(page, false);
        const entry = (await stored(page)).answers["010-160/2.4-04"];
        assert.deepEqual([entry.box, entry.due, entry.ok, entry.ko], [1, "2026-11-13", 7, 1]);
    },

    "scadute: prima le più vecchie; al massimo 10 per volta, poi «Continua il ripasso»": async ({ page }) => {
        await at(page, DAY);
        const answers = {};
        const ids = ["1.1-01", "1.1-02", "1.1-03", "1.1-04", "1.1-05", "1.1-06", "1.1-07", "1.1-08", "1.1-09", "1.1-10", "1.2-01", "1.2-02"];
        ids.forEach((id, index) => { answers[`010-160/${id}`] = { ok: 1, ko: 0, last: "2026-11-01", result: true, box: 2, due: `2026-11-${String(index + 1).padStart(2, "0")}` }; });
        await open(page, { progress: { answers } });
        assert.match(await page.textContent("#review-status"), /^Da ripassare oggi: 12 domande\.$/);
        assert.equal(await page.textContent("#review-start"), "Inizia il ripasso (10 domande)");
        await page.click("#review-start");
        await ready(page, "#/ripasso");
        const picked = await page.evaluate(() => quiz.session.questions.map(item => item.question.id).sort());
        assert.deepEqual(picked, ids.slice(0, 10).sort(), "le 10 scadute da più tempo");
        for (let i = 0; i < 10; i++) {
            await answer(page, true);
            await page.click("#next");
        }
        assert.equal(await page.textContent("#quiz-result"), "Risultato: 10 giuste su 10");
        assert.equal(await page.textContent("#review-more"), "Continua il ripasso");
        await page.click("#review-more");
        // Le 2 scadute rimaste, più 8 nuove
        const rest = await page.evaluate(() => quiz.session.questions.map(item => item.question.id));
        assert.equal(rest.length, 10);
        assert.ok(rest.includes("1.2-01") && rest.includes("1.2-02"), rest.join(" "));
    },

    "le risposte date prima del ripasso (M2) entrano nelle scatole": async ({ page }) => {
        await at(page, DAY);
        await open(page, { progress: { answers: {
            "010-160/3.3-01": { ok: 1, ko: 0, last: "2026-11-11", result: true },
            "010-160/3.3-02": { ok: 0, ko: 1, last: "2026-11-11", result: false }
        } } });
        const answers = await page.evaluate(() => progress.answers);
        assert.deepEqual([answers["010-160/3.3-01"].box, answers["010-160/3.3-01"].due], [2, "2026-11-13"]);
        assert.deepEqual([answers["010-160/3.3-02"].box, answers["010-160/3.3-02"].due], [1, "2026-11-12"]);
        assert.match(await page.textContent("#review-status"), /^Da ripassare oggi: 1 domanda\./);
    },

    "tutte viste e niente da ripassare: il ripasso di oggi è finito": async ({ page }) => {
        await at(page, DAY);
        await open(page);
        await page.evaluate(() => {
            QUESTIONS.forEach((q, index) => {
                progress.answers[questionKey(q)] = { ok: 1, ko: 0, last: "2026-11-12", result: true, box: 2, due: index < 5 ? "2026-11-14" : "2026-11-20" };
            });
            saveProgress();
        });
        await page.reload();
        await page.waitForSelector("#review-status");
        assert.match(await page.textContent("#review-status"), /Hai risposto a tutte le domande/);
        assert.equal(await page.isVisible("#review-start"), false);
        assert.match(await page.textContent("#review-card"), /Prossimo ripasso: dopodomani, 5 domande\./);
        await go(page, "#/ripasso");
        assert.match(await page.textContent("main"), /Per oggi non c'è niente da ripassare/);
        assert.match(await page.textContent("main"), /Prossimo ripasso: dopodomani, 5 domande/);
    },

    "ripasso: 320 px e nessuna violazione axe": async ({ page }) => {
        await at(page, DAY);
        await page.setViewportSize({ width: 320, height: 640 });
        await open(page, { progress: { answers: { "010-160/4.4-04": { ok: 0, ko: 1, last: "2026-11-11", result: false, box: 1, due: "2026-11-12" } } } });
        assert.ok(await overflow(page) <= 0);
        let violations = await axeViolations(page);
        if (violations === null) return;
        assert.deepEqual(violations, [], "home con il ripasso");
        await go(page, "#/ripasso");
        assert.ok(await overflow(page) <= 0);
        assert.deepEqual(await axeViolations(page), [], "domanda del ripasso");
        await answer(page, true);
        assert.ok(await overflow(page) <= 0);
        assert.deepEqual(await axeViolations(page), [], "spiegazione con la scatola");
    }
};
