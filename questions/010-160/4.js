// Domande dell'argomento 4: Il Sistema Operativo Linux.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 4.1 Scelta di un Sistema Operativo ----
    {
        id: "4.1-01", type: "single", ref: "4.1_01#Cos’è un Sistema Operativo",
        text: "In un sistema operativo, che cosa fa il kernel?",
        options: [
            { t: "Gestisce hardware, memoria e processi, tra i programmi e il computer", ok: true, why: "È il nucleo del sistema: i programmi chiedono al kernel di leggere file, usare la rete, avere memoria." },
            { t: "Disegna le finestre, le icone e i menu del desktop grafico", ok: false, why: "Lo fanno l'ambiente desktop e il server grafico, che sono programmi sopra il kernel." },
            { t: "Interpreta i comandi che scrivi nel terminale, come fa Bash", ok: false, why: "Lo fa la shell, per esempio Bash." },
            { t: "Installa gli aggiornamenti dei programmi e del sistema operativo quando escono", ok: false, why: "Lo fa il gestore dei pacchetti." }
        ]
    },
    {
        id: "4.1-02", type: "single", ref: "4.1_01#macOS",
        text: "Da quale famiglia di sistemi deriva macOS?",
        options: [
            { t: "Da Unix, attraverso BSD (la base si chiama Darwin)", ok: true, why: "Per questo il terminale di macOS assomiglia molto a quello di Linux: comandi come `ls` e `cd` funzionano allo stesso modo." },
            { t: "Da Linux: è una distribuzione Linux fatta da Apple", ok: false, why: "macOS non usa il kernel Linux." },
            { t: "Da MS-DOS, come le prime versioni di Windows", ok: false, why: "macOS non ha niente a che fare con MS-DOS e Windows: le loro storie sono separate." },
            { t: "Da Android, il sistema dei telefoni di Google", ok: false, why: "Android è nato molto dopo e usa il kernel Linux." }
        ]
    },
    {
        id: "4.1-03", type: "single", ref: "4.1_01#Ciclo di Vita del Supporto Linux",
        text: "Che cos'è una versione beta?",
        options: [
            { t: "Una versione di prova, quasi pronta, che può ancora avere errori", ok: true, why: "Serve a far provare le novità prima della versione stabile, che arriva dopo le correzioni." },
            { t: "La versione stabile e collaudata, quella consigliata per i server di lavoro", ok: false, why: "Per i server si sceglie la versione stabile, meglio se con supporto lungo." },
            { t: "Una versione più leggera, pensata per i computer vecchi", ok: false, why: "Beta indica lo stato dello sviluppo, non il peso del sistema." },
            { t: "Una versione a pagamento, con l'assistenza del produttore", ok: false, why: "Beta non ha niente a che fare con il prezzo." }
        ]
    },
    {
        id: "4.1-04", type: "single", ref: "4.1_01#Ciclo di Vita del Supporto Linux",
        text: "Che cosa succede quando una versione di una distribuzione arriva alla fine del supporto (End of Life)?",
        options: [
            { t: "Non riceve più aggiornamenti di sicurezza: meglio aggiornare", ok: true, why: "Il sistema continua a funzionare, ma i nuovi problemi di sicurezza non vengono più corretti." },
            { t: "Smette di avviarsi alla data indicata e il computer resta fermo", ok: false, why: "Continua ad avviarsi: il rischio è non avere più le correzioni." },
            { t: "Si aggiorna da solo alla versione successiva, senza chiedere niente", ok: false, why: "L'aggiornamento alla versione successiva va avviato da chi gestisce il computer." },
            { t: "Diventa a pagamento: per continuare a usarla serve una licenza", ok: false, why: "La fine del supporto non cambia la licenza." }
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
            { t: "Consuma meno risorse, si usa a distanza con SSH e si automatizza", ok: true, why: "Un server non ha bisogno di finestre: la memoria e il processore servono ai servizi che offre." },
            { t: "Perché Linux sui server non può installare un ambiente desktop", ok: false, why: "Si può installare, ma di solito non serve." },
            { t: "Perché la riga di comando è più sicura contro i guasti dell'hardware", ok: false, why: "L'interfaccia non protegge dai guasti." },
            { t: "Perché la grafica è vietata dalle licenze dei sistemi per server", ok: false, why: "Nessuna licenza vieta la grafica." }
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
            { t: "Sì: si installano più desktop e si sceglie quale usare all'accesso", ok: true, why: "L'ambiente desktop è un insieme di programmi come gli altri: si installa con il gestore dei pacchetti." },
            { t: "No: ogni distribuzione può avere un solo ambiente desktop, quello iniziale", ok: false, why: "Molte distribuzioni offrono anche versioni con desktop diversi (per esempio Kubuntu e Xubuntu per Ubuntu)." },
            { t: "Solo reinstallando da zero il sistema con un'altra edizione", ok: false, why: "Non serve reinstallare: basta aggiungere il pacchetto dell'ambiente desktop." },
            { t: "Solo comprando una licenza per il secondo ambiente desktop", ok: false, why: "Gli ambienti desktop per Linux sono liberi." }
        ]
    },
    {
        id: "4.1-09", type: "single", ref: "4.1_01#Tipi di Distribuzioni Linux",
        text: "Un'azienda vuole un sistema per i suoi server con aggiornamenti di sicurezza per molti anni e assistenza a pagamento. Quale scelta è più adatta?",
        options: [
            { t: "Una distribuzione commerciale, come Red Hat Enterprise Linux", ok: true, why: "Offrono supporto lungo e assistenza tecnica con contratto. In alternativa, una LTS gratuita come Ubuntu LTS o Debian stabile." },
            { t: "La versione beta più recente di una distribuzione molto usata", ok: false, why: "Le beta sono per le prove, non per i server di produzione." },
            { t: "Una distribuzione leggera pensata per il Raspberry Pi", ok: false, why: "È pensata per una scheda piccola, non per i server aziendali." },
            { t: "Qualsiasi distribuzione: hanno tutte lo stesso tipo di supporto", ok: false, why: "La durata del supporto cambia molto da una distribuzione all'altra." }
        ]
    },
    {
        id: "4.1-10", type: "single", ref: "4.1_01#Ciclo di Vita del Supporto Linux",
        text: "Che cos'è una distribuzione «rolling release», come Arch Linux?",
        options: [
            { t: "Si aggiorna di continuo, senza grandi versioni numerate", ok: true, why: "Invece di una nuova versione ogni tanto, i pacchetti si aggiornano man mano che escono: non c'è mai da «passare alla versione successiva»." },
            { t: "Esce con una versione nuova solo una volta ogni dieci anni", ok: false, why: "È il contrario: gli aggiornamenti arrivano di continuo." },
            { t: "Funziona solo da una chiavetta USB, senza installazione", ok: false, why: "Il modo di aggiornarsi non c'entra con dove è installata." },
            { t: "È una versione di prova che non va usata sul serio", ok: false, why: "Le distribuzioni rolling si usano davvero; le versioni di prova si chiamano beta." }
        ]
    },
    {
        id: "4.1-11", type: "single", ref: "4.1_01#Ciclo di Vita del Supporto Linux",
        text: "Che cosa vuol dire che una versione di una distribuzione è stabile?",
        options: [
            { t: "È stata provata a lungo e riceve solo correzioni", ok: true, why: "Nelle versioni stabili i programmi non cambiano di continuo: arrivano soprattutto aggiornamenti di sicurezza e correzioni." },
            { t: "Ha i programmi più recenti, usciti da pochi giorni", ok: false, why: "Le novità appena uscite sono nelle versioni di sviluppo o beta, non in quelle stabili." },
            { t: "Non riceve più nessun aggiornamento", ok: false, why: "Quella è una versione a fine supporto (End of Life), da non usare più." },
            { t: "Funziona solo sui computer vecchi", ok: false, why: "«Stabile» parla di affidabilità, non dell'età del computer." }
        ]
    },
    {
        id: "4.1-12", type: "single", ref: "4.1_01#Sistemi Operativi non Linux",
        text: "Quale di questi sistemi operativi è proprietario, cioè con il codice sorgente chiuso?",
        options: [
            { t: "Windows", ok: true, why: "Il codice di Windows è di Microsoft e non è pubblico; per usarlo serve una licenza." },
            { t: "Debian", ok: false, why: "Debian è una distribuzione Linux fatta di software libero." },
            { t: "FreeBSD", ok: false, why: "FreeBSD non è Linux, ma è anche lui open source, con la licenza BSD." },
            { t: "Fedora", ok: false, why: "Fedora è una distribuzione Linux libera, della comunità." }
        ]
    },
    {
        id: "4.1-13", type: "multiple", ref: "4.1_01#macOS",
        text: "Quali affermazioni su macOS sono vere?",
        options: [
            { t: "Ha un terminale con una shell simile a Bash (oggi zsh)", ok: true, why: "Essendo un discendente di Unix, macOS ha una riga di comando con molti comandi uguali a quelli di Linux." },
            { t: "Ufficialmente funziona solo sui computer Apple", ok: true, why: "La licenza di macOS permette di installarlo solo su hardware Apple." },
            { t: "Usa il kernel Linux", ok: false, why: "macOS ha il suo kernel, XNU, con parti che vengono da BSD." },
            { t: "È software libero con licenza GPL", ok: false, why: "macOS è proprietario: solo alcune sue parti sono open source." }
        ]
    },
    {
        id: "4.1-14", type: "fill", ref: "4.1_01#Tipi di Distribuzioni Linux", anyCase: true, placeholder: "una parola",
        text: "Quale distribuzione della comunità, sponsorizzata da Red Hat, prova per prima le novità che poi arrivano in Red Hat Enterprise Linux? (una parola)",
        answers: ["Fedora"],
        why: "Fedora esce spesso, con programmi recenti: le novità che funzionano bene vengono poi stabilizzate in Red Hat Enterprise Linux."
    },
    {
        id: "4.1-15", type: "single", ref: "4.1_01#Unix",
        text: "Che cosa vuol dire che Linux, come Unix, è un sistema multiutente?",
        options: [
            { t: "Ognuno ha il suo account e i suoi file, anche lavorando nello stesso momento", ok: true, why: "Più persone (e servizi) possono usare lo stesso sistema insieme, ciascuno con i propri permessi." },
            { t: "Va installato su un computer diverso per ogni persona che lo usa", ok: false, why: "È il contrario: un solo sistema serve più utenti." },
            { t: "Tutti gli utenti condividono lo stesso account e la stessa password", ok: false, why: "Ogni utente ha il suo account: è proprio quello che separa i file di ciascuno." },
            { t: "Ogni utente deve scegliere una distribuzione Linux diversa", ok: false, why: "Gli utenti condividono la stessa distribuzione; hanno account separati." }
        ]
    },

    // ---- 4.2 Comprendere l'Hardware del Computer ----
    {
        id: "4.2-01", type: "single", ref: "4.2_01#Driver e File di Dispositivo",
        text: "Che cosa indica di solito il file `/dev/sda`?",
        options: [
            { t: "Il primo disco SATA, SCSI o USB, per intero", ok: true, why: "I dischi si chiamano `sda`, `sdb`, `sdc`... nell'ordine in cui vengono trovati; le partizioni hanno un numero in fondo." },
            { t: "La prima partizione del primo disco del sistema", ok: false, why: "La prima partizione è `/dev/sda1`." },
            { t: "La scheda audio integrata nella scheda madre", ok: false, why: "I dispositivi audio hanno altri nomi, sotto `/dev/snd/`." },
            { t: "Una cartella con i dati personali dell'utente", ok: false, why: "`/dev` contiene file di dispositivo, non dati degli utenti." }
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
            { t: "L'SSD usa memoria flash, senza parti in movimento, ed è più veloce", ok: true, why: "Gli HDD costano meno per gigabyte, gli SSD sono più veloci, silenziosi e resistenti agli urti." },
            { t: "L'SSD perde tutti i dati quando si spegne il computer, come la RAM", ok: false, why: "Gli SSD conservano i dati senza corrente, come gli HDD." },
            { t: "Linux non può usare gli SSD, solo i dischi rigidi tradizionali", ok: false, why: "Linux li usa normalmente: compaiono come `/dev/sda` o, se NVMe, come `/dev/nvme0n1`." },
            { t: "Sono la stessa cosa: SSD e HDD sono due nomi per lo stesso disco", ok: false, why: "Funzionano in modo diverso." }
        ]
    },
    {
        id: "4.2-05", type: "single", ref: "4.2_01#Driver e File di Dispositivo",
        text: "Che cos'è un driver?",
        options: [
            { t: "Il software con cui il kernel comunica con un dispositivo", ok: true, why: "Molti driver sono già inclusi nel kernel Linux e si caricano da soli quando il dispositivo viene trovato." },
            { t: "Il cavo che collega il dispositivo alla scheda madre del computer", ok: false, why: "Il driver è software, non un pezzo di hardware." },
            { t: "Un programma che serve a guidare il puntatore del mouse", ok: false, why: "Esistono driver anche per il mouse, ma il termine vale per qualsiasi dispositivo." },
            { t: "L'utente che sta usando il computer in quel momento", ok: false, why: "In informatica «driver» indica il software di un dispositivo." }
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
            { t: "Trasforma la corrente della presa in quella usata dai componenti", ok: true, why: "Fornisce per esempio 12 V, 5 V e 3,3 V alla scheda madre, ai dischi e alla scheda video." },
            { t: "Tiene acceso il computer quando manca la corrente", ok: false, why: "Questo lo fa un gruppo di continuità (UPS), un apparecchio esterno." },
            { t: "Raffredda il processore e la scheda video con la sua ventola", ok: false, why: "Ha una ventola per sé, ma il processore ha il suo dissipatore." },
            { t: "Conserva le impostazioni del BIOS quando il computer è spento", ok: false, why: "Lo fa una piccola memoria sulla scheda madre, con la sua pila." }
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
            { t: "Ha sempre il doppio dei core del processore", ok: false, why: "Il numero di core non dipende dai bit dell'architettura." },
            { t: "Non si scalda mai", ok: false, why: "Tutti i processori producono calore." },
            { t: "Funziona senza sistema operativo", ok: false, why: "Qualsiasi processore ha bisogno di un sistema operativo per far girare i programmi." }
        ]
    },
    {
        id: "4.2-10", type: "single", ref: "4.2_01#Scheda Madre",
        text: "Che cos'è la scheda madre?",
        options: [
            { t: "Il circuito principale che collega processore, RAM e dischi", ok: true, why: "Tutti i componenti si collegano alla scheda madre, che li fa comunicare." },
            { t: "La scheda video principale, quella collegata al monitor", ok: false, why: "La scheda video si collega alla scheda madre, oppure è integrata nel processore." },
            { t: "Il disco su cui è installato il sistema operativo", ok: false, why: "Il disco è un componente separato." },
            { t: "La prima partizione del disco, da cui parte il sistema", ok: false, why: "Le partizioni sono parti di un disco, non hardware." }
        ]
    },
    {
        id: "4.2-11", type: "single", ref: "4.2_01#Partitizioni",
        text: "Che cos'è una partizione?",
        options: [
            { t: "Una parte di un disco, con il suo file system", ok: true, why: "Per esempio un disco può avere una partizione per il sistema, una per i dati degli utenti e una di swap." },
            { t: "Un disco esterno collegato al computer via USB", ok: false, why: "Un disco esterno è un dispositivo; anche lui può essere diviso in partizioni." },
            { t: "Una cartella condivisa in rete con altri utenti", ok: false, why: "Le partizioni stanno sui dischi, non in rete." },
            { t: "Una copia di sicurezza di tutto il disco", ok: false, why: "Una copia di sicurezza è un backup." }
        ]
    },
    {
        id: "4.2-12", type: "single", ref: "4.2_01#Memoria",
        text: "Che cos'è lo spazio di swap?",
        options: [
            { t: "Spazio sul disco che il sistema usa come RAM quando la memoria si riempie", ok: true, why: "Le parti di memoria usate meno vengono spostate sul disco, che però è molto più lento della RAM." },
            { t: "Una memoria molto veloce che si trova dentro il processore", ok: false, why: "Quella è la cache del processore." },
            { t: "La piccola memoria che conserva le impostazioni del firmware", ok: false, why: "Le impostazioni del BIOS o UEFI stanno in una memoria della scheda madre, non nello swap." },
            { t: "Una copia di riserva di tutto il disco, fatta ogni notte", ok: false, why: "Lo swap non è un backup: si svuota e si riempie mentre il sistema lavora." }
        ]
    },
    {
        id: "4.2-13", type: "multiple", ref: "4.2_01#Archiviazione",
        text: "Quali di questi componenti conservano i dati anche a computer spento?",
        options: [
            { t: "Un disco rigido (HDD)", ok: true, why: "I dati restano sui dischi magnetici anche senza corrente." },
            { t: "Un disco a stato solido (SSD)", ok: true, why: "Usa una memoria flash, che non perde i dati allo spegnimento." },
            { t: "Una chiavetta USB", ok: true, why: "Anche lei usa memoria flash, come gli SSD." },
            { t: "La RAM", ok: false, why: "La RAM si svuota quando manca la corrente." },
            { t: "La cache del processore", ok: false, why: "Anche la cache perde il contenuto allo spegnimento." }
        ]
    },
    {
        id: "4.2-14", type: "single", ref: "4.2_01#Processori",
        text: "Un processore ha 4 core. Che cosa vuol dire?",
        options: [
            { t: "Ha quattro unità di calcolo che lavorano in parallelo", ok: true, why: "Ogni core esegue istruzioni per conto suo: il sistema può far lavorare quattro programmi (o parti di programma) insieme." },
            { t: "È quattro volte più veloce di un processore a 1 GHz", ok: false, why: "La frequenza (GHz) e il numero di core sono due cose diverse." },
            { t: "Ha 4 GB di memoria RAM al suo interno", ok: false, why: "La RAM è su moduli separati, montati sulla scheda madre." },
            { t: "Può far girare al massimo quattro programmi", ok: false, why: "Il sistema alterna i programmi molto in fretta: ne girano centinaia anche con un solo core." }
        ]
    },
    {
        id: "4.2-15", type: "fill", ref: "4.2_01#Processori", placeholder: "percorso",
        text: "In quale file di `/proc` Linux mostra le informazioni sul processore, come modello e numero di core? (percorso completo)",
        answers: ["/proc/cpuinfo"],
        pattern: "^(cat |less )?/proc/cpuinfo$",
        alsoAccepted: ["cat /proc/cpuinfo"],
        why: "`/proc/cpuinfo` non è un file vero sul disco: il kernel lo prepara al momento. `cat /proc/cpuinfo` mostra un blocco per ogni core."
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
            { t: "I file per l'avvio: il kernel (`vmlinuz`) e l'initrd", ok: true, why: "Il boot loader (come GRUB) li legge da qui per avviare Linux." },
            { t: "I programmi che partono quando l'utente accede al desktop", ok: false, why: "Quei programmi non stanno in `/boot`." },
            { t: "I file di log che registrano tutto quello che succede all'avvio", ok: false, why: "I log stanno in `/var/log` o nel journal." },
            { t: "Le directory personali degli utenti e i loro documenti", ok: false, why: "Stanno in `/home`." }
        ]
    },
    {
        id: "4.3-04", type: "single", ref: "4.3_01#La Directory /proc",
        text: "Che cos'è la directory `/proc`?",
        options: [
            { t: "Un file system virtuale del kernel su processi e sistema", ok: true, why: "Per esempio `/proc/cpuinfo` descrive il processore e ogni processo ha una directory col suo numero (`/proc/1234`)." },
            { t: "La directory dove sono installati i programmi di tutti gli utenti", ok: false, why: "I programmi stanno in `/usr/bin`, `/bin` e simili." },
            { t: "Una directory per i file temporanei, svuotata a ogni riavvio", ok: false, why: "Quella è `/tmp`." },
            { t: "La copia di riserva della configurazione, aggiornata ogni notte", ok: false, why: "La configurazione sta in `/etc`." }
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
            { t: "`top` si aggiorna in tempo reale; `ps` fa una fotografia e termina", ok: true, why: "Da `top` si esce con `q`; `ps` è comodo negli script e con le pipe." },
            { t: "`top` mostra solo il processo più pesante, `ps` tutti", ok: false, why: "`top` mostra tanti processi, ordinati di solito per uso del processore." },
            { t: "`ps` mostra la memoria del disco, `top` quella della RAM", ok: false, why: "Tutti e due parlano di processi." },
            { t: "Nessuna: sono due nomi dello stesso comando, come `ls` e `dir`", ok: false, why: "Mostrano informazioni simili in modo diverso." }
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
            { t: "I messaggi del kernel, per esempio sull'hardware trovato", ok: true, why: "Il kernel tiene i suoi messaggi in un'area di memoria (ring buffer) che `dmesg` legge." },
            { t: "I messaggi di posta elettronica arrivati all'utente root", ok: false, why: "La posta non c'entra." },
            { t: "Gli utenti collegati in questo momento e da dove", ok: false, why: "Gli utenti collegati si vedono con `who` o `w`." },
            { t: "Lo spazio libero e occupato su tutti i dischi", ok: false, why: "Lo spazio libero si vede con `df`." }
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
            { t: "Il carico medio del sistema su 1, 5 e 15 minuti", ok: true, why: "Indicano in media quanti processi erano in esecuzione o in attesa: si confrontano con il numero di core." },
            { t: "La percentuale di RAM, swap e disco usati in questo momento", ok: false, why: "La memoria si vede con `free`, i dischi con `df`." },
            { t: "La temperatura dei tre core più caldi del processore", ok: false, why: "Il carico non è una temperatura." },
            { t: "I megabyte scaricati dalla rete negli ultimi minuti", ok: false, why: "Il carico riguarda i processi, non la rete." }
        ]
    },
    {
        id: "4.3-11", type: "single", ref: "4.3_02#Log con il Demone syslog",
        text: "Che cosa fa un demone di syslog, come rsyslog?",
        options: [
            { t: "Raccoglie i messaggi del sistema e li scrive nei log in `/var/log`", ok: true, why: "I programmi gli mandano i messaggi; lui li smista nei file secondo la configurazione." },
            { t: "Sincronizza l'orologio del computer con un server su Internet", ok: false, why: "Per l'orologio si usano servizi NTP." },
            { t: "Cancella i log troppo vecchi per liberare spazio sul disco", ok: false, why: "Lo fa di solito `logrotate`." },
            { t: "Invia e riceve la posta elettronica degli utenti del sistema", ok: false, why: "La posta la gestisce un server di posta." }
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
            { t: "Il numero che identifica un processo in esecuzione", ok: true, why: "Ogni processo ha un PID diverso; si vede con `ps` o `top` e serve per esempio per terminarlo con `kill`." },
            { t: "La password segreta con cui il processo si protegge", ok: false, why: "I processi non hanno password." },
            { t: "Il nome del file del programma che il processo esegue", ok: false, why: "Il nome è un'altra informazione: il PID è un numero." },
            { t: "La priorità del processo, da -20 a 19", ok: false, why: "La priorità si chiama nice/PRI; il PID è l'identificativo." }
        ]
    },
    {
        id: "4.3-14", type: "single", ref: "4.3_01#Dove sono Memorizzati i File Binari",
        text: "Dove si trovano di solito i programmi (i file binari) che usano tutti gli utenti, come `ls` o `grep`?",
        options: [
            { t: "In `/usr/bin`", ok: true, why: "In `/usr/bin` (e in `/bin`, che oggi spesso è un link a `/usr/bin`): sono nel `PATH` di tutti. I comandi per l'amministrazione stanno invece in `/usr/sbin` e `/sbin`." },
            { t: "In `/etc`", ok: false, why: "`/etc` contiene configurazione." },
            { t: "In `/home/bin`", ok: false, why: "`/home` contiene le directory degli utenti." },
            { t: "In `/var`", ok: false, why: "`/var` contiene dati che cambiano, come log e code." }
        ]
    },
    {
        id: "4.3-15", type: "single", ref: "4.3_01#Memoria e Tipi di Memoria",
        text: "Che cos'è lo swap?",
        options: [
            { t: "Spazio su disco usato come memoria quando la RAM non basta", ok: true, why: "È molto più lento della RAM: se il sistema lo usa tanto, di solito serve più memoria." },
            { t: "Una memoria più veloce della RAM, dentro il processore", ok: false, why: "È più lento: sta su disco." },
            { t: "Un programma per scambiare file tra gli utenti dello stesso computer", ok: false, why: "Swap riguarda la memoria." },
            { t: "La memoria della scheda video, usata per le immagini", ok: false, why: "La scheda video ha la sua memoria, che non si chiama swap." }
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
            { t: "I server DNS da usare, nelle righe `nameserver`", ok: true, why: "Il sistema chiede a quei server di tradurre i nomi (come lpi.org) in indirizzi IP." },
            { t: "I nomi e gli indirizzi di posta degli utenti", ok: false, why: "Gli utenti sono in `/etc/passwd`." },
            { t: "La risoluzione dello schermo", ok: false, why: "«resolv» viene da «resolver»: risolvere i nomi in rete." },
            { t: "Le password delle reti Wi-Fi conosciute", ok: false, why: "Le reti Wi-Fi si configurano altrove, per esempio con NetworkManager." }
        ]
    },
    {
        id: "4.4-03", type: "single", ref: "4.4_01#DNS",
        text: "A che cosa serve il file `/etc/hosts`?",
        options: [
            { t: "Ad associare nomi e indirizzi IP sul computer, prima del DNS", ok: true, why: "Per esempio la riga `192.168.1.10 nas` permette di scrivere `ping nas`." },
            { t: "Ad elencare chi può collegarsi da altri computer", ok: false, why: "Non riguarda gli utenti." },
            { t: "A bloccare tutti i siti web, tranne quelli scritti nel file", ok: false, why: "Si può usare per «dirottare» qualche nome, ma il suo scopo è associare nomi e indirizzi." },
            { t: "A scegliere i server DNS da usare per tradurre i nomi", ok: false, why: "I server DNS sono in `/etc/resolv.conf`." }
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
            { t: "256", ok: false, why: "256 bit non è la lunghezza di nessun indirizzo IP: IPv6 ne ha 128, IPv4 32 (e un indirizzo MAC 48)." }
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
            { t: "Che il gateway predefinito, verso Internet, è 192.168.1.1", ok: true, why: "Il gateway predefinito è di solito il router di casa o dell'ufficio." },
            { t: "Che l'indirizzo IP di questo computer è 192.168.1.1", ok: false, why: "L'indirizzo del computer si vede con `ip addr show`." },
            { t: "Che il server DNS da usare per i nomi è 192.168.1.1", ok: false, why: "Il DNS è in `/etc/resolv.conf` (anche se spesso il router fa entrambe le cose)." },
            { t: "Che la scheda `eth0` è spenta e va riaccesa con `ip link set`", ok: false, why: "La riga dice solo quale scheda si usa per arrivare al gateway." }
        ]
    },
    {
        id: "4.4-08", type: "single", ref: "4.4_01#Socket",
        text: "A che cosa servono `ss` e il più vecchio `netstat`?",
        options: [
            { t: "A vedere le connessioni e le porte in ascolto (i socket)", ok: true, why: "Per esempio `ss -tln` mostra le porte TCP su cui un servizio aspetta connessioni." },
            { t: "A misurare la velocità della connessione a Internet", ok: false, why: "Non fanno test di velocità." },
            { t: "A configurare il Wi-Fi e scegliere la rete", ok: false, why: "Mostrano lo stato delle connessioni, non configurano le reti." },
            { t: "A tradurre i nomi dei siti in indirizzi IP", ok: false, why: "Lo fanno il DNS e comandi come `host`." }
        ]
    },
    {
        id: "4.4-09", type: "single", ref: "4.4_01#DNS",
        text: "Che cosa fa `host www.lpi.org`?",
        options: [
            { t: "Chiede al DNS l'indirizzo IP corrispondente al nome", ok: true, why: "È il modo più semplice per controllare se la risoluzione dei nomi funziona." },
            { t: "Apre il sito www.lpi.org nel browser predefinito", ok: false, why: "`host` lavora solo nel terminale." },
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
            { t: "Un numero di 48 bit della scheda, usato nella rete locale", ok: true, why: "Si scrive con sei coppie esadecimali, per esempio `52:54:00:12:34:56`; si vede con `ip link show`." },
            { t: "L'indirizzo IP che hanno i computer Apple, i Mac", ok: false, why: "MAC (Media Access Control) non ha niente a che fare con i Mac di Apple." },
            { t: "L'indirizzo IP pubblico assegnato dal fornitore di Internet", ok: false, why: "L'indirizzo IP è un'altra cosa, di un altro livello della rete." },
            { t: "Il nome del computer in rete, scelto durante l'installazione", ok: false, why: "Il nome è l'hostname." }
        ]
    },
    {
        id: "4.4-12", type: "single", ref: "4.4_01#Indirizzi IPv4",
        text: "Che cosa indica l'indirizzo `127.0.0.1`?",
        options: [
            { t: "Il computer stesso (loopback, o localhost)", ok: true, why: "Serve ai programmi per parlarsi sullo stesso computer; in IPv6 è `::1`." },
            { t: "Il router di casa, che porta verso Internet", ok: false, why: "Il router ha di solito un indirizzo privato come 192.168.1.1." },
            { t: "Il primo server DNS di Internet", ok: false, why: "È un indirizzo locale, non porta fuori dal computer." },
            { t: "Un indirizzo non valido, che nessuno può usare", ok: false, why: "È valido e sempre presente." }
        ]
    },
    {
        id: "4.4-13", type: "single", ref: "4.4_01#Indirizzi IPv6",
        text: "Che cosa vuol dire `::` in un indirizzo IPv6 come `2001:db8::1`?",
        options: [
            { t: "Sta per uno o più gruppi di zeri (si usa una volta sola)", ok: true, why: "Così `2001:db8:0:0:0:0:0:1` si scrive più breve. Anche gli zeri iniziali di ogni gruppo si possono omettere." },
            { t: "Separa l'indirizzo IP dal numero della porta, come in `:80`", ok: false, why: "Per la porta un indirizzo IPv6 si scrive tra parentesi quadre, per esempio `[2001:db8::1]:80`." },
            { t: "Indica che l'indirizzo è privato e non esce su Internet", ok: false, why: "Indica solo una parte di zeri." },
            { t: "È un errore di battitura: gli indirizzi non hanno mai `::`", ok: false, why: "È una forma abbreviata normale." }
        ]
    },
    {
        id: "4.4-14", type: "fill", ref: "4.4_01#Routing IPv4", placeholder: "comando",
        text: "Scrivi il comando moderno (con `ip`) che mostra la tabella di routing.",
        answers: ["ip route show", "ip route", "ip r", "ip route list", "ip r show", "ip r list"],
        why: "`ip route show` elenca le reti raggiungibili e il gateway predefinito; il comando più vecchio è `route`."
    },
    {
        id: "4.4-15", type: "single", ref: "4.4_01#Sottoreti IPv4",
        text: "`ifconfig` mostra `inet 192.168.1.50  netmask 255.255.255.0`. Come si scrive lo stesso indirizzo nella forma che usa `ip addr`?",
        options: [
            { t: "`192.168.1.50/24`", ok: true, why: "La maschera 255.255.255.0 ha 24 bit a 1 (tre volte 8): nella notazione CIDR si scrive `/24`. La rete è 192.168.1.0/24." },
            { t: "`192.168.1.50/255`", ok: false, why: "Dopo la barra va il numero dei bit della maschera, non l'ultimo numero della maschera." },
            { t: "`192.168.1.50/8`", ok: false, why: "`/8` corrisponde alla maschera 255.0.0.0." },
            { t: "`192.168.1.0/50`", ok: false, why: "Un indirizzo IPv4 ha 32 bit: un prefisso di 50 non esiste." }
        ]
    },
    {
        id: "4.4-16", type: "single", ref: "4.4_01#Routing IPv4",
        text: "In `route -n` c'è la riga `0.0.0.0  192.168.1.1  0.0.0.0  UG  100 0 0 enp0s3`. Che cosa vuol dire?",
        options: [
            { t: "Che il gateway predefinito è 192.168.1.1", ok: true, why: "La destinazione `0.0.0.0` con maschera `0.0.0.0` vale per tutte le reti non indicate altrove: è la riga `default`. La `G` dei flag dice che si passa da un gateway, `U` che la rotta è attiva." },
            { t: "Che l'indirizzo IP del computer è 192.168.1.1", ok: false, why: "L'indirizzo del computer si vede con `ip addr` o `ifconfig`; in questa colonna c'è il router da cui passare." },
            { t: "Che la scheda `enp0s3` non ha un indirizzo", ok: false, why: "`0.0.0.0` qui indica «tutte le destinazioni», non un indirizzo mancante." },
            { t: "Che il traffico per 192.168.1.1 è bloccato", ok: false, why: "`route` non blocca niente: dice soltanto dove mandare i pacchetti." }
        ]
    },
    {
        id: "4.4-17", type: "fill", ref: "4.4_01#Routing IPv4", placeholder: "comando",
        text: "Scrivi il comando storico (pacchetto net-tools) che mostra la tabella di instradamento con gli indirizzi in numeri, senza tradurli in nomi.",
        answers: ["route -n", "netstat -rn", "netstat -nr"],
        pattern: "^(route -n|netstat -(rn|nr)|netstat -r -n|netstat -n -r)$",
        alsoAccepted: ["netstat -r -n", "netstat -n -r"],
        notAccepted: ["route", "ip route show", "netstat -tln", "route -r"],
        why: "`route -n` mostra le rotte con i numeri; `netstat -rn` fa lo stesso. Il comando moderno è `ip route show`. Senza `-n` si vedono nomi come `default` e `_gateway`."
    },
    {
        id: "4.4-18", type: "single", ref: "4.4_01#Configurazione di Indirizzi IPv4",
        text: "Su molte distribuzioni recenti `ifconfig` risponde «comando non trovato». Perché?",
        options: [
            { t: "Fa parte del vecchio pacchetto net-tools", ok: true, why: "`ifconfig`, `route` e `netstat` vengono da net-tools, che spesso non si installa più. Al loro posto ci sono `ip addr`, `ip route` e `ss` (iproute2); net-tools si può comunque installare." },
            { t: "Serve sempre `sudo`, anche solo per leggere", ok: false, why: "Per guardare la configurazione `ifconfig` non richiede root; il messaggio «comando non trovato» vuol dire che il programma non c'è." },
            { t: "Funziona solo con le reti Wi-Fi, non via cavo", ok: false, why: "`ifconfig` mostra tutte le interfacce, via cavo e senza fili." },
            { t: "È stato rinominato `ipconfig`", ok: false, why: "`ipconfig` è il comando di Windows; su Linux il sostituto è `ip`." }
        ]
    },
    {
        id: "4.4-19", type: "single", ref: "4.4_01#Routing IPv4",
        text: "Che cosa cambia l'opzione `-n` in `route -n` (e in `netstat -n`)?",
        options: [
            { t: "Mostra i numeri senza tradurli in nomi", ok: true, why: "Senza `-n` il comando prova a tradurre indirizzi e porte in nomi (per esempio `default` o `_gateway`), e se il DNS è lento aspetta. Con `-n` mostra subito i numeri." },
            { t: "Mostra solo le rotte aggiunte di recente", ok: false, why: "`route` non tiene la data delle rotte: `-n` riguarda solo come vengono scritte." },
            { t: "Elimina le rotte che non servono più", ok: false, why: "Per togliere una rotta si usa `route del` (o `ip route del`), come root." },
            { t: "Conta le rotte e ne scrive il numero", ok: false, why: "La `n` sta per «numerico», non per «numero di righe»." }
        ]
    },
    {
        id: "4.4-20", type: "multiple", ref: "4.4_01#Configurazione di Indirizzi IPv4",
        text: "Quali comandi mostrano gli indirizzi IP assegnati alle schede di rete del computer?",
        options: [
            { t: "`ip addr show`", ok: true, why: "È il comando moderno: per ogni scheda mostra le righe `inet` (IPv4) e `inet6` (IPv6)." },
            { t: "`ifconfig`", ok: true, why: "Il comando storico di net-tools: mostra `inet`, `netmask` e `broadcast` di ogni scheda." },
            { t: "`route -n`", ok: false, why: "`route` mostra la tabella di instradamento, cioè dove vanno i pacchetti, non gli indirizzi delle schede." },
            { t: "`ss -tln`", ok: false, why: "`ss` mostra le porte in ascolto e le connessioni." },
            { t: "`host lpi.org`", ok: false, why: "`host` chiede al DNS l'indirizzo di un nome, non quelli del tuo computer." }
        ]
    }
]);
