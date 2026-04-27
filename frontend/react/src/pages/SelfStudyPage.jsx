import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const PAGE_SIZE = 12;

const levelMeta = {
  beginner:     { cls: "level-beginner",     label: "Başlanğıc" },
  intermediate: { cls: "level-intermediate", label: "Orta" },
  advanced:     { cls: "level-advanced",     label: "İrəliləmiş" },
};

const typeIcon = { closed: "◉", open: "✎", terminal: "⌨" };
const typeLabel = { closed: "Çoxseçimli", open: "Açıq", terminal: "Terminal" };

const statusMeta = {
  correct: { cls: "status-correct", icon: "✓", label: "Düzgün" },
  wrong:   { cls: "status-wrong",   icon: "✗", label: "Yanlış" },
  pending: { cls: "status-pending", icon: "○", label: "Cavabsız" },
};

export default function SelfStudyPage() {
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
        setError("Suallar yüklənə bilmədi.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [search, level, questionType, course]);

  useEffect(() => { setPage(1); }, [search, level, questionType, course, statusFilter]);

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
      title="Self Study"
      searchPlaceholder="Sual axtar..."
      onSearch={setSearch}
      extraTopbar={
        <span className="topbar-chip">
          <strong>{questions.length}</strong> sual
        </span>
      }
    >
      <section className="study-layout">
        {/* ---- Sidebar ---- */}
        <aside className="study-sidebar panel">
          <div className="panel-title">
            <div>
              <h2>Filtrlər</h2>
              <div className="panel-title-sub">Səviyyə, kurs, tip</div>
            </div>
          </div>

          <div className="study-filter-group">
            <label>Səviyyə</label>
            <select className="filter-select" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Bütün səviyyələr</option>
              <option value="beginner">Başlanğıc</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İrəliləmiş</option>
            </select>
          </div>

          <div className="study-filter-group">
            <label>Sual tipi</label>
            <select className="filter-select" value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
              <option value="">Bütün tiplər</option>
              <option value="closed">Çoxseçimli</option>
              <option value="open">Açıq mətn</option>
              <option value="terminal">Terminal/kod</option>
            </select>
          </div>

          <div className="study-filter-group">
            <label>Kurs</label>
            <select className="filter-select" value={course} onChange={(e) => setCourse(e.target.value)}>
              <option value="">Bütün kurslar</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="study-filter-group">
            <label>Status</label>
            <div className="status-filter-btns">
              {["", "pending", "wrong", "correct"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`status-filter-btn ${statusFilter === s ? "active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "" ? "Hamısı" : statusMeta[s]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progress block */}
          <div className="study-progress panel" style={{ marginTop: 8 }}>
            <h3 style={{ marginBottom: 14 }}>Proqresim</h3>

            <div className="progress" style={{ marginBottom: 14 }}>
              <div className="progress-meta">
                <span>Düzgün</span>
                <span>{progress.correct_answers}/{progress.total_questions}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill mint" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="study-progress-row">
              <span>Cavablandırılan</span>
              <strong>{progress.answered_questions || 0}</strong>
            </div>
            <div className="study-progress-row">
              <span>Düzgünlük</span>
              <strong>{progress.accuracy_percent || 0}%</strong>
            </div>
            <div className="study-progress-row">
              <span>Qazanılan xallar</span>
              <strong style={{ color: "var(--accent-2)" }}>{progress.total_points_earned || 0}</strong>
            </div>
            <div className="study-progress-row">
              <span>Ümumi cəhdlər</span>
              <strong>{progress.total_attempts || 0}</strong>
            </div>
          </div>
        </aside>

        {/* ---- Main grid ---- */}
        <main className="study-main">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-block">Suallar yüklənir...</div>
          ) : (
            <>
              {filtered.length === 0 && !loading && (
                <div className="empty-state panel">
                  <h3>Sual tapılmadı</h3>
                  <p>Filtrləri dəyişdirərək yenidən cəhd edin.</p>
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
                        <span className="study-card-pts">{item.points} xal</span>
                      </div>
                      {item.attempt_count > 0 && (
                        <div className="study-card-footer">{item.attempt_count} cəhd</div>
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
                    ← Əvvəlki
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
                    Növbəti →
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
