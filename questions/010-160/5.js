// Domande dell'argomento 5: Sicurezza e Permessi sui File.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// I permessi e i link sono stati provati in Bash. Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 5.1 Sicurezza di Base e Identificazione dei Tipi di Utente ----
    {
        id: "5.1-01", type: "single", ref: "5.1_01#L’Account Superuser",
        text: "Qual è lo UID (numero dell'utente) di root, l'amministratore?",
        options: [
            { t: "0", ok: true, why: "Il sistema riconosce l'amministratore dallo UID 0, non dal nome «root»." },
            { t: "1", ok: false, why: "Lo UID 1 è di solito un account di sistema (spesso `daemon`)." },
            { t: "1000", ok: false, why: "Su molte distribuzioni 1000 è il primo utente normale." },
            { t: "65534", ok: false, why: "Di solito è l'utente `nobody`, quello con meno privilegi." }
        ]
    },
    {
        id: "5.1-02", type: "single", ref: "5.1_01#Ottenere Informazioni Sugli Utenti",
        text: "Che cosa mostra il comando `id`?",
        options: [
            { t: "UID, gruppo principale e tutti i gruppi dell'utente", ok: true, why: "Per esempio `uid=1000(anna) gid=1000(anna) groups=1000(anna),27(sudo)`. Con un nome (`id luca`) mostra quelli di un altro utente." },
            { t: "Il numero del processo corrente, cioè della shell", ok: false, why: "Il numero di un processo (PID) si vede con `ps`." },
            { t: "La carta d'identità dell'utente salvata nel sistema", ok: false, why: "Il sistema conosce solo numeri e gruppi, non documenti." },
            { t: "Gli utenti collegati in questo momento al computer", ok: false, why: "Gli utenti collegati si vedono con `who` o `w`." }
        ]
    },
    {
        id: "5.1-03", type: "single", ref: "5.1_01#Ottenere Informazioni Sugli Utenti",
        text: "Quale comando mostra gli utenti collegati in questo momento?",
        options: [
            { t: "`who`", ok: true, why: "Elenca chi è collegato, su quale terminale e da quando. `w` aggiunge che cosa sta facendo e il carico del sistema." },
            { t: "`last`", ok: false, why: "`last` mostra lo storico degli accessi, anche di chi non è più collegato." },
            { t: "`id`", ok: false, why: "`id` mostra numeri e gruppi di un utente." },
            { t: "`passwd`", ok: false, why: "`passwd` cambia la password." }
        ]
    },
    {
        id: "5.1-04", type: "single", ref: "5.1_01#Ottenere Informazioni Sugli Utenti",
        text: "Che cosa mostra `last`?",
        options: [
            { t: "Lo storico degli accessi: chi è entrato, quando e per quanto", ok: true, why: "Legge il file `/var/log/wtmp`; i più recenti sono in cima." },
            { t: "L'ultimo comando eseguito nella shell, con data e ora", ok: false, why: "I comandi eseguiti si vedono con `history`." },
            { t: "L'ultimo file modificato nella directory corrente", ok: false, why: "Per i file modificati si usano `ls -t` o `find`." },
            { t: "L'ultima riga di un file di testo, come fa `tail -n 1`", ok: false, why: "Lo fa `tail -n 1`." }
        ]
    },
    {
        id: "5.1-05", type: "single", ref: "5.1_01#Cambiare Utente e Aumentare i Privilegi",
        text: "Che differenza c'è tra `sudo comando` e `su`?",
        options: [
            { t: "`sudo` chiede la tua password per un comando; `su` chiede quella dell'altro utente", ok: true, why: "Con `sudo` non serve conoscere la password di root, e ogni uso viene registrato." },
            { t: "Sono identici: `su` è solo il nome abbreviato di `sudo`", ok: false, why: "Chiedono password diverse e funzionano in modo diverso." },
            { t: "`su` funziona solo per un comando, mentre `sudo` apre sempre una shell", ok: false, why: "Di solito è il contrario." },
            { t: "`sudo` serve soltanto a cambiare la propria password, mentre `su` serve a diventare root", ok: false, why: "La password si cambia con `passwd`." }
        ]
    },
    {
        id: "5.1-06", type: "multiple", ref: "5.1_01#/etc/shadow",
        text: "Quali affermazioni su `/etc/passwd` e `/etc/shadow` sono vere?",
        options: [
            { t: "Le password, in forma di hash, sono in `/etc/shadow`", ok: true, why: "In `/etc/passwd` al posto della password c'è una `x`." },
            { t: "`/etc/shadow` può essere letto solo da root", ok: true, why: "Così gli utenti normali non possono provare a indovinare le password altrui." },
            { t: "`/etc/passwd` contiene le password in chiaro", ok: false, why: "Non le contiene, nemmeno cifrate: oggi c'è solo una `x`." },
            { t: "Tutti gli utenti possono leggere `/etc/shadow`", ok: false, why: "È leggibile solo da root (e a volte dal gruppo `shadow`)." },
            { t: "`/etc/group` contiene le password degli utenti", ok: false, why: "`/etc/group` elenca i gruppi e i loro membri." }
        ]
    },
    {
        id: "5.1-07", type: "single", ref: "5.1_01#Account di Sistema",
        text: "Che cosa sono gli account di sistema, come `daemon` o `www-data`?",
        options: [
            { t: "Account dei servizi, non di persone: UID bassi e niente login", ok: true, why: "Ogni servizio con il suo account ha solo i permessi che gli servono: se viene attaccato, i danni sono limitati." },
            { t: "Gli account degli amministratori, che possono usare `sudo`", ok: false, why: "L'amministratore è root; gli account di sistema hanno pochi privilegi." },
            { t: "Account creati per errore, da cancellare", ok: false, why: "Servono al funzionamento dei servizi: non vanno cancellati." },
            { t: "Gli account degli utenti ospiti, senza una directory home", ok: false, why: "Sono per i servizi, non per persone." }
        ]
    },
    {
        id: "5.1-08", type: "fill", ref: "5.1_01#Cambiare Utente e Aumentare i Privilegi", placeholder: "comando",
        text: "Quale comando apre una shell di login come root, con l'ambiente di root, chiedendo la password di root?",
        answers: ["su -", "su - root", "su -l", "su -l root", "su --login", "su --login root"],
        why: "`su -` (con il trattino) avvia una shell di login: carica l'ambiente di root e porta nella sua home. Senza trattino si diventa root mantenendo l'ambiente dell'utente."
    },
    {
        id: "5.1-09", type: "single", ref: "5.1_01#/etc/passwd",
        text: "In `/etc/passwd` c'è questa riga. Qual è la directory home di anna?",
        code: "anna:x:1001:1001:Anna Rossi:/home/anna:/bin/bash",
        options: [
            { t: "`/home/anna`", ok: true, why: "I campi sono: nome, password (x), UID, GID, descrizione, directory home, shell." },
            { t: "`/bin/bash`", ok: false, why: "L'ultimo campo è la shell di login." },
            { t: "`1001`", ok: false, why: "1001 è lo UID (e qui anche il GID)." },
            { t: "`Anna Rossi`", ok: false, why: "È il campo di descrizione (GECOS), di solito il nome completo." }
        ]
    },
    {
        id: "5.1-10", type: "single", ref: "5.1_01#Shell di Login e Directory Home",
        text: "Un account ha come shell `/usr/sbin/nologin`. Che cosa vuol dire?",
        options: [
            { t: "Che con quell'account non si entra nel sistema", ok: true, why: "Se qualcuno prova ad accedere, `nologin` mostra un messaggio e chiude." },
            { t: "Che l'utente non ha ancora una password e deve sceglierla", ok: false, why: "La password è un'altra cosa, in `/etc/shadow`." },
            { t: "Che l'utente può accedere senza password, dal solo nome", ok: false, why: "È il contrario: non può proprio aprire una shell." },
            { t: "Che l'utente è root, anche se ha un nome diverso", ok: false, why: "root si riconosce dallo UID 0." }
        ]
    },
    {
        id: "5.1-11", type: "single", ref: "5.1_01#Ottenere Informazioni Sugli Utenti",
        text: "Che cosa aggiunge `w` rispetto a `who`?",
        options: [
            { t: "Anche che cosa sta eseguendo ogni utente, più carico e uptime", ok: true, why: "La prima riga di `w` è simile al risultato di `uptime`." },
            { t: "Mostra anche chi si è scollegato nell'ultimo mese", ok: false, why: "Lo storico degli accessi lo mostra `last`." },
            { t: "Mostra le password cifrate degli utenti collegati", ok: false, why: "Nessun comando mostra le password." },
            { t: "Niente: `w` è solo un nome più breve dello stesso `who`", ok: false, why: "Mostra più informazioni." }
        ]
    },
    {
        id: "5.1-12", type: "single", ref: "5.1_01#Comprendere il Campo GECOS",
        text: "In una riga di `/etc/passwd`, che cosa c'è nel campo GECOS (il quinto)?",
        options: [
            { t: "Informazioni sull'utente, come il nome completo", ok: true, why: "Il campo GECOS è un commento: di solito contiene nome e cognome, a volte anche ufficio e telefono, separati da virgole." },
            { t: "La password dell'utente, cifrata con SHA-512", ok: false, why: "La password cifrata è in `/etc/shadow`; in `/etc/passwd` al suo posto c'è una `x`, nel secondo campo." },
            { t: "Il GID, cioè il numero del gruppo principale", ok: false, why: "Il GID è il quarto campo." },
            { t: "Il percorso della shell che parte all'accesso", ok: false, why: "La shell è l'ultimo campo, il settimo." }
        ]
    },
    {
        id: "5.1-13", type: "single", ref: "5.1_01#Cambiare Utente e Aumentare i Privilegi",
        text: "Quale file stabilisce chi può usare `sudo` e per quali comandi?",
        options: [
            { t: "`/etc/sudoers`", ok: true, why: "Si modifica con `visudo`, che controlla la sintassi prima di salvare: un errore lì potrebbe impedire a tutti di usare `sudo`." },
            { t: "`/etc/passwd`", ok: false, why: "`/etc/passwd` elenca gli account, non i permessi di `sudo`." },
            { t: "`/etc/shadow`", ok: false, why: "`/etc/shadow` contiene le password cifrate." },
            { t: "`/etc/hosts`", ok: false, why: "`/etc/hosts` associa nomi di computer e indirizzi IP." }
        ]
    },
    {
        id: "5.1-14", type: "multiple", ref: "5.1_01#Ottenere Informazioni Sugli Utenti",
        text: "Quali comandi mostrano chi sei, cioè l'utente con cui stai lavorando?",
        options: [
            { t: "`whoami`", ok: true, why: "Stampa solo il nome del tuo utente." },
            { t: "`id`", ok: true, why: "Mostra UID, gruppo principale e gruppi, con i nomi." },
            { t: "`pwd`", ok: false, why: "`pwd` stampa il percorso della directory corrente, non il nome dell'utente." },
            { t: "`uptime`", ok: false, why: "`uptime` dice da quanto tempo il sistema è acceso." },
            { t: "`useradd`", ok: false, why: "`useradd` crea un nuovo utente." }
        ]
    },
    {
        id: "5.1-15", type: "fill", ref: "5.1_01#Identificativi (UID/GID)", placeholder: "numero",
        text: "Quale numero di GID ha il gruppo `root`?",
        answers: ["0"],
        why: "Come l'utente root ha UID 0, il gruppo root ha GID 0. Lo vedi nella riga `root:x:0:` di `/etc/group`."
    },

    // ---- 5.2 Creazione di Utenti e Gruppi ----
    {
        id: "5.2-01", type: "fill", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti", placeholder: "comando",
        text: "Scrivi il comando (da eseguire come root) che crea l'utente `luca` con la sua directory home.",
        answers: ["useradd -m luca", "sudo useradd -m luca", "useradd --create-home luca", "sudo useradd --create-home luca"],
        pattern: "^(sudo )?useradd ((-m|--create-home) luca|luca (-m|--create-home))$",
        alsoAccepted: ["useradd luca -m"],
        notAccepted: ["useradd luca", "userdel -r luca", "groupadd luca"],
        why: "`-m` crea la home e ci copia i file di `/etc/skel`. Poi si imposta la password con `passwd luca`."
    },
    {
        id: "5.2-02", type: "single", ref: "5.2_01#La Directory Scheletro",
        text: "A che cosa serve la directory `/etc/skel`?",
        options: [
            { t: "Contiene i file da copiare nella home dei nuovi utenti", ok: true, why: "Mettendo un file in `/etc/skel` lo avranno tutti gli utenti creati da quel momento in poi." },
            { t: "Contiene le password cifrate di tutti gli utenti", ok: false, why: "Le password sono in `/etc/shadow`." },
            { t: "È il cestino dove finiscono gli utenti eliminati con `userdel`", ok: false, why: "Linux non ha un cestino per gli utenti." },
            { t: "Contiene i programmi di base del sistema, come `ls`", ok: false, why: "I programmi stanno in `/bin` e `/usr/bin`." }
        ]
    },
    {
        id: "5.2-03", type: "fill", ref: "5.2_01#Aggiungere ed Eliminare Gruppi", placeholder: "comando",
        text: "Scrivi il comando che crea il gruppo `sviluppo`.",
        answers: ["groupadd sviluppo", "sudo groupadd sviluppo"],
        why: "`groupadd` aggiunge una riga a `/etc/group`; `groupdel` elimina un gruppo."
    },
    {
        id: "5.2-04", type: "single", ref: "5.2_01#Il Comando passwd",
        text: "Che cosa fa `passwd` scritto da solo da un utente normale?",
        options: [
            { t: "Cambia la tua password, chiedendo quella attuale", ok: true, why: "Solo root può cambiare la password di un altro utente, con `passwd nome`." },
            { t: "Mostra in chiaro la password dell'utente che lo scrive", ok: false, why: "Le password non si possono leggere: sono conservate solo come hash." },
            { t: "Mostra il contenuto del file `/etc/passwd` con gli utenti", ok: false, why: "Per leggere il file si usa per esempio `cat /etc/passwd`." },
            { t: "Crea un nuovo utente, chiedendo nome e password da usare", ok: false, why: "Gli utenti si creano con `useradd`." }
        ]
    },
    {
        id: "5.2-05", type: "single", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti",
        text: "Che cosa fa `userdel -r luca`?",
        options: [
            { t: "Elimina l'utente `luca` insieme alla sua directory home", ok: true, why: "Senza `-r` l'utente viene tolto ma la sua home resta sul disco." },
            { t: "Elimina solo la directory home di `luca`, ma lascia l'utente", ok: false, why: "L'utente viene eliminato in ogni caso; `-r` toglie anche la home." },
            { t: "Rinomina l'utente `luca`", ok: false, why: "Per rinominare si usa `usermod -l`." },
            { t: "Blocca l'utente per un giorno", ok: false, why: "Per bloccare un account si usano per esempio `passwd -l` o `usermod -L`." }
        ]
    },
    {
        id: "5.2-06", type: "single", ref: "5.2_01#Il File /etc/group",
        text: "In `/etc/group` c'è questa riga. Chi fa parte del gruppo come membro aggiuntivo?",
        code: "sviluppo:x:1005:anna,luca",
        options: [
            { t: "anna e luca", ok: true, why: "I campi sono: nome del gruppo, password (x), GID e l'elenco dei membri separati da virgole." },
            { t: "Solo l'utente con UID 1005", ok: false, why: "1005 è il GID, il numero del gruppo." },
            { t: "Nessuno: la `x` indica che il gruppo è vuoto", ok: false, why: "La `x` dice che l'eventuale password del gruppo è in `/etc/gshadow`." },
            { t: "Tutti gli utenti del sistema", ok: false, why: "Solo quelli elencati nell'ultimo campo (più chi ha questo come gruppo principale)." }
        ]
    },
    {
        id: "5.2-07", type: "multiple", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti",
        text: "Quali opzioni di `useradd` sono descritte correttamente?",
        options: [
            { t: "`-m` crea la directory home", ok: true, why: "Senza `-m` molte distribuzioni non creano la home." },
            { t: "`-s` sceglie la shell di login, per esempio `-s /bin/bash`", ok: true, why: "Imposta l'ultimo campo della riga in `/etc/passwd`." },
            { t: "`-r` elimina l'utente con la sua home", ok: false, why: "Questo lo fa `userdel -r`; in `useradd`, `-r` crea un account di sistema." },
            { t: "`-l` elenca tutti gli utenti", ok: false, why: "`useradd` crea utenti, non li elenca; per vederli si legge `/etc/passwd`." }
        ]
    },
    {
        id: "5.2-08", type: "single", ref: "5.2_01#Il File /etc/shadow",
        text: "Che cosa c'è nel secondo campo di una riga di `/etc/shadow`?",
        options: [
            { t: "La password cifrata (hash), oppure `!` o `*`", ok: true, why: "Gli altri campi riguardano le scadenze: data dell'ultimo cambio, giorni minimi e massimi, avviso." },
            { t: "La password scritta in chiaro, leggibile da root", ok: false, why: "Le password non si salvano mai in chiaro." },
            { t: "Lo UID dell'utente, come in `/etc/passwd`", ok: false, why: "Lo UID è in `/etc/passwd`." },
            { t: "La directory home", ok: false, why: "La home è in `/etc/passwd`." }
        ]
    },
    {
        id: "5.2-09", type: "single", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti",
        text: "Chi può creare nuovi utenti con `useradd`?",
        options: [
            { t: "Solo root, o un utente autorizzato che usa `sudo`", ok: true, why: "Creare utenti modifica `/etc/passwd`, `/etc/shadow` e `/etc/group`, che solo root può scrivere." },
            { t: "Qualsiasi utente", ok: false, why: "Un utente normale riceve un errore di permessi." },
            { t: "Solo gli utenti del gruppo `users`", ok: false, why: "Il gruppo `users` non dà permessi di amministrazione." },
            { t: "Nessuno: gli utenti si creano solo durante l'installazione", ok: false, why: "Si possono creare in qualsiasi momento." }
        ]
    },
    {
        id: "5.2-10", type: "single", ref: "5.2_01#Aggiungere ed Eliminare Gruppi",
        text: "Quale comando aggiunge l'utente `anna` al gruppo `sviluppo`, senza toglierla dagli altri gruppi?",
        options: [
            { t: "`usermod -aG sviluppo anna`", ok: true, why: "`-G` indica i gruppi aggiuntivi, `-a` (append) li aggiunge a quelli che ha già." },
            { t: "`usermod -G sviluppo anna`", ok: false, why: "Senza `-a` la lista dei gruppi aggiuntivi viene sostituita: anna uscirebbe dagli altri." },
            { t: "`groupadd anna sviluppo`", ok: false, why: "`groupadd` crea un gruppo nuovo." },
            { t: "`useradd -m sviluppo anna`", ok: false, why: "`useradd` crea utenti nuovi; anna esiste già." }
        ]
    },
    {
        id: "5.2-11", type: "single", ref: "5.2_01#Il File /etc/passwd",
        text: "Su molte distribuzioni, quale UID riceve il primo utente normale creato?",
        options: [
            { t: "1000", ok: true, why: "Gli UID sotto 1000 sono di solito riservati agli account di sistema (il valore è in `/etc/login.defs`)." },
            { t: "0", ok: false, why: "0 è root." },
            { t: "1001", ok: false, why: "1001 tocca di solito al secondo utente: il primo prende 1000." },
            { t: "100", ok: false, why: "È ancora nell'intervallo degli account di sistema." }
        ]
    },
    {
        id: "5.2-12", type: "single", ref: "5.2_01#Aggiungere ed Eliminare Gruppi",
        text: "Che cosa fa `groupdel sviluppo`, eseguito da root?",
        options: [
            { t: "Elimina il gruppo `sviluppo`", ok: true, why: "Gli utenti restano; perdono solo l'appartenenza a quel gruppo. Non si può eliminare un gruppo che è il gruppo principale di un utente." },
            { t: "Toglie gli utenti dal gruppo ma lascia il gruppo", ok: false, why: "`groupdel` elimina proprio il gruppo." },
            { t: "Elimina il gruppo e anche tutti i suoi utenti", ok: false, why: "Gli account degli utenti non vengono toccati: si eliminano con `userdel`." },
            { t: "Cancella tutti i file del gruppo `sviluppo`", ok: false, why: "I file restano; al posto del nome del gruppo `ls -l` mostrerà il suo numero." }
        ]
    },
    {
        id: "5.2-13", type: "single", ref: "5.2_01#Il File /etc/shadow",
        text: "In `/etc/shadow`, il campo della password di un account inizia con `!`. Che cosa vuol dire?",
        options: [
            { t: "L'account è bloccato: con la password non si entra", ok: true, why: "`passwd -l` aggiunge `!` davanti alla password cifrata, `passwd -u` lo toglie: la password resta, ma non funziona finché c'è il punto esclamativo." },
            { t: "La password è vuota: si entra senza scriverla", ok: false, why: "Una password vuota è un campo vuoto, non `!`." },
            { t: "La password va cambiata entro oggi", ok: false, why: "Le scadenze sono negli altri campi della riga, non nel simbolo davanti alla password." },
            { t: "L'utente ha i permessi di root", ok: false, why: "I permessi di root dipendono dallo UID 0 (o da `sudo`), non da `/etc/shadow`." }
        ]
    },
    {
        id: "5.2-14", type: "multiple", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti",
        text: "Su Debian o Ubuntu, quali file cambia di solito `useradd -m luca`?",
        options: [
            { t: "`/etc/passwd`", ok: true, why: "Ci aggiunge la riga dell'account `luca`." },
            { t: "`/etc/shadow`", ok: true, why: "Ci aggiunge la riga con la password, per ora bloccata." },
            { t: "`/etc/group`", ok: true, why: "Di solito crea anche il gruppo personale `luca`, con lo stesso nome dell'utente." },
            { t: "`/etc/hosts`", ok: false, why: "`/etc/hosts` riguarda la rete, non gli utenti." },
            { t: "`/etc/sudoers`", ok: false, why: "`useradd` non dà permessi di `sudo`: per quelli si modifica `/etc/sudoers` o si aggiunge l'utente al gruppo giusto." }
        ]
    },
    {
        id: "5.2-15", type: "fill", ref: "5.2_01#Il Comando passwd", placeholder: "comando",
        text: "Scrivi il comando (da root) che imposta o cambia la password dell'utente `luca`.",
        answers: ["passwd luca"],
        pattern: "^(sudo )?passwd luca$",
        alsoAccepted: ["sudo passwd luca"],
        why: "Root può cambiare la password di qualsiasi utente con `passwd nome`, senza conoscere quella vecchia. Scritto da solo, `passwd` cambia la tua."
    },

    // ---- 5.3 Gestione delle Autorizzazioni e delle Proprietà dei File ----
    {
        id: "5.3-01", type: "single", ref: "5.3_01#Modalità Numerica",
        text: "`ls -l` mostra `-rw-r--r--`. Quali sono i permessi in forma numerica?",
        options: [
            { t: "644", ok: true, why: "rw- = 4+2 = 6 per il proprietario, r-- = 4 per il gruppo e r-- = 4 per gli altri." },
            { t: "755", ok: false, why: "755 è `rwxr-xr-x`." },
            { t: "600", ok: false, why: "600 è `rw-------`." },
            { t: "466", ok: false, why: "L'ordine è proprietario, gruppo, altri: il proprietario ha rw (6)." }
        ]
    },
    {
        id: "5.3-02", type: "fill", ref: "5.3_01#Modalità Numerica", placeholder: "numero",
        text: "Scrivi in forma numerica (tre cifre) i permessi `rwxr-x---`.",
        answers: ["750", "0750"],
        why: "r = 4, w = 2, x = 1. Proprietario rwx = 7, gruppo r-x = 5, altri --- = 0."
    },
    {
        id: "5.3-03", type: "single", ref: "5.3_01#Modalità Simbolica",
        text: "Che cosa fa `chmod u+x script.sh`?",
        options: [
            { t: "Aggiunge l'esecuzione per il proprietario del file", ok: true, why: "`u` è il proprietario (user), `+` aggiunge, `x` è l'esecuzione. Gli altri permessi restano come sono." },
            { t: "Aggiunge il permesso di esecuzione per tutti gli utenti", ok: false, why: "Per tutti si scrive `a+x` (o solo `+x`)." },
            { t: "Rende `x` il nuovo proprietario del file", ok: false, why: "Il proprietario si cambia con `chown`." },
            { t: "Toglie tutti i permessi tranne quello di esecuzione", ok: false, why: "`+` aggiunge e non toglie niente; `=` invece imposta esattamente." }
        ]
    },
    {
        id: "5.3-04", type: "single", ref: "5.3_01#Modalità Numerica",
        text: "Dopo `chmod 755 script.sh`, che cosa mostra `ls -l` per i permessi?",
        options: [
            { t: "`-rwxr-xr-x`", ok: true, why: "Il 7 diventa rwx (proprietario); i due 5 diventano r-x (gruppo, poi tutti gli altri)." },
            { t: "`-rwxrwxrwx`", ok: false, why: "Sarebbe 777." },
            { t: "`-rw-r--r--`", ok: false, why: "Sarebbe 644." },
            { t: "`-rwx------`", ok: false, why: "Sarebbe 700." }
        ]
    },
    {
        id: "5.3-05", type: "single", ref: "5.3_01#Comprendere i Tipi di File",
        text: "Nell'elenco di `ls -l`, che cosa indica la lettera `d` all'inizio della riga, come in `drwxr-xr-x`?",
        options: [
            { t: "Che è una directory", ok: true, why: "Il primo carattere è il tipo: `-` file normale, `d` directory, `l` link simbolico." },
            { t: "Che il file è stato cancellato", ok: false, why: "I file cancellati non compaiono in `ls`." },
            { t: "Che è un file di dispositivo", ok: false, why: "I dispositivi hanno `b` (a blocchi) o `c` (a caratteri)." },
            { t: "Che il file è scaricato da Internet", ok: false, why: "Il primo carattere indica solo il tipo di file." }
        ]
    },
    {
        id: "5.3-06", type: "single", ref: "5.3_01#Permessi sulle Directory",
        text: "Che cosa permette il permesso `x` su una directory?",
        options: [
            { t: "Di entrarci con `cd` e raggiungerne i file", ok: true, why: "Per elencare il contenuto serve invece `r`, per creare o cancellare file dentro serve `w` (insieme a `x`)." },
            { t: "Di eseguire come programmi tutti i file che contiene", ok: false, why: "Per eseguire un programma serve la `x` sul file stesso." },
            { t: "Di cancellare la directory e tutto il suo contenuto", ok: false, why: "Per cancellarla servono i permessi sulla directory che la contiene." },
            { t: "Niente: le directory non usano il permesso `x`", ok: false, why: "Per le directory la `x` è importante: senza non ci si entra." }
        ]
    },
    {
        id: "5.3-07", type: "fill", ref: "5.3_01#Modificare la Proprietà dei File", placeholder: "comando",
        text: "Scrivi il comando (da root) che rende `luca` il proprietario del file `relazione.txt`.",
        answers: ["chown luca relazione.txt", "sudo chown luca relazione.txt"],
        pattern: "^(sudo )?chown luca (\\./)?relazione\\.txt$",
        alsoAccepted: ["chown luca ./relazione.txt"],
        notAccepted: ["chmod luca relazione.txt", "chown relazione.txt luca", "chown luca: relazione.txt"],
        why: "`chown` cambia il proprietario; con `chown luca:sviluppo` cambia anche il gruppo."
    },
    {
        id: "5.3-08", type: "single", ref: "5.3_01#Modificare la Proprietà dei File",
        text: "Che cosa fa `chown anna:sviluppo progetto.txt`?",
        options: [
            { t: "Rende anna proprietaria e `sviluppo` gruppo del file", ok: true, why: "Prima dei due punti il proprietario, dopo il gruppo." },
            { t: "Aggiunge anna al gruppo `sviluppo`, come `usermod -aG`", ok: false, why: "I gruppi di un utente si cambiano con `usermod`; `chown` lavora sui file." },
            { t: "Copia il file `progetto.txt` nella home di anna", ok: false, why: "`chown` non copia file." },
            { t: "Dà errore: con `chown` si cambia solo il proprietario", ok: false, why: "`chown` cambia anche il gruppo; esiste anche `chgrp` solo per il gruppo." }
        ]
    },
    {
        id: "5.3-09", type: "multiple", ref: "5.3_01#Comprendere i Permessi",
        text: "`ls -l` mostra `-rwxr-x--- 1 anna sviluppo 512 mar 3 10:00 lavoro.sh`. Quali affermazioni sono vere?",
        options: [
            { t: "anna può leggerlo, modificarlo ed eseguirlo", ok: true, why: "Il primo gruppo di tre, `rwx`, è del proprietario: anna." },
            { t: "Chi fa parte del gruppo `sviluppo` può leggerlo ed eseguirlo", ok: true, why: "Il secondo gruppo, `r-x`, è del gruppo `sviluppo`." },
            { t: "Gli altri utenti possono leggerlo", ok: false, why: "Il terzo gruppo, `---`, non dà nessun permesso agli altri." },
            { t: "Chi fa parte del gruppo `sviluppo` può modificarlo", ok: false, why: "Al gruppo manca la `w`." },
            { t: "Il proprietario è `sviluppo`", ok: false, why: "Il proprietario è anna; `sviluppo` è il gruppo." }
        ]
    },
    {
        id: "5.3-10", type: "single", ref: "5.3_01#Modalità Simbolica",
        text: "Quale comando toglie agli «altri» (né proprietario né gruppo) il permesso di scrivere su `diario.txt`?",
        options: [
            { t: "`chmod o-w diario.txt`", ok: true, why: "`o` sono gli altri (others), `-` toglie, `w` è la scrittura." },
            { t: "`chmod a-w diario.txt`", ok: false, why: "`a` vuol dire tutti: lo toglierebbe anche al proprietario." },
            { t: "`chmod u-w diario.txt`", ok: false, why: "`u` è il proprietario." },
            { t: "`chown o-w diario.txt`", ok: false, why: "I permessi si cambiano con `chmod`." }
        ]
    },
    {
        id: "5.3-11", type: "single", ref: "5.3_01#Modificare i Permessi dei File",
        text: "Che cosa fa `chmod -R g+w progetto`?",
        options: [
            { t: "Dà al gruppo la scrittura su `progetto` e su tutto il contenuto", ok: true, why: "`-R` applica la modifica in modo ricorsivo, a file e sottodirectory." },
            { t: "Toglie al gruppo il permesso di scrittura su tutti i file", ok: false, why: "`+` aggiunge; per togliere si usa `-`." },
            { t: "Cambia il gruppo della directory, che diventa il gruppo `w`", ok: false, why: "Il gruppo si cambia con `chown` o `chgrp`." },
            { t: "Cambia solo la directory, non i file che contiene", ok: false, why: "Senza `-R` sarebbe così." }
        ]
    },
    {
        id: "5.3-12", type: "single", ref: "5.3_01#Modalità Numerica",
        text: "Quali permessi dà `chmod 640 dati.txt`?",
        options: [
            { t: "`rw-r-----`", ok: true, why: "6 = 4 + 2 = `rw-` al proprietario, 4 = `r--` al gruppo, 0 = `---` agli altri." },
            { t: "`rw-r--r--`", ok: false, why: "Questi sono 644: anche gli altri potrebbero leggere." },
            { t: "`rwxr-----`", ok: false, why: "Questi sono 740: il 7 darebbe anche l'esecuzione al proprietario." },
            { t: "`r--rw----`", ok: false, why: "Questi sono 460: le cifre sono in ordine proprietario, gruppo, altri." }
        ]
    },
    {
        id: "5.3-13", type: "single", ref: "5.3_01#Modalità Simbolica",
        text: "Che cosa fa `chmod go-r segreto.txt`?",
        options: [
            { t: "Toglie la lettura al gruppo e agli altri", ok: true, why: "`g` è il gruppo, `o` gli altri (others), `-r` toglie la lettura; il proprietario non cambia." },
            { t: "Dà la lettura al gruppo e agli altri", ok: false, why: "Per dare si usa `+`; `-` toglie." },
            { t: "Toglie la lettura solo al proprietario", ok: false, why: "Il proprietario è `u` (user); `o` sono gli altri, non il proprietario (owner)." },
            { t: "Toglie tutti i permessi al gruppo", ok: false, why: "Toglie solo `r`, e non solo al gruppo: anche agli altri." }
        ]
    },
    {
        id: "5.3-14", type: "fill", ref: "5.3_01#Modificare la Proprietà dei File", placeholder: "comando",
        text: "Scrivi il comando che cambia il gruppo del file `piano.txt` in `sviluppo`, senza cambiare il proprietario.",
        answers: ["chgrp sviluppo piano.txt", "chown :sviluppo piano.txt"],
        pattern: "^(sudo )?(chgrp sviluppo|chown :sviluppo) piano\\.txt$",
        alsoAccepted: ["sudo chgrp sviluppo piano.txt"],
        notAccepted: ["chown sviluppo piano.txt", "chgrp piano.txt sviluppo"],
        why: "`chgrp gruppo file` cambia solo il gruppo; lo stesso fa `chown :gruppo file`, con i due punti davanti. Il proprietario può farlo solo verso un gruppo di cui fa parte."
    },
    {
        id: "5.3-15", type: "multiple", ref: "5.3_01#Permessi sui File",
        text: "Il file `piano.txt` ha i permessi `-rw-rw-r--`, proprietaria anna e gruppo `sviluppo`. Luca fa parte di `sviluppo`. Che cosa può fare luca?",
        options: [
            { t: "Leggere il file", ok: true, why: "Per luca contano i permessi del gruppo, `rw-`: c'è la `r`." },
            { t: "Modificare il file", ok: true, why: "Il gruppo ha anche la `w`." },
            { t: "Eseguire il file come programma", ok: false, why: "Nessuno ha la `x`." },
            { t: "Cambiarne i permessi con `chmod`", ok: false, why: "Solo la proprietaria (o root) può cambiare i permessi, anche se gli altri possono scrivere nel file." }
        ]
    },

    // ---- 5.4 Directory e File Speciali ----
    {
        id: "5.4-01", type: "single", ref: "5.4_01#Permessi sui File Temporanei",
        text: "Che effetto ha lo sticky bit sulla directory `/tmp`?",
        options: [
            { t: "Tutti creano file, ma ognuno cancella o rinomina solo i propri", ok: true, why: "Senza sticky bit, in una directory scrivibile da tutti chiunque potrebbe cancellare i file degli altri." },
            { t: "I file restano nella directory per sempre", ok: false, why: "Il nome inganna: lo sticky bit non impedisce la cancellazione da parte del proprietario." },
            { t: "Solo root può scrivere nella directory, gli altri la leggono", ok: false, why: "In `/tmp` scrivono tutti gli utenti." },
            { t: "I file si cancellano da soli dopo un giorno dalla creazione", ok: false, why: "La pulizia di `/tmp` dipende da altre impostazioni del sistema." }
        ]
    },
    {
        id: "5.4-02", type: "single", ref: "5.4_01#Permessi sui File Temporanei",
        text: "`ls -ld /tmp` mostra `drwxrwxrwt`. Che cosa indica la `t` finale?",
        options: [
            { t: "Lo sticky bit", ok: true, why: "Prende il posto della `x` degli altri: `t` vuol dire sticky bit più esecuzione per gli altri." },
            { t: "Che la directory è temporanea e verrà cancellata", ok: false, why: "La `t` riguarda chi può cancellare i file dentro la directory." },
            { t: "Che la directory è di testo", ok: false, why: "Non esistono directory «di testo»." },
            { t: "Un errore del file system", ok: false, why: "È normale per `/tmp`." }
        ]
    },
    {
        id: "5.4-03", type: "fill", ref: "5.4_01#Link Simbolici", placeholder: "comando",
        text: "Scrivi il comando che crea il link simbolico `collegamento` che punta a `/etc/hosts`.",
        answers: ["ln -s /etc/hosts collegamento", "ln --symbolic /etc/hosts collegamento"],
        pattern: "^ln (-s|--symbolic) /etc/hosts (\\./)?collegamento$",
        alsoAccepted: ["ln -s /etc/hosts ./collegamento"],
        notAccepted: ["ln /etc/hosts collegamento", "ln -s collegamento /etc/hosts"],
        why: "L'ordine è come in `cp`: prima la destinazione esistente, poi il nome del nuovo link. Senza `-s` si crea un hard link."
    },
    {
        id: "5.4-04", type: "single", ref: "5.4_01#Posizione dei File Temporanei",
        text: "Che cosa fa l'opzione `-d` in `ls -ld /tmp`?",
        options: [
            { t: "Mostra la directory stessa invece del suo contenuto", ok: true, why: "Senza `-d`, `ls -l /tmp` mostrerebbe i file dentro `/tmp`." },
            { t: "Elenca solo le directory che si trovano dentro `/tmp`", ok: false, why: "`-d` riguarda la directory indicata, non filtra il contenuto." },
            { t: "Cancella la directory dopo averla mostrata", ok: false, why: "`ls` non cancella mai niente." },
            { t: "Mostra la data di creazione invece di quella di modifica", ok: false, why: "Le date si vedono con `-l`; `-d` non le cambia." }
        ]
    },
    {
        id: "5.4-05", type: "single", ref: "5.4_01#Link Simbolici",
        text: "Che cosa succede a un link simbolico se cancelli il file a cui punta?",
        options: [
            { t: "Il link resta, ma è «rotto»: punta a un file che non c'è", ok: true, why: "Il link simbolico contiene solo il percorso del file; aprendolo si riceve «No such file or directory»." },
            { t: "Il link viene cancellato insieme al file, in automatico", ok: false, why: "Il sistema non cancella i link da solo." },
            { t: "Il link diventa una copia completa del file cancellato", ok: false, why: "Il link non ha mai contenuto i dati del file." },
            { t: "Il file torna indietro, recuperato dal link simbolico", ok: false, why: "Il file cancellato non si recupera tramite il link." }
        ]
    },
    {
        id: "5.4-06", type: "single", ref: "5.4_01#Lavorare con gli Hard Link",
        text: "Che cos'è un hard link?",
        options: [
            { t: "Un altro nome per gli stessi dati (lo stesso inode)", ok: true, why: "Cancellando il nome originale, i dati si leggono ancora dall'hard link." },
            { t: "Una copia completa del file, con dati indipendenti", ok: false, why: "Non occupa spazio in più: è lo stesso file con due nomi." },
            { t: "Un collegamento che contiene il percorso del file", ok: false, why: "Questo è un link simbolico." },
            { t: "Un link a un sito web salvato sul desktop", ok: false, why: "Riguarda solo i file sul disco." }
        ]
    },
    {
        id: "5.4-07", type: "multiple", ref: "5.4_01#Posizione dei File Temporanei",
        text: "Quali affermazioni su `/tmp` e `/var/tmp` sono vere?",
        options: [
            { t: "Il contenuto di `/tmp` può essere cancellato a ogni riavvio", ok: true, why: "Su molti sistemi `/tmp` è in memoria (tmpfs) o viene svuotata all'avvio." },
            { t: "`/var/tmp` è pensata per i file temporanei che devono sopravvivere a un riavvio", ok: true, why: "Anche lì i file vecchi possono essere eliminati, ma più di rado." },
            { t: "In `/var/tmp` può scrivere solo root", ok: false, why: "Come `/tmp`, è scrivibile da tutti, con lo sticky bit." },
            { t: "Gli utenti normali non possono scrivere in `/tmp`", ok: false, why: "Possono: è proprio il suo scopo." }
        ]
    },
    {
        id: "5.4-08", type: "single", ref: "5.4_01#Comprendere i Link",
        text: "Che cosa può fare un link simbolico che un hard link non può fare?",
        options: [
            { t: "Puntare a una directory o a un file su un altro file system", ok: true, why: "Gli hard link funzionano solo tra file dello stesso file system e non per le directory." },
            { t: "Continuare a funzionare anche se cancelli il file originale", ok: false, why: "È il contrario: lo fa l'hard link, mentre il simbolico si rompe." },
            { t: "Occupare meno spazio di zero byte sul disco", ok: false, why: "Nessun file occupa meno di zero." },
            { t: "Cambiare i permessi del file originale a cui punta", ok: false, why: "Nessun link cambia i permessi del file." }
        ]
    },
    {
        id: "5.4-09", type: "single", ref: "5.4_01#Permessi sui File Temporanei",
        text: "Quale comando imposta su `condivisa` i permessi di `/tmp`, cioè `rwxrwxrwt`?",
        options: [
            { t: "`chmod 1777 condivisa`", ok: true, why: "La prima cifra 1 è lo sticky bit; 777 sono lettura, scrittura ed esecuzione per tutti." },
            { t: "`chmod 777 condivisa`", ok: false, why: "Dà tutti i permessi ma senza sticky bit: chiunque potrebbe cancellare i file degli altri." },
            { t: "`chmod 7777 condivisa`", ok: false, why: "La prima cifra 7 accenderebbe anche setuid e setgid." },
            { t: "`chmod t+777 condivisa`", ok: false, why: "Non è una sintassi valida." }
        ]
    },
    {
        id: "5.4-10", type: "single", ref: "5.4_01#Link Simbolici",
        text: "Come si riconosce un link simbolico nell'elenco di `ls -l`?",
        options: [
            { t: "Inizia con `l` e mostra `nome -> destinazione`", ok: true, why: "Per esempio `lrwxrwxrwx ... collegamento -> /etc/hosts`." },
            { t: "Il nome del link è scritto in corsivo nel terminale", ok: false, why: "Il terminale può usare colori, ma l'indicazione sicura è la `l` iniziale." },
            { t: "La dimensione del link è sempre 0 byte", ok: false, why: "La dimensione è la lunghezza del percorso a cui punta." },
            { t: "Non si può riconoscere: sembra un file normale", ok: false, why: "Si riconosce dalla `l` e dalla freccia." }
        ]
    },
    {
        id: "5.4-11", type: "single", ref: "5.4_01#Creare Hard Link",
        text: "Che cosa fa `ln dati.txt copia.txt`, senza opzioni?",
        options: [
            { t: "Crea un hard link: due nomi per gli stessi dati", ok: true, why: "Senza `-s`, `ln` crea un hard link: `copia.txt` e `dati.txt` hanno lo stesso inode, e modificarne uno vuol dire modificare anche l'altro." },
            { t: "Crea il link simbolico `copia.txt`", ok: false, why: "Per un link simbolico serve `-s`: `ln -s dati.txt copia.txt`." },
            { t: "Copia il contenuto in un nuovo file indipendente", ok: false, why: "Quello lo fa `cp`: i dati verrebbero duplicati." },
            { t: "Rinomina `dati.txt` in `copia.txt`", ok: false, why: "Per rinominare si usa `mv`; con `ln` il nome vecchio resta." }
        ]
    },
    {
        id: "5.4-12", type: "single", ref: "5.4_01#Gestire i Link Simbolici",
        text: "`ls -l` mostra `lrwxrwxrwx 1 anna anna 10 mar 3 10:00 rete -> /etc/hosts`. Chi può modificare `/etc/hosts` passando dal link?",
        options: [
            { t: "Solo chi ha già il permesso di scrivere su `/etc/hosts`", ok: true, why: "I permessi `rwxrwxrwx` di un link simbolico non contano: valgono quelli del file a cui punta." },
            { t: "Tutti, perché il link ha i permessi `rwxrwxrwx`", ok: false, why: "I link simbolici mostrano sempre `rwxrwxrwx`, ma questi permessi non vengono usati." },
            { t: "Solo anna, la proprietaria del link", ok: false, why: "Essere proprietari del link non dà permessi sul file a cui punta." },
            { t: "Nessuno: un link simbolico è sempre di sola lettura", ok: false, why: "Attraverso il link si può scrivere, se il file di destinazione lo permette." }
        ]
    },
    {
        id: "5.4-13", type: "single", ref: "5.4_01#Gestire gli Hard Link",
        text: "Per un file normale, che cosa indica il numero subito dopo i permessi nell'elenco di `ls -l`?",
        options: [
            { t: "Quanti hard link ha, cioè quanti nomi", ok: true, why: "Un file appena creato ha 1; ogni `ln` senza `-s` lo aumenta di uno, ogni `rm` di uno dei nomi lo diminuisce." },
            { t: "Quanti blocchi occupa sul disco", ok: false, why: "I blocchi si vedono con `ls -s` o `du`, non in quella colonna." },
            { t: "Quante volte è stato aperto", ok: false, why: "Linux non conta le aperture dei file." },
            { t: "Il suo numero di inode", ok: false, why: "L'inode si vede con `ls -i`." }
        ]
    },
    {
        id: "5.4-14", type: "fill", ref: "5.4_01#Gestire gli Hard Link", placeholder: "opzione",
        text: "Quale opzione di `ls` mostra il numero di inode di ogni file?",
        answers: ["-i", "--inode"],
        pattern: "^(ls )?(-i|--inode|-li|-il)$",
        alsoAccepted: ["ls -i", "ls -li"],
        why: "`ls -i` scrive il numero di inode davanti a ogni nome: due hard link dello stesso file hanno lo stesso numero."
    },
    {
        id: "5.4-15", type: "multiple", ref: "5.4_01#Lavorare con gli Hard Link",
        text: "Quali affermazioni sugli hard link sono vere?",
        options: [
            { t: "Non si possono creare tra due file system diversi", ok: true, why: "Un hard link punta a un inode, e ogni file system ha i suoi inode." },
            { t: "Di solito non si possono creare per le directory", ok: true, why: "Il sistema lo vieta per non creare giri senza uscita nell'albero delle directory." },
            { t: "Se cancelli il nome originale, l'hard link non funziona più", ok: false, why: "I dati restano finché c'è almeno un nome: tutti gli hard link valgono allo stesso modo." },
            { t: "Ognuno occupa tanto spazio quanto il file", ok: false, why: "I dati sono uno solo: un hard link aggiunge solo un nome." }
        ]
    }
]);
