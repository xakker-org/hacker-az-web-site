import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Segmented from "../components/ui/Segmented";
import { Input, Select } from "../components/ui/Field";
import Button from "../components/ui/Button";
import { Chip, DiffBadge } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";
import { getStoredStudyLanguage, pickByLanguage, setStoredStudyLanguage } from "../utils/selfStudyI18n";
import { useLang } from "../contexts/LanguageContext";
import { getMockQuestions, getMockQuestionProgress } from "../data/mockData";

const PAGE_SIZE = 12;

const T = {
  az: {
    eyebrow: "Self-Study", title: "Praktiki suallar",
    sub: "Sual seç, cavablandır, biliyini real vaxtda yoxla.",
    correct: "Düzgün", accuracy: "Dəqiqlik", xp: "XP",
    level: "Çətinlik", type: "Növ", course: "Kurs", status: "Status",
    all: "Hamısı", reset: "Sıfırla",
    empty: "Sual tapılmadı", emptySub: "Filtrləri sıfırla.",
    progress: "İrəliləyişim", answered: "Cavablandı", attempts: "Cəhd",
  },
  en: {
    eyebrow: "Self-Study", title: "Practice questions",
    sub: "Pick a question, answer it, test your knowledge in real time.",
    correct: "Correct", accuracy: "Accuracy", xp: "XP",
    level: "Difficulty", type: "Type", course: "Course", status: "Status",
    all: "All", reset: "Reset",
    empty: "No questions found", emptySub: "Reset filters and try again.",
    progress: "My Progress", answered: "Answered", attempts: "Attempts",
  },
};

const TYPE_META = {
  closed:   { tone: "sky",    label: { az: "Çoxseçimli", en: "MCQ" } },
  open:     { tone: "mint",   label: { az: "Açıq",       en: "Open" } },
  terminal: { tone: "violet", label: { az: "Terminal",   en: "Terminal" } },
};

const STATUS_STYLE = {
  correct: { bg: "rgba(110,255,214,0.07)", border: "rgba(110,255,214,0.22)", icon: "✓", color: "var(--ok)"     },
  wrong:   { bg: "rgba(255,36,66,0.07)",   border: "rgba(255,36,66,0.22)",   icon: "✗", color: "var(--accent)" },
  pending: { bg: "transparent",             border: "var(--line)",            icon: "○", color: "var(--ink-4)"  },
};

export default function SelfStudyPage() {
  const { lang, setLang: setGlobalLang } = useLang();
  const setLang = (l) => { setGlobalLang(l); setStoredStudyLanguage(l); };
  const t = pickByLanguage(T, lang);

  const [questions, setQuestions] = useState([]);
  const [progress, setProgress]   = useState({
    total_questions: 0, correct_answers: 0, answered_questions: 0,
    total_attempts: 0, total_points_earned: 0, accuracy_percent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [search, setSearch]   = useState("");
  const [debSearch, setDeb]   = useState("");
  const [level, setLevel]     = useState("");
  const [qtype, setQtype]     = useState("");
  const [course, setCourse]   = useState("");
  const [statusF, setStatusF] = useState("");
  const [page, setPage]       = useState(1);

  const debRef = useRef(null);


  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDeb(search), 300);
    return () => clearTimeout(debRef.current);
  }, [search]);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    Promise.all([
      endpoints.questions({ search: debSearch, level, question_type: qtype, course }),
      endpoints.questionProgress(),
    ])
      .then(([q, p]) => {
        if (!ok) return;
        const qData = q.data || [];
        const pData = p.data || {};
        setQuestions(qData.length > 0 ? qData : getMockQuestions());
        setProgress(pData.total_questions ? pData : getMockQuestionProgress());
      })
      .catch(() => {
        if (ok) {
          setQuestions(getMockQuestions());
          setProgress(getMockQuestionProgress());
        }
      })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debSearch, level, qtype, course]);

  useEffect(() => { setPage(1); }, [debSearch, level, qtype, course, statusF]);

  const courseOpts = useMemo(() => {
    const m = new Map();
    questions.forEach(q => { if (q.course) m.set(q.course.id, q.course.title); });
    return Array.from(m.entries()).map(([id, title]) => ({ id, title }));
  }, [questions]);

  const filtered = useMemo(() => {
    if (!statusF) return questions;
    return questions.filter(q => q.user_status === statusF);
  }, [questions, statusF]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const accuracy  = progress.accuracy_percent || 0;
  const pct       = progress.total_questions
    ? Math.round((progress.correct_answers / progress.total_questions) * 100)
    : 0;
  const hasFilter = level || qtype || course || statusF || search;

  const reset = useCallback(() => {
    setSearch(""); setLevel(""); setQtype(""); setCourse(""); setStatusF("");
  }, []);

  return (
    <AppShell>
      <div className="xk-screen">
      {/* Head */}
      <div className="xk-screen-head xk-reveal">
        <div>
          <div className="xk-greet-eyebrow">Platforma</div>
          <h1 className="xk-screen-title">{t.title}</h1>
          <p className="xk-greet-sub">{t.sub}</p>
        </div>
        <Segmented
          value={lang}
          onChange={setLang}
          options={[{ value: "az", label: "AZ" }, { value: "en", label: "EN" }]}
          size="sm"
        />
      </div>

      {/* "Davam etdiyin material" hero */}
      <div className="xk-card xk-reading xk-reveal" style={{ animationDelay: "70ms" }}>
        <div className="xk-reading-ico">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2zM4 19a2 2 0 012-2h13" />
          </svg>
        </div>
        <div className="xk-reading-meta">
          <div className="xk-card-eyebrow">Davam etdiyin material</div>
          <h3 className="xk-reading-title">Praktiki suallar — {pct}% tamamlandı</h3>
          <div className="xk-reading-prog">
            <div className="xk-track" style={{ height: 5 }}>
              <div className="xk-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="xk-mission-pct">{pct}%</span>
          </div>
        </div>
        <button className="xk-btn primary" onClick={reset}>
          Davam et
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="xk-section-label xk-reveal" style={{ animationDelay: "120ms" }}>Suallar</div>

      {/* Filters + Questions */}
      <div className="bento" style={{ alignItems: "start" }}>

        {/* Filter sidebar */}
        <Tile span={3} pad="sm" style={{ position: "sticky", top: 76 }}>
          <TileHead
            title="Filtrlər"
            action={hasFilter
              ? <Button variant="ghost" size="sm" onClick={reset}>✕ Sıfırla</Button>
              : null}
          />

          {[
            {
              label: t.level,
              node: (
                <Segmented value={level} onChange={setLevel} block size="sm" options={[
                  { value: "",             label: "All"  },
                  { value: "beginner",     label: "Easy" },
                  { value: "intermediate", label: "Med"  },
                  { value: "advanced",     label: "Hard" },
                ]} />
              ),
            },
            {
              label: t.type,
              node: (
                <Segmented value={qtype} onChange={setQtype} block size="sm" options={[
                  { value: "",         label: "All"  },
                  { value: "closed",   label: "MCQ"  },
                  { value: "open",     label: "Open" },
                  { value: "terminal", label: "Term" },
                ]} />
              ),
            },
            {
              label: t.status,
              node: (
                <Segmented value={statusF} onChange={setStatusF} block size="sm" options={[
                  { value: "",        label: t.all },
                  { value: "correct", label: "✓"   },
                  { value: "wrong",   label: "✗"   },
                  { value: "pending", label: "○"   },
                ]} />
              ),
            },
            {
              label: t.course,
              node: (
                <Select value={course} onChange={e => setCourse(e.target.value)}>
                  <option value="">{t.all}</option>
                  {courseOpts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </Select>
              ),
            },
          ].map(({ label, node }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)",
              }}>
                {label}
              </div>
              {node}
            </div>
          ))}
        </Tile>

        {/* Questions list */}
        <div className="span-9" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Input
              placeholder="Sual axtar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Chip tone={filtered.length > 0 ? "accent" : "neutral"} size="sm">
              {filtered.length} sual
            </Chip>
          </div>

          {error && (
            <Tile><div style={{ color: "var(--bad)", padding: 4 }}>{error}</div></Tile>
          )}

          {loading ? (
            <div className="bento">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="span-4"><TileSkeleton height={150} /></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Tile>
              <EmptyState
                icon="◌"
                title={t.empty}
                description={t.emptySub}
                action={hasFilter ? <Button variant="ghost" onClick={reset}>{t.reset}</Button> : null}
              />
            </Tile>
          ) : (
            <>
              <div className="fi-grid">
                {paged.map((q, qi) => {
                  const tm = TYPE_META[q.question_type] || TYPE_META.closed;
                  const us = q.user_status || "pending";
                  const ss = STATUS_STYLE[us] || STATUS_STYLE.pending;
                  const qIcon = q.question_type === "terminal" ? "⌨️" : q.question_type === "open" ? "✏️" : "📝";

                  return (
                    <Link
                      key={q.id}
                      to={`/self-study/question/${q.id}`}
                      className="fi-cs-item"
                      style={{ animationDelay: `${qi * 30}ms`, gridColumn: "span 1" }}
                    >
                      <div className="fi-cs-ico" style={{ background: ss.bg !== "transparent" ? ss.bg : undefined, borderColor: us !== "pending" ? ss.border : undefined }}>
                        {us === "correct" ? "✓" : us === "wrong" ? "✗" : qIcon}
                      </div>
                      <div className="fi-cs-body">
                        <div className="fi-cs-name">{q.title}</div>
                        <div className="fi-cs-meta">
                          {q.course?.title && `${q.course.title} · `}
                          {(tm.label[lang] || tm.label.en)} · {q.points} XP
                        </div>
                      </div>
                      <div className="fi-cs-arrow">→</div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {filtered.length > PAGE_SIZE && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 8 }}>
                  <Button variant="ghost" size="sm" disabled={safePage <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}>←</Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = safePage <= 4 ? i + 1 : safePage + i - 3;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <Button key={p} variant={p === safePage ? "accent" : "ghost"} size="sm" onClick={() => setPage(p)}>
                        {p}
                      </Button>
                    );
                  })}
                  <Button variant="ghost" size="sm" disabled={safePage >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</Button>
                  <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)" }}>
                    {safePage}/{totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>{/* xk-screen */}
    </AppShell>
  );
}
