// detail.jsx — Mission detail + Lesson experience
const { useState: useStateD, useEffect: useEffectD, useRef: useRefD } = React;

const TYPE_META = {
  theory: { label: "Nəzəriyyə", icon: "book" },
  quiz: { label: "Quiz", icon: "check" },
  terminal: { label: "Terminal", icon: "command" },
};

/* ---------------- shared back / breadcrumb ---------------- */
function PageBack({ nav, crumbs }) {
  return (
    <div className="xk-back-row xk-reveal">
      <button className="xk-back" onClick={nav.back}><Icon name="chevron" size={16} /> Geri</button>
      <div className="xk-crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="xk-crumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? "cur" : ""}>{c}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Mission detail ---------------- */
function MissionDetail({ anim, id, nav }) {
  const mission = window.XK.missions.find((m) => m.id === id) || window.XK.missions[0];
  const lessons = window.XK_LESSONS.buildLessons(mission);
  const done = window.XK_PROGRESS.done(mission.id);
  const pct = window.XK_PROGRESS.pct(mission.id, lessons.length);
  const nextIdx = window.XK_PROGRESS.nextIndex(mission.id, lessons.length);
  const totalXp = lessons.reduce((s, l) => s + (l.xp || 10), 0);
  const started = done.length > 0;
  const learn = {
    Web: ["HTTP protokolu və başlıqlar", "XSS və SQL injection əsasları", "Brauzer təhlükəsizlik modeli"],
    Network: ["TCP/IP və portlar", "Nmap ilə skan", "Xidmət barmaq izləri"],
    System: ["Linux icazə modeli", "Privilege escalation", "SUID/SGID istismarı"],
    Crypto: ["Heş və şifrələmə", "Simmetrik/asimmetrik açarlar", "Parol qırma"],
    Recon: ["OSINT metodları", "DNS kəşfiyyatı", "Alt-domen tapma"],
  }[mission.track] || [];

  return (
    <div className="xk-screen" style={{ "--mc": mission.color }}>
      <PageBack nav={nav} crumbs={["Missiyalar", mission.track]} />

      <div className="xk-detail-hero xk-reveal" style={{ animationDelay: "60ms" }}>
        <div className="xk-hero-bar" />
        <div className="xk-hero-main">
          <div className="xk-hero-top">
            <span className="xk-feat-track">{mission.track}</span>
            <Badge tone="muted">{mission.level}</Badge>
          </div>
          <h1 className="xk-hero-title">{mission.title}</h1>
          <p className="xk-hero-desc">Praktiki tapşırıqlar və real ssenarilərlə {mission.track.toLowerCase()} təhlükəsizliyini addım-addım öyrən.</p>
          <div className="xk-hero-meta">
            <span><Icon name="layers" size={15} /> {lessons.length} dərs</span>
            <span><Icon name="bolt" size={15} /> {totalXp} XP</span>
            <span><Icon name="clock" size={15} /> ~{Math.round(lessons.length * 6)} dəq</span>
          </div>
          <div className="xk-hero-actions">
            <button className="xk-btn primary" onClick={() => nav.deep("lesson", { missionId: mission.id, index: started ? nextIdx : 0 })}>
              {pct === 100 ? "Təkrar bax" : started ? "Davam et" : "Missiyanı başlat"} <Icon name="arrow" size={16} />
            </button>
            <div className="xk-hero-prog">
              <ProgressBar value={pct} max={100} enabled={anim} color={mission.color} />
              <span>{done.length}/{lessons.length} tamamlandı</span>
            </div>
          </div>
        </div>
      </div>

      <div className="xk-detail-grid">
        <Card delay={140} className="xk-lessons-card">
          <h3 className="xk-card-title">Dərslər</h3>
          <div className="xk-lesson-list">
            {lessons.map((l, i) => {
              const isDone = done.includes(i);
              const isNext = i === nextIdx && !isDone;
              const tm = TYPE_META[l.type];
              return (
                <button key={l.id} className={`xk-lesson-row ${isDone ? "done" : ""} ${isNext ? "next" : ""}`}
                  style={{ animationDelay: `${180 + i * 45}ms` }}
                  onClick={() => nav.deep("lesson", { missionId: mission.id, index: i })}>
                  <span className="xk-lesson-status">
                    {isDone ? <Icon name="check" size={15} /> : isNext ? <Icon name="arrow" size={15} /> : <span className="xk-lesson-num">{i + 1}</span>}
                  </span>
                  <div className="xk-lesson-meta">
                    <span className="xk-lesson-title">{l.title}</span>
                    <span className="xk-lesson-type"><Icon name={tm.icon} size={12} /> {tm.label}</span>
                  </div>
                  <span className="xk-lesson-xp">+{l.xp}</span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="xk-detail-aside">
          <Card delay={200} className="xk-aside-card">
            <div className="xk-card-eyebrow">Nə öyrənəcəksən</div>
            <ul className="xk-learn-list">
              {learn.map((x, i) => <li key={i}><Icon name="check" size={14} /> {x}</li>)}
            </ul>
          </Card>
          <Card delay={260} className="xk-aside-card">
            <div className="xk-card-eyebrow">Mükafat</div>
            <div className="xk-reward-row"><Icon name="bolt" size={18} /> <b>{totalXp} XP</b></div>
            <div className="xk-reward-row"><Icon name="medal" size={18} /> “{mission.track} Başlanğıc” nişanı</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Lesson experience ---------------- */
function LessonView({ anim, missionId, index, nav }) {
  const mission = window.XK.missions.find((m) => m.id === missionId) || window.XK.missions[0];
  const lessons = window.XK_LESSONS.buildLessons(mission);
  const [current, setCurrent] = useStateD(index || 0);
  const [revealed, setRevealed] = useStateD(false);
  const [picked, setPicked] = useStateD(null);
  const [cmd, setCmd] = useStateD("");
  const [solved, setSolved] = useStateD(false);
  const [err, setErr] = useStateD(false);
  const [showHint, setShowHint] = useStateD(false);
  const [reward, setReward] = useStateD(false);
  const [sessionDone, setSessionDone] = useStateD(() => new Set(window.XK_PROGRESS.done(missionId)));
  const inputRef = useRefD(null);

  const lesson = lessons[current];
  const tm = TYPE_META[lesson.type];
  const completedCount = sessionDone.size;

  const reset = () => { setRevealed(false); setPicked(null); setCmd(""); setSolved(false); setErr(false); setShowHint(false); };

  useEffectD(() => { reset(); }, [current]);

  const markDone = () => {
    window.XK_PROGRESS.complete(missionId, current);
    setSessionDone((s) => new Set(s).add(current));
  };

  const canProceed = lesson.type === "theory" || (lesson.type === "quiz" && revealed) || (lesson.type === "terminal" && solved);

  const next = () => {
    markDone();
    if (current >= lessons.length - 1) { setReward(true); return; }
    setCurrent((c) => c + 1);
  };

  const checkQuiz = () => { if (picked === null) return; setRevealed(true); if (picked === lesson.quiz?.correct || picked === lesson.correct) markDone(); };

  const runCmd = () => {
    const norm = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
    const ok = (lesson.expected || []).some((e) => norm(e) === norm(cmd));
    if (ok) { setSolved(true); setErr(false); }
    else { setErr(true); }
  };

  return (
    <div className="xk-lesson-view" style={{ "--mc": mission.color }}>
      <PageBack nav={nav} crumbs={[mission.track, mission.title]} />

      <div className="xk-lesson-head xk-reveal" style={{ animationDelay: "60ms" }}>
        <div className="xk-lesson-progress">
          <div className="xk-lp-track"><div className="xk-lp-fill" style={{ width: `${(completedCount / lessons.length) * 100}%` }} /></div>
          <span className="xk-lp-label">Dərs {current + 1} / {lessons.length}</span>
        </div>
        <div className="xk-lesson-dots">
          {lessons.map((_, i) => (
            <button key={i} className={`xk-ldot ${i === current ? "cur" : ""} ${sessionDone.has(i) ? "done" : ""}`}
              onClick={() => setCurrent(i)} title={`Dərs ${i + 1}`} />
          ))}
        </div>
      </div>

      <div key={current} className="xk-lesson-stage xk-stage-in">
        <div className="xk-lesson-type-tag"><Icon name={tm.icon} size={13} /> {tm.label} · +{lesson.xp} XP</div>
        <h1 className="xk-lesson-h1">{lesson.title}</h1>

        {lesson.type === "theory" && (
          <div className="xk-theory">
            {lesson.heading && <h2 className="xk-theory-h2">{lesson.heading}</h2>}
            {(lesson.body || []).map((p, i) => <p key={i} className="xk-theory-p">{p}</p>)}
            {lesson.code && (
              <div className="xk-code">
                <div className="xk-code-bar"><span className="xk-cd r" /><span className="xk-cd y" /><span className="xk-cd g" /><span className="xk-code-lang">{lesson.code.lang}</span></div>
                <pre>{lesson.code.lines.map((ln, i) => <div key={i} className="xk-code-line">{ln}</div>)}</pre>
              </div>
            )}
            {lesson.tip && <div className="xk-tip"><Icon name="bolt" size={15} /> <span>{lesson.tip}</span></div>}
          </div>
        )}

        {lesson.type === "quiz" && (
          <div className="xk-quiz">
            <p className="xk-quiz-prompt">{lesson.prompt}</p>
            <div className="xk-quiz-opts">
              {(lesson.options || []).map((o, i) => {
                const correct = i === lesson.correct;
                const cls = !revealed ? (picked === i ? "sel" : "") : correct ? "right" : i === picked ? "wrong" : "dim";
                return (
                  <button key={i} className={`xk-quiz-opt ${cls}`} disabled={revealed} onClick={() => setPicked(i)}>
                    <span className="xk-q-key">{String.fromCharCode(65 + i)}</span>
                    <span>{o}</span>
                    {revealed && correct && <Icon name="check" size={16} className="xk-q-mark" />}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className={`xk-explain ${picked === lesson.correct ? "ok" : "no"}`}>
                <b>{picked === lesson.correct ? "Doğru!" : "Düzgün cavab işarələnib."}</b> {lesson.explain}
              </div>
            )}
          </div>
        )}

        {lesson.type === "terminal" && (
          <div className="xk-term-task">
            <div className="xk-task-prompt"><Icon name="target" size={15} /> {lesson.promptText}</div>
            <div className="xk-terminal">
              <div className="xk-code-bar"><span className="xk-cd r" /><span className="xk-cd y" /><span className="xk-cd g" /><span className="xk-code-lang">xakker@lab:~</span></div>
              <div className="xk-term-body">
                <div className="xk-term-line"><span className="xk-term-ps">$</span> <span className="xk-term-cmd">{solved ? cmd : ""}</span></div>
                {solved && (lesson.output || []).map((ln, i) => (
                  <div key={i} className="xk-term-out" style={{ animationDelay: `${i * 80}ms` }}>{ln}</div>
                ))}
                {!solved && (
                  <div className="xk-term-input-row">
                    <span className="xk-term-ps">$</span>
                    <input ref={inputRef} className="xk-term-input" value={cmd} autoFocus spellCheck="false"
                      placeholder="əmri yaz…" onChange={(e) => { setCmd(e.target.value); setErr(false); }}
                      onKeyDown={(e) => { if (e.key === "Enter") runCmd(); }} />
                  </div>
                )}
              </div>
            </div>
            {err && <div className="xk-term-err">Əmr uyğun deyil — yenidən cəhd et.{!showHint && <button className="xk-hint-btn" onClick={() => setShowHint(true)}>İpucu göstər</button>}</div>}
            {showHint && <div className="xk-tip"><Icon name="bolt" size={15} /> <span>{lesson.hint}</span></div>}
            {solved && <div className="xk-explain ok"><b>Əla!</b> Əmr uğurla icra olundu.</div>}
          </div>
        )}

        <div className="xk-lesson-foot">
          <button className="xk-btn ghost" onClick={() => current > 0 ? setCurrent((c) => c - 1) : nav.back()}>Əvvəlki</button>
          {lesson.type === "quiz" && !revealed
            ? <button className="xk-btn primary" disabled={picked === null} onClick={checkQuiz}>Yoxla</button>
            : lesson.type === "terminal" && !solved
            ? <button className="xk-btn primary" disabled={!cmd.trim()} onClick={runCmd}>İcra et <Icon name="arrow" size={16} /></button>
            : <button className="xk-btn primary" onClick={next}>{current >= lessons.length - 1 ? "Missiyanı tamamla" : "Növbəti dərs"} <Icon name="arrow" size={16} /></button>}
        </div>
      </div>

      {reward && <RewardOverlay mission={mission} lessons={lessons} nav={nav} />}
    </div>
  );
}

/* ---------------- Reward overlay ---------------- */
function RewardOverlay({ mission, lessons, nav }) {
  const totalXp = lessons.reduce((s, l) => s + (l.xp || 10), 0);
  return (
    <div className="xk-reward-overlay">
      <div className="xk-confetti">{Array.from({ length: 24 }).map((_, i) => <span key={i} style={{ "--i": i, left: `${(i * 4.1) % 100}%` }} />)}</div>
      <div className="xk-reward-card">
        <div className="xk-reward-badge"><Icon name="medal" size={40} /></div>
        <div className="xk-card-eyebrow">Missiya tamamlandı</div>
        <h2 className="xk-reward-title">{mission.title}</h2>
        <div className="xk-reward-xp">+<AnimatedNumber value={totalXp} enabled={true} /> XP</div>
        <p className="xk-reward-sub">“{mission.track} Başlanğıc” nişanı qazandın.</p>
        <div className="xk-reward-actions">
          <button className="xk-btn outline" onClick={nav.back}>Missiyaya qayıt</button>
          <button className="xk-btn primary" onClick={() => nav.go("missions")}>Yeni missiya <Icon name="arrow" size={16} /></button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PageBack, MissionDetail, LessonView, RewardOverlay, TYPE_META });
