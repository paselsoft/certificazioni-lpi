// Strumenti comuni dei test nel browser.
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

// Indirizzo del server avviato da run.js
const appUrl = (hash = "") => (process.env.E2E_BASE_URL || "http://127.0.0.1:8000/") + hash;

// Apre l'app con progressi e preferenze iniziali. Lo stato viene scritto solo alla prima apertura
// della scheda: i ricaricamenti successivi conservano ciò che l'app ha salvato (il segno «già
// inizializzato» sta in window.name, che resta nella scheda tra una navigazione e l'altra).
// rawProgress scrive esattamente quel testo come salvataggio (per provare dati rovinati).
async function open(page, { hash = "", progress, settings, rawProgress } = {}) {
    const stored = rawProgress ?? (progress ? JSON.stringify(progress) : null);
    await page.addInitScript(([p, s]) => {
        if (window.name === "e2e-init") return;
        window.name = "e2e-init";
        if (p !== null) localStorage.setItem("certlpi.progress.v1", p);
        if (s !== null) localStorage.setItem("certlpi.settings.v1", s);
    }, [stored, settings ? JSON.stringify(settings) : null]);
    await page.goto(appUrl(hash));
    await page.waitForFunction(() => document.body.dataset.route);
}

// Va a un indirizzo dell'app (dopo il #) e aspetta che la pagina sia pronta
async function go(page, hash) {
    await page.evaluate(target => { location.hash = target; }, hash);
    await page.waitForFunction(target => document.body.dataset.route === target, hash);
}

// Aspetta l'annuncio per i lettori di schermo che corrisponde a re
const announced = (page, re) => page.waitForFunction(source => new RegExp(source).test(document.getElementById("announce").textContent), re.source);

// Aspetta che la pagina con quell'indirizzo sia pronta
const ready = (page, hash) => page.waitForFunction(target => document.body.dataset.route === target, hash);

const stored = page => page.evaluate(() => JSON.parse(localStorage.getItem("certlpi.progress.v1")));

// Larghezza in più rispetto alla finestra: deve essere 0 (niente scorrimento orizzontale)
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// Controllo di accessibilità con axe-core, se è installato (in CI sì)
async function axeViolations(page) {
    let axe = null;
    try {
        axe = fs.readFileSync(require.resolve("axe-core/axe.min.js", { paths: [process.cwd(), path.join(__dirname, "..", "..")] }), "utf8");
    } catch (e) {
        return null;
    }
    await page.addScriptTag({ content: axe });
    return page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] });
        return result.violations.map(v => `${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(", ")}`);
    });
}

module.exports = { assert, appUrl, open, go, ready, announced, stored, overflow, axeViolations };
