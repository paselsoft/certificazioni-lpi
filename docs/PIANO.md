# Certificazioni LPI: piano

Un'app gratuita, in italiano, per prepararsi all'esame **Linux Essentials** del Linux
Professional Institute (LPI), e in seguito a LPIC-1. Funziona nel browser, anche senza
connessione, come Pipe Dreams: HTML, CSS e JavaScript senza librerie né compilazione.

## L'esame (verificato su lpi.org il 12/11/2026)

| | Linux Essentials |
|---|---|
| Domande | 40 |
| Tempo | 60 minuti |
| Validità | **a vita** (LPIC-1 invece scade dopo 5 anni) |
| Prerequisiti | nessuno |
| Versione attuale | **2.0**, esame 010-200: per ora solo in inglese, le traduzioni (italiano compreso) «nei prossimi mesi» |
| Versione precedente | **1.6**, esame 010-160: **si può sostenere fino ad aprile 2027** |
| Punteggio | scala da 200 a 800, **si supera con 500** (verificato il 12/11/2026, vedi sotto) |

Fonti: [Linux Essentials](https://www.lpi.org/our-certifications/linux-essentials-overview/),
[obiettivi 1.6](https://wiki.lpi.org/wiki/Linux_Essentials_Objectives_V1.6),
[obiettivi 2.0](https://wiki.lpi.org/wiki/Linux_Essentials_Objectives_V2.0).

### Le due versioni a confronto

| | 1.6 (010-160) | 2.0 (010-200) |
|---|---|---|
| Obiettivi | 19, in 5 argomenti, peso totale 40 | 19, in 5 argomenti, peso totale 40 |
| Lezioni ufficiali in italiano | **complete** (anche il PDF di 449 pagine) | 4 su 19 obiettivi (solo l'argomento 011), le altre «prossimamente» |
| Esame in italiano | sì | non ancora |
| Novità | | più spazio a scripting (013.3, peso 4), processi e log, rete, archivi e compressione |

## Versione scelta: 1.6 (esame 010-160)

Decisione del 12/11/2026: l'app parte dalla **versione 1.6**, con le lezioni italiane complete e
l'esame in italiano, da sostenere **entro aprile 2027**. La 2.0 (010-200) si aggiungerà quando
ci saranno le lezioni e l'esame in italiano.

In tutti e due i casi l'app nasce con i dati di **entrambe** le versioni separati (obiettivi,
domande, lezioni): si parte da una e si aggiunge l'altra senza rifare niente. Molti argomenti
sono comuni (riga di comando, file, permessi, utenti), quindi gran parte delle domande vale per
tutte e due.

## Cosa si può fare con i materiali LPI

Le lezioni LPI hanno licenza **CC BY-NC-ND 4.0**: si possono condividere gratis, citando la fonte,
**senza modifiche**.

- **Sì:** le lezioni integrali e non modificate dentro l'app, da leggere offline, con l'avviso di
  licenza e il link all'originale (come in Pipe Dreams). Gli obiettivi d'esame (pubblici).
- **No:** riassunti delle lezioni, schede ricavate dal testo, esercizi LPI riscritti come quiz.
- **Quindi:** domande, spiegazioni e flashcard sono **scritte da zero** per questa app, partendo
  dagli obiettivi. Ogni domanda rimanda alla lezione ufficiale da ripassare. Un controllo
  automatico verifica che nessuna domanda copi frasi delle lezioni.

## Funzioni, in ordine di arrivo

### M1. Scheletro, obiettivi e lezioni
- Pagina principale con gli argomenti e gli obiettivi dell'esame scelto, con il peso.
- Le lezioni ufficiali in italiano dentro l'app, lette offline (lo strumento di importazione e
  il lettore vengono da Pipe Dreams, con il controllo che il testo sia identico all'originale).
- Per ogni obiettivo: «studiato», i comandi da conoscere, i progressi.
- Progressi salvati nel browser, con esportazione e importazione di un backup.

**Fatta il 12/11/2026.** Obiettivi dalla traduzione italiana ufficiale (wiki LPI, controllata
con la versione inglese: pesi e voci coincidono); 24 lezioni su 24, ognuna controllata carattere
per carattere con l'originale sia nell'importazione sia nella pagina; «Riprendi la lettura» dal
punto in cui si era arrivati e dimensione del testo regolabile; uso offline con il service worker
(anticipato da M6, perché leggere offline è parte di M1). I dati di ogni esame stanno in un file
a sé (`data/exam-010-160.js`), pronti per aggiungere la 2.0. Da fare quando serve: la 2.0, quando
ci saranno le lezioni e l'esame in italiano.

### M2. Domande per obiettivo
- Una banca di domande originali: almeno 8-10 per obiettivo (circa 200 in tutto).
- I tipi dell'esame vero: scelta singola, scelta multipla («scegli 2») e completamento (scrivi il
  comando o l'opzione).
- Dopo ogni risposta: giusto o sbagliato, il perché di ogni opzione, il link alla lezione.
- Modalità «studia un obiettivo»: solo le sue domande.

**Fatta il 12/11/2026.** 231 domande, tutte scritte da zero (il minimo per obiettivo è 6 + 2 × peso:
da 8 a 14; ce ne sono da 9 a 17), con almeno una a scelta multipla e una di completamento per
obiettivo. I risultati dei comandi usati nelle domande sono stati provati in Bash. Ogni domanda
rimanda a una sezione precisa della lezione ufficiale. Il completamento accetta le forme
equivalenti (per esempio `tar -czf` e `tar -zcvf`). Le risposte di ogni domanda (giuste, sbagliate,
ultimo esito) sono salvate e entrano nel backup: serviranno al ripasso di M3. Controlli in CI:
formato, risposte giuste, copertura per peso, nessuna sequenza di 8 parole uguale alle lezioni; nel
browser, un test risponde a tutte le domande con la soluzione e verifica che sia riconosciuta.

### M3. Ripasso intelligente
- Le domande sbagliate tornano presto, quelle giuste sempre più di rado (scatole di Leitner).
- «Ripasso di oggi»: una decina di domande scelte così.

**Fatta il 12/11/2026.** Cinque scatole: una domanda nuova parte dalla 1; giusta → scatola
successiva, sbagliata → di nuovo la 1; torna dopo 1, 2, 4, 8 o 16 giorni secondo la scatola.
Il ripasso prende fino a 10 domande: prima le scadute (dalla più vecchia), poi le nuove, dagli
obiettivi segnati «studiato» o con una lezione letta (altrimenti da tutti), scelti a caso secondo
il peso. Tutte le risposte contano, anche quelle date in «studia un obiettivo». Dopo ogni risposta
l'app dice in quale scatola è finita la domanda e quando torna; nella pagina principale c'è il
riquadro «Ripasso di oggi» con le scatole e il prossimo ripasso. Le risposte date prima di M3
entrano nelle scatole da sole (giusta → 2, sbagliata → 1). I test fermano l'orologio del browser
per provare i giorni successivi.

### M4. Simulazione d'esame
- 40 domande in 60 minuti, distribuite secondo il peso degli obiettivi, con il cronometro.
- Si può segnare una domanda e tornarci, come all'esame.
- Alla fine: punteggio, risultato per argomento, le domande sbagliate con la spiegazione.
- Storico delle simulazioni, per vedere i progressi.

**Fatta il 12/11/2026.** Per ogni obiettivo tante domande quanto il suo peso (come all'esame: una
per ogni punto di peso), scelte a caso tra le sue e mescolate. Cronometro con avvisi a 10, 5 e 1
minuto per i lettori di schermo; la prova è salvata nel browser a ogni risposta e il tempo conta
dall'inizio anche a pagina chiusa: si riprende dov'era, e se il tempo è finito si va al risultato.
Quadro delle 40 domande (risposta data, segnata) e «Termina l'esame» con conferma. Risultato:
giuste su 40, soglia di riferimento del 50% con l'avviso che non è la regola ufficiale, tempo usato,
tabella per argomento, domande sbagliate o senza risposta con le spiegazioni e il link alla
lezione. Storico (fino a 100 prove) nella pagina e nella pagina principale, anche nel backup. Le
risposte date entrano nelle scatole del ripasso. I test fanno avanzare l'orologio del browser per
provare il tempo che scade.

### M5. Pratica al terminale
- Esercizi con i comandi dell'esame (ls, cd, cp, mv, mkdir, rm, find, grep, tar, chmod...).
  Serve un piccolo file system simulato: è il lavoro più grande, per questo viene dopo le domande.
- Le pipeline vengono dal motore di Pipe Dreams, già verificato con bash.

**Fatta il 12/11/2026.** Un Linux simulato nel browser (`shell-sim.js`, `shell-commands.js`):
file system in memoria con utenti, gruppi, permessi (anche sticky bit, setuid, setgid), link
simbolici e fisici; shell con virgolette, variabili, `~`, caratteri jolly, pipe, `;`, `&&`, `||` e
i reindirizzamenti; 65 comandi più sudo (ls, cd, mkdir, cp, mv, rm, ln, find, grep, tar, gzip, bzip2,
xz, zip, chmod, chown con sudo...). I filtri sort, uniq, cut, tr, nl, tac, rev e sed sono quelli di
Pipe Dreams (`lib/`, copiati senza modifiche). 38 esercizi sugli obiettivi 2.1, 2.3, 2.4, 3.1, 3.2,
3.3, 5.3 e 5.4, con gli obiettivi che si spuntano dopo ogni comando, suggerimento, soluzione e
«Ricomincia»; terminale libero. `tools/check-shell.js` (anche in CI) ricrea il file system in una
directory vera ed esegue in Bash le soluzioni e oltre 200 casi tipici: stesso output, stessi
errori e codici di uscita, stessi file alla fine. Il simulatore si comporta come Bash con
LC_ALL=C, ma i messaggi di errore sono in italiano. Non esegue script né editor (vi, nano): per gli
script si scrive il file con echo e si danno i permessi.

### M6. Pubblicazione
- GitHub Pages (repository pubblico) e copia offline (service worker).
- Script per il container Proxmox, come per Pipe Dreams.

**Fatta il 12/11/2026.** `tools/build-site.sh` prepara il sito (solo i file dell'app, con la
versione in `version.js` e un nome nuovo per la cache del service worker); il workflow lo controlla
(`tools/check-site.js`), esegue tutti i test nel browser proprio sul sito preparato e, dal branch
`main`, lo pubblica su GitHub Pages. Per Proxmox, `deploy/proxmox-lxc.sh` e
`deploy/certlpi-setup.sh` vengono da Pipe Dreams: Alpine, nginx in HTTPS con una CA locale, porte
8444/8081 (per convivere con Pipe Dreams), e un Linux vero per esercitarsi (utente anna con i file
del simulatore, pagine man, useradd). Provati: shellcheck, certificati, configurazione di nginx in
Alpine. Da provare sul Proxmox vero: installazione dei pacchetti e comandi pct/pveam.
Da fare una volta, a mano: unire il branch in `main` e attivare Settings → Pages → Source:
«GitHub Actions».

### Sincronizzazione fra i dispositivi (14/11/2026)
Come in Pipe Dreams: i progressi vanno in `certificazioni-lpi.json` di un repository GitHub privato
(predefinito lo stesso di Pipe Dreams, `paselsoft/pipedreams-progressi`, con la stessa chiave
fine-grained; sullo stesso sito basta «Usa la chiave di Pipe Dreams»). Ogni dispositivo scarica,
unisce (`mergeProgress`) e salva se è cambiato qualcosa: all'apertura, qualche secondo dopo ogni
progresso, quando la pagina torna visibile o torna la rete. Unione: spunte con l'ora (vince
l'azione più recente, anche togliere una spunta, grazie a `removed`), per ogni domanda la risposta
più recente con la sua scatola, tutte le simulazioni. Restano di ogni dispositivo il punto di
lettura e la simulazione in corso. Test con un'API di GitHub simulata.

### Palestra su un Linux vero (14/11/2026)
Per esercitarsi con il terminale vero (per esempio Linux Mint in VirtualBox): `palestra/palestra.sh`,
scaricabile dalla pagina del terminale. `sudo bash palestra.sh installa` crea gli utenti anna
(password anna, gruppi sudo e sviluppo) e luca, `/var/log/app.log` e il comando `lpi-esercizio`,
che rimette la home di anna come nel simulatore per l'esercizio scelto e ne mostra il compito
(`lpi-esercizio soluzione ID` la soluzione, `inizio`, `disinstalla`). Lavora solo da anna, per non
toccare i file dell'utente. Lo script è generato dagli esercizi (`tools/build-palestra.js`);
`tools/check-palestra.js` confronta ogni home preparata con quella del simulatore e in CI installa
la palestra davvero ed esegue le soluzioni da anna.

### Dopo
- LPIC-1, esami 101 e 102, con lo stesso schema.

### Miglioramenti dopo M6

- **Correzioni alle domande (15/11/2026).** Undici completamenti accettano ora anche le altre forme
  giuste dello stesso comando (per esempio `tar cfz ...`, `tar -c -z -f ...`, `rm -rf vecchi/`,
  `man 1 ls`, `useradd luca -m`, `ls -a` dove si chiede l'opzione `-a`). Ogni domanda elenca le forme
  in più da accettare (`alsoAccepted`) e quelle da rifiutare (`notAccepted`): le controllano sia
  `tools/check-questions.js` sia un test nel browser. Corretta la spiegazione della 2.4-05 (il
  messaggio è di `rmdir`, non di Bash). Da fare: accorciare le risposte giuste, che in 111 domande
  a scelta singola su 173 sono l'opzione più lunga.

- **«Sono pronto?» (15/11/2026).** Pagina `#/pronto` (`readiness.js`), dal menu e dalla pagina
  principale: per ogni obiettivo le domande con l'ultima risposta giusta sul totale (le mai viste
  contano come non sapute), quelle sbagliate e da ripassare oggi, le lezioni lette, gli esercizi al
  terminale e un livello (solido dall'80%, da rinforzare dal 50%, debole sotto, da iniziare). In
  alto la stima «se l'esame fosse oggi» (ogni obiettivo pesa quanto all'esame), la media delle
  ultime 3 simulazioni (anche per argomento) e un giudizio a parole, che non promette l'esito
  perché la soglia vera non è pubblica: consiglia l'80% nelle domande e il 75% nelle simulazioni.
  «Da dove conviene ripartire» elenca i 4 obiettivi dove si guadagnano più domande (peso × parte
  non saputa) e «Allenati sui punti deboli» propone 10 domande da quelli: prima le sbagliate, poi
  le mai viste. Non salva dati nuovi. `tools/check-site.js` controlla anche che ogni file caricato
  dalla pagina sia tra quelli salvati per l'uso offline.

- **Script nel simulatore, primo passo (15/11/2026).** Il simulatore esegue gli script:
  `bash file` e `sh file` (basta il permesso di lettura), `./file` e i percorsi (serve il permesso
  di esecuzione; lo shebang deve indicare bash o sh), il solo nome se il file sta in una directory
  di `PATH` (`~` vale anche dopo `:` nelle assegnazioni). Dentro lo script: `$1`...`$9`, `${10}`,
  `$#`, `$@` (`"$@"` tiene separati gli argomenti), `$*`, `$0`, `exit` con o senza codice. Lo
  script è un processo figlio: riceve solo le variabili esportate (e `X=1 ./script`), e la sua
  directory e le sue variabili non tornano a chi lo lancia; riceve lo stdin (`| bash s.sh`) e il
  suo output si può reindirizzare. Un errore di sintassi ferma lo script con il numero di riga.
  Sei esercizi nuovi per il 3.3 (da 1 a 7): avviare senza permesso, `./`, `$1`, `$#` e virgolette,
  `$?`, `PATH`. 31 sequenze in più confrontate con Bash vero; la palestra controlla il codice di
  uscita della soluzione invece di pretendere 0.

- **Script nel simulatore, secondo passo (15/11/2026).** `for VAR in ELENCO; do ...; done` (anche
  `for VAR; do`, che scorre `"$@"`, con `break` e `continue`), `if ...; then ...; elif ...; else
  ...; fi`, `!` davanti a un comando, e `test` / `[ ... ]`: file (`-e -f -d -L -r -w -x -s`),
  stringhe (`-z -n = == !=`), numeri (`-eq -ne -lt -le -gt -ge`), `!`. Il parser è diventato
  ricorsivo (`simParse`): i cicli si annidano, e dopo `done` e `fi` valgono `|` e i
  reindirizzamenti. Nel terminale si scrive tutto su una riga (se manca `done` o `fi` il messaggio
  lo spiega); in uno script un `for` o un `if` può occupare più righe, perché le righe si leggono
  finché il comando è completo. `>&2` manda davvero lo stdout tra gli errori. `while`, `until`,
  `case` e le funzioni rispondono che non sono disponibili. Quattro esercizi nuovi per il 3.3 (da 7
  a 11): un ciclo su una riga, `"$@"` in uno script, `if [ -f ... ]`, leggere uno script con `$#`
  ed `exit`. 65 sequenze in più confrontate con Bash vero (345 in tutto).

- **Aiuto dalla riga di comando, obiettivo 2.2 (16/11/2026).** `shell-help.js`: 20 pagine di
  manuale scritte da zero per l'app, in italiano e in breve, con la forma di quelle vere (NOME,
  SINTASSI, DESCRIZIONE, OPZIONI, VEDI ANCHE) e a capo sulla larghezza del terminale. `man PAGINA`,
  `man SEZIONE PAGINA` (`passwd` è nelle sezioni 1 e 5), `man -k` e `apropos`, `man -f` e `whatis`,
  `info` (menu di partenza e un nodo per argomento), `COMANDO --help` per i comandi che hanno una
  pagina, `help NOME` per i comandi interni. `/usr/share/doc` ha la documentazione di `tar` e
  `grep`. `locate` (anche `-i`, `-c` e i caratteri jolly) cerca in un database fatto all'inizio
  dell'esercizio e mostra solo i percorsi a cui l'utente può arrivare; `updatedb` lo rifà, solo
  da root. Otto esercizi (il 2.2 ne aveva zero), tutti `bash: false`: le risposte sono del
  simulatore. Nella palestra, su un Linux vero, gli stessi esercizi si fanno con il `man` vero.

- **Dove sono memorizzati i dati, obiettivo 4.3 (18/11/2026).** `shell-system.js` aggiunge un
  piccolo computer finto e fisso, acceso da due giorni: 14 processi (systemd, sshd, cron,
  rsyslogd, la sessione di luca con `top`, la shell di anna con PID 4242 come `$$`); `ps` (da solo,
  `-e`, `-f`, `-ef`, `-u`, `-p`, `aux`, `ax`, `u`, `x`; mostra anche gli altri comandi della
  pipeline, come `grep`; sullo schermo taglia le righe alla larghezza del terminale), `top` (una
  schermata sola), `uptime`, `free` (`-h`, `-m`, `-g`), `dmesg` (solo da root, come su Ubuntu),
  `journalctl` (`-n`, `-k`, `-u`; root o gruppo adm). File nuovi: `/var/log/syslog`, `kern.log`,
  `auth.log` (gruppo adm) e `dpkg.log`; `/boot` con kernel, initrd, config e `grub/grub.cfg`;
  `/dev` con dispositivi a blocchi e a caratteri (`ls -l` mostra `b`/`c` e i numeri maggiore e
  minore, `file` e `test -b`/`-c` li riconoscono), compresa la chiavetta `sdb`; `/proc` con
  `cpuinfo`, `meminfo`, `version`, `uptime`, `partitions`, le directory dei processi 1 e 4242 e
  `self` (i file risultano grandi 0); `/sys` con disco e schede di rete; `/etc/fstab` e
  `/etc/os-release`. Dieci esercizi (il 4.3 ne aveva zero), tutti `bash: false`.

- **Il computer in rete, obiettivo 4.4 (18/11/2026).** `shell-network.js`: una LAN finta
  `192.168.1.0/24` (il computer è `192.168.1.50` sulla scheda `enp0s3`, con IPv6 `fe80::` e
  `2001:db8:1::`; il router `192.168.1.1` fa anche da DNS; il NAS è `192.168.1.10`). `ip addr`,
  `ip link`, `ip route` (anche abbreviati, con `-4`/`-6` e una scheda; per cambiare la rete dice
  che si può solo guardare), `ifconfig`, `route` (`-n`), `ss` e `netstat` (`-t -u -l -a -n -p`,
  i processi solo da root; `netstat -r`), `ping` (`-c`, `-4`, `-6`, `ping6`: senza `-c` si ferma
  dopo 4 pacchetti e lo dice; legge `/etc/hosts`, poi il DNS; nessuno risponde agli altri
  indirizzi della LAN), `host` (chiede al DNS e non guarda `/etc/hosts`; `-t A|AAAA`, ricerca
  inversa), `hostname -I -f -d -i`. Gli indirizzi su Internet sono di quelli riservati agli
  esempi (203.0.113.x, 198.51.100.x, 2001:db8::). `/etc/hosts` ha anche la riga IPv6 di `::1`.
  Dieci esercizi (il 4.4 ne aveva zero), tutti `bash: false`.

- **Sicurezza di base e tipi di utente, obiettivo 5.1 (19/11/2026).** `shell-users.js`: `who`
  (`-H`, `-b`, `-q`, `who am i`), `w`, `last` (anche per utente e `-n`), `lastb` (solo root),
  `getent passwd|group|shadow`, `su` (da root senza password; da un altro utente spiega che la
  password non si può scrivere e propone `sudo su - UTENTE`; `-`, `-c`), `sudo` riscritto: lo
  usa solo chi è nel gruppo `sudo` (luca riceve «luca is not in the sudoers file.»), con `-l`,
  `-u UTENTE`, `-i`, `-s` e `sudo su [-] [UTENTE]`. Le shell aperte con `su` o `sudo -i` stanno
  una dentro l'altra: il prompt mostra l'utente (e `#` per root), `exit` torna a quella di prima
  scrivendo `logout`; `www-data` ha `nologin` e non si apre. `/etc/shadow` ha una riga per ogni
  utente (gruppo `shadow`), c'è `/etc/sudoers` (440). Nuovi obiettivi degli esercizi: `user`
  (chi è l'utente della shell) e `history` (uno dei comandi scritti). Dieci esercizi (il 5.1 ne
  aveva zero), tutti `bash: false`.

- **Creazione di utenti e gruppi, obiettivo 5.2 (19/11/2026).** Gli utenti, i gruppi e le
  password sono ora di ogni shell (`sh.users`, `sh.groups`, `sh.shadow`, copiati da quelli fissi;
  `usersOf(sh)` e `groupsOf(sh)` li leggono) e `shell-accounts.js` li cambia, riscrivendo
  `/etc/passwd`, `/etc/group` e `/etc/shadow`: `useradd` (`-m`, `-d`, `-s`, `-c`, `-g`, `-G`, `-u`,
  `-r`; come su Ubuntu senza `-m` niente home, shell `/bin/sh`, un gruppo con lo stesso nome, home
  750 con la copia di `/etc/skel`, che ora ha anche `.profile`), `groupadd` (`-g`, `-r`), `usermod`
  (`-aG`, `-G` che sostituisce, `-g`, `-s`, `-c`, `-d`, `-L`, `-U`), `userdel` (`-r`; non chi è
  collegato; i file rimasti mostrano l'UID), `groupdel` (non il gruppo principale di un utente),
  `passwd` (`-S`, `-l`, `-u`, `-d`; la password non si digita e il messaggio propone `chpasswd`),
  `chpasswd`, `id -u -g -G -n`. Solo root li usa. Nuovi obiettivi degli esercizi `account` e
  `group`. Undici esercizi (il 5.2 ne aveva zero), tutti `bash: false`. La palestra non esegue mai
  da sola i comandi con `sudo` della preparazione (creerebbero utenti veri): li mostra prima del
  compito; `tools/check-palestra.js` lo controlla.

- **La risposta giusta non si riconosce più dalla lunghezza (20/11/2026).** Prima, in 110 domande
  a scelta singola su 173 (64%) la risposta giusta era l'opzione più lunga, spesso del doppio:
  si poteva indovinare senza sapere. Riscritte le opzioni di 109 domande (accorciando la giusta,
  che ha già la sua spiegazione nel «perché», e allungando le sbagliate con dettagli credibili),
  poi bilanciate: ora la giusta è più lunga di tutte le altre nel 17% delle domande, e per
  lunghezza è la prima (o pari) nel 35%, la seconda nel 29%, la terza nel 16%, la più corta nel
  20%. Nuove opzioni sbagliate in quattro domande (`apt-get download`, PostScript, `compress`,
  256 bit) e qualche risposta giusta più essenziale («Bash», «`man -k compress`», «In
  `/usr/bin`»), con la spiegazione aggiornata. `tools/check-questions.js` ora lo controlla: la
  giusta non può superare del 25% l'opzione sbagliata più lunga, è la più lunga al massimo nel 35%
  delle domande e nessuna posizione per lunghezza supera il 40%; `--stats` mostra le percentuali.
  Restano più lunghe di poco (al massimo del 20%) tre domande in cui le opzioni sono nomi brevi,
  come Impress e Writer.

- **27 domande nuove (20/11/2026).** Sugli argomenti che ne avevano una sola o nessuna, scritte da
  zero e già bilanciate per lunghezza: 11 per il 3.2 (`wc -l` e `-w`, `head -n`, `tail -f`,
  `sort -n` e `-r`, `uniq` che toglie solo i doppioni vicini, `sort | uniq -c`, `cut -d -f`,
  l'ultima riga con `tail`), 10 per il 3.3 (il ciclo `for` con i caratteri jolly e in una pipe, la
  parola `do`, `$?` dopo un errore e dopo `exit 3`, `&&` contro `;`, `||`, quali comandi escono con
  0) e 6 per il 4.4 (maschera e `/24`, la riga `UG` di `route -n`, `route -n` e `netstat -rn`,
  perché `ifconfig` manca su molti sistemi, `-n`, quali comandi mostrano gli indirizzi). Ora sono
  258 domande, da 9 a 27 per obiettivo. Ogni fatto citato (risultati di `uniq`, `sort -n`, il
  codice 2 di `ls`, i conteggi) è stato provato con Bash vero; il controllo anti-copia ha fatto
  riscrivere due frasi uguali a una lezione. I test nel browser leggono il numero delle domande
  invece di averlo scritto.

- **`lpi-esercizio verifica` nella palestra (21/11/2026).** Su un Linux vero, dopo un esercizio,
  `lpi-esercizio verifica` (o `verifica ID`) dice quali obiettivi sono raggiunti: ✓ fatto, ✗ da
  fare, ? da controllare a occhio, e alla fine «Esercizio completato!» o quanti ne mancano (codice
  di uscita 1). Controlla quello che un programma separato può vedere: file e directory (tipo,
  contenuto, permessi, proprietario, link, stesso inode, archivi tar, gzip e zip con i loro file),
  la directory corrente, le variabili esportate (il `PATH` deve finire con la directory aggiunta e
  contenere ancora `/usr/bin`), l'utente della shell, gli account e i gruppi (lo stato delle
  password solo da root). Quello che è comparso sullo schermo e i comandi scritti non si vedono:
  sono i «?», da confrontare con la soluzione. L'esercizio in corso è nel file nascosto
  `~/.lpi-esercizio`. I controlli sono generati dagli obiettivi degli esercizi
  (`tools/build-palestra.js`); con `realContent` un obiettivo dice come calcolare il contenuto
  giusto sul sistema vero (i nomi degli utenti di `/etc/passwd`). `tools/check-palestra.js
  --installa` verifica, per ogni esercizio che gira in Bash vero, che `verifica` dica «da fare»
  prima della soluzione quando il simulatore dice lo stesso, e «tutto fatto» dopo.

- **Tasti rapidi, Tab e Chrome vecchi (21/11/2026).** Nel terminale Tab completa la prima parola
  con i nomi dei comandi e le altre con i nomi dei file (le directory con la `/`, i nomi con gli
  spazi protetti da `\`, i file nascosti solo se la parola inizia con un punto, anche con `~/` e
  dopo `|`, `;`, `&&` e `>`); con più nomi possibili completa la parte comune, e se non c'è niente
  da aggiungere li elenca sotto la riga, come Bash (`shell-complete.js`). Con la riga vuota Tab fa
  il suo lavoro normale (passa al pulsante successivo): la tastiera non resta intrappolata. Sotto il
  terminale, sugli schermi fino a 700 px e su quelli touch, una fila di tasti rapidi: Tab, ↑, ↓,
  `|`, `>`, `~`, `/`, `-`, `*`, `$`, `&&`; inseriscono al posto del cursore e non tolgono il fuoco
  alla riga di comando, così la tastiera del telefono resta aperta. L'opzione scelta delle domande
  è evidenziata anche nei browser senza `:has()` (Chrome prima della 105), con la classe
  `is-checked`.

- **Simulazioni per obiettivo (20/11/2026).** Alla fine di una simulazione d'esame l'app salva,
  oltre al risultato per argomento, anche quello per obiettivo (`objectives` nello storico, anche
  nel backup e nella sincronizzazione). In «Sono pronto?» ogni riga mostra le ultime simulazioni
  per quell'obiettivo («Nelle ultime 3 simulazioni: 4 giuste su 6»); sotto la metà la riga è in
  grassetto e dice «ripassalo». Contano le stesse ultime 3 simulazioni del riepilogo; quelle fatte
  prima di questa modifica non hanno il dettaglio per obiettivo e restano solo negli argomenti.

- **Più domande dove erano poche (21/11/2026).** 56 domande nuove, scritte da zero dagli obiettivi
  pubblici, per gli obiettivi che ne avevano da 9 a 14: ora ognuno ne ha almeno 15 (3.2 e 3.3 27,
  4.4 20), 314 in tutto. Tra gli argomenti nuovi: Linux Mint, Scientific Linux, RHEL e Fedora,
  `apt-cache search`, PHP, GPL e vendita, CC BY-SA, LGPL, gestori di password, chiavi di GnuPG,
  `find -size` e `-type`, `whatis`, `cp -r`, `[0-9]`, `tar -v`, `bzip2 -d`, `unzip -l`, rolling
  release, versioni stabili, macOS, swap, core, `/proc/cpuinfo`, GECOS, `/etc/sudoers`,
  `groupdel`, `!` in `/etc/shadow`, `chmod 640` e `go-r`, `chgrp`, hard link e `ls -i`. I
  risultati dei comandi citati (`echo file[0-9].txt`, `tar -tf` su uno zip, `unzip -x`, `ls
  -size`) sono stati provati sul sistema vero.

- **Gli editor nano e vi (21/11/2026).** Nel simulatore `nano`, `vi` e `vim` aprono un editor al
  posto della riga di comando (`shell-editor.js` prepara l'apertura, `editor-view.js` lo mostra).
  Il testo sta in una vera area di testo, letta dai lettori di schermo. nano: si scrive subito,
  Ctrl+O salva chiedendo il nome, Ctrl+X esce (con modifiche chiede S/N/Ctrl+C), Ctrl+K e Ctrl+U
  tagliano e incollano la riga, Ctrl+C dice la posizione; i comandi in basso sono anche pulsanti.
  vi: modo comandi e modo inserimento (`i a I A o O`, Esc), `h j k l` e frecce, `0 $ gg G`,
  `x dd yy p P u`, `/` e `n`, `:w :q :q! :wq :x :w NOME`, un numero per andare alla riga, `ZZ` e
  `ZQ`; con modifiche `:q` si rifiuta (E37). Sul telefono il tasto Esc è un pulsante, e quello che
  si scrive nel modo comandi viene intercettato dal testo cambiato. Si salva con i permessi di chi
  ha aperto l'editor (`sudo nano /etc/hostname` sì, da anna no); non si apre in una pipe, con `>` o
  in uno script. Pagine `man nano`, `man vi`, `man vim` e una riga in `help`. 5 esercizi nuovi nel
  3.3 (ora 16): un file con nano, una riga aggiunta salvando all'uscita, un file con vi, `dd` per
  togliere una riga, uno script scritto con vim. Negli esercizi con un editor, `steps` contiene i
  tasti per i test nel browser; nella palestra (Linux vero) si usano i nano e vi veri, e
  `lpi-esercizio verifica` controlla il contenuto dei file.

- **I pacchetti nel simulatore (21/11/2026).** Il simulatore è un sistema della famiglia Debian,
  come Ubuntu e Mint (`shell-packages.js`): `dpkg -l` (con gli stati `ii` e `rc`), `-L`, `-s`,
  `-S`, `-r`, `-P` (e `-i`, che spiega di usare apt-get); `apt-get update`, `upgrade`, `install`,
  `remove`, `purge`, `autoremove`; `apt-cache search`, `show`, `policy`; `apt` con gli stessi e
  `list`. Installare e togliere richiede root (senza `sudo` c'è l'errore del «lock» di dpkg),
  `remove` chiede conferma (nel simulatore non si può rispondere: si usa `-y`) e lascia i file di
  configurazione, `purge` li toglie; i pacchetti essenziali non si tolgono. Ogni shell ha il suo
  elenco: installare `tree` fa comparire il comando (con il vero formato di `tree` con
  LC_ALL=C, provato sul sistema vero), togliere `nano` o `vim-tiny` fa sparire gli editor; per un
  comando di un pacchetto non installato il messaggio dice come installarlo. `rpm`, `yum`, `dnf`
  e `zypper` non ci sono, e il messaggio spiega a quali distribuzioni servono. Pagine `man dpkg`,
  `man apt-get`, `man apt-cache`. Nuovo tipo di obiettivo `{ package, state }`, controllato anche
  dalla palestra con `dpkg-query`. 5 esercizi per l'1.2, che non ne aveva: `dpkg -l`,
  installare `tree`, cercare con `apt-cache search`, `dpkg -S` e `-L`, `purge` di nginx.

- **Altri esercizi dove erano pochi (21/11/2026).** 20 esercizi nuovi, 127 in tutto: 2.1 (ora 7:
  `export` con `env | grep`, `history`, `$` e `\$` tra virgolette doppie), 2.3 (8: `cd -`, `cd`
  da solo, `ls -d */`), 3.1 (9: `bzip2`, `tar -cJf`, `gunzip`, `unzip -l`), 5.3 (8: `chmod 750`,
  `chgrp`, `chmod u=rw,g=r,o=`), 5.4 (7: un link rotto, `ls -i` sugli hard link, un link a una
  directory) e i primi 4 del 4.2 (`/proc/cpuinfo`, `/proc/meminfo`, `ls -l /dev/sd*`,
  `/proc/partitions`). Nel simulatore: `ls -i` (il numero di inode, uguale per gli hard link) e
  `*/` che ora corrisponde solo alle directory (prima anche ai file). Obiettivi nuovi: il gruppo
  di un file (`group` con `path`) e i formati `bzip2`, `xz`, `tar.bz2`, `tar.xz`, controllati
  anche dalla palestra (che ora dà «da fare» anche quando un file non è davvero compresso con gzip).
  La palestra crea i link con la loro data e `check-palestra.js` controlla anche i file preparati
  con `gzip` e `zip`. Gli esercizi che girano in Bash vero sono confrontati da `check-shell.js`
  (357 sequenze, 0 differenze).

- **Il giorno dell'esame (21/11/2026).** In «Sono pronto?» si sceglie il giorno dell'esame (un
  campo data, da oggi al 30/04/2027): l'app dice quanti giorni mancano e il piano. Prima
  dell'ultimo periodo (4 settimane): gli obiettivi non ancora «solidi» divisi per le settimane di
  studio, le domande mai viste divise per i giorni, e la data da cui iniziare le simulazioni.
  Nell'ultimo periodo: una simulazione a settimana (con quante se ne sono fatte nelle ultime 4
  settimane) e gli obiettivi da rinforzare. Il giorno stesso un augurio, dopo un invito a
  scegliere una nuova data; oltre aprile 2027 un avviso. La pagina principale mostra «Esame il …:
  mancano N giorni» oppure l'invito a sceglierlo. La scelta sta in `progress.plans` (anche nel
  backup e nella sincronizzazione: vince la scelta più recente, anche quella di toglierla).

- **L'andamento delle simulazioni (21/11/2026).** Con almeno due simulazioni, sopra lo storico
  compare un piccolo grafico (SVG scritto a mano, senza librerie): la percentuale di ognuna delle
  ultime 20, dalla più vecchia alla più recente, con le linee dello 0, 25, 50 e 100% e quella
  tratteggiata del 75% consigliato; i punti sopra il 75% sono pieni. Per i lettori di schermo il
  grafico è un'immagine con una descrizione in parole (primo e ultimo risultato, il migliore,
  quanti sopra il 75%); i numeri restano nella tabella. Sotto, una frase: «dal 55% all'83%
  (+28 punti)», con l'articolo giusto («all'83%», «al 55%»). Colori dai temi chiaro e scuro.

### Miglioramenti ancora da fare (analisi del 15/11/2026)

In ordine di utilità per l'esame. Uno alla volta, ognuno con i suoi test e la sua richiesta di unione.

1. **Script nel simulatore: quello che resta.** I due passi sono fatti (vedi sopra): il 3.3 ha 11
   esercizi. Solo se servono: `$(...)`, `read`, `alias`, i cicli `while` (chiedono anche `$((...))`),
   `-a` e `-o` in `test`.
2. **Esercizi per tutti gli obiettivi: fatto.** Dal 15 al 19/11/2026 gli obiettivi senza pratica
   (2.2, 4.3, 4.4, 5.1, 5.2) hanno avuto 10 esercizi ciascuno o quasi (vedi sopra). Ora ogni
   obiettivo d'esame che si può provare al terminale ha i suoi esercizi.
3. **Domande: risposte giuste troppo lunghe: fatto** (vedi sopra).
4. **Domande nuove: fatto** (vedi sopra).

5. **`lpi-esercizio verifica` nella palestra: fatto** (vedi sopra).
6. **Telefono e High Sierra: fatto** (vedi sopra).
7. **Simulazioni per obiettivo: fatto** (vedi sopra).

### Miglioramenti ancora da fare (analisi del 20/11/2026)

Tutti quelli dell'analisi del 15/11 sono fatti. Questi sono i nuovi, in ordine di utilità per
l'esame; uno alla volta, ognuno con i suoi test e la sua richiesta di unione.

1. **Più domande dove sono poche: fatto** (vedi sopra).
2. **Gli editor vi e nano nel simulatore: fatto** (vedi sopra).
3. **I pacchetti nel simulatore: fatto** (vedi sopra).
4. **Altri esercizi dove sono pochi: fatto** (vedi sopra).
5. **La data dell'esame: fatto** (vedi sopra).
6. **L'andamento delle simulazioni: fatto** (vedi sopra).
7. **Glossario dei termini.** I termini degli obiettivi (Debian, LTS, sticky bit, `/dev/sd*`,
   GPL…) in una pagina sola, ognuno con una spiegazione breve scritta da zero e il collegamento
   all'obiettivo e alla lezione; con una casella di ricerca.

## Regole del progetto

- Tutto in italiano, accessibile (tastiera, lettori di schermo, contrasto), leggibile anche su
  telefono (320 px) e su macOS High Sierra (solo emoji fino alla versione 5.0).
- Nessun testo LPI modificato; le lezioni solo integrali, con licenza e fonte.
- Ogni domanda ha: obiettivo, tipo, testo, opzioni, risposte giuste, spiegazione per opzione,
  link alla lezione. Un controllo automatico (in CI) verifica il formato, che le risposte giuste
  esistano, che gli obiettivi siano coperti in proporzione al peso e che non ci siano frasi copiate
  dalle lezioni.
- Test nel browser (Playwright) per ogni funzione, come in Pipe Dreams.

### Punteggio (verificato il 12/11/2026)

- Ogni esame LPI ha un punteggio da 200 a 800 e **si supera con 500**. Il numero di risposte
  giuste che serve non è fisso: dipende da quali domande capitano, perché hanno difficoltà
  diverse e i candidati non ricevono tutti le stesse. Il valore esatto viene da studi statistici
  di LPI. Fonte: [FAQ di LPI](https://www.lpi.org/about-lpi/frequently-asked-questions/), domanda
  «How are the LPIC test scores computed?» (la risposta vale per «ogni esame LPI»).
- Per Linux Essentials 010-160 lo conferma un articolo del blog ufficiale LPI: «Minimum passing
  score: 500 out of 800»
  ([How I Scored 100% on the Linux Essentials Exam](https://www.lpi.org/blog/2026/02/12/how-i-scored-100-on-the-linux-essentials-exam/), 12/02/2026).
- La stessa FAQ dice che c'è **una domanda per ogni punto di peso**: un obiettivo di peso 4 ha 4
  domande all'esame. Per Linux Essentials (peso totale 40) sono 40 domande.

Per la simulazione (M4): la conversione tra risposte giuste e punteggio non è pubblica, quindi
l'app non può dire «hai superato l'esame». Mostrerà la percentuale di risposte giuste e, come
indicazione e non come regola ufficiale, una soglia di riferimento: 500 su una scala 200-800
corrisponde in proporzione al 50% (200 + 0,5 × 600). Avvisando che il valore vero può essere
diverso, conviene puntare a stare con margine sopra quella soglia.

## Domande aperte

Nessuna per ora.
