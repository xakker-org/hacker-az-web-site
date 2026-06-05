import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

/* ================================================================
   Terminal command simulation engine
   ================================================================ */
const SIM = [
  {
    test: c => c === "help",
    run: () => [
      { t: "info",  v: "Mövcud əmrlər:" },
      { t: "",      v: "  nmap  -sV <ip>          — Port skanı + servis versiyaları" },
      { t: "",      v: "  gobuster dir -u <url>   — Veb directory brute-force" },
      { t: "",      v: "  curl  <url>             — HTTP sorğusu" },
      { t: "",      v: "  hydra -l user -P wl     — Brute-force login" },
      { t: "",      v: "  sqlmap -u <url>          — SQL injection avtomatlaşdırılmış" },
      { t: "",      v: "  nc  <ip> <port>          — Netcat bağlantı / dinləyici" },
      { t: "",      v: "  whoami / id              — Cari istifadəçi / qrup" },
      { t: "",      v: "  cat /etc/passwd          — İstifadəçi siyahısı" },
      { t: "",      v: "  find / -perm -4000       — SUID faylları axtar" },
      { t: "",      v: "  ls -la                   — Fayl siyahısı" },
      { t: "",      v: "  clear                    — Ekranı təmizlə" },
    ],
  },
  {
    test: c => c.startsWith("nmap"),
    run: c => {
      const sV = c.includes("-sv") || c.includes("-sc") || c.includes("-a");
      return [
        { t: "muted", v: "Starting Nmap 7.94 ( https://nmap.org ) at " + new Date().toLocaleTimeString() },
        { t: "",      v: "Nmap scan report for target (" + (c.match(/\d{1,3}(?:\.\d{1,3}){3}/)?.[0] || "TARGET") + ")" },
        { t: "",      v: "Host is up (0.032s latency)." },
        { t: "",      v: "" },
        { t: "",      v: "PORT     STATE SERVICE" + (sV ? " VERSION" : "") },
        { t: "",      v: "22/tcp   open  ssh"   + (sV ? "     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)" : "") },
        { t: "",      v: "80/tcp   open  http"  + (sV ? "    Apache httpd 2.4.52 ((Ubuntu))" : "") },
        { t: "",      v: "3306/tcp open  mysql" + (sV ? "   MySQL 8.0.32-0ubuntu0.22.04.2" : "") },
        { t: "",      v: "" },
        { t: sV ? "success" : "", v: sV ? "Service detection performed. NSE: Script Post-scanning." : "Nmap done: 1 IP address (1 host up) scanned." },
        { t: "success", v: "[ ✓ Açıq portlar tapıldı: 22 (ssh), 80 (http), 3306 (mysql) ]" },
      ];
    },
  },
  {
    test: c => c.startsWith("gobuster"),
    run: () => [
      { t: "muted", v: "===============================================================" },
      { t: "info",  v: "Gobuster v3.6 — by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)" },
      { t: "muted", v: "===============================================================" },
      { t: "",      v: "[+] Starting gobuster in directory enumeration mode" },
      { t: "muted", v: "===============================================================" },
      { t: "",      v: "/index.php             (Status: 200) [Size: 2048]" },
      { t: "",      v: "/images                (Status: 301) [Size: 315]" },
      { t: "",      v: "/admin                 (Status: 301) [Size: 316]" },
      { t: "success", v: "/admin/login.php      (Status: 200) [Size: 1024]  ← TAPILDI" },
      { t: "",      v: "/uploads               (Status: 403) [Size: 279]" },
      { t: "",      v: "/config.php            (Status: 403) [Size: 279]" },
      { t: "success", v: "/backup/db.sql        (Status: 200) [Size: 48291] ← AÇIQ DATABASE!" },
      { t: "",      v: "" },
      { t: "success", v: "[ ✓ Admin login paneli tapıldı: /admin/login.php ]" },
      { t: "success", v: "[ ✓ Açıq database dump tapıldı: /backup/db.sql   ]" },
    ],
  },
  {
    test: c => c.startsWith("curl"),
    run: c => {
      if (c.includes("admin")) return [
        { t: "muted", v: "< HTTP/1.1 200 OK" },
        { t: "muted", v: "< Server: Apache/2.4.52 (Ubuntu)" },
        { t: "muted", v: "< Content-Type: text/html; charset=UTF-8" },
        { t: "",      v: "" },
        { t: "",      v: "<!DOCTYPE html>" },
        { t: "",      v: "<html><head><title>Admin Panel — xLogin v2.1</title></head><body>" },
        { t: "",      v: "  <form method='POST' action='/admin/login.php'>" },
        { t: "",      v: "    <input name='username' type='text' placeholder='Username'/>" },
        { t: "",      v: "    <input name='password' type='password' placeholder='Password'/>" },
        { t: "",      v: "    <button type='submit'>Login</button>" },
        { t: "",      v: "  </form>" },
        { t: "",      v: "</body></html>" },
        { t: "",      v: "" },
        { t: "success", v: "[ ✓ Admin login forması tapıldı → POST /admin/login.php ]" },
      ];
      return [
        { t: "muted", v: "< HTTP/1.1 200 OK" },
        { t: "muted", v: "< Server: Apache/2.4.52  X-Powered-By: PHP/8.1.12" },
        { t: "",      v: "" },
        { t: "",      v: "<html><body><h1>Xakker Corp — CTF Lab v2.0</h1></body></html>" },
      ];
    },
  },
  {
    test: c => c.startsWith("hydra"),
    run: () => [
      { t: "muted", v: "Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak" },
      { t: "info",  v: "[DATA] max 16 tasks per 1 server" },
      { t: "info",  v: "[DATA] attacking http-post-form://target/admin/login.php" },
      { t: "",      v: "[80][http-post-form] host: target   login: admin   password: admin123         [FAIL]" },
      { t: "",      v: "[80][http-post-form] host: target   login: admin   password: password         [FAIL]" },
      { t: "",      v: "[80][http-post-form] host: target   login: admin   password: 123456           [FAIL]" },
      { t: "success", v: "[80][http-post-form] host: target   login: admin   password: P@ssw0rd2024   [SUCCESS]" },
      { t: "",      v: "" },
      { t: "muted", v: "1 of 1 target successfully completed, 1 valid password found" },
      { t: "success", v: "[ ✓ Etimadnamə tapıldı: admin:P@ssw0rd2024 ]" },
    ],
  },
  {
    test: c => c.startsWith("sqlmap"),
    run: () => [
      { t: "muted", v: "        ___" },
      { t: "muted", v: "       __H__    sqlmap/1.7.9" },
      { t: "muted", v: "  ___ ___[(]_____ ___ ___  {1.7.9#stable}" },
      { t: "muted", v: " |_ -| . [,]     | .'| . |" },
      { t: "muted", v: " |___|_  [(]_|_|_|__,|  _|" },
      { t: "muted", v: "       |_|V...       |_|   https://sqlmap.org" },
      { t: "",      v: "" },
      { t: "info",  v: "[*] starting @ " + new Date().toLocaleTimeString() },
      { t: "",      v: "[*] testing connection to the target URL" },
      { t: "",      v: "[*] testing if the target URL content is stable" },
      { t: "",      v: "[*] testing 'AND boolean-based blind - WHERE or HAVING clause'" },
      { t: "success", v: "[*] GET parameter 'id' is vulnerable. Do you want to exploit? [Y/n] Y" },
      { t: "",      v: "[*] available databases [2]:" },
      { t: "",      v: "    [*] information_schema" },
      { t: "success", v: "    [*] xakker_ctf" },
      { t: "",      v: "[*] fetching tables for database: xakker_ctf" },
      { t: "",      v: "    [*] users" },
      { t: "",      v: "" },
      { t: "",      v: "+----+----------+----------------------------------+-------------------------------+" },
      { t: "",      v: "| id | username | password_hash                    | flag                          |" },
      { t: "",      v: "+----+----------+----------------------------------+-------------------------------+" },
      { t: "success", v: "| 1  | admin    | $2y$10$mXhAzP4g...             | xkr{SQL_1nj3ct10n_m4st3r}     |" },
      { t: "",      v: "+----+----------+----------------------------------+-------------------------------+" },
      { t: "",      v: "" },
      { t: "success", v: "[ ✓ SQL injection uğurlu! Flag tapıldı: xkr{SQL_1nj3ct10n_m4st3r} ]" },
    ],
  },
  {
    test: c => c.startsWith("nc") || c.startsWith("netcat"),
    run: () => [
      { t: "info",    v: "Ncat: Version 7.94 ( https://nmap.org/ncat )" },
      { t: "info",    v: "Ncat: Listening on :::4444" },
      { t: "success", v: "Ncat: Connection from 10.10.11.42:49210." },
      { t: "",        v: "" },
      { t: "",        v: "whoami" },
      { t: "success", v: "www-data" },
      { t: "",        v: "id" },
      { t: "",        v: "uid=33(www-data) gid=33(www-data) groups=33(www-data)" },
      { t: "",        v: "cat /home/ctfuser/user.txt" },
      { t: "success", v: "xkr{us3r_fl4g_pwn3d}" },
      { t: "",        v: "" },
      { t: "success", v: "[ ✓ Reverse shell alındı! user.txt oxundu. ]" },
    ],
  },
  {
    test: c => c === "whoami",
    run: () => [{ t: "success", v: "root" }],
  },
  {
    test: c => c === "id",
    run: () => [{ t: "", v: "uid=0(root) gid=0(root) groups=0(root)" }],
  },
  {
    test: c => c.includes("cat") && c.includes("passwd"),
    run: () => [
      { t: "", v: "root:x:0:0:root:/root:/bin/bash" },
      { t: "", v: "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin" },
      { t: "", v: "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin" },
      { t: "success", v: "ctfuser:x:1000:1000:CTF User:/home/ctfuser:/bin/bash" },
      { t: "", v: "mysql:x:999:999:MySQL Server:/nonexistent:/bin/false" },
    ],
  },
  {
    test: c => c.startsWith("find") && c.includes("perm"),
    run: () => [
      { t: "",        v: "/usr/bin/find" },
      { t: "success", v: "/usr/bin/python3.10" },
      { t: "",        v: "/usr/bin/pkexec" },
      { t: "",        v: "/usr/lib/dbus-1.0/dbus-daemon-launch-helper" },
      { t: "",        v: "" },
      { t: "success", v: "[ ✓ /usr/bin/python3.10 SUID — privilege escalation mümkün! ]" },
    ],
  },
  {
    test: c => c.startsWith("ls"),
    run: () => [
      { t: "muted", v: "total 52" },
      { t: "", v: "drwxr-xr-x 4 www-data www-data 4096 Jan 10 2024 ." },
      { t: "", v: "drwxr-xr-x 8 root     root     4096 Jan 10 2024 .." },
      { t: "success", v: "-rw-r--r-- 1 root     root      189 Jan 10 2024 .htpasswd" },
      { t: "", v: "-rw-r--r-- 1 www-data www-data 2048 Jan 10 2024 index.php" },
      { t: "", v: "-rw-r--r-- 1 www-data www-data  512 Jan 10 2024 config.php" },
      { t: "", v: "drwxr-xr-x 2 www-data www-data 4096 Jan 10 2024 uploads" },
    ],
  },
  {
    test: c => c.startsWith("python") && c.includes("-c"),
    run: () => [
      { t: "success", v: "root@xakker:/var/www/html# " },
      { t: "success", v: "# whoami" },
      { t: "success", v: "root" },
      { t: "success", v: "[ ✓ Root shell əldə edildi! Privilege escalation uğurlu! ]" },
    ],
  },
];

const COMPLETIONS = ["nmap","gobuster","curl","hydra","sqlmap","nc","netcat","whoami","id","cat","find","ls","help","clear","python3"];

function simulate(raw) {
  const c = raw.trim().toLowerCase();
  if (!c) return null;
  if (c === "clear") return { clear: true };
  for (const e of SIM) {
    if (e.test(c)) return { lines: e.run(c) };
  }
  return {
    lines: [
      { t: "err", v: `zsh: command not found: ${raw.split(" ")[0]}` },
      { t: "muted", v: "Mövcud əmrləri görmək üçün 'help' yaz." },
    ],
  };
}

/* ── Difficulty badge ──────────────────────────────────────────── */
const DIFF = {
  beginner:     { label: "Asan",    color: "#6effd6", n: 1 },
  easy:         { label: "Asan",    color: "#6effd6", n: 1 },
  intermediate: { label: "Orta",    color: "#ffb86b", n: 2 },
  medium:       { label: "Orta",    color: "#ffb86b", n: 2 },
  advanced:     { label: "Çətin",   color: "#ff7a8a", n: 3 },
  hard:         { label: "Çətin",   color: "#ff7a8a", n: 3 },
  expert:       { label: "Ekspert", color: "#c084fc", n: 4 },
};
function DiffBadge({ level }) {
  const d = DIFF[(level || "beginner").toLowerCase()] || DIFF.beginner;
  return (
    <span className="fi-badge" style={{
      color: d.color, background: `${d.color}14`, border: `1px solid ${d.color}35`,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <svg key={i} width={10} height={10} viewBox="0 0 24 24"
          fill={i < d.n ? d.color : "none"} stroke={i < d.n ? d.color : "rgba(255,255,255,0.18)"} strokeWidth={1.5}>
          <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.6 1.2-6L3.3 9.4l6.1-.8z" />
        </svg>
      ))}
      {d.label}
    </span>
  );
}

/* ── Kali-style PS1 prompt renderer ───────────────────────────── */
function KaliPS1({ cmd, isInput = false }) {
  return (
    <div className="lab-cmd-block">
      <div className="lab-ps1-line-1">
        <span className="kali-bracket">┌──(</span>
        <span className="kali-user">kali</span>
        <span className="kali-at">㉿</span>
        <span className="kali-host">xakker</span>
        <span className="kali-bracket">)-[</span>
        <span className="kali-path">~/lab</span>
        <span className="kali-bracket">]</span>
      </div>
      <div className="lab-ps1-line-2">
        <span className="kali-bracket">└─</span>
        <span className="kali-dollar">$ </span>
        {isInput ? null : <span className="kali-cmd">{cmd}</span>}
      </div>
    </div>
  );
}

/* ── Single task row + answer submission ─────────────────────── */
function TaskRow({ task, roomSlug, onDone }) {
  const isDone = task.completed || task._localDone;
  const [open,    setOpen]    = useState(false);
  const [answers, setAnswers] = useState({}); // questionId → value
  const [states,  setStates]  = useState({}); // questionId → idle|checking|ok|wrong
  const [msgs,    setMsgs]    = useState({}); // questionId → message
  const [hints,   setHints]   = useState({}); // questionId → text|null

  const submit = async (q) => {
    const val = (answers[q.id] || "").trim();
    if (!val || states[q.id] === "checking" || states[q.id] === "ok") return;
    setStates(s => ({ ...s, [q.id]: "checking" }));
    try {
      const res = await endpoints.submitAnswer(roomSlug, task.slug, {
        question_id: q.id,
        answer: val,
      });
      const d = res.data;
      if (d.is_correct) {
        setStates(s => ({ ...s, [q.id]: "ok" }));
        setMsgs(m => ({ ...m, [q.id]: d.explanation || "✓ Düzgün cavab! " + (d.xp_delta ? `+${d.xp_delta} XP` : "") }));
        onDone(task.id);
      } else {
        setStates(s => ({ ...s, [q.id]: "wrong" }));
        setMsgs(m => ({ ...m, [q.id]: d.explanation || "✗ Yanlış cavab. Yenidən cəhd et." }));
        setTimeout(() => setStates(s => ({ ...s, [q.id]: "idle" })), 2200);
      }
    } catch {
      setStates(s => ({ ...s, [q.id]: "wrong" }));
      setMsgs(m => ({ ...m, [q.id]: "Xəta baş verdi." }));
      setTimeout(() => setStates(s => ({ ...s, [q.id]: "idle" })), 2200);
    }
  };

  const revealHint = async (q) => {
    if (hints[q.id] !== undefined) return;
    try {
      const res = await endpoints.revealHint(roomSlug, task.slug, q.id);
      setHints(h => ({ ...h, [q.id]: res.data?.hint || "" }));
    } catch {
      setHints(h => ({ ...h, [q.id]: "" }));
    }
  };

  const itemClass = isDone ? "done" : open ? "active" : "";

  return (
    <div className={`lab-task-item ${itemClass}`}>
      <button className="lab-task-header" onClick={() => !isDone && setOpen(v => !v)}>
        <div className="lab-task-num">
          {isDone
            ? <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12l4 4 10-10" /></svg>
            : task.order}
        </div>
        <span className="lab-task-title">{task.title}</span>
        <span className="lab-task-xp">+{task.points}</span>
        {!isDone && (
          <svg className={`lab-task-chevron${open ? " open" : ""}`}
            width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      {open && !isDone && (
        <div className="lab-task-body">
          {task.questions?.map(q => (
            <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="lab-task-prompt">{q.prompt}</div>

              <div className="lab-answer-row">
                <input
                  className={`lab-answer-input${states[q.id] === "ok" ? " ok" : states[q.id] === "wrong" ? " wrong" : ""}`}
                  placeholder={q.kind === "flag" ? "xkr{...}" : "Cavabı daxil et..."}
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && submit(q)}
                  disabled={states[q.id] === "ok"}
                />
                <button
                  className="lab-answer-btn"
                  onClick={() => submit(q)}
                  disabled={!answers[q.id]?.trim() || states[q.id] === "ok" || states[q.id] === "checking"}
                >
                  {states[q.id] === "checking" ? "…" : "→"}
                </button>
              </div>

              {msgs[q.id] && (
                <div className={`lab-answer-fb ${states[q.id] === "ok" ? "ok" : "wrong"}`}>
                  {msgs[q.id]}
                </div>
              )}

              {q.has_hint && hints[q.id] === undefined && (
                <button className="lab-hint-btn" onClick={() => revealHint(q)}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                    <rect x={3} y={11} width={18} height={11} rx={2} />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  İpucunu göstər
                  {q.hint_cost > 0 && <span className="lab-hint-cost">-{q.hint_cost} XP</span>}
                </button>
              )}

              {hints[q.id] && (
                <div className="lab-hint-text">
                  <div className="lab-hint-label">💡 İpucu</div>
                  {hints[q.id]}
                </div>
              )}
            </div>
          ))}

          {(!task.questions || task.questions.length === 0) && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", margin: 0 }}>
              Bu tapşırıq üçün cavab forması yoxdur.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── About tab content ─────────────────────────────────────────── */
function AboutTab({ room, targetIp }) {
  const level = (room.level || "beginner").toLowerCase();
  const diff = DIFF[level] || DIFF.beginner;

  const envInfo = {
    docker:  { label: "Docker Container", desc: "Yüngülçəkili, sürətli başlayan mühit." },
    vm:      { label: "Virtual Machine",  desc: "Tam izolə edilmiş VM, real OS." },
    linux:   { label: "Linux Server",     desc: "Linux əsaslı hədəf sistem." },
    windows: { label: "Windows Server",   desc: "Windows əsaslı hədəf sistem." },
    web:     { label: "Web App",          desc: "Bulud əsaslı veb tətbiq hədəfi." },
    cloud:   { label: "Cloud Instance",   desc: "Bulud əsaslı infrastruktur hədəfi." },
  }[(room.env || "docker").toLowerCase()] || { label: room.env || "Docker", desc: "" };

  return (
    <div className="lab-about">
      <h2>{room.title}</h2>
      <p>{room.description || room.summary || "İzolyasiya olunmuş mühitdə praktik pentest məşqi."}</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10, margin: "18px 0",
      }}>
        {[
          { label: "Hədəf IP",  value: targetIp, mono: true,  color: "var(--accent)" },
          { label: "Mühit",     value: envInfo.label                                  },
          { label: "Çətinlik",  value: diff.label, color: diff.color                  },
          { label: "Müddət",    value: `~${room.estimated_minutes || 60} dəq`         },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
            borderRadius: 8, padding: "10px 12px",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: s.mono ? "var(--font-mono)" : "var(--font-display)",
              fontWeight: 700, fontSize: 13,
              color: s.color || "var(--ink-1)",
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 18 }}>Başlamaq üçün</h2>
      <p>Aşağıdakı addımları izlə:</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {[
          { n: "1", text: `nmap -sV ${targetIp} — Açıq portları tap` },
          { n: "2", text: `gobuster dir -u http://${targetIp} — Gizli URL-ləri axtar` },
          { n: "3", text: "Tapılan giriş nöqtəsini araşdır" },
          { n: "4", text: "Flag-ı tap və tapşırıq formasına daxil et" },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              background: "var(--accent)", color: "#fff",
              width: 18, height: 18, borderRadius: "50%",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1,
            }}>{s.n}</span>
            <code style={{ fontSize: 12.5, color: "var(--ink-2)", fontFamily: "var(--font-mono)", background: "none", padding: 0 }}>{s.text}</code>
          </div>
        ))}
      </div>

      <h2>Terminal haqqında</h2>
      <p>
        Sağdakı terminal simulyasiya edilmiş bir Kali Linux mühitidir.
        Real alət çıxışlarına bənzər cavablar verir.
        <code>help</code> yazaraq əmrlərin siyahısını gör.
        ↑/↓ düymələri ilə əmr tarixçəsinə dön, <code>Tab</code> ilə tamamla.
      </p>
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function RoomDetailPage() {
  const { slug } = useParams();

  const [room,     setRoom]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [doneTasks, setDoneTasks] = useState(new Set());
  const [tab,      setTab]      = useState("terminal"); // terminal | about | writeup

  /* Terminal state */
  const makeWelcome = (ip) => [
    {
      type: "banner",
      lines: [
        { t: "banner", v: "  ██╗  ██╗ █████╗ ██╗  ██╗██╗  ██╗███████╗██████╗ " },
        { t: "banner", v: "  ╚██╗██╔╝██╔══██╗██║ ██╔╝██║ ██╔╝██╔════╝██╔══██╗" },
        { t: "banner", v: "   ╚███╔╝ ███████║█████╔╝ █████╔╝ █████╗  ██████╔╝" },
        { t: "banner", v: "   ██╔██╗ ██╔══██║██╔═██╗ ██╔═██╗ ██╔══╝  ██╔══██╗" },
        { t: "banner", v: "  ██╔╝ ██╗██║  ██║██║  ██╗██║  ██╗███████╗██║  ██║" },
        { t: "banner", v: "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝" },
        { t: "muted",  v: "" },
        { t: "info",   v: `  Pentest Lab v2.1  |  Hədəf: ${ip || "10.10.11.1"}  |  VPN: aktiv` },
        { t: "muted",  v: "  ─────────────────────────────────────────────────" },
        { t: "",       v: "  'help' yazaraq mövcud əmrləri gör." },
        { t: "muted",  v: "" },
      ],
    },
  ];

  const [blocks,   setBlocks]   = useState(() => makeWelcome("10.10.11.1"));
  const [cmd,      setCmd]      = useState("");
  const [history,  setHistory]  = useState([]);
  const [histIdx,  setHistIdx]  = useState(-1);
  const [savedCmd, setSavedCmd] = useState("");

  const outputRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    let ok = true;
    endpoints.room(slug)
      .then(({ data }) => {
        if (!ok) return;
        setRoom(data);
        // Reset welcome banner with real IP
        setBlocks(makeWelcome(data.target_ip || "10.10.11.1"));
        // Pre-mark completed tasks
        if (data.tasks) {
          const done = new Set(data.tasks.filter(t => t.completed).map(t => t.id));
          setDoneTasks(done);
        }
      })
      .catch(() => {})
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [slug]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [blocks]);

  const markDone = useCallback((taskId) => {
    setDoneTasks(prev => new Set(prev).add(taskId));
  }, []);

  const handleRun = useCallback(() => {
    const c = cmd.trim();
    if (!c) return;

    const result = simulate(c);

    setHistory(prev => {
      const next = [...prev.filter(x => x !== c), c];
      return next.slice(-100);
    });
    setHistIdx(-1);
    setSavedCmd("");
    setCmd("");

    if (!result) return;

    if (result.clear) {
      setBlocks(makeWelcome(room?.target_ip || "10.10.11.1"));
      return;
    }

    setBlocks(prev => [
      ...prev,
      { type: "cmd", cmd: c, lines: result.lines || [] },
    ]);
  }, [cmd, room]);

  const handleKeyDown = useCallback(e => {
    if (e.key === "Enter") { handleRun(); return; }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      if (histIdx < 0) setSavedCmd(cmd);
      setHistIdx(idx);
      setCmd(history[idx]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) { setHistIdx(-1); setCmd(savedCmd); }
      else { setHistIdx(idx); setCmd(history[idx]); }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const parts = cmd.split(" ");
      const last  = parts[parts.length - 1];
      if (!last) return;
      const match = COMPLETIONS.find(w => w.startsWith(last) && w !== last);
      if (match) { parts[parts.length - 1] = match; setCmd(parts.join(" ")); }
    }
  }, [cmd, history, histIdx, savedCmd, handleRun]);

  /* ── Loading ── */
  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TileSkeleton height={52} />
          <TileSkeleton height={540} />
        </div>
      </AppShell>
    );
  }

  if (!room) {
    return (
      <AppShell>
        <Link to="/rooms" className="fi-back">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Laboratoriyalara qayıt
        </Link>
        <div className="xk-empty-screen">
          <div className="xk-empty-ico">🧪</div>
          <h3>Lab tapılmadı</h3>
        </div>
      </AppShell>
    );
  }

  const tasks     = room.tasks || [];
  const totalXp   = room.total_points || tasks.reduce((s, t) => s + (t.points || 0), 0) || 150;
  const doneCount = doneTasks.size;
  const allDone   = tasks.length > 0 && doneCount >= tasks.length;
  const pct       = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : (room.progress_percent || 0);
  const targetIp  = room.target_ip || "10.10.11.1";

  const envIcon = { docker:"🐳", vm:"💻", linux:"🐧", windows:"🪟", web:"🌐", cloud:"☁️" }[
    (room.env || "").toLowerCase()
  ] || "🧪";

  const QUICK = [
    { label: "nmap",     fill: `nmap -sV ${targetIp}` },
    { label: "gobuster", fill: `gobuster dir -u http://${targetIp}` },
    { label: "curl",     fill: `curl http://${targetIp}/admin` },
    { label: "hydra",    fill: `hydra -l admin -P rockyou.txt ${targetIp} http-post-form` },
    { label: "sqlmap",   fill: `sqlmap -u 'http://${targetIp}/?id=1' --dbs` },
    { label: "nc",       fill: `nc -lvnp 4444` },
  ];

  return (
    <AppShell>
      <div className="xk-screen" style={{ paddingBottom: 0 }}>

        {/* Back */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Link to="/rooms" className="fi-back" style={{ marginBottom: 0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Geri
          </Link>
          <span style={{ color: "var(--line-3)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-4)" }}>
            Laboratoriyalar
          </span>
          <span style={{ color: "var(--line-3)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-2)" }}>
            {room.title}
          </span>
        </div>

        {/* Header bar */}
        <div className="lab-header">
          <span style={{ fontSize: 22, flexShrink: 0 }}>{envIcon}</span>
          <span className="lab-header-title">{room.title}</span>
          <div className="lab-header-badges">
            <DiffBadge level={room.level} />
            <span className="fi-badge fi-badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
              {(room.env || "Docker").toUpperCase()}
            </span>
            <span className="fi-badge fi-badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
              {targetIp}
            </span>
            {allDone
              ? <span className="lab-status-dot done">✓ Tamamlandı</span>
              : <span className="lab-status-dot active">Aktiv</span>
            }
          </div>
        </div>

        {/* Split workspace */}
        <div className="lab-workspace">

          {/* ── LEFT PANEL ── */}
          <div className="lab-left">
            <div className="lab-left-scroll">

              {/* Machine info */}
              <div className="lab-panel-sect">
                <div className="lab-panel-head">Machine</div>
                {[
                  { k: "IP",     v: targetIp,              mono: true, accent: true },
                  { k: "OS",     v: "Linux / Debian 11"                              },
                  { k: "Mühit",  v: room.env || "Docker"                             },
                  { k: "VPN",    v: "WireGuard",            mono: true               },
                  { k: "XP",     v: `${totalXp} xp`,        mono: true               },
                ].map(row => (
                  <div key={row.k} className="lab-info-row">
                    <span className="lab-info-key">{row.k}</span>
                    <span className={`lab-info-val${row.accent ? " accent" : ""}`}>{row.v}</span>
                  </div>
                ))}

                {pct > 0 && (
                  <div className="lab-progress-wrap">
                    <div className="lab-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>

              {/* Tasks */}
              <div className="lab-panel-sect">
                <div className="lab-panel-head">
                  Tapşırıqlar
                  <span className="lab-panel-head-count">{doneCount}/{tasks.length}</span>
                </div>

                {tasks.length === 0 ? (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", margin: 0 }}>
                    Tapşırıq yoxdur.
                  </p>
                ) : (
                  <div className="lab-task-list">
                    {tasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={{ ...task, _localDone: doneTasks.has(task.id) }}
                        roomSlug={slug}
                        onDone={markDone}
                      />
                    ))}
                  </div>
                )}

                {allDone && (
                  <div className="lab-done-banner" style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 18 }}>🎉</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ok)" }}>
                        Lab tamamlandı!
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ok)", opacity: 0.7 }}>
                        +{totalXp} XP qazandın
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick commands */}
              <div className="lab-panel-sect">
                <div className="lab-panel-head">Tez əmrlər</div>
                <div className="lab-quick-row">
                  {QUICK.map(q => (
                    <button
                      key={q.label}
                      className="lab-qcmd"
                      onClick={() => {
                        setTab("terminal");
                        setCmd(q.fill);
                        inputRef.current?.focus();
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* ── RIGHT PANEL: TERMINAL ── */}
          <div className="lab-right">

            {/* Tab bar */}
            <div className="lab-tabs">
              <div className="lab-tab-traffic">
                <span className="lab-tab-dot r" />
                <span className="lab-tab-dot y" />
                <span className="lab-tab-dot g" />
              </div>
              {[
                { id: "terminal", label: "Terminal", icon: ">_" },
                { id: "about",    label: "Haqqında", icon: "ℹ" },
                { id: "writeup",  label: allDone ? "Write-up" : "Write-up 🔒", icon: "📄", locked: !allDone },
              ].map(t => (
                <button
                  key={t.id}
                  className={`lab-tab${tab === t.id ? " active" : ""}${t.locked ? " locked" : ""}`}
                  onClick={() => !t.locked && setTab(t.id)}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.6 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}

              {/* Reset */}
              <button
                style={{
                  marginLeft: "auto", marginRight: 8,
                  background: "none", border: "1px solid var(--line-2)", borderRadius: 6,
                  padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 10.5,
                  color: "var(--ink-4)", cursor: "pointer", transition: "color 150ms, border-color 150ms",
                }}
                onMouseOver={e => { e.currentTarget.style.color = "var(--ink-1)"; e.currentTarget.style.borderColor = "var(--line-3)"; }}
                onMouseOut={e => { e.currentTarget.style.color = "var(--ink-4)"; e.currentTarget.style.borderColor = "var(--line-2)"; }}
                onClick={() => {
                  setBlocks(makeWelcome(targetIp));
                  setHistory([]);
                  setHistIdx(-1);
                  setSavedCmd("");
                  setCmd("");
                }}
              >
                ↺ Sıfırla
              </button>
            </div>

            {/* Terminal tab */}
            {tab === "terminal" && (
              <>
                <div ref={outputRef} className="lab-term-output" onClick={() => inputRef.current?.focus()}>
                  {blocks.map((block, bi) => {
                    if (block.type === "banner") {
                      return (
                        <div key={bi} className="lab-welcome">
                          {block.lines.map((l, li) => (
                            <div key={li} className={`lab-out-line${l.t ? ` ${l.t}` : ""}`}>{l.v}</div>
                          ))}
                        </div>
                      );
                    }
                    if (block.type === "cmd") {
                      return (
                        <div key={bi} style={{ marginBottom: 14 }}>
                          <KaliPS1 cmd={block.cmd} />
                          {block.lines.map((l, li) => (
                            <div key={li} className={`lab-out-line${l.t ? ` ${l.t}` : ""}`}>{l.v}</div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Live input prompt */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="lab-ps1-line-1">
                      <span className="kali-bracket">┌──(</span>
                      <span className="kali-user">kali</span>
                      <span className="kali-at">㉿</span>
                      <span className="kali-host">xakker</span>
                      <span className="kali-bracket">)-[</span>
                      <span className="kali-path">~/lab</span>
                      <span className="kali-bracket">]</span>
                    </div>
                    <div className="lab-ps1-line-2">
                      <span className="kali-bracket">└─</span>
                      <span className="kali-dollar">$ </span>
                      <span className="kali-cmd">{cmd}</span>
                      {!cmd && <span className="kali-cursor" />}
                    </div>
                  </div>
                </div>

                <div className="lab-term-input-row">
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)", fontWeight: 700, marginRight: 8, userSelect: "none" }}>
                    $
                  </span>
                  <input
                    ref={inputRef}
                    className="lab-term-inp"
                    value={cmd}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="əmri yaz… (↑↓ tarixçə, Tab tamamla)"
                    onChange={e => setCmd(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="lab-run-btn" onClick={handleRun}>Enter</button>
                </div>
              </>
            )}

            {/* About tab */}
            {tab === "about" && (
              <AboutTab room={room} targetIp={targetIp} />
            )}

            {/* Write-up (locked) */}
            {tab === "writeup" && allDone && (
              <div className="lab-about">
                <h2>Write-up</h2>
                <p>
                  Təbriklər! Bu lab üçün yazılmış addım-addım write-up aşağıdadır.
                </p>
                <pre>{`# ${room.title} — Write-up

## 1. Reconnaissance
$ nmap -sV ${targetIp}
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    Apache 2.4.52
3306/tcp open  mysql   MySQL 8.0

## 2. Web Enumeration
$ gobuster dir -u http://${targetIp}
/admin/login.php  (Status: 200)
/backup/db.sql    (Status: 200)

## 3. SQL Injection
$ sqlmap -u 'http://${targetIp}/?id=1' --dbs --dump
Flag: xkr{SQL_1nj3ct10n_m4st3r}
`}
                </pre>
              </div>
            )}

          </div>
        </div>
      </div>
    </AppShell>
  );
}
