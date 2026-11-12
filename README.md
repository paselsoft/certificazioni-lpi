# Certificazioni LPI

App gratuita, in italiano, per prepararsi all'esame **Linux Essentials 1.6** (010-160) del Linux
Professional Institute (e in seguito a LPIC-1): obiettivi d'esame e lezioni ufficiali in italiano
da leggere anche senza connessione, domande originali con spiegazioni e un ripasso quotidiano.
Poi arriverà la simulazione d'esame: il piano è in [docs/PIANO.md](docs/PIANO.md).

## Cosa c'è (tappe M1, M2 e M3)

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
- **Progressi**: «Ho studiato questo obiettivo», «Ho letto questa lezione», le risposte alle domande,
  barre dei progressi.
  Restano nel browser; dalla pagina **Backup** si scaricano in un file e si ripristinano.
- **Senza connessione**: alla prima apertura (da un indirizzo http/https) il browser salva l'app e
  tutte le lezioni; dopo funziona anche offline.

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
| `review.js` | il ripasso di oggi (`#/ripasso`); le scatole di Leitner sono in `store.js` |
| `questions/010-160/1.js` ... `5.js` | le domande, un file per argomento |
| `sw.js` | service worker per l'uso offline |
| `data/exams.js`, `data/exam-010-160.js` | esami e obiettivi; un file per esame (la 2.0 e LPIC-1 si aggiungono così) |
| `lessons/010-160/*.js` | le lezioni, una per file, caricate solo quando si aprono |

Strumenti e controlli:

```sh
python3 tools/import-objectives.py     # rigenera data/exam-010-160.js dalla wiki LPI
python3 tools/import-lpi-lessons.py    # riscarica le lezioni e controlla che il testo sia identico all'originale
node tools/check-data.js [--online]    # controlla dati, lezioni, licenza, file (e i link, con --online)
node tools/check-questions.js [--stats] # domande: formato, copertura per peso, nessuna frase copiata dalle lezioni
node tools/check-emoji.js              # solo emoji visibili su macOS High Sierra
node tests/e2e/run.js [filtro]         # test nel browser (Playwright; axe-core se installato)
```

I controlli girano in CI a ogni push (`.github/workflows/verifica.yml`).

## Licenze

Le lezioni ufficiali sono del Linux Professional Institute (https://learning.lpi.org), con licenza
[CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.it): sono incluse
integrali e non modificate, con l'avviso di licenza e il link all'originale. Gli obiettivi d'esame
vengono dalla [wiki LPI](https://wiki.lpi.org/wiki/LinuxEssentials_Objectives_V1.6(IT)). Domande e
spiegazioni sono scritte da zero per questa app, partendo dagli obiettivi: un controllo
automatico verifica che nessuna contenga 8 parole di fila uguali a un passo delle lezioni.
