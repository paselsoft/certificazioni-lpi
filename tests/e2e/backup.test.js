// Backup dei progressi: scaricare un file, ripristinarlo, file sbagliati, azzerare.
const fs = require("fs");
const { assert, open, go, ready, stored } = require("./helpers");

const PROGRESS = {
    studied: { "010-160:1.1": "2026-11-01", "010-160:2.1": "2026-11-02" },
    read: { "010-160/2.1_01": "2026-11-02", "010-160/2.1_02": "2026-11-03", "010-160/3.3_01": "2026-11-04" },
    last: { lesson: "010-160/3.3_01", scroll: 0.25 },
    answers: { "010-160/2.1-01": { ok: 1, ko: 2, last: "2026-11-04", result: true, box: 2, due: "2026-11-06" } },
    simulations: [{ exam: "010-160", date: "2026-11-04", right: 27, total: 40, seconds: 3100, topics: { "1": [5, 7], "2": [7, 9], "3": [6, 9], "4": [5, 8], "5": [4, 7] } }],
    practice: { "010-160/t2.4-01": "2026-11-04" },
    removed: {}
};

module.exports = {
    "backup: scarica il file con i progressi": async ({ page }) => {
        await open(page, { hash: "#/backup", progress: PROGRESS });
        assert.equal(await page.textContent("main h1"), "Backup dei progressi");
        assert.equal(await page.textContent("#salva + p"), "Adesso: 2 obiettivi studiati, 3 lezioni lette, 1 domanda con almeno una risposta, 1 simulazione d'esame, 1 esercizio al terminale.");
        const [download] = await Promise.all([page.waitForEvent("download"), page.click("#backup-download")]);
        assert.match(download.suggestedFilename(), /^certificazioni-lpi-backup-\d{4}-\d{2}-\d{2}\.json$/);
        const data = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
        assert.equal(data.app, "certificazioni-lpi");
        assert.deepEqual(data.progress, PROGRESS);
    },

    "backup: ripristina da file, dopo la conferma": async ({ page }) => {
        await open(page, { hash: "#/backup" });
        const file = { name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ app: "certificazioni-lpi", version: 1, date: "2026-11-05", progress: PROGRESS })) };
        await page.setInputFiles("#backup-file", file);
        await page.waitForSelector("#backup-apply");
        assert.match(await page.textContent("#backup-result"), /Backup del 05\/11\/2026: 2 obiettivi studiati, 3 lezioni lette, 1 domanda con almeno una risposta, 1 simulazione d'esame, 1 esercizio al terminale\. Sostituisce/);
        assert.equal(await stored(page), null, "niente cambia prima della conferma");
        await page.click("#backup-apply");
        assert.match(await page.textContent("#backup-result"), /Progressi ripristinati/);
        assert.deepEqual(await stored(page), PROGRESS);
        await page.click("#backup-result a");
        await ready(page, "#/");
        assert.match(await page.textContent("#summary"), /Obiettivi studiati: 2 su 19 \(peso 5 su 40\)/);
        assert.match(await page.textContent("#resume"), /3\.3 Trasformare i Comandi in uno Script/);
    },

    "backup: file sbagliati": async ({ page }) => {
        await open(page, { hash: "#/backup" });
        const tryFile = async (content, expected) => {
            await page.setInputFiles("#backup-file", { name: "x.json", mimeType: "application/json", buffer: Buffer.from(content) });
            await page.waitForSelector("#backup-result .warning");
            assert.match(await page.textContent("#backup-result"), expected);
            assert.equal(await page.locator("#backup-apply").count(), 0);
            await page.setInputFiles("#backup-file", []);
        };
        await tryFile("ciao", /non è un backup di Certificazioni LPI, oppure è danneggiato/);
        await tryFile(JSON.stringify({ app: "pipedreams", progress: {} }), /non è un backup di Certificazioni LPI\./);
        await tryFile("   ", /vuoto/);
    },

    "azzera: chiede conferma, poi cancella i progressi": async ({ page }) => {
        await open(page, { hash: "#/backup", progress: PROGRESS });
        await page.click("#reset");
        assert.equal(await page.evaluate(() => document.activeElement.id), "reset-confirm");
        await page.click("text=Annulla");
        assert.equal(await page.locator("#reset-confirm").count(), 0);
        assert.deepEqual(await stored(page), PROGRESS);
        await page.click("#reset");
        await page.click("#reset-confirm");
        assert.deepEqual(await stored(page), { studied: {}, read: {}, last: null, answers: {}, simulations: [], practice: {}, removed: {} });
        await go(page, "#/");
        assert.match(await page.textContent("#summary"), /Obiettivi studiati: 0 su 19/);
    }
};
