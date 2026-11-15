// «Sono pronto?» (readiness.js): riepilogo per obiettivo che unisce domande, ripasso, simulazioni,
// lezioni ed esercizi; stima «se l'esame fosse oggi»; obiettivi più deboli e serie di domande
// «Allenati sui punti deboli». L'orologio del browser è fermato su un giorno preciso.
const fs = require("fs");
const path = require("path");
const { assert, open, go, ready, stored, overflow, axeViolations } = require("./helpers");

const DAY = "2026-11-15T10:00:00";
const TODAY = "2026-11-15";
const at = (page, date) => page.clock.setFixedTime(new Date(date));

// Le domande, lette dai file dell'app: { "2.1": ["2.1-01", ...], ... }
const IDS = {};
const addQuestions = (exam, list) => list.forEach(q => { (IDS[q.id.split("-")[0]] = IDS[q.id.split("-")[0]] || []).push(q.id); });
for (const n of [1, 2, 3, 4, 5]) eval(fs.readFileSync(path.join(__dirname, "..", "..", "questions", "010-160", `${n}.js`), "utf8"));
const TOTAL = Object.values(IDS).reduce((sum, list) => sum + list.length, 0);

const entry = (right, due = "2026-11-20") => ({ ok: right ? 1 : 0, ko: right ? 0 : 1, last: "2026-11-14", result: right, box: right ? 2 : 1, due });
// Risposte: per ogni obiettivo indicato, le prime «right» domande giuste e le «wrong» seguenti sbagliate
function answers(spec) {
    const out = {};
    Object.entries(spec).forEach(([objective, [right, wrong]]) => {
        IDS[objective].slice(0, right).forEach(id => { out[`010-160/${id}`] = entry(true); });
        IDS[objective].slice(right, right + wrong).forEach(id => { out[`010-160/${id}`] = entry(false, TODAY); });
    });
    return out;
}
const allRight = () => answers(Object.fromEntries(Object.keys(IDS).map(objective => [objective, [IDS[objective].length, 0]])));
const simulation = (right, topics) => ({ exam: "010-160", date: "2026-11-14", right, total: 40, seconds: 3000, topics });

// Risponde alla domanda mostrata, giusta o sbagliata
async function answer(page, right) {
    await page.evaluate(right => {
        const { question, options } = quiz.session.questions[quiz.session.index];
        if (question.type === "fill") {
            document.getElementById("fill-answer").value = right ? question.answers[0] : "risposta sbagliata";
        } else {
            const wrong = options.findIndex(option => !option.ok);
            const marks = options.map(option => option.ok);
            if (!right) marks[marks.indexOf(true)] = false, marks[wrong] = true;
            marks.forEach((on, index) => { document.getElementById(`option-${index}`).checked = on; });
        }
        document.getElementById("check").click();
    }, right);
}

module.exports = {
    "senza risposte: tutto da iniziare, stima a zero, prima gli obiettivi che pesano di più": async ({ page }) => {
        await at(page, DAY);
        await open(page);
        assert.match(await page.textContent("#ready-link"), /Sono pronto\?/);
        await page.click("#ready-link");
        await ready(page, "#/pronto");
        assert.equal(await page.textContent("main h1"), "Sono pronto?");
        assert.equal(await page.title(), "Sono pronto? · Certificazioni LPI");
        assert.equal(await page.getAttribute(".site-nav a[href='#/pronto']", "aria-current"), "page");
        assert.equal(await page.getAttribute(".site-nav a[href='#/']", "aria-current"), null);
        assert.match(await page.textContent("#ready-verdict"), /Non hai ancora risposto a nessuna domanda/);
        assert.match(await page.textContent("#ready-estimate"), /circa 0 domande giuste su 40 \(0%\)/);
        assert.match(await page.textContent("#ready-seen"), new RegExp(`0 su ${TOTAL}`));
        assert.match(await page.textContent("#ready-sims"), /Non hai ancora fatto simulazioni/);
        assert.equal(await page.locator(".ready-item").count(), 19);
        assert.equal(await page.locator(".ready-item.ready-new").count(), 19);
        assert.match(await page.textContent("#pronto-3-3"), /3\.3 Trasformare i Comandi in uno Script\s*peso 4\s*Da iniziare/);
        assert.match(await page.textContent("#pronto-3-3 .ready-facts"), new RegExp(`mai viste ${IDS["3.3"].length} · lezioni lette 0 su 2 · esercizi al terminale 0 su 1\\.`));
        // Senza risposte l'ordine è quello del peso: 3.3 (4), poi gli obiettivi di peso 3
        const weak = await page.locator("#ready-weak li a").allTextContents();
        assert.equal(weak.length, 4);
        assert.match(weak[0], /^3\.3 /);
        assert.deepEqual(weak.slice(1).map(text => text.slice(0, 3)).sort(), ["2.1", "3.2", "4.3"]);
        assert.match(await page.textContent("#ready-start"), /Allenati sui punti deboli \(10 domande\)/);
    },

    "con risposte, lezioni, esercizi e simulazioni: livelli, numeri e stima": async ({ page }) => {
        await at(page, DAY);
        const n33 = IDS["3.3"].length, n21 = IDS["2.1"].length, n43 = IDS["4.3"].length;
        const half = Math.ceil(n21 / 2);
        await open(page, {
            hash: "#/pronto",
            progress: {
                answers: answers({ "3.3": [n33, 0], "2.1": [half, 2], "4.3": [2, 5] }),
                read: { "010-160/2.1_01": "2026-11-13" },
                practice: { "010-160/t2.1-01": "2026-11-13", "010-160/t2.1-02": "2026-11-13" },
                simulations: [
                    simulation(20, { 1: [4, 7], 2: [5, 9], 3: [5, 9], 4: [3, 8], 5: [3, 7] }),
                    simulation(30, { 1: [6, 7], 2: [7, 9], 3: [8, 9], 4: [4, 8], 5: [5, 7] })
                ]
            }
        });
        const answered = n33 + half + 2 + 7;
        assert.match(await page.textContent("#ready-verdict"), new RegExp(`È presto per dirlo: hai risposto a ${answered} domande su ${TOTAL}`));
        const estimate = 4 + 3 * half / n21 + 3 * 2 / n43;
        assert.match(await page.textContent("#ready-estimate"),
            new RegExp(`circa ${Math.round(estimate)} domande giuste su 40 \\(${Math.round(estimate / 40 * 100)}%\\)`));
        assert.equal(await page.getAttribute("#ready-estimate progress", "max"), "40");
        assert.match(await page.textContent("#ready-sims"), /Ultime 2 simulazioni d'esame: in media 63% di risposte giuste/);
        // 3.3 tutte giuste: solido
        assert.match(await page.textContent("#pronto-3-3 .ready-level"), /Solido/);
        assert.match(await page.textContent("#pronto-3-3 .meter-label"), new RegExp(`domande giuste ${n33} su ${n33} \\(100%\\)`));
        assert.ok(await page.locator("#pronto-3-3.ready-solid").count());
        // 2.1 metà giuste, due sbagliate (in scadenza oggi), una lezione letta, due esercizi fatti
        assert.equal(await page.textContent("#pronto-2-1 .ready-level"), "Da rinforzare");
        assert.match(await page.textContent("#pronto-2-1 .ready-facts"),
            new RegExp(`mai viste ${n21 - half - 2} · sbagliate l'ultima volta 2 · da ripassare oggi 2 · lezioni lette 1 su 2 · esercizi al terminale 2 su 4\\.`));
        assert.equal(await page.getAttribute("#pronto-2-1 .ready-actions a", "href"), "#/010-160/domande/2.1");
        // 4.3: 2 giuste su 15, debole; niente esercizi al terminale
        assert.equal(await page.textContent("#pronto-4-3 .ready-level"), "Debole");
        assert.doesNotMatch(await page.textContent("#pronto-4-3 .ready-facts"), /esercizi/);
        assert.equal(await page.textContent("#pronto-1-1 .ready-level"), "Da iniziare");
        // Simulazioni per argomento (somma delle ultime)
        assert.match(await page.textContent("#pronto-argomento-4 ~ .ready-topic-sims"), /Nelle ultime 2 simulazioni: 7 giuste su 16 \(44%\)\./);
        // I più deboli: 3.3 è solido e resta fuori; prima 3.2 (peso 3, tutto da fare), poi 4.3
        // (peso 3, 2 giuste su 15); 2.1, a metà, vale meno degli obiettivi di peso 2 mai iniziati
        const weak = await page.locator("#ready-weak li a").allTextContents();
        assert.deepEqual(weak.slice(0, 2).map(text => text.slice(0, 3)), ["3.2", "4.3"]);
        assert.ok(!weak.some(text => /^(3\.3|2\.1) /.test(text)));
        assert.match(await page.textContent("#ready-weak li:nth-child(2)"), new RegExp(`: debole, domande giuste 2 su ${n43}, peso 3$`));
        // Dal nome nell'elenco si arriva alla riga dell'obiettivo, restando nella pagina
        await page.click("#ready-weak li:nth-child(2) a");
        assert.equal(await page.evaluate(() => document.activeElement.id), "pronto-4-3");
        assert.equal(await page.evaluate(() => location.hash), "#/pronto");
        // Anche dalla pagina principale
        await go(page, "#/");
        assert.equal(await page.getAttribute("#ready-link", "href"), "#/pronto");
    },

    "allenati sui punti deboli: prima le sbagliate, poi le mai viste; le risposte entrano nel ripasso": async ({ page }) => {
        await at(page, DAY);
        // Tutto giusto tranne 4.3 (3 sbagliate, il resto mai visto) e 5.1 (2 sbagliate, il resto mai visto)
        const progress = { answers: allRight() };
        IDS["4.3"].forEach(id => { delete progress.answers[`010-160/${id}`]; });
        IDS["5.1"].forEach(id => { delete progress.answers[`010-160/${id}`]; });
        Object.assign(progress.answers, answers({ "4.3": [0, 3], "5.1": [0, 2] }));
        await open(page, { hash: "#/pronto", progress });
        assert.deepEqual((await page.locator("#ready-weak li a").allTextContents()).map(text => text.slice(0, 3)), ["4.3", "5.1"]);
        await page.click("#ready-start");
        await ready(page, "#/pronto/domande");
        assert.equal(await page.textContent("main h1"), "Allenati sui punti deboli");
        assert.equal(await page.getAttribute(".site-nav a[href='#/pronto']", "aria-current"), "page");
        const session = await page.evaluate(() => quiz.session.questions.map(item => item.question.id));
        assert.equal(session.length, 10);
        assert.ok(session.every(id => /^(4\.3|5\.1)-/.test(id)), "solo dagli obiettivi deboli");
        const wrongBefore = [...IDS["4.3"].slice(0, 3), ...IDS["5.1"].slice(0, 2)];
        assert.deepEqual(session.slice(0, 5).sort(), wrongBefore.sort(), "prima le cinque sbagliate");
        assert.match(await page.textContent(".question-objective"), /^Obiettivo (4\.3|5\.1): /);
        // Nove giuste e una sbagliata
        for (let i = 0; i < 10; i++) {
            await answer(page, i !== 9);
            await page.click("#next");
        }
        assert.equal(await page.textContent("#quiz-result"), "Risultato: 9 giuste su 10");
        const saved = await stored(page);
        assert.equal(saved.answers[`010-160/${session[0]}`].result, true);
        assert.equal(saved.answers[`010-160/${session[0]}`].box, 2);
        assert.equal(saved.answers[`010-160/${session[9]}`].result, false);
        // «Ripeti la sbagliata» resta una serie di punti deboli
        await page.click("#retry-wrong");
        assert.equal(await page.evaluate(() => quiz.session.kind), "weak");
        await answer(page, true);
        await page.click("#next");
        assert.equal(await page.textContent("#quiz-result"), "Risultato: 1 giuste su 1");
        // Un'altra serie, poi il riepilogo aggiornato
        await page.click("#weak-more");
        const again = await page.evaluate(() => quiz.session.questions.map(item => item.question.id));
        assert.ok(again.length > 0 && again.every(id => /^(4\.3|5\.1)-/.test(id)));
        await page.click("main .breadcrumb a[href='#/pronto']");
        await ready(page, "#/pronto");
        assert.match(await page.textContent("#pronto-4-3 .ready-facts"), /mai viste/);
        assert.doesNotMatch(await page.textContent("#pronto-4-3 .ready-level"), /Da iniziare/);
    },

    "tutto solido: buon punto solo con le simulazioni; niente punti deboli": async ({ page }) => {
        await at(page, DAY);
        const topics = { 1: [6, 7], 2: [8, 9], 3: [8, 9], 4: [7, 8], 5: [6, 7] };
        await open(page, { hash: "#/pronto", progress: { answers: allRight() } });
        assert.match(await page.textContent("#ready-verdict"), /Quasi: le domande le sai \(stima al 100%\)\. Ora fai almeno due simulazioni/);
        assert.match(await page.textContent("#ready-estimate"), /circa 40 domande giuste su 40 \(100%\)/);
        assert.equal(await page.locator(".ready-item.ready-solid").count(), 19);
        assert.match(await page.textContent("#ready-all-solid"), /Tutti gli obiettivi sono solidi/);
        assert.equal(await page.locator("#ready-start").count(), 0);
        await go(page, "#/pronto/domande");
        assert.match(await page.textContent("#quiz-body"), /Non ci sono punti deboli/);
        // Con due simulazioni sopra il 75%
        await page.evaluate(sims => { progress.simulations = sims; saveProgress(false); }, [simulation(35, topics), simulation(35, topics)]);
        await go(page, "#/pronto");
        assert.match(await page.textContent("#ready-verdict"), /Sei a buon punto: la stima è al 100% delle domande/);
        // Con due simulazioni sotto il 75%
        await page.evaluate(sims => { progress.simulations = sims; saveProgress(false); }, [simulation(20, topics), simulation(22, topics)]);
        await go(page, "#/");
        await go(page, "#/pronto");
        assert.match(await page.textContent("#ready-verdict"), /nelle ultime simulazioni sei sotto il 75%/);
    },

    "sono pronto: 320 px e nessuna violazione axe (riepilogo e punti deboli)": async ({ page }) => {
        await at(page, DAY);
        await page.setViewportSize({ width: 320, height: 640 });
        await open(page, {
            hash: "#/pronto",
            progress: {
                answers: answers({ "3.3": [IDS["3.3"].length, 0], "2.1": [7, 2], "4.3": [2, 5] }),
                simulations: [simulation(30, { 1: [6, 7], 2: [7, 9], 3: [8, 9], 4: [4, 8], 5: [5, 7] })]
            }
        });
        assert.equal(await overflow(page), 0, "niente scorrimento orizzontale nel riepilogo");
        let violations = await axeViolations(page);
        if (violations) assert.deepEqual(violations, []);
        await go(page, "#/pronto/domande");
        assert.equal(await overflow(page), 0, "niente scorrimento orizzontale nelle domande");
        violations = await axeViolations(page);
        if (violations) assert.deepEqual(violations, []);
        await go(page, "#/");
        assert.equal(await overflow(page), 0, "niente scorrimento orizzontale nella pagina principale");
    }
};
