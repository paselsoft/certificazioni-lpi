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

### Miglioramenti ancora da fare (analisi del 15/11/2026)

In ordine di utilità per l'esame. Uno alla volta, ognuno con i suoi test e la sua richiesta di unione.

1. **Script nel simulatore: quello che resta.** I due passi sono fatti (vedi sopra): il 3.3 ha 11
   esercizi. Solo se servono: `$(...)`, `read`, `alias`, i cicli `while` (chiedono anche `$((...))`),
   `-a` e `-o` in `test`.
2. **Esercizi per gli obiettivi senza pratica** (restano 4.3, 4.4, 5.1, 5.2: peso 9 su 40, zero
   esercizi; il 2.2 è fatto, vedi sopra). Mancano al simulatore: `ps`, `top`, `free`, `dmesg`,
   `ip`, `ping`, `host`, `ss`, `who`, `w`, `last`, `su`, `useradd`, `groupadd`, `passwd`; `/proc` e
   `/dev` sono vuoti. Un obiettivo alla volta. Le risposte sono finte e fisse, quindi non
   confrontabili con Bash vero.
3. **Domande: risposte giuste troppo lunghe.** In 111 domande a scelta singola su 173 la risposta
   giusta è l'opzione più lunga: si può indovinare senza sapere. Vanno riscritte una per una
   (accorciare la giusta o allungare i distrattori), magari con una statistica in
   `tools/check-questions.js --stats`.
4. **Domande nuove (25-30)** sugli argomenti con una sola domanda o nessuna: ciclo `for`, `$?`,
   `sort`, `wc`, `head`; `&&` e `||`, `uniq`, `ifconfig` e `route`, `tail -f`.
5. **`lpi-esercizio verifica` nella palestra**: su un Linux vero dice quali obiettivi
   dell'esercizio sono raggiunti. Funziona bene per file, permessi e archivi; gli obiettivi del
   tipo «l'ultimo comando mostra...» sul sistema vero non si controllano allo stesso modo.
6. **Telefono e High Sierra**: una fila di tasti rapidi sopra la tastiera (`|`, `>`, `~`, `/`,
   `-`, freccia su) e il completamento dei nomi con Tab. L'app usa una sola funzione recente,
   `:has()` (Chrome 105 o successivo): se manca, l'opzione scelta resta solo meno evidenziata.
   Da sapere: la versione di Chrome sull'iMac (High Sierra arriva al massimo alla 116).
7. **Simulazioni per obiettivo**: oggi si salvano solo per argomento; salvandole anche per
   obiettivo, «Sono pronto?» potrebbe mostrarle riga per riga.

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
