import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const typeLabel = {
  closed: "Multiple choice",
  open: "Open text",
  terminal: "Terminal/code",
};

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function ChoiceList({ choices, selectedId, correctIds, onSelect, locked }) {
  return (
    <div className="question-choices">
      {choices.map((choice, index) => {
        const letter = OPTION_LETTERS[index] || `${index + 1}`;
        const isSelected = selectedId === choice.id;
        const isCorrect = correctIds.includes(choice.id);

        let cls = "q-choice";
        if (locked) {
          if (isCorrect) cls += " choice-correct";
          else if (isSelected && !isCorrect) cls += " choice-wrong";
          else cls += " choice-dimmed";
        } else if (isSelected) {
          cls += " selected";
        }

        return (
          <label
            key={choice.id}
            className={cls}
            style={locked ? { cursor: "default", pointerEvents: "none" } : undefined}
          >
            <input
              type="radio"
              name="selectedChoice"
              checked={isSelected}
              onChange={() => !locked && onSelect(choice.id)}
              disabled={locked}
            />
            <span className="q-choice-letter">{letter}</span>
            <span className="q-choice-text">{choice.text}</span>
            {locked && isCorrect && <span className="q-choice-badge correct-badge">Düzgün</span>}
            {locked && isSelected && !isCorrect && <span className="q-choice-badge wrong-badge">Seçdiniz</span>}
          </label>
        );
      })}
    </div>
  );
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // True when question is "locked" — user has answered (or just submitted)
  const [locked, setLocked] = useState(false);
  const [correctChoiceIds, setCorrectChoiceIds] = useState([]);
  const [expectedAnswer, setExpectedAnswer] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setResult(null);
    setLocked(false);
    setCorrectChoiceIds([]);
    setExpectedAnswer("");
    setSelectedChoiceId(null);
    setAnswerText("");

    endpoints
      .questionDetail(id)
      .then(({ data }) => {
        setQuestion(data);
        setAttempts(data.attempts || []);
        if (data.has_answered) {
          setLocked(true);
          setCorrectChoiceIds(data.correct_choice_ids || []);
          setExpectedAnswer(data.expected_answer || "");
          const first = (data.attempts || [])[0];
          if (first) {
            setSelectedChoiceId(
              data.question_type === "closed"
                ? parseInt((first.submitted_answer || "").split(",")[0]) || null
                : null
            );
            if (data.question_type !== "closed") setAnswerText(first.submitted_answer || "");
          }
        } else {
          setAnswerText(data.question_type === "terminal" ? (data.starter_code || "") : "");
        }
      })
      .catch(() => setError("Sualı yükləmək mümkün olmadı."))
      .finally(() => setLoading(false));
  }, [id]);

  const submitAnswer = async () => {
    if (!question || locked) return;

    if (question.question_type === "closed" && !selectedChoiceId) {
      setError("Zəhmət olmasa bir variant seçin.");
      return;
    }
    if (question.question_type !== "closed" && !answerText.trim()) {
      setError("Zəhmət olmasa cavabınızı yazın.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload =
      question.question_type === "closed"
        ? { selected_choice_id: selectedChoiceId }
        : { answer_text: answerText };

    try {
      const { data } = await endpoints.submitQuestionAnswer(id, payload);
      setResult(data);
      setAttempts(data.attempts || []);
      setCorrectChoiceIds(data.correct_choice_ids || []);
      setExpectedAnswer(data.expected_answer || "");
      setLocked(true);
    } catch (err) {
      const message = err?.response?.data?.detail || "Cavab göndərilə bilmədi.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Sual">
        <div className="loading-block">Sual yüklənir...</div>
      </AppShell>
    );
  }

  if (!question) {
    return (
      <AppShell title="Sual">
        <div className="empty-state panel">Sual tapılmadı.</div>
      </AppShell>
    );
  }

  const previousAttempt = attempts[0] || null;
  const levelClass = { beginner: "chip-mint", intermediate: "chip-amber", advanced: "chip-accent" }[question.level] || "chip";

  return (
    <AppShell title="Sual">
      <section className="question-detail-layout">
        <main className="question-detail-main panel">
          {/* Header */}
          <div className="question-head">
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <span className={`chip ${levelClass}`}>{question.level}</span>
                <span className="chip">{typeLabel[question.question_type] || question.question_type}</span>
                <span className="chip chip-blue">{question.points} xal</span>
                {locked && (
                  <span className={`chip ${previousAttempt?.is_correct ? "chip-mint" : "chip-accent"}`}>
                    {previousAttempt?.is_correct ? "Düzgün cavablandırıldı" : "Cavablandırıldı"}
                  </span>
                )}
              </div>
              <h1>{question.title}</h1>
              <p style={{ marginTop: 4, color: "var(--ink-3)" }}>{question.course?.title}</p>
            </div>
            <div className="question-head-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/self-study")}>
                ← Geri
              </button>
            </div>
          </div>

          {/* Prompt */}
          <div className="question-prompt panel" style={{ marginBottom: 18, fontSize: 15, lineHeight: 1.7 }}>
            {question.prompt}
          </div>

          {/* Already answered notice */}
          {locked && !result && (
            <div className="alert alert-info" style={{ marginBottom: 12 }}>
              Bu sualı artıq cavablandırmısınız. Aşağıda öncəki cavabınızı, düzgün cavabı və izahı görə bilərsiniz.
            </div>
          )}

          {/* Answer area */}
          {question.question_type === "closed" ? (
            <ChoiceList
              choices={question.choices || []}
              selectedId={selectedChoiceId}
              correctIds={locked ? correctChoiceIds : []}
              onSelect={setSelectedChoiceId}
              locked={locked}
            />
          ) : (
            <div className="question-answer-area">
              <textarea
                className="q-input"
                rows={question.question_type === "terminal" ? 8 : 5}
                value={answerText}
                onChange={(e) => !locked && setAnswerText(e.target.value)}
                readOnly={locked}
                placeholder={
                  locked
                    ? "(öncəki cavabınız)"
                    : question.question_type === "terminal"
                    ? "Əmri/kodu bura yazın..."
                    : "Cavabınızı bura yazın..."
                }
                style={locked ? { opacity: 0.7, cursor: "default" } : undefined}
              />
              {locked && expectedAnswer && (
                <div className="correct-answer-box">
                  <span className="correct-answer-label">Düzgün cavab:</span>
                  <span className="correct-answer-text">{expectedAnswer}</span>
                </div>
              )}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {/* Submit button — only if not locked */}
          {!locked && (
            <div className="question-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitAnswer}
                disabled={submitting}
              >
                {submitting ? "Göndərilir..." : "Cavabı göndər"}
              </button>
              <Link to="/self-study" className="btn btn-secondary">
                Siyahıya qayıt
              </Link>
            </div>
          )}

          {/* Result panel shown immediately after submission */}
          {result && (
            <div className={`question-result panel ${result.is_correct ? "result-correct" : "result-wrong"}`}>
              <div className="result-header">
                <span className={`result-icon ${result.is_correct ? "correct" : "wrong"}`}>
                  {result.is_correct ? "✓" : "✗"}
                </span>
                <div>
                  <h3>{result.is_correct ? "Düzgün cavab!" : "Yanlış cavab"}</h3>
                  <p style={{ marginTop: 4 }}>
                    {result.already_had_correct
                      ? "Bu sualı daha öncə cavablandırmısınız — xal verilmir."
                      : result.is_correct
                      ? `+${result.points_awarded} xal qazandınız`
                      : "Bu dəfə xal qazanılmadı."}
                  </p>
                </div>
              </div>
              {result.explanation && (
                <div className="question-explanation">{result.explanation}</div>
              )}
              {question.question_type !== "closed" && result.is_correct === false && expectedAnswer && (
                <div className="correct-answer-box">
                  <span className="correct-answer-label">Düzgün cavab:</span>
                  <span className="correct-answer-text">{expectedAnswer}</span>
                </div>
              )}
              <div className="question-actions" style={{ marginTop: 12 }}>
                <Link to="/self-study" className="btn btn-primary">
                  Digər suallar
                </Link>
              </div>
            </div>
          )}

          {/* Explanation block if previously answered (no fresh result) */}
          {locked && !result && question.explanation && (
            <div className="panel" style={{ marginTop: 14, borderColor: "var(--line-3)" }}>
              <h4 style={{ marginBottom: 8 }}>İzah</h4>
              <p style={{ lineHeight: 1.7 }}>{question.explanation}</p>
            </div>
          )}
        </main>

        {/* Sidebar — attempt history */}
        <aside className="question-detail-side panel">
          <div className="panel-title">
            <div>
              <h2>Cəhd tarixçəsi</h2>
              <div className="panel-title-sub">Yalnız bu sual üçün</div>
            </div>
          </div>

          <div className="attempt-history-list">
            {attempts.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 0" }}>Hələ cavab verilməyib.</div>
            ) : (
              attempts.map((attempt) => (
                <div key={attempt.id} className="attempt-history-item">
                  <div className="attempt-history-head">
                    <strong>Cəhd #{attempt.attempt_number}</strong>
                    <span className={attempt.is_correct ? "status-correct" : "status-wrong"}>
                      {attempt.is_correct ? "✓ düzgün" : "✗ yanlış"}
                    </span>
                  </div>
                  <div className="attempt-history-meta">+{attempt.points_awarded} xal</div>
                  <div className="attempt-history-answer">
                    {attempt.submitted_answer || "(boş cavab)"}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
