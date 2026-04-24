import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const PAGE_SIZE = 9;

const levelClassMap = {
  beginner: "level-badge level-beginner",
  intermediate: "level-badge level-intermediate",
  advanced: "level-badge level-advanced",
};

const typeIcon = {
  closed: "◉",
  open: "✎",
  terminal: "⌨",
};

const statusMap = {
  correct: "status-correct",
  wrong: "status-wrong",
  pending: "status-pending",
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
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      endpoints.questions({ search, level, question_type: questionType, course }),
      endpoints.questionProgress(),
    ])
      .then(([questionsResponse, progressResponse]) => {
        if (!mounted) return;
        setQuestions(questionsResponse.data || []);
        setProgress(progressResponse.data || {});
      })
      .catch(() => {
        if (!mounted) return;
        setError("Self-study suallari yuklenmedi.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [search, level, questionType, course]);

  useEffect(() => {
    setPage(1);
  }, [search, level, questionType, course]);

  const courseOptions = useMemo(() => {
    const map = new Map();
    questions.forEach((item) => {
      if (item.course) {
        map.set(item.course.id, item.course.title);
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [questions]);

  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedQuestions = questions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <AppShell
      title="Self Study"
      searchPlaceholder="Sual axtar..."
      onSearch={setSearch}
      extraTopbar={<span className="topbar-chip"><strong>{questions.length}</strong> questions</span>}
    >
      <section className="study-layout">
        <aside className="study-sidebar panel">
          <div className="panel-title">
            <div>
              <h2>Filters</h2>
              <div className="panel-title-sub">Find by level, course, type</div>
            </div>
          </div>

          <div className="study-filter-group">
            <label>Level</label>
            <select className="filter-select" value={level} onChange={(event) => setLevel(event.target.value)}>
              <option value="">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="study-filter-group">
            <label>Question type</label>
            <select className="filter-select" value={questionType} onChange={(event) => setQuestionType(event.target.value)}>
              <option value="">All types</option>
              <option value="closed">Multiple choice</option>
              <option value="open">Open text</option>
              <option value="terminal">Terminal/code</option>
            </select>
          </div>

          <div className="study-filter-group">
            <label>Course</label>
            <select className="filter-select" value={course} onChange={(event) => setCourse(event.target.value)}>
              <option value="">All courses</option>
              {courseOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </div>

          <div className="study-progress panel">
            <h3>Your progress</h3>
            <div className="study-progress-row"><span>Total questions</span><strong>{progress.total_questions || 0}</strong></div>
            <div className="study-progress-row"><span>Answered</span><strong>{progress.answered_questions || 0}</strong></div>
            <div className="study-progress-row"><span>Accuracy</span><strong>{progress.accuracy_percent || 0}%</strong></div>
            <div className="study-progress-row"><span>Points</span><strong>{progress.total_points_earned || 0}</strong></div>
          </div>
        </aside>

        <main className="study-main">
          {error && <div className="alert alert-error">{error}</div>}
          {loading ? (
            <div className="loading-block">Questions loading...</div>
          ) : (
            <>
              <div className="study-grid">
                {pagedQuestions.map((item) => (
                  <Link key={item.id} to={`/self-study/question/${item.id}`} className="study-card">
                    <div className="study-card-top">
                      <span className={levelClassMap[item.level] || "level-badge"}>{item.level}</span>
                      <span className={`study-status ${statusMap[item.user_status] || "status-pending"}`}>
                        {item.user_status === "correct" ? "✓ correct" : item.user_status === "wrong" ? "✗ wrong" : "pending"}
                      </span>
                    </div>
                    <h3>{item.title}</h3>
                    <p className="study-course">{item.course?.title}</p>
                    <div className="study-card-meta">
                      <span>{typeIcon[item.question_type] || "?"} {item.question_type}</span>
                      <span>{item.points} pts</span>
                    </div>
                    <div className="study-card-footer">Attempts: {item.attempt_count || 0}</div>
                  </Link>
                ))}
              </div>

              {questions.length === 0 && <div className="empty-state panel">No questions matched your filters.</div>}

              <div className="study-pagination">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={safePage <= 1}
                >
                  Previous
                </button>
                <span>Page {safePage} / {totalPages}</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={safePage >= totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </section>
    </AppShell>
  );
}
