// detail2.jsx — Course / Lab / Cheatsheet / Path detail pages
const { useState: useStateD2, useRef: useRefD2, useEffect: useEffectD2 } = React;

/* ============ Course detail (player + curriculum) ============ */
function buildCourseLessons(course) {
  const names = ["Giriş və quraşdırma", "Əsas anlayışlar", "İlk praktika", "Alətlərlə tanışlıq",
    "Real ssenari", "Dərinləşmə", "Ümumi təkrar", "Yekun layihə", "Əlavə resurslar", "Test"];
  const out = [];
  for (let i = 0; i < course.lessons; i++) {
    out.push({ id: `${course.id}-${i}`, index: i,
      title: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ""),
      type: i % 4 === 3 ? "text" : "video", min: 4 + (i % 5) * 2 });
  }
  return out;
}

function CourseDetail({ anim, id, nav }) {
  const course = window.XK.courses.find((c) => c.id === id) || window.XK.courses[0];
  const lessons = buildCourseLessons(course);
  const startAt = Math.min(Math.floor((course.progress / 100) * lessons.length), lessons.length - 1);
  const [sel, setSel] = useStateD2(startAt);
  const [done, setDone] = useStateD2(() => new Set(lessons.slice(0, startAt).map((_, i) => i)));
  const lesson = lessons[sel];
  const pct = Math.round((done.size / lessons.length) * 100);

  const complete = () => {
    setDone((s) => new Set(s).add(sel));
    if (sel < lessons.length - 1) setSel(sel + 1);
  };

  // group into 2 sections for a curriculum feel
  const half = Math.ceil(lessons.length / 2);
  const sections = [{ label: "Bölmə 1 · Əsaslar", items: lessons.slice(0, half) }, { label: "Bölmə 2 · Praktika", items: lessons.slice(half) }];

  return (
    <div className="xk-screen" style={{ "--ch": course.hue }}>
      <PageBack nav={nav} crumbs={["Kurslar", course.cat]} />
      <div className="xk-course-detail">
        <div className="xk-course-main xk-reveal" style={{ animationDelay: "60ms" }}>
          <div className="xk-player">
            <div className="xk-course-thumb-grid" />
            <button className="xk-player-play"><Icon name="arrow" size={26} /></button>
            <div className="xk-player-cap">{lesson.type === "video" ? "VİDEO" : "MƏTN"} · {lesson.min} dəq</div>
          </div>
          <div className="xk-course-info">
            <div className="xk-course-cat" style={{ position: "static", color: `hsl(${course.hue} 80% 70%)` }}>{course.cat} · {course.author}</div>
            <h1 className="xk-hero-title">{lesson.title}</h1>
            <p className="xk-hero-desc">Bu dərsdə {course.title.toLowerCase()} mövzusunun “{lesson.title.toLowerCase()}” hissəsini addım-addım keçirik. Praktiki nümunələrlə möhkəmləndir.</p>
            <div className="xk-lesson-foot" style={{ borderTop: "none", paddingTop: 0 }}>
              <button className="xk-btn ghost" onClick={() => sel > 0 ? setSel(sel - 1) : nav.back()}>Əvvəlki</button>
              <button className="xk-btn primary" onClick={complete}>{done.has(sel) ? "Növbəti" : "Tamamla və davam et"} <Icon name="arrow" size={16} /></button>
            </div>
          </div>
        </div>

        <Card delay={120} className="xk-curriculum">
          <div className="xk-curr-head">
            <h3 className="xk-card-title">Kurs proqramı</h3>
            <span className="xk-mission-pct">{pct}%</span>
          </div>
          <ProgressBar value={pct} max={100} enabled={anim} color={`hsl(${course.hue} 70% 55%)`} />
          <div className="xk-curr-sections">
            {sections.map((s, si) => (
              <div key={si} className="xk-curr-section">
                <div className="xk-curr-label">{s.label}</div>
                {s.items.map((l) => (
                  <button key={l.id} className={`xk-curr-row ${l.index === sel ? "cur" : ""} ${done.has(l.index) ? "done" : ""}`} onClick={() => setSel(l.index)}>
                    <span className="xk-curr-ico">{done.has(l.index) ? <Icon name="check" size={13} /> : <Icon name={l.type === "video" ? "arrow" : "book"} size={13} />}</span>
                    <span className="xk-curr-title">{l.title}</span>
                    <span className="xk-curr-min">{l.min}d</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============ Lab detail (objectives + interactive console) ============ */
const LAB_STEPS = [
  { match: ["nmap target", "nmap -f target", "nmap target.az", "nmap -f target.az"], obj: 0, out: ["PORT     STATE  SERVICE", "80/tcp   open   http", "3306/tcp open   mysql", "[ veb server tapıldı ]"] },
  { match: ["curl target/admin", "curl http://target/admin", "curl target.az/admin"], obj: 1, out: ["HTTP/1.1 200 OK", "<form action='/login'>", "[ admin paneli tapıldı ]"] },
  { match: ["sqlmap -u target/login", "sqlmap -u http://target/login", "sqlmap target"], obj: 2, out: ["[*] testing 'login' parameter", "[+] parameter is vulnerable", "available databases: [users]", "[ DB sızması mümkündür! ]"] },
];

function LabDetail({ anim, id, nav }) {
  const lab = window.XK.labs.find((l) => l.id === id) || window.XK.labs[0];
  const objectives = ["Açıq portları aşkar et", "Gizli admin panelini tap", "SQL injection ilə bazaya çıx"];
  const [lines, setLines] = useStateD2([{ t: "out", v: "xakker-lab v2.0 — mühit hazırdır. Hədəf: target.az" }]);
  const [cmd, setCmd] = useStateD2("");
  const [doneObj, setDoneObj] = useStateD2(new Set());
  const bodyRef = useRefD2(null);

  useEffectD2(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines]);

  const run = () => {
    if (!cmd.trim()) return;
    const norm = cmd.trim().replace(/\s+/g, " ").toLowerCase();
    const step = LAB_STEPS.find((s) => s.match.includes(norm));
    const add = [{ t: "cmd", v: cmd }];
    if (norm === "help" || norm === "?") add.push({ t: "out", v: "Cəhd et: nmap, curl, sqlmap. Məqsədlər sağdadır." });
    else if (step) { step.out.forEach((o) => add.push({ t: "out", v: o })); setDoneObj((s) => new Set(s).add(step.obj)); }
    else add.push({ t: "err", v: `əmr tapılmadı: ${cmd.split(" ")[0]} — 'help' yaz` });
    setLines((l) => [...l, ...add]);
    setCmd("");
  };

  const allDone = doneObj.size === objectives.length;

  return (
    <div className="xk-screen">
      <PageBack nav={nav} crumbs={["Laboratoriyalar", lab.env]} />
      <div className="xk-detail-hero xk-reveal" style={{ "--mc": "var(--accent)", animationDelay: "60ms" }}>
        <div className="xk-hero-bar" />
        <div className="xk-hero-main">
          <div className="xk-hero-top"><span className="xk-feat-track">{lab.env}</span><Badge tone={allDone ? "ok" : "muted"}>{allDone ? "Tamamlandı" : lab.difficulty}</Badge></div>
          <h1 className="xk-hero-title">{lab.title}</h1>
          <p className="xk-hero-desc">İzolyasiya olunmuş mühitdə canlı hədəfə qarşı kəşfiyyat və istismar məşq et. Konsola əmrləri yaz.</p>
        </div>
      </div>

      <div className="xk-lab-detail">
        <Card delay={140} className="xk-lab-console">
          <div className="xk-code-bar"><span className="xk-cd r" /><span className="xk-cd y" /><span className="xk-cd g" /><span className="xk-code-lang">root@kali:~/lab</span></div>
          <div className="xk-console-body" ref={bodyRef}>
            {lines.map((l, i) => (
              <div key={i} className={`xk-cline ${l.t}`}>{l.t === "cmd" ? <><span className="xk-term-ps">$</span> {l.v}</> : l.v}</div>
            ))}
            <div className="xk-term-input-row">
              <span className="xk-term-ps">$</span>
              <input className="xk-term-input" value={cmd} autoFocus spellCheck="false" placeholder="nmap, curl, sqlmap… ('help')"
                onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") run(); }} />
            </div>
          </div>
        </Card>

        <Card delay={200} className="xk-aside-card">
          <div className="xk-card-eyebrow">Məqsədlər</div>
          <ul className="xk-obj-list">
            {objectives.map((o, i) => (
              <li key={i} className={doneObj.has(i) ? "done" : ""}>
                <span className="xk-obj-check">{doneObj.has(i) ? <Icon name="check" size={13} /> : <span className="xk-lesson-num">{i + 1}</span>}</span>{o}
              </li>
            ))}
          </ul>
          {allDone && <div className="xk-explain ok" style={{ marginTop: 14 }}><b>Lab tamamlandı!</b> +60 XP qazandın.</div>}
        </Card>
      </div>
    </div>
  );
}

/* ============ Cheatsheet detail ============ */
const CHEAT_ENTRIES = {
  cs1: [["ls -la", "bütün faylları (gizlilər daxil) göstər"], ["chmod +x f", "icra icazəsi ver"], ["sudo su", "root-a keç"], ["find / -name f", "fayl axtar"], ["ps aux", "prosesləri göstər"], ["netstat -tulpn", "açıq portlar"], ["cat /etc/passwd", "istifadəçilər"], ["grep -r 'pass' .", "mətn axtar"]],
  cs2: [["-sS", "SYN (gizli) skan"], ["-sV", "versiya aşkarı"], ["-A", "aqressiv (OS+versiya)"], ["-p-", "bütün 65535 port"], ["-F", "sürətli (top 100)"], ["-O", "ƏS təxmini"], ["--script vuln", "zəiflik skriptləri"], ["-Pn", "ping atma"]],
  cs3: [["200", "OK — uğurlu"], ["301", "daimi yönləndirmə"], ["401", "kimlik tələb olunur"], ["403", "qadağan"], ["404", "tapılmadı"], ["429", "həddən çox istək"], ["500", "server xətası"], ["502", "bad gateway"]],
  cs4: [["' OR '1'='1", "klassik bypass"], ["UNION SELECT", "sütun birləşdir"], ["--", "şərhlə kəs"], ["ORDER BY n", "sütun sayı tap"], ["SLEEP(5)", "vaxt əsaslı kor"], ["@@version", "DB versiyası"], ["information_schema", "metadata"], ["LOAD_FILE()", "fayl oxu"]],
  cs5: [["AES", "simmetrik blok şifri"], ["RSA", "asimmetrik açar cütü"], ["SHA-256", "kriptoqrafik heş"], ["bcrypt", "parol heşləmə"], ["HMAC", "mesaj autentifikasiyası"], ["ECDH", "açar mübadiləsi"], ["base64", "kodlaşdırma (≠şifrə)"], ["TLS 1.3", "nəqliyyat şifrəsi"]],
  cs6: [["bash -i", "interaktiv bash"], ["nc -e /bin/sh", "netcat shell"], ["python pty", "tam tty al"], ["mkfifo", "named pipe shell"], ["/dev/tcp", "bash tcp shell"], ["socat", "şifrəli shell"], ["msfvenom", "payload yarat"], ["rlwrap nc", "tarixçəli shell"]],
};

function CheatsheetDetail({ anim, id, nav }) {
  const cs = window.XK.cheatsheets.find((c) => c.id === id) || window.XK.cheatsheets[0];
  const base = CHEAT_ENTRIES[cs.id] || CHEAT_ENTRIES.cs1;
  const entries = Array.from({ length: cs.items }).map((_, i) => base[i % base.length]);
  const [q, setQ] = useStateD2("");
  const filtered = entries.filter(([k, v]) => (k + " " + v).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="xk-screen">
      <PageBack nav={nav} crumbs={["Müstəqil", "Cheatsheet"]} />
      <div className="xk-cheat-detail-head xk-reveal" style={{ animationDelay: "60ms" }}>
        <div className="xk-cheat-ico big"><Icon name={cs.icon} size={26} /></div>
        <div>
          <h1 className="xk-hero-title">{cs.title}</h1>
          <p className="xk-hero-desc">{cs.cat} · {cs.items} qeyd — tez istinad üçün</p>
        </div>
        <div className="xk-cheat-search">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Axtar…" spellCheck="false" />
        </div>
      </div>
      <Card delay={120} className="xk-cheat-table-card">
        <div className="xk-cheat-table">
          {filtered.map(([k, v], i) => (
            <div key={i} className="xk-cheat-entry" style={{ animationDelay: `${140 + i * 18}ms` }}>
              <code className="xk-cheat-key">{k}</code>
              <span className="xk-cheat-val">{v}</span>
            </div>
          ))}
          {filtered.length === 0 && <div className="xk-empty-screen"><p>Nəticə tapılmadı.</p></div>}
        </div>
      </Card>
    </div>
  );
}

/* ============ Path detail (roadmap) ============ */
function PathDetail({ anim, id, nav }) {
  const path = window.XK.paths.find((p) => p.id === id) || window.XK.paths[0];
  const steps = window.XK.missions.slice(0, Math.min(6, path.missions)).map((m, i) => ({
    ...m, state: i < path.done ? "done" : i === path.done ? "current" : "locked",
  }));
  return (
    <div className="xk-screen" style={{ "--mc": path.color }}>
      <PageBack nav={nav} crumbs={["Öyrənmə yolları", path.title]} />
      <div className="xk-detail-hero xk-reveal" style={{ animationDelay: "60ms" }}>
        <div className="xk-hero-bar" />
        <div className="xk-hero-main">
          <div className="xk-hero-top"><span className="xk-feat-track" style={{ color: path.color }}>Yol</span></div>
          <h1 className="xk-hero-title">{path.title}</h1>
          <p className="xk-hero-desc">{path.missions} missiyalıq strukturlu marşrut. Hər addımı sırayla tamamla və mütəxəssisə çevril.</p>
          <div className="xk-hero-prog" style={{ maxWidth: 320 }}>
            <ProgressBar value={path.done} max={path.missions} enabled={anim} color={path.color} />
            <span>{path.done}/{path.missions}</span>
          </div>
        </div>
      </div>

      <div className="xk-roadmap">
        {steps.map((s, i) => (
          <button key={s.id} className={`xk-road-step ${s.state}`} style={{ "--mc": s.color, animationDelay: `${120 + i * 70}ms` }}
            onClick={() => nav.deep("mission", { id: s.id })}>
            <div className="xk-road-line" />
            <div className="xk-road-node">{s.state === "done" ? <Icon name="check" size={16} /> : s.state === "current" ? <Icon name="arrow" size={16} /> : <span>{i + 1}</span>}</div>
            <div className="xk-road-card">
              <div className="xk-road-top"><span className="xk-feat-track">{s.track}</span><Badge tone="muted">{s.level}</Badge></div>
              <div className="xk-road-title">{s.title}</div>
              <div className="xk-mission-meta"><span><Icon name="layers" size={13} /> {s.lessons} dərs</span><span><Icon name="bolt" size={13} /> {s.xp} XP</span></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CourseDetail, LabDetail, CheatsheetDetail, PathDetail });
