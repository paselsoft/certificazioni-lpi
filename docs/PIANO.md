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

### M5. Pratica al terminale
- Esercizi con i comandi dell'esame (ls, cd, cp, mv, mkdir, rm, find, grep, tar, chmod...).
  Serve un piccolo file system simulato: è il lavoro più grande, per questo viene dopo le domande.
- Le pipeline vengono dal motore di Pipe Dreams, già verificato con bash.

### M6. Pubblicazione
- GitHub Pages (repository pubblico) e copia offline (service worker).
- Script per il container Proxmox, come per Pipe Dreams.

### Dopo
- LPIC-1, esami 101 e 102, con lo stesso schema.

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
