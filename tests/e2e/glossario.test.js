// Glossario (#/glossario): tutti i termini in ordine alfabetico per lettera, la ricerca mentre si
// scrive (senza badare a maiuscole e accenti), il glossario di un obiettivo, i collegamenti.
const { assert, open, go, ready, overflow, axeViolations } = require("./helpers");

const shownTerms = page => page.$$eval(".glossary-term", items => items.filter(item => !item.hidden).map(item => item.textContent));

module.exports = {
    "glossario: tutti i termini, per lettera, con il collegamento all'obiettivo": async ({ page }) => {
        await open(page, { hash: "#/" });
        await page.click(".site-nav a[href='#/glossario']");
        await ready(page, "#/glossario");
        assert.equal(await page.textContent("main h1"), "Glossario");
        assert.equal(await page.title(), "Glossario · Certificazioni LPI");
        assert.equal(await page.getAttribute(".site-nav a[href='#/glossario']", "aria-current"), "page");
        assert.equal(await page.getAttribute(".site-nav a[href='#/']", "aria-current"), null);
        const total = await page.evaluate(() => GLOSSARY.filter(entry => entry.exam === "010-160").length);
        assert.ok(total >= 150, `termini: ${total}`);
        assert.equal(await page.locator(".glossary-term").count(), total);
        assert.equal(await page.textContent("#glossary-count"), `${total} termini.`);
        // Le lettere in ordine; i percorsi come /etc/ vanno sotto la lettera del nome
        const letters = await page.$$eval(".glossary-letter h2", items => items.map(item => item.textContent));
        assert.deepEqual(letters, [...letters].sort((a, b) => a.localeCompare(b, "it")));
        assert.match(await page.textContent("#lettera-e"), /^E$/);
        assert.ok(await page.locator("#lettera-e + dl dt:has-text('/etc/passwd')").count(), "/etc/passwd sotto la E");
        // Ogni voce porta al suo obiettivo
        await page.click("#termine-sticky-bit + dd a");
        await ready(page, "#/010-160/obiettivo/5.4");
        assert.match(await page.textContent("main h1"), /5\.4/);
    },

    "glossario: la ricerca filtra mentre scrivi, senza badare a maiuscole e accenti": async ({ page }) => {
        await open(page, { hash: "#/glossario" });
        await page.fill("#glossary-query", "STICKY");
        assert.deepEqual(await shownTerms(page), ["Sticky bit"]);
        assert.match(await page.textContent("#glossary-count"), /^1 termine trovato su \d+\.$/);
        // Le lettere senza risultati spariscono
        assert.equal(await page.isVisible("#lettera-a"), false);
        assert.equal(await page.isVisible("#lettera-s"), true);
        // «unita» trova «Unità ottica»; più parole, in qualsiasi ordine
        await page.fill("#glossary-query", "unita ottica");
        assert.deepEqual(await shownTerms(page), ["Unità ottica"]);
        await page.fill("#glossary-query", "ottica unita");
        assert.deepEqual(await shownTerms(page), ["Unità ottica"]);
        // Cerca anche nelle spiegazioni
        await page.fill("#glossary-query", "Stallman");
        assert.ok((await shownTerms(page)).includes("Free Software Foundation (FSF)"));
        await page.fill("#glossary-query", "parolachenonce");
        assert.equal(await page.locator(".glossary-term:not([hidden])").count(), 0);
        assert.match(await page.textContent("#glossary-empty"), /Nessun termine con «parolachenonce»/);
        await page.fill("#glossary-query", "");
        assert.equal(await page.isVisible("#glossary-empty"), false);
        assert.equal(await page.locator(".glossary-term:not([hidden])").count(), await page.locator(".glossary-term").count());
    },

    "glossario di un obiettivo, dalla sua pagina": async ({ page }) => {
        await open(page, { hash: "#/010-160/obiettivo/5.4" });
        const count = await page.evaluate(() => GLOSSARY.filter(entry => entry.objective === "5.4").length);
        assert.equal(await page.textContent("#objective-glossary"), `📖 Glossario: ${count} termini dell'obiettivo spiegati in breve`);
        await page.click("#objective-glossary");
        await ready(page, "#/glossario/5.4");
        assert.match(await page.textContent("main h1"), /^Glossario: 5\.4 /);
        assert.equal(await page.locator(".glossary-term").count(), count);
        assert.ok((await shownTerms(page)).includes("Hard link"));
        assert.equal(await page.getAttribute(".site-nav a[href='#/glossario']", "aria-current"), "page");
        await page.click("main a[href='#/glossario']");
        await ready(page, "#/glossario");
        // Un obiettivo che non c'è: pagina non trovata
        await go(page, "#/glossario/9.9");
        assert.doesNotMatch(await page.textContent("main h1"), /Glossario/);
    },

    "glossario: 320 px e nessuna violazione axe (chiaro e scuro)": async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await open(page, { hash: "#/glossario" });
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
        await page.fill("#glossary-query", "link");
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            const violations = await axeViolations(page);
            if (violations !== null) assert.deepEqual(violations, [], scheme);
        }
        await go(page, "#/");
        assert.ok(await overflow(page) <= 0, `pagina principale con il menu più lungo: ${await overflow(page)} px`);
    }
};
