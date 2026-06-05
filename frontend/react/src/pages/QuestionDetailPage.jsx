import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Button from "../components/ui/Button";
import { Chip, DiffBadge } from "../components/ui/Chip";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";
import { getStoredStudyLanguage, pickByLanguage, setStoredStudyLanguage } from "../utils/selfStudyI18n";
import { useLang } from "../contexts/LanguageContext";
import { getMockQuestions } from "../data/mockData";
import TerminalQuestion from "../components/TerminalQuestion";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const TEXT = {
  az: {
    typeClosed: "Çoxseçimli", typeOpen: "Açıq cavab", typeTerminal: "Terminal / Kod",
    levelBeginner: "Başlanğıc", levelIntermediate: "Orta", levelAdvanced: "İrəliləmiş",
    correct: "Düzgün", yourChoice: "Seçiminiz",
    loadError: "Sualı yükləmək mümkün olmadı.",
    chooseOption: "Zəhmət olmasa bir variant seçin.",
    writeAnswer: "Zəhmət olmasa cavabınızı yazın.",
    submitError: "Cavab göndərilə bilmədi.",
    notFound: "Sual tapılmadı.",
    points: "xal", answeredCorrectly: "Düzgün cavablandırıldı", answered: "Cavablandırıldı",
    back: "← Geri qayıt",
    alreadyAnswered: "Bu sualı artıq cavablandırmısınız. Aşağıda öncəki cavabınızı görə bilərsiniz.",
    previousAnswer: "(öncəki cavabınız)",
    terminalPlaceholder: "Əmri/kodu bura yazın...",
    answerPlaceholder: "Cavabınızı bura yazın...",
    correctAnswer: "Düzgün cavab:",
    submitSending: "Göndərilir...", submit: "Cavabı göndər",
    backToList: "Siyahıya qayıt",
    resultCorrect: "Düzgün cavab!", resultWrong: "Yanlış cavab",
    noExtraPoints: "Əvvəlcədən düzgün cavablandırmısınız, əlavə xal yoxdur.",
    pointsAwarded: "xal qazandınız", noPoints: "Bu dəfə xal qazanılmadı.",
    otherQuestions: "Digər suallar",
    explanation: "İzah",
    attemptHistory: "Cəhd tarixçəsi", attemptHistorySub: "Bu sual üzrə",
    noAttempts: "Hələ cavab verilməyib.",
    attempt: "Cəhd", correctShort: "düzgün", wrongShort: "yanlış",
    emptyAnswer: "(boş cavab)",
  },
  en: {
    typeClosed: "Multiple Choice", typeOpen: "Open Answer", typeTerminal: "Terminal / Code",
    levelBeginner: "Beginner", levelIntermediate: "Intermediate", levelAdvanced: "Advanced",
    correct: "Correct", yourChoice: "Your choice",
    loadError: "Could not load the question.",
    chooseOption: "Please select one option.",
    writeAnswer: "Please enter your answer.",
    submitError: "Failed to submit answer.",
    notFound: "Question not found.",
    points: "pts", answeredCorrectly: "Answered correctly", answered: "Answered",
    back: "← Back",
    alreadyAnswered: "You have already answered this question. Review your previous answer below.",
    previousAnswer: "(your previous answer)",
    terminalPlaceholder: "Write your command/code here...",
    answerPlaceholder: "Write your answer here...",
    correctAnswer: "Correct answer:",
    submitSending: "Submitting...", submit: "Submit answer",
    backToList: "Back to list",
    resultCorrect: "Correct answer!", resultWrong: "Wrong answer",
    noExtraPoints: "Already answered correctly — no extra points.",
    pointsAwarded: "points earned", noPoints: "No points earned this time.",
    otherQuestions: "More questions",
    explanation: "Explanation",
    attemptHistory: "Attempt history", attemptHistorySub: "This question only",
    noAttempts: "No answers submitted yet.",
    attempt: "Attempt", correctShort: "correct", wrongShort: "wrong",
    emptyAnswer: "(empty answer)",
  },
};

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { lang, setLang: setGlobalLang } = useLang();
  const setLang = (l) => { setGlobalLang(l); setStoredStudyLanguage(l); };
  const t = pickByLanguage(TEXT, lang);

  const typeLabel  = useMemo(() => ({ closed: t.typeClosed, open: t.typeOpen, terminal: t.typeTerminal }), [t]);
  const levelLabel = useMemo(() => ({ beginner: t.levelBeginner, intermediate: t.levelIntermediate, advanced: t.levelAdvanced }), [t]);

  const [question, setQuestion]         = useState(null);
  const [attempts, setAttempts]         = useState([]);
  const [answerText, setAnswerText]     = useState("");
  const [selectedId, setSelectedId]     = useState(null);
  const [result, setResult]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");
  const [locked, setLocked]             = useState(false);
  const [correctIds, setCorrectIds]     = useState([]);
  const [expectedAnswer, setExpected]   = useState("");


  useEffect(() => {
    setLoading(true); setError(""); setResult(null); setLocked(false);
    setCorrectIds([]); setExpected(""); setSelectedId(null); setAnswerText("");
    endpoints.questionDetail(id).then(({ data }) => {
      setQuestion(data);
      setAttempts(data.attempts || []);
      if (data.has_answered) {
        setLocked(true);
        setCorrectIds(data.correct_choice_ids || []);
        setExpected(data.expected_answer || "");
        const first = (data.attempts || [])[0];
        if (first) {
          setSelectedId(data.question_type === "closed" ? parseInt((first.submitted_answer || "").split(",")[0], 10) || null : null);
          if (data.question_type !== "closed") setAnswerText(first.submitted_answer || "");
        }
      } else {
        setAnswerText(data.question_type === "terminal" ? data.starter_code || "" : "");
      }
    }).catch(() => {
      const mockQ = getMockQuestions().find(q => q.id === Number(id));
      if (mockQ) {
        setQuestion(mockQ);
        if (mockQ.question_type === "terminal") setAnswerText(mockQ.starter_code || "");
      } else {
        setError(t.loadError);
      }
    }).finally(() => setLoading(false));
  }, [id, t.loadError]);

  const submitAnswer = async () => {
    if (!question || locked) return;
    if (question.question_type === "closed" && !selectedId) { setError(t.chooseOption); return; }
    if (question.question_type !== "closed" && !answerText.trim()) { setError(t.writeAnswer); return; }
    setSubmitting(true); setError("");
    const payload = question.question_type === "closed"
      ? { selected_choice_id: selectedId }
      : { answer_text: answerText };
    try {
      const { data } = await endpoints.submitQuestionAnswer(id, payload);
      setResult(data);
      setAttempts(data.attempts || []);
      setCorrectIds(data.correct_choice_ids || []);
      setExpected(data.expected_answer || "");
      setLocked(true);
    } catch (err) {
      setError(err?.response?.data?.detail || t.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="bento">
          <div className="span-8"><TileSkeleton height={420} /></div>
          <div className="span-4"><TileSkeleton height={280} /></div>
        </div>
      </AppShell>
    );
  }

  if (!question && !loading) {
    return (
      <AppShell>
        <Tile>
          <EmptyState icon="◌" title={t.notFound} description=""
            action={<Button as={Link} to="/self-study" variant="accent">{t.backToList}</Button>} />
        </Tile>
      </AppShell>
    );
  }

  const prevAttempt = attempts[0] || null;
  const typeTone = { closed: "sky", open: "mint", terminal: "violet" };

  return (
    <AppShell>
      {/* Back + lang */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate("/self-study")}>{t.back}</Button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[{ v: "az", l: "AZ" }, { v: "en", l: "EN" }].map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => setLang(v)}
              style={{
                padding: "4px 12px", borderRadius: "var(--r-pill)",
                border: `1px solid ${lang === v ? "var(--accent-ring)" : "var(--line-2)"}`,
                background: lang === v ? "var(--accent-soft)" : "var(--bg-card-2)",
                color: lang === v ? "var(--accent)" : "var(--ink-3)",
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, cursor: "pointer",
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      <div className="bento" style={{ alignItems: "start" }}>

        {/* Main question panel */}
        <div className="span-8" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Header */}
          <Tile style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.03) 100%)" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              <DiffBadge level={question.level} />
              <Chip size="sm" tone={typeTone[question.question_type] || "sky"}>
                {typeLabel[question.question_type] || question.question_type}
              </Chip>
              <Chip size="sm" tone="accent">★ {question.points} {t.points}</Chip>
              {locked && (
                <Chip size="sm" tone={prevAttempt?.is_correct ? "mint" : "accent"}>
                  {prevAttempt?.is_correct ? t.answeredCorrectly : t.answered}
                </Chip>
              )}
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.3, marginBottom: 6 }}>
              {question.title}
            </h1>
            {question.course?.title && (
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
                {question.course.title}
              </div>
            )}
          </Tile>

          {/* Prompt */}
          <Tile>
            <div style={{
              fontSize: 15, lineHeight: 1.75, color: "var(--ink-1)",
              whiteSpace: "pre-wrap",
              borderLeft: "3px solid var(--accent-ring)", paddingLeft: 16,
            }}>
              {question.prompt}
            </div>
          </Tile>

          {/* Already answered notice */}
          {locked && !result && (
            <div style={{
              padding: "12px 16px", borderRadius: 12, fontSize: 13,
              background: "rgba(108,179,255,0.08)", border: "1px solid rgba(108,179,255,0.25)",
              color: "var(--c-6)",
            }}>
              {t.alreadyAnswered}
            </div>
          )}

          {/* Choices, textarea, or terminal */}
          <Tile style={question.question_type === "terminal" ? { padding: 0, overflow: "hidden" } : undefined}>
            {question.question_type === "closed" ? (
              <div className="xk-quiz-opts">
                {(question.choices || []).map((choice, index) => {
                  const letter    = OPTION_LETTERS[index] || `${index + 1}`;
                  const isSel     = selectedId === choice.id;
                  const isCorrect = correctIds.includes(choice.id);
                  let cls = "xk-quiz-opt";
                  if (locked) {
                    if (isCorrect) cls += " right";
                    else if (isSel) cls += " wrong";
                    else cls += " dim";
                  } else if (isSel) cls += " sel";
                  return (
                    <button key={choice.id} type="button" className={cls} disabled={locked}
                      onClick={() => !locked && setSelectedId(choice.id)}>
                      <span className="xk-q-key">{letter}</span>
                      <span style={{ flex: 1, lineHeight: 1.5 }}>{choice.text}</span>
                      {locked && isCorrect && (
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#19c37d" strokeWidth={2.5} strokeLinecap="round" className="xk-q-mark">
                          <path d="M5 12l4 4 10-10"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : question.question_type === "terminal" ? (
              <TerminalQuestion
                question={question}
                locked={locked}
                prevAnswer={prevAttempt?.submitted_answer}
                prevCorrect={prevAttempt?.is_correct}
                onAttempt={async (answerText) => {
                  const { data } = await endpoints.submitQuestionAnswer(id, { answer_text: answerText });
                  if (data.is_correct) {
                    setResult(data);
                    setAttempts(data.attempts || []);
                    setCorrectIds(data.correct_choice_ids || []);
                    setExpected(data.expected_answer || "");
                    setLocked(true);
                  }
                  return data;
                }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <textarea
                  rows={5}
                  value={answerText}
                  onChange={(e) => !locked && setAnswerText(e.target.value)}
                  readOnly={locked}
                  placeholder={locked ? t.previousAnswer : t.answerPlaceholder}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "12px 14px", borderRadius: 10, resize: "vertical",
                    background: "var(--bg-elev)", border: "1px solid var(--line)",
                    color: locked ? "var(--ink-3)" : "var(--ink-1)", outline: "none", lineHeight: 1.65,
                    fontSize: 13,
                    opacity: locked ? 0.75 : 1,
                    transition: "border-color var(--dur-1)",
                  }}
                  onFocus={e => { if (!locked) e.target.style.borderColor = "var(--accent-ring)"; }}
                  onBlur={e => { e.target.style.borderColor = "var(--line)"; }}
                />
                {locked && expectedAnswer && (
                  <div style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "rgba(110,255,214,0.08)", border: "1px solid rgba(110,255,214,0.25)",
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ok)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                      {t.correctAnswer}
                    </span>
                    <div style={{ fontSize: 13, color: "var(--ok)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
                      {expectedAnswer}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error + submit only for non-terminal types */}
            {question.question_type !== "terminal" && (
              <>
                {error && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10, marginTop: 10,
                    background: "rgba(255,122,138,0.08)", border: "1px solid rgba(255,122,138,0.28)",
                    fontSize: 12, color: "var(--bad)",
                  }}>
                    {error}
                  </div>
                )}
                {!locked && (
                  <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", justifyContent: "flex-end" }}>
                    <Button variant="ghost" as={Link} to="/self-study">{t.backToList}</Button>
                    <Button variant="accent" onClick={submitAnswer} disabled={submitting}>
                      {submitting ? t.submitSending : t.submit}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Tile>

          {/* Result */}
          {result && (
            <Tile style={{
              border: `1px solid ${result.is_correct ? "rgba(110,255,214,0.30)" : "rgba(255,36,66,0.28)"}`,
              background: result.is_correct ? "rgba(110,255,214,0.06)" : "rgba(255,36,66,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: result.is_correct ? "rgba(110,255,214,0.15)" : "rgba(255,36,66,0.12)",
                  border: `1px solid ${result.is_correct ? "rgba(110,255,214,0.35)" : "rgba(255,36,66,0.30)"}`,
                  display: "grid", placeItems: "center", fontSize: 20,
                  color: result.is_correct ? "var(--ok)" : "var(--accent)",
                }}>
                  {result.is_correct ? "✓" : "✗"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: result.is_correct ? "var(--ok)" : "var(--accent)", marginBottom: 4 }}>
                    {result.is_correct ? t.resultCorrect : t.resultWrong}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                    {result.already_had_correct ? t.noExtraPoints
                      : result.is_correct ? `+${result.points_awarded} ${t.pointsAwarded}` : t.noPoints}
                  </div>
                </div>
              </div>
              {result.explanation && (
                <div style={{
                  marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)",
                  fontSize: 13, lineHeight: 1.7, color: "var(--ink-2)",
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
                    {t.explanation}
                  </div>
                  {result.explanation}
                </div>
              )}
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
                <Button variant="accent" as={Link} to="/self-study">{t.otherQuestions}</Button>
              </div>
            </Tile>
          )}

          {/* Explanation (when already answered, no fresh result) */}
          {locked && !result && question.explanation && (
            <Tile>
              <TileHead eyebrow="Note" title={t.explanation} />
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--ink-2)", margin: 0 }}>
                {question.explanation}
              </p>
            </Tile>
          )}
        </div>

        {/* Attempt history sidebar */}
        <Tile span={4} style={{ position: "sticky", top: 76 }}>
          <TileHead eyebrow={t.attemptHistorySub} title={t.attemptHistory} />
          {attempts.length === 0 ? (
            <EmptyState icon="◌" title={t.noAttempts} description="" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {attempts.map((a) => (
                <div key={a.id} style={{
                  padding: "10px 12px", borderRadius: 10,
                  background: a.is_correct ? "rgba(110,255,214,0.07)" : "rgba(255,36,66,0.07)",
                  border: `1px solid ${a.is_correct ? "rgba(110,255,214,0.22)" : "rgba(255,36,66,0.22)"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
                      {t.attempt} #{a.attempt_number}
                    </span>
                    <span style={{
                      fontWeight: 700, fontFamily: "var(--font-mono)",
                      color: a.is_correct ? "var(--ok)" : "var(--bad)",
                    }}>
                      {a.is_correct ? `✓ ${t.correctShort}` : `✗ ${t.wrongShort}`}
                      {a.points_awarded > 0 && ` · +${a.points_awarded}`}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {a.submitted_answer || t.emptyAnswer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Tile>
      </div>
    </AppShell>
  );
}
