// Domande dell'argomento 1: La Comunità Linux e una Carriera nell'Open Source.
// Scritte da zero per questa app, partendo dagli obiettivi d'esame (non dalle lezioni LPI).
// Formato: vedi quiz.js e tools/check-questions.js. Nei testi, `così` diventa codice.
addQuestions("010-160", [
    // ---- 1.1 Evoluzione di Linux e Sistemi Operativi più Diffusi ----
    {
        id: "1.1-01", type: "single", ref: "1.1_01#Distribuzioni",
        text: "Chi ha scritto la prima versione del kernel Linux, nel 1991?",
        options: [
            { t: "Linus Torvalds", ok: true, why: "Era uno studente finlandese: annunciò il suo kernel nel 1991 e ne coordina ancora lo sviluppo." },
            { t: "Richard Stallman", ok: false, why: "Stallman ha avviato il progetto GNU e la Free Software Foundation, non il kernel Linux." },
            { t: "Ken Thompson", ok: false, why: "Thompson, con Dennis Ritchie, ha creato Unix ai Bell Labs negli anni '70." },
            { t: "Bill Gates", ok: false, why: "Gates ha fondato Microsoft; con Linux non c'entra." }
        ]
    },
    {
        id: "1.1-02", type: "single", ref: "1.1_01#Distribuzioni",
        text: "Quale di queste distribuzioni deriva direttamente da Debian?",
        options: [
            { t: "Ubuntu", ok: true, why: "Ubuntu parte dai pacchetti di Debian e usa lo stesso formato `.deb` con `apt`." },
            { t: "CentOS", ok: false, why: "CentOS è ricostruita dai sorgenti di Red Hat Enterprise Linux e usa i pacchetti RPM." },
            { t: "openSUSE", ok: false, why: "openSUSE è la versione comunitaria di SUSE e usa i pacchetti RPM." },
            { t: "Scientific Linux", ok: false, why: "Scientific Linux era ricostruita da Red Hat Enterprise Linux." }
        ]
    },
    {
        id: "1.1-03", type: "multiple", ref: "1.1_01#Distribuzioni",
        text: "Quali di queste distribuzioni usano i pacchetti RPM?",
        options: [
            { t: "CentOS", ok: true, why: "Viene da Red Hat, che ha inventato il formato RPM (Red Hat Package Manager)." },
            { t: "openSUSE", ok: true, why: "Anche la famiglia SUSE usa RPM, con lo strumento `zypper`." },
            { t: "Debian", ok: false, why: "Debian usa i pacchetti `.deb`, gestiti con `dpkg` e `apt`." },
            { t: "Linux Mint", ok: false, why: "Linux Mint deriva da Ubuntu, quindi usa i pacchetti `.deb`." },
            { t: "Raspbian", ok: false, why: "Raspbian deriva da Debian e usa i pacchetti `.deb`." }
        ]
    },
    {
        id: "1.1-04", type: "single", ref: "1.1_01#Distribuzioni",
        text: "Che cosa vuol dire la sigla LTS in «Ubuntu 24.04 LTS»?",
        options: [
            { t: "Long Term Support: la versione riceve aggiornamenti per molti anni", ok: true, why: "Le versioni LTS di Ubuntu escono ogni due anni e hanno anni di aggiornamenti di sicurezza: sono adatte ai server e a chi non vuole aggiornare spesso." },
            { t: "Linux Terminal Server: la versione senza interfaccia grafica", ok: false, why: "LTS non indica l'assenza della grafica: esistono versioni LTS sia desktop sia server." },
            { t: "Latest Test Snapshot: una versione di prova", ok: false, why: "È il contrario: le LTS sono le versioni più stabili, pensate per durare." },
            { t: "Light Template System: una versione leggera per computer vecchi", ok: false, why: "Non è una variante leggera: indica solo la durata del supporto." }
        ]
    },
    {
        id: "1.1-05", type: "single", ref: "1.1_01#Raspbian e il Raspberry Pi",
        text: "Che cos'è Raspbian?",
        options: [
            { t: "Il sistema operativo basato su Debian pensato per il Raspberry Pi", ok: true, why: "Il Raspberry Pi è un computer piccolo ed economico; Raspbian (oggi chiamato Raspberry Pi OS) è la sua distribuzione ufficiale, derivata da Debian." },
            { t: "La versione di Android per i tablet", ok: false, why: "Android è un sistema diverso, di Google; Raspbian è una distribuzione GNU/Linux." },
            { t: "Una distribuzione per i grandi server nel cloud", ok: false, why: "È pensata per una scheda piccola, usata per imparare e per progetti come la domotica." },
            { t: "Un emulatore che fa girare Windows su Linux", ok: false, why: "Raspbian è un sistema operativo completo, non un emulatore." }
        ]
    },
    {
        id: "1.1-06", type: "single", ref: "1.1_01#Android",
        text: "Che rapporto c'è tra Android e Linux?",
        options: [
            { t: "Android usa il kernel Linux, ma ha programmi e librerie diversi da quelli di una distribuzione GNU/Linux", ok: true, why: "Il cuore di Android è un kernel Linux modificato; sopra però non ci sono gli strumenti GNU né i pacchetti delle distribuzioni." },
            { t: "Android è una distribuzione GNU/Linux uguale a Ubuntu, solo per telefoni", ok: false, why: "Su Android non ci sono `apt`, Bash o le librerie GNU come in Ubuntu: le app sono costruite in un altro modo." },
            { t: "Android non ha niente a che fare con Linux", ok: false, why: "Il kernel di Android è proprio Linux: per questo è il sistema con kernel Linux più diffuso al mondo." },
            { t: "Android è il nome del kernel Linux per i processori ARM", ok: false, why: "Il kernel resta Linux anche su ARM; Android è un sistema operativo completo, sviluppato da Google." }
        ]
    },
    {
        id: "1.1-07", type: "multiple", ref: "1.1_01#Sistemi Integrati",
        text: "Quali di questi dispositivi sono esempi tipici di sistemi integrati (embedded) che spesso funzionano con Linux?",
        options: [
            { t: "Il router Wi-Fi di casa", ok: true, why: "Molti router hanno dentro un piccolo Linux che fa un solo lavoro: gestire la rete." },
            { t: "Una smart TV", ok: true, why: "Molti televisori usano Linux (o Android, che ha il kernel Linux) per i menu e le app." },
            { t: "Un computer da scrivania con Linux Mint", ok: false, why: "Un PC da scrivania è un computer per uso generale, non un sistema integrato con un compito preciso." },
            { t: "Un server web in un centro dati", ok: false, why: "Un server è un computer per uso generale; i sistemi integrati sono dentro apparecchi con una funzione specifica." },
            { t: "Un portatile con Windows", ok: false, why: "È un computer per uso generale, e per di più non usa Linux." }
        ]
    },
    {
        id: "1.1-08", type: "single", ref: "1.1_01#Distribuzioni",
        text: "Qual è la differenza tra openSUSE e SUSE Linux Enterprise?",
        options: [
            { t: "openSUSE è gratuita e sviluppata dalla comunità; SUSE Linux Enterprise è commerciale, con supporto a pagamento", ok: true, why: "È lo stesso schema di Fedora e Red Hat Enterprise Linux: una versione comunitaria e una per le aziende." },
            { t: "openSUSE usa i pacchetti `.deb`, SUSE Linux Enterprise gli RPM", ok: false, why: "Entrambe usano i pacchetti RPM." },
            { t: "openSUSE è per i server, SUSE Linux Enterprise solo per i telefoni", ok: false, why: "Nessuna delle due è per telefoni: tutte e due funzionano su desktop e server." },
            { t: "Non c'è differenza: sono due nomi della stessa distribuzione", ok: false, why: "Sono prodotti distinti, con cicli di rilascio e supporto diversi." }
        ]
    },
    {
        id: "1.1-09", type: "fill", ref: "1.1_01#Distribuzioni", anyCase: true, placeholder: "nome della distribuzione",
        text: "Quale distribuzione gratuita era ricostruita dai sorgenti di Red Hat Enterprise Linux, senza il marchio Red Hat, ed è molto diffusa sui server? (una parola)",
        answers: ["CentOS"],
        why: "CentOS (Community Enterprise Operating System) offriva gratis lo stesso software di Red Hat Enterprise Linux. Oggi esiste come CentOS Stream; per l'esame basta ricordarla come «la RHEL della comunità»."
    },
    {
        id: "1.1-10", type: "single", ref: "1.1_01#Linux e Cloud",
        text: "Perché Linux è il sistema più usato nel cloud?",
        options: [
            { t: "Perché è gratuito anche su migliaia di macchine, si adatta bene alla virtualizzazione e si può modificare", ok: true, why: "Chi gestisce un cloud avvia moltissime macchine virtuali: con Linux non paga una licenza per ognuna e può adattare il sistema." },
            { t: "Perché è l'unico sistema che può girare in una macchina virtuale", ok: false, why: "Anche Windows e altri sistemi girano in macchine virtuali; Linux è scelto per costi e flessibilità." },
            { t: "Perché nel cloud i sistemi con licenza commerciale sono vietati", ok: false, why: "Non c'è nessun divieto: nel cloud si possono usare anche sistemi commerciali, pagandone la licenza." },
            { t: "Perché nel cloud serve sempre l'interfaccia grafica", ok: false, why: "È il contrario: i server nel cloud di solito non hanno interfaccia grafica e si gestiscono dalla riga di comando." }
        ]
    },

    // ---- 1.2 Principali Applicazioni Open Source ----
    {
        id: "1.2-01", type: "single", ref: "1.2_01#Installazione di un Pacchetto",
        text: "Su Debian o Ubuntu, quale comando installa un programma dai repository, scaricando anche i pacchetti di cui ha bisogno?",
        options: [
            { t: "`apt-get install`", ok: true, why: "`apt-get` (o `apt`) scarica il pacchetto dai repository e risolve le dipendenze da solo." },
            { t: "`dpkg -i`", ok: false, why: "`dpkg -i` installa un file `.deb` già scaricato, ma non va a cercare le dipendenze nei repository." },
            { t: "`rpm -i`", ok: false, why: "`rpm` è lo strumento dei pacchetti RPM (Red Hat, SUSE), non di Debian." },
            { t: "`yum install`", ok: false, why: "`yum` è il gestore delle distribuzioni Red Hat e CentOS." }
        ]
    },
    {
        id: "1.2-02", type: "single", ref: "1.2_01#Pacchetti Software",
        text: "Hai già scaricato il file `editor_2.0_amd64.deb`. Quale strumento, a basso livello, lo installa senza andare su Internet a cercare altri pacchetti?",
        options: [
            { t: "`dpkg`", ok: true, why: "`dpkg -i editor_2.0_amd64.deb` installa il file; se mancano dipendenze si ferma e lo segnala." },
            { t: "`yum`", ok: false, why: "`yum` lavora con i pacchetti RPM, non con i `.deb`." },
            { t: "`zypper`", ok: false, why: "`zypper` è il gestore dei pacchetti di openSUSE (RPM)." },
            { t: "`tar`", ok: false, why: "`tar` crea ed estrae archivi, ma non installa pacchetti né li registra nel sistema." }
        ]
    },
    {
        id: "1.2-03", type: "multiple", ref: "1.2_01#Pacchetti Software",
        text: "Quali comandi servono a gestire i pacchetti RPM?",
        options: [
            { t: "`rpm`", ok: true, why: "È lo strumento di base: installa, rimuove e interroga i file `.rpm`." },
            { t: "`yum`", ok: true, why: "È il gestore di alto livello di Red Hat e CentOS: scarica dai repository e risolve le dipendenze." },
            { t: "`dpkg`", ok: false, why: "`dpkg` è lo strumento di base per i pacchetti `.deb` di Debian." },
            { t: "`apt-get`", ok: false, why: "`apt-get` è il gestore di alto livello per i pacchetti `.deb`." },
            { t: "`gzip`", ok: false, why: "`gzip` comprime file, non gestisce pacchetti." }
        ]
    },
    {
        id: "1.2-04", type: "fill", ref: "1.2_01#Rimozione di un Pacchetto", placeholder: "parola mancante",
        text: "Su CentOS, completa il comando che toglie dal sistema il pacchetto `nginx`: `yum ______ nginx`",
        answers: ["remove", "erase"],
        why: "`yum remove nginx` (o il sinonimo `yum erase`) disinstalla il pacchetto. Su Debian e Ubuntu l'equivalente è `apt-get remove nginx`."
    },
    {
        id: "1.2-05", type: "single", ref: "1.2_01#Applicazioni per Ufficio",
        text: "Quale di questi programmi è una suite per ufficio open source, con videoscrittura, fogli di calcolo e presentazioni?",
        options: [
            { t: "LibreOffice", ok: true, why: "LibreOffice comprende Writer (testi), Calc (fogli di calcolo), Impress (presentazioni) e altro." },
            { t: "GIMP", ok: false, why: "GIMP serve a modificare immagini e fotografie." },
            { t: "Thunderbird", ok: false, why: "Thunderbird è un programma di posta elettronica." },
            { t: "Apache HTTPD", ok: false, why: "Apache è un server web." }
        ]
    },
    {
        id: "1.2-06", type: "single", ref: "1.2_01#Applicazioni per Ufficio",
        text: "Che rapporto c'è tra OpenOffice.org e LibreOffice?",
        options: [
            { t: "LibreOffice è nato nel 2010 da una copia (fork) del codice di OpenOffice.org, ed è oggi il più sviluppato", ok: true, why: "Una parte della comunità lasciò OpenOffice.org e continuò lo sviluppo con il nome LibreOffice. È l'esempio classico di fork." },
            { t: "OpenOffice.org è la versione a pagamento di LibreOffice", ok: false, why: "Sono entrambi gratuiti e open source." },
            { t: "Sono programmi completamente diversi: uno per la posta, l'altro per l'ufficio", ok: false, why: "Sono tutti e due suite per ufficio, con un'origine comune." },
            { t: "LibreOffice funziona solo su Linux, OpenOffice.org solo su Windows", ok: false, why: "Tutti e due funzionano su Linux, Windows e macOS." }
        ]
    },
    {
        id: "1.2-07", type: "single", ref: "1.2_01#Multimedia",
        text: "A che cosa serve GIMP?",
        options: [
            { t: "A ritoccare fotografie e creare immagini", ok: true, why: "GIMP (GNU Image Manipulation Program) è un programma di grafica, spesso paragonato a Photoshop." },
            { t: "A montare video", ok: false, why: "Per i video esistono altri programmi open source, come Kdenlive o Shotcut." },
            { t: "A leggere la posta elettronica", ok: false, why: "Per la posta c'è Thunderbird." },
            { t: "A gestire un database", ok: false, why: "Per i database ci sono MariaDB e MySQL." }
        ]
    },
    {
        id: "1.2-08", type: "multiple", ref: "1.2_01#Programmi Server",
        text: "Quali di questi programmi sono server web, cioè rispondono ai browser che chiedono una pagina?",
        options: [
            { t: "Apache HTTPD", ok: true, why: "Apache è uno dei server web più usati da decenni." },
            { t: "NGINX", ok: true, why: "NGINX è un server web molto veloce, usato anche come proxy davanti ad altri server." },
            { t: "MariaDB", ok: false, why: "MariaDB è un database: conserva i dati che un sito può usare, ma non risponde ai browser." },
            { t: "Samba", ok: false, why: "Samba condivide file e stampanti con i computer Windows." },
            { t: "Thunderbird", ok: false, why: "Thunderbird è un programma di posta che si usa sul proprio computer." }
        ]
    },
    {
        id: "1.2-09", type: "single", ref: "1.2_01#Condivisione dei Dati",
        text: "In un ufficio con computer Windows, quale programma permette a un server Linux di condividere cartelle e stampanti usando lo stesso protocollo di Windows (SMB)?",
        options: [
            { t: "Samba", ok: true, why: "Samba parla il protocollo SMB/CIFS delle reti Windows: le cartelle del server Linux compaiono come quelle di un altro PC Windows." },
            { t: "NFS", ok: false, why: "NFS condivide file soprattutto tra sistemi Linux e Unix, con un protocollo diverso da quello di Windows." },
            { t: "MySQL", ok: false, why: "MySQL è un database, non condivide cartelle." },
            { t: "NGINX", ok: false, why: "NGINX è un server web: invia pagine ai browser." }
        ]
    },
    {
        id: "1.2-10", type: "single", ref: "1.2_01#Programmi Server",
        text: "Che cos'è MariaDB?",
        options: [
            { t: "Un database relazionale nato come continuazione (fork) di MySQL", ok: true, why: "Gli sviluppatori originali di MySQL hanno creato MariaDB, compatibile con MySQL; molte distribuzioni lo installano al suo posto." },
            { t: "Un server di posta elettronica", ok: false, why: "MariaDB conserva dati in tabelle; non gestisce la posta." },
            { t: "Un ambiente desktop", ok: false, why: "Gli ambienti desktop sono per esempio GNOME e KDE." },
            { t: "Un linguaggio di programmazione", ok: false, why: "Per interrogare MariaDB si usa il linguaggio SQL, ma MariaDB è il programma che conserva i dati." }
        ]
    },
    {
        id: "1.2-11", type: "single", ref: "1.2_01#Condivisione dei Dati",
        text: "A cosa servono Nextcloud e ownCloud?",
        options: [
            { t: "A creare un proprio servizio per salvare, sincronizzare e condividere file, come Dropbox ma su un server proprio", ok: true, why: "Si installano su un server che controlli tu: i file restano tuoi e si sincronizzano tra computer e telefono." },
            { t: "A modificare documenti di testo offline", ok: false, why: "Per i documenti offline c'è LibreOffice; Nextcloud e ownCloud sono servizi da server." },
            { t: "A navigare sul web in modo anonimo", ok: false, why: "Non sono browser né strumenti di anonimato." },
            { t: "A installare pacchetti su Debian", ok: false, why: "I pacchetti si installano con `apt-get` o `dpkg`." }
        ]
    },
    {
        id: "1.2-12", type: "single", ref: "1.2_01#Linguaggi di Programmazione",
        text: "Quale linguaggio viene eseguito dai browser per rendere interattive le pagine web?",
        options: [
            { t: "JavaScript", ok: true, why: "Tutti i browser hanno un interprete JavaScript; oggi JavaScript si usa anche sui server." },
            { t: "Java", ok: false, why: "Nonostante il nome, Java è un altro linguaggio: si compila in bytecode e gira nella macchina virtuale Java." },
            { t: "C", ok: false, why: "Il C si compila in programmi per il sistema operativo; i browser non lo eseguono nelle pagine." },
            { t: "Perl", ok: false, why: "Perl si usa soprattutto per script e per elaborare testi, sul computer o sul server." }
        ]
    },
    {
        id: "1.2-13", type: "single", ref: "1.2_01#Linguaggi di Programmazione",
        text: "In quale linguaggio è scritta la maggior parte del kernel Linux?",
        options: [
            { t: "C", ok: true, why: "Il C è compilato, veloce e vicino all'hardware: per questo si usa per i kernel. Linux contiene anche un po' di assembly e, da poco, parti in Rust." },
            { t: "Python", ok: false, why: "Python è interpretato e molto usato per script e applicazioni, non per il kernel." },
            { t: "PHP", ok: false, why: "PHP si usa per i siti web lato server." },
            { t: "JavaScript", ok: false, why: "JavaScript si usa nei browser e nei server web, non nei kernel." }
        ]
    },

    // ---- 1.3 Software e Licenze Open Source ----
    {
        id: "1.3-01", type: "single", ref: "1.3_01#Copyleft",
        text: "Che cosa chiede una licenza copyleft a chi distribuisce una versione modificata del programma?",
        options: [
            { t: "Di distribuirla con la stessa licenza, così anche la versione modificata resta libera", ok: true, why: "È l'idea del copyleft: le libertà passano a tutte le opere derivate e non si possono togliere." },
            { t: "Di non modificare mai il programma", ok: false, why: "Il software libero si può modificare: il copyleft regola come si distribuiscono le modifiche." },
            { t: "Di pagare una quota all'autore originale", ok: false, why: "Il copyleft non chiede pagamenti." },
            { t: "Niente: con il copyleft si può chiudere il codice e venderlo come proprietario", ok: false, why: "Questo lo permettono le licenze permissive; il copyleft lo impedisce." }
        ]
    },
    {
        id: "1.3-02", type: "single", ref: "1.3_01#Copyleft",
        text: "Quale di queste è la licenza copyleft più conosciuta, usata anche dal kernel Linux?",
        options: [
            { t: "GPL (GNU General Public License)", ok: true, why: "Il kernel Linux è distribuito con la GPL versione 2, scritta dalla Free Software Foundation." },
            { t: "BSD", ok: false, why: "La licenza BSD è permissiva: non obbliga a mantenere libere le opere derivate." },
            { t: "MIT", ok: false, why: "Anche la MIT è una licenza permissiva." },
            { t: "Creative Commons BY", ok: false, why: "Le Creative Commons sono pensate per opere come testi e immagini, non per il codice." }
        ]
    },
    {
        id: "1.3-03", type: "multiple", ref: "1.3_01#Open Source Definition e Licenze “Permissive”",
        text: "Quali licenze sono permissive, cioè lasciano usare il codice anche dentro software proprietario?",
        options: [
            { t: "BSD", ok: true, why: "Chiede soprattutto di conservare l'avviso di copyright; il codice può finire in prodotti chiusi." },
            { t: "MIT", ok: true, why: "È tra le più brevi e semplici: permette quasi tutto, purché resti l'avviso di copyright." },
            { t: "GPL versione 2", ok: false, why: "La GPL è copyleft: le versioni distribuite devono restare GPL." },
            { t: "GPL versione 3", ok: false, why: "Anche la versione 3 della GPL è copyleft." },
            { t: "Una licenza proprietaria con contratto d'uso (EULA)", ok: false, why: "Una licenza proprietaria non è né libera né open source." }
        ]
    },
    {
        id: "1.3-04", type: "single", ref: "1.3_01#Criteri di Definizione del Software Libero",
        text: "Quante sono le libertà fondamentali del software libero secondo la Free Software Foundation?",
        options: [
            { t: "Quattro, numerate da 0 a 3", ok: true, why: "Usare il programma per qualsiasi scopo, studiarlo e modificarlo, ridistribuirlo, distribuire le versioni modificate." },
            { t: "Due: usarlo e copiarlo", ok: false, why: "Mancano lo studio, la modifica e la distribuzione delle modifiche." },
            { t: "Dieci, come i criteri della Open Source Definition", ok: false, why: "I dieci criteri sono quelli della Open Source Definition dell'OSI, non le libertà della FSF." },
            { t: "Una sola: averlo gratis", ok: false, why: "Il software libero riguarda la libertà, non il prezzo: si può anche vendere." }
        ]
    },
    {
        id: "1.3-05", type: "single", ref: "1.3_01#Software Open Source vs. Software Libero",
        text: "Chi ha fondato la Free Software Foundation (FSF), nel 1985?",
        options: [
            { t: "Richard Stallman", ok: true, why: "Stallman aveva avviato il progetto GNU nel 1983 e poi creato la FSF per sostenerlo." },
            { t: "Linus Torvalds", ok: false, why: "Torvalds ha creato il kernel Linux nel 1991." },
            { t: "Eric S. Raymond e Bruce Perens", ok: false, why: "Hanno fondato l'Open Source Initiative (OSI), nel 1998." },
            { t: "Mark Shuttleworth", ok: false, why: "Shuttleworth ha fondato Canonical, l'azienda di Ubuntu." }
        ]
    },
    {
        id: "1.3-06", type: "single", ref: "1.3_01#Software Open Source vs. Software Libero",
        text: "Quale organizzazione cura la Open Source Definition e approva le licenze open source?",
        options: [
            { t: "Open Source Initiative (OSI)", ok: true, why: "L'OSI esamina le licenze e indica quali rispettano i criteri della Open Source Definition." },
            { t: "Free Software Foundation (FSF)", ok: false, why: "La FSF parla di software libero e pubblica la GPL; la Open Source Definition è dell'OSI." },
            { t: "Linux Professional Institute (LPI)", ok: false, why: "Il LPI organizza le certificazioni, come questo esame." },
            { t: "Creative Commons", ok: false, why: "Creative Commons scrive licenze per opere creative, non approva licenze software." }
        ]
    },
    {
        id: "1.3-07", type: "fill", ref: "1.3_01#Software Open Source vs. Software Libero", anyCase: true, placeholder: "sigla",
        text: "Quale sigla di cinque lettere indica insieme il software libero e quello open source, con la parola «Libre» per evitare l'equivoco di «free» (che in inglese vuol dire anche gratis)?",
        answers: ["FLOSS"],
        why: "Le lettere di FLOSS: Free, Libre, Open Source, Software. La sigla FOSS indica lo stesso insieme di programmi, senza la parola «Libre»."
    },
    {
        id: "1.3-08", type: "single", ref: "1.3_01#Creative Commons",
        text: "Le lezioni ufficiali LPI hanno la licenza Creative Commons BY-NC-ND. Che cosa permette?",
        options: [
            { t: "Condividerle gratis citando l'autore, ma senza scopo commerciale e senza modificarle", ok: true, why: "BY = cita l'autore, NC = non commerciale, ND = nessuna opera derivata. Per questo l'app le include intere e scrive le domande da zero." },
            { t: "Modificarle e venderle, purché si citi l'autore", ok: false, why: "NC vieta l'uso commerciale e ND vieta le modifiche." },
            { t: "Solo leggerle sul sito LPI, senza copiarle", ok: false, why: "Le licenze Creative Commons permettono sempre di condividere l'opera; qui con alcune condizioni." },
            { t: "Qualsiasi uso, perché le Creative Commons sono di pubblico dominio", ok: false, why: "Le Creative Commons sono licenze con condizioni; il pubblico dominio è un'altra cosa (CC0 ci si avvicina)." }
        ]
    },
    {
        id: "1.3-09", type: "single", ref: "1.3_01#Definizione di Software Libero e di Software Open Source",
        text: "Nell'espressione «free software», che cosa vuol dire «free»?",
        options: [
            { t: "Libero: chi lo usa può studiarlo, modificarlo e condividerlo", ok: true, why: "Il punto sono le libertà di chi usa il programma; il prezzo non conta." },
            { t: "Gratis: chi lo distribuisce non può farsi pagare", ok: false, why: "Il software libero si può anche vendere; l'importante è che chi lo riceve abbia le quattro libertà." },
            { t: "Senza autore: nessuno ne ha i diritti", ok: false, why: "Il software libero ha un autore e una licenza: è proprio la licenza a concedere le libertà." },
            { t: "Senza garanzia di funzionamento", ok: false, why: "Molte licenze escludono la garanzia, ma non è questo il significato di «free»." }
        ]
    },
    {
        id: "1.3-10", type: "multiple", ref: "1.3_01#Modelli di Business nell’Open Source",
        text: "Come può guadagnare un'azienda che sviluppa software open source?",
        options: [
            { t: "Vendendo assistenza, supporto e aggiornamenti garantiti, come fa Red Hat", ok: true, why: "Il software è libero, ma le aziende pagano per avere qualcuno che risponde e garantisce gli aggiornamenti." },
            { t: "Offrendo il programma come servizio online, già installato e gestito", ok: true, why: "Molti pagano per non dover installare e mantenere il programma da soli (per esempio un Nextcloud ospitato)." },
            { t: "Facendo pagare a ogni utente una licenza per poter usare il programma", ok: false, why: "Una licenza a pagamento per l'uso è tipica del software proprietario: il software libero si può usare per qualsiasi scopo." },
            { t: "Vietando agli altri di distribuire copie del programma", ok: false, why: "Le licenze open source permettono sempre la ridistribuzione." }
        ]
    },
    {
        id: "1.3-11", type: "single", ref: "1.3_01#Open Source Definition e Licenze “Permissive”",
        text: "Un'azienda vuole prendere una libreria open source, modificarla e usarla in un suo programma chiuso, senza pubblicare il codice. Con quale licenza della libreria può farlo?",
        options: [
            { t: "BSD", ok: true, why: "La BSD è permissiva: basta conservare l'avviso di copyright." },
            { t: "GPL", ok: false, why: "Con la GPL, distribuendo il programma bisognerebbe pubblicare anche il suo codice con la GPL." },
            { t: "Con nessuna licenza: il codice open source non si può mai usare in programmi chiusi", ok: false, why: "Con le licenze permissive si può." },
            { t: "Con qualsiasi licenza, se non dice a nessuno che usa quella libreria", ok: false, why: "Le licenze vanno rispettate anche se nessuno controlla: violarle è una violazione del diritto d'autore." }
        ]
    },

    // ---- 1.4 Competenze ICT - Lavorare con Linux ----
    {
        id: "1.4-01", type: "multiple", ref: "1.4_01#Ambienti Desktop",
        text: "Quali di questi sono ambienti desktop per Linux?",
        options: [
            { t: "GNOME", ok: true, why: "GNOME è l'ambiente desktop predefinito di Ubuntu, Fedora e altre." },
            { t: "KDE Plasma", ok: true, why: "KDE Plasma è un altro ambiente desktop molto diffuso, molto personalizzabile." },
            { t: "Bash", ok: false, why: "Bash è una shell: si usa scrivendo comandi, non con finestre e icone." },
            { t: "Apache", ok: false, why: "Apache è un server web." },
            { t: "GRUB", ok: false, why: "GRUB è il programma di avvio (boot loader) che parte prima di Linux." }
        ]
    },
    {
        id: "1.4-02", type: "single", ref: "1.4_01#Accedere alla Command Line",
        text: "Che cos'è un emulatore di terminale, come GNOME Terminal o Konsole?",
        options: [
            { t: "Un programma con una finestra grafica che dà accesso a una shell, dove si scrivono i comandi", ok: true, why: "Imita i vecchi terminali fisici, ma dentro il desktop: nella finestra gira la shell, di solito Bash." },
            { t: "Un emulatore che fa girare programmi Windows", ok: false, why: "Per i programmi Windows esiste Wine; il terminale serve per la riga di comando." },
            { t: "La schermata nera che compare solo se il desktop si blocca", ok: false, why: "Il terminale si apre quando vuoi, come qualsiasi programma." },
            { t: "Un programma per collegarsi a Internet", ok: false, why: "Dal terminale si possono usare anche comandi di rete, ma non è questo il suo scopo." }
        ]
    },
    {
        id: "1.4-03", type: "single", ref: "1.4_01#Accedere alla Command Line",
        text: "Con il desktop grafico aperto, quale combinazione di tasti porta di solito a una console di testo (terminale virtuale), senza grafica?",
        options: [
            { t: "Ctrl+Alt+F3", ok: true, why: "Ctrl+Alt con un tasto da F1 a F6 apre le console virtuali; con un'altra combinazione si torna al desktop (spesso Ctrl+Alt+F1 o F2)." },
            { t: "Ctrl+Alt+Canc", ok: false, why: "Su molte distribuzioni chiede di spegnere o riavviare." },
            { t: "Alt+Tab", ok: false, why: "Passa da una finestra all'altra del desktop." },
            { t: "Ctrl+C", ok: false, why: "Nel terminale interrompe il comando in esecuzione; nei programmi grafici di solito copia." }
        ]
    },
    {
        id: "1.4-04", type: "single", ref: "1.4_01#Finestre “Private”",
        text: "Che cosa fa la navigazione privata (in incognito) di un browser?",
        options: [
            { t: "Alla chiusura cancella cronologia, cookie e dati dei moduli di quella finestra; i siti e il fornitore di rete però vedono comunque le visite", ok: true, why: "Protegge dagli altri che usano lo stesso computer, non rende anonimi su Internet." },
            { t: "Nasconde il tuo indirizzo IP a tutti i siti", ok: false, why: "L'indirizzo IP resta visibile: per nasconderlo servono strumenti come una VPN o Tor." },
            { t: "Blocca tutti i virus", ok: false, why: "La modalità privata non è un antivirus." },
            { t: "Impedisce al datore di lavoro di vedere i siti visitati dalla rete dell'ufficio", ok: false, why: "Chi gestisce la rete può ancora vedere a quali siti ti colleghi." }
        ]
    },
    {
        id: "1.4-05", type: "single", ref: "1.4_01#Do Not Track (DNT)",
        text: "Che cos'è l'impostazione «Do Not Track» (DNT) del browser?",
        options: [
            { t: "Una richiesta inviata ai siti di non tracciarti: i siti possono rispettarla o ignorarla", ok: true, why: "È solo un'indicazione nelle richieste del browser; nessuno obbliga i siti a seguirla." },
            { t: "Un blocco che impedisce tecnicamente qualsiasi tracciamento", ok: false, why: "Non blocca niente: per bloccare servono estensioni o impostazioni contro i tracker e i cookie di terze parti." },
            { t: "Una funzione che cancella la cronologia ogni giorno", ok: false, why: "La cronologia si cancella da un'altra impostazione." },
            { t: "Un tipo di cookie", ok: false, why: "DNT è un'intestazione delle richieste, non un cookie." }
        ]
    },
    {
        id: "1.4-06", type: "single", ref: "1.4_01#Tracciamento dei Cookie",
        text: "Che cosa sono i cookie di terze parti?",
        options: [
            { t: "Cookie di un dominio diverso dal sito che stai visitando (per esempio una rete pubblicitaria), usati per seguirti da un sito all'altro", ok: true, why: "Lo stesso servizio è incluso in molti siti: con il suo cookie riconosce il tuo browser ovunque e costruisce un profilo." },
            { t: "Cookie che servono a ricordare il carrello o l'accesso al sito che stai usando", ok: false, why: "Quelli sono cookie del sito stesso (di prima parte) e servono al suo funzionamento." },
            { t: "Programmi che rubano le password", ok: false, why: "I cookie sono piccoli file di dati, non programmi." },
            { t: "Cookie salvati sul server invece che sul computer", ok: false, why: "I cookie si salvano sempre nel browser di chi visita." }
        ]
    },
    {
        id: "1.4-07", type: "multiple", ref: "1.4_01#Scegliere la Giusta Password",
        text: "Quali sono buone abitudini per le password?",
        options: [
            { t: "Usare una password lunga e diversa per ogni servizio", ok: true, why: "Se un sito viene violato, la password rubata non apre anche gli altri account." },
            { t: "Usare un gestore di password (per esempio KeePassXC) per ricordarle", ok: true, why: "Così puoi avere password lunghe e tutte diverse senza doverle ricordare a memoria." },
            { t: "Usare la stessa password, ma molto complicata, per tutti i siti", ok: false, why: "Basta una violazione in un sito per mettere a rischio tutti gli account." },
            { t: "Usare il proprio nome e la data di nascita, così non si dimenticano", ok: false, why: "Sono dati facili da scoprire: sono tra le prime prove di chi attacca." },
            { t: "Scriverla su un foglietto attaccato al monitor", ok: false, why: "Chiunque passi davanti al computer la può leggere." }
        ]
    },
    {
        id: "1.4-08", type: "single", ref: "1.4_01#TLS",
        text: "Che cosa garantisce il lucchetto di HTTPS (protocollo TLS) quando apri un sito?",
        options: [
            { t: "Che la comunicazione tra il browser e il sito è cifrata e che il sito ha un certificato valido per quel nome", ok: true, why: "Chi sta in mezzo alla rete non può leggere né modificare i dati, e il certificato conferma il nome del sito." },
            { t: "Che il sito è onesto e non può essere una truffa", ok: false, why: "Anche un sito truffaldino può avere HTTPS: il lucchetto dice solo che la connessione è protetta." },
            { t: "Che il sito non usa cookie", ok: false, why: "HTTPS non dice nulla sui cookie." },
            { t: "Che il computer non ha virus", ok: false, why: "TLS protegge la connessione, non il computer." }
        ]
    },
    {
        id: "1.4-09", type: "fill", ref: "1.4_01#Crittografia di File ed E-mail con GnuPG", placeholder: "comando",
        text: "Quale comando, dal progetto GNU, cifra e firma file ed e-mail con lo standard OpenPGP?",
        answers: ["gpg", "gpg2"],
        why: "`gpg` è il comando di GnuPG (GNU Privacy Guard). Per esempio `gpg -c file.txt` cifra un file con una password."
    },
    {
        id: "1.4-10", type: "single", ref: "1.4_01#Crittografia del Disco",
        text: "Da che cosa protegge la cifratura completa del disco?",
        options: [
            { t: "Da chi ruba il computer o toglie il disco: senza la password i dati sono illeggibili", ok: true, why: "I dati sul disco sono cifrati; si decifrano solo all'avvio, con la password. Su Linux si usa spesso LUKS." },
            { t: "Dai virus che arrivano con la posta", ok: false, why: "Mentre il computer è acceso e sbloccato i dati sono leggibili dai programmi, compresi quelli dannosi." },
            { t: "Dal tracciamento dei siti web", ok: false, why: "Il tracciamento avviene in rete e nel browser, non sul disco." },
            { t: "Dai guasti del disco", ok: false, why: "Contro i guasti servono i backup: un disco cifrato si può rompere come un altro." }
        ]
    },
    {
        id: "1.4-11", type: "single", ref: "1.4_01#Presentazioni e Progetti",
        text: "Quale programma di LibreOffice serve a preparare presentazioni con diapositive?",
        options: [
            { t: "Impress", ok: true, why: "Impress è l'equivalente di PowerPoint e apre anche i file `.pptx`." },
            { t: "Writer", ok: false, why: "Writer serve a scrivere testi, come Word." },
            { t: "Calc", ok: false, why: "Calc è il foglio di calcolo, come Excel." },
            { t: "Base", ok: false, why: "Base gestisce piccoli database." }
        ]
    },
    {
        id: "1.4-12", type: "single", ref: "1.4_01#Usi Industriali di Linux",
        text: "Che cos'è una macchina virtuale?",
        options: [
            { t: "Un computer simulato via software, con un suo sistema operativo, che gira dentro un computer vero", ok: true, why: "Su un solo server fisico possono girare molte macchine virtuali, anche con sistemi diversi: è la base del cloud." },
            { t: "Un computer che si usa solo da Internet, senza schermo", ok: false, why: "Quello è un server remoto: può essere fisico o virtuale." },
            { t: "Un programma Java", ok: false, why: "Java ha una sua «macchina virtuale», ma qui si parla di computer interi simulati." },
            { t: "Un computer di prova che non può collegarsi alla rete", ok: false, why: "Le macchine virtuali di solito sono in rete come i computer veri." }
        ]
    }
]);
