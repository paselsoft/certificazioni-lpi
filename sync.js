// Sincronizzazione dei progressi fra i dispositivi attraverso un repository GitHub privato, come
// in Pipe Dreams (sync.js di paselsoft/PipeDreams). Il file certificazioni-lpi.json del repository
// contiene i progressi (nel formato del backup); ogni dispositivo li scarica, li UNISCE ai suoi
// (mergeProgress in store.js: non si perde niente, e vince la modifica più recente) e li salva di
// nuovo se è cambiato qualcosa.
// La chiave (un token «fine-grained» di GitHub, con accesso solo a quel repository e solo ai
// contenuti) resta nel localStorage di questo browser e va solo ad api.github.com. Va bene la stessa
// chiave e lo stesso repository di Pipe Dreams: il file è un altro.
// Quando: all'apertura, qualche secondo dopo ogni progresso, quando la pagina torna visibile o
// torna la connessione, e con «Sincronizza ora». Senza rete l'app va avanti e riprova più tardi.
// Il punto di lettura della lezione e la simulazione in corso restano di ogni dispositivo.

const SYNC_KEY = "certlpi.sync.v1";
const SYNC_PIPEDREAMS_KEY = "pipedreams.sync.v1";
const SYNC_DEFAULT_REPO = "paselsoft/pipedreams-progressi";
const SYNC_FILE = "certificazioni-lpi.json";
const SYNC_API = "https://api.github.com";

const syncState = {
    config: null,         // { token, repo } oppure null se non è collegato
    status: "",           // testo dello stato, per la pagina Backup
    lastSync: null,       // ora dell'ultima sincronizzazione riuscita (ISO)
    running: null,        // Promise della sincronizzazione in corso
    again: false,         // un'altra sincronizzazione richiesta mentre una era in corso
    timer: null,
    delay: 5000,          // attesa dopo un progresso, per raccogliere più risposte in un salvataggio
    lastAttempt: 0
};

function loadSyncConfig(key = SYNC_KEY) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && typeof data.token === "string" && data.token && /^[\w.-]+\/[\w.-]+$/.test(data.repo)) {
            if (key === SYNC_KEY) syncState.lastSync = typeof data.lastSync === "string" ? data.lastSync : null;
            return { token: data.token, repo: data.repo };
        }
    } catch (e) {
        // niente configurazione leggibile: sincronizzazione spenta
    }
    return null;
}

function saveSyncConfig() {
    try {
        if (syncState.config) localStorage.setItem(SYNC_KEY, JSON.stringify({ ...syncState.config, lastSync: syncState.lastSync }));
        else localStorage.removeItem(SYNC_KEY);
    } catch (e) {
        // storage bloccato: la chiave resta solo in memoria fino alla chiusura
    }
}

// Testo UTF-8 ⇄ base64, il formato dei contenuti nelle API di GitHub
function syncToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}

function syncFromBase64(data) {
    const binary = atob(String(data).replace(/\s+/g, ""));
    return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

function syncRequest(path, options = {}) {
    return fetch(`${SYNC_API}${path}`, {
        ...options,
        cache: "no-store",
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${syncState.config.token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            ...(options.body ? { "Content-Type": "application/json" } : {})
        }
    });
}

// Un errore della sincronizzazione con il messaggio da mostrare
class SyncError extends Error {
    constructor(message, retry = false) {
        super(message);
        this.retry = retry;
    }
}

function syncHttpError(response) {
    if (response.status === 401) return new SyncError("la chiave non è valida o è scaduta: creane una nuova su GitHub e collegala di nuovo.");
    if (response.status === 403) return new SyncError("la chiave non ha il permesso di scrivere: su GitHub dalle «Contents: Read and write».");
    if (response.status === 404) return new SyncError(`il repository ${syncState.config.repo} non esiste o la chiave non lo può vedere.`);
    return new SyncError(`GitHub ha risposto ${response.status}: riprovo più tardi.`, true);
}

// Il file dei progressi su GitHub: { progress, sha } (progress null se il file non c'è ancora)
async function syncDownload() {
    const response = await syncRequest(`/repos/${syncState.config.repo}/contents/${SYNC_FILE}`);
    if (response.status === 404) {
        // Il file manca (prima sincronizzazione) oppure manca il repository: lo distingue questa richiesta
        const repo = await syncRequest(`/repos/${syncState.config.repo}`);
        if (!repo.ok) throw syncHttpError(repo);
        return { progress: null, sha: null };
    }
    if (!response.ok) throw syncHttpError(response);
    const file = await response.json();
    const result = readBackup(syncFromBase64(file.content));
    if (result.error) throw new SyncError(`il file ${SYNC_FILE} su GitHub non è un backup valido: ${result.error}`);
    return { progress: result.progress, sha: file.sha };
}

// Quello che va su GitHub: i progressi senza il punto di lettura, che resta di ogni dispositivo
const syncShared = data => ({ ...cleanProgress(data), last: null });

async function syncUpload(data, sha) {
    const response = await syncRequest(`/repos/${syncState.config.repo}/contents/${SYNC_FILE}`, {
        method: "PUT",
        body: JSON.stringify({
            message: `Certificazioni LPI: ${progressCounts(data)}`,
            content: syncToBase64(JSON.stringify(backupData(syncShared(data)), null, 1) + "\n"),
            ...(sha ? { sha } : {})
        })
    });
    // 409/422: un altro dispositivo ha salvato nel frattempo, si riscarica e si riunisce
    if (response.status === 409 || response.status === 422) return false;
    if (!response.ok) throw syncHttpError(response);
    return true;
}

// Uguali nel contenuto, qualunque sia l'ordine delle voci (gli elenchi invece contano in ordine)
const syncCanonical = value => Array.isArray(value) ? `[${value.map(syncCanonical).join(",")}]`
    : value && typeof value === "object" ? `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${syncCanonical(value[key])}`).join(",")}}`
    : JSON.stringify(value);
const syncSame = (a, b) => syncCanonical(a) === syncCanonical(b);

// Una sincronizzazione completa: scarica, unisce, salva se serve (al massimo 3 tentativi se un
// altro dispositivo salva nello stesso momento). Restituisce true se è arrivato qualcosa di nuovo.
async function syncOnce() {
    for (let attempt = 0; attempt < 3; attempt++) {
        const remote = await syncDownload();
        const local = cleanProgress(progress);
        const merged = remote.progress ? cleanProgress(mergeProgress(local, remote.progress)) : local;
        const changed = !syncSame(merged, local);
        if (changed) {
            progress = merged;
            saveProgress(false);
        }
        if (remote.progress && syncSame(syncShared(merged), syncShared(remote.progress))) return changed;
        if (await syncUpload(merged, remote.sha)) return changed;
    }
    throw new SyncError("troppi salvataggi nello stesso momento: riprovo fra poco.", true);
}

function syncTime(iso) {
    return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

function setSyncStatus(text) {
    syncState.status = text;
    renderSyncPanel();
}

// Avvia una sincronizzazione (o ne accoda una se ce n'è già una in corso)
function syncNow() {
    if (!syncState.config) return Promise.resolve();
    clearTimeout(syncState.timer);
    syncState.timer = null;
    if (syncState.running) {
        syncState.again = true;
        return syncState.running;
    }
    syncState.lastAttempt = Date.now();
    setSyncStatus("Sincronizzazione in corso...");
    syncState.running = syncOnce()
        .then(changed => {
            syncState.lastSync = new Date().toISOString();
            saveSyncConfig();
            setSyncStatus(`Sincronizzato alle ${syncTime(syncState.lastSync)}.`);
            if (changed) syncArrived();
        })
        .catch(error => {
            if (error instanceof SyncError) {
                setSyncStatus(`Non sincronizzato: ${error.message}`);
                if (error.retry) scheduleSync(60000);
            } else {
                // fetch fallita: niente connessione (o GitHub irraggiungibile)
                setSyncStatus("Senza connessione: i progressi restano qui e si sincronizzano appena torna la rete.");
            }
        })
        .finally(() => {
            syncState.running = null;
            if (syncState.again) {
                syncState.again = false;
                syncNow();
            }
        });
    return syncState.running;
}

// Una sincronizzazione fra qualche secondo (dopo ogni progresso salvato)
function scheduleSync(delay = syncState.delay) {
    if (!syncState.config) return;
    clearTimeout(syncState.timer);
    syncState.timer = setTimeout(syncNow, delay);
}

// Sono arrivati progressi da un altro dispositivo: si aggiornano le pagine che li mostrano, ma
// non quelle dove si sta facendo qualcosa (domande, simulazione, esercizi, lezioni)
function syncArrived() {
    announce("Progressi aggiornati da un altro dispositivo.");
    const hash = location.hash || "#/";
    if (/^#\/(#.*)?$|^#\/[\w.-]+\/obiettivo\/|^#\/terminale$/.test(hash)) render();
}

// Riquadro «Sincronizza fra i dispositivi» nella pagina Backup
function syncPanel() {
    const section = el("section", "block sync-panel");
    section.id = "sync-panel";
    section.setAttribute("aria-labelledby", "sincronizza");
    const title = el("h2", "", "🔄 Sincronizza fra i dispositivi");
    title.id = "sincronizza";
    section.appendChild(title);
    const body = el("div");
    body.id = "sync-body";
    section.appendChild(body);
    return section;
}

function renderSyncPanel() {
    const body = document.getElementById("sync-body");
    if (!body) return;
    body.innerHTML = "";
    if (syncState.config) {
        const info = el("p");
        info.append(document.createTextNode("Collegato a "), el("strong", "", syncState.config.repo),
            document.createTextNode(`: i progressi si salvano nel file ${SYNC_FILE} e si ritrovano su ogni dispositivo collegato.`));
        body.appendChild(info);
        const status = el("p", "sync-status");
        status.id = "sync-status";
        status.setAttribute("role", "status");
        status.textContent = syncState.status || (syncState.lastSync ? `Ultima sincronizzazione alle ${syncTime(syncState.lastSync)}.` : "Collegato.");
        body.appendChild(status);
        const actions = el("div", "pager");
        const now = el("button", "button primary", "🔄 Sincronizza ora");
        now.type = "button";
        now.id = "sync-now";
        now.onclick = () => syncNow();
        const off = el("button", "button", "Scollega...");
        off.type = "button";
        off.id = "sync-disconnect";
        const confirmBox = el("div", "backup-result");
        off.onclick = () => {
            confirmBox.innerHTML = "";
            confirmBox.appendChild(el("p", "warning", "Scollego la sincronizzazione su questo dispositivo? I progressi restano qui e su GitHub; la chiave viene cancellata da questo browser."));
            const yes = el("button", "button danger", "Sì, scollega");
            yes.type = "button";
            yes.id = "sync-disconnect-confirm";
            yes.onclick = () => {
                clearTimeout(syncState.timer);
                syncState.config = null;
                syncState.status = "";
                syncState.lastSync = null;
                saveSyncConfig();
                renderSyncPanel();
                announce("Sincronizzazione scollegata su questo dispositivo.");
            };
            const no = el("button", "button", "Annulla");
            no.type = "button";
            no.onclick = () => { confirmBox.innerHTML = ""; off.focus(); };
            confirmBox.append(yes, document.createTextNode(" "), no);
            yes.focus();
        };
        actions.append(now, off);
        body.append(actions, confirmBox);
        return;
    }
    body.appendChild(el("p", "", `I progressi si salvano in un repository privato su GitHub, nel file ${SYNC_FILE}: collegando ogni dispositivo (iMac, telefono, tablet, PC dell'ufficio) li ritrovi uguali dappertutto. Vanno bene lo stesso repository e la stessa chiave di Pipe Dreams.`));
    const message = el("p", "form-message");
    message.id = "sync-message";
    message.setAttribute("role", "alert");
    // Sullo stesso sito (paselsoft.github.io) Pipe Dreams può essere già collegato: basta un tocco
    const pipedreams = loadSyncConfig(SYNC_PIPEDREAMS_KEY);
    if (pipedreams) {
        const reuse = el("button", "button primary", `🔗 Usa la chiave di Pipe Dreams (${pipedreams.repo})`);
        reuse.type = "button";
        reuse.id = "sync-reuse";
        reuse.onclick = () => connectSync(pipedreams.token, pipedreams.repo, message);
        body.append(reuse, el("p", "hint", "Pipe Dreams è già collegato in questo browser: si usa la sua chiave, e i progressi dell'app vanno nello stesso repository in un file a parte. Oppure collega un'altra chiave qui sotto."));
    }
    const repoLabel = el("label", "fill-label", "Repository");
    repoLabel.htmlFor = "sync-repo";
    const repo = el("input", "fill-input");
    repo.id = "sync-repo";
    repo.type = "text";
    repo.value = SYNC_DEFAULT_REPO;
    repo.autocomplete = "off";
    repo.spellcheck = false;
    repo.setAttribute("autocapitalize", "off");
    const tokenLabel = el("label", "fill-label", "Chiave (token di GitHub)");
    tokenLabel.htmlFor = "sync-token";
    const token = el("input", "fill-input");
    token.id = "sync-token";
    token.type = "password";
    token.autocomplete = "off";
    token.spellcheck = false;
    token.placeholder = "github_pat_...";
    token.setAttribute("autocapitalize", "off");
    const actions = el("div", "pager");
    const connect = el("button", "button primary", "🔗 Collega");
    connect.type = "button";
    connect.id = "sync-connect";
    connect.onclick = () => connectSync(token.value.trim(), repo.value.trim(), message);
    actions.append(connect, externalLink("Crea la chiave su GitHub", "https://github.com/settings/personal-access-tokens/new"));
    body.append(repoLabel, repo, tokenLabel, token, actions, message);
    body.appendChild(el("p", "hint", "La chiave: su GitHub, «Fine-grained token», solo il repository dei progressi, permesso «Contents: Read and write». Resta soltanto in questo browser e va solo a GitHub."));
}

async function connectSync(token, repo, message) {
    if (!token) {
        message.textContent = "Incolla la chiave creata su GitHub.";
        return;
    }
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
        message.textContent = `Il repository si scrive utente/nome, per esempio ${SYNC_DEFAULT_REPO}.`;
        return;
    }
    syncState.config = { token, repo };
    syncState.status = "";
    message.textContent = "Controllo la chiave...";
    try {
        const response = await syncRequest(`/repos/${repo}`);
        if (!response.ok) throw syncHttpError(response);
    } catch (error) {
        syncState.config = null;
        message.textContent = error instanceof SyncError ? `Non collegato: ${error.message}` : "Non collegato: serve la connessione a internet.";
        return;
    }
    saveSyncConfig();
    renderSyncPanel();
    await syncNow();
    const summary = document.getElementById("backup-now");
    if (summary) summary.textContent = `Adesso: ${progressCounts(progress)}.`;
    const status = document.getElementById("sync-status");
    if (status) status.focus();
}

function startSync() {
    syncState.config = loadSyncConfig();
    if (!syncState.config) return;
    syncNow();
}

// Il telefono riapre la pagina dopo ore: si riallinea, ma non più di una volta ogni 30 secondi
document.addEventListener("visibilitychange", () => {
    if (!syncState.config) return;
    if (document.visibilityState === "visible" && Date.now() - syncState.lastAttempt > 30000) syncNow();
    // La pagina va in secondo piano con un salvataggio in attesa: lo fa subito
    if (document.visibilityState === "hidden" && syncState.timer) syncNow();
});
window.addEventListener("online", () => syncNow());

startSync();
