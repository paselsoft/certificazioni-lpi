// Domande dell'argomento 4: Il Sistema Operativo Linux.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 4.1 Scelta di un Sistema Operativo ----
    {
        id: "4.1-01", type: "single", ref: "4.1_01#Cos’è un Sistema Operativo",
        text: "In un sistema operativo, che cosa fa il kernel?",
        options: [
            { t: "Gestisce l'hardware, la memoria e i processi, e fa da tramite tra i programmi e il computer", ok: true, why: "È il nucleo del sistema: i programmi chiedono al kernel di leggere file, usare la rete, avere memoria." },
            { t: "Disegna le finestre e le icone del desktop", ok: false, why: "Lo fanno l'ambiente desktop e il server grafico, che sono programmi sopra il kernel." },
            { t: "Interpreta i comandi scritti nel terminale", ok: false, why: "Lo fa la shell, per esempio Bash." },
            { t: "Installa gli aggiornamenti", ok: false, why: "Lo fa il gestore dei pacchetti." }
        ]
    },
    {
        id: "4.1-02", type: "single", ref: "4.1_01#macOS",
        text: "Da quale famiglia di sistemi deriva macOS?",
        options: [
            { t: "Da Unix: la sua base (Darwin) viene in parte da BSD", ok: true, why: "Per questo il terminale di macOS assomiglia molto a quello di Linux: comandi come `ls` e `cd` funzionano allo stesso modo." },
            { t: "Da Linux: è una distribuzione Linux di Apple", ok: false, why: "macOS non usa il kernel Linux." },
            { t: "Da Windows", ok: false, why: "macOS e Windows hanno storie del tutto separate." },
            { t: "Da Android", ok: false, why: "Android è nato molto dopo e usa il kernel Linux." }
        ]
    },
    {
        id: "4.1-03", type: "single", ref: "4.1_01#Ciclo di Vita del Supporto Linux",
        text: "Che cos'è una versione beta?",
        options: [
            { t: "Una versione di prova, quasi pronta, che può ancora contenere errori: non adatta a un computer di lavoro", ok: true, why: "Serve a far provare le novità prima della versione stabile, che arriva dopo le correzioni." },
            { t: "La versione stabile, consigliata per i server", ok: false, why: "Per i server si sceglie la versione stabile, meglio se con supporto lungo." },
            { t: "Una versione più leggera per computer vecchi", ok: false, why: "Beta indica lo stato dello sviluppo, non il peso del sistema." },
            { t: "Una versione a pagamento", ok: false, why: "Beta non ha niente a che fare con il prezzo." }
        ]
    },
    {
        id: "4.1-04", type: "single", ref: "4.1_01#Ciclo di Vita del Supporto Linux",
        text: "Che cosa succede quando una versione di una distribuzione arriva alla fine del supporto (End of Life)?",
        options: [
            { t: "Non riceve più aggiornamenti di sicurezza: conviene passare a una versione più recente", ok: true, why: "Il sistema continua a funzionare, ma i nuovi problemi di sicurezza non vengono più corretti." },
            { t: "Smette di avviarsi", ok: false, why: "Continua ad avviarsi: il rischio è non avere più le correzioni." },
            { t: "Si aggiorna da solo alla versione successiva", ok: false, why: "L'aggiornamento alla versione successiva va avviato da chi gestisce il computer." },
            { t: "Diventa a pagamento", ok: false, why: "La fine del supporto non cambia la licenza." }
        ]
    },
    {
        id: "4.1-05", type: "multiple", ref: "4.1_01#Microsoft Windows",
        text: "Quali affermazioni sulle differenze tra Linux e Windows sono vere?",
        options: [
            { t: "Windows assegna una lettera a ogni disco (C:, D:), Linux mette tutto in un solo albero che parte da `/`", ok: true, why: "In Linux anche gli altri dischi compaiono come directory, per esempio sotto `/media` o `/mnt`." },
            { t: "Le distribuzioni Linux si possono di solito usare e copiare senza pagare licenze, Windows richiede una licenza", ok: true, why: "Linux e la maggior parte dei programmi delle distribuzioni hanno licenze libere." },
            { t: "Linux non può avere un'interfaccia grafica", ok: false, why: "Linux ha molti ambienti desktop, come GNOME e KDE." },
            { t: "In Windows i nomi dei file distinguono maiuscole e minuscole, in Linux no", ok: false, why: "È il contrario: è Linux a distinguerle." },
            { t: "Linux funziona solo sui server", ok: false, why: "Linux si usa su desktop, portatili, telefoni (Android) e dispositivi integrati." }
        ]
    },
    {
        id: "4.1-06", type: "single", ref: "4.1_01#Utilizzo di Linux sui Server",
        text: "Perché sui server si lavora spesso solo con la riga di comando, senza interfaccia grafica?",
        options: [
            { t: "Consuma meno risorse, si può usare a distanza (per esempio con SSH) e i comandi si possono automatizzare negli script", ok: true, why: "Un server non ha bisogno di finestre: la memoria e il processore servono ai servizi che offre." },
            { t: "Perché Linux sui server non può installare un desktop", ok: false, why: "Si può installare, ma di solito non serve." },
            { t: "Perché la riga di comando è più sicura contro i guasti dell'hardware", ok: false, why: "L'interfaccia non protegge dai guasti." },
            { t: "Perché la grafica è vietata dalle licenze dei server", ok: false, why: "Nessuna licenza vieta la grafica." }
        ]
    },
    {
        id: "4.1-07", type: "fill", ref: "4.1_01#Unix", anyCase: true, placeholder: "nome",
        text: "Quale sistema operativo, nato ai Bell Labs alla fine degli anni '60, ha ispirato Linux, BSD e macOS?",
        answers: ["Unix"],
        why: "Unix ha introdotto idee che Linux ha ripreso: tutto è un file, piccoli programmi collegati con le pipe, più utenti allo stesso tempo."
    },
    {
        id: "4.1-08", type: "single", ref: "4.1_01#Linux come Sistema Desktop",
        text: "Su una distribuzione Linux si può cambiare l'aspetto del desktop, per esempio passare da GNOME a Xfce?",
        options: [
            { t: "Sì: si possono installare più ambienti desktop e scegliere quale usare al momento dell'accesso", ok: true, why: "L'ambiente desktop è un insieme di programmi come gli altri: si installa con il gestore dei pacchetti." },
            { t: "No: ogni distribuzione ha un solo desktop possibile", ok: false, why: "Molte distribuzioni offrono anche versioni con desktop diversi (per esempio Kubuntu e Xubuntu per Ubuntu)." },
            { t: "Solo reinstallando il sistema da zero", ok: false, why: "Non serve reinstallare: basta aggiungere il pacchetto dell'ambiente desktop." },
            { t: "Solo comprando una licenza", ok: false, why: "Gli ambienti desktop per Linux sono liberi." }
        ]
    },
    {
        id: "4.1-09", type: "single", ref: "4.1_01#Tipi di Distribuzioni Linux",
        text: "Un'azienda vuole un sistema per i suoi server con aggiornamenti di sicurezza per molti anni e assistenza a pagamento. Quale scelta è più adatta?",
        options: [
            { t: "Una distribuzione commerciale per le aziende, come Red Hat Enterprise Linux o SUSE Linux Enterprise", ok: true, why: "Offrono supporto lungo e assistenza tecnica con contratto. In alternativa, una LTS gratuita come Ubuntu LTS o Debian stabile." },
            { t: "La versione beta più recente di una distribuzione", ok: false, why: "Le beta sono per le prove, non per i server di produzione." },
            { t: "Una distribuzione per Raspberry Pi", ok: false, why: "È pensata per una scheda piccola, non per i server aziendali." },
            { t: "Qualsiasi distribuzione: hanno tutte lo stesso supporto", ok: false, why: "La durata del supporto cambia molto da una distribuzione all'altra." }
        ]
    },

    // ---- 4.2 Comprendere l'Hardware del Computer ----
    {
        id: "4.2-01", type: "single", ref: "4.2_01#Driver e File di Dispositivo",
        text: "Che cosa indica di solito il file `/dev/sda`?",
        options: [
            { t: "Il primo disco SATA, SCSI o USB del sistema, per intero", ok: true, why: "I dischi si chiamano `sda`, `sdb`, `sdc`... nell'ordine in cui vengono trovati; le partizioni hanno un numero in fondo." },
            { t: "La prima partizione del primo disco", ok: false, why: "La prima partizione è `/dev/sda1`." },
            { t: "La scheda audio", ok: false, why: "I dispositivi audio hanno altri nomi, sotto `/dev/snd/`." },
            { t: "Una cartella con i dati dell'utente", ok: false, why: "`/dev` contiene file di dispositivo, non dati degli utenti." }
        ]
    },
    {
        id: "4.2-02", type: "single", ref: "4.2_01#Partitizioni",
        text: "Che cosa indica `/dev/sdb2`?",
        options: [
            { t: "La seconda partizione del secondo disco", ok: true, why: "`sdb` è il secondo disco (dopo `sda`), `2` è la partizione." },
            { t: "Il secondo disco del secondo controller", ok: false, why: "Il numero finale indica la partizione, non il controller." },
            { t: "La partizione di 2 GB", ok: false, why: "Il numero non dice niente sulla dimensione." },
            { t: "Il disco B, come in Windows", ok: false, why: "Linux non usa le lettere dei dischi come Windows." }
        ]
    },
    {
        id: "4.2-03", type: "single", ref: "4.2_01#Memoria",
        text: "Che cosa succede ai dati nella RAM quando spegni il computer?",
        options: [
            { t: "Si perdono: la RAM è una memoria volatile", ok: true, why: "Per questo i file vanno salvati su disco (HDD o SSD), che conserva i dati anche senza corrente." },
            { t: "Restano fino alla prossima accensione", ok: false, why: "Questo vale per i dischi, non per la RAM." },
            { t: "Vengono copiati sempre in automatico sul disco", ok: false, why: "Solo con l'ibernazione il contenuto della RAM viene salvato su disco; con lo spegnimento normale no." },
            { t: "Vengono inviati al cloud", ok: false, why: "La RAM non ha niente a che fare con il cloud." }
        ]
    },
    {
        id: "4.2-04", type: "single", ref: "4.2_01#Archiviazione",
        text: "Che differenza c'è tra un disco SSD e un disco rigido tradizionale (HDD)?",
        options: [
            { t: "L'SSD usa memoria flash senza parti in movimento ed è molto più veloce; l'HDD ha dischi magnetici che girano", ok: true, why: "Gli HDD costano meno per gigabyte, gli SSD sono più veloci, silenziosi e resistenti agli urti." },
            { t: "L'SSD perde i dati quando si spegne il computer", ok: false, why: "Gli SSD conservano i dati senza corrente, come gli HDD." },
            { t: "Linux non può usare gli SSD", ok: false, why: "Linux li usa normalmente: compaiono come `/dev/sda` o, se NVMe, come `/dev/nvme0n1`." },
            { t: "Sono la stessa cosa con due nomi", ok: false, why: "Funzionano in modo diverso." }
        ]
    },
    {
        id: "4.2-05", type: "single", ref: "4.2_01#Driver e File di Dispositivo",
        text: "Che cos'è un driver?",
        options: [
            { t: "Il software che permette al kernel di comunicare con un dispositivo; in Linux spesso è un modulo del kernel", ok: true, why: "Molti driver sono già inclusi nel kernel Linux e si caricano da soli quando il dispositivo viene trovato." },
            { t: "Il cavo che collega il dispositivo al computer", ok: false, why: "Il driver è software, non un pezzo di hardware." },
            { t: "Un programma per guidare il mouse", ok: false, why: "Esistono driver anche per il mouse, ma il termine vale per qualsiasi dispositivo." },
            { t: "L'utente che usa il computer", ok: false, why: "In informatica «driver» indica il software di un dispositivo." }
        ]
    },
    {
        id: "4.2-06", type: "multiple", ref: "4.2_01#Periferiche",
        text: "Quali di queste sono periferiche di input, che mandano dati al computer?",
        options: [
            { t: "Tastiera", ok: true, why: "Manda al computer i tasti premuti." },
            { t: "Mouse", ok: true, why: "Manda al computer movimenti e clic." },
            { t: "Monitor", ok: false, why: "Il monitor riceve le immagini: è di output." },
            { t: "Stampante", ok: false, why: "Riceve i documenti da stampare: è di output." },
            { t: "Altoparlanti", ok: false, why: "Riproducono il suono: sono di output." }
        ]
    },
    {
        id: "4.2-07", type: "single", ref: "4.2_01#Alimentatori",
        text: "Che cosa fa l'alimentatore di un computer da scrivania?",
        options: [
            { t: "Trasforma la corrente alternata della presa nelle tensioni continue usate dai componenti", ok: true, why: "Fornisce per esempio 12 V, 5 V e 3,3 V alla scheda madre, ai dischi e alla scheda video." },
            { t: "Tiene acceso il computer quando manca la corrente", ok: false, why: "Questo lo fa un gruppo di continuità (UPS), un apparecchio esterno." },
            { t: "Raffredda il processore", ok: false, why: "Ha una ventola per sé, ma il processore ha il suo dissipatore." },
            { t: "Conserva le impostazioni del BIOS", ok: false, why: "Lo fa una piccola memoria sulla scheda madre, con la sua pila." }
        ]
    },
    {
        id: "4.2-08", type: "fill", ref: "4.2_01#Driver e File di Dispositivo", placeholder: "percorso",
        text: "In quale directory Linux tiene i file di dispositivo, come quelli dei dischi?",
        answers: ["/dev", "/dev/"],
        why: "In `/dev` ogni dispositivo è un file speciale: per esempio `/dev/sda` è il primo disco. È l'idea di Unix «tutto è un file»."
    },
    {
        id: "4.2-09", type: "single", ref: "4.2_01#Processori",
        text: "Che vantaggio ha un processore (e un sistema) a 64 bit rispetto a uno a 32 bit?",
        options: [
            { t: "Può usare molto più di 4 GB di RAM", ok: true, why: "Con 32 bit si possono indirizzare circa 4 GB; con 64 bit il limite è enormemente più alto." },
            { t: "Ha il doppio dei core", ok: false, why: "Il numero di core non dipende dai bit dell'architettura." },
            { t: "Non si scalda mai", ok: false, why: "Tutti i processori producono calore." },
            { t: "Funziona senza sistema operativo", ok: false, why: "Qualsiasi processore ha bisogno di un sistema operativo per far girare i programmi." }
        ]
    },
    {
        id: "4.2-10", type: "single", ref: "4.2_01#Scheda Madre",
        text: "Che cos'è la scheda madre?",
        options: [
            { t: "Il circuito principale che collega processore, RAM, dischi e schede di espansione, con il firmware (BIOS o UEFI)", ok: true, why: "Tutti i componenti si collegano alla scheda madre, che li fa comunicare." },
            { t: "La scheda video principale", ok: false, why: "La scheda video si collega alla scheda madre, oppure è integrata nel processore." },
            { t: "Il disco dove è installato il sistema", ok: false, why: "Il disco è un componente separato." },
            { t: "La prima partizione del disco", ok: false, why: "Le partizioni sono parti di un disco, non hardware." }
        ]
    },
    {
        id: "4.2-11", type: "single", ref: "4.2_01#Partitizioni",
        text: "Che cos'è una partizione?",
        options: [
            { t: "Una parte di un disco, separata dalle altre, che può avere il suo file system", ok: true, why: "Per esempio un disco può avere una partizione per il sistema, una per i dati degli utenti e una di swap." },
            { t: "Un disco esterno collegato via USB", ok: false, why: "Un disco esterno è un dispositivo; anche lui può essere diviso in partizioni." },
            { t: "Una cartella condivisa in rete", ok: false, why: "Le partizioni stanno sui dischi, non in rete." },
            { t: "Una copia di sicurezza del disco", ok: false, why: "Una copia di sicurezza è un backup." }
        ]
    },

    // ---- 4.3 Dove Sono Memorizzati i Dati ----
    {
        id: "4.3-01", type: "single", ref: "4.3_01#Dove sono Memorizzati i File di Configurazione",
        text: "Dove si trovano i file di configurazione validi per tutto il sistema?",
        options: [
            { t: "In `/etc`", ok: true, why: "Per esempio `/etc/hosts`, `/etc/passwd`, `/etc/resolv.conf`. Le impostazioni personali invece stanno nei file nascosti della home." },
            { t: "In `/bin`", ok: false, why: "`/bin` contiene programmi." },
            { t: "In `/tmp`", ok: false, why: "`/tmp` contiene file temporanei, che possono essere cancellati." },
            { t: "In `/dev`", ok: false, why: "`/dev` contiene i file di dispositivo." }
        ]
    },
    {
        id: "4.3-02", type: "single", ref: "4.3_02#Accedere ai File di Log",
        text: "In quale directory stanno di solito i file di log, cioè i registri degli eventi di sistema?",
        options: [
            { t: "`/var/log`", ok: true, why: "`/var` contiene i dati che cambiano mentre il sistema funziona; `/var/log` i registri, come `syslog` o `auth.log`." },
            { t: "`/etc/log`", ok: false, why: "`/etc` contiene configurazione, non registri." },
            { t: "`/home/log`", ok: false, why: "`/home` contiene le directory degli utenti." },
            { t: "`/boot`", ok: false, why: "`/boot` contiene i file per l'avvio, come il kernel." }
        ]
    },
    {
        id: "4.3-03", type: "single", ref: "4.3_01#Dove sono Memorizzati i File del Kernel: /boot",
        text: "Che cosa contiene `/boot`?",
        options: [
            { t: "I file necessari all'avvio: il kernel (per esempio `vmlinuz`), l'initrd e la configurazione del boot loader", ok: true, why: "Il boot loader (come GRUB) li legge da qui per avviare Linux." },
            { t: "I programmi che partono all'accesso dell'utente", ok: false, why: "Quei programmi non stanno in `/boot`." },
            { t: "I file di log dell'avvio", ok: false, why: "I log stanno in `/var/log` o nel journal." },
            { t: "Le directory degli utenti", ok: false, why: "Stanno in `/home`." }
        ]
    },
    {
        id: "4.3-04", type: "single", ref: "4.3_01#La Directory /proc",
        text: "Che cos'è la directory `/proc`?",
        options: [
            { t: "Un file system virtuale creato dal kernel: mostra informazioni sui processi e sul sistema, ma non occupa spazio su disco", ok: true, why: "Per esempio `/proc/cpuinfo` descrive il processore e ogni processo ha una directory col suo numero (`/proc/1234`)." },
            { t: "La directory con i programmi installati", ok: false, why: "I programmi stanno in `/usr/bin`, `/bin` e simili." },
            { t: "Una directory per i file temporanei", ok: false, why: "Quella è `/tmp`." },
            { t: "La copia di riserva della configurazione", ok: false, why: "La configurazione sta in `/etc`." }
        ]
    },
    {
        id: "4.3-05", type: "fill", ref: "4.3_01#Memoria e Tipi di Memoria", placeholder: "comando",
        text: "Quale comando mostra quanta RAM e quanto swap sono usati e liberi?",
        answers: ["free", "free -h", "free -m"],
        pattern: "^free( -[a-z]+)*$",
        notAccepted: ["top -h", "df -h"],
        why: "`free` mostra la memoria totale, usata e disponibile; con `-h` usa unità leggibili come Gi e Mi."
    },
    {
        id: "4.3-06", type: "single", ref: "4.3_02#Esplorare i Processi in Modo Dinamico: top",
        text: "Che differenza c'è tra `top` e `ps`?",
        options: [
            { t: "`top` mostra i processi in tempo reale e si aggiorna da solo; `ps` fa una fotografia del momento e termina", ok: true, why: "Da `top` si esce con `q`; `ps` è comodo negli script e con le pipe." },
            { t: "`top` mostra solo il processo più pesante, `ps` tutti", ok: false, why: "`top` mostra tanti processi, ordinati di solito per uso del processore." },
            { t: "`ps` mostra la memoria del disco, `top` quella della RAM", ok: false, why: "Tutti e due parlano di processi." },
            { t: "Sono lo stesso comando", ok: false, why: "Mostrano informazioni simili in modo diverso." }
        ]
    },
    {
        id: "4.3-07", type: "single", ref: "4.3_02#Un’Istantanea dei Processi: ps",
        text: "Quale comando mostra tutti i processi di tutti gli utenti, con l'utente e l'uso di CPU e memoria?",
        options: [
            { t: "`ps aux`", ok: true, why: "`a` tutti gli utenti, `u` formato con l'utente e le risorse, `x` anche i processi senza terminale." },
            { t: "`ps`", ok: false, why: "Senza opzioni `ps` mostra solo i processi del terminale corrente." },
            { t: "`ls /proc -u`", ok: false, why: "Elenca file, non mostra i processi in modo leggibile." },
            { t: "`free -a`", ok: false, why: "`free` parla di memoria, non di processi." }
        ]
    },
    {
        id: "4.3-08", type: "single", ref: "4.3_02#Il Kernel Ring Buffer",
        text: "Che cosa mostra `dmesg`?",
        options: [
            { t: "I messaggi del kernel, per esempio sull'hardware trovato all'avvio o su una chiavetta USB appena collegata", ok: true, why: "Il kernel tiene i suoi messaggi in un'area di memoria (ring buffer) che `dmesg` legge." },
            { t: "I messaggi di posta elettronica", ok: false, why: "La posta non c'entra." },
            { t: "Gli utenti collegati", ok: false, why: "Gli utenti collegati si vedono con `who` o `w`." },
            { t: "Lo spazio libero sui dischi", ok: false, why: "Lo spazio libero si vede con `df`." }
        ]
    },
    {
        id: "4.3-09", type: "multiple", ref: "4.3_01#La Directory /sys",
        text: "Quali directory sono virtuali, cioè create dal kernel in memoria e non salvate su disco?",
        options: [
            { t: "`/proc`", ok: true, why: "Contiene informazioni su processi e sistema, generate al momento." },
            { t: "`/sys`", ok: true, why: "Descrive dispositivi e driver visti dal kernel." },
            { t: "`/etc`", ok: false, why: "I file di configurazione sono veri file su disco." },
            { t: "`/var/log`", ok: false, why: "I log sono file su disco, scritti mentre il sistema funziona." },
            { t: "`/boot`", ok: false, why: "Il kernel e i file di avvio sono su disco." }
        ]
    },
    {
        id: "4.3-10", type: "single", ref: "4.3_02#Il Carico di Sistema",
        text: "`uptime` e `top` mostrano «load average: 0.50, 0.30, 0.20». Che cosa sono questi tre numeri?",
        options: [
            { t: "Quanto è stato occupato il sistema, in media, su tre periodi: 1, 5 e 15 minuti", ok: true, why: "Indicano in media quanti processi erano in esecuzione o in attesa: si confrontano con il numero di core." },
            { t: "La percentuale di RAM, swap e disco usati", ok: false, why: "La memoria si vede con `free`, i dischi con `df`." },
            { t: "La temperatura dei tre core più caldi", ok: false, why: "Il carico non è una temperatura." },
            { t: "I megabyte scaricati dalla rete", ok: false, why: "Il carico riguarda i processi, non la rete." }
        ]
    },
    {
        id: "4.3-11", type: "single", ref: "4.3_02#Log con il Demone syslog",
        text: "Che cosa fa un demone di syslog, come rsyslog?",
        options: [
            { t: "Raccoglie i messaggi del sistema e dei servizi e li scrive nei file di log in `/var/log`", ok: true, why: "I programmi gli mandano i messaggi; lui li smista nei file secondo la configurazione." },
            { t: "Sincronizza l'orologio del computer", ok: false, why: "Per l'orologio si usano servizi NTP." },
            { t: "Cancella i file di log vecchi", ok: false, why: "Lo fa di solito `logrotate`." },
            { t: "Invia la posta degli utenti", ok: false, why: "La posta la gestisce un server di posta." }
        ]
    },
    {
        id: "4.3-12", type: "fill", ref: "4.3_02#Il Journal di Sistema: systemd-journald", placeholder: "comando",
        text: "Sui sistemi con systemd, quale comando legge i messaggi raccolti nel journal?",
        answers: ["journalctl", "sudo journalctl"],
        why: "`journalctl` mostra i messaggi del journal di systemd; per esempio `journalctl -b` solo quelli dall'ultimo avvio."
    },
    {
        id: "4.3-13", type: "single", ref: "4.3_02#Processi",
        text: "Che cos'è il PID di un processo?",
        options: [
            { t: "Il numero che identifica il processo in esecuzione", ok: true, why: "Ogni processo ha un PID diverso; si vede con `ps` o `top` e serve per esempio per terminarlo con `kill`." },
            { t: "La password del processo", ok: false, why: "I processi non hanno password." },
            { t: "Il nome del file del programma", ok: false, why: "Il nome è un'altra informazione: il PID è un numero." },
            { t: "La priorità del processo", ok: false, why: "La priorità si chiama nice/PRI; il PID è l'identificativo." }
        ]
    },
    {
        id: "4.3-14", type: "single", ref: "4.3_01#Dove sono Memorizzati i File Binari",
        text: "Dove si trovano di solito i programmi (i file binari) che usano tutti gli utenti, come `ls` o `grep`?",
        options: [
            { t: "In `/usr/bin` (e in `/bin`)", ok: true, why: "Sono nel `PATH` di tutti. I comandi per l'amministrazione stanno invece in `/usr/sbin` e `/sbin`." },
            { t: "In `/etc`", ok: false, why: "`/etc` contiene configurazione." },
            { t: "In `/home/bin`", ok: false, why: "`/home` contiene le directory degli utenti." },
            { t: "In `/var`", ok: false, why: "`/var` contiene dati che cambiano, come log e code." }
        ]
    },
    {
        id: "4.3-15", type: "single", ref: "4.3_01#Memoria e Tipi di Memoria",
        text: "Che cos'è lo swap?",
        options: [
            { t: "Uno spazio su disco che il sistema usa come memoria quando la RAM non basta", ok: true, why: "È molto più lento della RAM: se il sistema lo usa tanto, di solito serve più memoria." },
            { t: "Una memoria più veloce della RAM", ok: false, why: "È più lento: sta su disco." },
            { t: "Un programma per scambiare file tra utenti", ok: false, why: "Swap riguarda la memoria." },
            { t: "La memoria della scheda video", ok: false, why: "La scheda video ha la sua memoria, che non si chiama swap." }
        ]
    },

    // ---- 4.4 Il Tuo Computer in Rete ----
    {
        id: "4.4-01", type: "single", ref: "4.4_01#Configurazione di Indirizzi IPv4",
        text: "Quale comando mostra gli indirizzi IP delle schede di rete?",
        options: [
            { t: "`ip addr show`", ok: true, why: "È il comando moderno; il vecchio `ifconfig` mostra informazioni simili." },
            { t: "`ip route show`", ok: false, why: "Mostra la tabella di routing, cioè dove vanno i pacchetti." },
            { t: "`host`", ok: false, why: "`host` chiede al DNS l'indirizzo di un nome." },
            { t: "`ping`", ok: false, why: "`ping` controlla se un altro computer risponde." }
        ]
    },
    {
        id: "4.4-02", type: "single", ref: "4.4_01#DNS",
        text: "Che cosa contiene il file `/etc/resolv.conf`?",
        options: [
            { t: "Gli indirizzi dei server DNS da usare, nelle righe `nameserver`", ok: true, why: "Il sistema chiede a quei server di tradurre i nomi (come lpi.org) in indirizzi IP." },
            { t: "I nomi e gli indirizzi degli utenti", ok: false, why: "Gli utenti sono in `/etc/passwd`." },
            { t: "La risoluzione dello schermo", ok: false, why: "«resolv» viene da «resolver»: risolvere i nomi in rete." },
            { t: "Le password del Wi-Fi", ok: false, why: "Le reti Wi-Fi si configurano altrove, per esempio con NetworkManager." }
        ]
    },
    {
        id: "4.4-03", type: "single", ref: "4.4_01#DNS",
        text: "A che cosa serve il file `/etc/hosts`?",
        options: [
            { t: "Ad associare nomi a indirizzi IP direttamente sul computer, di solito prima di chiedere al DNS", ok: true, why: "Per esempio la riga `192.168.1.10 nas` permette di scrivere `ping nas`." },
            { t: "A elencare gli utenti che possono collegarsi", ok: false, why: "Non riguarda gli utenti." },
            { t: "A bloccare tutti i siti web", ok: false, why: "Si può usare per «dirottare» qualche nome, ma il suo scopo è associare nomi e indirizzi." },
            { t: "A scegliere i server DNS", ok: false, why: "I server DNS sono in `/etc/resolv.conf`." }
        ]
    },
    {
        id: "4.4-04", type: "multiple", ref: "4.4_01#Indirizzi Privati IPv4",
        text: "Quali sono indirizzi IPv4 privati, usati nelle reti locali e non instradati su Internet?",
        options: [
            { t: "`192.168.1.10`", ok: true, why: "Fa parte della rete privata 192.168.0.0/16, quella delle reti di casa." },
            { t: "`10.0.0.5`", ok: true, why: "Fa parte della rete privata 10.0.0.0/8." },
            { t: "`8.8.8.8`", ok: false, why: "È un indirizzo pubblico (un server DNS di Google)." },
            { t: "`172.32.0.1`", ok: false, why: "La rete privata 172.16.0.0/12 va da 172.16 a 172.31: 172.32 è fuori." },
            { t: "`193.1.1.1`", ok: false, why: "È un indirizzo pubblico." }
        ]
    },
    {
        id: "4.4-05", type: "single", ref: "4.4_01#Indirizzi IPv6",
        text: "Quanti bit ha un indirizzo IPv6?",
        options: [
            { t: "128", ok: true, why: "IPv4 ne ha 32: IPv6 offre un numero enorme di indirizzi, scritti in esadecimale divisi da `:`." },
            { t: "32", ok: false, why: "32 bit sono quelli di IPv4." },
            { t: "64", ok: false, why: "64 bit sono di solito la parte del prefisso di rete, o quella dell'interfaccia; l'indirizzo intero ne ha 128." },
            { t: "48", ok: false, why: "48 bit sono quelli di un indirizzo MAC." }
        ]
    },
    {
        id: "4.4-06", type: "fill", ref: "4.4_01#Routing IPv4", placeholder: "comando",
        text: "Scrivi il comando che controlla se il router con indirizzo `192.168.1.1` risponde in rete.",
        answers: ["ping 192.168.1.1", "ping -c 4 192.168.1.1"],
        pattern: "^ping (-c ?\\d+ )?192\\.168\\.1\\.1$",
        notAccepted: ["ping 192.168.1.10", "host 192.168.1.1"],
        why: "`ping` manda piccoli pacchetti e misura le risposte; si ferma con Ctrl+C, oppure con `-c 4` dopo quattro tentativi."
    },
    {
        id: "4.4-07", type: "single", ref: "4.4_01#Routing IPv4",
        text: "Nel risultato di `ip route show` c'è la riga `default via 192.168.1.1 dev eth0`. Che cosa vuol dire?",
        options: [
            { t: "Che il gateway predefinito è 192.168.1.1: i pacchetti per le altre reti (Internet) passano da lì", ok: true, why: "Il gateway predefinito è di solito il router di casa o dell'ufficio." },
            { t: "Che l'indirizzo del computer è 192.168.1.1", ok: false, why: "L'indirizzo del computer si vede con `ip addr show`." },
            { t: "Che il server DNS è 192.168.1.1", ok: false, why: "Il DNS è in `/etc/resolv.conf` (anche se spesso il router fa entrambe le cose)." },
            { t: "Che `eth0` è spenta", ok: false, why: "La riga dice solo quale scheda si usa per arrivare al gateway." }
        ]
    },
    {
        id: "4.4-08", type: "single", ref: "4.4_01#Socket",
        text: "A che cosa servono `ss` e il più vecchio `netstat`?",
        options: [
            { t: "A vedere le connessioni di rete e le porte in ascolto, cioè i socket", ok: true, why: "Per esempio `ss -tln` mostra le porte TCP su cui un servizio aspetta connessioni." },
            { t: "A misurare la velocità di Internet", ok: false, why: "Non fanno test di velocità." },
            { t: "A configurare il Wi-Fi", ok: false, why: "Mostrano lo stato delle connessioni, non configurano le reti." },
            { t: "A tradurre i nomi in indirizzi IP", ok: false, why: "Lo fanno il DNS e comandi come `host`." }
        ]
    },
    {
        id: "4.4-09", type: "single", ref: "4.4_01#DNS",
        text: "Che cosa fa `host www.lpi.org`?",
        options: [
            { t: "Chiede al DNS l'indirizzo IP corrispondente al nome", ok: true, why: "È il modo più semplice per controllare se la risoluzione dei nomi funziona." },
            { t: "Apre il sito nel browser", ok: false, why: "`host` lavora solo nel terminale." },
            { t: "Rende il tuo computer un server per quel sito", ok: false, why: "Non configura niente." },
            { t: "Controlla se il sito risponde ai ping", ok: false, why: "Per quello c'è `ping`." }
        ]
    },
    {
        id: "4.4-10", type: "single", ref: "4.4_01#Sottoreti IPv4",
        text: "A quale maschera di rete corrisponde il prefisso `/24`, come in `192.168.1.0/24`?",
        options: [
            { t: "`255.255.255.0`", ok: true, why: "24 bit a 1 sono i primi tre numeri: la rete è 192.168.1, gli ultimi 8 bit sono per i computer." },
            { t: "`255.255.0.0`", ok: false, why: "Corrisponde a `/16`." },
            { t: "`255.0.0.0`", ok: false, why: "Corrisponde a `/8`." },
            { t: "`255.255.255.255`", ok: false, why: "Corrisponde a `/32`, un solo indirizzo." }
        ]
    },
    {
        id: "4.4-11", type: "single", ref: "4.4_01#Rete Link Layer",
        text: "Che cos'è l'indirizzo MAC di una scheda di rete?",
        options: [
            { t: "Un identificativo di 48 bit della scheda, usato per comunicare nella rete locale", ok: true, why: "Si scrive con sei coppie esadecimali, per esempio `52:54:00:12:34:56`; si vede con `ip link show`." },
            { t: "L'indirizzo IP dei computer Apple", ok: false, why: "MAC (Media Access Control) non ha niente a che fare con i Mac di Apple." },
            { t: "L'indirizzo IP pubblico assegnato dal fornitore di Internet", ok: false, why: "L'indirizzo IP è un'altra cosa, di un altro livello della rete." },
            { t: "Il nome del computer in rete", ok: false, why: "Il nome è l'hostname." }
        ]
    },
    {
        id: "4.4-12", type: "single", ref: "4.4_01#Indirizzi IPv4",
        text: "Che cosa indica l'indirizzo `127.0.0.1`?",
        options: [
            { t: "Il computer stesso (loopback, chiamato anche localhost)", ok: true, why: "Serve ai programmi per parlarsi sullo stesso computer; in IPv6 è `::1`." },
            { t: "Il router di casa", ok: false, why: "Il router ha di solito un indirizzo privato come 192.168.1.1." },
            { t: "Il primo server DNS di Internet", ok: false, why: "È un indirizzo locale, non porta fuori dal computer." },
            { t: "Un indirizzo non valido", ok: false, why: "È valido e sempre presente." }
        ]
    },
    {
        id: "4.4-13", type: "single", ref: "4.4_01#Indirizzi IPv6",
        text: "Che cosa vuol dire `::` in un indirizzo IPv6 come `2001:db8::1`?",
        options: [
            { t: "Sostituisce uno o più gruppi consecutivi fatti solo di zeri; si può usare una volta sola nell'indirizzo", ok: true, why: "Così `2001:db8:0:0:0:0:0:1` si scrive più breve. Anche gli zeri iniziali di ogni gruppo si possono omettere." },
            { t: "Separa l'indirizzo dalla porta", ok: false, why: "Per la porta un indirizzo IPv6 si scrive tra parentesi quadre, per esempio `[2001:db8::1]:80`." },
            { t: "Indica che l'indirizzo è privato", ok: false, why: "Indica solo una parte di zeri." },
            { t: "È un errore di battitura", ok: false, why: "È una forma abbreviata normale." }
        ]
    },
    {
        id: "4.4-14", type: "fill", ref: "4.4_01#Routing IPv4", placeholder: "comando",
        text: "Scrivi il comando moderno (con `ip`) che mostra la tabella di routing.",
        answers: ["ip route show", "ip route", "ip r", "ip route list", "ip r show", "ip r list"],
        why: "`ip route show` elenca le reti raggiungibili e il gateway predefinito; il comando più vecchio è `route`."
    }
]);
