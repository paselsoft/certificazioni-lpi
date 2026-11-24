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
        const exercises = await page.evaluate(() => EXERCISES.map(exercise => ({ id: exercise.id, solution: exercise.steps || exercise.solution })));
        const problems = [];
        for (const exercise of exercises) {
            await go(page, `#/terminale/${exercise.id}`);
            // Con gli editor: righe di comando, testo da scrivere e tasti (exercises/010-160.js)
            for (const step of exercise.solution) {
                if (typeof step === "string") await type(page, step);
                else if (step.type !== undefined) await page.keyboard.type(step.type);
                else await page.keyboard.press(step.press);
            }
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

    "aiuto: man, man -k, sezioni, --help, help, info, /usr/share/doc, locate e updatedb": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        await type(page, "man cp");
        const manual = await outputText(page);
        assert.match(manual, /CP\(1\)  Comandi utente  CP\(1\)/);
        for (const part of ["NOME", "SINTASSI", "DESCRIZIONE", "OPZIONI", "VEDI ANCHE", "cp - copia file e directory", "-r, -R, --recursive"]) assert.ok(manual.includes(part), part);
        await type(page, "clear");
        await type(page, "man -k comprime");
        assert.equal(await outputText(page), "anna@lpi:~$ man -k comprime\ngzip (1)             - comprime o espande file\nzip (1)              - comprime file in un archivio zip");
        await type(page, "apropos comprime | wc -l");
        assert.equal(await last(), "2");
        await type(page, "whatis passwd");
        assert.match(await outputText(page), /passwd \(1\) +- cambia la password di un utente\npasswd \(5\) +- il file degli utenti, \/etc\/passwd$/);
        await type(page, "man 5 passwd | head -n 1");
        assert.equal(await last(), "PASSWD(5)  Formati dei file  PASSWD(5)");
        await type(page, "man passwd | head -n 1");
        assert.equal(await last(), "PASSWD(1)  Comandi utente  PASSWD(1)");
        await type(page, "man 8 ls");
        assert.equal(await last(), "Nessuna voce di manuale per ls nella sezione 8");
        await type(page, "man nonesiste");
        assert.equal(await last(), "Nessuna voce di manuale per nonesiste");
        await type(page, "mkdir --help | head -n 2");
        assert.match(await outputText(page), /Uso: mkdir \[OPZIONE\]\.\.\. DIRECTORY\.\.\.\nCrea directory\.$/);
        await type(page, "help cd | head -n 1");
        assert.equal(await last(), "cd: cd [DIRECTORY]");
        await type(page, "help ls");
        assert.match(await last(), /È un programma, non un comando interno: prova «man ls» o «ls --help»/);
        await type(page, "info tar | head -n 1");
        assert.equal(await last(), "File: tar.info,  Node: Top,  Up: (dir)");
        await type(page, "ls /usr/share/doc/tar");
        assert.match(await last(), /NEWS\s+README\s+copyright/);
        // locate cerca nel database: i file nuovi li conosce solo dopo sudo updatedb
        await type(page, "locate lettera");
        assert.equal(await last(), "/home/anna/documenti/lettera.txt");
        await type(page, "touch nuovo.txt; locate nuovo.txt; echo $?");
        assert.equal(await last(), "1");
        await type(page, "updatedb");
        assert.match(await last(), /Permesso negato \(il database si aggiorna da amministratore: sudo updatedb\)/);
        await type(page, "sudo updatedb; locate -c nuovo.txt; locate segreto; echo $?");
        assert.match(await outputText(page), /\n1\n1$/, "trova nuovo.txt, ma non il file nella home di luca");
        // A 320 px la pagina di manuale va a capo, senza scorrimento orizzontale
        await page.setViewportSize({ width: 320, height: 700 });
        await go(page, "#/terminale/t2.2-01");
        await type(page, "man cp");
        await page.waitForSelector("#practice-success:not([hidden])");
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
    },

    "sistema: ps, top, free, dmesg, registri, /proc, /dev e /boot": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        await type(page, "ps");
        assert.match(await outputText(page), /    PID TTY          TIME CMD\n   4242 pts\/0    00:00:00 bash\n   \d{4} pts\/0    00:00:00 ps$/);
        await type(page, "echo $$");
        assert.equal(await last(), "4242");
        // ps aux: tutti i processi; con grep compare anche il grep stesso
        await type(page, "ps aux | grep sshd | wc -l");
        assert.equal(await last(), "6");
        await type(page, "ps -ef | head -n 2");
        assert.match(await outputText(page), /UID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 \w{3}\d{2} \?        00:00:04 \/sbin\/init splash$/);
        await type(page, "free -h");
        assert.match(await outputText(page), /total +used +free +shared +buff\/cache +available\nMem: +3\.8Gi +813Mi +1\.8Gi +12Mi +1\.2Gi +2\.8Gi\nSwap: +2\.0Gi +0B +2\.0Gi$/);
        await type(page, "top");
        assert.match(await outputText(page), /top - \d\d:\d\d:\d\d up 2 days/);
        assert.match(await last(), /si esce con q/);
        // dmesg e i registri: servono i permessi dell'amministratore
        await type(page, "dmesg");
        assert.equal(await last(), "dmesg: lettura del buffer del kernel non riuscita: Operazione non permessa");
        await type(page, "sudo dmesg | grep -c usb");
        assert.equal(await last(), "5");
        await type(page, "tail -n 1 /var/log/syslog");
        assert.equal(await last(), "tail: impossibile aprire '/var/log/syslog' per la lettura: Permesso negato");
        await type(page, "sudo tail -n 1 /var/log/syslog");
        assert.match(await last(), /^Nov 12 09:58:00 lpi CRON\[4290\]: \(root\) CMD/);
        await type(page, "sudo journalctl -u ssh | grep -c Failed");
        assert.equal(await last(), "1");
        // /proc: i file del kernel, grandi 0 per ls -l
        await type(page, "grep MemTotal /proc/meminfo");
        assert.equal(await last(), "MemTotal:        4009140 kB");
        await type(page, "ls -l /proc/meminfo");
        assert.match(await last(), /^-r--r--r-- 1 root root 0 /);
        await type(page, "head -n 1 /proc/self/status");
        assert.equal(await last(), "Name:\tbash");
        // /dev: dispositivi a blocchi e a caratteri; /boot: il kernel
        await type(page, "ls -l /dev/sda /dev/null");
        assert.match(await outputText(page), /crw-rw-rw- 1 root root 1, 3 .* \/dev\/null\nbrw-rw---- 1 root disk 8, 0 .* \/dev\/sda$/);
        await type(page, "ls /boot | grep vmlinuz; uname -r");
        assert.match(await outputText(page), /vmlinuz-6\.8\.0-49-generic\n6\.8\.0-49-generic$/);
        await type(page, "help");
        assert.match(await outputText(page), /sistema: ps \(anche ps aux, ps -ef\), top/);
        // A 320 px ps aux si taglia alla larghezza del terminale: niente scorrimento orizzontale
        await page.setViewportSize({ width: 320, height: 700 });
        await go(page, "#/terminale/t4.3-02");
        await type(page, "ps aux");
        await page.waitForSelector("#practice-success:not([hidden])");
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
    },

    "rete: ip, ifconfig, route, ss, netstat, ping, host e i file di configurazione": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        await type(page, "ip a show enp0s3 | grep -w inet");
        assert.match(await last(), /^ +inet 192\.168\.1\.50\/24 brd 192\.168\.1\.255 scope global/);
        await type(page, "ip -6 addr | grep -c inet6");
        assert.equal(await last(), "3");
        await type(page, "ip route | head -n 1");
        assert.equal(await last(), "default via 192.168.1.1 dev enp0s3 proto dhcp src 192.168.1.50 metric 100");
        await type(page, "ifconfig enp0s3 | head -n 2");
        assert.match(await last(), /inet 192\.168\.1\.50  netmask 255\.255\.255\.0  broadcast 192\.168\.1\.255/);
        await type(page, "route -n | tail -n 2 | head -n 1");
        assert.match(await last(), /^0\.0\.0\.0 +192\.168\.1\.1 +0\.0\.0\.0 +UG/);
        await type(page, "ip addr add 10.0.0.1/8 dev lo");
        assert.match(await last(), /si può solo guardare/);
        // Le porte in ascolto: ss e netstat
        await type(page, "ss -tln | grep -c LISTEN");
        assert.equal(await last(), "4");
        await type(page, "netstat -tln | grep ':22 '");
        assert.match(await outputText(page), /\ntcp +0 +0 0\.0\.0\.0:22 +0\.0\.0\.0:\* +LISTEN\ntcp6 +0 +0 :::22 +:::\* +LISTEN$/);
        // ping guarda /etc/hosts; host chiede al DNS
        await type(page, "ping -c 2 nas | tail -n 2 | head -n 1");
        assert.equal(await last(), "2 packets transmitted, 2 received, 0% packet loss, time 1002ms");
        await type(page, "ping -c 1 192.168.1.99 > /dev/null; echo $?");
        assert.equal(await last(), "1");
        await type(page, "ping -c 1 sitoinesistente");
        assert.equal(await last(), "ping: sitoinesistente: Nome o servizio sconosciuto");
        await type(page, "ping 192.168.1.1");
        assert.match(await last(), /si ferma dopo 4 pacchetti; su un sistema vero continua finché premi Ctrl\+C/);
        await type(page, "host www.lpi.org");
        assert.match(await outputText(page), /www\.lpi\.org has address 203\.0\.113\.80\nwww\.lpi\.org has IPv6 address 2001:db8:80::1$/);
        await type(page, "host nas");
        assert.equal(await last(), "nas.casa.lan has address 192.168.1.10");
        await type(page, "cat /etc/resolv.conf");
        assert.match(await outputText(page), /nameserver 192\.168\.1\.1\nsearch casa\.lan$/);
        await type(page, "hostname -I");
        assert.equal(await last(), "192.168.1.50 2001:db8:1::a00:27ff:fe4e:66a1 ");
        await type(page, "help");
        assert.match(await outputText(page), /rete: ip addr, ip route, ifconfig, route, ss, netstat, ping, host/);
        // A 320 px le righe lunghe di ip addr vanno a capo, senza scorrimento orizzontale
        await page.setViewportSize({ width: 320, height: 700 });
        await go(page, "#/terminale/t4.4-01");
        await type(page, "ip addr show");
        await page.waitForSelector("#practice-success:not([hidden])");
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
    },

    "utenti: id, who, w, last, /etc/shadow, sudo -l, -u, -i, su ed exit": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        const prompt = () => page.textContent(".terminal-line .terminal-prompt");
        await type(page, "id");
        assert.equal(await last(), "uid=1000(anna) gid=1000(anna) groups=1000(anna),27(sudo),1002(sviluppo)");
        await type(page, "who | wc -l");
        assert.equal(await last(), "2");
        await type(page, "w | tail -n 1");
        assert.match(await last(), /^luca +pts\/1 +192\.168\.1\.20 +08:25 .* top$/);
        await type(page, "last luca | head -n 1");
        assert.match(await last(), /^luca +pts\/1 +192\.168\.1\.20 +Thu Nov 12 08:25 +still logged in$/);
        await type(page, "grep www-data /etc/passwd");
        assert.equal(await last(), "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin");
        await type(page, "cat /etc/shadow");
        assert.equal(await last(), "cat: /etc/shadow: Permesso negato");
        await type(page, "sudo grep -c '\\$6\\$' /etc/shadow");
        assert.equal(await last(), "2");
        await type(page, "sudo -l");
        assert.equal(await last(), "    (ALL : ALL) ALL");
        await type(page, "sudo -u luca cat /home/luca/segreto.txt");
        assert.equal(await last(), "solo per luca");
        // su senza sudo chiederebbe una password; con sudo si cambia utente e il prompt cambia
        await type(page, "su - luca");
        assert.match(await last(), /la password non si può scrivere\. .*sudo su - luca/);
        await type(page, "sudo su - luca");
        assert.equal(await prompt(), "luca@lpi:~$ ");
        await type(page, "whoami; pwd");
        assert.match(await outputText(page), /luca\n\/home\/luca$/);
        await type(page, "sudo ls");
        assert.equal(await last(), "luca is not in the sudoers file.");
        await type(page, "exit");
        assert.equal(await prompt(), "anna@lpi:~$ ");
        await type(page, "sudo -i");
        assert.equal(await prompt(), "root@lpi:~# ");
        await type(page, "pwd");
        assert.equal(await last(), "/root");
        await type(page, "exit");
        assert.equal(await last(), "logout");
        assert.equal(await prompt(), "anna@lpi:~$ ");
        await type(page, "exit");
        assert.match(await last(), /il terminale resta aperto/);
        // «Ricomincia» riporta ad anna anche da una shell di root
        await go(page, "#/terminale/t5.1-10");
        await type(page, "sudo -i");
        await page.click("#practice-restart");
        assert.equal(await prompt(), "anna@lpi:~$ ");
        await type(page, "sudo -i");
        await type(page, "exit");
        await page.waitForSelector("#practice-success:not([hidden])");
        await type(page, "help");
        assert.match(await outputText(page), /utenti: id, who, w, last, sudo/);
    },

    "account: useradd, groupadd, usermod, passwd, chpasswd, userdel e /etc/skel": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").pop();
        // Senza sudo non si può
        await type(page, "useradd luigi");
        assert.equal(await last(), "useradd: impossibile bloccare /etc/passwd; riprovare più tardi.");
        await type(page, "sudo useradd -m -c 'Luigi Verdi' -s /bin/bash luigi");
        await type(page, "tail -n 1 /etc/passwd");
        assert.equal(await last(), "luigi:x:1002:1003:Luigi Verdi:/home/luigi:/bin/bash");
        await type(page, "ls -ld /home/luigi");
        assert.match(await last(), /^drwxr-x--- \d+ luigi luigi /);
        await type(page, "sudo ls -A /home/luigi");
        assert.match(await last(), /\.bashrc\s+\.profile/);
        await type(page, "sudo useradd luigi");
        assert.equal(await last(), "useradd: l'utente «luigi» esiste già");
        // Gruppi: -G senza -a sostituisce
        await type(page, "sudo groupadd progetto; sudo usermod -aG progetto luigi; sudo usermod -aG sviluppo luigi; id -Gn luigi");
        assert.equal(await last(), "luigi progetto sviluppo");
        await type(page, "sudo usermod -G sviluppo luigi; groups luigi");
        assert.equal(await last(), "luigi : luigi sviluppo");
        // Password: stato, chpasswd, blocco
        await type(page, "sudo passwd -S luigi");
        assert.match(await last(), /^luigi L \d{4}-\d{2}-\d{2} 0 99999 7 -1$/);
        await type(page, "passwd");
        assert.match(await outputText(page), /non si può digitare\. Per impostarla senza digitarla: echo 'anna:NUOVAPASSWORD' \| sudo chpasswd/);
        await type(page, "echo 'luigi:Primavera26' | sudo chpasswd; sudo passwd -S luigi");
        assert.match(await last(), /^luigi P /);
        await type(page, "sudo passwd -l luca; sudo grep -c '^luca:!' /etc/shadow");
        assert.equal(await last(), "1");
        // Utente di sistema e cancellazione
        await type(page, "sudo useradd -r -s /usr/sbin/nologin servizio; id -u servizio");
        assert.equal(await last(), "999");
        await type(page, "sudo userdel luca");
        assert.match(await last(), /^userdel: l'utente luca è attualmente usato dal processo \d+$/);
        await type(page, "sudo userdel -r luigi; ls /home; grep -c luigi /etc/passwd");
        assert.match(await outputText(page), /anna\s+luca\n0$/);
        await type(page, "help");
        assert.match(await outputText(page), /account: useradd, groupadd, usermod, userdel/);
        // Ogni esercizio riparte con gli utenti di sempre
        await go(page, "#/terminale/t5.2-01");
        await type(page, "id luigi");
        assert.equal(await last(), "id: 'luigi': utente inesistente");
        await type(page, "sudo useradd -m luigi");
        await page.waitForSelector("#practice-success:not([hidden])");
    },

    "Tab completa comandi e nomi dei file; con la riga vuota porta al pulsante successivo": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const value = () => page.inputValue("#terminal-input");
        const tab = async text => {
            await page.fill("#terminal-input", text);
            await page.press("#terminal-input", "Tab");
            return value();
        };
        assert.equal(await tab("mkd"), "mkdir ");
        assert.equal(await tab("cd doc"), "cd documenti/");
        assert.equal(await tab("cat documenti/le"), "cat documenti/lettera.txt ");
        assert.equal(await tab("ls .ba"), "ls .bashrc ");
        assert.equal(await tab("cat note.txt | gre"), "cat note.txt | grep ");
        assert.equal(await page.evaluate(() => document.activeElement.id), "terminal-input", "il fuoco resta sulla riga di comando");
        // Più nomi possibili: la riga resta com'è e i nomi compaiono sotto, come in Bash
        assert.equal(await tab("ch"), "ch");
        assert.match(await outputText(page), /anna@lpi:~\$ ch\nchgrp\s+chmod\s+chown\s+chpasswd$/);
        // Con la riga vuota Tab esce dal terminale (tastiera: nessuna trappola)
        await page.fill("#terminal-input", "");
        await page.press("#terminal-input", "Tab");
        assert.notEqual(await page.evaluate(() => document.activeElement.id), "terminal-input");
        assert.match(await page.textContent(".terminal-tips"), /Tab completa i comandi e i nomi dei file/);
        // Sul computer (schermo largo, mouse) i tasti rapidi non si vedono; sul telefono sì
        await page.setViewportSize({ width: 1200, height: 800 });
        assert.equal(await page.isVisible(".terminal-keys"), false);
        await page.setViewportSize({ width: 390, height: 800 });
        assert.equal(await page.isVisible(".terminal-keys"), true);
    },

    "tasti rapidi sul telefono: caratteri al cursore, Tab, frecce; il fuoco resta sulla riga": async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await open(page, { hash: "#/terminale/libero" });
        assert.equal(await page.isVisible(".terminal-keys"), true);
        // Il tasto si sceglie dal testo che mostra
        const key = text => page.click(`.terminal-key >> text="${text}"`);
        await page.fill("#terminal-input", "ls");
        await key("|");
        await page.type("#terminal-input", " wc -l");
        assert.equal(await page.inputValue("#terminal-input"), "ls| wc -l");
        // Il carattere va dove si trova il cursore
        await page.evaluate(() => document.getElementById("terminal-input").setSelectionRange(2, 2));
        await key("-");
        assert.equal(await page.inputValue("#terminal-input"), "ls-| wc -l");
        await page.fill("#terminal-input", "cd ");
        await key("~");
        await key("/");
        await page.type("#terminal-input", "fo");
        await key("Tab");
        assert.equal(await page.inputValue("#terminal-input"), "cd ~/foto/");
        assert.equal(await page.evaluate(() => document.activeElement.id), "terminal-input");
        await page.press("#terminal-input", "Enter");
        await page.fill("#terminal-input", "echo $HOME");
        await page.press("#terminal-input", "Enter");
        await key("↑");
        assert.equal(await page.inputValue("#terminal-input"), "echo $HOME");
        await key("↑");
        assert.equal(await page.inputValue("#terminal-input"), "cd ~/foto/");
        await key("↓");
        assert.equal(await page.inputValue("#terminal-input"), "echo $HOME");
        await page.fill("#terminal-input", "true ");
        await key("&&");
        assert.equal(await page.inputValue("#terminal-input"), "true && ");
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
        const violations = await axeViolations(page);
        if (violations !== null) assert.deepEqual(violations, []);
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
    },

    "esercizio: «Segnala un errore» con il codice e il compito": async ({ page }) => {
        await open(page, { hash: "#/terminale/t2.4-04" });
        const report = await page.evaluate(() => {
            const url = new URL(document.querySelector(".report-link").href);
            return { title: url.searchParams.get("title"), body: url.searchParams.get("body") };
        });
        assert.equal(report.title, "Errore: esercizio t2.4-04");
        assert.match(report.body, /^\*\*Dove\*\*: esercizio t2\.4-04 /);
        await open(page, { hash: "#/terminale/libero" });
        assert.equal(await page.locator(".report-link").count(), 0, "il terminale libero non ha niente da segnalare");
    },

    "nano: scrivere, Ctrl+O salva, Ctrl+X chiede se salvare, Ctrl+K e Ctrl+U, permessi e sudo": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const status = () => page.textContent("#editor-status");
        const area = () => page.inputValue("#editor-text");
        await type(page, "nano lista.txt");
        assert.equal(await page.isVisible("#terminal-input"), false, "la riga di comando si nasconde");
        assert.equal(await page.evaluate(() => document.activeElement.id), "editor-text");
        assert.equal(await status(), "[ File nuovo ]");
        assert.match(await page.textContent(".editor-title"), /GNU nano.*lista\.txt/);
        await page.keyboard.type("uno\ndue\ntre");
        assert.match(await page.textContent(".editor-title"), /Modificato/);
        await page.keyboard.press("Control+o");
        assert.equal(await status(), "Nome del file da scrivere: lista.txt");
        await page.keyboard.press("Enter");
        assert.equal(await status(), "[ Scritte 3 righe ]");
        // Ctrl+K taglia la riga del cursore, Ctrl+U la incolla
        await page.evaluate(() => document.getElementById("editor-text").setSelectionRange(0, 0));
        await page.keyboard.press("Control+k");
        assert.equal(await area(), "due\ntre");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Control+u");
        assert.equal(await area(), "due\nuno\ntre");
        // Ctrl+X con modifiche: S salva (il nome è già scritto), Ctrl+C annulla, N esce senza salvare
        await page.keyboard.press("Control+x");
        assert.match(await status(), /Salvare il buffer modificato\?/);
        await page.keyboard.press("Control+c");
        assert.equal(await status(), "[ Annullato ]");
        await page.keyboard.press("Control+x");
        await page.keyboard.type("n");
        assert.equal(await page.isVisible("#editor-text"), false);
        assert.equal(await page.evaluate(() => document.activeElement.id), "terminal-input");
        await type(page, "cat lista.txt");
        assert.match(await outputText(page), /uno\ndue\ntre$/);
        // Il file di root: anna lo legge ma non può salvarlo; con sudo sì
        await type(page, "nano /etc/hostname");
        assert.equal(await area(), "lpi\n");
        await page.keyboard.type("x");
        await page.keyboard.press("Control+o");
        await page.keyboard.press("Enter");
        assert.equal(await status(), "[ Errore scrivendo /etc/hostname: Permesso negato ]");
        await page.keyboard.press("Control+x");
        await page.keyboard.type("n");
        await type(page, "sudo nano /etc/hostname");
        await page.keyboard.press("Control+End");
        await page.keyboard.type("server");
        await page.keyboard.press("Control+x");
        await page.keyboard.type("s");
        await page.keyboard.press("Enter");
        await type(page, "cat /etc/hostname");
        assert.match(await outputText(page), /lpi\nserver$/);
        // Non in una pipe; una directory non si apre; l'aiuto c'è
        await type(page, "nano lista.txt | cat");
        assert.match(await outputText(page), /nano: nel simulatore l'editor si apre solo sulla riga di comando/);
        await type(page, "nano foto");
        assert.match(await outputText(page), /nano: foto: È una directory$/);
        await type(page, "man nano");
        assert.match(await outputText(page), /Ctrl\+O\s+salva\s+il\s+file/);
        await type(page, "help");
        assert.match(await outputText(page), /editor: nano FILE/);
    },

    "vi: modi comandi e inserimento, :w :q :q! :wq, x dd yy p u, / e ZZ": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const status = () => page.textContent("#editor-status");
        const area = () => page.inputValue("#editor-text");
        await type(page, "echo -e 'alfa\\nbeta\\ngamma' > greco.txt");
        await type(page, "vi greco.txt");
        assert.equal(await status(), '"greco.txt" 3L, 16B');
        assert.equal(await area(), "alfa\nbeta\ngamma");
        // Nel modo comandi le lettere non entrano nel testo
        await page.keyboard.type("x");
        assert.equal(await area(), "lfa\nbeta\ngamma");
        await page.keyboard.type("u");
        assert.equal(await area(), "alfa\nbeta\ngamma");
        await page.keyboard.type("jdd");
        assert.equal(await area(), "alfa\ngamma");
        await page.keyboard.type("p");
        assert.equal(await area(), "alfa\ngamma\nbeta");
        await page.keyboard.type("ggyyGp");
        assert.equal(await area(), "alfa\ngamma\nbeta\nalfa");
        // :q con modifiche si rifiuta
        await page.keyboard.type(":q");
        assert.equal(await status(), ":q");
        await page.keyboard.press("Enter");
        assert.equal(await status(), "E37: Non salvato dopo modifica (aggiungi ! per eseguire comunque)");
        // Modo inserimento: A scrive in fondo alla riga, o apre una riga sotto
        await page.keyboard.type("A");
        assert.equal(await status(), "-- INSERISCI --");
        await page.keyboard.type("!");
        await page.keyboard.press("Escape");
        await page.keyboard.type("o");
        await page.keyboard.type("delta");
        await page.keyboard.press("Escape");
        assert.equal(await area(), "alfa\ngamma\nbeta\nalfa!\ndelta");
        await page.keyboard.type("/gam");
        await page.keyboard.press("Enter");
        await page.keyboard.type("x");
        assert.equal(await area(), "alfa\namma\nbeta\nalfa!\ndelta");
        await page.keyboard.type(":w");
        await page.keyboard.press("Enter");
        assert.equal(await status(), '"greco.txt" 5L, 27B scritti');
        await page.keyboard.type(":q");
        await page.keyboard.press("Enter");
        assert.equal(await page.isVisible("#editor-text"), false);
        await type(page, "cat greco.txt");
        assert.match(await outputText(page), /alfa\namma\nbeta\nalfa!\ndelta$/);
        // :q! esce senza salvare; un comando sconosciuto dà errore; ZZ salva ed esce
        await type(page, "vim greco.txt");
        await page.keyboard.type("dddd");
        await page.keyboard.type(":salva");
        await page.keyboard.press("Enter");
        assert.equal(await status(), "E492: Non è un comando dell'editor: salva");
        await page.keyboard.type(":q!");
        await page.keyboard.press("Enter");
        await type(page, "wc -l greco.txt");
        assert.match(await outputText(page), /5 greco\.txt$/);
        await type(page, "vi");
        await page.keyboard.type("itesto");
        await page.keyboard.press("Escape");
        await page.keyboard.type(":wq");
        await page.keyboard.press("Enter");
        assert.equal(await status(), "E32: Nessun nome di file");
        await page.keyboard.type(":w nuovo.txt");
        await page.keyboard.press("Enter");
        assert.equal(await status(), '"nuovo.txt" [Nuovo] 1L, 6B scritti');
        await page.keyboard.type("ZZ");
        await type(page, "cat nuovo.txt");
        assert.match(await outputText(page), /testo$/);
        await type(page, "man vi");
        assert.match(await outputText(page), /:q!\s+esce\s+senza\s+salvare/);
    },

    "pacchetti: dpkg, apt-get con sudo, comandi che compaiono e spariscono, rc e purge, rpm e yum": async ({ page }) => {
        await open(page, { hash: "#/terminale/libero" });
        const last = async () => (await outputText(page)).split("\n").slice(-3).join("\n");
        await type(page, "tree documenti");
        assert.match(await last(), /bash: tree: comando non trovato \(si installa con: sudo apt-get install tree\)$/);
        await type(page, "apt-get install tree");
        assert.match(await last(), /Si è root\?$/);
        await type(page, "sudo apt-get install tree");
        assert.match(await last(), /Setting up tree \(2\.1\.1-2ubuntu3\) \.\.\.$/);
        await page.click("#practice-restart");
        // Ricomincia: il pacchetto non c'è più
        await type(page, "type tree");
        assert.match(await last(), /bash: type: tree: non trovato$/);
        await type(page, "sudo apt-get install -y tree");
        await type(page, "tree documenti");
        assert.match(await outputText(page), /documenti\n\|-- lettera\.txt\n`-- spesa\.txt\n\s*\n1 directory, 2 files$/);
        await type(page, "dpkg -l tree");
        assert.match(await last(), /ii  tree\s+2\.1\.1-2ubuntu3\s+amd64\s+displays an indented directory tree, in color$/);
        await type(page, "dpkg -S /usr/bin/nano");
        assert.match(await last(), /nano: \/usr\/bin\/nano$/);
        await type(page, "apt-cache search processes");
        assert.match(await last(), /htop - interactive processes viewer$/);
        // remove chiede conferma (nel simulatore non si risponde: -y), lascia la configurazione (rc); purge toglie tutto
        await type(page, "sudo apt-get install nginx");
        await type(page, "sudo apt-get remove nginx");
        assert.match(await last(), /aggiungi -y per dire di sì/);
        await type(page, "sudo apt-get remove -y nginx");
        await type(page, "dpkg -l nginx");
        assert.match(await last(), /rc  nginx/);
        await type(page, "ls /etc/nginx");
        assert.match(await last(), /nginx\.conf$/);
        await type(page, "sudo apt-get purge -y nginx");
        await type(page, "dpkg -l nginx");
        assert.match(await last(), /dpkg-query: nessun pacchetto corrisponde a nginx$/);
        // Togliere nano lo fa sparire; bash è essenziale
        await type(page, "sudo apt-get remove -y nano");
        await type(page, "nano prova.txt");
        assert.match(await last(), /bash: nano: comando non trovato/);
        await type(page, "sudo apt-get remove -y bash");
        assert.match(await last(), /pacchetto essenziale per il sistema/);
        await type(page, "rpm -qa");
        assert.match(await last(), /bash: rpm: comando non trovato \(questo sistema è della famiglia Debian/);
        await type(page, "man dpkg");
        assert.match(await outputText(page), /ii\s+vuol\s+dire\s+installato,\s+rc\s+tolto/);
    },

    "editor sul telefono: tasti come pulsanti, testo scritto intercettato, 320 px e axe": async ({ page }) => {
        await page.setViewportSize({ width: 320, height: 700 });
        await open(page, { hash: "#/terminale/libero" });
        await type(page, "vi prova.txt");
        // Il telefono non dice quale tasto: si guarda che cosa cambia nel testo (qui: «i», poi «ciao»)
        const typeLikePhone = text => page.evaluate(text => {
            const area = document.getElementById("editor-text");
            const at = area.selectionStart;
            area.setRangeText(text, at, area.selectionEnd, "end");
            area.dispatchEvent(new Event("input", { bubbles: true }));
        }, text);
        await typeLikePhone("i");
        assert.equal(await page.inputValue("#editor-text"), "");
        assert.equal(await page.textContent("#editor-status"), "-- INSERISCI --");
        await typeLikePhone("ciao");
        await page.click(".editor-key >> text=Esc");
        assert.equal(await page.evaluate(() => document.activeElement.id), "editor-text");
        for (const char of ":wq\n") await typeLikePhone(char);
        assert.equal(await page.isVisible("#editor-text"), false);
        await type(page, "nano prova.txt");
        assert.ok(await overflow(page) <= 0, `scorrimento di ${await overflow(page)} px`);
        for (const scheme of ["light", "dark"]) {
            await page.emulateMedia({ colorScheme: scheme });
            const violations = await axeViolations(page);
            if (violations !== null) assert.deepEqual(violations, [], scheme);
        }
        await page.keyboard.press("Control+End");
        await page.keyboard.type("altro");
        await page.click(".editor-key >> text=Esci");
        await page.click(".editor-key >> text=Sì");
        await page.click(".editor-key >> text=Conferma");
        await type(page, "cat prova.txt");
        assert.match(await outputText(page), /ciao\naltro$/);
    },

    "con un Linux vero: lo script della palestra e i comandi per installarlo": async ({ page }) => {
        await open(page, { hash: "#/terminale" });
        assert.equal(await page.textContent("#linux-vero"), "Con un Linux vero");
        assert.equal(await page.getAttribute("#palestra-download", "href"), "palestra/palestra.sh");
        const commands = (await page.textContent("#palestra-comandi")).split("\n");
        assert.match(commands[0], /^wget https?:\/\/.+\/palestra\/palestra\.sh$/);
        assert.deepEqual(commands.slice(1), ["sudo bash palestra.sh installa", "su - anna", "lpi-esercizio t2.3-01"]);
        assert.match(await page.textContent("#linux-vero ~ .hint"), /lpi-esercizio verifica, quando hai finito, dice quali obiettivi/);
        // Lo script c'è davvero, ed è quello degli esercizi
        const script = await page.evaluate(async () => (await fetch("palestra/palestra.sh")).text());
        assert.match(script, /^#!\/usr\/bin\/env bash/);
        assert.ok(await page.evaluate(text => EXERCISES.every(exercise => text.includes(`    ${exercise.id})`)), script));
        // In ogni esercizio, il comando per ritrovarlo nella palestra
        await go(page, "#/terminale/t2.4-04");
        assert.match(await page.textContent(".practice-page p.hint"), /Su un Linux vero, con la palestra: lpi-esercizio t2\.4-04, poi lpi-esercizio verifica \(come si installa\)/);
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
