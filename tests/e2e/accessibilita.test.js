// Accessibilità: niente scorrimento orizzontale a 320 px (anche in ogni lezione, con tabelle e
// codice lunghi), nessuna violazione axe in tema chiaro e scuro, uso con la sola tastiera.
const { assert, open, go, ready, overflow, axeViolations } = require("./helpers");

const PAGES = ["#/", "#/010-160/obiettivo/4.4", "#/010-160/lezione/4.4_01", "#/backup"];

module.exports = {
    "320 px: nessuna pagina e nessuna lezione scorre di lato": async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 640 });
        await open(page);
        const lessons = await page.evaluate(() => allLessons(currentExam()).map(item => `#/010-160/lezione/${item.id}`));
        const objectives = await page.evaluate(() => allObjectives(currentExam()).map(item => `#/010-160/obiettivo/${item.objective.id}`));
        for (const hash of ["#/", "#/backup", ...objectives, ...lessons]) {
            await go(page, hash);
            assert.ok(await overflow(page) <= 0, `${hash}: scorrimento orizzontale di ${await overflow(page)} px`);
        }
        // Anche con il testo più grande
        await page.evaluate(() => { settings.textSize = "molto-grande"; applySettings(); });
        for (const hash of ["#/", "#/010-160/lezione/5.3_01", "#/010-160/lezione/4.3_02"]) {
            await go(page, hash);
            assert.ok(await overflow(page) <= 0, `${hash} (testo molto grande): ${await overflow(page)} px`);
        }
    },

    "axe: nessuna violazione, tema chiaro e scuro": async ({ page }) => {
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            await open(page, { progress: { studied: { "010-160:4.4": "2026-11-12" }, read: { "010-160/4.4_01": "2026-11-12" }, last: { lesson: "010-160/4.4_01", scroll: 0 } } });
            for (const hash of PAGES) {
                await go(page, hash);
                const violations = await axeViolations(page);
                if (violations === null) return; // axe-core non installato
                assert.deepEqual(violations, [], `${scheme} ${hash}`);
            }
        }
    },

    "tastiera: dalla home a una lezione e ritorno, senza mouse": async ({ page }) => {
        await open(page);
        await page.keyboard.press("Tab");
        assert.equal(await page.evaluate(() => document.activeElement.id), "skip");
        await page.keyboard.press("Enter");
        assert.equal(await page.evaluate(() => document.activeElement.tagName), "H1");
        assert.equal(await page.evaluate(() => location.hash), "", "il collegamento non cambia pagina");
        await page.focus("#obiettivo-1-3");
        await page.keyboard.press("Enter");
        await ready(page, "#/010-160/obiettivo/1.3");
        await page.focus("#studied");
        await page.keyboard.press("Space");
        assert.equal(await page.isChecked("#studied"), true);
        await page.focus(".lesson-list a");
        await page.keyboard.press("Enter");
        await ready(page, "#/010-160/lezione/1.3_01");
        assert.equal(await page.evaluate(() => document.activeElement.textContent), "1.3 Lezione 1");
        await page.goBack();
        await ready(page, "#/010-160/obiettivo/1.3");
        assert.equal(await page.evaluate(() => document.activeElement.tagName), "H1");
        // Il titolo riceve il fuoco ma senza bordo (su iPad comparirebbe a ogni cambio di pagina)
        assert.equal(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), "none");
        // I pulsanti e i collegamenti invece lo mostrano, usando la tastiera
        await page.keyboard.press("Tab");
        assert.notEqual(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle), "none");
    }
};
