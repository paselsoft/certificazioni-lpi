# Certificazioni LPI su Proxmox (container LXC)

Un container Alpine Linux da 128 MB che serve l'app in **HTTPS** sulla tua rete, e che è anche un
**Linux vero per esercitarti**: bash, i comandi GNU, tar, gzip, zip, le pagine `man`, `useradd`,
e l'utente **anna** con nella home gli stessi file del terminale simulato dell'app.

- `proxmox-lxc.sh`: si lancia nella shell di Proxmox; crea il container e lo configura.
- `certlpi-setup.sh`: gira dentro il container (lo copia `proxmox-lxc.sh`): pacchetti, nginx,
  certificati, l'app scaricata da GitHub, gli utenti per esercitarsi.

Vengono dagli script di Pipe Dreams. **Si può installare insieme a Pipe Dreams sullo stesso
Proxmox**: questo usa le porte 8444 e 8081 (Pipe Dreams 8443 e 8080) e una sua rete interna.

Cosa è stato provato (12/11/2026): shellcheck; i certificati (firmati dalla CA locale, validi
per l'indirizzo, 825 giorni); in nginx su Alpine 3.24 la configurazione dello script: pagina in
HTTPS, lezioni, tipo del manifest, file nascosti bloccati, rimando da http a https, certificato
scaricabile. L'installazione dei pacchetti (`apk`) e i comandi di Proxmox (`pct`, `pveam`) non si
sono potuti provare: la prima volta su un Proxmox vero controlla i messaggi.

## 1. Installazione (shell di Proxmox)

Dall'interfaccia web di Proxmox: nodo > **Shell**, poi:

```bash
wget https://raw.githubusercontent.com/paselsoft/certificazioni-lpi/HEAD/deploy/proxmox-lxc.sh
```

```bash
bash proxmox-lxc.sh
```

Alla fine lo script chiede una password per la console del container (puoi lasciarla vuota) e
stampa gli indirizzi da aprire sul Mac.

### Rete

Predefinita: **NAT**, come per Pipe Dreams. Il container sta su una rete interna e Proxmox inoltra
le porte **8444** (https) e **8081** (http) al container. È la scelta giusta se Proxmox gira in
VirtualBox con la scheda in bridge sul **Wi-Fi**. Se esiste già la rete interna di Pipe Dreams
(`vmbr1`, 10.10.10.0/24), lo script ne crea un'altra libera (per esempio `vmbr2`, 10.10.20.0/24).
Prima di modificare `/etc/network/interfaces` ne salva una copia in
`/etc/network/interfaces.prima-di-certlpi`.

Con il **cavo Ethernet** puoi usare il container direttamente sulla rete di casa (porte 443 e 80):

```bash
MODE=bridge bash proxmox-lxc.sh
```

## 2. Sul Mac

1. Apri `http://IP-DI-PROXMOX:8081/certlpi-ca.crt` e scarica il certificato.
2. Doppio clic sul file: si apre **Accesso Portachiavi**. Mettilo nel portachiavi **Sistema**.
3. Doppio clic su **Certificazioni LPI CA locale** > **Fidati** > «Quando utilizzi questo
   certificato: **Fidati sempre**». Chiudi e conferma con la password.
4. Apri `https://IP-DI-PROXMOX:8444/` con Chrome (o Safari).

Con il certificato accettato funzionano anche l'app installabile e l'uso senza connessione.

**Progressi**: restano nel browser del Mac, legati all'indirizzo. Se l'indirizzo di Proxmox
cambia, il browser lo vede come un altro sito: dai a Proxmox un indirizzo fisso nel router,
oppure scarica un backup dei progressi (pagina **Backup** dell'app) prima di cambiarlo.

## 3. Il Linux vero per esercitarti

Nell'interfaccia web di Proxmox: container **lpi** > **Console**, accesso come `root` con la
password scelta durante l'installazione. Poi:

```bash
su - anna
```

Ora sei anna, nella sua home, con gli stessi file del terminale dell'app (`documenti`, `foto`,
`note.txt`, e `/var/log/app.log`): puoi rifare gli esercizi e confrontare. Con `exit` torni root.

Qui ci sono anche cose che il simulatore non ha: le pagine del manuale (`man ls`, `man -k
archivio`, `info`), gli editor (`vi`), gli script che si eseguono davvero (`./saluta.sh`), e da root
`useradd`, `groupadd`, `passwd`, `ps`, `ss`.

Senza password: dalla shell di Proxmox `pct enter ID` (l'ID lo stampa lo script), poi `su - anna`.

## Comandi utili

```bash
bash proxmox-lxc.sh aggiorna
```

```bash
bash proxmox-lxc.sh certificato
```

```bash
bash proxmox-lxc.sh stato
```

`aggiorna` scarica l'ultima versione dell'app e installa i pacchetti che mancano; `certificato`
rifà il certificato se l'indirizzo di Proxmox è cambiato (la CA resta la stessa: sul Mac non serve
reinstallarla). La versione dell'app si vede in fondo alla pagina **Backup**.
Variabili: `CTID`, `MEMORY`, `DISK`, `HTTPS_PORT`, `HTTP_PORT`, `UPLINK`, `NAT_BRIDGE`,
`NAT_NET`, `STORAGE` (vedi in cima a `proxmox-lxc.sh`).

Se il firewall di Proxmox è attivo a livello di datacenter, consenti le porte 8444 e 8081 sul nodo.
