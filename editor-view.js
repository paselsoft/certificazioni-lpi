// L'editor nella pagina del terminale: nano e vi (vim) del simulatore (shell-editor.js).
// Il testo sta in una vera area di testo (textarea): si legge con i lettori di schermo e si scrive
// anche con la tastiera del telefono. Sotto, una riga di stato (letta dai lettori di schermo) e i
// tasti dell'editor, come pulsanti, per chi non ha Ctrl o Esc sulla tastiera.
//   nano: si scrive subito. Ctrl+O salva (chiede il nome del file: Invio conferma), Ctrl+X esce
//         (se ci sono modifiche chiede se salvarle: S sì, N no, Ctrl+C annulla), Ctrl+K taglia la
//         riga, Ctrl+U la incolla, Ctrl+C mostra la posizione del cursore, Ctrl+G una guida breve.
//   vi:   si parte nel modo comandi. i a I A o O entrano nel modo inserimento, Esc torna ai
//         comandi; h j k l (e le frecce) 0 $ gg G muovono il cursore; x dd yy p P u modificano;
//         / cerca; : apre la riga dei comandi (:w :q :q! :wq :x :w NOME, un numero va alla riga);
//         ZZ salva ed esce, ZQ esce senza salvare.
// openEditor(contenitore, shell, spec, fine) mostra l'editor e restituisce { close }; fine() viene
// chiamata quando si esce.

const NANO_KEYS = [["^G", "Guida", "g"], ["^O", "Salva", "o"], ["^X", "Esci", "x"], ["^K", "Taglia", "k"], ["^U", "Incolla", "u"], ["^C", "Posizione", "c"]];
const NANO_ASK_KEYS = [["S", "Sì", "s"], ["N", "No", "n"], ["^C", "Annulla", "c"]];
const NANO_NAME_KEYS = [["Invio", "Conferma", "Enter"], ["^C", "Annulla", "c"]];

const lineStartAt = (text, pos) => text.lastIndexOf("\n", pos - 1) + 1;
const lineEndAt = (text, pos) => {
    const end = text.indexOf("\n", pos);
    return end === -1 ? text.length : end;
};
const editorLineCount = text => text === "" ? 0 : text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
const editorBytes = text => new TextEncoder().encode(text).length;

function openEditor(container, sh, spec, onExit) {
    const nano = spec.kind === "nano";
    const box = el("section", `editor editor-${spec.kind}`);
    box.setAttribute("aria-label", nano ? "Editor nano" : `Editor ${spec.name}`);
    const title = el("div", "editor-title");
    const area = el("textarea", "editor-text");
    area.id = "editor-text";
    area.spellcheck = false;
    area.setAttribute("autocapitalize", "off");
    area.setAttribute("autocorrect", "off");
    area.setAttribute("autocomplete", "off");
    const status = el("div", "editor-status");
    status.id = "editor-status";
    status.setAttribute("role", "status");
    const bar = el("div", "editor-keys");
    bar.id = "editor-keys";
    box.append(title, area, status, bar);
    container.appendChild(box);

    // Lo stato: il nome del file, se ci sono modifiche, il modo (vi), la domanda in corso (nano)
    const st = {
        name: spec.path, modified: false, mode: nano ? "edit" : "normal",
        prompt: null, cmd: "", pending: "", yank: null, cut: "", undo: [], pos: 0, closed: false, search: ""
    };
    // vi non mostra l'a capo finale del file; nano sì (una riga vuota in fondo)
    area.value = nano ? spec.text : spec.text.replace(/\n$/, "");
    let saved = { value: area.value, start: 0, end: 0 };

    const remember = () => { saved = { value: area.value, start: area.selectionStart, end: area.selectionEnd }; };
    const say = text => { status.textContent = text; };
    const fileLabel = () => st.name || (nano ? "Nuovo buffer" : "[Senza nome]");
    const renderTitle = () => {
        title.innerHTML = "";
        if (nano) title.append(el("span", "", "GNU nano 7.2"), el("span", "editor-file", fileLabel()), el("span", "", st.modified ? "Modificato" : ""));
        else title.append(el("span", "", spec.name), el("span", "editor-file", fileLabel() + (st.modified ? " [+]" : "")), el("span", "", st.mode === "insert" ? "inserimento" : "comandi"));
        area.setAttribute("aria-label", `Testo di ${fileLabel()}, editor ${spec.name}`);
    };

    // I tasti dell'editor, come pulsanti: il fuoco resta nell'area di testo
    const keyButton = (label, text, action) => {
        const button = el("button", "editor-key");
        button.type = "button";
        button.append(el("kbd", "", label), document.createTextNode(` ${text}`));
        button.setAttribute("aria-label", `${label} ${text}`);
        button.onpointerdown = event => event.preventDefault();
        button.onclick = () => {
            area.focus();
            remember();
            action();
            if (!st.closed) remember();
        };
        return button;
    };
    const renderBar = () => {
        bar.innerHTML = "";
        if (nano) {
            const keys = st.prompt ? (st.prompt.kind === "ask" ? NANO_ASK_KEYS : NANO_NAME_KEYS) : NANO_KEYS;
            keys.forEach(([label, text, key]) => bar.appendChild(keyButton(label, text, () => key === "Enter" ? nanoKey({ key: "Enter" }) : nanoKey({ key, ctrlKey: label.startsWith("^") }))));
        } else {
            bar.appendChild(keyButton("Esc", "torna ai comandi", () => viKey("Escape")));
            bar.appendChild(el("span", "editor-tip", "i scrivi · Esc comandi · :w salva · :q esci · :wq salva ed esci · :q! esci senza salvare"));
        }
    };

    const close = () => {
        if (st.closed) return;
        st.closed = true;
        box.remove();
        onExit();
    };

    // Salva il testo: nano e vi aggiungono l'a capo finale, se manca
    const write = name => {
        let text = area.value;
        if (text !== "" && !text.endsWith("\n")) text += "\n";
        const result = simEditorSave(sh, spec, name, text);
        if (result.ok) {
            st.name = name;
            st.modified = false;
        }
        return { ...result, text };
    };

    // ---- nano ----
    const nanoPromptText = () => st.prompt.kind === "ask" ? "Salvare il buffer modificato? (S sì, N no, Ctrl+C annulla)" : `Nome del file da scrivere: ${st.prompt.value}`;
    const nanoWrite = (name, thenExit) => {
        if (!name) {
            say("[ Annullato ]");
            return;
        }
        const result = write(name);
        if (!result.ok) {
            say(`[ Errore scrivendo ${name}: ${result.error} ]`);
            return;
        }
        const lines = editorLineCount(result.text);
        say(`[ ${lines === 1 ? "Scritta 1 riga" : `Scritte ${lines} righe`} ]`);
        if (thenExit) close();
    };
    const nanoAction = key => {
        const text = area.value;
        const pos = area.selectionStart;
        if (key === "o") {
            st.prompt = { kind: "name", value: st.name || "", exit: false };
        } else if (key === "x") {
            if (!st.modified) return close();
            st.prompt = { kind: "ask" };
        } else if (key === "k") {
            const start = lineStartAt(text, pos);
            const end = Math.min(text.length, lineEndAt(text, pos) + 1);
            st.cut = text.slice(start, end);
            if (!st.cut) return;
            area.value = text.slice(0, start) + text.slice(end);
            area.setSelectionRange(start, start);
            st.modified = true;
        } else if (key === "u") {
            if (!st.cut) return;
            const start = lineStartAt(text, pos);
            const piece = st.cut.endsWith("\n") ? st.cut : `${st.cut}\n`;
            area.value = text.slice(0, start) + piece + text.slice(start);
            area.setSelectionRange(start + piece.length, start + piece.length);
            st.modified = true;
        } else if (key === "c") {
            const line = text.slice(0, pos).split("\n").length;
            const total = Math.max(1, text.split("\n").length);
            say(`[ riga ${line}/${total}, colonna ${pos - lineStartAt(text, pos) + 1} ]`);
            return;
        } else if (key === "g") {
            say("Guida: scrivi il testo; Ctrl+O salva, Ctrl+X esce, Ctrl+K taglia la riga, Ctrl+U la incolla. Nella barra in basso ^ vuol dire Ctrl.");
            return;
        } else {
            return;
        }
        renderAll();
        if (st.prompt) say(nanoPromptText());
    };
    // Un tasto per nano: true se l'editor lo ha usato (allora il browser non deve fare altro)
    const nanoKey = event => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if (st.prompt) {
            const prompt = st.prompt;
            if ((event.ctrlKey && key === "c") || key === "Escape") {
                st.prompt = null;
                say("[ Annullato ]");
            } else if (prompt.kind === "ask") {
                if (key === "s" || key === "y") st.prompt = { kind: "name", value: st.name || "", exit: true };
                else if (key === "n") return close(), true;
                else return true;
            } else if (key === "Enter") {
                st.prompt = null;
                nanoWrite(prompt.value, prompt.exit);
                if (st.closed) return true;
            } else if (key === "Backspace") {
                prompt.value = prompt.value.slice(0, -1);
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
                prompt.value += event.key;
            } else {
                return true;
            }
            renderAll();
            if (st.prompt) say(nanoPromptText());
            return true;
        }
        if (event.ctrlKey && !event.altKey && !event.metaKey && "oxkucg".includes(key) && key.length === 1) {
            nanoAction(key);
            return true;
        }
        return false;
    };

    // ---- vi ----
    const clampNormal = pos => {
        const text = area.value;
        const start = lineStartAt(text, Math.min(pos, text.length));
        const end = lineEndAt(text, start);
        return Math.max(start, Math.min(pos, end > start ? end - 1 : start));
    };
    // Nel modo comandi il carattere sotto il cursore è selezionato: si vede come il cursore a
    // blocco di vi
    const showNormal = () => {
        st.pos = clampNormal(st.pos);
        const end = lineEndAt(area.value, st.pos);
        area.setSelectionRange(st.pos, st.pos < end ? st.pos + 1 : st.pos);
    };
    const snapshot = () => {
        st.undo.push({ value: area.value, pos: st.pos });
        if (st.undo.length > 100) st.undo.shift();
    };
    const change = (value, pos) => {
        snapshot();
        area.value = value;
        st.pos = pos;
        st.modified = true;
    };
    const enterInsert = (pos, snap = true) => {
        if (snap) snapshot();
        st.mode = "insert";
        area.setSelectionRange(pos, pos);
        say("-- INSERISCI --");
        renderTitle();
    };
    const viMessageOpen = () => {
        if (!st.name) return "";
        if (spec.message) return `"${st.name}" [${spec.message}]`;
        if (spec.isNew) return `"${st.name}" [Nuovo]`;
        return `"${st.name}" ${editorLineCount(spec.text)}L, ${editorBytes(spec.text)}B`;
    };
    // :comando
    const viCommand = line => {
        const cmd = line.trim();
        const match = /^(w|wq|x|q|q!|w!|wq!|x!)(?:\s+(.+))?$/.exec(cmd);
        if (/^\d+$/.test(cmd)) {
            const lines = area.value.split("\n");
            const n = Math.max(1, Math.min(lines.length, Number(cmd)));
            st.pos = lines.slice(0, n - 1).reduce((sum, item) => sum + item.length + 1, 0);
            return;
        }
        if (cmd === "") return;
        if (!match) {
            say(`E492: Non è un comando dell'editor: ${cmd}`);
            return;
        }
        const [, verb, arg] = match;
        if (verb === "q" && arg === undefined) {
            if (st.modified) say("E37: Non salvato dopo modifica (aggiungi ! per eseguire comunque)");
            else close();
            return;
        }
        if (verb === "q!") return close();
        // w, wq, x: scrivono (x solo se ci sono modifiche o un nome nuovo)
        const name = arg || st.name;
        if (!name) {
            say("E32: Nessun nome di file");
            return;
        }
        if (!(verb.startsWith("x") && !st.modified && !arg)) {
            const result = write(name);
            if (!result.ok) {
                say(`"${name}" E212: Non posso aprire il file in scrittura`);
                return;
            }
            say(`"${name}"${result.isNew ? " [Nuovo]" : ""} ${editorLineCount(result.text)}L, ${editorBytes(result.text)}B scritti`);
        }
        if (verb !== "w" && verb !== "w!") close();
    };
    const findNext = (word, from) => {
        if (!word) return -1;
        const text = area.value;
        const next = text.indexOf(word, from + 1);
        return next !== -1 ? next : text.indexOf(word);
    };
    // Un tasto per vi (nel modo comandi, nella riga dei comandi o Esc dal modo inserimento)
    const viKey = key => {
        if (st.closed) return;
        if (st.mode === "insert") {
            if (key !== "Escape") return;
            st.mode = "normal";
            const pos = area.selectionStart;
            st.pos = pos > lineStartAt(area.value, pos) ? pos - 1 : pos;
            say("");
            renderTitle();
            showNormal();
            return;
        }
        if (st.mode === "command" || st.mode === "search") {
            const prefix = st.mode === "command" ? ":" : "/";
            if (key === "Escape") {
                st.mode = "normal";
                say("");
            } else if (key === "Enter") {
                const line = st.cmd;
                const wasSearch = st.mode === "search";
                st.mode = "normal";
                say("");
                if (wasSearch) {
                    st.search = line || st.search;
                    const found = findNext(st.search, st.pos);
                    if (found === -1) say(`E486: Modello non trovato: ${st.search}`);
                    else st.pos = found;
                } else {
                    viCommand(line);
                }
            } else if (key === "Backspace") {
                if (st.cmd === "") {
                    st.mode = "normal";
                    say("");
                } else {
                    st.cmd = st.cmd.slice(0, -1);
                    say(prefix + st.cmd);
                }
                return showNormal();
            } else if (key.length === 1) {
                st.cmd += key;
                say(prefix + st.cmd);
                return;
            }
            if (st.closed) return;
            renderTitle();
            showNormal();
            return;
        }
        // Modo comandi
        const text = area.value;
        const pos = st.pos;
        const start = lineStartAt(text, pos);
        const end = lineEndAt(text, pos);
        const column = pos - start;
        const pending = st.pending;
        st.pending = "";
        const toLine = (lineStart) => {
            const lineEnd = lineEndAt(area.value, lineStart);
            st.pos = Math.min(lineStart + column, Math.max(lineStart, lineEnd - 1));
        };
        const keyName = { ArrowLeft: "h", ArrowRight: "l", ArrowUp: "k", ArrowDown: "j", Home: "0", End: "$" }[key] || key;
        if (pending) {
            const pair = pending + keyName;
            if (pair === "dd") {
                const lines = text.split("\n");
                const index = text.slice(0, pos).split("\n").length - 1;
                st.yank = { line: lines[index] };
                lines.splice(index, 1);
                const value = lines.join("\n");
                const nextStart = lines.slice(0, Math.min(index, lines.length - 1)).reduce((sum, item) => sum + item.length + 1, 0);
                change(value, Math.max(0, nextStart));
            } else if (pair === "yy") {
                st.yank = { line: text.slice(start, end) };
            } else if (pair === "gg") {
                st.pos = 0;
            } else if (pair === "ZZ") {
                return viCommand("x");
            } else if (pair === "ZQ") {
                return close();
            }
            renderTitle();
            return showNormal();
        }
        switch (keyName) {
            case "i": return enterInsert(pos);
            case "a": return enterInsert(end > start ? pos + 1 : pos);
            case "I": return enterInsert(start);
            case "A": return enterInsert(end);
            case "o":
                change(`${text.slice(0, end)}\n${text.slice(end)}`, end + 1);
                return enterInsert(end + 1, false);
            case "O":
                change(`${text.slice(0, start)}\n${text.slice(start)}`, start);
                return enterInsert(start, false);
            case "h": st.pos = Math.max(start, pos - 1); break;
            case "l": st.pos = Math.min(Math.max(start, end - 1), pos + 1); break;
            case "j": if (end < text.length) toLine(end + 1); break;
            case "k": if (start > 0) toLine(lineStartAt(text, start - 1)); break;
            case "0": st.pos = start; break;
            case "$": st.pos = Math.max(start, end - 1); break;
            case "G": st.pos = lineStartAt(text, text.length); break;
            case "x":
                if (end > start) {
                    st.yank = { text: text[pos] };
                    change(text.slice(0, pos) + text.slice(pos + 1), pos);
                }
                break;
            case "p":
            case "P":
                if (!st.yank) break;
                if (st.yank.line !== undefined) {
                    if (keyName === "p") change(`${text.slice(0, end)}\n${st.yank.line}${text.slice(end)}`, end + 1);
                    else change(`${text.slice(0, start)}${st.yank.line}\n${text.slice(start)}`, start);
                } else {
                    const at = keyName === "p" && end > start ? pos + 1 : pos;
                    change(text.slice(0, at) + st.yank.text + text.slice(at), at);
                }
                break;
            case "u": {
                const last = st.undo.pop();
                if (!last) {
                    say("Già alla modifica più vecchia");
                    break;
                }
                area.value = last.value;
                st.pos = last.pos;
                st.modified = true;
                break;
            }
            case "d": case "y": case "g": case "Z":
                st.pending = keyName;
                return;
            case ":":
            case "/":
                st.mode = keyName === ":" ? "command" : "search";
                st.cmd = "";
                say(keyName);
                return;
            case "n": {
                const found = findNext(st.search, pos);
                if (found !== -1) st.pos = found;
                break;
            }
            default: return;
        }
        renderTitle();
        showNormal();
    };

    // ---- Tastiera e telefono ----
    const renderAll = () => {
        renderTitle();
        renderBar();
    };
    // Mentre l'editor intercetta i tasti (vi fuori dal modo inserimento, nano con una domanda)
    // quello che si scrive non entra nel testo
    const intercepting = () => nano ? st.prompt !== null : st.mode !== "insert";
    area.addEventListener("keydown", event => {
        if (st.closed || event.isComposing) return;
        if (event.key === "Tab" || event.metaKey) return;
        remember();
        if (nano) {
            if (nanoKey(event)) {
                event.preventDefault();
                if (!st.closed) remember();
            }
            return;
        }
        if (st.mode === "insert") {
            if (event.key === "Escape" || (event.ctrlKey && event.key === "[")) {
                event.preventDefault();
                viKey("Escape");
            }
            return;
        }
        if (event.ctrlKey || event.altKey) return;
        const special = ["Escape", "Enter", "Backspace", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
        if (event.key.length === 1 || special.includes(event.key)) {
            event.preventDefault();
            viKey(event.key);
            remember();
        }
    });
    // Il telefono spesso non dice quale tasto è stato premuto: si guarda che cosa è cambiato nel
    // testo, lo si annulla e lo si passa all'editor come se fossero tasti
    area.addEventListener("input", () => {
        if (st.closed) return;
        if (!intercepting()) {
            if (area.value !== saved.value) {
                st.modified = true;
                renderTitle();
            }
            remember();
            return;
        }
        const now = area.value;
        const before = saved.value;
        let head = 0;
        while (head < now.length && head < before.length && now[head] === before[head]) head++;
        let tail = 0;
        while (tail < now.length - head && tail < before.length - head && now[now.length - 1 - tail] === before[before.length - 1 - tail]) tail++;
        const typed = now.slice(head, now.length - tail);
        area.value = before;
        area.setSelectionRange(saved.start, saved.end);
        const keys = typed ? [...typed].map(char => char === "\n" ? "Enter" : char) : now.length < before.length ? ["Backspace"] : [];
        keys.forEach(key => {
            if (nano) nanoKey({ key });
            else viKey(key);
        });
        remember();
    });
    area.addEventListener("click", () => {
        if (!nano && st.mode === "normal") {
            st.pos = area.selectionStart;
            showNormal();
            remember();
        }
    });

    renderAll();
    if (nano) {
        const lines = editorLineCount(spec.text);
        say(spec.unreadable ? `[ Errore leggendo ${st.name}: ${spec.message} ]` : spec.message ? `[ ${spec.message} ]` : spec.isNew ? "[ File nuovo ]" : st.name ? `[ ${lines === 1 ? "Letta 1 riga" : `Lette ${lines} righe`} ]` : "");
        area.setSelectionRange(0, 0);
    } else {
        say(viMessageOpen());
        showNormal();
    }
    area.focus();
    remember();
    return { close };
}
