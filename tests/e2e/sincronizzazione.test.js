// Sincronizzazione dei progressi con un repository GitHub privato (sync.js), come in Pipe Dreams.
// L'API di GitHub è simulata: un finto repository in memoria risponde a GET e PUT come
// api.github.com.
const { assert, open, go, ready, stored, overflow, axeViolations } = require("./helpers");

const REPO = "paselsoft/pipedreams-progressi";
const TOKEN = "github_pat_finto";
const FILE = "certificazioni-lpi.json";
const fromBase64 = data => Buffer.from(data, "base64").toString("utf8");
const toBase64 = text => Buffer.from(text, "utf8").toString("base64");
const backupText = progress => JSON.stringify({ app: "certificazioni-lpi", version: 1, date: "2026-11-13", progress });

// Finto GitHub: il file dei progressi, le richieste ricevute, risposte forzate e conflitti
async function fakeGitHub(page, { file = null, conflicts = 0, status = null, offline = false } = {}) {
    const github = { file, sha: file ? "sha-0" : null, puts: [], requests: [], conflicts, status, offline, version: 0 };
    await page.route("https://api.github.com/**", async route => {
        const request = route.request();
        const url = new URL(request.url());
        github.requests.push(`${request.method()} ${url.pathname}`);
        if (github.offline) return route.abort("internetdisconnected");
        if (request.headers().authorization !== `Bearer ${TOKEN}`) return route.fulfill({ status: 401, json: { message: "Bad credentials" } });
        if (github.status) return route.fulfill({ status: github.status, json: { message: "forzato" } });
        if (url.pathname === `/repos/${REPO}`) return route.fulfill({ json: { full_name: REPO, private: true } });
        if (url.pathname !== `/repos/${REPO}/contents/${FILE}`) return route.fulfill({ status: 404, json: { message: "Not Found" } });
        if (request.method() === "GET") {
            if (!github.file) return route.fulfill({ status: 404, json: { message: "Not Found" } });
            return route.fulfill({ json: { sha: github.sha, content: toBase64(github.file).replace(/(.{60})/g, "$1\n") } });
        }
        const body = request.postDataJSON();
        github.puts.push(body);
        // Un altro dispositivo ha appena salvato: lo sha non è più quello giusto
        if (github.conflicts > 0) {
            github.conflicts--;
            github.file = backupText({ studied: { "010-160:5.4": "2026-11-13T08:00:00.000Z" } });
            github.sha = `sha-altro-${github.version++}`;
            return route.fulfill({ status: 409, json: { message: "conflict" } });
        }
        if ((body.sha || null) !== github.sha) return route.fulfill({ status: 409, json: { message: "sha" } });
        github.file = fromBase64(body.content);
        github.sha = `sha-${++github.version}`;
        return route.fulfill({ status: body.sha ? 200 : 201, json: { content: { sha: github.sha } } });
    });
    return github;
}

const remoteProgress = github => JSON.parse(github.file).progress;
const connected = { "certlpi.sync.v1": JSON.stringify({ token: TOKEN, repo: REPO }) };

// Le risposte 404/409/401 finte compaiono nella console come «Failed to load resource»: sono previste
const dropResourceErrors = pageErrors => {
    for (let i = pageErrors.length - 1; i >= 0; i--) if (/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(pageErrors[i])) pageErrors.splice(i, 1);
};

// Apre l'app con altre chiavi nel localStorage (solo alla prima apertura della scheda)
async function openWith(page, storage, options) {
    await page.addInitScript(entries => {
        if (sessionStorage.getItem("sync-init")) return;
        sessionStorage.setItem("sync-init", "1");
        for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
    }, storage);
    await open(page, options);
}

const waitStatus = (page, pattern) => page.waitForFunction(source => new RegExp(source).test(syncState.status), pattern.source);

module.exports = {
    "collegare una chiave crea il file su GitHub": async ({ page, pageErrors }) => {
        const github = await fakeGitHub(page);
        await open(page, { hash: "#/backup", progress: { studied: { "010-160:1.1": "2026-11-10" }, read: { "010-160/1.1_01": "2026-11-10" } } });
        assert.equal(await page.inputValue("#sync-repo"), REPO);
        assert.equal(await page.locator("#sync-reuse").count(), 0, "Pipe Dreams non è collegato in questo browser");
        await page.click("#sync-connect");
        assert.equal(await page.textContent("#sync-message"), "Incolla la chiave creata su GitHub.");
        await page.fill("#sync-token", TOKEN);
        await page.click("#sync-connect");
        await waitStatus(page, /^Sincronizzato alle/);
        assert.match(await page.textContent("#sync-status"), /Sincronizzato alle \d\d:\d\d\./);
        assert.match(await page.textContent("#sync-panel"), /Collegato a paselsoft\/pipedreams-progressi/);
        assert.equal(github.puts.length, 1);
        assert.equal(github.puts[0].sha, undefined, "file nuovo: senza sha");
        assert.match(github.puts[0].message, /^Certificazioni LPI: 1 obiettivo studiato, 1 lezione letta/);
        const remote = JSON.parse(github.file);
        assert.equal(remote.app, "certificazioni-lpi");
        assert.deepEqual(Object.keys(remote.progress.studied), ["010-160:1.1"]);
        // La chiave è solo in questo browser
        assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem("certlpi.sync.v1"))).token, TOKEN);
        assert.ok(github.requests.every(request => request.includes(FILE) || request === `GET /repos/${REPO}`), "solo il file dell'app");
        dropResourceErrors(pageErrors);
    },

    "con Pipe Dreams già collegato basta un tocco": async ({ page, pageErrors }) => {
        const github = await fakeGitHub(page);
        await openWith(page, { "pipedreams.sync.v1": JSON.stringify({ token: TOKEN, repo: REPO, lastSync: "2026-11-13T10:00:00.000Z" }) }, { hash: "#/backup" });
        assert.match(await page.textContent("#sync-reuse"), /Usa la chiave di Pipe Dreams \(paselsoft\/pipedreams-progressi\)/);
        await page.click("#sync-reuse");
        await waitStatus(page, /^Sincronizzato alle/);
        assert.equal(github.puts.length, 1);
        // La chiave di Pipe Dreams non viene toccata
        assert.match(await page.evaluate(() => localStorage.getItem("pipedreams.sync.v1")), /2026-11-13T10:00/);
        dropResourceErrors(pageErrors);
    },

    "unione: si ritrova tutto, vince la risposta più recente, il punto di lettura resta qui": async ({ page, pageErrors }) => {
        const github = await fakeGitHub(page, {
            file: backupText({
                studied: { "010-160:2.1": "2026-11-12T09:00:00.000Z" },
                read: {},
                answers: {
                    "010-160/2.1-01": { ok: 3, ko: 0, last: "2026-11-13", result: true, box: 4, due: "2026-11-21", at: "2026-11-13T09:00:00.000Z" },
                    "010-160/2.1-02": { ok: 0, ko: 1, last: "2026-11-11", result: false, box: 1, due: "2026-11-12", at: "2026-11-11T09:00:00.000Z" }
                },
                simulations: [{ exam: "010-160", date: "2026-11-12", right: 30, total: 40, seconds: 3000, topics: { "1": [6, 7] } }],
                practice: { "010-160/t2.4-01": "2026-11-12T10:00:00.000Z" }
            })
        });
        await openWith(page, connected, {
            progress: {
                read: { "010-160/1.1_01": "2026-11-13T08:00:00.000Z" },
                last: { lesson: "010-160/3.1_01", scroll: 0.5 },
                answers: {
                    "010-160/2.1-01": { ok: 1, ko: 1, last: "2026-11-12", result: false, box: 1, due: "2026-11-13", at: "2026-11-12T08:00:00.000Z" },
                    "010-160/2.1-02": { ok: 1, ko: 1, last: "2026-11-13", result: true, box: 2, due: "2026-11-15", at: "2026-11-13T10:00:00.000Z" }
                }
            }
        });
        await waitStatus(page, /^Sincronizzato alle/);
        const local = await stored(page);
        assert.deepEqual(Object.keys(local.studied), ["010-160:2.1"]);
        assert.deepEqual(Object.keys(local.read), ["010-160/1.1_01"]);
        assert.deepEqual(Object.keys(local.practice), ["010-160/t2.4-01"]);
        assert.equal(local.simulations.length, 1);
        assert.equal(local.answers["010-160/2.1-01"].box, 4, "su GitHub la risposta era più recente");
        assert.equal(local.answers["010-160/2.1-02"].box, 2, "qui la risposta era più recente");
        assert.deepEqual(local.last, { lesson: "010-160/3.1_01", scroll: 0.5 });
        // Su GitHub l'unione, senza il punto di lettura
        const remote = remoteProgress(github);
        assert.deepEqual(Object.keys(remote.read), ["010-160/1.1_01"]);
        assert.equal(remote.answers["010-160/2.1-02"].box, 2);
        assert.equal(remote.last, null);
        // La pagina principale si è aggiornata con i progressi arrivati
        await page.waitForFunction(() => /✓ studiato/.test(document.getElementById("obiettivo-2-1").textContent));
        // Una seconda sincronizzazione senza novità non salva niente
        const puts = github.puts.length;
        await page.evaluate(() => syncNow());
        assert.equal(github.puts.length, puts);
        dropResourceErrors(pageErrors);
    },

    "dopo un progresso si salva su GitHub; una spunta tolta resta tolta": async ({ page, pageErrors }) => {
        const github = await fakeGitHub(page, { file: backupText({ studied: { "010-160:3.3": "2026-11-12T09:00:00.000Z" } }) });
        await openWith(page, connected, { hash: "#/010-160/obiettivo/3.3" });
        await waitStatus(page, /^Sincronizzato alle/);
        // La pagina dell'obiettivo si aggiorna da sola con la spunta arrivata da GitHub
        await page.waitForFunction(() => document.getElementById("studied").checked);
        // Tolta qui: il salvataggio parte da solo qualche istante dopo
        await page.evaluate(() => { syncState.delay = 100; });
        const puts = github.puts.length;
        await page.uncheck("#studied");
        await page.waitForFunction(() => syncState.status.startsWith("Sincronizzato") && !syncState.running && !syncState.timer);
        assert.ok(github.puts.length > puts, "salvato su GitHub");
        const remote = remoteProgress(github);
        assert.deepEqual(remote.studied, {}, "su GitHub non c'è più");
        assert.match(remote.removed["studied|010-160:3.3"], /^\d{4}-\d{2}-\d{2}T/);
        // Ricaricando, la spunta non torna dalla copia di GitHub
        await page.reload();
        await page.waitForSelector("#studied");
        await waitStatus(page, /^Sincronizzato alle/);
        assert.equal(await page.isChecked("#studied"), false);
        // Rimessa: vince di nuovo la spunta, la più recente
        await page.evaluate(() => { syncState.delay = 100; });
        await page.check("#studied");
        await page.waitForFunction(() => !syncState.running && !syncState.timer && syncState.status.startsWith("Sincronizzato"));
        const again = remoteProgress(github);
        assert.ok(again.studied["010-160:3.3"]);
        assert.equal(again.removed["studied|010-160:3.3"], undefined);
        dropResourceErrors(pageErrors);
    },

    "conflitto: un altro dispositivo salva nello stesso momento": async ({ page, pageErrors }) => {
        const github = await fakeGitHub(page, { conflicts: 1 });
        await openWith(page, connected, { progress: { studied: { "010-160:1.1": "2026-11-13T09:00:00.000Z" } } });
        await waitStatus(page, /^Sincronizzato alle/);
        const remote = remoteProgress(github);
        assert.deepEqual(Object.keys(remote.studied).sort(), ["010-160:1.1", "010-160:5.4"], "i progressi dei due dispositivi, uniti");
        assert.deepEqual(Object.keys((await stored(page)).studied).sort(), ["010-160:1.1", "010-160:5.4"]);
        dropResourceErrors(pageErrors);
    },

    "chiave sbagliata, permessi, rete assente, scollegare": async ({ page, pageErrors }) => {
        const github = await fakeGitHub(page);
        await open(page, { hash: "#/backup" });
        await page.fill("#sync-token", "github_pat_sbagliato");
        await page.click("#sync-connect");
        await page.waitForFunction(() => /^Non collegato/.test(document.getElementById("sync-message").textContent));
        assert.match(await page.textContent("#sync-message"), /la chiave non è valida o è scaduta/);
        assert.equal(await page.evaluate(() => localStorage.getItem("certlpi.sync.v1")), null);
        // Collegata, poi GitHub nega la scrittura
        await page.fill("#sync-token", TOKEN);
        await page.click("#sync-connect");
        await waitStatus(page, /^Sincronizzato alle/);
        github.status = 403;
        await page.click("#sync-now");
        await waitStatus(page, /^Non sincronizzato: la chiave non ha il permesso di scrivere/);
        // Senza rete
        github.status = null;
        github.offline = true;
        await page.click("#sync-now");
        await waitStatus(page, /^Senza connessione/);
        // Con la sincronizzazione collegata «Azzera» avvisa
        await page.click("#reset");
        assert.match(await page.textContent("#reset + .backup-result"), /sincronizzazione è collegata/);
        await page.click("text=Annulla");
        // Scollegare cancella la chiave da questo browser
        await page.click("#sync-disconnect");
        await page.click("#sync-disconnect-confirm");
        assert.equal(await page.evaluate(() => localStorage.getItem("certlpi.sync.v1")), null);
        assert.equal(await page.locator("#sync-connect").count(), 1);
        dropResourceErrors(pageErrors);
    },

    "pagina Backup con la sincronizzazione: 320 px e nessuna violazione axe": async ({ page, pageErrors }) => {
        await fakeGitHub(page);
        await page.setViewportSize({ width: 320, height: 700 });
        await openWith(page, { "pipedreams.sync.v1": JSON.stringify({ token: TOKEN, repo: REPO }) }, { hash: "#/backup" });
        assert.ok(await overflow(page) <= 0);
        let violations = await axeViolations(page);
        if (violations !== null) assert.deepEqual(violations, [], "scollegato");
        await page.click("#sync-reuse");
        await waitStatus(page, /^Sincronizzato alle/);
        assert.ok(await overflow(page) <= 0);
        violations = await axeViolations(page);
        if (violations !== null) assert.deepEqual(violations, [], "collegato");
        dropResourceErrors(pageErrors);
    }
};
