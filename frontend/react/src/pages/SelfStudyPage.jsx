import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { getStoredStudyLanguage, pickByLanguage, setStoredStudyLanguage } from "../utils/selfStudyI18n";

const PAGE_SIZE = 12;

const typeIcon = { closed: "◉", open: "✎", terminal: "⌨" };

const TEXT = {
  az: {
    pageTitle: "Sərbəst Tədris",
    searchPlaceholder: "Sual, kurs və ya mövzu axtar...",
    questionsAvailable: "sual mövcuddur",
    filtersTitle: "Filtrləmə",
    filtersSub: "Səviyyə, kurs və sual növünə görə",
    level: "Səviyyə",
    allLevels: "Bütün səviyyələr",
    beginner: "Başlanğıc",
    intermediate: "Orta",
    advanced: "İrəliləmiş",
    questionType: "Sual növü",
    allTypes: "Bütün növlər",
    typeClosed: "Çoxseçimli",
    typeOpen: "Açıq cavab",
    typeTerminal: "Terminal / Kod",
    course: "Kurs",
    allCourses: "Bütün kurslar",
    status: "Status",
    all: "Hamısı",
    statusCorrect: "Düzgün",
    statusWrong: "Yanlış",
    statusPending: "Cavabsız",
    progressTitle: "İrəliləyişim",
    progressCorrect: "Düzgün",
    answered: "Cavablandırılan",
    accuracy: "Dəqiqlik",
    earnedPoints: "Qazanılan xallar",
    totalAttempts: "Ümumi cəhdlər",
    heroTitle: "Sərbəst Tədris Mərkəzi",
    heroSub: "Uyğun sualı seçin, cavablayın və nəticənizi real vaxtda izləyin.",
    heroMetricsAria: "Əsas göstəricilər",
    totalQuestions: "Cəmi sual",
    correctAnswers: "Düzgün cavab",
    loadError: "Suallar yüklənə bilmədi.",
    loading: "Suallar yüklənir...",
    emptyTitle: "Sual tapılmadı",
    emptySub: "Filtrləri dəyişdirərək yenidən cəhd edin.",
    points: "xal",
    attempts: "cəhd",
    prev: "← Əvvəlki",
    next: "Növbəti →",
    languageLabel: "Dil",
  },
  en: {
    pageTitle: "Self Study",
    searchPlaceholder: "Search by question, course, or topic...",
    questionsAvailable: "questions available",
    filtersTitle: "Filters",
    filtersSub: "By level, course, and question type",
    level: "Level",
    allLevels: "All levels",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    questionType: "Question type",
    allTypes: "All types",
    typeClosed: "Multiple Choice",
    typeOpen: "Open Answer",
    typeTerminal: "Terminal / Code",
    course: "Course",
    allCourses: "All courses",
    status: "Status",
    all: "All",
    statusCorrect: "Correct",
    statusWrong: "Wrong",
    statusPending: "Unanswered",
    progressTitle: "My Progress",
    progressCorrect: "Correct",
    answered: "Answered",
    accuracy: "Accuracy",
    earnedPoints: "Points earned",
    totalAttempts: "Total attempts",
    heroTitle: "Self Study Center",
    heroSub: "Pick a question, answer it, and track your progress in real time.",
    heroMetricsAria: "Key metrics",
    totalQuestions: "Total questions",
    correctAnswers: "Correct answers",
    loadError: "Failed to load questions.",
    loading: "Loading questions...",
    emptyTitle: "No questions found",
    emptySub: "Try changing the filters and search again.",
    points: "pts",
    attempts: "attempts",
    prev: "← Previous",
    next: "Next →",
    languageLabel: "Language",
  },
};

export default function SelfStudyPage() {
  const [lang, setLang] = useState(getStoredStudyLanguage);
  const t = pickByLanguage(TEXT, lang);

  const levelMeta = useMemo(
    () => ({
      beginner: { cls: "level-beginner", label: t.beginner },
      intermediate: { cls: "level-intermediate", label: t.intermediate },
      advanced: { cls: "level-advanced", label: t.advanced },
    }),
    [t.beginner, t.intermediate, t.advanced],
  );

  const typeLabel = useMemo(
    () => ({
      closed: t.typeClosed,
      open: t.typeOpen,
      terminal: t.typeTerminal,
    }),
    [t.typeClosed, t.typeOpen, t.typeTerminal],
  );

  const statusMeta = useMemo(
    () => ({
      correct: { cls: "status-correct", icon: "✓", label: t.statusCorrect },
      wrong: { cls: "status-wrong", icon: "✗", label: t.statusWrong },
      pending: { cls: "status-pending", icon: "○", label: t.statusPending },
    }),
    [t.statusCorrect, t.statusWrong, t.statusPending],
  );

  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState({
    total_questions: 0,
    answered_questions: 0,
    correct_answers: 0,
    total_attempts: 0,
    total_points_earned: 0,
    accuracy_percent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [course, setCourse] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setStoredStudyLanguage(lang);
  }, [lang]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      endpoints.questions({ search, level, question_type: questionType, course }),
      endpoints.questionProgress(),
    ])
      .then(([qRes, pRes]) => {
        if (!mounted) return;
        setQuestions(qRes.data || []);
        setProgress(pRes.data || {});
      })
      .catch(() => {
        if (!mounted) return;
        setError(t.loadError);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [search, level, questionType, course, t.loadError]);

  useEffect(() => {
    setPage(1);
  }, [search, level, questionType, course, statusFilter]);

  const courseOptions = useMemo(() => {
    const map = new Map();
    questions.forEach((q) => {
      if (q.course) map.set(q.course.id, q.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [questions]);

  const filtered = useMemo(() => {
    if (!statusFilter) return questions;
    return questions.filter((q) => q.user_status === statusFilter);
  }, [questions, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const progressPct = progress.total_questions
    ? Math.round((progress.correct_answers / progress.total_questions) * 100)
    : 0;

  return (
    <AppShell
      title={t.pageTitle}
      searchPlaceholder={t.searchPlaceholder}
      onSearch={setSearch}
      extraTopbar={(
        <>
          <div className="lang-switch" role="group" aria-label={t.languageLabel}>
            <button
              type="button"
              className={`lang-switch-btn ${lang === "az" ? "active" : ""}`}
              onClick={() => setLang("az")}
            >
              AZ
            </button>
            <button
              type="button"
              className={`lang-switch-btn ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
            >
              EN
            </button>
          </div>
          <span className="topbar-chip">
            <strong>{questions.length}</strong> {t.questionsAvailable}
          </span>
        </>
      )}
    >
      <section className="study-layout">
        <aside className="study-sidebar panel">
          <div className="panel-title">
            <div>
              <h2>{t.filtersTitle}</h2>
              <div className="panel-title-sub">{t.filtersSub}</div>
            </div>
          </div>

          <div className="study-filter-group">
            <label>{t.level}</label>
            <select className="filter-select" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">{t.allLevels}</option>
              <option value="beginner">{t.beginner}</option>
              <option value="intermediate">{t.intermediate}</option>
              <option value="advanced">{t.advanced}</option>
            </select>
          </div>

          <div className="study-filter-group">
            <label>{t.questionType}</label>
            <select className="filter-select" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
              <option value="">{t.allTypes}</option>
              <option value="closed">{t.typeClosed}</option>
              <option value="open">{t.typeOpen}</option>
              <option value="terminal">{t.typeTerminal}</option>
            </select>
          </div>

          <div className="study-filter-group">
            <label>{t.course}</label>
            <select className="filter-select" value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">{t.allCourses}</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="study-filter-group">
            <label>{t.status}</label>
            <div className="status-filter-btns">
              {["", "pending", "wrong", "correct"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-filter-btn ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "" ? t.all : statusMeta[s]?.label}
                </button>
              ))}
            </div>
          </div>

          <div className="study-progress panel" style={{ marginTop: 8 }}>
            <h3 style={{ marginBottom: 14 }}>{t.progressTitle}</h3>

            <div className="progress" style={{ marginBottom: 14 }}>
              <div className="progress-meta">
                <span>{t.progressCorrect}</span>
                <span>{progress.correct_answers}/{progress.total_questions}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill mint" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="study-progress-row">
              <span>{t.answered}</span>
              <strong>{progress.answered_questions || 0}</strong>
            </div>
            <div className="study-progress-row">
              <span>{t.accuracy}</span>
              <strong>{progress.accuracy_percent || 0}%</strong>
            </div>
            <div className="study-progress-row">
              <span>{t.earnedPoints}</span>
              <strong style={{ color: "var(--accent-2)" }}>{progress.total_points_earned || 0}</strong>
            </div>
            <div className="study-progress-row">
              <span>{t.totalAttempts}</span>
              <strong>{progress.total_attempts || 0}</strong>
            </div>
          </div>
        </aside>

        <main className="study-main">
          <section className="study-hero panel">
            <div>
              <h1>{t.heroTitle}</h1>
              <p>{t.heroSub}</p>
            </div>
            <div className="study-hero-metrics" aria-label={t.heroMetricsAria}>
              <div className="study-hero-metric">
                <span>{t.totalQuestions}</span>
                <strong>{progress.total_questions || 0}</strong>
              </div>
              <div className="study-hero-metric">
                <span>{t.correctAnswers}</span>
                <strong>{progress.correct_answers || 0}</strong>
              </div>
              <div className="study-hero-metric">
                <span>{t.accuracy}</span>
                <strong>{progress.accuracy_percent || 0}%</strong>
              </div>
            </div>
          </section>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-block">{t.loading}</div>
          ) : (
            <>
              {filtered.length === 0 && !loading && (
                <div className="empty-state panel">
                  <h3>{t.emptyTitle}</h3>
                  <p>{t.emptySub}</p>
                </div>
              )}

              <div className="study-grid">
                {paged.map((item) => {
                  const lm = levelMeta[item.level] || { cls: "level-badge", label: item.level };
                  const sm = statusMeta[item.user_status] || statusMeta.pending;
                  return (
                    <Link key={item.id} to={`/self-study/question/${item.id}`} className="study-card">
                      <div className="study-card-top">
                        <span className={`level-badge ${lm.cls}`}>{lm.label}</span>
                        <span className={`study-status ${sm.cls}`}>
                          {sm.icon} {sm.label}
                        </span>
                      </div>
                      <h3 className="study-card-title">{item.title}</h3>
                      <p className="study-course">{item.course?.title}</p>
                      <div className="study-card-meta">
                        <span>{typeIcon[item.question_type]} {typeLabel[item.question_type] || item.question_type}</span>
                        <span className="study-card-pts">{item.points} {t.points}</span>
                      </div>
                      {item.attempt_count > 0 && (
                        <div className="study-card-footer">{item.attempt_count} {t.attempts}</div>
                      )}
                    </Link>
                  );
                })}
              </div>

              {filtered.length > PAGE_SIZE && (
                <div className="study-pagination">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                  >
                    {t.prev}
                  </button>
                  <span className="pagination-info">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                  >
                    {t.next}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </section>
    </AppShell>
  );
}
