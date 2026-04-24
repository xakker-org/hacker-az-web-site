import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const typeLabel = {
  closed: "Multiple choice",
  open: "Open text",
  terminal: "Terminal/code",
};

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

  const loadQuestion = () => {
    setLoading(true);
    setError("");
    endpoints
      .questionDetail(id)
      .then(({ data }) => {
        setQuestion(data);
        setAttempts(data.attempts || []);
        setSelectedChoiceId(null);
        setAnswerText(data.question_type === "terminal" ? (data.starter_code || "") : "");
      })
      .catch(() => setError("Question details could not be loaded."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const previousAttempts = useMemo(() => attempts.slice(1), [attempts]);

  const submitAnswer = async () => {
    if (!question) return;

    if (question.question_type === "closed" && !selectedChoiceId) {
      setError("Bu sual ucun variant secmelisiniz.");
      return;
    }
    if (question.question_type !== "closed" && !answerText.trim()) {
      setError("Bu sual ucun yazili cavab daxil edin.");
      return;
    }

    setSubmitting(true);
    setError("");
    setResult(null);

    const payload =
      question.question_type === "closed"
        ? { selected_choice_id: selectedChoiceId }
        : { answer_text: answerText };

    try {
      const { data } = await endpoints.submitQuestionAnswer(id, payload);
      setResult(data);
      setAttempts(data.attempts || []);
      if (data.is_correct) {
        setAnswerText("");
        setSelectedChoiceId(null);
      }
    } catch (requestError) {
      const message = requestError?.response?.data?.detail || "Answer submit failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <AppShell title="Question"><div className="loading-block">Loading question...</div></AppShell>;
  }

  if (!question) {
    return <AppShell title="Question"><div className="empty-state panel">Question not found.</div></AppShell>;
  }

  return (
    <AppShell title="Question Detail">
      <section className="question-detail-layout">
        <main className="question-detail-main panel">
          <div className="question-head">
            <div>
              <span className="chip chip-accent">{question.level}</span>
              <h1>{question.title}</h1>
              <p>{question.course?.title} • {typeLabel[question.question_type] || question.question_type} • {question.points} pts</p>
            </div>
            <div className="question-head-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/self-study")}>Back</button>
            </div>
          </div>

          <div className="question-prompt panel">{question.prompt}</div>

          {question.question_type === "closed" ? (
            <div className="question-choices">
              {(question.choices || []).map((choice, index) => {
                const optionLabel = OPTION_LETTERS[index] || `${index + 1}`;
                return (
                <label key={choice.id} className={`q-choice ${selectedChoiceId === choice.id ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="selectedChoice"
                    checked={selectedChoiceId === choice.id}
                    onChange={() => setSelectedChoiceId(choice.id)}
                  />
                  <span className="q-choice-letter" aria-hidden="true">{optionLabel}</span>
                  <span className="q-choice-text">{choice.text}</span>
                </label>
                );
              })}
            </div>
          ) : (
            <div className="question-answer-area">
              <textarea
                className="q-input"
                rows={question.question_type === "terminal" ? "8" : "6"}
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                placeholder={question.question_type === "terminal" ? "Type command/code here..." : "Write your answer here..."}
              />
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <div className="question-actions">
            <button type="button" className="btn btn-primary" onClick={submitAnswer} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Answer"}
            </button>
            <Link to="/self-study" className="btn btn-secondary">Go to list</Link>
          </div>

          {result && (
            <div className={`question-result panel ${result.is_correct ? "result-correct" : "result-wrong"}`}>
              <h3>{result.is_correct ? "Correct! ✓" : "Incorrect ✗"}</h3>
              <p>Attempt #{result.attempt_number} • Points earned: {result.points_awarded}</p>
              {result.explanation && <p className="question-explanation">{result.explanation}</p>}
              {previousAttempts.length > 0 && <p>This was not your first try. Previous attempts are shown on the right.</p>}
              <div className="question-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={loadQuestion}>Try again</button>
              </div>
            </div>
          )}
        </main>

        <aside className="question-detail-side panel">
          <div className="panel-title">
            <div>
              <h2>Attempt history</h2>
              <div className="panel-title-sub">This question only</div>
            </div>
          </div>

          <div className="attempt-history-list">
            {attempts.length === 0 ? (
              <div className="empty-state">No attempts yet.</div>
            ) : (
              attempts.map((attempt) => (
                <div key={attempt.id} className="attempt-history-item">
                  <div className="attempt-history-head">
                    <strong>Try #{attempt.attempt_number}</strong>
                    <span className={attempt.is_correct ? "status-correct" : "status-wrong"}>
                      {attempt.is_correct ? "correct" : "wrong"}
                    </span>
                  </div>
                  <div className="attempt-history-meta">+{attempt.points_awarded} pts</div>
                  <div className="attempt-history-answer">{attempt.submitted_answer || "(empty answer)"}</div>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
