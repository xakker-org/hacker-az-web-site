import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { clearTokens, getAccessToken } from "../utils/tokens";
import "../styles/exam.css";

const emptyAnswer = { question_id: null, selected_choice: null, text_answer: "" };

export default function ExamAttemptPage() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/auth/login");
      return;
    }

    let mounted = true;

    const loadExam = async () => {
      try {
        const [examResponse, attemptResponse] = await Promise.all([
          api.get(`/courses/exams/${slug}/`),
          api.post(`/courses/exams/${slug}/attempts/`, {}),
        ]);

        if (!mounted) {
          return;
        }

        setExam(examResponse.data);
        setAttempt(attemptResponse.data);

        const initialAnswers = {};
        (examResponse.data.questions || []).forEach((entry) => {
          const question = entry.question;
          initialAnswers[question.id] = {
            question_id: question.id,
            selected_choice: null,
            text_answer: question.starter_code || "",
          };
        });
        setAnswers(initialAnswers);
        setSecondsLeft((examResponse.data.time_limit_minutes || 0) * 60);
      } catch (requestError) {
        if (!mounted) {
          return;
        }
        setError("İmtahan açılmadı. Sessiyanı yenilə və ya yenidən daxil ol.");
        clearTokens();
        navigate("/auth/login");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadExam();

    return () => {
      mounted = false;
    };
  }, [navigate, slug]);

  useEffect(() => {
    if (!exam) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [exam]);

  const questionEntries = exam?.questions || [];
  const activeEntry = questionEntries[activeQuestionIndex];
  const activeQuestion = activeEntry?.question;

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  const updateAnswer = (questionId, patch) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: {
        ...(current[questionId] || emptyAnswer),
        question_id: questionId,
        ...patch,
      },
    }));
  };

  const submitExam = async () => {
    if (!exam || saving) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        attempt: attempt?.id,
        answers: Object.values(answers),
      };
      const { data } = await api.post(`/courses/exams/${slug}/submit/`, payload);
      setResult(data);
      setAttempt(data);
    } catch (requestError) {
      setError("Cavablar göndərilmədi. Yenidən cəhd et.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="exam-shell exam-loading">
        <div className="loading">İmtahan mühiti hazırlanır...</div>
      </div>
    );
  }

  if (!exam || !activeQuestion) {
    return (
      <div className="exam-shell exam-loading">
        <div className="loading">İmtahan tapılmadı.</div>
      </div>
    );
  }

  const currentAnswer = answers[activeQuestion.id] || emptyAnswer;

  return (
    <div className="exam-shell">
      <header className="exam-topbar">
        <div>
          <Link to="/dashboard" className="exam-back-link">
            ← Kabinetə qayıt
          </Link>
          <h1>{exam.title}</h1>
          <p>{exam.course?.title}</p>
        </div>
        <div className="exam-topbar-meta">
          <div className="timer-card">
            <span className="timer-label">Time left</span>
            <strong>{formattedTime}</strong>
          </div>
          <button className="btn btn-primary" onClick={submitExam} disabled={saving}>
            {saving ? "Göndərilir..." : "Submit exam"}
          </button>
        </div>
      </header>

      {error && <div className="exam-banner error">{error}</div>}
      {result && (
        <div className="exam-banner success">
          Score: {result.score_percent}% {result.review_pending ? " • review pending for open answers" : ""}
        </div>
      )}

      <div className="exam-layout">
        <aside className="exam-sidebar card soft-card">
          <div className="exam-sidebar-section">
            <span className="pill pill-soft">{exam.level}</span>
            <span className="pill pill-accent">{exam.time_limit_minutes} min</span>
          </div>
          <div className="question-list">
            {questionEntries.map((entry, index) => (
              <button
                key={entry.id}
                className={`question-step ${index === activeQuestionIndex ? "active" : ""}`}
                onClick={() => setActiveQuestionIndex(index)}
              >
                <span>Q{index + 1}</span>
                <small>{entry.question.question_type}</small>
              </button>
            ))}
          </div>
          <div className="exam-help">
            <h3>Question types</h3>
            <p>Closed questions are auto-graded. Open and terminal answers stay review-friendly.</p>
          </div>
        </aside>

        <main className="exam-main card soft-card">
          <div className="exam-question-header">
            <div>
              <span className="pill pill-soft">{activeQuestion.question_type}</span>
              <span className="pill pill-accent">{activeQuestion.level}</span>
            </div>
            <div className="exam-progress">
              Question {activeQuestionIndex + 1} of {questionEntries.length}
            </div>
          </div>

          <h2>{activeQuestion.title}</h2>
          <p className="exam-prompt">{activeQuestion.prompt}</p>

          {activeQuestion.question_type === "closed" ? (
            <div className="choice-grid">
              {(activeQuestion.choices || []).map((choice) => {
                const selected = currentAnswer.selected_choice === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={`choice-card ${selected ? "selected" : ""}`}
                    onClick={() => updateAnswer(activeQuestion.id, { selected_choice: choice.id })}
                  >
                    <span className="choice-dot">{selected ? "●" : "○"}</span>
                    <span>{choice.text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="terminal-panel">
              <div className="terminal-header">
                <span>Terminal workspace</span>
                <span>{activeQuestion.question_type === "terminal" ? "code mode" : "open answer mode"}</span>
              </div>
              {activeQuestion.starter_code && (
                <pre className="starter-block">{activeQuestion.starter_code}</pre>
              )}
              <textarea
                className="terminal-input"
                rows="12"
                value={currentAnswer.text_answer}
                onChange={(event) => updateAnswer(activeQuestion.id, { text_answer: event.target.value })}
                placeholder={
                  activeQuestion.question_type === "terminal"
                    ? "Burada kod yaz və ya terminal nəticəsini təsvir et..."
                    : "Açıq cavabını burada yaz..."
                }
              />
            </div>
          )}

          <div className="exam-navigation">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveQuestionIndex((index) => Math.max(index - 1, 0))}
              disabled={activeQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setActiveQuestionIndex((index) => Math.min(index + 1, questionEntries.length - 1))}
              disabled={activeQuestionIndex === questionEntries.length - 1}
            >
              Next
            </button>
          </div>
        </main>

        <aside className="exam-terminal card soft-card">
          <h3>Workspace</h3>
          <p>
            Bu panel terminal hissini verir. Terminal sualları üçün eyni paneldə kod və ya addım-addım
            cavab yazırsan.
          </p>
          <div className="workspace-panel">
            <div className="workspace-line">$ question_type: {activeQuestion.question_type}</div>
            <div className="workspace-line">$ points: {activeQuestion.points}</div>
            <div className="workspace-line">$ status: ready</div>
          </div>
          <div className="workspace-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => updateAnswer(activeQuestion.id, { text_answer: activeQuestion.starter_code || "" })}
            >
              Reset draft
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={submitExam}
              disabled={saving}
            >
              Save & submit
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
