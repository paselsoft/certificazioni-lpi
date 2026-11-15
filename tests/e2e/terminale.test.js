// Pratica al terminale (M5): elenco degli esercizi, il terminale (comandi, errori, ↑ ↓, prompt),
// gli obiettivi che si spuntano, l'esercizio completato e salvato, suggerimento e soluzione,
// «Ricomincia», il terminale libero; tutte le soluzioni funzionano anche scritte nella pagina.
const { assert, open, go, ready, stored, overflow, axeViolations } = require("./helpers");

async function type(page, line) {
    await page.fill("#terminal-input", line);
    await page.press("#terminal-input", "Enter");
}
const outputText = page => page.evaluate(() => document.getElementById("terminal-output").innerText);

module.exports = {
    "elenco: esercizi per obiettivo, progressi e terminale libero": async ({ page }) => {
        await open(page, { hash: "#/terminale" });
        assert.equal(await page.textContent("main h1"), "Pratica al terminale");
        const count = await page.evaluate(() => EXERCISES.length);
        assert.ok(count >= 30, `esercizi: ${count}`);
        assert.equal(await page.locator(".exercise-link").count(), count);
        assert.match(await page.textContent(".meter-label"), new RegExp(`Esercizi completati: 0 su ${count}`));
        assert.match(await page.textContent("#pratica-2-4"), /2\.4 Creazione, Spostamento ed Eliminazione di File/);
        assert.equal(await page.getAttribute(".site-nav a[href='#/terminale']", "aria-current"), "page");
        // Anche dalla pagina dell'obiettivo
        await go(page, "#/010-160/obiettivo/3.1");
        assert.ok(await page.locator("#pratica + .exercise-list li").count() >= 4);
    },

    "esercizio: comandi, errori, prompt, obiettivi spuntati, completato e salvato": async ({ page }) => {
        await open(page, { hash: "#/terminale/t2.3-01" });
        assert.equal(await page.textContent("main h1"), "Dove sono?");
        assert.equal(await page.textContent(".terminal-line .terminal-prompt"), "anna@lpi:~$ ");
        assert.equal(await page.locator("#goals .goal.met").count(), 0);
        await type(page, "ls");
        assert.match(await outputText(page), /anna@lpi:~\$ ls\ndocumenti\s+foto\s+note\.txt\s+progetti/);
        await type(page, "cd nonesiste");
        assert.equal(await page.textContent(".terminal-error"), "bash: cd: nonesiste: File o directory non esistente");
        await type(page, "cd documenti");
        assert.equal(await page.textContent(".terminal-line .terminal-prompt"), "anna@lpi:~/documenti$ ");
        assert.equal(await page.locator("#goals .goal.met").count(), 1, "il primo obiettivo è spuntato");
        assert.match(await page.textContent("#goals .goal.met"), /Sei in .*\(fatto\)/);
        assert.equal(await page.isVisible("#practice-success"), false);
        await type(page, "pwd");
        await page.waitForSelector("#practice-success:not([hidden])");
        assert.match(await page.textContent("#practice-success"), /Esercizio completato!.*pwd/s);
        assert.equal(await page.evaluate(() => document.activeElement.id), "terminal-input", "il fuoco resta sulla riga di comando");
        assert.match((await stored(page)).practice["010-160/t2.3-01"], /^\d{4}-\d{2}-\d{2}T/);
        // ↑ e ↓ richiamano i comandi
        await page.press("#terminal-input", "ArrowUp");
        assert.equal(await page.inputValue("#terminal-input"), "pwd");
        await page.press("#terminal-input", "ArrowUp");
        assert.equal(await page.inputValue("#terminal-input"), "cd documenti");
        await page.press("#terminal-input", "ArrowDown");
        assert.equal(await page.inputValue("#terminal-input"), "pwd");
        // Esercizio successivo, ed elenco con il segno «fatto»
        await page.click("#practice-next");
        await ready(page, "#/terminale/t2.3-02");
        await go(page, "#/terminale");
        assert.match(await page.textContent(".meter-label"), /Esercizi completati: 1 su/);
        assert.match(await page.textContent(".exercise-list li:has-text('Dove sono?')"), /✓ fatto/);
    },

    "suggerimento, soluzione e «Ricomincia»": async ({ page }) => {
        await open(page, { hash: "#/terminale/t2.4-04" });
        await page.click("#practice-hint");
        assert.match(await page.textContent("#practice-help"), /rmdir/);
        await page.click("#practice-solution");
        assert.equal(await page.textContent("#practice-help pre"), "rm -r vecchi");
        await type(page, "rmdir vecchi");
        assert.match(await outputText(page), /rmdir: rimozione di 'vecchi' non riuscita: Directory non vuota/);
        await type(page, "rm -r documenti foto");
        await page.click("#practice-restart");
        assert.equal(await outputText(page), "");
        await type(page, "ls");
        const listing = await outputText(page);
        assert.ok(/\bdocumenti\b/.test(listing) && /\bfoto\b/.test(listing) && /\bvecchi\b/.test(listing), "dopo «Ricomincia» il file system è come all'inizio");
        await type(page, "rm -r vecchi");
        await page.waitForSelector("#practice-success:not([hidden])");
    },

    "tutte le soluzioni, scritte nel terminale della pagina, completano l'esercizio": async ({ page }) => {
        await open(page, { hash: "#/terminale" });
        const exercises = await page.evaluate(() => EXERCISES.map(exercise => ({ id: exercise.id, solution: exercise.solution })));
        const problems = [];
        for (const exercise of exercises) {
            await go(page, `#/terminale/${exercise.id}`);
            for (const line of exercise.solution) await type(page, line);
            if (!await page.isVisible("#practice-success")) problems.push(exercise.id);
        }
        assert.deepEqual(problems, []);
        assert.equal(Object.keys((await stored(page)).practice).length, exercises.length);
    },

    "script: bash file, ./file con il permesso, argomenti, exit e PATH": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        await type(page, "echo '#!/bin/bash' > ciao.sh");
        await type(page, "echo 'echo \"Ciao, $1 ($# argomenti, sono $0)\"' >> ciao.sh");
        await type(page, "echo 'exit 3' >> ciao.sh");
        await type(page, "./ciao.sh");
        assert.equal(await page.textContent(".terminal-error"), "bash: ./ciao.sh: Permesso negato");
        await type(page, "bash ciao.sh Luca 'due parole'");
        assert.equal(await last(), "Ciao, Luca (2 argomenti, sono ciao.sh)");
        await type(page, "echo $?");
        assert.equal(await last(), "3");
        await type(page, "chmod u+x ciao.sh");
        await type(page, "./ciao.sh | tr a-z A-Z");
        assert.equal(await last(), "CIAO,  (0 ARGOMENTI, SONO ./CIAO.SH)");
        // Lo script è un processo a parte: la directory e le variabili di chi lo lancia non cambiano
        await type(page, "echo 'cd documenti; X=1; pwd' > va.sh; bash va.sh; pwd; echo [$X]");
        assert.match(await outputText(page), /\/home\/anna\/documenti\n\/home\/anna\n\[\]$/);
        // Solo il nome: la shell cerca nelle directory di PATH
        await type(page, "ciao.sh");
        assert.equal(await last(), "bash: ciao.sh: comando non trovato");
        await type(page, "mkdir bin; mv ciao.sh bin; PATH=$PATH:~/bin; ciao.sh Anna");
        assert.equal(await last(), "Ciao, Anna (1 argomenti, sono /home/anna/bin/ciao.sh)");
        await type(page, "help");
        assert.match(await outputText(page), /script: bash script\.sh, \.\/script\.sh/);
    },

    "cicli for, if e test: su una riga nel terminale, su più righe negli script": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        await type(page, "for f in foto/*.jpg; do echo \"Foto: $f\"; done");
        assert.match(await outputText(page), /Foto: foto\/mare\.jpg\nFoto: foto\/montagna\.jpg$/);
        await type(page, "if [ -d documenti ]; then echo directory; else echo altro; fi");
        assert.equal(await last(), "directory");
        await type(page, "[ 3 -gt 5 ]; echo $?");
        assert.equal(await last(), "1");
        await type(page, "if ! grep -q burro documenti/spesa.txt; then echo manca il burro; fi");
        assert.equal(await last(), "manca il burro");
        // Il ciclo si può mandare in una pipe o in un file
        await type(page, "for n in 3 1 2; do echo $n; done | sort > numeri.txt; cat numeri.txt");
        assert.match(await outputText(page), /1\n2\n3$/);
        // Nel terminale non si va a capo: il messaggio spiega come fare
        await type(page, "for f in a b");
        assert.match(await last(), /manca `do' \(nel terminale scrivi tutto su una riga, separando con ;/);
        await type(page, "while true; do echo x; done");
        assert.match(await last(), /i cicli while non sono disponibili/);
        // Uno script su più righe, con if, for ed exit
        for (const line of ["if [ $# -eq 0 ]; then", "    echo Uso: $0 NOMI", "    exit 1", "fi", "for nome in \"$@\"; do", "    echo \"Ciao, $nome\"", "done"]) {
            await type(page, `echo '${line}' >> saluti.sh`);
        }
        await type(page, "bash saluti.sh; echo $?");
        assert.match(await outputText(page), /Uso: saluti\.sh NOMI\n1$/);
        await type(page, "bash saluti.sh Anna 'Luca Bianchi'");
        assert.match(await outputText(page), /Ciao, Anna\nCiao, Luca Bianchi$/);
        await type(page, "echo 'for f in a; do' > rotto.sh; bash rotto.sh; echo $?");
        assert.match(await outputText(page), /rotto\.sh: riga 1: errore di sintassi: fine inattesa, manca `done'\n2$/);
        await type(page, "help");
        assert.match(await outputText(page), /cicli e condizioni: for f in/);
    },

    "terminale libero, help, clear e Ctrl+L": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        assert.equal(await page.textContent("main h1"), "Terminale libero");
        assert.equal(await page.locator("#goals").count(), 0);
        await type(page, "help");
        assert.match(await outputText(page), /Comandi del simulatore/);
        await type(page, "clear");
        assert.equal(await outputText(page), "");
        await type(page, "echo ciao > saluto.txt; cat saluto.txt | tr a-z A-Z");
        assert.match(await outputText(page), /CIAO/);
        await page.press("#terminal-input", "Control+l");
        assert.equal(await outputText(page), "");
        await type(page, "nano note.txt");
        assert.match(await outputText(page), /editor non sono disponibili nel simulatore/);
    },

    "con un Linux vero: lo script della palestra e i comandi per installarlo": async ({ page }) => {
        await open(page, { hash: "#/terminale" });
        assert.equal(await page.textContent("#linux-vero"), "Con un Linux vero");
        assert.equal(await page.getAttribute("#palestra-download", "href"), "palestra/palestra.sh");
        const commands = (await page.textContent("#palestra-comandi")).split("\n");
        assert.match(commands[0], /^wget https?:\/\/.+\/palestra\/palestra\.sh$/);
        assert.deepEqual(commands.slice(1), ["sudo bash palestra.sh installa", "su - anna", "lpi-esercizio t2.3-01"]);
        // Lo script c'è davvero, ed è quello degli esercizi
        const script = await page.evaluate(async () => (await fetch("palestra/palestra.sh")).text());
        assert.match(script, /^#!\/usr\/bin\/env bash/);
        assert.ok(await page.evaluate(text => EXERCISES.every(exercise => text.includes(`    ${exercise.id})`)), script));
        // In ogni esercizio, il comando per ritrovarlo nella palestra
        await go(page, "#/terminale/t2.4-04");
        assert.match(await page.textContent(".practice-page p.hint"), /Su un Linux vero, con la palestra: lpi-esercizio t2\.4-04 \(come si installa\)/);
    },

    "terminale: 320 px e nessuna violazione axe": async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await open(page, { hash: "#/terminale/t2.3-03" });
        await type(page, "ls -la /etc /var/log /home/anna/documenti");
        await type(page, "ls -R progetti");
        await page.click("#practice-solution");
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
        // Con un terminale stretto ls incolonna su meno caratteri
        assert.ok(await page.evaluate(() => practice.sh.columns) < 40);
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            const violations = await axeViolations(page);
            if (violations === null) return;
            assert.deepEqual(violations, [], scheme);
        }
        await go(page, "#/terminale");
        assert.ok(await overflow(page) <= 0, `elenco: scorrimento di ${await overflow(page)} px`);
        assert.deepEqual(await axeViolations(page), [], "elenco");
    }
};
