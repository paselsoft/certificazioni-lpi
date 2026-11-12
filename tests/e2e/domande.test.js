// Domande per obiettivo (M2): scelta singola, scelta multipla, completamento; il perché di ogni
// opzione, il link alla lezione, il risultato finale, i progressi salvati. E un giro su tutte le
// domande: la risposta giusta viene riconosciuta e nessuna scorre di lato a 320 px.
const { assert, open, go, ready, stored, overflow, axeViolations } = require("./helpers");

// Avvia una serie con le sole domande indicate, nell'ordine dato e con le opzioni nell'ordine scritto
async function only(page, objectiveId, ids) {
    await go(page, `#/010-160/domande/${objectiveId}`);
    await page.evaluate(([objectiveId, ids]) => {
        const exam = currentExam();
        const { objective } = allObjectives(exam).find(item => item.objective.id === objectiveId);
        quiz.session = {
            exam: exam.id, objective: objective.id, index: 0, results: [],
            questions: ids.map(id => {
                const question = QUESTIONS.find(q => q.id === id);
                return { question, options: question.options ? question.options.slice() : null };
            })
        };
        renderQuestion(exam, objective, document.getElementById("quiz-body"), true);
    }, [objectiveId, ids]);
}

// Clicca le opzioni con quei testi (come compaiono nella pagina)
async function choose(page, ...texts) {
    for (const text of texts) {
        const index = await page.evaluate(text => [...document.querySelectorAll(".option-text")].findIndex(node => node.textContent === text), text);
        assert.ok(index >= 0, `opzione non trovata: ${text}`);
        await page.click(`#option-${index}`);
    }
}

module.exports = {
    "obiettivo: il pulsante porta alle sue domande": async ({ page }) => {
        await open(page, { hash: "#/010-160/obiettivo/2.1" });
        assert.equal(await page.textContent("#train"), "🎯 Allenati con le 14 domande");
        await page.click("#train");
        await ready(page, "#/010-160/domande/2.1");
        assert.equal(await page.textContent("main h1"), "Domande: 2.1 Nozioni di Base sulla Command Line");
        assert.equal(await page.title(), "Domande 2.1 Nozioni di Base sulla Command Line · Certificazioni LPI");
        assert.match(await page.textContent(".meter-label"), /^Domanda 1 di 14$/);
        assert.equal(await page.locator("#question-text").count(), 1);
        // Domande in ordine casuale, ma tutte dell'obiettivo e tutte diverse
        const ids = await page.evaluate(() => quiz.session.questions.map(item => item.question.id));
        assert.equal(new Set(ids).size, 14);
        assert.ok(ids.every(id => id.startsWith("2.1-")));
    },

    "scelta singola sbagliata: perché di ogni opzione, la scelta fatta, il link alla sezione": async ({ page }) => {
        await open(page);
        await only(page, "2.1", ["2.1-01"]);
        assert.equal(await page.textContent(".question-legend"), "Scegli una risposta.");
        assert.equal(await page.textContent(".question-code pre"), 'echo "Ciao $USER"');
        await page.click("#check");
        assert.equal(await page.textContent("#form-message"), "Scegli una risposta, poi premi Controlla.");
        await choose(page, "Ciao $USER");
        await page.click("#check");
        assert.equal(await page.textContent("#feedback-title"), "Non è giusto");
        assert.equal(await page.evaluate(() => document.activeElement.id), "feedback-title");
        assert.equal(await page.locator(".explanations li").count(), 4);
        assert.match(await page.textContent(".explanations li.is-right"), /✓ Giusta: Ciao frank/);
        assert.match(await page.textContent(".explanations li:has(.picked)"), /✗ Sbagliata \(la tua scelta\): Ciao \$USER.*virgolette singole/);
        assert.equal(await page.locator("#question-form input:not([disabled])").count(), 0, "dopo la risposta le opzioni sono bloccate");
        assert.equal(await page.isVisible("#check"), false);
        assert.equal(await page.getAttribute(".review-link", "href"), "#/010-160/lezione/2.1_01/Virgolette%20Doppie");
        const saved = (await stored(page)).answers["010-160/2.1-01"];
        assert.deepEqual({ ok: saved.ok, ko: saved.ko, result: saved.result }, { ok: 0, ko: 1, result: false });

        // Il link apre la lezione alla sezione giusta
        await page.click(".review-link");
        await ready(page, "#/010-160/lezione/2.1_01/Virgolette%20Doppie");
        assert.equal(await page.evaluate(() => document.activeElement.textContent), "Virgolette Doppie");
        assert.ok(await page.evaluate(() => scrollY > 200), "la pagina è scesa alla sezione");
    },

    "scelta multipla: servono esattamente N risposte, giusta solo se tutte esatte": async ({ page }) => {
        await open(page);
        await only(page, "2.1", ["2.1-09", "2.1-09"]);
        assert.equal(await page.textContent(".question-legend"), "Scegli 2 risposte.");
        await choose(page, "NOME=Luca");
        await page.click("#check");
        assert.equal(await page.textContent("#form-message"), "Le risposte giuste sono 2: ne hai scelte 1.");
        await choose(page, 'NOME="Luca Rossi"');
        await page.click("#check");
        assert.equal(await page.textContent("#feedback-title"), "✅ Giusto!");
        assert.equal(await page.locator(".explanations li.is-right").count(), 2);
        await page.click("#next");
        assert.equal(await page.evaluate(() => document.activeElement.id), "question-text");
        // Una giusta e una sbagliata: non è giusta
        await choose(page, "NOME=Luca", "NOME = Luca");
        await page.click("#check");
        assert.equal(await page.textContent("#feedback-title"), "Non è giusto");
        const saved = (await stored(page)).answers["010-160/2.1-09"];
        assert.deepEqual({ ok: saved.ok, ko: saved.ko, result: saved.result }, { ok: 1, ko: 1, result: false });
    },

    "completamento: spazi, prompt, maiuscole e risposte in più forme": async ({ page }) => {
        await open(page);
        await only(page, "2.3", ["2.3-11"]);
        assert.equal(await page.textContent(".question-legend"), "Scrivi la risposta.");
        await page.click("#check");
        assert.equal(await page.textContent("#form-message"), "Scrivi una risposta, poi premi Controlla.");
        await page.fill("#fill-answer", "  $ pwd  ");
        await page.press("#fill-answer", "Enter");
        assert.equal(await page.textContent("#feedback-title"), "✅ Giusto!");
        assert.match(await page.textContent(".fill-solution"), /Risposta giusta: pwd/);

        await only(page, "2.3", ["2.3-11"]);
        await page.fill("#fill-answer", "PWD");
        await page.click("#check");
        assert.equal(await page.textContent("#feedback-title"), "Non è giusto", "i comandi distinguono le maiuscole");

        await only(page, "1.3", ["1.3-07"]);
        await page.fill("#fill-answer", "floss");
        await page.click("#check");
        assert.equal(await page.textContent("#feedback-title"), "✅ Giusto!", "per i nomi le maiuscole non contano");

        // tar: opzioni in un altro ordine, con v e senza trattino
        for (const answer of ["tar -zcvf backup.tar.gz documenti/", "tar czf backup.tar.gz documenti"]) {
            await only(page, "3.1", ["3.1-01"]);
            await page.fill("#fill-answer", answer);
            await page.click("#check");
            assert.equal(await page.textContent("#feedback-title"), "✅ Giusto!", answer);
        }
        await only(page, "3.1", ["3.1-01"]);
        await page.fill("#fill-answer", "tar -xzf backup.tar.gz documenti");
        await page.click("#check");
        assert.equal(await page.textContent("#feedback-title"), "Non è giusto");
        assert.match(await page.textContent(".fill-solution"), /Risposte accettate: tar -czf backup\.tar\.gz documenti/);
    },

    "fine della serie: risultato, ripeti le sbagliate, progressi nella home": async ({ page }) => {
        await open(page);
        await only(page, "5.3", ["5.3-01", "5.3-04", "5.3-02"]);
        await choose(page, "644");
        await page.click("#check");
        await page.click("#next");
        await choose(page, "-rwxrwxrwx");
        await page.click("#check");
        await page.click("#next");
        await page.fill("#fill-answer", "750");
        await page.click("#check");
        assert.equal(await page.textContent("#next"), "Vedi il risultato");
        await page.click("#next");
        assert.equal(await page.textContent("#quiz-result"), "Risultato: 2 giuste su 3");
        assert.equal(await page.evaluate(() => document.activeElement.id), "quiz-result");
        assert.equal(await page.locator(".result-list li.is-wrong").count(), 1);
        assert.match(await page.textContent(".result-list li.is-wrong"), /chmod 755 script\.sh/);
        assert.equal(await page.textContent("#retry-wrong"), "Ripeti le sbagliata");
        await page.click("#retry-wrong");
        assert.match(await page.textContent(".meter-label"), /^Domanda 1 di 1$/);
        assert.match(await page.textContent("#question-text"), /chmod 755/);

        await go(page, "#/010-160/obiettivo/5.3");
        assert.match(await page.textContent("#domande + a + .hint"), /Hai risposto a 3 domande su 11: l'ultima risposta è giusta per 2\./);
        await go(page, "#/");
        assert.match(await page.textContent("#summary"), /Domande con l'ultima risposta giusta: 2 su 231/);
        assert.match(await page.textContent("#obiettivo-5-3"), /domande giuste 2 su 11/);
        // Le risposte entrano nel backup
        const backup = await page.evaluate(() => backupData());
        assert.equal(Object.keys(backup.progress.answers).length, 3);
    },

    "tutte le domande: la risposta giusta è riconosciuta, niente scorrimento a 320 px": async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 });
        await open(page);
        const ids = await page.evaluate(() => QUESTIONS.map(q => q.id));
        assert.equal(ids.length, 231);
        const problems = [];
        for (const id of ids) {
            await only(page, id.split("-")[0], [id]);
            const result = await page.evaluate(id => {
                const question = QUESTIONS.find(q => q.id === id);
                if (question.type === "fill") document.getElementById("fill-answer").value = question.answers[0];
                else question.options.forEach((option, index) => { document.getElementById(`option-${index}`).checked = option.ok; });
                document.getElementById("check").click();
                const width = document.documentElement.scrollWidth - document.documentElement.clientWidth;
                return { title: document.getElementById("feedback-title").textContent, width };
            }, id);
            if (result.title !== "✅ Giusto!") problems.push(`${id}: ${result.title}`);
            if (result.width > 0) problems.push(`${id}: scorre di lato di ${result.width} px`);
        }
        assert.deepEqual(problems, []);
        assert.equal(Object.keys((await stored(page)).answers).length, 231);
        assert.ok(await overflow(page) <= 0);
    },

    "domande: nessuna violazione axe, chiaro e scuro, prima e dopo la risposta": async ({ page }) => {
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            await open(page);
            await only(page, "3.2", ["3.2-07"]);
            let violations = await axeViolations(page);
            if (violations === null) return; // axe-core non installato
            assert.deepEqual(violations, [], `${scheme}: domanda`);
            await choose(page, "tail -n 3 n.txt", "head -3 n.txt");
            await page.click("#check");
            violations = await axeViolations(page);
            assert.deepEqual(violations, [], `${scheme}: spiegazione`);
            await page.click("#next");
            violations = await axeViolations(page);
            assert.deepEqual(violations, [], `${scheme}: risultato`);
        }
    }
};
