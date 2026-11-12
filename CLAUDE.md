# Certificazioni LPI

App gratuita per prepararsi all'esame Linux Essentials 1.6 (010-160) del Linux Professional
Institute, da sostenere entro aprile 2027. Il piano, con le tappe M1-M6, è in `docs/PIANO.md`:
si lavora una tappa alla volta, nell'ordine.

## Con l'utente
- Rispondi sempre in italiano, con parole semplici: l'utente non è un programmatore e usa l'app
  per studiare.
- Usa l'app su un iMac con macOS High Sierra (Chrome) e la installa anche in un container LXC su
  Proxmox, come Pipe Dreams.

## Regole
- HTML, CSS e JavaScript senza librerie né passaggi di compilazione; funziona anche offline.
- Testi in italiano; accessibile (tastiera, lettori di schermo, contrasto); niente scorrimento
  orizzontale a 320 px.
- Solo emoji fino alla versione 5.0 (High Sierra non disegna quelle più recenti).
- Le lezioni LPI hanno licenza CC BY-NC-ND 4.0: si includono solo **integrali e non modificate**,
  con l'avviso di licenza e il link all'originale. Mai riassunti, adattamenti o esercizi LPI
  trasformati in quiz: domande e spiegazioni si scrivono da zero, partendo dagli obiettivi
  pubblici (wiki.lpi.org), e rimandano alla lezione ufficiale.
- Ogni funzione ha i suoi test nel browser (Playwright) e i controlli automatici girano in CI.

## Da riusare
Il repository paselsoft/PipeDreams ha già: il lettore delle lezioni (`lpi-lesson-view.js`), lo
strumento che le scarica e controlla che il testo sia identico all'originale
(`tools/import-lpi-lessons.py`), i dati degli obiettivi Linux Essentials 1.6 (`lpi.js`), il
service worker per l'uso offline, gli script per Proxmox (`deploy/`) e il motore delle pipeline
verificato con bash (`commands.js`).
