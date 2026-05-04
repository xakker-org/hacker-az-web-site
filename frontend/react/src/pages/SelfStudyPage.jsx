import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { getStoredStudyLanguage, pickByLanguage, setStoredStudyLanguage } from "../utils/selfStudyI18n";

const PAGE_SIZE = 12;

const DIFF = {
  beginner:     { cls: "easy",   label: "Başlanğıc" },
  intermediate: { cls: "medium", label: "Orta"      },
  advanced:     { cls: "hard",   label: "İrəliləmiş"},
};

const TYPE_META = {
  closed:   { icon: "◉", color: "var(--blue)",   label: "Çoxseçimli" },
  open:     { icon: "✎", color: "var(--easy)",   label: "Açıq cavab" },
  terminal: { icon: "⌨", color: "var(--purple)", label: "Terminal"   },
};

const CAT_ICONS = {
  web: "🌐", network: "🔌", linux: "🐧", crypto: "🔐",
  forensics: "🔍", osint: "👁", reverse: "⚙️", pwn: "💥",
  misc: "🧩", default: "📘",
};

const T = {
  az: {
    heroTitle: "Labs — Praktiki Tədris",
    heroSub:   "Sual seçin, cavablayın, biliklərinizi real vaxtda yoxlayın.",
    total:     "Sual",  correct: "Düzgün",  accuracy: "Dəqiqlik",  xp: "Qazanılan XP",
    filter:    "Filtrlər", level: "Çətinlik",  type: "Növ",  course: "Kurs",
    status:    "Status", all: "Hamısı",
    correct_s: "Düzgün", wrong_s: "Yanlış", pending_s: "Cavabsız",
    attempts:  "cəhd",  pts: "XP",
    prev: "← Əvvəlki", next: "Növbəti →",
    empty: "Sual tapılmadı", emptySub: "Filtrləri sıfırlayın.",
    reset: "Sıfırla", allCats: "Hamısı",
    progress: "İrəliləyişim", answered: "Cavablandı",
    allLevels: "Bütün", allTypes: "Bütün", allCourses: "Bütün kurslar",
  },
  en: {
    heroTitle: "Labs — Practical Learning",
    heroSub:   "Pick a question, answer it, test your knowledge in real time.",
    total:     "Questions", correct: "Correct", accuracy: "Accuracy", xp: "XP Earned",
    filter:    "Filters", level: "Difficulty", type: "Type", course: "Course",
    status:    "Status", all: "All",
    correct_s: "Correct", wrong_s: "Wrong", pending_s: "Unanswered",
    attempts: "attempts", pts: "XP",
    prev: "← Prev", next: "Next →",
    empty: "No questions found", emptySub: "Reset filters and try again.",
    reset: "Reset", allCats: "All",
    progress: "My Progress", answered: "Answered",
    allLevels: "All", allTypes: "All", allCourses: "All courses",
  },
};

function SkeletonCard() {
  return (
    <div className="q-card" style={{ pointerEvents: "none", minHeight: 160 }}>
      <div className="xk-skel" style={{ height: 20, width: "30%", borderRadius: 99 }} />
      <div className="xk-skel" style={{ height: 16, width: "80%", borderRadius: 4, marginTop: 8 }} />
      <div className="xk-skel" style={{ height: 13, width: "55%", borderRadius: 4, marginTop: 4 }} />
    </div>
  );
}

export default function SelfStudyPage() {
  const [lang, setLang] = useState(getStoredStudyLanguage);
  const t = pickByLanguage(T, lang);

  const [questions,   setQuestions]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [progress,    setProgress]    = useState({ total_questions:0, correct_answers:0, answered_questions:0, total_attempts:0, total_points_earned:0, accuracy_percent:0 });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  const [search,      setSearch]      = useState("");
  const [debSearch,   setDebSearch]   = useState("");
  const [activeTab,   setActiveTab]   = useState("");
  const [level,       setLevel]       = useState("");
  const [qtype,       setQtype]       = useState("");
  const [course,      setCourse]      = useState("");
  const [statusF,     setStatusF]     = useState("");
  const [page,        setPage]        = useState(1);

  const debRef = useRef(null);

  useEffect(() => { setStoredStudyLanguage(lang); }, [lang]);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebSearch(search), 320);
    return () => clearTimeout(debRef.current);
  }, [search]);

  useEffect(() => {
    endpoints.categories()
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      endpoints.questions({ search: debSearch, level, question_type: qtype, course }),
      endpoints.questionProgress(),
    ])
      .then(([qRes, pRes]) => {
        if (!mounted) return;
        setQuestions(qRes.data || []);
        setProgress(pRes.data || {});
      })
      .catch(() => { if (mounted) setError("Suallar yüklənmədi."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [debSearch, level, qtype, course]);

  useEffect(() => { setPage(1); }, [debSearch, level, qtype, course, statusF, activeTab]);

  const courseOpts = useMemo(() => {
    const m = new Map();
    questions.forEach(q => { if (q.course) m.set(q.course.id, q.course.title); });
    return Array.from(m.entries()).map(([id, title]) => ({ id, title }));
  }, [questions]);

  const filtered = useMemo(() => {
    let r = questions;
    if (statusF)    r = r.filter(q => q.user_status === statusF);
    if (activeTab)  r = r.filter(q => {
      const s = (q.course?.category?.slug || "").toLowerCase();
      const n = (q.course?.category?.name || "").toLowerCase();
      return s === activeTab || n.includes(activeTab);
    });
    return r;
  }, [questions, statusF, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pct        = progress.total_questions ? Math.round((progress.correct_answers / progress.total_questions) * 100) : 0;

  const reset = useCallback(() => {
    setSearch(""); setLevel(""); setQtype(""); setCourse(""); setStatusF(""); setActiveTab("");
  }, []);

  const hasFilter = level || qtype || course || statusF || activeTab || search;

  return (
    <AppShell
      title="Labs"
      searchPlaceholder="Sual, kurs, mövzu axtar..."
      onSearch={setSearch}
      extraTopbar={
        <>
          <div style={{ display:"flex", gap:4 }}>
            {["az","en"].map(l => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className="xk-btn xk-btn-ghost xk-btn-sm"
                style={{ padding:"3px 8px", fontSize:11, fontWeight:700,
                  ...(lang===l ? { background:"var(--green-dim)", color:"var(--green)", border:"1px solid var(--green-ring)" } : {}) }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="xk-chip">{questions.length} sual</span>
        </>
      }
    >
      {/* Hero */}
      <div className="xk-panel labs-hero" style={{ marginBottom: 22 }}>
        <div className="labs-hero-row">
          <div>
            <div className="xk-eyebrow">🧪 Labs</div>
            <h1 style={{ fontSize: "clamp(22px,3vw,34px)", marginBottom: 6 }}>{t.heroTitle}</h1>
            <p style={{ fontSize: 14, maxWidth: 500 }}>{t.heroSub}</p>
          </div>
          <div className="labs-stats-row">
            <div className="labs-stat">
              <span className="labs-stat-val">{progress.total_questions || 0}</span>
              <span className="labs-stat-key">{t.total}</span>
            </div>
            <div className="labs-stat">
              <span className="labs-stat-val" style={{ color:"var(--green)" }}>{progress.correct_answers || 0}</span>
              <span className="labs-stat-key">{t.correct}</span>
            </div>
            <div className="labs-stat">
              <span className="labs-stat-val" style={{ color:"var(--amber)" }}>{progress.accuracy_percent || 0}%</span>
              <span className="labs-stat-key">{t.accuracy}</span>
            </div>
            <div className="labs-stat">
              <span className="labs-stat-val" style={{ color:"var(--blue)" }}>{progress.total_points_earned || 0}</span>
              <span className="labs-stat-key">{t.xp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="xk-tabs" role="tablist" style={{ marginBottom: 18 }}>
          <button role="tab" type="button"
            className={`xk-tab${activeTab===""?" active":""}`}
            onClick={() => setActiveTab("")}>
            🔰 {t.allCats}
          </button>
          {categories.map(cat => (
            <button key={cat.slug} role="tab" type="button"
              className={`xk-tab${activeTab===cat.slug?" active":""}`}
              onClick={() => setActiveTab(cat.slug)}>
              {CAT_ICONS[cat.slug?.toLowerCase()] || CAT_ICONS.default} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Main layout */}
      <div className="labs-layout">
        {/* Sidebar */}
        <aside className="labs-sidebar">
          <div className="xk-panel" style={{ padding: 16, display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ fontSize:13, color:"var(--t3)", textTransform:"uppercase", letterSpacing:"0.12em" }}>{t.filter}</h3>

            {/* Difficulty */}
            <div className="labs-filter-group">
              <div className="labs-filter-label">{t.level}</div>
              <div className="labs-filter-pills">
                {[["","",""],["beginner","🟢 Başlanğıc","easy"],["intermediate","🟡 Orta","medium"],["advanced","🔴 İrəliləmiş","hard"]].map(
                  ([val, displayLabel, cls]) => (
                    <button key={val} type="button"
                      className={`labs-pill${level===val ? " active"+(cls?" "+cls:"") : ""}`}
                      onClick={() => setLevel(val)}>
                      {val==="" ? "🔰 "+t.allLevels : displayLabel}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Type */}
            <div className="labs-filter-group">
              <div className="labs-filter-label">{t.type}</div>
              <div className="labs-filter-pills">
                {[["","◈ "+t.allTypes],["closed","◉ Çoxseçimli"],["open","✎ Açıq cavab"],["terminal","⌨ Terminal"]].map(
                  ([val, lbl]) => (
                    <button key={val} type="button"
                      className={`labs-pill${qtype===val?" active":""}`}
                      onClick={() => setQtype(val)}>
                      {lbl}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Course */}
            <div className="labs-filter-group">
              <div className="labs-filter-label">{t.course}</div>
              <select className="xk-select" value={course} onChange={e => setCourse(e.target.value)} style={{ width:"100%" }}>
                <option value="">{t.allCourses}</option>
                {courseOpts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            {/* Status */}
            <div className="labs-filter-group">
              <div className="labs-filter-label">{t.status}</div>
              <div className="labs-filter-pills">
                {[["",t.all],["correct","✓ "+t.correct_s],["wrong","✗ "+t.wrong_s],["pending","○ "+t.pending_s]].map(
                  ([val, lbl]) => (
                    <button key={val} type="button"
                      className={`labs-pill${statusF===val?" active":""}`}
                      onClick={() => setStatusF(val)}>
                      {lbl}
                    </button>
                  )
                )}
              </div>
            </div>

            {hasFilter && (
              <button type="button" className="xk-btn xk-btn-secondary xk-btn-sm xk-btn-block" onClick={reset}>
                ✕ {t.reset}
              </button>
            )}
          </div>

          {/* Progress box */}
          <div className="xk-panel labs-progress-box">
            <div className="labs-progress-head">
              <h3 style={{ fontSize: 14 }}>{t.progress}</h3>
              <span className="labs-pct">{pct}%</span>
            </div>
            <div className="xk-prog">
              <div className="xk-prog-track">
                <div className="xk-prog-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="xk-prog-meta">
                <span>{t.correct}</span>
                <span>{progress.correct_answers}/{progress.total_questions}</span>
              </div>
            </div>
            <div className="labs-stats-grid">
              <div className="labs-stat-box">
                <div className="labs-stat-box-val">{progress.answered_questions || 0}</div>
                <div className="labs-stat-box-key">{t.answered}</div>
              </div>
              <div className="labs-stat-box">
                <div className="labs-stat-box-val" style={{ color:"var(--amber)" }}>{progress.total_attempts || 0}</div>
                <div className="labs-stat-box-key">Cəhd</div>
              </div>
              <div className="labs-stat-box" style={{ gridColumn:"1/-1" }}>
                <div className="labs-stat-box-val" style={{ color:"var(--green)" }}>{progress.total_points_earned || 0}</div>
                <div className="labs-stat-box-key">{t.xp}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main>
          {error && <div className="xk-alert xk-alert-err">{error}</div>}

          {loading ? (
            <div className="labs-grid">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="xk-panel xk-empty">
              <div className="xk-empty-ico">🔍</div>
              <h3>{t.empty}</h3>
              <p>{t.emptySub}</p>
              <button type="button" className="xk-btn xk-btn-secondary xk-btn-sm" onClick={reset}>
                {t.reset}
              </button>
            </div>
          ) : (
            <>
              <div className="labs-grid">
                {paged.map((q, i) => {
                  const d  = DIFF[q.level] || DIFF.beginner;
                  const tm = TYPE_META[q.question_type] || TYPE_META.closed;
                  const us = q.user_status || "pending";
                  return (
                    <Link key={q.id} to={`/self-study/question/${q.id}`}
                      className="q-card xk-anim-up"
                      style={{ animationDelay: `${i * 35}ms` }}>
                      <div className={`q-card-bar ${d.cls}`} />
                      <div className="q-card-top">
                        <span className={`xk-diff xk-diff-${d.cls}`}>{d.label}</span>
                        <span className={`xk-status xk-status-${us}`}>
                          {us==="correct"?"✓":us==="wrong"?"✗":"○"}{" "}
                          {us==="correct"?t.correct_s:us==="wrong"?t.wrong_s:t.pending_s}
                        </span>
                      </div>
                      <h3 className="q-card">{q.title}</h3>
                      <p className="q-card-course">{q.course?.title}</p>
                      <div className="q-card-meta">
                        <span className="q-card-type" style={{ color: tm.color }}>
                          {tm.icon} {tm.label}
                        </span>
                        <span className="q-card-xp">★ {q.points} {t.pts}</span>
                      </div>
                      {q.attempt_count > 0 && (
                        <div style={{ fontSize:11, color:"var(--t4)", marginTop:4 }}>
                          {q.attempt_count} {t.attempts}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {filtered.length > PAGE_SIZE && (
                <div className="xk-pagination">
                  <button type="button" className="xk-page-btn"
                    disabled={safePage <= 1}
                    onClick={() => setPage(p => Math.max(1, p-1))}>
                    ←
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = safePage <= 4 ? i + 1 : safePage + i - 3;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button key={p} type="button"
                        className={`xk-page-btn${p===safePage?" active":""}`}
                        onClick={() => setPage(p)}>
                        {p}
                      </button>
                    );
                  })}
                  <button type="button" className="xk-page-btn"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p+1))}>
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </AppShell>
  );
}
