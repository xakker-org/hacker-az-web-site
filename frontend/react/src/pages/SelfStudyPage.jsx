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

const PAGE_SIZE = 12;

const T = {
  az: {
    eyebrow: "Self-Study", title: "Praktiki suallar",
    sub: "Sual seç, cavablandır, biliyini real vaxtda yoxla.",
    correct: "Düzgün", accuracy: "Dəqiqlik", xp: "XP",
    filter: "Filtrlər", level: "Çətinlik", type: "Növ", course: "Kurs", status: "Status",
    all: "Hamısı",
    reset: "Sıfırla", empty: "Sual tapılmadı", emptySub: "Filtrləri sıfırla.",
    progress: "İrəliləyişim", answered: "Cavablandı", attempts: "Cəhd",
    closed: "Çoxseçimli", open: "Açıq cavab", terminal: "Terminal",
  },
  en: {
    eyebrow: "Self-Study", title: "Practice questions",
    sub: "Pick a question, answer it, test your knowledge in real time.",
    correct: "Correct", accuracy: "Accuracy", xp: "XP",
    filter: "Filters", level: "Difficulty", type: "Type", course: "Course", status: "Status",
    all: "All",
    reset: "Reset", empty: "No questions found", emptySub: "Reset filters and try again.",
    progress: "My Progress", answered: "Answered", attempts: "Attempts",
    closed: "Multiple-choice", open: "Open answer", terminal: "Terminal",
  },
};

const TYPE_META = {
  closed:   { ico: "◉", tone: "sky" },
  open:     { ico: "✎", tone: "mint" },
  terminal: { ico: "⌨", tone: "violet" },
};

export default function SelfStudyPage() {
  const [lang, setLang] = useState(getStoredStudyLanguage);
  const t = pickByLanguage(T, lang);

  const [questions, setQuestions] = useState([]);
  const [progress, setProgress]   = useState({ total_questions:0, correct_answers:0, answered_questions:0, total_attempts:0, total_points_earned:0, accuracy_percent:0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const [search, setSearch]       = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [level, setLevel]         = useState("");
  const [qtype, setQtype]         = useState("");
  const [course, setCourse]       = useState("");
  const [statusF, setStatusF]     = useState("");
  const [page, setPage]           = useState(1);

  const debRef = useRef(null);

  useEffect(() => { setStoredStudyLanguage(lang); }, [lang]);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebSearch(search), 300);
    return () => clearTimeout(debRef.current);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      endpoints.questions({ search: debSearch, level, question_type: qtype, course }),
      endpoints.questionProgress(),
    ])
      .then(([q, p]) => {
        if (!mounted) return;
        setQuestions(q.data || []);
        setProgress(p.data || progress);
      })
      .catch(() => { if (mounted) setError("Suallar yüklənmədi"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
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
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const accuracy = progress.accuracy_percent || 0;
  const pct = progress.total_questions ? Math.round((progress.correct_answers / progress.total_questions) * 100) : 0;
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

      <div className="bento" style={{ marginBottom: 16 }}>
        <Tile span={6}>
          <TileHead eyebrow={t.progress} title={`${pct}% tamamlandı`} sub={`${progress.correct_answers || 0} / ${progress.total_questions || 0}`} />
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <ProgressRing value={pct} size={120} strokeWidth={10} tone="accent" label={`${pct}%`} sub="solved" />
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Stat size="sm" label={t.correct} value={progress.correct_answers || 0} />
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

      <div className="bento">
        <Tile span={3} pad="sm">
          <TileHead title={t.filter} action={hasFilter ? <Button variant="quiet" size="sm" onClick={reset}>✕</Button> : null} />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)" }}>{t.level}</div>
            <Segmented value={level} onChange={setLevel} block size="sm" options={[
              { value: "", label: "All" },
              { value: "beginner", label: "Easy" },
              { value: "intermediate", label: "Med" },
              { value: "advanced", label: "Hard" },
            ]} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)" }}>{t.type}</div>
            <Segmented value={qtype} onChange={setQtype} block size="sm" options={[
              { value: "", label: "All" },
              { value: "closed", label: "MCQ" },
              { value: "open", label: "Open" },
              { value: "terminal", label: "Term" },
            ]} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)" }}>{t.status}</div>
            <Segmented value={statusF} onChange={setStatusF} block size="sm" options={[
              { value: "", label: t.all },
              { value: "correct", label: "✓" },
              { value: "wrong", label: "✗" },
              { value: "pending", label: "○" },
            ]} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)" }}>{t.course}</div>
            <Select value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">{t.all}</option>
              {courseOpts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </Select>
          </div>
        </Tile>

        <div className="span-9" style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Input
              placeholder="Sual axtar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1 }}
            />
            <Chip>{filtered.length} sual</Chip>
          </div>

          {error && <Tile><div style={{ color: "var(--c-4)" }}>{error}</div></Tile>}

          {loading ? (
            <div className="bento">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="span-4"><TileSkeleton height={140} /></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Tile>
              <EmptyState icon="◌" title={t.empty} description={t.emptySub} />
            </Tile>
          ) : (
            <>
              <div className="bento">
                {paged.map((q) => {
                  const tm = TYPE_META[q.question_type] || TYPE_META.closed;
                  const us = q.user_status || "pending";
                  return (
                    <Tile key={q.id} span={4} as={Link} to={`/self-study/question/${q.id}`} interactive pad="sm">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <DiffBadge level={q.level} />
                        <Chip size="sm" tone={us === "correct" ? "mint" : us === "wrong" ? "coral" : "neutral"}>
                          {us === "correct" ? "✓" : us === "wrong" ? "✗" : "○"}
                        </Chip>
                      </div>
                      <div className="tile-title" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {q.title}
                      </div>
                      <div className="tile-sub">{q.course?.title}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", fontSize: 11, fontFamily: "var(--font-mono)" }}>
                        <Chip size="sm" tone={tm.tone}>{tm.ico} {t[q.question_type] || q.question_type}</Chip>
                        <span className="tnum" style={{ color: "var(--accent)", fontWeight: 700 }}>★ {q.points}</span>
                      </div>
                    </Tile>
                  );
                })}
              </div>

              {filtered.length > PAGE_SIZE && (
                <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 8 }}>
                  <Button variant="ghost" size="sm" disabled={safePage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = safePage <= 4 ? i + 1 : safePage + i - 3;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <Button key={p} variant={p === safePage ? "accent" : "ghost"} size="sm" onClick={() => setPage(p)}>{p}</Button>
                    );
                  })}
                  <Button variant="ghost" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
