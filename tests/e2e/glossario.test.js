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
        // Ogni voce si può segnalare
        const report = await page.evaluate(() => new URL(document.querySelector("#termine-sticky-bit + dd .report-link").href).searchParams.get("title"));
        assert.equal(report, "Errore: termine del glossario «Sticky bit»");
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

    "carte: gira, lo sapevo o no, scatole del ripasso, il giorno dopo tornano le sbagliate": async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-11-22T10:00:00"));
        await open(page, { hash: "#/glossario" });
        const total = await page.evaluate(() => GLOSSARY.length);
        assert.match(await page.textContent(".cards-start .hint"), new RegExp(`^Oggi: 0 carte da ripassare, ${total} mai viste\\.`));
        await page.click("#cards-start");
        await ready(page, "#/glossario/carte");
        assert.equal(await page.textContent("main h1"), "Carte del glossario");
        assert.match(await page.textContent(".meter-label"), /^Carta 1 di 10$/);
        assert.equal(await page.locator("#card-back").count(), 0, "prima di girarla la spiegazione non si vede");
        const first = await page.textContent("#card-term");
        await page.click("#card-flip");
        assert.equal(await page.evaluate(() => document.activeElement.id), "card-back");
        const text = await page.evaluate(term => GLOSSARY.find(entry => entry.term === term).text.replace(/`/g, ""), first);
        assert.equal(await page.textContent("#card-back p:first-child"), text);
        await page.click("#card-yes");
        assert.equal(await page.evaluate(() => document.activeElement.id), "card-term");
        const second = await page.textContent("#card-term");
        await page.click("#card-flip");
        await page.click("#card-no");
        for (let i = 2; i < 10; i++) {
            await page.click("#card-flip");
            await page.click("#card-yes");
        }
        assert.equal(await page.textContent("#cards-result"), "Lo sapevi: 9 su 10");
        assert.equal(await page.evaluate(() => document.activeElement.id), "cards-result");
        assert.deepEqual(await page.$$eval(".cards-missed li", items => items.map(item => item.textContent)), [second]);
        const saved = await page.evaluate(() => progress.cards);
        assert.equal(Object.keys(saved).length, 10);
        const slug = term => term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        assert.deepEqual(saved[`010-160/${slug(first)}`], { ...saved[`010-160/${slug(first)}`], ok: 1, ko: 0, box: 2, last: "2026-11-22", due: "2026-11-24" });
        assert.deepEqual(saved[`010-160/${slug(second)}`], { ...saved[`010-160/${slug(second)}`], ok: 0, ko: 1, box: 1, due: "2026-11-23" });
        assert.equal(await page.locator("#cards-again").count(), 1);
        // Il giorno dopo: la carta sbagliata torna per prima; il ripasso lo dice
        await page.clock.setFixedTime(new Date("2026-11-23T10:00:00"));
        await go(page, "#/ripasso");
        assert.match(await page.textContent("#cards-line"), /Anche 1 termine del glossario da ripassare oggi: 🔄 ripassa con le carte/);
        await page.click("#cards-line a");
        await ready(page, "#/glossario/carte");
        assert.equal(await page.textContent("#card-term"), second);
        await go(page, "#/glossario");
        assert.match(await page.textContent(".cards-start .hint"), new RegExp(`^Oggi: 1 carta da ripassare, ${total - 10} mai viste\\.`));
    },

    "carte di un obiettivo; unione fra dispositivi; nessuna carta per oggi": async ({ page }) => {
        await page.clock.setFixedTime(new Date("2026-11-22T10:00:00"));
        await open(page, { hash: "#/glossario/5.4" });
        const count = await page.evaluate(() => GLOSSARY.filter(entry => entry.objective === "5.4").length);
        await page.click("#cards-start");
        await ready(page, "#/glossario/5.4/carte");
        assert.match(await page.textContent(".meter-label"), new RegExp(`^Carta 1 di ${count}$`));
        for (let i = 0; i < count; i++) {
            const term = await page.textContent("#card-term");
            assert.ok(await page.evaluate(term => GLOSSARY.find(entry => entry.term === term).objective === "5.4", term), term);
            await page.click("#card-flip");
            await page.click("#card-yes");
        }
        assert.equal(await page.textContent("#cards-result"), `Lo sapevi: ${count} su ${count}`);
        assert.equal(await page.locator("#cards-again").count(), 0, "per oggi le carte del 5.4 sono finite");
        await page.click("#cards-body a[href='#/glossario/5.4']");
        await ready(page, "#/glossario/5.4");
        assert.match(await page.textContent(".cards-start .hint"), /Per oggi hai ripassato tutte le carte/);
        await page.click("#cards-start");
        assert.match(await page.textContent("#cards-body"), /Per oggi non ci sono carte/);
        // Unione: per ogni carta vince la risposta più recente
        const merged = await page.evaluate(() => mergeProgress(
            cleanProgress({ cards: { "010-160/ls": { ok: 1, ko: 0, last: "2026-11-20", box: 2, due: "2026-11-22", at: "2026-11-20T10:00:00.000Z" } } }),
            cleanProgress({ cards: { "010-160/ls": { ok: 1, ko: 1, last: "2026-11-21", box: 1, due: "2026-11-22", at: "2026-11-21T10:00:00.000Z" }, "x": { ok: "no" } } })).cards);
        assert.deepEqual(merged, { "010-160/ls": { ok: 1, ko: 1, last: "2026-11-21", box: 1, due: "2026-11-22", at: "2026-11-21T10:00:00.000Z" } });
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
        // Le carte, girate
        await page.emulateMedia({ colorScheme: "light" });
        await go(page, "#/glossario/carte");
        await page.click("#card-flip");
        assert.ok(await overflow(page) <= 0, `carte: scorrimento di ${await overflow(page)} px`);
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            const violations = await axeViolations(page);
            if (violations !== null) assert.deepEqual(violations, [], `carte ${scheme}`);
        }
        await go(page, "#/");
        assert.ok(await overflow(page) <= 0, `pagina principale con il menu più lungo: ${await overflow(page)} px`);
    }
};
