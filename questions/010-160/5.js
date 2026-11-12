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
            { t: "Lo UID, il gruppo principale (GID) e tutti i gruppi dell'utente", ok: true, why: "Per esempio `uid=1000(anna) gid=1000(anna) groups=1000(anna),27(sudo)`. Con un nome (`id luca`) mostra quelli di un altro utente." },
            { t: "Il numero del processo corrente", ok: false, why: "Il numero di un processo (PID) si vede con `ps`." },
            { t: "La carta d'identità dell'utente salvata nel sistema", ok: false, why: "Il sistema conosce solo numeri e gruppi, non documenti." },
            { t: "Gli utenti collegati", ok: false, why: "Gli utenti collegati si vedono con `who` o `w`." }
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
            { t: "Lo storico degli accessi: chi si è collegato, quando e per quanto tempo, e i riavvii", ok: true, why: "Legge il file `/var/log/wtmp`; i più recenti sono in cima." },
            { t: "L'ultimo comando eseguito", ok: false, why: "I comandi eseguiti si vedono con `history`." },
            { t: "L'ultimo file modificato", ok: false, why: "Per i file modificati si usano `ls -t` o `find`." },
            { t: "L'ultima riga di un file", ok: false, why: "Lo fa `tail -n 1`." }
        ]
    },
    {
        id: "5.1-05", type: "single", ref: "5.1_01#Cambiare Utente e Aumentare i Privilegi",
        text: "Che differenza c'è tra `sudo comando` e `su`?",
        options: [
            { t: "`sudo` esegue un comando come root chiedendo la tua password (se sei autorizzato); `su` apre una shell come un altro utente chiedendo la sua password", ok: true, why: "Con `sudo` non serve conoscere la password di root, e ogni uso viene registrato." },
            { t: "Sono identici", ok: false, why: "Chiedono password diverse e funzionano in modo diverso." },
            { t: "`su` funziona solo per un comando, `sudo` apre una shell", ok: false, why: "Di solito è il contrario." },
            { t: "`sudo` serve solo a cambiare la propria password", ok: false, why: "La password si cambia con `passwd`." }
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
            { t: "Account usati dai servizi, non da persone: hanno UID bassi e di solito non possono fare login", ok: true, why: "Ogni servizio con il suo account ha solo i permessi che gli servono: se viene attaccato, i danni sono limitati." },
            { t: "Gli account degli amministratori", ok: false, why: "L'amministratore è root; gli account di sistema hanno pochi privilegi." },
            { t: "Account creati per errore, da cancellare", ok: false, why: "Servono al funzionamento dei servizi: non vanno cancellati." },
            { t: "Gli account degli utenti ospiti", ok: false, why: "Sono per i servizi, non per persone." }
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
            { t: "Che non si può usare per entrare nel sistema con una shell: è tipico degli account di sistema", ok: true, why: "Se qualcuno prova ad accedere, `nologin` mostra un messaggio e chiude." },
            { t: "Che l'utente non ha password", ok: false, why: "La password è un'altra cosa, in `/etc/shadow`." },
            { t: "Che l'utente può accedere senza password", ok: false, why: "È il contrario: non può proprio aprire una shell." },
            { t: "Che l'utente è root", ok: false, why: "root si riconosce dallo UID 0." }
        ]
    },
    {
        id: "5.1-11", type: "single", ref: "5.1_01#Ottenere Informazioni Sugli Utenti",
        text: "Che cosa aggiunge `w` rispetto a `who`?",
        options: [
            { t: "Per ogni utente collegato mostra anche che cosa sta eseguendo, più l'ora, da quanto il sistema è acceso e il carico", ok: true, why: "La prima riga di `w` è simile al risultato di `uptime`." },
            { t: "Mostra anche gli utenti scollegati da un mese", ok: false, why: "Lo storico degli accessi lo mostra `last`." },
            { t: "Mostra le password", ok: false, why: "Nessun comando mostra le password." },
            { t: "Niente: è solo un nome più breve di `who`", ok: false, why: "Mostra più informazioni." }
        ]
    },

    // ---- 5.2 Creazione di Utenti e Gruppi ----
    {
        id: "5.2-01", type: "fill", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti", placeholder: "comando",
        text: "Scrivi il comando (da eseguire come root) che crea l'utente `luca` con la sua directory home.",
        answers: ["useradd -m luca", "sudo useradd -m luca", "useradd --create-home luca", "sudo useradd --create-home luca"],
        why: "`-m` crea la home e ci copia i file di `/etc/skel`. Poi si imposta la password con `passwd luca`."
    },
    {
        id: "5.2-02", type: "single", ref: "5.2_01#La Directory Scheletro",
        text: "A che cosa serve la directory `/etc/skel`?",
        options: [
            { t: "Contiene i file che vengono copiati nella home di ogni nuovo utente, per esempio `.bashrc`", ok: true, why: "Mettendo un file in `/etc/skel` lo avranno tutti gli utenti creati da quel momento in poi." },
            { t: "Contiene le password degli utenti", ok: false, why: "Le password sono in `/etc/shadow`." },
            { t: "È il cestino degli utenti eliminati", ok: false, why: "Linux non ha un cestino per gli utenti." },
            { t: "Contiene i programmi di base del sistema", ok: false, why: "I programmi stanno in `/bin` e `/usr/bin`." }
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
            { t: "Cambia la password di quell'utente, chiedendo prima quella attuale", ok: true, why: "Solo root può cambiare la password di un altro utente, con `passwd nome`." },
            { t: "Mostra la password dell'utente", ok: false, why: "Le password non si possono leggere: sono conservate solo come hash." },
            { t: "Mostra il file `/etc/passwd`", ok: false, why: "Per leggere il file si usa per esempio `cat /etc/passwd`." },
            { t: "Crea un nuovo utente", ok: false, why: "Gli utenti si creano con `useradd`." }
        ]
    },
    {
        id: "5.2-05", type: "single", ref: "5.2_01#Aggiungere ed Eliminare Account Utenti",
        text: "Che cosa fa `userdel -r luca`?",
        options: [
            { t: "Elimina l'utente `luca` insieme alla sua directory home", ok: true, why: "Senza `-r` l'utente viene tolto ma la sua home resta sul disco." },
            { t: "Elimina solo la home di `luca`, lasciando l'utente", ok: false, why: "L'utente viene eliminato in ogni caso; `-r` toglie anche la home." },
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
            { t: "L'hash della password dell'utente (oppure `!` o `*` se non si può accedere con una password)", ok: true, why: "Gli altri campi riguardano le scadenze: data dell'ultimo cambio, giorni minimi e massimi, avviso." },
            { t: "La password scritta in chiaro", ok: false, why: "Le password non si salvano mai in chiaro." },
            { t: "Lo UID dell'utente", ok: false, why: "Lo UID è in `/etc/passwd`." },
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
            { t: "1", ok: false, why: "Gli UID bassi sono per gli account di sistema." },
            { t: "100", ok: false, why: "È ancora nell'intervallo degli account di sistema." }
        ]
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
            { t: "Aggiunge il permesso di esecuzione per il proprietario del file", ok: true, why: "`u` è il proprietario (user), `+` aggiunge, `x` è l'esecuzione. Gli altri permessi restano come sono." },
            { t: "Aggiunge il permesso di esecuzione per tutti", ok: false, why: "Per tutti si scrive `a+x` (o solo `+x`)." },
            { t: "Rende `x` il proprietario del file", ok: false, why: "Il proprietario si cambia con `chown`." },
            { t: "Toglie tutti i permessi tranne l'esecuzione", ok: false, why: "`+` aggiunge e non toglie niente; `=` invece imposta esattamente." }
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
            { t: "Di entrarci (con `cd`) e di raggiungere i file che contiene", ok: true, why: "Per elencare il contenuto serve invece `r`, per creare o cancellare file dentro serve `w` (insieme a `x`)." },
            { t: "Di eseguire tutti i programmi che contiene", ok: false, why: "Per eseguire un programma serve la `x` sul file stesso." },
            { t: "Di cancellare la directory", ok: false, why: "Per cancellarla servono i permessi sulla directory che la contiene." },
            { t: "Niente: le directory non usano la `x`", ok: false, why: "Per le directory la `x` è importante: senza non ci si entra." }
        ]
    },
    {
        id: "5.3-07", type: "fill", ref: "5.3_01#Modificare la Proprietà dei File", placeholder: "comando",
        text: "Scrivi il comando (da root) che rende `luca` il proprietario del file `relazione.txt`.",
        answers: ["chown luca relazione.txt", "sudo chown luca relazione.txt"],
        why: "`chown` cambia il proprietario; con `chown luca:sviluppo` cambia anche il gruppo."
    },
    {
        id: "5.3-08", type: "single", ref: "5.3_01#Modificare la Proprietà dei File",
        text: "Che cosa fa `chown anna:sviluppo progetto.txt`?",
        options: [
            { t: "Rende anna la proprietaria del file e `sviluppo` il suo gruppo", ok: true, why: "Prima dei due punti il proprietario, dopo il gruppo." },
            { t: "Aggiunge anna al gruppo `sviluppo`", ok: false, why: "I gruppi di un utente si cambiano con `usermod`; `chown` lavora sui file." },
            { t: "Copia il file nella home di anna", ok: false, why: "`chown` non copia file." },
            { t: "Dà errore: si può cambiare solo il proprietario", ok: false, why: "`chown` cambia anche il gruppo; esiste anche `chgrp` solo per il gruppo." }
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
            { t: "Dà al gruppo il permesso di scrittura sulla directory `progetto` e su tutto quello che contiene", ok: true, why: "`-R` applica la modifica in modo ricorsivo, a file e sottodirectory." },
            { t: "Toglie la scrittura al gruppo", ok: false, why: "`+` aggiunge; per togliere si usa `-`." },
            { t: "Cambia il gruppo della directory in `w`", ok: false, why: "Il gruppo si cambia con `chown` o `chgrp`." },
            { t: "Cambia i permessi solo della directory, non dei file dentro", ok: false, why: "Senza `-R` sarebbe così." }
        ]
    },

    // ---- 5.4 Directory e File Speciali ----
    {
        id: "5.4-01", type: "single", ref: "5.4_01#Permessi sui File Temporanei",
        text: "Che effetto ha lo sticky bit sulla directory `/tmp`?",
        options: [
            { t: "Tutti possono creare file, ma ognuno può cancellare o rinominare solo i propri", ok: true, why: "Senza sticky bit, in una directory scrivibile da tutti chiunque potrebbe cancellare i file degli altri." },
            { t: "I file restano nella directory per sempre", ok: false, why: "Il nome inganna: lo sticky bit non impedisce la cancellazione da parte del proprietario." },
            { t: "Solo root può scrivere nella directory", ok: false, why: "In `/tmp` scrivono tutti gli utenti." },
            { t: "I file si cancellano da soli dopo un giorno", ok: false, why: "La pulizia di `/tmp` dipende da altre impostazioni del sistema." }
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
        why: "L'ordine è come in `cp`: prima la destinazione esistente, poi il nome del nuovo link. Senza `-s` si crea un hard link."
    },
    {
        id: "5.4-04", type: "single", ref: "5.4_01#Posizione dei File Temporanei",
        text: "Che cosa fa l'opzione `-d` in `ls -ld /tmp`?",
        options: [
            { t: "Mostra le informazioni della directory stessa, invece di elencarne il contenuto", ok: true, why: "Senza `-d`, `ls -l /tmp` mostrerebbe i file dentro `/tmp`." },
            { t: "Elenca solo le directory dentro `/tmp`", ok: false, why: "`-d` riguarda la directory indicata, non filtra il contenuto." },
            { t: "Cancella la directory", ok: false, why: "`ls` non cancella mai niente." },
            { t: "Mostra la data di creazione", ok: false, why: "Le date si vedono con `-l`; `-d` non le cambia." }
        ]
    },
    {
        id: "5.4-05", type: "single", ref: "5.4_01#Link Simbolici",
        text: "Che cosa succede a un link simbolico se cancelli il file a cui punta?",
        options: [
            { t: "Il link resta, ma è «rotto»: punta a un percorso che non esiste più", ok: true, why: "Il link simbolico contiene solo il percorso del file; aprendolo si riceve «No such file or directory»." },
            { t: "Il link viene cancellato insieme al file", ok: false, why: "Il sistema non cancella i link da solo." },
            { t: "Il link diventa una copia del file", ok: false, why: "Il link non ha mai contenuto i dati del file." },
            { t: "Il file torna indietro", ok: false, why: "Il file cancellato non si recupera tramite il link." }
        ]
    },
    {
        id: "5.4-06", type: "single", ref: "5.4_01#Lavorare con gli Hard Link",
        text: "Che cos'è un hard link?",
        options: [
            { t: "Un altro nome per gli stessi dati sul disco (lo stesso inode): i dati restano finché esiste almeno un nome", ok: true, why: "Cancellando il nome originale, i dati si leggono ancora dall'hard link." },
            { t: "Una copia completa del file", ok: false, why: "Non occupa spazio in più: è lo stesso file con due nomi." },
            { t: "Un collegamento che contiene il percorso del file", ok: false, why: "Questo è un link simbolico." },
            { t: "Un link verso un sito web", ok: false, why: "Riguarda solo i file sul disco." }
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
            { t: "Puntare a una directory o a un file su un altro file system (un'altra partizione o un altro disco)", ok: true, why: "Gli hard link funzionano solo tra file dello stesso file system e non per le directory." },
            { t: "Continuare a funzionare se cancelli il file originale", ok: false, why: "È il contrario: lo fa l'hard link, mentre il simbolico si rompe." },
            { t: "Occupare meno spazio di zero", ok: false, why: "Nessun file occupa meno di zero." },
            { t: "Cambiare i permessi del file originale", ok: false, why: "Nessun link cambia i permessi del file." }
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
            { t: "La riga inizia con `l` e alla fine mostra `nome -> destinazione`", ok: true, why: "Per esempio `lrwxrwxrwx ... collegamento -> /etc/hosts`." },
            { t: "Il nome è scritto in corsivo", ok: false, why: "Il terminale può usare colori, ma l'indicazione sicura è la `l` iniziale." },
            { t: "La dimensione è sempre 0", ok: false, why: "La dimensione è la lunghezza del percorso a cui punta." },
            { t: "Non si può riconoscere", ok: false, why: "Si riconosce dalla `l` e dalla freccia." }
        ]
    }
]);
