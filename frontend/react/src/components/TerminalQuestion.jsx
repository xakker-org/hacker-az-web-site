/**
 * TerminalQuestion — Kali-style interactive terminal for "terminal" question type.
 *
 * Reuses lab.css tokens (.lab-right, .lab-term-output, .lab-tabs, kali-* classes).
 * Checks correctness via the real API on each meaningful command.
 * When correct: shows XAKKER.org ASCII success banner inside terminal output.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/* ── Command simulation engine ─────────────────────────────────── */
const SIM = [
  {
    test: c => c === "help",
    run: () => [
      { t: "info",  v: "Mövcud əmrlər:" },
      { t: "",      v: "  nmap  -sV <ip>            — Port skanı" },
      { t: "",      v: "  gobuster dir -u <url>     — Dir brute-force" },
      { t: "",      v: "  curl  <url>               — HTTP sorğu" },
      { t: "",      v: "  cat   <fayl>              — Fayl oxu" },
      { t: "",      v: "  ls    [-la] [qovluq]      — Fayl siyahısı" },
      { t: "",      v: "  find  / -name <ad>        — Fayl axtar" },
      { t: "",      v: "  grep  <pattern> <fayl>    — Mətn axtar" },
      { t: "",      v: "  whoami / id               — Cari istifadəçi" },
      { t: "",      v: "  base64 -d <<< <string>    — Base64 decode" },
      { t: "",      v: "  echo   <mətn>             — Mətn çap et" },
      { t: "",      v: "  sqlmap -u <url>            — SQL injection" },
      { t: "",      v: "  hydra  -l user -P wl <t>  — Brute-force" },
      { t: "",      v: "  clear                     — Ekranı təmizlə" },
    ],
  },
  {
    test: c => c.startsWith("nmap"),
    run: c => {
      const hasV = c.includes("-sv") || c.includes("-sc") || c.includes("-a");
      const ip   = c.match(/\d{1,3}(?:\.\d{1,3}){3}/)?.[0] || "TARGET";
      return [
        { t: "muted", v: `Starting Nmap 7.94 at ${new Date().toLocaleTimeString()}` },
        { t: "",      v: `Nmap scan report for ${ip}` },
        { t: "",      v: "Host is up (0.032s latency)." },
        { t: "",      v: "" },
        { t: "",      v: "PORT     STATE SERVICE" + (hasV ? " VERSION" : "") },
        { t: "",      v: "22/tcp   open  ssh"   + (hasV ? "     OpenSSH 8.9p1" : "") },
        { t: "success", v: "80/tcp   open  http"  + (hasV ? "    Apache httpd 2.4.52" : "") },
        { t: "",      v: "3306/tcp open  mysql" + (hasV ? "   MySQL 8.0.32" : "") },
        { t: "",      v: "" },
        { t: "success", v: "[ ✓ HTTP servisi 80-ci portda tapıldı ]" },
      ];
    },
  },
  {
    test: c => c.startsWith("gobuster"),
    run: () => [
      { t: "muted",   v: "Gobuster v3.6 — directory enumeration" },
      { t: "",        v: "/index.php       (Status: 200)" },
      { t: "success", v: "/admin/login.php (Status: 200)  ← TAPILDI" },
      { t: "",        v: "/uploads         (Status: 403)" },
      { t: "success", v: "/backup/db.sql   (Status: 200)  ← AÇIQ DB!" },
    ],
  },
  {
    test: c => c.startsWith("curl"),
    run: c => {
      const url = c.split(" ").pop() || "";
      if (url.includes("flag") || url.includes("secret")) {
        return [{ t: "muted", v: "< HTTP/1.1 200 OK" }, { t: "", v: "" }, { t: "success", v: "xkr{curl_m4st3r_2024}" }];
      }
      if (url.includes("admin")) {
        return [
          { t: "muted",   v: "< HTTP/1.1 200 OK  Server: Apache/2.4.52" },
          { t: "",        v: "" },
          { t: "",        v: "<form action='/admin/login.php' method='POST'>" },
          { t: "",        v: "  <input name='username'/><input name='password' type='password'/>" },
          { t: "",        v: "</form>" },
          { t: "success", v: "[ ✓ Admin login forması tapıldı ]" },
        ];
      }
      return [{ t: "muted", v: "< HTTP/1.1 200 OK  X-Powered-By: PHP/8.1" }, { t: "", v: "<html><body>Xakker CTF</body></html>" }];
    },
  },
  {
    test: c => c.startsWith("cat"),
    run: c => {
      const path = c.split(" ").pop() || "";
      if (path.includes("passwd")) {
        return [
          { t: "",        v: "root:x:0:0:root:/root:/bin/bash" },
          { t: "",        v: "www-data:x:33:33::/var/www:/usr/sbin/nologin" },
          { t: "success", v: "ctfuser:x:1000:1000::/home/ctfuser:/bin/bash" },
        ];
      }
      if (path.includes("flag") || path.includes("secret") || path.includes("txt")) {
        return [{ t: "success", v: "xkr{c4t_th3_fl4g_2024}" }];
      }
      if (path.includes("shadow")) {
        return [{ t: "err", v: "cat: /etc/shadow: Permission denied" }];
      }
      return [{ t: "", v: "# Bu fayl mövcuddur" }, { t: "", v: "HINT=Düzgün əmri tap" }];
    },
  },
  {
    test: c => c.startsWith("ls"),
    run: c => c.includes("-la") || c.includes("-l") ? [
      { t: "muted",   v: "total 48" },
      { t: "",        v: "drwxr-xr-x  www-data  index.php" },
      { t: "success", v: "-rw-r--r--  root      .secret_flag  ← GİZLİ!" },
      { t: "",        v: "drwxr-xr-x  www-data  uploads/" },
    ] : [
      { t: "",      v: "index.php  config.php  uploads/" },
      { t: "muted", v: "İpucu: 'ls -la' ilə gizli faylları gör" },
    ],
  },
  {
    test: c => c.startsWith("find"),
    run: () => [
      { t: "",        v: "./index.php" },
      { t: "success", v: "./.hidden/flag.txt  ← TAPILDI" },
      { t: "",        v: "./uploads/img.png" },
      { t: "success", v: "[ ✓ Gizli fayl tapıldı: ./.hidden/flag.txt ]" },
    ],
  },
  {
    test: c => c.startsWith("grep"),
    run: c => {
      const pat = c.split(" ")[1] || "";
      if (pat.toLowerCase().includes("flag") || pat.toLowerCase().includes("xkr")) {
        return [
          { t: "muted",   v: `Searching for "${pat}"...` },
          { t: "success", v: 'config.php: $flag = "xkr{gr3p_f0und_1t}";' },
        ];
      }
      return [
        { t: "muted", v: `Searching for "${pat}"...` },
        { t: "",      v: "config.php: define('DB_PASS', 'secret123');" },
      ];
    },
  },
  {
    test: c => c.startsWith("whoami") || c === "id",
    run: c => [{ t: c === "id" ? "" : "success", v: c === "id" ? "uid=33(www-data) gid=33(www-data)" : "www-data" }],
  },
  {
    test: c => c.startsWith("base64"),
    run: c => c.includes("-d")
      ? [{ t: "success", v: "xkr{b4s364_d3c0d3d!}" }]
      : [{ t: "", v: "eGtyezEybWVuNHRpb259" }],
  },
  {
    test: c => c.startsWith("echo"),
    run: c => [{ t: "", v: c.slice(5).replace(/["']/g, "") }],
  },
  {
    test: c => c.startsWith("python"),
    run: () => [{ t: "success", v: "xkr{pyth0n_3x3cut3d}" }],
  },
  {
    test: c => c.startsWith("sqlmap"),
    run: () => [
      { t: "muted",   v: "sqlmap/1.7.9 — SQL injection tool" },
      { t: "",        v: "[*] GET parameter 'id' is vulnerable" },
      { t: "success", v: "[*] users: id | admin | xkr{sql_1nj3ct10n_m4st3r}" },
    ],
  },
  {
    test: c => c.startsWith("hydra"),
    run: () => [
      { t: "muted",   v: "Hydra v9.4" },
      { t: "",        v: "[DATA] attacking http-post-form on target" },
      { t: "success", v: "[SUCCESS] admin:P@ssw0rd2024" },
    ],
  },
  {
    test: c => c.startsWith("nc") || c.startsWith("netcat"),
    run: () => [
      { t: "info",    v: "Ncat: Connected." },
      { t: "success", v: "xkr{netcat_p0wn3d}" },
    ],
  },
];

const TAB_WORDS = [
  "nmap","gobuster","curl","cat","ls","find","grep",
  "whoami","id","base64","echo","python3","sqlmap","hydra","nc","help","clear",
];

/* Commands that are purely navigational — skip API check */
const SKIP_CHECK = new Set(["help","clear","whoami","id","ls"]);

function runSim(raw) {
  const c = raw.trim().toLowerCase();
  if (!c) return null;
  if (c === "clear") return { clear: true };
  for (const e of SIM) {
    if (e.test(c)) return { lines: e.run(c) };
  }
  return {
    lines: [
      { t: "err",   v: `zsh: command not found: ${raw.split(" ")[0]}` },
      { t: "muted", v: "Kömək üçün 'help' yaz." },
    ],
  };
}

/* ── XAKKER.org ASCII success banner ──────────────────────────── */
function buildSuccessBanner(points) {
  const W = 52;
  const pad = s => s + " ".repeat(Math.max(0, W - s.length - 2));
  return [
    { t: "success", v: "" },
    { t: "success", v: "╔" + "═".repeat(W) + "╗" },
    { t: "success", v: "║" + pad("  ✓  XAKKER.org") + "║" },
    { t: "success", v: "║" + pad("  Bu suali düzgün cavablandırdın!") + "║" },
    { t: "success", v: "║" + pad(`  +${points} XP qazandın`) + "║" },
    { t: "success", v: "╚" + "═".repeat(W) + "╝" },
    { t: "success", v: "" },
  ];
}

/* ── Kali PS1 ──────────────────────────────────────────────────── */
function PS1({ cmd }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <div className="lab-ps1-line-1">
        <span className="kali-bracket">┌──(</span>
        <span className="kali-user">kali</span>
        <span className="kali-at">㉿</span>
        <span className="kali-host">xakker</span>
        <span className="kali-bracket">)-[</span>
        <span className="kali-path">~/challenge</span>
        <span className="kali-bracket">]</span>
      </div>
      <div className="lab-ps1-line-2">
        <span className="kali-bracket">└─</span>
        <span className="kali-dollar">$ </span>
        <span className="kali-cmd">{cmd}</span>
      </div>
    </div>
  );
}

/* ================================================================
   Main component
   Props:
     question    — { id, prompt, starter_code, points }
     locked      — already answered (readonly)
     prevAnswer  — previous submitted answer string
     prevCorrect — was previous answer correct
     onAttempt   — async (answerText) => { is_correct, points_awarded, ... }
                   called on every non-trivial command; returns API response
   ================================================================ */
export default function TerminalQuestion({
  question,
  locked,
  prevAnswer,
  prevCorrect,
  onAttempt,
}) {
  const points = question?.points || 10;

  const makeInit = useCallback(() => [
    {
      type: "banner",
      lines: [
        { t: "banner", v: "  ██╗  ██╗ █████╗ ██╗  ██╗██╗  ██╗███████╗██████╗" },
        { t: "banner", v: "  ╚██╗██╔╝██╔══██╗██║ ██╔╝██║ ██╔╝██╔════╝██╔══██╗" },
        { t: "banner", v: "   ╚███╔╝ ███████║█████╔╝ █████╔╝ █████╗  ██████╔╝" },
        { t: "banner", v: "   ██╔██╗ ██╔══██║██╔═██╗ ██╔═██╗ ██╔══╝  ██╔══██╗" },
        { t: "banner", v: "  ██╔╝ ██╗██║  ██║██║  ██╗██║  ██╗███████╗██║  ██║" },
        { t: "banner", v: "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝" },
        { t: "muted",  v: "" },
        { t: "info",   v: "  Terminal Sualı  |  'help' — köməklik  |  ↑↓ tarixçə" },
        { t: "muted",  v: "  ─────────────────────────────────────────────────────" },
        { t: "muted",  v: "" },
      ],
    },
    {
      type: "context",
      lines: [
        { t: "muted",  v: "┌─[ SUAL ]" + "─".repeat(42) },
        { t: "info",   v: `│  ${question?.prompt || ""}` },
        { t: "muted",  v: "└" + "─".repeat(50) },
        { t: "muted",  v: "" },
      ],
    },
  ], [question?.prompt]);

  const [blocks,     setBlocks]     = useState(makeInit);
  const [cmd,        setCmd]        = useState("");
  const [history,    setHistory]    = useState([]);
  const [histIdx,    setHistIdx]    = useState(-1);
  const [savedCmd,   setSavedCmd]   = useState("");
  const [solved,     setSolved]     = useState(false);
  const [checking,   setChecking]   = useState(false);

  const outputRef = useRef(null);
  const inputRef  = useRef(null);
  /* Track whether we've already triggered the locked-state replay */
  const lockedReplayed = useRef(false);

  /* Auto-run starter_code once on mount */
  useEffect(() => {
    const sc = question?.starter_code?.trim();
    if (!sc) return;
    const result = runSim(sc);
    if (!result || result.clear) return;
    setBlocks(prev => [...prev, { type: "cmd", cmd: sc, lines: result.lines || [] }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Replay locked state */
  useEffect(() => {
    if (!locked || !prevAnswer || lockedReplayed.current) return;
    lockedReplayed.current = true;

    const result = runSim(prevAnswer);
    const simLines = (!result?.clear && result?.lines) ? result.lines : [];
    const suffix = prevCorrect
      ? buildSuccessBanner(points)
      : [
          { t: "err",   v: "╔══════════════════════════════════════════════════════╗" },
          { t: "err",   v: "║  ✗  Bu cavab yanlış idi.                             ║" },
          { t: "err",   v: "╚══════════════════════════════════════════════════════╝" },
          { t: "muted", v: "" },
        ];

    setBlocks(prev => [...prev, { type: "cmd", cmd: prevAnswer, lines: [...simLines, ...suffix] }]);
    if (prevCorrect) setSolved(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  /* Scroll output to bottom */
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [blocks]);

  /* ── Run a command ───────────────────────────────────────────── */
  const handleRun = useCallback(async () => {
    const c = cmd.trim();
    if (!c || solved || checking) return;

    setHistory(prev => [...prev.filter(x => x !== c), c].slice(-80));
    setHistIdx(-1);
    setSavedCmd("");
    setCmd("");

    const result = runSim(c);
    if (!result) return;

    if (result.clear) {
      setBlocks(makeInit());
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    const simLines = result.lines || [];
    const firstWord = c.split(" ")[0];
    const shouldCheck = !SKIP_CHECK.has(firstWord);

    /* Show simulated output immediately */
    setBlocks(prev => [...prev, { type: "cmd", cmd: c, lines: simLines }]);

    /* Check against server on non-trivial commands */
    if (shouldCheck && !solved) {
      setChecking(true);

      /* If simulated output contains a flag (xkr{…}), submit the flag as answer */
      const flagLine = simLines.find(l => l.v && /xkr\{[^}]+\}/.test(l.v));
      const answerText = flagLine ? flagLine.v.match(/xkr\{[^}]+\}/)?.[0] || c : c;

      try {
        const data = await onAttempt(answerText);
        if (data?.is_correct) {
          /* Mark replay as done BEFORE locked prop change triggers the effect */
          lockedReplayed.current = true;
          setSolved(true);
          setBlocks(prev => [
            ...prev,
            { type: "success", lines: buildSuccessBanner(points) },
          ]);
        } else {
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      } catch {
        /* Server unreachable or not authenticated — silently ignore */
        setTimeout(() => inputRef.current?.focus(), 0);
      } finally {
        setChecking(false);
      }
    } else {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [cmd, solved, checking, makeInit, onAttempt, points]);

  /* ── Keyboard handler ────────────────────────────────────────── */
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
      const match = TAB_WORDS.find(w => w.startsWith(last) && w !== last);
      if (match) { parts[parts.length - 1] = match; setCmd(parts.join(" ")); }
    }
  }, [cmd, history, histIdx, savedCmd, handleRun]);

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={{
      background: "#060810",
      border: "1px solid var(--line-2)",
      borderRadius: 14,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: 380,
      maxHeight: 800,
    }}>
      {/* Traffic-light + tab bar */}
      <div className="lab-tabs" style={{ background: "rgba(255,255,255,0.025)", padding: "0 8px" }}>
        <div className="lab-tab-traffic">
          <span className="lab-tab-dot r" />
          <span className="lab-tab-dot y" />
          <span className="lab-tab-dot g" />
        </div>
        <span className="lab-tab active" style={{ cursor: "default", pointerEvents: "none" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.6 }}>&gt;_</span>
          Terminal Sualı
        </span>

        {/* Checking indicator */}
        {checking && (
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ink-4)",
            marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <span style={{
              display: "inline-block", width: 6, height: 6,
              borderRadius: "50%", background: "var(--accent)",
              animation: "lab-blink 0.8s ease-in-out infinite",
            }} />
            yoxlanılır…
          </span>
        )}

        {solved && (
          <span className="fi-badge fi-badge-ok" style={{ marginLeft: 8, fontSize: 11 }}>
            ✓ Həll edildi
          </span>
        )}

        <button
          onClick={() => {
            setBlocks(makeInit());
            setCmd("");
            setHistory([]);
            setHistIdx(-1);
            setSavedCmd("");
          }}
          style={{
            marginLeft: "auto", marginRight: 8,
            background: "none", border: "1px solid var(--line-2)", borderRadius: 6,
            padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 10.5,
            color: "var(--ink-4)", cursor: "pointer", transition: "color 150ms, border-color 150ms",
          }}
          onMouseOver={e => { e.currentTarget.style.color = "var(--ink-1)"; e.currentTarget.style.borderColor = "var(--line-3)"; }}
          onMouseOut={e =>  { e.currentTarget.style.color = "var(--ink-4)"; e.currentTarget.style.borderColor = "var(--line-2)"; }}
        >
          ↺ Sıfırla
        </button>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        className="lab-term-output"
        style={{ flex: 1, cursor: solved ? "default" : "text" }}
        onClick={() => !solved && inputRef.current?.focus()}
      >
        {blocks.map((block, bi) => {
          if (block.type === "banner" || block.type === "context") {
            return (
              <div key={bi} style={{ marginBottom: block.type === "context" ? 6 : 0 }}>
                {block.lines.map((l, li) => (
                  <div key={li} className={`lab-out-line${l.t ? ` ${l.t}` : ""}`}>{l.v}</div>
                ))}
              </div>
            );
          }
          if (block.type === "cmd") {
            return (
              <div key={bi} style={{ marginBottom: 12 }}>
                <PS1 cmd={block.cmd} />
                {block.lines.map((l, li) => (
                  <div key={li} className={`lab-out-line${l.t ? ` ${l.t}` : ""}`}>{l.v}</div>
                ))}
              </div>
            );
          }
          if (block.type === "success") {
            return (
              <div key={bi} style={{ marginBottom: 8 }}>
                {block.lines.map((l, li) => (
                  <div key={li} className="lab-out-line success">{l.v}</div>
                ))}
              </div>
            );
          }
          return null;
        })}

        {/* Live prompt */}
        {!solved && (
          <div>
            <div className="lab-ps1-line-1">
              <span className="kali-bracket">┌──(</span>
              <span className="kali-user">kali</span>
              <span className="kali-at">㉿</span>
              <span className="kali-host">xakker</span>
              <span className="kali-bracket">)-[</span>
              <span className="kali-path">~/challenge</span>
              <span className="kali-bracket">]</span>
            </div>
            <div className="lab-ps1-line-2">
              <span className="kali-bracket">└─</span>
              <span className="kali-dollar">$ </span>
              <span className="kali-cmd">{cmd}</span>
              {!cmd && <span className="kali-cursor" />}
            </div>
          </div>
        )}

        {/* Locked prompt */}
        {solved && (
          <div style={{ opacity: 0.45 }}>
            <div className="lab-ps1-line-1">
              <span className="kali-bracket">┌──(</span><span className="kali-user">kali</span>
              <span className="kali-at">㉿</span><span className="kali-host">xakker</span>
              <span className="kali-bracket">)-[</span><span className="kali-path">~/challenge</span>
              <span className="kali-bracket">]</span>
            </div>
            <div className="lab-ps1-line-2">
              <span className="kali-bracket">└─</span>
              <span className="kali-dollar">$ </span>
              <span style={{ color: "var(--ok)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                # Sual həll edildi — terminal kilidləndi ✓
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input row */}
      {!solved && (
        <div className="lab-term-input-row">
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 15,
            color: "var(--accent)", fontWeight: 700,
            marginRight: 10, userSelect: "none",
          }}>$</span>
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
          <button
            className="lab-run-btn"
            onClick={handleRun}
            disabled={!cmd.trim() || checking}
          >
            {checking ? "…" : "Enter"}
          </button>
        </div>
      )}

      {/* Solved footer */}
      {solved && (
        <div style={{
          padding: "10px 18px",
          background: "rgba(25,195,125,0.07)",
          borderTop: "1px solid rgba(25,195,125,0.2)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="var(--ok)" strokeWidth={2.5} strokeLinecap="round">
            <path d="M5 12l4 4 10-10" />
          </svg>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--ok)", fontWeight: 700,
          }}>
            XAKKER.org — Bu suali düzgün cavablandırdın! +{points} XP
          </span>
        </div>
      )}
    </div>
  );
}
