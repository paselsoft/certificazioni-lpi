// Pagina principale e pagine degli obiettivi: argomenti, pesi, lezioni, comandi da conoscere,
// «studiato» salvato nel browser e progressi.
const { assert, open, go, ready, announced, stored } = require("./helpers");

module.exports = {
    "home: 5 argomenti e 19 obiettivi con il peso, progressi a zero": async ({ page }) => {
        await open(page);
        assert.equal(await page.textContent("main h1"), "Linux Essentials 1.6");
        assert.match(await page.textContent(".page-head .lead"), /010-160: 40 domande in 60 minuti\. Si può sostenere fino ad aprile 2027/);
        assert.equal(await page.locator(".topic").count(), 5);
        assert.equal(await page.locator(".objective-item").count(), 19);
        assert.match(await page.textContent("#argomento-1"), /Argomento 1 La Comunità Linux e una Carriera nell'Open Source peso 7/);
        assert.match(await page.textContent("#argomento-3"), /peso 9/);
        const weights = await page.$$eval(".objective-item .weight", nodes => nodes.reduce((sum, node) => sum + Number(node.textContent.replace("peso ", "")), 0));
        assert.equal(weights, 40);
        assert.match(await page.textContent("#summary"), /Obiettivi studiati: 0 su 19 \(peso 0 su 40\)/);
        assert.match(await page.textContent("#summary"), /Lezioni lette: 0 su 24/);
        assert.match(await page.textContent("#obiettivo-3-3"), /3\.3Trasformare i Comandi in uno Scriptpeso 4lezioni lette 0 su 2/);
        assert.equal(await page.locator("#resume").count(), 0, "niente da riprendere");
        assert.equal(await page.title(), "Certificazioni LPI");
        assert.match(await page.textContent(".page-source"), /CC BY-NC-ND 4\.0/);
    },

    "obiettivo: descrizione, peso, lezioni, comandi da conoscere e aree": async ({ page }) => {
        await open(page);
        await page.click("#obiettivo-2-1");
        await ready(page, "#/010-160/obiettivo/2.1");
        assert.equal(await page.evaluate(() => location.hash), "#/010-160/obiettivo/2.1");
        assert.equal(await page.textContent("main h1"), "2.1 Nozioni di Base sulla Command Line");
        assert.equal(await page.evaluate(() => document.activeElement.tagName), "H1", "il fuoco va sul titolo della nuova pagina");
        assert.match(await page.title(), /^2\.1 Nozioni di Base sulla Command Line · Certificazioni LPI$/);
        assert.match(await page.textContent(".page-head"), /Nozioni di base sull'utilizzo della command line di Linux\./);
        assert.equal(await page.textContent(".facts"), "Peso 3 su 40 · Argomento 2: Trovare il Proprio Modo di Operare su un Sistema Linux");
        assert.deepEqual(await page.$$eval(".lesson-list a", nodes => nodes.map(node => [node.textContent, node.getAttribute("href")])),
            [["📖 Lezione 1 di 2", "#/010-160/lezione/2.1_01"], ["📖 Lezione 2 di 2", "#/010-160/lezione/2.1_02"]]);
        assert.deepEqual(await page.$$eval(".terms li", nodes => nodes.map(node => node.textContent)),
            ["Bash", "echo", "history", "La variabile d'ambiente PATH", "export", "type"]);
        assert.match(await page.textContent("#aree + ul"), /Uso delle virgolette/);
        assert.equal(await page.getAttribute("a.external >> nth=0", "href"), "https://learning.lpi.org/it/learning-materials/010-160/2/2.1/");
        assert.equal(await page.getAttribute("a.external >> nth=0", "target"), "_blank");

        // Obiettivo successivo e precedente; il tasto Indietro del browser
        await page.click(".pager a.next");
        await ready(page, "#/010-160/obiettivo/2.2");
        assert.equal(await page.textContent("main h1"), "2.2 Utilizzo della Command Line per Ottenere Aiuto");
        await page.goBack();
        await page.waitForFunction(() => document.querySelector("main h1").textContent.startsWith("2.1"));
        // Dalle briciole all'argomento, nella pagina principale
        await page.click(".breadcrumb a:has-text('Argomento 2')");
        await ready(page, "#/#argomento-2");
        assert.equal(await page.evaluate(() => document.activeElement.id), "argomento-2");
        await go(page, "#/010-160/obiettivo/1.1");
        assert.equal(await page.locator(".pager a").count(), 1, "il primo obiettivo non ha il precedente");
        await go(page, "#/010-160/obiettivo/5.4");
        assert.match(await page.textContent(".terms"), /ln -s/);
        assert.equal(await page.locator(".pager a").count(), 1, "l'ultimo obiettivo non ha il successivo");
        await go(page, "#/010-160/obiettivo/9.9");
        assert.equal(await page.textContent("main h1"), "Pagina non trovata");
    },

    "studiato: resta salvato e aggiorna i progressi": async ({ page }) => {
        await open(page, { hash: "#/010-160/obiettivo/3.3" });
        await page.check("#studied");
        await announced(page, /3\.3 segnato come studiato/);
        await page.reload();
        await page.waitForSelector("#studied");
        assert.equal(await page.isChecked("#studied"), true);
        const saved = await stored(page);
        assert.match(saved.studied["010-160:3.3"], /^\d{4}-\d{2}-\d{2}T/);

        await go(page, "#/");
        assert.match(await page.textContent("#summary"), /Obiettivi studiati: 1 su 19 \(peso 4 su 40\)/);
        assert.match(await page.textContent("#obiettivo-3-3"), /✓ studiato/);
        assert.match(await page.getAttribute("#obiettivo-3-3 >> xpath=..", "class"), /studied/);

        await go(page, "#/010-160/obiettivo/3.3");
        await page.uncheck("#studied");
        assert.deepEqual((await stored(page)).studied, {});
    },

    "giorni di studio di fila: serie, record, ultimi 7 giorni; si contano le attività di oggi": async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-11-24T10:00:00"));
        await open(page);
        assert.equal(await page.textContent("#study-streak"), "Oggi non hai ancora studiato: basta una domanda, una carta o un esercizio per cominciare una serie di giorni di fila.");
        assert.equal(await page.locator("#study-days .study-day").count(), 7);
        assert.equal(await page.locator("#study-days .study-day.is-active").count(), 0);
        // Fino a ieri 4 giorni di fila (venerdì 20 - lunedì 23), un record di 7 a inizio mese
        const days = { "2026-11-20": 3, "2026-11-21": 2, "2026-11-22": 1, "2026-11-23": 4 };
        for (let d = 1; d <= 7; d++) days[`2026-11-0${d}`] = 1;
        await page.evaluate(days => { progress.days = days; saveProgress(false); }, days);
        await go(page, "#/ripasso");
        await go(page, "#/");
        assert.equal(await page.textContent("#study-streak"), "Giorni di studio di fila: 4, fino a ieri. Studia anche oggi per non interrompere la serie. Il tuo record: 7 giorni.");
        const week = await page.$$eval("#study-days .study-day", items => items.map(item => item.textContent));
        assert.deepEqual(week, ["mer–: nessuna attività", "gio–: nessuna attività", "ven✓: 3 attività", "sab✓: 2 attività", "dom✓: 1 attività", "lun✓: 4 attività", "oggi–: nessuna attività"]);
        // Una risposta oggi: la serie arriva a oggi
        await page.evaluate(() => recordAnswer(QUESTIONS[0], true));
        await go(page, "#/ripasso");
        await go(page, "#/");
        assert.match(await page.textContent("#study-streak"), /^Giorni di studio di fila: 5, oggi compreso\. Il tuo record: 7 giorni\.$/);
        assert.equal((await stored(page)).days["2026-11-24"], 1);
        // Unione: per ogni giorno il conteggio più alto
        const merged = await page.evaluate(() => mergeProgress(cleanProgress({ days: { "2026-11-20": 3 } }), cleanProgress({ days: { "2026-11-20": 5, "2026-11-21": 1, "x": 2 } })).days);
        assert.deepEqual(merged, { "2026-11-20": 5, "2026-11-21": 1 });
    },

    "giorni di studio ricavati dai progressi di prima": async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-11-24T10:00:00"));
        await open(page, { progress: {
            answers: { "010-160/2.1-01": { ok: 1, ko: 0, last: "2026-11-23", result: true, box: 2, due: "2026-11-25" } },
            read: { "010-160/2.1_01": "2026-11-22" },
            simulations: [{ exam: "010-160", date: "2026-11-21", right: 30, total: 40, seconds: 3000, topics: {} }]
        } });
        assert.deepEqual(await page.evaluate(() => progress.days), { "2026-11-21": 1, "2026-11-22": 1, "2026-11-23": 1 });
        assert.equal(await page.textContent("#study-streak"), "Giorni di studio di fila: 3, fino a ieri. Studia anche oggi per non interrompere la serie.");
    },

    "salvataggio rovinato: l'app parte lo stesso, con i dati buoni": async ({ page }) => {
        await open(page, { rawProgress: "{non è json" });
        assert.match(await page.textContent("#summary"), /Obiettivi studiati: 0 su 19/);
        const context = page.context();
        const other = await context.newPage();
        await other.addInitScript(() => localStorage.setItem("certlpi.progress.v1", JSON.stringify({
            studied: { "010-160:1.1": "2026-11-12", "010-160:1.2": true, "x": "2026-11-12" },
            read: { "010-160/1.1_01": "2026-11-12", "010-160/1.1_02": 5 },
            last: { lesson: "<script>", scroll: 7 }
        })));
        await other.goto(page.url());
        await other.waitForSelector("#summary");
        assert.match(await other.textContent("#summary"), /Obiettivi studiati: 1 su 19 \(peso 2 su 40\)/);
        assert.match(await other.textContent("#summary"), /Lezioni lette: 1 su 24/);
        assert.equal(await other.locator("#resume").count(), 0);
        await other.close();
    }
};
