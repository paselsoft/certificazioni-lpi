// Uso senza connessione: il service worker salva l'app e tutte le lezioni alla prima visita;
// poi, offline, l'app si riapre e ogni lezione si legge.
const { assert, open, go } = require("./helpers");

module.exports = {
    "offline: dopo la prima visita si leggono tutte le lezioni senza connessione": async ({ page, context }) => {
        await open(page);
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.reload();
        await page.waitForFunction(() => navigator.serviceWorker.controller);
        await page.waitForFunction(() => /Tutte le 24 lezioni sono salvate/.test(document.getElementById("offline-status").textContent), null, { timeout: 15000 });

        await context.setOffline(true);
        await page.reload();
        await page.waitForSelector("#summary");
        assert.equal(await page.locator(".objective-item").count(), 19);
        for (const id of ["1.1_01", "3.3_02", "5.4_01"]) {
            await go(page, `#/010-160/lezione/${id}`);
            assert.equal(await page.textContent("main h1"), `${id.split("_")[0]} Lezione ${Number(id.split("_")[1])}`);
            assert.match(await page.textContent(".lesson-source"), /NoDerivatives 4\.0/);
        }
        await context.setOffline(false);
    }
};
