// Il computer in rete, nella shell simulata (obiettivo 4.4): indirizzi e interfacce (ip addr,
// ip link, ifconfig), instradamento (ip route, route), porte in ascolto (ss, netstat), ping,
// host e hostname -I. La rete è finta e fissa: una LAN 192.168.1.0/24 con il router
// 192.168.1.1, che fa anche da server DNS, e il NAS 192.168.1.10. Gli indirizzi su Internet sono
// di quelli riservati agli esempi (203.0.113.x, 198.51.100.x, 2001:db8::): non sono quelli veri.
// Si carica dopo shell-commands.js, a cui aggiunge i comandi.

const NET = {
    ip: "192.168.1.50", prefix: 24, netmask: "255.255.255.0", broadcast: "192.168.1.255", network: "192.168.1.0",
    gateway: "192.168.1.1", mac: "08:00:27:4e:66:a1",
    ip6Link: "fe80::a00:27ff:fe4e:66a1", ip6Global: "2001:db8:1::a00:27ff:fe4e:66a1"
};

// Il DNS del router: nome → indirizzi (IPv4 e IPv6). Il dominio della LAN è casa.lan
const SIM_DNS = {
    "www.lpi.org": ["203.0.113.80", "2001:db8:80::1"],
    "lpi.org": ["203.0.113.80"],
    "learning.lpi.org": ["203.0.113.81"],
    "wiki.lpi.org": ["203.0.113.82"],
    "www.debian.org": ["198.51.100.20", "2001:db8:20::20"],
    "www.ubuntu.com": ["198.51.100.30"],
    "www.example.com": ["198.51.100.40"],
    "router.casa.lan": ["192.168.1.1"],
    "nas.casa.lan": ["192.168.1.10"],
    "lpi.casa.lan": ["192.168.1.50"],
    "stampante.casa.lan": ["192.168.1.20"]
};
const SIM_DNS_SEARCH = "casa.lan";

// Le porte in ascolto e le connessioni aperte: protocollo, stato, locale, remoto, processo
const SIM_SOCKETS = [
    { proto: "udp", state: "UNCONN", local: "127.0.0.53%lo:53", peer: "0.0.0.0:*", process: "systemd-resolve", pid: 455 },
    { proto: "udp", state: "UNCONN", local: "192.168.1.50%enp0s3:68", peer: "0.0.0.0:*", process: "systemd-network", pid: 430 },
    { proto: "tcp", state: "LISTEN", local: "127.0.0.53%lo:53", peer: "0.0.0.0:*", process: "systemd-resolve", pid: 455 },
    { proto: "tcp", state: "LISTEN", local: "0.0.0.0:22", peer: "0.0.0.0:*", process: "sshd", pid: 640 },
    { proto: "tcp", state: "LISTEN", local: "127.0.0.1:631", peer: "0.0.0.0:*", process: "cupsd", pid: 612 },
    { proto: "tcp", state: "LISTEN", local: "[::]:22", peer: "[::]:*", process: "sshd", pid: 640 },
    { proto: "tcp", state: "ESTAB", local: "192.168.1.50:22", peer: "192.168.1.20:51522", process: "sshd", pid: 1180 },
    { proto: "tcp", state: "ESTAB", local: "192.168.1.50:22", peer: "192.168.1.20:51790", process: "sshd", pid: 4200 }
];
const SERVICE_NAMES = { 22: "ssh", 53: "domain", 68: "bootpc", 631: "ipp" };

// ---- Indirizzi e interfacce ----

function ipAddrLines(family, only) {
    const lines = [];
    const show4 = family !== 6, show6 = family !== 4;
    if (!only || only === "lo") {
        lines.push("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000");
        if (!family) lines.push("    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00");
        if (show4) lines.push("    inet 127.0.0.1/8 scope host lo", "       valid_lft forever preferred_lft forever");
        if (show6) lines.push("    inet6 ::1/128 scope host noprefixroute", "       valid_lft forever preferred_lft forever");
    }
    if (!only || only === "enp0s3") {
        lines.push("2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000");
        if (!family) lines.push(`    link/ether ${NET.mac} brd ff:ff:ff:ff:ff:ff`);
        if (show4) lines.push(`    inet ${NET.ip}/${NET.prefix} brd ${NET.broadcast} scope global dynamic noprefixroute enp0s3`, "       valid_lft 85214sec preferred_lft 85214sec");
        if (show6) lines.push(`    inet6 ${NET.ip6Global}/64 scope global dynamic mngtmpaddr noprefixroute`, "       valid_lft 86234sec preferred_lft 14234sec",
            `    inet6 ${NET.ip6Link}/64 scope link noprefixroute`, "       valid_lft forever preferred_lft forever");
    }
    return lines;
}

const ipLinkLines = () => [
    "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000",
    "    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00",
    "2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000",
    `    link/ether ${NET.mac} brd ff:ff:ff:ff:ff:ff`
];

function ipRouteLines(family) {
    if (family === 6) return ["2001:db8:1::/64 dev enp0s3 proto ra metric 100 pref medium",
        "fe80::/64 dev enp0s3 proto kernel metric 1024 pref medium", "default via fe80::1 dev enp0s3 proto ra metric 100 expires 1788sec pref medium"];
    return [`default via ${NET.gateway} dev enp0s3 proto dhcp src ${NET.ip} metric 100`, `${NET.network}/${NET.prefix} dev enp0s3 proto kernel scope link src ${NET.ip} metric 100`];
}

// ip [-4|-6] OGGETTO [COMANDO] [dev NOME | NOME]: gli oggetti si possono abbreviare (a, r, l)
function ipRun(sh, args) {
    let family = 0;
    const words = [...args];
    while (/^-[46]$/.test(words[0] || "")) family = Number(words.shift()[1]);
    if (words[0] && words[0].startsWith("-")) return { err: `ip: nel simulatore l'opzione ${words[0]} non c'è (ci sono -4 e -6)\n`, code: 255 };
    const object = words.shift();
    if (!object) return { err: "Uso: ip [ -4 | -6 ] OGGETTO { COMANDO }\n       OGGETTO := { address | link | route }\n       per esempio: ip addr show, ip route show\n", code: 255 };
    const is = full => full.startsWith(object);
    let command = words[0] && !/^(dev|lo|enp0s3)$/.test(words[0]) ? words.shift() : "show";
    if (["show", "list", "lst", "sh", "ls", "l"].includes(command)) command = "show";
    if (command !== "show") return { err: `ip: nel simulatore si può solo guardare (show): «${command}» cambierebbe la rete e serve root\n`, code: 255 };
    if (words[0] === "dev") words.shift();
    const device = words[0];
    if (device && !["lo", "enp0s3"].includes(device)) return { err: `Device "${device}" does not exist.\n`, code: 1 };
    if (object.length && is("address")) return { out: ipAddrLines(family, device).join("\n") + "\n" };
    if (object.length && is("link")) return { out: (device ? ipLinkLines().slice(device === "lo" ? 0 : 2, device === "lo" ? 2 : 4) : ipLinkLines()).join("\n") + "\n" };
    if (object.length && is("route")) return { out: ipRouteLines(family).join("\n") + "\n" };
    return { err: `Object "${object}" is unknown, try "ip help".\n`, code: 255 };
}

// ifconfig: il comando storico (pacchetto net-tools), con un formato diverso da ip
function ifconfigRun(sh, args) {
    const only = args.find(arg => !arg.startsWith("-"));
    if (only && !["lo", "enp0s3"].includes(only)) return { err: `${only}: error fetching interface information: Device not found\n`, code: 1 };
    const blocks = {
        enp0s3: [
            "enp0s3: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500",
            `        inet ${NET.ip}  netmask ${NET.netmask}  broadcast ${NET.broadcast}`,
            `        inet6 ${NET.ip6Global}  prefixlen 64  scopeid 0x0<global>`,
            `        inet6 ${NET.ip6Link}  prefixlen 64  scopeid 0x20<link>`,
            `        ether ${NET.mac}  txqueuelen 1000  (Ethernet)`,
            "        RX packets 48213  bytes 52114387 (52.1 MB)",
            "        RX errors 0  dropped 0  overruns 0  frame 0",
            "        TX packets 21877  bytes 3204518 (3.2 MB)",
            "        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0"
        ],
        lo: [
            "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536",
            "        inet 127.0.0.1  netmask 255.0.0.0",
            "        inet6 ::1  prefixlen 128  scopeid 0x10<host>",
            "        loop  txqueuelen 1000  (Local Loopback)",
            "        RX packets 812  bytes 70321 (70.3 KB)",
            "        RX errors 0  dropped 0  overruns 0  frame 0",
            "        TX packets 812  bytes 70321 (70.3 KB)",
            "        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0"
        ]
    };
    const names = only ? [only] : ["enp0s3", "lo"];
    return { out: names.map(name => blocks[name].join("\n") + "\n").join("\n") + "\n" };
}

// route e netstat -r: la tabella di instradamento; con -n solo numeri
function routeLines(numeric) {
    return [
        "Kernel IP routing table",
        "Destination     Gateway         Genmask         Flags Metric Ref    Use Iface",
        `${(numeric ? "0.0.0.0" : "default").padEnd(16)}${(numeric ? NET.gateway : "_gateway").padEnd(16)}${"0.0.0.0".padEnd(16)}UG    100    0        0 enp0s3`,
        `${NET.network.padEnd(16)}${"0.0.0.0".padEnd(16)}${NET.netmask.padEnd(16)}U     100    0        0 enp0s3`
    ];
}

function routeRun(sh, args) {
    for (const arg of args) {
        if (arg !== "-n") return { err: `route: nel simulatore si può solo guardare la tabella: route oppure route -n\n`, code: 1 };
    }
    return { out: routeLines(args.includes("-n")).join("\n") + "\n" };
}

// ---- Porte e connessioni: ss e netstat ----

// Le opzioni di ss e netstat: t tcp, u udp, l in ascolto, a tutte, n numeri, p processi
function socketOptions(name, args) {
    const flags = {};
    for (const arg of args) {
        if (!/^-[tulnapr]+$/.test(arg)) return { error: `${name}: nel simulatore ci sono le opzioni -t -u -l -a -n -p${name === "netstat" ? " -r" : ""} (per esempio ${name} -tuln)\n` };
        for (const letter of arg.slice(1)) flags[letter] = true;
    }
    return { flags };
}

function selectSockets(flags) {
    const protocols = flags.t || flags.u ? ["tcp", "udp"].filter(proto => flags[proto[0]]) : ["tcp", "udp"];
    return SIM_SOCKETS.filter(socket => protocols.includes(socket.proto) &&
        (flags.a || (flags.l ? socket.state !== "ESTAB" : socket.state === "ESTAB")));
}

const withServiceName = (address, numeric) => numeric ? address : address.replace(/:(\d+)$/, (match, port) => `:${SERVICE_NAMES[port] || port}`);

function ssRun(sh, args) {
    const { flags, error } = socketOptions("ss", args);
    if (error) return { err: error, code: 1 };
    if (flags.r) return { err: "ss: nel simulatore -r non c'è\n", code: 1 };
    const list = selectSockets(flags);
    const rows = list.map(socket => ({
        netid: socket.proto, state: socket.state, recv: "0", send: socket.state === "LISTEN" ? (socket.local.includes(":22") ? "128" : "4096") : "0",
        local: withServiceName(socket.local, flags.n), peer: withServiceName(socket.peer, flags.n),
        process: flags.p && sh.user === "root" ? `users:(("${socket.process}",pid=${socket.pid},fd=3))` : ""
    }));
    const width = key => Math.max(key.length, ...rows.map(row => row[key].length));
    const head = { netid: "Netid", state: "State", recv: "Recv-Q", send: "Send-Q", local: "Local Address:Port", peer: "Peer Address:Port", process: "Process" };
    const w = { netid: Math.max(5, width("netid")), state: Math.max(6, width("state")), recv: 6, send: 6, local: Math.max(18, ...rows.map(row => row.local.length)), peer: Math.max(17, ...rows.map(row => row.peer.length)) };
    const line = row => `${row.netid.padEnd(w.netid)} ${row.state.padEnd(w.state)} ${row.recv.padEnd(w.recv)} ${row.send.padEnd(w.send)} ${row.local.padStart(w.local)} ${row.peer.padStart(w.peer)} ${row.process}`.trimEnd();
    const lines = [`${head.netid.padEnd(w.netid)} ${head.state.padEnd(w.state)} ${head.recv} ${head.send} ${head.local.padStart(w.local)} ${head.peer.padStart(w.peer)} ${head.process}`, ...rows.map(line)];
    const note = flags.p && sh.user !== "root" ? "ss: i processi degli altri utenti si vedono solo da root (sudo ss -p)\n" : "";
    return { out: lines.join("\n") + "\n", err: note };
}

function netstatRun(sh, args) {
    const { flags, error } = socketOptions("netstat", args);
    if (error) return { err: error, code: 1 };
    if (flags.r) return { out: routeLines(flags.n).join("\n") + "\n" };
    const list = selectSockets(flags);
    const convert = address => address.replace(/%\w+/, "").replace(/^\[::\]/, "::");
    const rows = list.map(socket => {
        const proto = socket.local.startsWith("[") ? `${socket.proto}6` : socket.proto;
        const state = socket.state === "LISTEN" ? "LISTEN" : socket.state === "ESTAB" ? "ESTABLISHED" : "";
        const program = flags.p ? (sh.user === "root" ? ` ${socket.pid}/${socket.process}` : " -") : "";
        return `${proto.padEnd(6)}${"0".padStart(6)}${"0".padStart(7)} ${withServiceName(convert(socket.local), flags.n).padEnd(24)}${withServiceName(convert(socket.peer), flags.n).padEnd(24)}${state.padEnd(11)}${program}`.trimEnd();
    });
    const title = flags.l && !flags.a ? "Active Internet connections (only servers)" : flags.a ? "Active Internet connections (servers and established)" : "Active Internet connections (w/o servers)";
    return { out: [title, `Proto Recv-Q Send-Q Local Address           Foreign Address         State      ${flags.p ? " PID/Program name" : ""}`.trimEnd(), ...rows].join("\n") + "\n" };
}

// ---- Nomi e raggiungibilità: host, ping, hostname -I ----

const isIPv4 = text => /^\d{1,3}(\.\d{1,3}){3}$/.test(text) && text.split(".").every(part => Number(part) <= 255);
const isIPv6 = text => /^[0-9a-f:]+$/i.test(text) && text.includes(":");

// host chiede al server DNS (quello di /etc/resolv.conf): /etc/hosts non lo guarda
function dnsLookup(name) {
    const clean = name.replace(/\.$/, "").toLowerCase();
    if (SIM_DNS[clean]) return { name: clean, addresses: SIM_DNS[clean] };
    if (!clean.includes(".") && SIM_DNS[`${clean}.${SIM_DNS_SEARCH}`]) return { name: `${clean}.${SIM_DNS_SEARCH}`, addresses: SIM_DNS[`${clean}.${SIM_DNS_SEARCH}`] };
    return null;
}

const reverseName = address => isIPv4(address) ? `${address.split(".").reverse().join(".")}.in-addr.arpa` : `${address}.ip6.arpa`;

function hostRun(sh, args) {
    let type = null;
    const words = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "-t") type = (args[++i] || "").toUpperCase();
        else if (args[i].startsWith("-")) return { err: `host: nel simulatore c'è solo l'opzione -t (A o AAAA)\n`, code: 1 };
        else words.push(args[i]);
    }
    if (!words.length) return { err: "Uso: host [-t A|AAAA] NOME\n", code: 1 };
    if (type && !["A", "AAAA"].includes(type)) return { err: `host: nel simulatore -t accetta A (IPv4) e AAAA (IPv6)\n`, code: 1 };
    const target = words[0];
    if (isIPv4(target) || isIPv6(target)) {
        const found = Object.entries(SIM_DNS).find(([name, addresses]) => addresses.includes(target) && !/^(lpi\.org)$/.test(name));
        if (!found) return { out: `Host ${reverseName(target)} not found: 3(NXDOMAIN)\n`, code: 1 };
        return { out: `${reverseName(target)} domain name pointer ${found[0]}.\n` };
    }
    const result = dnsLookup(target);
    if (!result) return { out: `Host ${target} not found: 3(NXDOMAIN)\n`, code: 1 };
    const lines = result.addresses.filter(address => !type || (type === "A") === isIPv4(address))
        .map(address => `${result.name} has ${isIPv4(address) ? "address" : "IPv6 address"} ${address}`);
    if (!lines.length) return { out: `${result.name} has no ${type} record\n` };
    return { out: lines.join("\n") + "\n" };
}

// ping prima guarda /etc/hosts (anche modificato con sudo), poi chiede al DNS
function resolveForPing(sh, name, family) {
    if (isIPv4(name) || isIPv6(name)) return { address: name, label: name };
    try {
        const hosts = simLookup(sh, "/etc/hosts").node;
        if (hosts && hosts.type === "f") {
            for (const line of hosts.data.split("\n")) {
                const fields = line.replace(/#.*/, "").trim().split(/\s+/);
                if (fields.length > 1 && fields.slice(1).includes(name) && (family === 6 ? isIPv6(fields[0]) : isIPv4(fields[0]))) return { address: fields[0], label: name };
            }
        }
    } catch (error) {
        if (!(error instanceof SimError)) throw error;
    }
    const result = dnsLookup(name);
    if (!result) return null;
    const address = result.addresses.find(item => family === 6 ? isIPv6(item) : isIPv4(item));
    return address ? { address, label: result.name } : { missing: true };
}

// Chi risponde: il computer stesso, il router, il NAS, la stampante, gli indirizzi su Internet
function pingDelay(address) {
    if (/^127\./.test(address) || address === "::1" || address === NET.ip || address === NET.ip6Global || address === NET.ip6Link) return 0.04;
    if (address === NET.gateway || address === "fe80::1") return 0.6;
    if (address === "192.168.1.10" || address === "192.168.1.20") return 1.2;
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address)) return null;   // LAN: nessuno con quell'indirizzo
    return 21;
}

function pingRun(sh, args, stdin, ctx, forced6) {
    let count = null, family = forced6 ? 6 : 4;
    const words = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "-c") count = Number(args[++i]);
        else if (/^-c\d+$/.test(arg)) count = Number(arg.slice(2));
        else if (arg === "-4" || arg === "-6") family = Number(arg[1]);
        else if (arg.startsWith("-")) return { err: `ping: nel simulatore ci sono le opzioni -c NUMERO, -4 e -6\n`, code: 2 };
        else words.push(arg);
    }
    if (!words.length) return { err: "ping: manca l'indirizzo di destinazione (per esempio ping -c 4 192.168.1.1)\n", code: 1 };
    if (count !== null && !(count > 0)) return { err: "ping: dopo -c serve un numero maggiore di 0\n", code: 1 };
    if (isIPv6(words[0])) family = 6;
    const target = resolveForPing(sh, words[0], family);
    if (!target) return { err: `ping: ${words[0]}: Nome o servizio sconosciuto\n`, code: 2 };
    if (target.missing) return { err: `ping: ${words[0]}: Indirizzo non disponibile per questo tipo (${family === 6 ? "IPv6" : "IPv4"})\n`, code: 2 };
    const packets = count || 4;
    const delay = pingDelay(target.address);
    const shown = target.label === target.address ? target.address : `${target.label} (${target.address})`;
    const lines = [family === 6 ? `PING ${target.label}(${target.address}) 56 data bytes` : `PING ${target.label} (${target.address}) 56(84) bytes of data.`];
    const times = [];
    for (let seq = 1; seq <= packets; seq++) {
        if (delay === null) {
            lines.push(`From ${NET.ip} icmp_seq=${seq} Destination Host Unreachable`);
        } else {
            const time = delay * (1 + ((seq * 37) % 11 - 5) / 50);
            times.push(time);
            const ttl = delay < 0.1 ? 64 : delay < 5 ? 64 : 54;
            lines.push(`64 bytes from ${shown}: icmp_seq=${seq} ttl=${ttl} time=${time < 1 ? time.toFixed(3) : time.toFixed(1)} ms`);
        }
    }
    const elapsed = (packets - 1) * 1000 + (delay === null ? 60 : Math.round(delay * 2));
    lines.push("", `--- ${target.label} ping statistics ---`);
    if (delay === null) {
        lines.push(`${packets} packets transmitted, 0 received, +${packets} errors, 100% packet loss, time ${elapsed}ms`);
    } else {
        const min = Math.min(...times), max = Math.max(...times), avg = times.reduce((a, b) => a + b, 0) / times.length;
        const mdev = Math.sqrt(times.reduce((sum, t) => sum + (t - avg) ** 2, 0) / times.length);
        const f = value => value.toFixed(3);
        lines.push(`${packets} packets transmitted, ${packets} received, 0% packet loss, time ${elapsed}ms`, `rtt min/avg/max/mdev = ${f(min)}/${f(avg)}/${f(max)}/${f(mdev)} ms`);
    }
    // Su un sistema vero ping senza -c continua finché si preme Ctrl+C
    const note = count === null && ctx.tty ? "ping: nel simulatore si ferma dopo 4 pacchetti; su un sistema vero continua finché premi Ctrl+C (oppure usa -c 4)\n" : "";
    return { out: lines.join("\n") + "\n", err: note, code: delay === null ? 1 : 0 };
}

function hostnameRun(sh, args) {
    if (!args.length) return { out: "lpi\n" };
    if (args[0] === "-I") return { out: `${NET.ip} ${NET.ip6Global} \n` };
    if (args[0] === "-i") return { out: "127.0.1.1\n" };
    if (args[0] === "-f") return { out: `lpi.${SIM_DNS_SEARCH}\n` };
    if (args[0] === "-d") return { out: `${SIM_DNS_SEARCH}\n` };
    if (args[0].startsWith("-")) return { err: "hostname: nel simulatore ci sono -I, -i, -f e -d\n", code: 1 };
    if (sh.user !== "root") return { err: "hostname: you must be root to change the host name\n", code: 1 };
    return { err: "hostname: nel simulatore il nome del computer non si cambia (su un sistema vero: sudo hostnamectl set-hostname NOME)\n", code: 1 };
}

["ping", "ip", "ss", "netstat", "ifconfig", "host"].forEach(name => delete SIM_UNAVAILABLE[name]);
Object.assign(SIM_COMMANDS, {
    ip: { run: ipRun },
    ifconfig: { run: ifconfigRun },
    route: { run: routeRun },
    ss: { run: ssRun },
    netstat: { run: netstatRun },
    host: { run: hostRun },
    ping: { run: (sh, args, stdin, ctx) => pingRun(sh, args, stdin, ctx, false) },
    ping6: { run: (sh, args, stdin, ctx) => pingRun(sh, args, stdin, ctx, true) },
    hostname: { run: hostnameRun }
});
