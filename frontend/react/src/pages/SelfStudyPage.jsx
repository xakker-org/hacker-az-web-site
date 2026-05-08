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
        setQuestions(q.data || []);
        setProgress(p.data || {});
      })
      .catch(() => { if (ok) setError("Suallar yüklənmədi"); })
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
      <div className="page-head">
        <div>
          <div className="page-eyebrow">{t.eyebrow}</div>
          <h1 className="page-title">{t.title}</h1>
          <div className="page-sub">{t.sub}</div>
        </div>
        <Segmented
          value={lang}
          onChange={setLang}
          options={[{ value: "az", label: "AZ" }, { value: "en", label: "EN" }]}
          size="sm"
        />
      </div>

      {/* Progress tiles */}
      <div className="bento" style={{ marginBottom: 20 }}>
        <Tile span={6} style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.04) 100%)" }}>
          <TileHead eyebrow={t.progress} title={`${pct}% tamamlandı`} sub={`${progress.correct_answers || 0} / ${progress.total_questions || 0}`} />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ProgressRing value={pct} size={100} strokeWidth={10} tone="accent" label={`${pct}%`} sub="solved" />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Stat size="sm" label={t.correct}  value={progress.correct_answers || 0} />
              <Stat size="sm" label={t.attempts} value={progress.total_attempts || 0} />
              <Stat size="sm" label={t.answered} value={progress.answered_questions || 0} />
              <Stat size="sm" label={t.accuracy} value={Math.round(accuracy)} unit="%" />
            </div>
          </div>
        </Tile>

        <Tile span={3}>
          <Stat label={t.xp} value={(progress.total_points_earned || 0).toLocaleString()} size="lg" />
          <Bar value={progress.correct_answers || 0} max={progress.total_questions || 1} tone="accent" />
        </Tile>

        <Tile span={3}>
          <Stat label={t.answered} value={progress.answered_questions || 0} unit={`/${progress.total_questions || 0}`} size="lg" />
          <Bar value={progress.answered_questions || 0} max={progress.total_questions || 1} tone="sky" />
        </Tile>
      </div>

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
              <div className="bento">
                {paged.map(q => {
                  const tm = TYPE_META[q.question_type] || TYPE_META.closed;
                  const us = q.user_status || "pending";
                  const ss = STATUS_STYLE[us] || STATUS_STYLE.pending;

                  return (
                    <Tile
                      key={q.id}
                      span={4}
                      as={Link}
                      to={`/self-study/question/${q.id}`}
                      interactive
                      pad="sm"
                      style={{
                        background: ss.bg !== "transparent" ? ss.bg : undefined,
                        borderColor: us !== "pending" ? ss.border : undefined,
                        overflow: "hidden",
                      }}
                    >
                      {/* Top accent if answered */}
                      {us !== "pending" && (
                        <div style={{
                          position: "absolute", top: 0, left: 0, right: 0, height: 2,
                          background: ss.color, opacity: 0.6,
                        }} />
                      )}

                      {/* Status + difficulty row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <DiffBadge level={q.level} />
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          display: "grid", placeItems: "center", fontSize: 11,
                          fontWeight: 700, fontFamily: "var(--font-mono)",
                          background: ss.bg !== "transparent" ? ss.bg : "var(--bg-elev)",
                          border: `1px solid ${ss.border}`,
                          color: ss.color,
                        }}>
                          {ss.icon}
                        </div>
                      </div>

                      {/* Title */}
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: "var(--ink-1)",
                        lineHeight: 1.5,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {q.title}
                      </div>

                      {/* Course */}
                      {q.course?.title && (
                        <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                          {q.course.title}
                        </div>
                      )}

                      {/* Footer */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        marginTop: "auto", paddingTop: 6, borderTop: "1px solid var(--line)",
                        fontSize: 11,
                      }}>
                        <Chip size="sm" tone={tm.tone}>
                          {tm.label[lang] || tm.label.en}
                        </Chip>
                        <span className="mono tnum" style={{ color: "var(--accent)", fontWeight: 700 }}>
                          ★ {q.points}
                        </span>
                      </div>
                    </Tile>
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
    </AppShell>
  );
}
