// Lettore delle lezioni: testo integrale identico all'originale, indice delle sezioni, licenza e
// fonte, «letta», lezione precedente e successiva, dimensione del testo, «Riprendi la lettura».
const { assert, open, go, ready, announced, stored } = require("./helpers");

module.exports = {
    "lezione: titolo, indice delle sezioni, licenza e link all'originale": async ({ page }) => {
        await open(page, { hash: "#/010-160/obiettivo/2.1" });
        await page.click(".lesson-list a >> nth=0");
        await ready(page, "#/010-160/lezione/2.1_01");
        assert.equal(await page.evaluate(() => location.hash), "#/010-160/lezione/2.1_01");
        assert.equal(await page.textContent("main h1"), "2.1 Lezione 1");
        assert.equal(await page.locator("main h1").count(), 1);
        assert.equal(await page.evaluate(() => document.activeElement.textContent), "2.1 Lezione 1");
        assert.equal(await page.title(), "2.1 Lezione 1 · Certificazioni LPI");
        assert.match(await page.textContent(".lesson-context"), /Linux Essentials 1\.6 · Argomento 2 · 2\.1 Nozioni di Base sulla Command Line · lezione 1 di 2/);
        assert.equal(await page.getAttribute("article.lesson", "lang"), "it");

        // Indice: le sezioni della lezione; un clic porta il fuoco sulla sezione
        const sections = await page.$$eval(".lesson-index button", nodes => nodes.map(node => node.textContent));
        assert.deepEqual(sections, ["Introduzione", "Esercizi Guidati", "Esercizi Esplorativi", "Sommario", "Risposte agli Esercizi Guidati", "Risposte agli Esercizi Esplorativi"]);
        await page.click(".lesson-index button:has-text('Sommario')");
        assert.equal(await page.evaluate(() => document.activeElement.textContent), "Sommario");

        // Licenza e fonte
        const source = await page.textContent(".lesson-source");
        assert.match(source, /Creative Commons Attribution-NonCommercial-NoDerivatives 4\.0/);
        assert.match(source, /Testo integrale e non modificato/);
        assert.equal(await page.getAttribute(".lesson-source a:has-text('Lezione originale')", "href"), "https://learning.lpi.org/it/learning-materials/010-160/2/2.1/2.1_01/");
        assert.equal(await page.getAttribute(".lesson-source a:has-text('Licenza')", "href"), "https://creativecommons.org/licenses/by-nc-nd/4.0/deed.it");

        // Blocchi di codice e note
        assert.ok(await page.locator(".lesson-pre pre").count() > 3);
        assert.equal(await page.getAttribute(".lesson-pre >> nth=0", "tabindex"), "0", "il codice lungo si scorre anche da tastiera");
    },

    "lezione: il testo nella pagina è identico a quello copiato, per tutte le 24 lezioni": async ({ page }) => {
        await open(page);
        const ids = await page.evaluate(() => allLessons(currentExam()).map(item => item.id));
        assert.equal(ids.length, 24);
        for (const id of ids) {
            await go(page, `#/010-160/lezione/${id}`);
            const result = await page.evaluate(key => {
                const text = node => typeof node === "string" ? node : node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1).map(text).join("");
                const lesson = LPI_LESSONS[key];
                const expected = lesson.body.map(text).join("").replace(/\s+/g, "");
                // Le etichette delle note (Nota, Suggerimento...) le aggiunge il lettore, come il sito
                const article = document.querySelector("article.lesson").cloneNode(true);
                article.querySelectorAll(".lesson-note-label, .lesson-index").forEach(node => node.remove());
                const pres = [...document.querySelectorAll("article.lesson pre")].map(node => node.textContent);
                const expectedPres = [];
                const walk = node => {
                    if (typeof node === "string") return;
                    if (node[0] === "pre") expectedPres.push(text(node));
                    node.slice(node[0] === "a" || node[0] === "note" ? 2 : 1).forEach(walk);
                };
                lesson.body.forEach(walk);
                return {
                    same: article.textContent.replace(/\s+/g, "") === expected,
                    samePre: JSON.stringify(pres) === JSON.stringify(expectedPres),
                    notice: /NoDerivatives 4\.0/.test(document.querySelector(".lesson-source").textContent)
                };
            }, `010-160/${id}`);
            assert.deepEqual(result, { same: true, samePre: true, notice: true }, `lezione ${id}`);
        }
    },

    "lezione: letta, precedente e successiva, ritorno all'obiettivo": async ({ page }) => {
        await open(page, { hash: "#/010-160/lezione/2.1_02" });
        assert.equal(await page.textContent("main h1"), "2.1 Lezione 2");
        await page.check("#lesson-read");
        assert.match((await stored(page)).read["010-160/2.1_02"], /^\d{4}-\d{2}-\d{2}T/);
        const pager = await page.$$eval(".lesson-end .pager a", nodes => nodes.map(node => node.textContent));
        assert.deepEqual(pager, ["← 2.1 lezione 1 di 2", "Obiettivo 2.1", "2.2 lezione unica →"]);
        await page.click(".lesson-end a.next");
        await ready(page, "#/010-160/lezione/2.2_01");
        assert.equal(await page.textContent("main h1"), "2.2 Lezione 1");
        assert.equal(await page.isChecked("#lesson-read"), false);
        await page.click(".lesson-end a:has-text('Obiettivo 2.2')");
        await ready(page, "#/010-160/obiettivo/2.2");
        await go(page, "#/010-160/obiettivo/2.1");
        assert.match(await page.textContent(".lesson-list li >> nth=1"), /✓ letta/);
        await go(page, "#/");
        assert.match(await page.textContent("#summary"), /Lezioni lette: 1 su 24/);
        assert.match(await page.textContent("#obiettivo-2-1"), /lezioni lette 1 su 2/);
        // Prima e ultima lezione
        await go(page, "#/010-160/lezione/1.1_01");
        assert.deepEqual(await page.$$eval(".lesson-end .pager a", nodes => nodes.map(node => node.textContent)), ["Obiettivo 1.1", "1.2 lezione unica →"]);
        await go(page, "#/010-160/lezione/5.4_01");
        assert.deepEqual(await page.$$eval(".lesson-end .pager a", nodes => nodes.map(node => node.textContent)), ["← 5.3 lezione unica", "Obiettivo 5.4"]);
    },

    "lezione: dimensione del testo, ricordata": async ({ page }) => {
        await open(page, { hash: "#/010-160/lezione/3.1_01" });
        const size = () => page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("article.lesson p")).fontSize));
        const normal = await size();
        assert.equal(await page.textContent(".text-size-label"), "Testo: normale");
        assert.equal(await page.isDisabled("button[aria-label='Testo più piccolo']"), true);
        await page.click("button[aria-label='Testo più grande']");
        await page.click("button[aria-label='Testo più grande']");
        assert.equal(await page.textContent(".text-size-label"), "Testo: molto grande");
        assert.equal(await page.isDisabled("button[aria-label='Testo più grande']"), true);
        assert.ok(await size() > normal * 1.2);
        await page.reload();
        await page.waitForSelector("article.lesson");
        assert.equal(await page.evaluate(() => document.documentElement.dataset.textSize), "molto-grande");
    },

    "riprendi la lettura: dalla home, al punto in cui si era arrivati": async ({ page }) => {
        await open(page, { hash: "#/010-160/lezione/4.3_02" });
        await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
        await page.waitForFunction(() => {
            const last = JSON.parse(localStorage.getItem("certlpi.progress.v1")).last;
            return last && last.scroll > 0.4;
        }, null, { timeout: 5000 });
        await go(page, "#/");
        assert.match(await page.textContent("#resume"), /Riprendi la lettura: 4\.3 Dove Sono Memorizzati i Dati, lezione 2 di 2/);
        await page.click("#resume");
        await ready(page, "#/010-160/lezione/4.3_02");
        await page.waitForFunction(() => window.scrollY > 0);
        const ratio = await page.evaluate(() => scrollY / (document.documentElement.scrollHeight - innerHeight));
        assert.ok(ratio > 0.4 && ratio < 0.6, `posizione ripresa: ${ratio}`);
        await announced(page, /ripreso la lezione/);
    },

    "lezione che non si carica: messaggio e link al sito": async ({ page, pageErrors }) => {
        // Senza service worker, così la richiesta bloccata non arriva da una copia salvata
        await page.addInitScript(() => { delete Navigator.prototype.serviceWorker; });
        await page.route("**/lessons/010-160/1.3_01.js", route => route.abort());
        await open(page, { hash: "#/010-160/lezione/1.3_01" });
        assert.equal(await page.textContent("main h1"), "La lezione non si è caricata");
        assert.equal(await page.getAttribute("main a.external", "href"), "https://learning.lpi.org/it/learning-materials/010-160/1/1.3/1.3_01/");
        // L'errore di rete voluto non conta come errore della pagina
        pageErrors.splice(0, pageErrors.length);
    }
};
