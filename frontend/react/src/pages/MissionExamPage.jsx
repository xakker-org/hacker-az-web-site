import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import "../styles/missions.css";

/* ── Timer component ──────────────────────────────────────────── */
function Timer({ totalSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(ref.current);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [onExpire]);

  const m = String(Math.floor(remaining / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  const warning = remaining < 60;

  return (
    <span className={`ms-timer${warning ? " warning" : ""}`}>
      ⏱ {m}:{s}
    </span>
  );
}

/* ── Question card ───────────────────────────────────────────── */
function QuestionCard({ question, index, selectedChoices, answerText, onToggle, onTextChange, locked }) {
  const isOpen = question.question_type === "open";
  const answered = isOpen ? answerText.trim().length > 0 : selectedChoices.length > 0;

  return (
    <div className={`ms-question-card${answered ? " answered" : ""}`}>
      <div className="ms-question-num">Question {index + 1}</div>
      <div className="ms-question-text">{question.question_text}</div>
      {isOpen ? (
        <textarea
          className="xk-input"
          value={answerText}
          onChange={(e) => !locked && onTextChange(question.id, e.target.value)}
          placeholder="Cavabınızı yazın..."
          rows={5}
          style={{ width: "100%", resize: "vertical" }}
          disabled={locked}
        />
      ) : (
        <div className="ms-choices">
          {question.choices.map((c) => {
            const sel = selectedChoices.includes(c.id);
            return (
              <div
                key={c.id}
                className={`ms-choice${sel ? " selected" : ""}`}
                onClick={() => !locked && onToggle(question.id, c.id, question.is_multiple)}
              >
                <div className="ms-choice-indicator">{sel ? "✓" : ""}</div>
                <div className="ms-choice-text">{c.choice_text}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Result view ─────────────────────────────────────────────── */
function ResultView({ result, exam, missionSlug, onRetry, canRetry }) {
  const passed = result.passed;
  const score  = result.score ?? 0;

  return (
    <>
      <div className={`ms-result-card ${passed ? "passed" : "failed"}`}>
        <div className="ms-result-icon">{passed ? "🎉" : "😞"}</div>
        <div className={`ms-result-title ${passed ? "passed" : "failed"}`}>
          {passed ? "Mission Complete!" : "Not Passed"}
        </div>
        <div className={`ms-result-score ${passed ? "passed" : "failed"}`}>
          {score.toFixed(1)}%
        </div>
        <div className="ms-result-desc">
          {passed
            ? `You scored ${score.toFixed(1)}% — well above the ${exam?.passing_score}% passing threshold. Mission XP has been awarded!`
            : `You scored ${score.toFixed(1)}%. You need at least ${exam?.passing_score}% to pass.`}
        </div>
        <div className="ms-result-actions">
          <Link to={`/missions/${missionSlug}`} className="ms-btn ms-btn-secondary">
            ← Back to Mission
          </Link>
          {!passed && canRetry && (
            <button className="ms-btn ms-btn-primary" onClick={onRetry}>
              🔄 Retry Exam
            </button>
          )}
          {passed && (
            <Link to="/missions" className="ms-btn ms-btn-primary">
              Next Mission →
            </Link>
          )}
        </div>
      </div>

      {/* Answer breakdown */}
      {result.answers_detail?.length > 0 && (
        <div>
          <div style={{ marginBottom: 12, fontFamily: "var(--display)", fontWeight: 700, color: "var(--t1)", fontSize: 15 }}>
            Answer Review
          </div>
          {result.answers_detail.map((a, i) => {
            const correct = a.is_correct;
            const isOpen = a.question_type === "open";
            return (
              <div key={a.question_id} className="ms-explanation-card">
                <div className="ms-explanation-q">
                  <div className="ms-explanation-q-icon">{correct ? "✅" : "❌"}</div>
                  <div className="ms-explanation-q-text">
                    {i + 1}. {a.question_text}
                  </div>
                </div>
                <div className="ms-explanation-body">
                  {isOpen ? (
                    <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
                      <div>
                        <strong>Your answer:</strong> {a.submitted_answer || "—"}
                      </div>
                      <div>
                        <strong>Accepted answer:</strong> {a.expected_answers?.join(" / ") || "—"}
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 8 }}>
                      {a.choices.map((c) => {
                        const wasSelected = a.selected_choice_ids.includes(c.id);
                        const isCorrect   = a.correct_choice_ids.includes(c.id);
                        let color = "var(--t3)";
                        if (isCorrect) color = "var(--green)";
                        if (wasSelected && !isCorrect) color = "var(--hard)";
                        return (
                          <div
                            key={c.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "4px 0",
                              color,
                              fontSize: 13,
                            }}
                          >
                            <span>{isCorrect ? "✓" : wasSelected ? "✗" : "○"}</span>
                            <span>{c.choice_text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {a.explanation && (
                    <div style={{ color: "var(--t3)", borderTop: "1px solid var(--b1)", paddingTop: 8, marginTop: 4 }}>
                      💡 {a.explanation}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ── Main component ───────────────────────────────────────────── */
export default function MissionExamPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  const [exam, setExam]           = useState(null);
  const [mission, setMission]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [attemptId, setAttemptId] = useState(null);
  const [started, setStarted]     = useState(false);
  const [starting, setStarting]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [error, setError]         = useState(null);

  // answers: { [questionId]: [choiceId, ...] }
  const [answers, setAnswers] = useState({});
  const [openAnswers, setOpenAnswers] = useState({});

  useEffect(() => {
    Promise.all([
      endpoints.missionExamDetail(slug),
      endpoints.missionDetail(slug),
    ])
      .then(([examRes, missionRes]) => {
        setExam(examRes.data);
        setMission(missionRes.data);
      })
      .catch(() => setError("Exam not found or not available."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStartExam = async () => {
    setStarting(true);
    setError(null);
    try {
      const { data } = await endpoints.missionExamStart(slug);
      setAttemptId(data.attempt_id);
      setStarted(true);
      setAnswers({});
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to start exam.");
    } finally {
      setStarting(false);
    }
  };

  const handleToggleChoice = (questionId, choiceId, isMultiple) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        return {
          ...prev,
          [questionId]: current.includes(choiceId)
            ? current.filter((c) => c !== choiceId)
            : [...current, choiceId],
        };
      }
      // single choice
      return {
        ...prev,
        [questionId]: current.includes(choiceId) ? [] : [choiceId],
      };
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
        const payload = bulkMode
          ? {
              answers: (exam?.questions || []).map((q) => ({
                question_id: q.id,
                answer_text: bulkText || "",
              })),
            }
          : {
              answers: (exam?.questions || []).map((q) => ({
                question_id: q.id,
                ...(q.question_type === "open"
                  ? { answer_text: openAnswers[q.id] || "" }
                  : { choice_ids: answers[q.id] || [] }),
              })),
            };
      const { data } = await endpoints.missionExamSubmit(slug, attemptId, payload);
      setResult(data);
      setStarted(false);
    } catch (e) {
      setError(e?.response?.data?.detail || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setStarted(false);
    setAttemptId(null);
    setAnswers({});
    setOpenAnswers({});
    // Reload exam to update attempts_used
    endpoints.missionExamDetail(slug).then(({ data }) => setExam(data));
  };

  const handleTimerExpire = () => {
    if (started && !submitting) handleSubmit();
  };

  if (loading) return <AppShell title="Final Exam"><div className="ms-spinner" /></AppShell>;
  if (error && !exam) return <AppShell title="Final Exam"><div className="ms-empty">{error}</div></AppShell>;

  const questions = exam?.questions || [];
  const answeredCount = questions.filter((q) => {
    if (bulkMode) {
      return bulkText.trim().length > 0;
    }
    if (q.question_type === "open") {
      return (openAnswers[q.id] || "").trim().length > 0;
    }
    return (answers[q.id] || []).length > 0;
  }).length;
  const allAnswered = bulkMode ? bulkText.trim().length > 0 : answeredCount === questions.length;
  const canAttempt = exam?.can_attempt;
  const attemptsUsed = exam?.attempts_used ?? 0;
  const maxAttempts = exam?.max_attempts ?? 0;
  const attemptsLeft = maxAttempts === 0 ? null : maxAttempts - attemptsUsed;
  const canRetry = maxAttempts === 0 || attemptsUsed < maxAttempts;

  return (
    <AppShell title="Final Exam">
      <div className="ms-exam-page">
        {/* Breadcrumb */}
        <div className="ms-pass-nav">
          <Link to="/missions">Missions</Link>
          <span className="ms-pass-nav-sep">/</span>
          <Link to={`/missions/${slug}`}>{mission?.title}</Link>
          <span className="ms-pass-nav-sep">/</span>
          <span className="ms-pass-current">Final Exam</span>
        </div>

        {result ? (
          <ResultView
            result={result}
            exam={exam}
            missionSlug={slug}
            onRetry={handleRetry}
            canRetry={canRetry}
          />
        ) : (
          <>
            {/* Exam header */}
            <div className="ms-exam-header">
              <div className="ms-exam-header-icon">📋</div>
              <div style={{ flex: 1 }}>
                <div className="ms-exam-header-title">{exam?.title}</div>
                {exam?.description && (
                  <div className="ms-exam-header-desc">{exam.description}</div>
                )}
                <div className="ms-exam-header-meta">
                  <span className="ms-badge ms-badge-exam">{questions.length} questions</span>
                  <span className="ms-badge ms-badge-info">Pass: {exam?.passing_score}%</span>
                  {exam?.time_limit_minutes > 0 && (
                    <span className="ms-badge ms-badge-info">
                      ⏱ {exam.time_limit_minutes} min
                    </span>
                  )}
                  {maxAttempts > 0 && (
                    <span className="ms-badge ms-badge-info">
                      Attempt {attemptsUsed + 1}/{maxAttempts}
                    </span>
                  )}
                  {exam?.xp_reward > 0 && (
                    <span className="ms-badge" style={{ background: "rgba(158,255,0,.1)", color: "var(--green)", border: "1px solid var(--green-ring)" }}>
                      +{exam.xp_reward} XP
                    </span>
                  )}
                </div>
              </div>
              {started && exam?.time_limit_minutes > 0 && (
                <Timer
                  totalSeconds={exam.time_limit_minutes * 60}
                  onExpire={handleTimerExpire}
                />
              )}
            </div>

            {/* Locked / prerequisite */}
            {!exam?.passes_completed && (
              <div className="ms-locked-banner">
                <span className="ms-locked-banner-icon">🔒</span>
                Complete all passes before taking the final exam.
              </div>
            )}

            {/* Max attempts reached */}
            {exam?.passes_completed && !canAttempt && !started && (
              <div
                style={{
                  background: "var(--hard-dim)",
                  border: "1.5px solid rgba(255,61,90,.25)",
                  borderRadius: "var(--r3)",
                  padding: 16,
                  marginBottom: 16,
                  color: "var(--t2)",
                  fontSize: 14,
                }}
              >
                ❌ You have used all {maxAttempts} attempt{maxAttempts !== 1 ? "s" : ""} for this exam.
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "var(--hard-dim)",
                  border: "1.5px solid rgba(255,61,90,.25)",
                  borderRadius: "var(--r3)",
                  padding: 12,
                  marginBottom: 16,
                  color: "var(--hard)",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* Start screen */}
            {!started && canAttempt && exam?.passes_completed && (
              <div
                style={{
                  background: "var(--s1)",
                  border: "1.5px solid var(--b1)",
                  borderRadius: "var(--r4)",
                  padding: "32px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
                <div
                  style={{
                    fontFamily: "var(--display)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--t1)",
                    marginBottom: 8,
                  }}
                >
                  Ready for the Final Exam?
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "var(--t3)",
                    maxWidth: 400,
                    margin: "0 auto 24px",
                    lineHeight: 1.7,
                  }}
                >
                  {questions.length} questions · Pass threshold {exam?.passing_score}%
                  {exam?.time_limit_minutes > 0 && ` · ${exam.time_limit_minutes} min limit`}
                  {attemptsLeft !== null && ` · ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining`}
                </div>
                <button
                  className="ms-btn ms-btn-primary"
                  style={{ padding: "12px 32px", fontSize: 15 }}
                  onClick={handleStartExam}
                  disabled={starting}
                >
                  {starting ? "Starting…" : "🚀 Start Exam"}
                </button>
              </div>
            )}

            {/* Questions */}
            {started && (
              <>
                <div className="submission-mode">
                  <div className="label">Submission mode:</div>
                  <button
                    className={`mode-btn ${!bulkMode ? 'active' : ''}`}
                    onClick={() => setBulkMode(false)}
                    type="button"
                  >
                    Per-question
                  </button>
                  <button
                    className={`mode-btn ${bulkMode ? 'active' : ''}`}
                    onClick={() => setBulkMode(true)}
                    type="button"
                  >
                    Single text area
                  </button>
                </div>

                {bulkMode ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ marginBottom: 8, fontWeight: 600 }}>Write all answers here</div>
                    <textarea
                      className="bulk-textarea"
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={"Write answers for all questions. You can reference question numbers if you like."}
                      rows={12}
                    />
                  </div>
                ) : (
                  questions.map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      index={i}
                      selectedChoices={answers[q.id] || []}
                      answerText={openAnswers[q.id] || ""}
                      onToggle={handleToggleChoice}
                      onTextChange={(questionId, value) => setOpenAnswers((prev) => ({ ...prev, [questionId]: value }))}
                      locked={submitting}
                    />
                  ))
                )}

                {/* Submit bar */}
                <div className="ms-exam-submit-bar">
                  <div className="ms-exam-progress-text">
                    {answeredCount}/{questions.length} answered
                    {!allAnswered && (
                      <span style={{ color: "var(--amber)", marginLeft: 8 }}>
                        — answer all questions before submitting
                      </span>
                    )}
                  </div>
                  <button
                    className="ms-btn ms-btn-primary"
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                  >
                    {submitting ? "Submitting…" : "Submit Exam →"}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
