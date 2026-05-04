import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { getStoredStudyLanguage, pickByLanguage, setStoredStudyLanguage } from "../utils/selfStudyI18n";
import "../styles/self-study.css";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const TEXT = {
  az: {
    pageTitle: "Sərbəst Tədris • Sual",
    typeClosed: "Çoxseçimli",
    typeOpen: "Açıq cavab",
    typeTerminal: "Terminal / Kod",
    levelBeginner: "Başlanğıc",
    levelIntermediate: "Orta",
    levelAdvanced: "İrəliləmiş",
    correct: "Düzgün",
    yourChoice: "Seçiminiz",
    loadError: "Sualı yükləmək mümkün olmadı.",
    chooseOption: "Zəhmət olmasa bir variant seçin.",
    writeAnswer: "Zəhmət olmasa cavabınızı yazın.",
    submitError: "Cavab göndərilə bilmədi.",
    loading: "Sual yüklənir...",
    notFound: "Sual tapılmadı.",
    points: "xal",
    answeredCorrectly: "Düzgün cavablandırıldı",
    answered: "Cavablandırıldı",
    back: "← Geri qayıt",
    alreadyAnswered: "Bu sualı artıq cavablandırmısınız. Aşağıda öncəki cavabınızı, düzgün cavabı və izahı görə bilərsiniz.",
    previousAnswer: "(öncəki cavabınız)",
    terminalPlaceholder: "Əmri/kodu bura yazın...",
    answerPlaceholder: "Cavabınızı bura yazın...",
    correctAnswer: "Düzgün cavab:",
    submitSending: "Göndərilir...",
    submit: "Cavabı göndər",
    backToList: "Siyahıya qayıt",
    resultCorrect: "Düzgün cavab!",
    resultWrong: "Yanlış cavab",
    noExtraPoints: "Bu sualı daha əvvəl düzgün cavablandırmısınız, əlavə xal verilmir.",
    pointsAwarded: "xal qazandınız",
    noPoints: "Bu dəfə xal qazanılmadı.",
    otherQuestions: "Digər suallar",
    explanation: "İzah",
    attemptHistory: "Cəhd tarixçəsi",
    attemptHistorySub: "Yalnız bu sual üzrə",
    noAttempts: "Hələ cavab verilməyib.",
    attempt: "Cəhd",
    correctShort: "düzgün",
    wrongShort: "yanlış",
    emptyAnswer: "(boş cavab)",
    languageLabel: "Dil",
  },
  en: {
    pageTitle: "Self Study • Question",
    typeClosed: "Multiple Choice",
    typeOpen: "Open Answer",
    typeTerminal: "Terminal / Code",
    levelBeginner: "Beginner",
    levelIntermediate: "Intermediate",
    levelAdvanced: "Advanced",
    correct: "Correct",
    yourChoice: "Your choice",
    loadError: "Could not load the question.",
    chooseOption: "Please select one option.",
    writeAnswer: "Please enter your answer.",
    submitError: "Failed to submit answer.",
    loading: "Loading question...",
    notFound: "Question not found.",
    points: "pts",
    answeredCorrectly: "Answered correctly",
    answered: "Answered",
    back: "← Back",
    alreadyAnswered: "You have already answered this question. You can review your previous answer, the correct answer, and explanation below.",
    previousAnswer: "(your previous answer)",
    terminalPlaceholder: "Write your command/code here...",
    answerPlaceholder: "Write your answer here...",
    correctAnswer: "Correct answer:",
    submitSending: "Submitting...",
    submit: "Submit answer",
    backToList: "Back to list",
    resultCorrect: "Correct answer!",
    resultWrong: "Wrong answer",
    noExtraPoints: "You already answered this question correctly before, so no extra points are awarded.",
    pointsAwarded: "points earned",
    noPoints: "No points were earned this time.",
    otherQuestions: "More questions",
    explanation: "Explanation",
    attemptHistory: "Attempt history",
    attemptHistorySub: "For this question only",
    noAttempts: "No answers submitted yet.",
    attempt: "Attempt",
    correctShort: "correct",
    wrongShort: "wrong",
    emptyAnswer: "(empty answer)",
    languageLabel: "Language",
  },
};

function ChoiceList({ choices, selectedId, correctIds, onSelect, locked, t }) {
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
            {locked && isCorrect && <span className="q-choice-badge correct-badge">{t.correct}</span>}
            {locked && isSelected && !isCorrect && <span className="q-choice-badge wrong-badge">{t.yourChoice}</span>}
          </label>
        );
      })}
    </div>
  );
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lang, setLang] = useState(getStoredStudyLanguage);
  const t = pickByLanguage(TEXT, lang);

  const typeLabel = useMemo(
    () => ({
      closed: t.typeClosed,
      open: t.typeOpen,
      terminal: t.typeTerminal,
    }),
    [t.typeClosed, t.typeOpen, t.typeTerminal],
  );

  const levelLabel = useMemo(
    () => ({
      beginner: t.levelBeginner,
      intermediate: t.levelIntermediate,
      advanced: t.levelAdvanced,
    }),
    [t.levelBeginner, t.levelIntermediate, t.levelAdvanced],
  );

  const [question, setQuestion] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [answerText, setAnswerText] = useState("");
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [locked, setLocked] = useState(false);
  const [correctChoiceIds, setCorrectChoiceIds] = useState([]);
  const [expectedAnswer, setExpectedAnswer] = useState("");

  useEffect(() => {
    setStoredStudyLanguage(lang);
  }, [lang]);

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
                ? parseInt((first.submitted_answer || "").split(",")[0], 10) || null
                : null,
            );
            if (data.question_type !== "closed") setAnswerText(first.submitted_answer || "");
          }
        } else {
          setAnswerText(data.question_type === "terminal" ? data.starter_code || "" : "");
        }
      })
      .catch(() => setError(t.loadError))
      .finally(() => setLoading(false));
  }, [id, t.loadError]);

  const submitAnswer = async () => {
    if (!question || locked) return;

    if (question.question_type === "closed" && !selectedChoiceId) {
      setError(t.chooseOption);
      return;
    }
    if (question.question_type !== "closed" && !answerText.trim()) {
      setError(t.writeAnswer);
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
      const message = err?.response?.data?.detail || t.submitError;
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const extraTopbar = (
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
  );

  if (loading) {
    return (
      <AppShell title={t.pageTitle} extraTopbar={extraTopbar}>
        <div className="loading-block">{t.loading}</div>
      </AppShell>
    );
  }

  if (!question) {
    return (
      <AppShell title={t.pageTitle} extraTopbar={extraTopbar}>
        <div className="empty-state panel">{t.notFound}</div>
      </AppShell>
    );
  }

  const previousAttempt = attempts[0] || null;
  const levelClass = {
    beginner: "chip-mint",
    intermediate: "chip-amber",
    advanced: "chip-accent",
  }[question.level] || "chip";

  return (
    <AppShell title={t.pageTitle} extraTopbar={extraTopbar}>
      <section className="question-detail-layout">
        <main className="question-detail-main panel">
          <div className="question-head">
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <span className={`chip ${levelClass}`}>{levelLabel[question.level] || question.level}</span>
                <span className="chip">{typeLabel[question.question_type] || question.question_type}</span>
                <span className="chip chip-blue">{question.points} {t.points}</span>
                {locked && (
                  <span className={`chip ${previousAttempt?.is_correct ? "chip-mint" : "chip-accent"}`}>
                    {previousAttempt?.is_correct ? t.answeredCorrectly : t.answered}
                  </span>
                )}
              </div>
              <h1>{question.title}</h1>
              <p style={{ marginTop: 4, color: "var(--ink-3)" }}>{question.course?.title}</p>
            </div>
            <div className="question-head-actions">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("/self-study")}>
                {t.back}
              </button>
            </div>
          </div>

          <div className="question-prompt panel" style={{ marginBottom: 18, fontSize: 15, lineHeight: 1.7 }}>
            {question.prompt}
          </div>

          {locked && !result && (
            <div className="alert alert-info" style={{ marginBottom: 12 }}>
              {t.alreadyAnswered}
            </div>
          )}

          {question.question_type === "closed" ? (
            <ChoiceList
              choices={question.choices || []}
              selectedId={selectedChoiceId}
              correctIds={locked ? correctChoiceIds : []}
              onSelect={setSelectedChoiceId}
              locked={locked}
              t={t}
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
                    ? t.previousAnswer
                    : question.question_type === "terminal"
                    ? t.terminalPlaceholder
                    : t.answerPlaceholder
                }
                style={locked ? { opacity: 0.7, cursor: "default" } : undefined}
              />
              {locked && expectedAnswer && (
                <div className="correct-answer-box">
                  <span className="correct-answer-label">{t.correctAnswer}</span>
                  <span className="correct-answer-text">{expectedAnswer}</span>
                </div>
              )}
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          {!locked && (
            <div className="question-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitAnswer}
                disabled={submitting}
              >
                {submitting ? t.submitSending : t.submit}
              </button>
              <Link to="/self-study" className="btn btn-secondary">
                {t.backToList}
              </Link>
            </div>
          )}

          {result && (
            <div className={`question-result panel ${result.is_correct ? "result-correct" : "result-wrong"}`}>
              <div className="result-header">
                <span className={`result-icon ${result.is_correct ? "correct" : "wrong"}`}>
                  {result.is_correct ? "✓" : "✗"}
                </span>
                <div>
                  <h3>{result.is_correct ? t.resultCorrect : t.resultWrong}</h3>
                  <p style={{ marginTop: 4 }}>
                    {result.already_had_correct
                      ? t.noExtraPoints
                      : result.is_correct
                      ? `+${result.points_awarded} ${t.pointsAwarded}`
                      : t.noPoints}
                  </p>
                </div>
              </div>
              {result.explanation && <div className="question-explanation">{result.explanation}</div>}
              {question.question_type !== "closed" && result.is_correct === false && expectedAnswer && (
                <div className="correct-answer-box">
                  <span className="correct-answer-label">{t.correctAnswer}</span>
                  <span className="correct-answer-text">{expectedAnswer}</span>
                </div>
              )}
              <div className="question-actions" style={{ marginTop: 12 }}>
                <Link to="/self-study" className="btn btn-primary">
                  {t.otherQuestions}
                </Link>
              </div>
            </div>
          )}

          {locked && !result && question.explanation && (
            <div className="panel" style={{ marginTop: 14, borderColor: "var(--line-3)" }}>
              <h4 style={{ marginBottom: 8 }}>{t.explanation}</h4>
              <p style={{ lineHeight: 1.7 }}>{question.explanation}</p>
            </div>
          )}
        </main>

        <aside className="question-detail-side panel">
          <div className="panel-title">
            <div>
              <h2>{t.attemptHistory}</h2>
              <div className="panel-title-sub">{t.attemptHistorySub}</div>
            </div>
          </div>

          <div className="attempt-history-list">
            {attempts.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 0" }}>{t.noAttempts}</div>
            ) : (
              attempts.map((attempt) => (
                <div key={attempt.id} className="attempt-history-item">
                  <div className="attempt-history-head">
                    <strong>{t.attempt} #{attempt.attempt_number}</strong>
                    <span className={attempt.is_correct ? "status-correct" : "status-wrong"}>
                      {attempt.is_correct ? `✓ ${t.correctShort}` : `✗ ${t.wrongShort}`}
                    </span>
                  </div>
                  <div className="attempt-history-meta">+{attempt.points_awarded} {t.points}</div>
                  <div className="attempt-history-answer">
                    {attempt.submitted_answer || t.emptyAnswer}
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
