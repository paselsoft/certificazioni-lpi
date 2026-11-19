// Dove sono memorizzati i dati, nella shell simulata (obiettivo 4.3): i processi (ps, top, uptime),
// la memoria (free, /proc/meminfo), i messaggi del kernel (dmesg), i registri (/var/log,
// journalctl), il kernel in /boot, i dispositivi in /dev, /proc e /sys.
// È un piccolo computer finto e fisso: le risposte non vengono da un sistema vero e non si
// confrontano con Bash. Si carica dopo shell-commands.js, a cui aggiunge i comandi; i file li
// aggiunge simBaseTree (shell-sim.js) chiamando simSystemTree.

const SIM_BOOT_MINUTES = 2 * 24 * 60 + 48;   // il computer è acceso da 2 giorni e 48 minuti
const SIM_SHELL_PID = 4242;                  // la shell di anna ($$)

// I processi: pid, ppid, utente, terminale, stato, minuti fa (avvio), memoria (KiB), %CPU, %MEM,
// tempo di CPU (secondi), comando completo (args) e nome breve (comm)
const SIM_PROCESSES = [
    [1, 0, "root", "?", "Ss", SIM_BOOT_MINUTES, 167532, 13020, 0.0, 0.3, 4, "/sbin/init splash", "systemd"],
    [2, 0, "root", "?", "S", SIM_BOOT_MINUTES, 0, 0, 0.0, 0.0, 0, "[kthreadd]", "kthreadd"],
    [412, 1, "root", "?", "Ss", SIM_BOOT_MINUTES, 48284, 15360, 0.0, 0.3, 2, "/usr/lib/systemd/systemd-journald", "systemd-journal"],
    [598, 1, "syslog", "?", "Ssl", SIM_BOOT_MINUTES - 1, 222508, 6144, 0.0, 0.1, 1, "/usr/sbin/rsyslogd -n -iNONE", "rsyslogd"],
    [605, 1, "root", "?", "Ss", SIM_BOOT_MINUTES - 1, 9480, 2816, 0.0, 0.0, 0, "/usr/sbin/cron -f -P", "cron"],
    [640, 1, "root", "?", "Ss", SIM_BOOT_MINUTES - 1, 12016, 7936, 0.0, 0.1, 0, "/usr/sbin/sshd -D", "sshd"],
    [702, 1, "root", "tty1", "Ss+", SIM_BOOT_MINUTES - 1, 6176, 1920, 0.0, 0.0, 0, "/sbin/agetty -o -p --noclear tty1 linux", "agetty"],
    [1180, 640, "root", "?", "Ss", 95, 14716, 9216, 0.0, 0.2, 0, "sshd: luca [priv]", "sshd"],
    [1235, 1180, "luca", "?", "S", 95, 14980, 6656, 0.0, 0.1, 0, "sshd: luca@pts/1", "sshd"],
    [1236, 1235, "luca", "pts/1", "Ss", 95, 8792, 5504, 0.0, 0.1, 0, "-bash", "bash"],
    [1302, 1236, "luca", "pts/1", "S+", 80, 11916, 4608, 0.3, 0.1, 14, "top", "top"],
    [4200, 640, "root", "?", "Ss", 12, 14716, 9088, 0.0, 0.2, 0, "sshd: anna [priv]", "sshd"],
    [4241, 4200, "anna", "?", "S", 12, 14980, 6528, 0.0, 0.1, 0, "sshd: anna@pts/0", "sshd"],
    [SIM_SHELL_PID, 4241, "anna", "pts/0", "Ss", 12, 8920, 5632, 0.0, 0.1, 0, "-bash", "bash"]
].map(([pid, ppid, user, tty, stat, ago, vsz, rss, cpu, mem, seconds, args, comm]) => ({ pid, ppid, user, tty, stat, ago, vsz, rss, cpu, mem, seconds, args, comm }));

// La memoria, in KiB: used = total - free - buff/cache, come in free
const SIM_MEMORY = { total: 4009140, free: 1918300, shared: 12000, buffers: 98740, cached: 1160000, available: 2905000, swapTotal: 2097148, swapFree: 2097148 };
SIM_MEMORY.buffCache = SIM_MEMORY.buffers + SIM_MEMORY.cached;
SIM_MEMORY.used = SIM_MEMORY.total - SIM_MEMORY.free - SIM_MEMORY.buffCache;

const KERNEL_VERSION = "6.8.0-49-generic";

// I messaggi del kernel: secondi dall'accensione e testo. La chiavetta (sdb) è stata inserita dopo due ore
const SIM_KERNEL_LOG = [
    [0.000000, `Linux version ${KERNEL_VERSION} (gcc version 13.2.0) #49-Ubuntu SMP`],
    [0.000000, `Command line: BOOT_IMAGE=/boot/vmlinuz-${KERNEL_VERSION} root=/dev/sda2 ro quiet splash`],
    [0.012345, "Memory: 3891200K/4193848K available"],
    [0.231004, "smpboot: CPU0: Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz"],
    [1.104512, "usb usb1: New USB device found, idVendor=1d6b, idProduct=0001"],
    [1.204331, "ata1.00: ATA-6: VBOX HARDDISK, 1.0, max UDMA/133"],
    [1.315210, "sd 0:0:0:0: [sda] 41943040 512-byte logical blocks: (21.5 GB/20.0 GiB)"],
    [1.318992, " sda: sda1 sda2"],
    [1.402118, "sr 1:0:0:0: [sr0] scsi3-mmc drive: 32x/32x xa/form2 tray"],
    [2.103452, "usb 1-1: new full-speed USB device number 2 using ohci-pci"],
    [2.511873, "usb 1-1: Product: USB Tablet"],
    [3.880045, "EXT4-fs (sda2): mounted filesystem with ordered data mode. Quota mode: none."],
    [4.512440, "e1000 0000:00:03.0 enp0s3: renamed from eth0"],
    [6.031277, "e1000: enp0s3 NIC Link is Up 1000 Mbps Full Duplex, Flow Control: RX"],
    [7245.118803, "usb 1-2: new high-speed USB device number 3 using ehci-pci"],
    [7245.402331, "usb-storage 1-2:1.0: USB Mass Storage device detected"],
    [7246.517290, "sd 2:0:0:0: [sdb] 15633408 512-byte logical blocks: (8.00 GB/7.45 GiB)"],
    [7246.521004, " sdb: sdb1"]
];

// I messaggi dei servizi: minuti fa, programma[pid] e testo (dal più vecchio)
const SIM_SERVICE_LOG = [
    [SIM_BOOT_MINUTES - 1, "rsyslogd", 598, "[origin software=\"rsyslogd\"] start"],
    [SIM_BOOT_MINUTES - 1, "systemd", 1, "Started cron.service - Regular background program processing daemon."],
    [SIM_BOOT_MINUTES - 1, "sshd", 640, "Server listening on 0.0.0.0 port 22."],
    [95, "sshd", 1180, "Accepted password for luca from 192.168.1.20 port 51522 ssh2"],
    [95, "systemd-logind", 520, "New session 3 of user luca."],
    [60, "CRON", 3901, "(root) CMD (cd / && run-parts --report /etc/cron.hourly)"],
    [31, "sshd", 4102, "Failed password for invalid user admin from 203.0.113.7 port 40112 ssh2"],
    [30, "sshd", 4102, "Connection closed by invalid user admin 203.0.113.7 port 40112 [preauth]"],
    [12, "sshd", 4200, "Accepted password for anna from 192.168.1.20 port 51790 ssh2"],
    [12, "systemd-logind", 520, "New session 7 of user anna."],
    [2, "CRON", 4290, "(root) CMD (command -v debian-sa1 > /dev/null && debian-sa1 1 1)"]
];

const two = number => String(number).padStart(2, "0");
const syslogDate = time => {
    const date = new Date(time);
    return `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, " ")} ${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}`;
};
const bootTime = () => SIM_START - SIM_BOOT_MINUTES * 60000;
const kernelLine = ([seconds, text]) => `[${seconds.toFixed(6).padStart(12)}] ${text}`;

// Le righe di syslog, kern.log e auth.log, nell'ordine del tempo
function simLogLines(which) {
    const kernel = SIM_KERNEL_LOG.map(([seconds, text]) => ({ time: bootTime() + Math.round(seconds * 1000), text: `lpi kernel: ${kernelLine([seconds, text])}` }));
    const services = SIM_SERVICE_LOG.map(([ago, ident, pid, text]) => ({ time: SIM_START - ago * 60000, ident, text: `lpi ${ident}[${pid}]: ${text}` }));
    let lines = which === "kern" ? kernel : which === "auth" ? services.filter(line => /^(sshd|systemd-logind|sudo)$/.test(line.ident)) : [...kernel, ...services];
    return lines.sort((a, b) => a.time - b.time).map(line => `${syslogDate(line.time)} ${line.text}`);
}

// I file che questo modulo aggiunge al file system di base
function simSystemTree() {
    const lines = which => simLogLines(which).join("\n") + "\n";
    const proc = (content, extra = {}) => ({ owner: "root", group: "root", mode: "444", content, fakeSize: 0, age: 0, ...extra });
    const sys = content => ({ owner: "root", group: "root", mode: "444", content, fakeSize: 4096, age: 0 });
    const device = (spec, group, mode) => ({ owner: "root", group, mode, device: spec, age: SIM_BOOT_MINUTES });
    const meminfo = [["MemTotal", SIM_MEMORY.total], ["MemFree", SIM_MEMORY.free], ["MemAvailable", SIM_MEMORY.available], ["Buffers", SIM_MEMORY.buffers], ["Cached", SIM_MEMORY.cached],
        ["SwapCached", 0], ["Active", 1204512], ["Inactive", 640888], ["SwapTotal", SIM_MEMORY.swapTotal], ["SwapFree", SIM_MEMORY.swapFree], ["Shmem", SIM_MEMORY.shared]]
        .map(([key, value]) => `${`${key}:`.padEnd(16)}${String(value).padStart(8)} kB`).join("\n") + "\n";
    const cpu = index => [["processor", index], ["vendor_id", "GenuineIntel"], ["model name", "Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz"], ["cpu MHz", "1800.000"],
        ["cache size", "6144 KB"], ["cpu cores", 2], ["flags", "fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx lm constant_tsc"]]
        .map(([key, value]) => `${key.padEnd(16)}: ${value}`).join("\n") + "\n";
    const status = process => `Name:\t${process.comm}\nState:\t${process.stat[0]} (${process.stat[0] === "R" ? "running" : "sleeping"})\nPid:\t${process.pid}\nPPid:\t${process.ppid}\nUid:\t${(SIM_USERS[process.user] || { uid: 0 }).uid}\nVmRSS:\t${String(process.rss).padStart(8)} kB\n`;
    const procDirs = {};
    const procFiles = {};
    SIM_PROCESSES.filter(process => [1, SIM_SHELL_PID].includes(process.pid)).forEach(process => {
        procDirs[`/proc/${process.pid}`] = { owner: process.user === "anna" ? "anna" : "root", mode: "555", age: process.ago };
        procFiles[`/proc/${process.pid}/status`] = proc(status(process), { owner: process.user === "anna" ? "anna" : "root", group: process.user === "anna" ? "anna" : "root" });
        procFiles[`/proc/${process.pid}/cmdline`] = proc(`${process.args}\n`, { owner: process.user === "anna" ? "anna" : "root", group: process.user === "anna" ? "anna" : "root" });
    });
    return {
        dirs: {
            "/boot/grub": { owner: "root", age: SIM_BOOT_MINUTES + 60 * 24 * 9 },
            "/dev/input": { owner: "root", age: SIM_BOOT_MINUTES },
            ...procDirs,
            "/sys/block": { owner: "root", mode: "755", age: 0 }, "/sys/block/sda": { owner: "root", mode: "755", age: 0 },
            "/sys/class": { owner: "root", mode: "755", age: 0 }, "/sys/class/net": { owner: "root", mode: "755", age: 0 },
            "/sys/class/net/lo": { owner: "root", mode: "755", age: 0 }, "/sys/class/net/enp0s3": { owner: "root", mode: "755", age: 0 }
        },
        files: {
            // Il kernel e i file per avviarlo: solo root può leggere il kernel e la mappa dei simboli
            [`/boot/vmlinuz-${KERNEL_VERSION}`]: { owner: "root", mode: "600", content: makeBinary("elf", "kernel Linux"), age: 60 * 24 * 9 },
            [`/boot/initrd.img-${KERNEL_VERSION}`]: { owner: "root", mode: "644", content: makeBinary("gzip", "initramfs"), age: 60 * 24 * 9 },
            [`/boot/config-${KERNEL_VERSION}`]: { owner: "root", mode: "644", content: "# Configurazione del kernel Linux\nCONFIG_64BIT=y\nCONFIG_EXT4_FS=y\nCONFIG_USB_STORAGE=m\n", age: 60 * 24 * 9 },
            [`/boot/System.map-${KERNEL_VERSION}`]: { owner: "root", mode: "600", content: "ffffffff81000000 T _text\n", age: 60 * 24 * 9 },
            "/boot/grub/grub.cfg": { owner: "root", mode: "444", content: `# Il menu del boot loader GRUB (scritto da update-grub)\nmenuentry 'Ubuntu' {\n\tlinux /boot/vmlinuz-${KERNEL_VERSION} root=/dev/sda2 ro quiet splash\n\tinitrd /boot/initrd.img-${KERNEL_VERSION}\n}\n`, age: 60 * 24 * 9 },
            // I dispositivi: b blocco (dischi), c carattere; maggiore e minore
            "/dev/null": device("c 1 3", "root", "666"),
            "/dev/tty": device("c 5 0", "tty", "666"),
            "/dev/sda": device("b 8 0", "disk", "660"), "/dev/sda1": device("b 8 1", "disk", "660"), "/dev/sda2": device("b 8 2", "disk", "660"),
            "/dev/sdb": { ...device("b 8 16", "disk", "660"), age: SIM_BOOT_MINUTES - 120 }, "/dev/sdb1": { ...device("b 8 17", "disk", "660"), age: SIM_BOOT_MINUTES - 120 },
            "/dev/sr0": device("b 11 0", "cdrom", "660"),
            "/dev/input/mice": device("c 13 63", "input", "660"),
            // /proc: il kernel mostra lì i processi e lo stato del sistema (i file risultano vuoti a ls -l)
            "/proc/cpuinfo": proc(`${cpu(0)}\n${cpu(1)}`),
            "/proc/meminfo": proc(meminfo),
            "/proc/version": proc(`Linux version ${KERNEL_VERSION} (gcc version 13.2.0) #49-Ubuntu SMP\n`),
            "/proc/uptime": proc(`${SIM_BOOT_MINUTES * 60}.42 ${SIM_BOOT_MINUTES * 115}.80\n`),
            "/proc/partitions": proc("major minor  #blocks  name\n\n   8        0   20971520 sda\n   8        1       1024 sda1\n   8        2   20968448 sda2\n   8       16    7816704 sdb\n   8       17    7815680 sdb1\n  11        0    1048575 sr0\n"),
            ...procFiles,
            // /sys: i dispositivi visti dal kernel
            "/sys/block/sda/size": sys("41943040\n"),
            "/sys/class/net/lo/operstate": sys("unknown\n"), "/sys/class/net/lo/address": sys("00:00:00:00:00:00\n"),
            "/sys/class/net/enp0s3/operstate": sys("up\n"), "/sys/class/net/enp0s3/address": sys("08:00:27:4e:66:a1\n"),
            // I registri: syslog, kern.log e auth.log li legge solo il gruppo adm (e root)
            "/var/log/syslog": { owner: "syslog", group: "adm", mode: "640", content: lines("all"), age: 2 },
            "/var/log/kern.log": { owner: "syslog", group: "adm", mode: "640", content: lines("kern"), age: SIM_BOOT_MINUTES - 122 },
            "/var/log/auth.log": { owner: "syslog", group: "adm", mode: "640", content: lines("auth"), age: 12 },
            "/var/log/dpkg.log": { owner: "root", mode: "644", content: "2026-11-03 18:20:11 install tree:amd64 <none> 2.1.1-2\n2026-11-03 18:20:12 status installed tree:amd64 2.1.1-2\n", age: 60 * 24 * 9 },
            // Due file di configurazione in /etc
            "/etc/fstab": { owner: "root", content: "# I file system da montare all'avvio\n# dispositivo  punto di montaggio  tipo  opzioni  dump  pass\n/dev/sda2  /      ext4  defaults  0  1\n/dev/sda1  /boot/efi  vfat  umask=0077  0  1\n/swapfile  none   swap  sw        0  0\n", age: 60 * 24 * 9 },
            "/etc/os-release": { owner: "root", content: "NAME=\"Ubuntu\"\nVERSION=\"24.04.1 LTS (Noble Numbat)\"\nID=ubuntu\nPRETTY_NAME=\"Ubuntu 24.04.1 LTS\"\n", age: 60 * 24 * 30 }
        },
        links: { "/proc/self": { target: String(SIM_SHELL_PID), owner: "root" } }
    };
}

// ---- I processi: ps, top, uptime ----

// I processi visibili adesso: quelli fissi, più il comando in esecuzione e gli altri della sua pipeline
function simProcessList(sh, own, ctx) {
    sh.nextPid = (sh.nextPid || 4300) + Math.max(1, (ctx.siblings || [own]).length);
    const first = sh.nextPid - (ctx.siblings || [own]).length;
    const running = (ctx.siblings || [own]).map((args, index) => ({
        pid: first + index, ppid: SIM_SHELL_PID, user: sh.user, tty: "pts/0", stat: index === (ctx.index || 0) ? "R+" : "S+", ago: 0,
        vsz: 11000 + index * 300, rss: 4000 + index * 120, cpu: 0.0, mem: 0.1, seconds: 0, args, comm: args.split(" ")[0]
    }));
    // I processi fissi sono partiti prima dell'inizio dell'esercizio; quelli della riga, adesso
    return [...SIM_PROCESSES.map(process => ({ ...process, start: SIM_START - process.ago * 60000 })), ...running.map(process => ({ ...process, start: sh.clock }))];
}

const cpuTime = (seconds, long) => long ? `${two(Math.floor(seconds / 3600))}:${two(Math.floor(seconds / 60) % 60)}:${two(seconds % 60)}` : `${Math.floor(seconds / 60)}:${two(seconds % 60)}`;
// La colonna START: l'ora se il processo è partito nelle ultime 24 ore, altrimenti mese e giorno
function startText(sh, time) {
    const date = new Date(time);
    return sh.clock - time < 24 * 3600000 ? `${two(date.getHours())}:${two(date.getMinutes())}` : `${MONTHS[date.getMonth()]}${two(date.getDate())}`;
}

function psRun(sh, args, stdin, ctx) {
    const usage = "ps: nel simulatore: ps, ps -e, ps -ef, ps -f, ps -u UTENTE, ps -p PID, ps aux, ps ax, ps u, ps x";
    let bsd = false, all = false, full = false, userFormat = false, noTty = false, users = null, pids = null;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (/^[aux]+$/.test(arg)) {
            bsd = true;
            if (arg.includes("a")) all = true;
            if (arg.includes("u")) userFormat = true;
            if (arg.includes("x")) noTty = true;
        } else if (/^-[eAf]+$/.test(arg)) {
            if (/[eA]/.test(arg)) all = true;
            if (arg.includes("f")) full = true;
        } else if (arg === "-u" || arg === "-U") {
            if (!args[i + 1]) return { err: `ps: dopo ${arg} serve il nome di un utente\n`, code: 1 };
            users = args[++i].split(",");
        } else if (arg === "-p") {
            if (!args[i + 1]) return { err: "ps: dopo -p serve il numero di un processo\n", code: 1 };
            pids = args[++i].split(",").map(Number);
        } else {
            return { err: `ps: opzione non valida: ${arg}\n${usage}\n`, code: 1 };
        }
    }
    let list = simProcessList(sh, `ps${args.length ? ` ${args.join(" ")}` : ""}`, ctx);
    if (pids) list = list.filter(process => pids.includes(process.pid));
    else if (users) list = list.filter(process => users.includes(process.user));
    // a: anche gli altri utenti; x: anche senza terminale. ax e -e: tutti
    else if (bsd && all && noTty) list = list;
    else if (bsd && all) list = list.filter(process => process.tty !== "?");
    else if (bsd && noTty) list = list.filter(process => process.user === sh.user);
    else if (!all) list = list.filter(process => process.user === sh.user && process.tty === "pts/0");
    let lines;
    if (bsd && userFormat) {
        lines = ["USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND", ...list.map(p =>
            `${p.user.padEnd(8)} ${String(p.pid).padStart(7)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)} ${String(p.vsz).padStart(6)} ${String(p.rss).padStart(5)} ${p.tty.padEnd(8)} ${p.stat.padEnd(4)} ${startText(sh, p.start).padEnd(5)} ${cpuTime(p.seconds).padStart(6)} ${p.args}`)];
    } else if (bsd) {
        lines = ["    PID TTY      STAT   TIME COMMAND", ...list.map(p => `${String(p.pid).padStart(7)} ${p.tty.padEnd(8)} ${p.stat.padEnd(4)} ${cpuTime(p.seconds).padStart(6)} ${p.args}`)];
    } else if (full) {
        lines = ["UID          PID    PPID  C STIME TTY          TIME CMD", ...list.map(p =>
            `${p.user.padEnd(8)} ${String(p.pid).padStart(7)} ${String(p.ppid).padStart(7)} ${"0".padStart(2)} ${startText(sh, p.start).padEnd(5)} ${p.tty.padEnd(8)} ${cpuTime(p.seconds, true)} ${p.args}`)];
    } else {
        lines = ["    PID TTY          TIME CMD", ...list.map(p => `${String(p.pid).padStart(7)} ${p.tty.padEnd(8)} ${cpuTime(p.seconds, true)} ${p.comm}`)];
    }
    // Sullo schermo le righe si tagliano alla larghezza del terminale, come fa ps
    if (ctx.tty) lines = lines.map(line => line.slice(0, Math.max(20, sh.columns || 80)));
    return { out: lines.join("\n") + "\n", code: list.length ? 0 : 1 };
}

function uptimeLine(sh) {
    const date = new Date(sh.clock);
    const minutes = SIM_BOOT_MINUTES + Math.floor((sh.clock - SIM_START) / 60000);
    const days = Math.floor(minutes / 1440);
    const rest = minutes % 1440;
    return ` ${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())} up ${days} days, ${String(Math.floor(rest / 60)).padStart(2)}:${two(rest % 60)},  2 users,  load average: 0.08, 0.03, 0.01`;
}

function topRun(sh, args, stdin, ctx) {
    let batch = false, users = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-b") batch = true;
        else if (args[i] === "-n") i++;
        else if (/^-n\d+$/.test(args[i]) || /^-bn\d+$/.test(args[i])) batch = batch || args[i].startsWith("-b");
        else if (args[i] === "-u") users = [args[++i]];
        else return { err: `top: opzione non valida: ${args[i]} (nel simulatore: top, top -b -n 1, top -u UTENTE)\n`, code: 1 };
    }
    let list = simProcessList(sh, "top", ctx);
    if (users) list = list.filter(process => users.includes(process.user));
    list.sort((a, b) => b.cpu - a.cpu || a.pid - b.pid);
    const mib = kib => (kib / 1024).toFixed(1);
    const lines = [
        `top -${uptimeLine(sh).replace(/^ /, " ")}`,
        `Tasks: ${String(SIM_PROCESSES.length + 1).padStart(3)} total,   1 running, ${String(SIM_PROCESSES.length).padStart(3)} sleeping,   0 stopped,   0 zombie`,
        "%Cpu(s):  0.7 us,  0.3 sy,  0.0 ni, 98.9 id,  0.1 wa,  0.0 hi,  0.0 si,  0.0 st",
        `MiB Mem : ${mib(SIM_MEMORY.total).padStart(8)} total, ${mib(SIM_MEMORY.free).padStart(8)} free, ${mib(SIM_MEMORY.used).padStart(8)} used, ${mib(SIM_MEMORY.buffCache).padStart(8)} buff/cache`,
        `MiB Swap: ${mib(SIM_MEMORY.swapTotal).padStart(8)} total, ${mib(SIM_MEMORY.swapFree).padStart(8)} free, ${mib(0).padStart(8)} used. ${mib(SIM_MEMORY.available).padStart(8)} avail Mem`,
        "",
        "    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND",
        ...list.map(p => `${String(p.pid).padStart(7)} ${p.user.padEnd(8)}  20   0 ${String(p.vsz).padStart(7)} ${String(p.rss).padStart(6)} ${String(Math.round(p.rss * 0.6)).padStart(6)} ${p.stat[0]} ${p.cpu.toFixed(1).padStart(5)} ${p.mem.toFixed(1).padStart(5)} ${`${Math.floor(p.seconds / 60)}:${two(p.seconds % 60)}.00`.padStart(9)} ${p.comm}`)
    ];
    const out = (ctx.tty ? lines.map(line => line.slice(0, Math.max(20, sh.columns || 80))) : lines).join("\n") + "\n";
    // Su un sistema vero top resta aperto e si aggiorna; nel simulatore mostra una schermata sola
    const note = ctx.tty && !batch ? "top: nel simulatore una schermata sola. Su un sistema vero si aggiorna ogni 3 secondi e si esce con q.\n" : "";
    return { out, err: note };
}

// ---- La memoria: free ----

function freeRun(sh, args) {
    let unit = "k", human = false;
    for (const arg of args) {
        if (arg === "-h" || arg === "--human") human = true;
        else if (arg === "-k" || arg === "--kibi") unit = "k";
        else if (arg === "-m" || arg === "--mebi") unit = "m";
        else if (arg === "-g" || arg === "--gibi") unit = "g";
        else return { err: `free: opzione non valida: ${arg} (nel simulatore: free, free -h, free -m, free -g)\n`, code: 1 };
    }
    const show = kib => {
        if (human) {
            if (kib === 0) return "0B";
            const units = ["Ki", "Mi", "Gi"];
            let value = kib, index = 0;
            while (value >= 1024 && index < units.length - 1) {
                value /= 1024;
                index++;
            }
            return `${value < 10 ? value.toFixed(1) : Math.round(value)}${units[index]}`;
        }
        return String(Math.floor(kib / (unit === "m" ? 1024 : unit === "g" ? 1048576 : 1)));
    };
    const m = SIM_MEMORY;
    // Come free: l'etichetta in 8 caratteri, poi ogni numero allineato a destra in 12
    const row = (label, values) => `${label.padEnd(8)}${values.map(value => show(value).padStart(12)).join("")}`;
    return {
        out: [
            "               total        used        free      shared  buff/cache   available",
            `${row("Mem:", [m.total, m.used, m.free, m.shared, m.buffCache, m.available])}`,
            `${row("Swap:", [m.swapTotal, m.swapTotal - m.swapFree, m.swapFree])}`
        ].join("\n") + "\n"
    };
}

// ---- I messaggi del kernel e i registri: dmesg, journalctl ----

function dmesgRun(sh, args) {
    for (const arg of args) {
        if (!["-H", "--human", "-T", "--ctime", "--nopager"].includes(arg)) return { err: `dmesg: opzione non valida: ${arg} (nel simulatore: dmesg e sudo dmesg, anche con | grep o | tail)\n`, code: 1 };
    }
    // Come su Ubuntu: il buffer del kernel lo legge solo l'amministratore
    if (sh.user !== "root") return { err: "dmesg: lettura del buffer del kernel non riuscita: Operazione non permessa\n", code: 1 };
    const withDates = args.includes("-T") || args.includes("--ctime");
    const lines = SIM_KERNEL_LOG.map(entry => withDates ? `[${new Date(bootTime() + entry[0] * 1000).toString().slice(0, 24)}] ${entry[1]}` : kernelLine(entry));
    return { out: lines.join("\n") + "\n" };
}

function journalctlRun(sh, args) {
    let count = null, kernel = false, unit = null;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "-n") count = Number(args[++i]);
        else if (/^-n\d+$/.test(arg)) count = Number(arg.slice(2));
        else if (arg === "-k" || arg === "--dmesg") kernel = true;
        else if (arg === "-u") unit = (args[++i] || "").replace(/\.service$/, "");
        else if (arg === "--no-pager") continue;
        else return { err: `journalctl: opzione non valida: ${arg} (nel simulatore: journalctl, -n NUMERO, -k, -u SERVIZIO)\n`, code: 1 };
    }
    if (count !== null && !(count >= 0)) return { err: "journalctl: dopo -n serve un numero\n", code: 1 };
    const user = usersOf(sh)[sh.user] || { groups: [] };
    if (sh.user !== "root" && !user.groups.includes("adm")) {
        return { err: "journalctl: nel simulatore i messaggi del sistema li vedono solo root e i gruppi adm e systemd-journal: prova sudo journalctl\n", code: 1 };
    }
    let lines = simLogLines("all");
    if (kernel) lines = lines.filter(line => / kernel: /.test(line));
    if (unit) lines = lines.filter(line => line.includes(` ${unit}[`) || (unit === "ssh" && line.includes(" sshd[")));
    if (count !== null) lines = count ? lines.slice(-count) : [];
    if (!lines.length) return { out: "-- No entries --\n" };
    return { out: lines.join("\n") + "\n" };
}

["ps", "top", "free", "dmesg", "journalctl"].forEach(name => delete SIM_UNAVAILABLE[name]);
Object.assign(SIM_COMMANDS, {
    ps: { run: psRun },
    top: { run: topRun },
    uptime: { run: sh => ({ out: `${uptimeLine(sh)}\n` }) },
    free: { run: freeRun },
    dmesg: { run: dmesgRun },
    journalctl: { run: journalctlRun }
});
