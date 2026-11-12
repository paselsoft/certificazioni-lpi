# Certificazioni LPI

App gratuita, in italiano, per prepararsi all'esame **Linux Essentials 1.6** (010-160) del Linux
Professional Institute (e in seguito a LPIC-1): obiettivi d'esame e lezioni ufficiali in italiano
da leggere anche senza connessione, domande originali con spiegazioni, un ripasso quotidiano, la
simulazione d'esame e la pratica al terminale. Il piano è in [docs/PIANO.md](docs/PIANO.md).

## Cosa c'è (tappe da M1 a M5)

- **Obiettivi**: i 5 argomenti e i 19 obiettivi dell'esame, con il peso, la descrizione, le aree di
  conoscenza e i file, termini e comandi da conoscere (dalla traduzione italiana ufficiale degli
  obiettivi, sulla wiki LPI).
- **Lezioni**: tutte le 24 lezioni ufficiali in italiano, integrali e non modificate, con indice
  delle sezioni, dimensione del testo regolabile e «Riprendi la lettura» dal punto in cui eri.
- **Domande**: 231 domande scritte per questa app (da 9 a 17 per obiettivo, secondo il peso), come
  all'esame: scelta singola, scelta multipla («scegli 2») e completamento. Dopo ogni risposta: il
  perché di ogni opzione e il link alla sezione della lezione da ripassare. Alla fine il risultato
  e «Ripeti le sbagliate».
- **Ripasso di oggi**: ogni giorno una decina di domande scelte con le scatole di Leitner. Una
  risposta sbagliata riporta la domanda nella scatola 1 (torna il giorno dopo), ogni risposta
  giusta la sposta nella scatola successiva (torna dopo 2, 4, 8, poi 16 giorni). Prima le domande
  scadute, poi quelle nuove degli obiettivi che stai studiando.
- **Simulazione d'esame**: 40 domande in 60 minuti, tante per obiettivo quanto il suo peso, come
  all'esame. Si può segnare una domanda e tornarci; il tempo continua anche chiudendo la pagina e
  allo scadere la prova termina. Alla fine: risposte giuste, risultato per argomento, le domande da
  rivedere con le spiegazioni, lo storico. All'esame vero si supera con 500 su 200-800, ma quante
  risposte giuste servono non è pubblico: l'app usa il 50% solo come riferimento.
- **Pratica al terminale**: 37 esercizi con i comandi dell'esame (directory, file, caratteri
  jolly, archivi, grep e filtri, reindirizzamenti, script, permessi, link) su un piccolo Linux
  simulato nel browser, con gli obiettivi che si spuntano, suggerimento e soluzione; più un
  terminale libero. I filtri di testo vengono dal motore di Pipe Dreams; le soluzioni e oltre 200
  casi tipici sono confrontati con Bash vero.
- **Progressi**: «Ho studiato questo obiettivo», «Ho letto questa lezione», le risposte alle domande,
  barre dei progressi.
  Restano nel browser; dalla pagina **Backup** si scaricano in un file e si ripristinano.
- **Senza connessione**: alla prima apertura (da un indirizzo http/https) il browser salva l'app e
  tutte le lezioni; dopo funziona anche offline.

## Dove si usa

- **Online**: https://paselsoft.github.io/certificazioni-lpi/ (GitHub Pages; si aggiorna da solo a
  ogni modifica del branch `main` che supera tutti i controlli). Alla prima apertura il browser
  salva l'app e le lezioni: poi funziona anche senza connessione.
- **Nel container Proxmox** (Alpine, come Pipe Dreams), con in più un Linux vero per esercitarsi:
  istruzioni in [deploy/README.md](deploy/README.md).

## Provarla sul computer

Serve solo un browser. Dalla cartella del progetto:

```sh
python3 -m http.server 8000
```

poi apri http://localhost:8000. (Aprendo `index.html` con un doppio clic l'app funziona, ma senza
il salvataggio per l'uso offline.)

## Per chi sviluppa

HTML, CSS e JavaScript senza librerie né compilazione. I file principali:

| File | Cosa fa |
|---|---|
| `index.html`, `style.css`, `app.js` | pagine e navigazione (`#/`, `#/010-160/obiettivo/2.1`, `#/010-160/lezione/2.1_01`, `#/backup`) |
| `store.js` | progressi e preferenze nel browser, backup |
| `lesson-view.js` | lettore delle lezioni (da Pipe Dreams) |
| `quiz.js` | le domande di un obiettivo, una alla volta (`#/010-160/domande/2.1`) |
| `exam-sim.js` | la simulazione d'esame (`#/simulazione`, `#/simulazione/risultato`) |
| `review.js` | il ripasso di oggi (`#/ripasso`); le scatole di Leitner sono in `store.js` |
| `questions/010-160/1.js` ... `5.js` | le domande, un file per argomento |
| `shell-sim.js`, `shell-commands.js` | la shell simulata: file system in memoria, interprete, comandi |
| `lib/pipedreams-*.js` | il motore dei filtri di Pipe Dreams, copiato senza modifiche |
| `exercise-check.js`, `practice.js` | gli esercizi al terminale: controllo degli obiettivi e pagina (`#/terminale`) |
| `exercises/010-160.js` | gli esercizi |
| `sw.js` | service worker per l'uso offline |
| `version.js` | la versione (commit e data), scritta da `tools/build-site.sh` |
| `deploy/` | gli script per il container Proxmox |
| `data/exams.js`, `data/exam-010-160.js` | esami e obiettivi; un file per esame (la 2.0 e LPIC-1 si aggiungono così) |
| `lessons/010-160/*.js` | le lezioni, una per file, caricate solo quando si aprono |

Strumenti e controlli:

```sh
python3 tools/import-objectives.py     # rigenera data/exam-010-160.js dalla wiki LPI
python3 tools/import-lpi-lessons.py    # riscarica le lezioni e controlla che il testo sia identico all'originale
node tools/check-data.js [--online]    # controlla dati, lezioni, licenza, file (e i link, con --online)
node tools/check-questions.js [--stats] # domande: formato, copertura per peso, nessuna frase copiata dalle lezioni
node tools/check-shell.js [filtro]     # la shell simulata confrontata con Bash vero (serve Linux)
node tools/check-emoji.js              # solo emoji visibili su macOS High Sierra
bash tools/build-site.sh _site         # il sito da pubblicare (solo i file dell'app, con la versione)
node tools/check-site.js _site         # il sito preparato è completo
E2E_ROOT=_site node tests/e2e/run.js   # i test nel browser sul sito preparato
node tests/e2e/run.js [filtro]         # test nel browser (Playwright; axe-core se installato)
```

I controlli girano in CI a ogni push (`.github/workflows/verifica.yml`); dal branch `main`, se
passano tutti, il sito viene pubblicato su GitHub Pages.

## Licenze

Le lezioni ufficiali sono del Linux Professional Institute (https://learning.lpi.org), con licenza
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.it): sono incluse
integrali e non modificate, con l'avviso di licenza e il link all'originale. Gli obiettivi d'esame
vengono dalla [wiki LPI](https://wiki.lpi.org/wiki/LinuxEssentials_Objectives_V1.6(IT)). Domande e
spiegazioni sono scritte da zero per questa app, partendo dagli obiettivi: un controllo
automatico verifica che nessuna contenga 8 parole di fila uguali a un passo delle lezioni.
