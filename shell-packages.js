// I pacchetti nella shell simulata (obiettivo 1.2): un sistema della famiglia Debian, come Ubuntu e
// Linux Mint. dpkg (-l, -L, -s, -S, -i, -r, -P), apt-get (update, upgrade, install, remove, purge,
// autoremove), apt-cache (search, show, policy) e apt (gli stessi, più list). rpm, yum, dnf e zypper
// non ci sono: servono sulle distribuzioni Red Hat e SUSE, e il messaggio lo spiega.
// Ogni shell ha il suo elenco (sh.packages): installare un pacchetto crea i suoi file e rende
// disponibili i suoi comandi (tree, htop, nginx...); toglierlo li fa sparire, come nano e vi se si
// toglie il loro pacchetto. Non c'è Internet: i pacchetti disponibili sono quelli dell'elenco qui sotto.
// L'output normale è in inglese (come con LC_ALL=C), gli errori in italiano.
// Si carica dopo shell-commands.js, a cui aggiunge i comandi.

// name: [versione, descrizione, sezione, file, opzioni]
//   opzioni: installed (installato all'inizio), essential (non si toglie), conf (file di
//   configurazione: dopo remove il pacchetto resta «rc» finché non si fa purge), kb (dimensione
//   del pacchetto da scaricare), size (spazio occupato, in kB)
const SIM_PACKAGES = {
    bash: ["5.2.21-2ubuntu4", "GNU Bourne Again SHell", "shells", ["/usr/bin/bash", "/etc/bash.bashrc", "/usr/share/doc/bash/README"], { installed: true, essential: true, size: 1900 }],
    coreutils: ["9.4-3ubuntu6", "GNU core utilities", "utils", ["/usr/bin/cat", "/usr/bin/cp", "/usr/bin/ls", "/usr/bin/mkdir", "/usr/bin/mv", "/usr/bin/rm", "/usr/bin/sort", "/usr/bin/touch", "/usr/bin/wc"], { installed: true, essential: true, size: 7432 }],
    grep: ["3.11-4build1", "GNU grep, egrep and fgrep", "utils", ["/usr/bin/grep", "/usr/share/doc/grep/README"], { installed: true, essential: true, size: 1106 }],
    sed: ["4.9-2build1", "GNU stream editor for filtering/transforming text", "utils", ["/usr/bin/sed"], { installed: true, essential: true, size: 820 }],
    tar: ["1.35+dfsg-3build1", "GNU version of the tar archiving utility", "utils", ["/usr/bin/tar", "/usr/share/doc/tar/README", "/usr/share/doc/tar/NEWS"], { installed: true, essential: true, size: 3156 }],
    gzip: ["1.12-1ubuntu3", "GNU compression utilities", "utils", ["/usr/bin/gzip", "/usr/bin/gunzip", "/usr/bin/zcat"], { installed: true, essential: true, size: 237 }],
    bzip2: ["1.0.8-5.1build0.1", "high-quality block-sorting file compressor - utilities", "utils", ["/usr/bin/bzip2", "/usr/bin/bunzip2", "/usr/bin/bzcat"], { installed: true, size: 102 }],
    "xz-utils": ["5.6.1+really5.4.5-1build0.1", "XZ-format compression utilities", "utils", ["/usr/bin/xz", "/usr/bin/unxz", "/usr/bin/xzcat"], { installed: true, size: 395 }],
    zip: ["3.0-13build1", "Archiver for .zip files", "utils", ["/usr/bin/zip"], { installed: true, size: 568 }],
    unzip: ["6.0-28ubuntu4", "De-archiver for .zip files", "utils", ["/usr/bin/unzip"], { installed: true, size: 384 }],
    findutils: ["4.9.0-5build1", "utilities for finding files--find, xargs", "utils", ["/usr/bin/find", "/usr/bin/xargs"], { installed: true, essential: true, size: 1804 }],
    nano: ["7.2-2build1", "small, friendly text editor inspired by Pico", "editors", ["/usr/bin/nano", "/etc/nanorc"], { installed: true, conf: ["/etc/nanorc"], size: 868 }],
    "vim-tiny": ["2:9.1.0016-1ubuntu7", "Vi IMproved - enhanced vi editor - compact version", "editors", ["/usr/bin/vim.tiny", "/etc/vim/vimrc.tiny"], { installed: true, conf: ["/etc/vim/vimrc.tiny"], size: 1730 }],
    sudo: ["1.9.15p5-3ubuntu5", "Provide limited super user privileges to specific users", "admin", ["/usr/bin/sudo", "/etc/sudoers"], { installed: true, essential: true, size: 3744 }],
    passwd: ["1:4.13+dfsg1-4ubuntu3", "change and administer password and group data", "admin", ["/usr/bin/passwd", "/usr/sbin/useradd", "/usr/sbin/userdel", "/usr/sbin/groupadd"], { installed: true, essential: true, size: 2632 }],
    procps: ["2:4.0.4-4ubuntu3", "/proc file system utilities", "admin", ["/usr/bin/ps", "/usr/bin/top", "/usr/bin/free", "/usr/bin/uptime"], { installed: true, size: 1964 }],
    iproute2: ["6.1.0-1ubuntu6", "networking tools", "net", ["/usr/bin/ip", "/usr/bin/ss"], { installed: true, size: 3232 }],
    "net-tools": ["2.10-0.1ubuntu4", "NET-3 networking toolkit", "net", ["/usr/sbin/ifconfig", "/usr/sbin/route", "/usr/bin/netstat"], { installed: true, size: 812 }],
    "iputils-ping": ["3:20240117-1build1", "Tools to test the reachability of network hosts", "net", ["/usr/bin/ping"], { installed: true, size: 116 }],
    "man-db": ["2.12.0-4build2", "tools for reading manual pages", "doc", ["/usr/bin/man", "/usr/bin/apropos", "/usr/bin/whatis"], { installed: true, size: 2880 }],
    plocate: ["1.1.19-2ubuntu2", "much faster locate", "utils", ["/usr/bin/plocate", "/usr/bin/locate", "/usr/sbin/updatedb"], { installed: true, size: 352 }],
    "openssh-server": ["1:9.6p1-3ubuntu13", "secure shell (SSH) server, for secure access from remote machines", "net", ["/usr/sbin/sshd", "/etc/ssh/sshd_config"], { installed: true, conf: ["/etc/ssh/sshd_config"], size: 1955 }],
    rsyslog: ["8.2312.0-3ubuntu9", "reliable system and kernel logging daemon", "admin", ["/usr/sbin/rsyslogd", "/etc/rsyslog.conf"], { installed: true, conf: ["/etc/rsyslog.conf"], size: 1724 }],
    // Da installare
    tree: ["2.1.1-2ubuntu3", "displays an indented directory tree, in color", "universe/utils", ["/usr/bin/tree", "/usr/share/doc/tree/README.gz", "/usr/share/man/man1/tree.1.gz"], { kb: 47.4, size: 108 }],
    htop: ["3.3.0-4build1", "interactive processes viewer", "utils", ["/usr/bin/htop", "/usr/share/man/man1/htop.1.gz"], { kb: 171, size: 434 }],
    nginx: ["1.24.0-2ubuntu7", "small, powerful, scalable web/proxy server", "httpd", ["/usr/sbin/nginx", "/etc/nginx/nginx.conf", "/var/www/html/index.nginx-debian.html"], { conf: ["/etc/nginx/nginx.conf"], kb: 520, size: 1407 }],
    apache2: ["2.4.58-1ubuntu8", "Apache HTTP Server", "httpd", ["/usr/sbin/apache2", "/etc/apache2/apache2.conf", "/var/www/html/index.html"], { conf: ["/etc/apache2/apache2.conf"], kb: 90, size: 465 }],
    "mariadb-server": ["1:10.11.8-0ubuntu0.24.04.1", "MariaDB database server binaries", "database", ["/usr/sbin/mariadbd", "/etc/mysql/mariadb.cnf"], { conf: ["/etc/mysql/mariadb.cnf"], kb: 3950, size: 20240 }],
    samba: ["2:4.19.5+dfsg-4ubuntu9", "SMB/CIFS file, print, and login server for Unix", "net", ["/usr/sbin/smbd", "/etc/samba/smb.conf"], { conf: ["/etc/samba/smb.conf"], kb: 1220, size: 4380 }],
    gimp: ["2.10.36-3ubuntu0.24.04.1", "GNU Image Manipulation Program", "universe/graphics", ["/usr/bin/gimp"], { kb: 4120, size: 19800 }],
    vlc: ["3.0.20-3build6", "multimedia player and streamer", "universe/video", ["/usr/bin/vlc"], { kb: 17, size: 180 }]
};
const SIM_PKG_DB_FILES = 41250;
const SIM_PKG_ARCH = name => SIM_PACKAGES[name][4].arch || "amd64";

// Lo stato dei pacchetti di questa shell: { nome: "ii" | "rc" } (rc: tolto, restano i file di configurazione)
function simPackages(sh) {
    if (!sh.packages) {
        sh.packages = {};
        Object.entries(SIM_PACKAGES).forEach(([name, spec]) => { if (spec[4].installed) sh.packages[name] = "ii"; });
    }
    return sh.packages;
}
const simPackageInstalled = (sh, name) => simPackages(sh)[name] === "ii";

// Crea o toglie i file di un pacchetto (come root)
function simPackageFiles(sh, name, add, keepConf) {
    const [, , , files, options] = SIM_PACKAGES[name];
    files.forEach(path => {
        const conf = (options.conf || []).includes(path);
        if (add) {
            if (simFindRaw(sh, path)) return;
            const program = /\/s?bin\/|\/games\//.test(path);
            const content = program ? "#!ELF (programma)\n" : conf ? `# Configurazione di ${name}\n` : `${name}\n`;
            simPut(sh, path, simNode("f", null, { mode: program ? 0o755 : 0o644, data: content, mtime: sh.clock }));
        } else if (!(conf && keepConf)) {
            const parts = splitPath(path);
            const parent = simFindRaw(sh, `/${parts.slice(0, -1).join("/")}`);
            if (parent && parent.children) delete parent.children[parts[parts.length - 1]];
        }
    });
}

const isRoot = sh => sh.user === "root";
const aptHeader = res => {
    res.print("Reading package lists... Done");
    res.print("Building dependency tree... Done");
    res.print("Reading state information... Done");
};
const aptSummary = (res, installed, removed) => res.print(`0 upgraded, ${installed} newly installed, ${removed} to remove and 0 not upgraded.`);
const aptLockError = res => {
    res.fail("E: Impossibile aprire il file di lock /var/lib/dpkg/lock-frontend - open (13: Permesso negato)", 100);
    res.fail("E: Impossibile acquisire il lock del frontend dpkg (/var/lib/dpkg/lock-frontend). Si è root?", 100);
    return res;
};
const kbText = kb => kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} kB`;

function aptInstall(sh, names, res) {
    const packages = simPackages(sh);
    const unknown = names.filter(name => !SIM_PACKAGES[name]);
    aptHeader(res);
    if (unknown.length) {
        unknown.forEach(name => res.fail(`E: Impossibile trovare il pacchetto ${name}`, 100));
        return res;
    }
    const fresh = [...new Set(names)].filter(name => packages[name] !== "ii");
    names.filter(name => packages[name] === "ii").forEach(name => res.print(`${name} is already the newest version (${SIM_PACKAGES[name][0]}).`));
    if (!fresh.length) {
        aptSummary(res, 0, 0);
        return res;
    }
    res.print("The following NEW packages will be installed:");
    res.print(`  ${fresh.join(" ")}`);
    aptSummary(res, fresh.length, 0);
    const kb = fresh.reduce((sum, name) => sum + (SIM_PACKAGES[name][4].kb || 100), 0);
    const size = fresh.reduce((sum, name) => sum + SIM_PACKAGES[name][4].size, 0);
    res.print(`Need to get ${kbText(Math.round(kb * 10) / 10)} of archives.`);
    res.print(`After this operation, ${kbText(size)} of additional disk space will be used.`);
    fresh.forEach((name, index) => {
        const [version, , section] = SIM_PACKAGES[name];
        res.print(`Get:${index + 1} http://archive.ubuntu.com/ubuntu noble/${section.startsWith("universe") ? "universe" : "main"} ${SIM_PKG_ARCH(name)} ${name} ${SIM_PKG_ARCH(name)} ${version} [${kbText(SIM_PACKAGES[name][4].kb || 100)}]`);
    });
    res.print(`Fetched ${kbText(Math.round(kb * 10) / 10)} in 1s (${kbText(Math.round(kb * 10) / 10)}/s)`);
    fresh.forEach(name => {
        const version = SIM_PACKAGES[name][0];
        res.print(`Selecting previously unselected package ${name}.`);
        res.print(`(Reading database ... ${SIM_PKG_DB_FILES} files and directories currently installed.)`);
        res.print(`Preparing to unpack .../${name}_${version.replace(/^\d+:/, "")}_${SIM_PKG_ARCH(name)}.deb ...`);
        res.print(`Unpacking ${name} (${version}) ...`);
    });
    fresh.forEach(name => {
        res.print(`Setting up ${name} (${SIM_PACKAGES[name][0]}) ...`);
        packages[name] = "ii";
        simPackageFiles(sh, name, true);
    });
    return res;
}

function aptRemove(sh, names, purge, assumeYes, res) {
    const packages = simPackages(sh);
    aptHeader(res);
    const unknown = names.filter(name => !SIM_PACKAGES[name]);
    if (unknown.length) {
        unknown.forEach(name => res.fail(`E: Impossibile trovare il pacchetto ${name}`, 100));
        return res;
    }
    const targets = [...new Set(names)].filter(name => packages[name] === "ii" || (purge && packages[name] === "rc"));
    names.filter(name => !targets.includes(name)).forEach(name => res.print(`Package '${name}' is not installed, so not removed`));
    if (!targets.length) {
        aptSummary(res, 0, 0);
        return res;
    }
    const essential = targets.filter(name => SIM_PACKAGES[name][4].essential);
    res.print("The following packages will be REMOVED:");
    res.print(`  ${targets.map(name => purge ? `${name}*` : name).join(" ")}`);
    if (essential.length) {
        res.print("WARNING: The following essential packages will be removed.");
        res.print("This should NOT be done unless you know exactly what you are doing!");
        res.print(`  ${essential.join(" ")}`);
        res.fail(`E: ${essential.join(", ")}: pacchetto essenziale per il sistema; nel simulatore non si toglie`, 100);
        return res;
    }
    aptSummary(res, 0, targets.length);
    const size = targets.filter(name => packages[name] === "ii").reduce((sum, name) => sum + SIM_PACKAGES[name][4].size, 0);
    if (size) res.print(`After this operation, ${kbText(size)} disk space will be freed.`);
    // apt-get chiede conferma prima di togliere: nel simulatore non si può rispondere
    if (!assumeYes) {
        res.print("Do you want to continue? [Y/n] Abort.");
        res.fail("apt-get: nel simulatore non si può rispondere alla domanda: aggiungi -y per dire di sì (apt-get remove -y PACCHETTO)", 1);
        return res;
    }
    res.print(`(Reading database ... ${SIM_PKG_DB_FILES} files and directories currently installed.)`);
    targets.forEach(name => {
        const version = SIM_PACKAGES[name][0];
        const conf = (SIM_PACKAGES[name][4].conf || []).length > 0;
        if (packages[name] === "ii") res.print(`Removing ${name} (${version}) ...`);
        if (purge && conf) res.print(`Purging configuration files for ${name} (${version}) ...`);
        simPackageFiles(sh, name, false, !purge);
        if (conf && !purge) packages[name] = "rc";
        else delete packages[name];
    });
    return res;
}

function aptGetRun(sh, args, apt = false) {
    const res = simOutput();
    const options = args.filter(arg => arg.startsWith("-"));
    const [action, ...names] = args.filter(arg => !arg.startsWith("-"));
    const assumeYes = options.some(option => /^-[a-z]*y/.test(option) || option === "--yes" || option === "--assume-yes");
    const tool = apt ? "apt" : "apt-get";
    if (!action) {
        res.fail(`${tool}: manca il comando, per esempio: ${tool} install PACCHETTO (oppure update, upgrade, remove, purge${apt ? ", search, show, list" : ""})`, 1);
        return res;
    }
    if (apt && ["search", "show", "policy"].includes(action)) return aptCacheRun(sh, [action, ...names], true);
    if (apt && action === "list") return aptListRun(sh, options);
    if (!["update", "upgrade", "install", "remove", "purge", "autoremove", "full-upgrade", "dist-upgrade"].includes(action)) {
        res.fail(`E: Operazione non valida ${action}`, 100);
        return res;
    }
    if (!isRoot(sh)) return aptLockError(res);
    if (action === "update") {
        res.print("Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease");
        res.print("Hit:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease");
        res.print("Hit:3 http://security.ubuntu.com/ubuntu noble-security InRelease");
        res.print("Reading package lists... Done");
        if (apt) {
            res.print("Building dependency tree... Done");
            res.print("Reading state information... Done");
            res.print("All packages are up to date.");
        }
        return res;
    }
    if (["upgrade", "full-upgrade", "dist-upgrade", "autoremove"].includes(action)) {
        aptHeader(res);
        if (action !== "autoremove") res.print("Calculating upgrade... Done");
        aptSummary(res, 0, 0);
        return res;
    }
    if (!names.length) {
        res.fail(`${tool}: manca il nome del pacchetto: ${tool} ${action} PACCHETTO`, 100);
        return res;
    }
    if (action === "install") return aptInstall(sh, names, res);
    return aptRemove(sh, names, action === "purge", assumeYes, res);
}

// apt-cache search PAROLA: cerca nel nome e nella descrizione (anche dei pacchetti non installati)
function aptCacheRun(sh, args, apt = false) {
    const res = simOutput();
    const [action, ...words] = args.filter(arg => !arg.startsWith("-"));
    const tool = apt ? "apt" : "apt-cache";
    if (action === "search") {
        if (!words.length) {
            res.fail(`E: ${tool} search: manca la parola da cercare`, 100);
            return res;
        }
        const patterns = words.map(word => new RegExp(word.replace(/[.+?^${}()|[\]\\*]/g, "\\$&"), "i"));
        const found = Object.keys(SIM_PACKAGES).sort().filter(name => patterns.every(re => re.test(name) || re.test(SIM_PACKAGES[name][1])));
        if (apt) {
            res.print("Sorting... Done");
            res.print("Full Text Search... Done");
            found.forEach(name => {
                const installed = simPackageInstalled(sh, name) ? " [installed]" : "";
                res.print(`${name}/noble ${SIM_PACKAGES[name][0]} ${SIM_PKG_ARCH(name)}${installed}`);
                res.print(`  ${SIM_PACKAGES[name][1]}`);
                res.print("");
            });
        } else {
            found.forEach(name => res.print(`${name} - ${SIM_PACKAGES[name][1]}`));
        }
        return res;
    }
    if (action === "show" || action === "policy") {
        if (!words.length) {
            res.fail(`E: ${tool} ${action}: manca il nome del pacchetto`, 100);
            return res;
        }
        words.forEach((name, index) => {
            const spec = SIM_PACKAGES[name];
            if (!spec) {
                res.fail(action === "show" ? `E: Nessun pacchetto trovato: ${name}` : `N: Impossibile trovare il pacchetto ${name}`, action === "show" ? 100 : 0);
                return;
            }
            const [version, description, section, , options] = spec;
            if (action === "policy") {
                const installed = simPackageInstalled(sh, name) ? version : "(none)";
                res.print(`${name}:`);
                res.print(`  Installed: ${installed}`);
                res.print(`  Candidate: ${version}`);
                return;
            }
            if (index) res.print("");
            res.print(`Package: ${name}`);
            res.print(`Version: ${version}`);
            res.print(`Priority: ${options.essential ? "required" : "optional"}`);
            res.print(`Section: ${section}`);
            res.print(`Installed-Size: ${options.size}`);
            res.print(`Architecture: ${SIM_PKG_ARCH(name)}`);
            res.print(`Filename: pool/${section.startsWith("universe") ? "universe" : "main"}/${name[0]}/${name}/${name}_${version.replace(/^\d+:/, "")}_${SIM_PKG_ARCH(name)}.deb`);
            res.print(`Description: ${description}`);
        });
        return res;
    }
    res.fail(`E: Operazione non valida ${action || ""}`.trimEnd(), 100);
    return res;
}

// apt list --installed (o apt list NOME)
function aptListRun(sh, options) {
    const res = simOutput();
    res.print("Listing... Done");
    const packages = simPackages(sh);
    Object.keys(SIM_PACKAGES).sort().forEach(name => {
        const installed = packages[name] === "ii";
        if (options.includes("--installed") && !installed) return;
        res.print(`${name}/noble${installed ? ",now" : ""} ${SIM_PACKAGES[name][0]} ${SIM_PKG_ARCH(name)}${installed ? " [installed]" : ""}`);
    });
    return res;
}

// dpkg -l: l'elenco con lo stato (ii installato, rc tolto ma con la configurazione)
function dpkgList(sh, patterns, res) {
    const packages = simPackages(sh);
    const toRegex = pattern => new RegExp(`^${pattern.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".")}$`);
    let names = Object.keys(packages).sort();
    if (patterns.length) {
        const matched = new Set();
        patterns.forEach(pattern => {
            const re = toRegex(pattern);
            const found = names.filter(name => re.test(name));
            if (!found.length) res.fail(`dpkg-query: nessun pacchetto corrisponde a ${pattern}`, 1);
            found.forEach(name => matched.add(name));
        });
        names = names.filter(name => matched.has(name));
    }
    if (!names.length) return res;
    const nameWidth = Math.max(14, ...names.map(name => name.length));
    const versionWidth = Math.max(7, ...names.map(name => SIM_PACKAGES[name][0].length));
    const used = 4 + nameWidth + 1 + versionWidth + 1 + 12 + 1;
    const descWidth = Math.max(11, 81 - used, ...names.map(name => SIM_PACKAGES[name][1].length));
    res.print("Desired=Unknown/Install/Remove/Purge/Hold");
    res.print("| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend");
    res.print("|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)");
    res.print(`||/ ${"Name".padEnd(nameWidth)} ${"Version".padEnd(versionWidth)} ${"Architecture"} Description`);
    res.print(`+++-${"=".repeat(nameWidth)}-${"=".repeat(versionWidth)}-${"=".repeat(12)}-${"=".repeat(descWidth)}`);
    names.forEach(name => {
        const [version, description] = SIM_PACKAGES[name];
        res.print(`${packages[name]}  ${name.padEnd(nameWidth)} ${version.padEnd(versionWidth)} ${SIM_PKG_ARCH(name).padEnd(12)} ${description}`);
    });
    return res;
}

function dpkgRun(sh, args) {
    const res = simOutput();
    const [action, ...rest] = args;
    const packages = simPackages(sh);
    const longNames = { "--list": "-l", "--listfiles": "-L", "--status": "-s", "--search": "-S", "--install": "-i", "--remove": "-r", "--purge": "-P" };
    const option = longNames[action] || action;
    if (option === "-l") return dpkgList(sh, rest, res);
    if (option === "-L" || option === "-s") {
        if (!rest.length) {
            res.fail(`dpkg-query: ${option} vuole almeno il nome di un pacchetto`, 2);
            return res;
        }
        rest.forEach((name, index) => {
            if (packages[name] !== "ii") {
                res.fail(option === "-L" ? `dpkg-query: il pacchetto «${name}» non è installato` : `dpkg-query: il pacchetto «${name}» non è installato e non ci sono informazioni`, 1);
                return;
            }
            const [version, description, section, files, options] = SIM_PACKAGES[name];
            if (option === "-L") {
                // Le directory e i file, in ordine come nell'elenco di dpkg
                const paths = new Set(files);
                files.forEach(path => {
                    const parts = splitPath(path);
                    parts.slice(0, -1).forEach((_, i) => paths.add(`/${parts.slice(0, i + 1).join("/")}`));
                });
                res.print("/.");
                [...paths].sort(byteCompare).forEach(path => res.print(path));
                return;
            }
            if (index) res.print("");
            res.print(`Package: ${name}`);
            if (options.essential) res.print("Essential: yes");
            res.print("Status: install ok installed");
            res.print(`Priority: ${options.essential ? "required" : "optional"}`);
            res.print(`Section: ${section.replace(/^universe\//, "")}`);
            res.print(`Installed-Size: ${options.size}`);
            res.print(`Architecture: ${SIM_PKG_ARCH(name)}`);
            res.print(`Version: ${version}`);
            if (options.conf) res.print(`Conffiles:\n${options.conf.map(path => ` ${path}`).join("\n")}`);
            res.print(`Description: ${description}`);
        });
        return res;
    }
    if (option === "-S") {
        if (!rest.length) {
            res.fail("dpkg-query: -S vuole un percorso o una parte del nome del file", 2);
            return res;
        }
        rest.forEach(pattern => {
            const lines = [];
            Object.keys(packages).filter(name => packages[name] === "ii").sort().forEach(name => {
                SIM_PACKAGES[name][3].filter(path => path.includes(pattern)).forEach(path => lines.push(`${name}: ${path}`));
            });
            if (!lines.length) res.fail(`dpkg-query: nessun percorso corrisponde al modello ${pattern}`, 1);
            lines.forEach(line => res.print(line));
        });
        return res;
    }
    if (option === "-i" || option === "-r" || option === "-P") {
        if (!isRoot(sh)) {
            res.fail("dpkg: errore: l'operazione richiesta richiede i privilegi di superutente (usa sudo)", 2);
            return res;
        }
        if (!rest.length) {
            res.fail(`dpkg: errore: ${option} vuole almeno ${option === "-i" ? "un file .deb" : "il nome di un pacchetto"}`, 2);
            return res;
        }
        if (option === "-i") {
            rest.forEach(path => {
                try {
                    simGet(sh, path);
                    res.fail(`dpkg-deb: errore: «${path}» non è un archivio in formato Debian (nel simulatore i pacchetti si installano con apt-get install)`, 2);
                } catch (error) {
                    if (!(error instanceof SimError)) throw error;
                    res.fail(`dpkg: errore: impossibile accedere all'archivio «${path}»: ${error.message}`, 2);
                }
            });
            return res;
        }
        const purge = option === "-P";
        rest.forEach(name => {
            if (!SIM_PACKAGES[name] || !packages[name] || (!purge && packages[name] === "rc")) {
                res.print(`dpkg: warning: ignoring request to remove ${name} which isn't installed`);
                return;
            }
            if (SIM_PACKAGES[name][4].essential) {
                res.fail(`dpkg: errore elaborando il pacchetto ${name} (--remove):\n è un pacchetto essenziale: non va tolto`, 1);
                return;
            }
            const version = SIM_PACKAGES[name][0];
            const conf = (SIM_PACKAGES[name][4].conf || []).length > 0;
            res.print(`(Reading database ... ${SIM_PKG_DB_FILES} files and directories currently installed.)`);
            if (packages[name] === "ii") res.print(`Removing ${name} (${version}) ...`);
            if (purge && conf) res.print(`Purging configuration files for ${name} (${version}) ...`);
            simPackageFiles(sh, name, false, !purge);
            if (conf && !purge) packages[name] = "rc";
            else delete packages[name];
        });
        return res;
    }
    res.fail(`dpkg: nel simulatore ci sono -l, -L, -s, -S, -i, -r e -P (per esempio dpkg -l, dpkg -L nano, dpkg -S /usr/bin/nano)`, 2);
    return res;
}

// tree (pacchetto tree): l'albero delle directory, con i caratteri ASCII come con LC_ALL=C.
// -a anche i file nascosti, -d solo le directory, -L N al massimo N livelli
function treeRun(sh, args) {
    const res = simOutput();
    let all = false;
    let dirsOnly = false;
    let depth = Infinity;
    const roots = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "-L") {
            depth = Number(args[++i]);
            if (!(depth >= 1)) {
                res.fail("tree: dopo -L serve un numero di livelli maggiore di 0", 1);
                return res;
            }
        } else if (/^-[ad]+$/.test(arg)) {
            if (arg.includes("a")) all = true;
            if (arg.includes("d")) dirsOnly = true;
        } else if (arg.startsWith("-")) {
            res.fail(`tree: nel simulatore ci sono le opzioni -a, -d e -L N (${arg} no)`, 1);
            return res;
        } else {
            roots.push(arg);
        }
    }
    if (!roots.length) roots.push(".");
    let dirs = 0;
    let files = 0;
    let failed = false;
    const walk = (dir, path, prefix, level) => {
        const names = sortedNames(dir).filter(name => all || !name.startsWith("."));
        const shown = names.filter(name => {
            if (!dirsOnly) return true;
            const node = dir.children[name];
            return node.type === "d" || (node.type === "l" && linkIsDir(`${path}/${name}`));
        });
        shown.forEach((name, index) => {
            const node = dir.children[name];
            const last = index === shown.length - 1;
            let label = name;
            let isDir = node.type === "d";
            if (node.type === "l") {
                label = `${name} -> ${node.target}`;
                isDir = linkIsDir(`${path}/${name}`);
            }
            res.print(`${prefix}${last ? "`-- " : "|-- "}${label}`);
            if (isDir) dirs++;
            else files++;
            if (node.type === "d" && level < depth) {
                if (canAccess(sh, node, 4) && canAccess(sh, node, 1)) walk(node, `${path}/${name}`, `${prefix}${last ? "    " : "|   "}`, level + 1);
            }
        });
    };
    const linkIsDir = path => {
        try {
            const found = simLookup(sh, path);
            return Boolean(found.node && found.node.type === "d");
        } catch (error) {
            return false;
        }
    };
    roots.forEach(root => {
        let node = null;
        try {
            node = simLookup(sh, root).node;
        } catch (error) {
            if (!(error instanceof SimError)) throw error;
        }
        if (!node || node.type !== "d" || !canAccess(sh, node, 4)) {
            res.print(`${root}  [error opening dir]`);
            failed = true;
            return;
        }
        res.print(root);
        dirs++;
        walk(node, root.replace(/\/+$/, "") || "/", "", 1);
    });
    res.print("");
    res.print(`${dirs} director${dirs === 1 ? "y" : "ies"}${dirsOnly ? "" : `, ${files} file${files === 1 ? "" : "s"}`}`);
    if (failed) res.code = 2;
    return res;
}

// I programmi grafici o interattivi dei pacchetti: ci sono (dopo l'installazione) ma non si aprono
const simProgram = (name, text) => ({ pkg: name, run: () => ({ err: `${text}\n`, code: 1 }) });

// Dove sono i gestori di pacchetti delle altre famiglie
const SIM_OTHER_FAMILY = "questo sistema è della famiglia Debian, come Ubuntu e Linux Mint: i pacchetti sono .deb e si gestiscono con dpkg e apt-get";
Object.assign(SIM_MISSING_HINTS, {
    rpm: `${SIM_OTHER_FAMILY}. rpm serve per i pacchetti .rpm delle distribuzioni Red Hat (Fedora, CentOS, RHEL) e SUSE`,
    yum: `${SIM_OTHER_FAMILY}. yum (oggi dnf) installa i pacchetti RPM su Red Hat, CentOS e Fedora`,
    dnf: `${SIM_OTHER_FAMILY}. dnf installa i pacchetti RPM su Fedora e Red Hat`,
    zypper: `${SIM_OTHER_FAMILY}. zypper installa i pacchetti RPM su openSUSE e SUSE`
});

SIM_MAN.push(
    {
        name: "apt-get", section: 8, summary: "installa, aggiorna e toglie i pacchetti (Debian, Ubuntu, Mint)",
        synopsis: ["apt-get [-y] install PACCHETTO...", "apt-get [-y] remove|purge PACCHETTO...", "apt-get update|upgrade"],
        description: ["Scarica i pacchetti dai repository, con quelli di cui hanno bisogno (le dipendenze), e li installa con dpkg. Cambia il sistema: si usa da root, cioè con sudo.",
            "update aggiorna l'elenco dei pacchetti disponibili, upgrade installa le versioni nuove di quelli già presenti."],
        options: [["install", "installa i pacchetti indicati"], ["remove", "toglie i pacchetti, ma lascia i loro file di configurazione"], ["purge", "toglie i pacchetti e i loro file di configurazione"],
            ["update", "rilegge l'elenco dei pacchetti dai repository"], ["upgrade", "aggiorna i pacchetti installati"], ["-y", "risponde sì alle domande"]],
        see: ["apt-cache(8)", "dpkg(1)"]
    },
    {
        name: "apt-cache", section: 8, summary: "cerca informazioni sui pacchetti disponibili",
        synopsis: ["apt-cache search PAROLA...", "apt-cache show PACCHETTO", "apt-cache policy PACCHETTO"],
        description: ["Legge l'elenco dei pacchetti (anche di quelli non installati): non cambia niente, quindi non serve root."],
        options: [["search", "cerca la parola nel nome e nella descrizione"], ["show", "mostra versione, dimensione e descrizione"], ["policy", "dice la versione installata e quella disponibile"]],
        see: ["apt-get(8)"]
    },
    {
        name: "dpkg", section: 1, summary: "gestisce i pacchetti .deb installati sul sistema",
        synopsis: ["dpkg -l [MODELLO]", "dpkg -L PACCHETTO", "dpkg -S FILE", "dpkg -i FILE.deb", "dpkg -r|-P PACCHETTO"],
        description: ["Lavora sui pacchetti .deb, uno per uno, senza scaricare niente e senza pensare alle dipendenze: per quello c'è apt-get. Nell'elenco di dpkg -l, ii vuol dire installato, rc tolto ma con i file di configurazione ancora presenti."],
        options: [["-l", "elenca i pacchetti installati, con versione e descrizione"], ["-L PACCHETTO", "elenca i file installati dal pacchetto"], ["-s PACCHETTO", "mostra lo stato del pacchetto"],
            ["-S FILE", "dice quale pacchetto ha installato il file"], ["-i FILE.deb", "installa un pacchetto già scaricato"], ["-r PACCHETTO", "toglie il pacchetto, lascia la configurazione"], ["-P PACCHETTO", "toglie anche la configurazione"]],
        see: ["apt-get(8)"]
    }
);

Object.assign(SIM_COMMANDS, {
    "apt-get": { run: (sh, args) => aptGetRun(sh, args) },
    apt: {
        run: (sh, args, stdin, ctx = {}) => {
            const res = aptGetRun(sh, args, true);
            // Come apt vero: in una pipe avvisa che il suo output può cambiare
            if (!ctx.tty) res.err = `\nWARNING: apt does not have a stable CLI interface. Use with caution in scripts.\n\n${res.err}`;
            return res;
        }
    },
    "apt-cache": { run: (sh, args) => aptCacheRun(sh, args) },
    dpkg: { run: dpkgRun },
    tree: { pkg: "tree", run: treeRun },
    htop: simProgram("htop", "htop: è un programma interattivo, a schermo intero: nel simulatore usa top (o ps aux)"),
    nginx: {
        pkg: "nginx",
        run: (sh, args) => args.includes("-v") ? { err: "nginx version: nginx/1.24.0 (Ubuntu)\n" } : { err: "nginx: nel simulatore il server web non parte (prova nginx -v per la versione)\n", code: 1 }
    },
    gimp: simProgram("gimp", "gimp: è un programma grafico: nel simulatore non si apre"),
    vlc: simProgram("vlc", "vlc: è un programma grafico: nel simulatore non si apre")
});
// nano e vi vengono dai loro pacchetti: se li togli, spariscono
SIM_COMMANDS.nano.pkg = "nano";
SIM_COMMANDS.vi.pkg = "vim-tiny";
SIM_COMMANDS.vim.pkg = "vim-tiny";
