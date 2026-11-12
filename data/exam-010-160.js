// Obiettivi d'esame di Linux Essentials 1.6 (010-160), come li pubblica il Linux Professional
// Institute: traduzione italiana della wiki LPI, lezioni da learning.lpi.org/it.
// Generato da tools/import-objectives.py: non modificare a mano.
EXAMS.push({
 "id": "010-160",
 "name": "Linux Essentials",
 "version": "1.6",
 "questions": 40,
 "minutes": 60,
 "available": "fino ad aprile 2027",
 "url": "https://learning.lpi.org/it/learning-materials/010-160/",
 "pdf": "https://learning.lpi.org/pdfstore/LPI-Learning-Material-010-160-it.pdf",
 "objectivesUrl": "https://wiki.lpi.org/wiki/LinuxEssentials_Objectives_V1.6(IT)",
 "checked": "2026-11-12",
 "topics": [
  {
   "id": "1",
   "title": "La Comunità Linux e una Carriera nell'Open Source",
   "objectives": [
    {
     "id": "1.1",
     "title": "Evoluzione di Linux e Sistemi Operativi più Diffusi",
     "weight": 2,
     "description": "Conoscenze sullo sviluppo di Linux e delle principali distribuzioni.",
     "areas": [
      "Distribuzioni",
      "Sistemi Integrati",
      "Linux nel Cloud"
     ],
     "terms": [
      "Debian, Ubuntu (LTS)",
      "CentOS, openSUSE, Red Hat, SUSE",
      "Linux Mint, Scientific Linux",
      "Raspberry Pi, Raspbian",
      "Android"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/1/1.1/",
     "lessons": [
      "1.1_01"
     ]
    },
    {
     "id": "1.2",
     "title": "Principali Applicazioni Open Source",
     "weight": 2,
     "description": "Consapevolezza delle principali applicazioni, del loro uso e sviluppo.",
     "areas": [
      "Applicazioni desktop",
      "Applicazioni server",
      "Linguaggi di sviluppo",
      "Strumenti di gestione dei pacchetti e repository"
     ],
     "terms": [
      "OpenOffice.org, LibreOffice, Thunderbird, Firefox, GIMP",
      "Nextcloud, ownCloud",
      "Apache HTTPD, NGINX, MariaDB, MySQL, NFS, Samba",
      "C, Java, JavaScript, Perl, shell, Python, PHP",
      "dpkg, apt-get, rpm, yum"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/1/1.2/",
     "lessons": [
      "1.2_01"
     ]
    },
    {
     "id": "1.3",
     "title": "Software e Licenze Open Source",
     "weight": 1,
     "description": "Comunità aperte e licenze del software Open Source per le aziende.",
     "areas": [
      "Filosofia Open Source",
      "Le licenze Open Source",
      "Free Software Foundation (FSF), Open Source Initiative (OSI)"
     ],
     "terms": [
      "Copyleft, Permissive",
      "GPL, BSD, Creative Commons",
      "Free Software, Open Source Software, FOSS, FLOSS",
      "Modelli di business Open Source"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/1/1.3/",
     "lessons": [
      "1.3_01"
     ]
    },
    {
     "id": "1.4",
     "title": "Competenze ICT - Lavorare con Linux",
     "weight": 2,
     "description": "Competenze di base dell'Information and Communication Technology (ICT) e lavorare su ambienti Linux.",
     "areas": [
      "Competenze sui desktop",
      "Uso della command line",
      "Utilizzi di Linux nell'industria, cloud computing e virtualizzazione"
     ],
     "terms": [
      "Utilizzare un browser, problemi di privacy, opzioni di configurazione, ricerca sul Web e salvataggio di contenuti",
      "Terminale e console",
      "Problemi con le password",
      "Problemi e strumenti di privacy",
      "Uso di comuni applicazioni open source in presentazioni e progetti"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/1/1.4/",
     "lessons": [
      "1.4_01"
     ]
    }
   ]
  },
  {
   "id": "2",
   "title": "Trovare il Proprio Modo di Operare su un Sistema Linux",
   "objectives": [
    {
     "id": "2.1",
     "title": "Nozioni di Base sulla Command Line",
     "weight": 3,
     "description": "Nozioni di base sull'utilizzo della command line di Linux.",
     "areas": [
      "Shell di base",
      "Sintassi della riga di comando",
      "Variabili",
      "Uso delle virgolette"
     ],
     "terms": [
      "Bash",
      "echo",
      "history",
      "La variabile d'ambiente PATH",
      "export",
      "type"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/2/2.1/",
     "lessons": [
      "2.1_01",
      "2.1_02"
     ]
    },
    {
     "id": "2.2",
     "title": "Utilizzo della Command Line per Ottenere Aiuto",
     "weight": 2,
     "description": "Esecuzione dei comandi di aiuto e navigazione al loro interno.",
     "areas": [
      "Le pagine man",
      "Le pagine info"
     ],
     "terms": [
      "man",
      "info",
      "/usr/share/doc/",
      "locate"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/2/2.2/",
     "lessons": [
      "2.2_01"
     ]
    },
    {
     "id": "2.3",
     "title": "Utilizzo di Directory e Elenchi di File",
     "weight": 2,
     "description": "Navigazione nelle directory home e di sistema e generazione di elenchi di file in varie posizioni.",
     "areas": [
      "File, directory",
      "File and directory nascoste",
      "Directory home",
      "Percorsi assoluti e relativi"
     ],
     "terms": [
      "Opzioni comuni di ls",
      "Listato recursivo",
      "cd",
      ". e ..",
      "home e ~"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/2/2.3/",
     "lessons": [
      "2.3_01",
      "2.3_02"
     ]
    },
    {
     "id": "2.4",
     "title": "Creazione, Spostamento ed Eliminazione di File",
     "weight": 2,
     "description": "Creazione, spostamento ed eliminazione file e directory nella home directory.",
     "areas": [
      "File e directory",
      "Sensibilità a minuscole e maiuscole",
      "Semplici raggruppamenti (globbing)"
     ],
     "terms": [
      "mv, cp, rm, touch",
      "mkdir, rmdir"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/2/2.4/",
     "lessons": [
      "2.4_01"
     ]
    }
   ]
  },
  {
   "id": "3",
   "title": "Il Potere della Command Line",
   "objectives": [
    {
     "id": "3.1",
     "title": "Archiviazione dei File sulla Command Line",
     "weight": 2,
     "description": "Archiviazione dei file nella home directory dell'utente.",
     "areas": [
      "File, directory",
      "Archivi, compressione"
     ],
     "terms": [
      "tar",
      "Comuni opzioni di tar",
      "gzip, bzip2, xz",
      "zip, unzip"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/3/3.1/",
     "lessons": [
      "3.1_01"
     ]
    },
    {
     "id": "3.2",
     "title": "Ricerca ed Estrazione di Dati dai File",
     "weight": 3,
     "description": "Ricerca ed estrazione di dati dai file nella home directory.",
     "areas": [
      "Le pipe sulla command line",
      "Reindirizzamento I/O",
      "Espressioni regolari di base attraverso l'utilizzo di ., [ ], *, e ?"
     ],
     "terms": [
      "grep",
      "less",
      "cat, head, tail",
      "sort",
      "cut",
      "wc"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/3/3.2/",
     "lessons": [
      "3.2_01",
      "3.2_02"
     ]
    },
    {
     "id": "3.3",
     "title": "Trasformare i Comandi in uno Script",
     "weight": 4,
     "description": "Trasformare comandi ripetitivi in semplici script.",
     "areas": [
      "Shell scripting di base",
      "Conoscenza dei più comuni editor di testo (vi e nano)"
     ],
     "terms": [
      "#! (shebang)",
      "/bin/bash",
      "Variabili",
      "Argomenti",
      "Cicli for",
      "echo",
      "Exit status"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/3/3.3/",
     "lessons": [
      "3.3_01",
      "3.3_02"
     ]
    }
   ]
  },
  {
   "id": "4",
   "title": "Il Sistema Operativo Linux",
   "objectives": [
    {
     "id": "4.1",
     "title": "Scelta di un Sistema Operativo",
     "weight": 1,
     "description": "Conoscenza dei principali sistemi operativi e distribuzioni Linux.",
     "areas": [
      "Differenze tra Windows, OS X e Linux",
      "Gestione del ciclo di vita di una distribuzione"
     ],
     "terms": [
      "GUI contro command line, configurazione desktop",
      "Cicli di manutenzione, versioni beta e stabili"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/4/4.1/",
     "lessons": [
      "4.1_01"
     ]
    },
    {
     "id": "4.2",
     "title": "Comprendere l'Hardware del Computer",
     "weight": 2,
     "description": "Familiarità con i componenti utilizzati per la creazione di computer desktop e server.",
     "areas": [
      "Hardware"
     ],
     "terms": [
      "Schede madri, processori, alimentatori, unità ottiche, periferiche",
      "Dischi rigidi, dischi a stato solido e partizioni, /dev/sd*",
      "Driver"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/4/4.2/",
     "lessons": [
      "4.2_01"
     ]
    },
    {
     "id": "4.3",
     "title": "Dove Sono Memorizzati i Dati",
     "weight": 3,
     "description": "Dove vengono memorizzati vari tipi di informazioni su un sistema Linux.",
     "areas": [
      "Programmi e configurazione",
      "Processi",
      "Indirizzi di memoria",
      "Messaggistica di sistema",
      "Registrazione (Logging)"
     ],
     "terms": [
      "ps, top, free",
      "syslog, dmesg",
      "/etc/, /var/log/",
      "/boot/, /proc/, /dev/, /sys/"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/4/4.3/",
     "lessons": [
      "4.3_01",
      "4.3_02"
     ]
    },
    {
     "id": "4.4",
     "title": "Il Tuo Computer in Rete",
     "weight": 2,
     "description": "Esaminare la configurazione di rete attiva e determinare i requisiti di base per un computer su una rete locale (LAN).",
     "areas": [
      "Internet, rete, router",
      "Esaminare la configurazione del client DNS",
      "Esaminare la configurazione di rete"
     ],
     "terms": [
      "route, ip route show",
      "ifconfig, ip addr show",
      "netstat, ss",
      "/etc/resolv.conf, /etc/hosts",
      "IPv4, IPv6",
      "ping",
      "host"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/4/4.4/",
     "lessons": [
      "4.4_01"
     ]
    }
   ]
  },
  {
   "id": "5",
   "title": "Sicurezza e Permessi sui File",
   "objectives": [
    {
     "id": "5.1",
     "title": "Sicurezza di Base e Identificazione dei Tipi di Utente",
     "weight": 2,
     "description": "Vari tipi di utenti su un sistema Linux.",
     "areas": [
      "Root e utenti standard",
      "Utenti di sistema"
     ],
     "terms": [
      "/etc/passwd, /etc/shadow, /etc/group",
      "id, last, who, w",
      "sudo, su"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/5/5.1/",
     "lessons": [
      "5.1_01"
     ]
    },
    {
     "id": "5.2",
     "title": "Creazione di Utenti e Gruppi",
     "weight": 2,
     "description": "Creazione di utenti e gruppi su un sistema Linux.",
     "areas": [
      "Comandi gestione utenti e gruppi",
      "ID degli utenti"
     ],
     "terms": [
      "/etc/passwd, /etc/shadow, /etc/group, /etc/skel/",
      "useradd, groupadd",
      "passwd"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/5/5.2/",
     "lessons": [
      "5.2_01"
     ]
    },
    {
     "id": "5.3",
     "title": "Gestione delle Autorizzazioni e delle Proprietà dei File",
     "weight": 2,
     "description": "Comprensione e manipolazione dei permessi dei file e delle impostazioni di proprietà.",
     "areas": [
      "Autorizzazioni e proprietà di file e directory"
     ],
     "terms": [
      "ls -l, ls -a",
      "chmod, chown"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/5/5.3/",
     "lessons": [
      "5.3_01"
     ]
    },
    {
     "id": "5.4",
     "title": "Directory e File Speciali",
     "weight": 1,
     "description": "Directory e file speciali su un sistema Linux inclusi i permessi speciali.",
     "areas": [
      "Utilizzo di file e directory temporanei",
      "Link simbolici"
     ],
     "terms": [
      "/tmp/, /var/tmp/ e Sticky Bit",
      "ls -d",
      "ln -s"
     ],
     "url": "https://learning.lpi.org/it/learning-materials/010-160/5/5.4/",
     "lessons": [
      "5.4_01"
     ]
    }
   ]
  }
 ]
});
