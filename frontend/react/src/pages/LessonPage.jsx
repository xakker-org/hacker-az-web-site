import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Button from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ── Helpers ──────────────────────────────────────────────────── */
function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}
function isYouTube(url) {
  return Boolean(url && (url.includes("youtube.com") || url.includes("youtu.be")));
}

/* ── Quiz modal (video-triggered) ─────────────────────────────── */
function QuizModal({ question, onSubmit, onContinue }) {
  const [selected, setSelected]   = useState(null);
  const [result, setResult]       = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const attempt    = question.user_attempt;
  const answered   = Boolean(result) || Boolean(attempt);
  const isCorrect  = result ? result.is_correct : attempt?.is_correct;
  const correctIds = result?.correct_choice_ids || attempt?.correct_choice_ids || [];

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const data = await onSubmit(question.id, selected);
      setResult(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Overlay */
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(6,8,12,0.82)", backdropFilter: "blur(8px)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "20px 16px", gap: 16,
    }}>
      {/* Card */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--line-2)",
        borderRadius: "var(--r-tile)", boxShadow: "var(--shadow-pop)",
        width: "100%", maxWidth: 560,
        display: "flex", flexDirection: "column", gap: 16,
        padding: 28,
        maxHeight: "calc(100vh - 100px)", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Chip size="sm" tone="accent">Quiz</Chip>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 12,
            color: "var(--accent)", fontWeight: 700,
          }}>
            {question.points} xal
          </span>
        </div>

        {/* Question */}
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.6, margin: 0 }}>
          {question.text}
        </p>

        {/* Choices — prototype xk-quiz-opt */}
        <div className="xk-quiz-opts">
          {(question.choices || []).map((choice, idx) => {
            const letter      = OPTION_LETTERS[idx] || `${idx + 1}`;
            const isSelected  = answered
              ? (result?.selected_choice_id ?? attempt?.selected_choice_id) === choice.id
              : selected === choice.id;
            const isCorrectCh = correctIds.includes(choice.id);

            let cls = "xk-quiz-opt";
            if (answered) {
              if (isCorrectCh) cls += " right";
              else if (isSelected) cls += " wrong";
              else cls += " dim";
            } else if (isSelected) cls += " sel";

            return (
              <button key={choice.id} type="button" className={cls}
                disabled={answered} onClick={() => !answered && setSelected(choice.id)}>
                <span className="xk-q-key">{letter}</span>
                <span style={{ flex: 1 }}>{choice.text}</span>
                {answered && isCorrectCh && (
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#19c37d" strokeWidth={2.5} strokeLinecap="round" className="xk-q-mark">
                    <path d="M5 12l4 4 10-10"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`xk-explain ${isCorrect ? "ok" : "no"}`}>
            <b>{isCorrect ? "Doğru!" : "Düzgün cavab işarələnib."}</b>
            {(result?.explanation || attempt?.explanation) && (
              <span> {result?.explanation || attempt?.explanation}</span>
            )}
          </div>
        )}

        {!answered && (
          <button className="xk-btn primary block" onClick={handleSubmit} disabled={!selected || submitting}>
            {submitting ? "Göndərilir..." : "Yoxla"}
          </button>
        )}
      </div>

      <button className="xk-btn primary" onClick={onContinue}>
        Videoya davam et →
      </button>
    </div>
  );
}

/* ── HTML5 video player ────────────────────────────────────────── */
function Html5Player({ videoUrl, timelineQuestions, onQuestionTrigger, blockedUntil, onReady }) {
  const videoRef = useRef(null);
  const shownRef = useRef(new Set());

  useEffect(() => {
    timelineQuestions.forEach(q => { if (q.user_attempt) shownRef.current.add(q.id); });
  }, [timelineQuestions]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime;
    for (const q of timelineQuestions) {
      if (q.at_seconds != null && !shownRef.current.has(q.id) && t >= q.at_seconds) {
        video.pause();
        shownRef.current.add(q.id);
        onQuestionTrigger(q);
        return;
      }
    }
  }, [timelineQuestions, onQuestionTrigger]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || blockedUntil !== null) return;
    video.play().catch(() => {});
  }, [blockedUntil]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      onTimeUpdate={handleTimeUpdate}
      onCanPlay={() => onReady && onReady(videoRef.current)}
      style={{
        width: "100%", borderRadius: 12,
        background: "#000", display: "block",
        maxHeight: 480,
      }}
    />
  );
}

/* ── YouTube player ────────────────────────────────────────────── */
function YouTubePlayer({ videoId, timelineQuestions, onQuestionTrigger, blockedUntil }) {
  const containerRef = useRef(null);
  const playerRef    = useRef(null);
  const shownRef     = useRef(new Set());
  const pollRef      = useRef(null);

  useEffect(() => {
    timelineQuestions.forEach(q => { if (q.user_attempt) shownRef.current.add(q.id); });
  }, [timelineQuestions]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;
    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { enablejsapi: 1, rel: 0 },
        events: {
          onStateChange: event => {
            if (event.data === 1) {
              pollRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.() ?? 0;
                for (const q of timelineQuestions) {
                  if (q.at_seconds != null && !shownRef.current.has(q.id) && t >= q.at_seconds) {
                    playerRef.current?.pauseVideo?.();
                    shownRef.current.add(q.id);
                    onQuestionTrigger(q);
                    clearInterval(pollRef.current);
                    return;
                  }
                }
              }, 500);
            } else {
              clearInterval(pollRef.current);
            }
          },
        },
      });
    };
    if (window.YT?.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id  = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }
    return () => clearInterval(pollRef.current);
  }, [videoId, timelineQuestions, onQuestionTrigger]);

  useEffect(() => {
    if (blockedUntil === null) playerRef.current?.playVideo?.();
  }, [blockedUntil]);

  return (
    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", background: "#000" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    </div>
  );
}

/* ── Inline question block ─────────────────────────────────────── */
function InlineQuestionBlock({ question, courseSlug, lessonId, onAnswered }) {
  const [selected, setSelected]     = useState(null);
  const [result, setResult]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const attempt    = question.user_attempt;
  const answered   = Boolean(result) || Boolean(attempt);
  const isCorrect  = result ? result.is_correct : attempt?.is_correct;
  const correctIds = result?.correct_choice_ids || attempt?.correct_choice_ids || [];

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true); setError("");
    try {
      const { data } = await endpoints.submitLessonQuestion(courseSlug, lessonId, question.id, {
        selected_choice_id: selected,
      });
      setResult(data);
      if (onAnswered) onAnswered(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Cavab göndərilə bilmədi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tile style={{
      border: answered
        ? `1px solid ${isCorrect ? "rgba(110,255,214,0.28)" : "rgba(255,36,66,0.28)"}`
        : undefined,
      background: answered
        ? (isCorrect ? "rgba(110,255,214,0.04)" : "rgba(255,36,66,0.04)")
        : undefined,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Chip size="sm" tone={answered ? (isCorrect ? "mint" : "accent") : "sky"}>
          {answered ? (isCorrect ? "✓ Düzgün" : "✗ Yanlış") : "Quiz"}
        </Chip>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
          {question.points} xal
        </span>
      </div>

      {/* Question */}
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-1)", lineHeight: 1.6, margin: 0 }}>
        {question.text}
      </p>

      {/* Choices */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {(question.choices || []).map((choice, idx) => {
          const letter      = OPTION_LETTERS[idx];
          const isSelected  = answered
            ? (result?.selected_choice_id ?? attempt?.selected_choice_id) === choice.id
            : selected === choice.id;
          const isCorrectCh = correctIds.includes(choice.id);

          let bg = "var(--bg-card-2)", border = "var(--line)", color = "var(--ink-2)";
          if (answered) {
            if (isCorrectCh)     { bg = "rgba(110,255,214,0.10)"; border = "rgba(110,255,214,0.30)"; color = "var(--ok)"; }
            else if (isSelected) { bg = "rgba(255,122,138,0.10)"; border = "rgba(255,122,138,0.30)"; color = "var(--bad)"; }
            else                 { bg = "var(--bg-card-2)"; border = "var(--line)"; color = "var(--ink-4)"; }
          } else if (isSelected) { bg = "var(--accent-soft)"; border = "var(--accent-ring)"; color = "var(--ink-1)"; }

          return (
            <button
              key={choice.id}
              type="button"
              disabled={answered}
              onClick={() => !answered && setSelected(choice.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 10,
                background: bg, border: `1px solid ${border}`, color,
                cursor: answered ? "default" : "pointer",
                fontSize: 13, textAlign: "left", fontFamily: "inherit",
                transition: "all var(--dur-1)",
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                display: "grid", placeItems: "center",
                background: "var(--bg-elev)", border: `1px solid ${border}`, color: "var(--ink-4)",
              }}>
                {letter}
              </span>
              <span style={{ flex: 1 }}>{choice.text}</span>
              {answered && isCorrectCh && <Chip size="sm" tone="mint">✓</Chip>}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: 10,
          background: "rgba(255,122,138,0.08)", border: "1px solid rgba(255,122,138,0.28)",
          fontSize: 12, color: "var(--bad)",
        }}>
          {error}
        </div>
      )}

      {answered ? (
        <div>
          {(result?.explanation || attempt?.explanation) && (
            <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.65, margin: 0 }}>
              💡 {result?.explanation || attempt?.explanation}
            </p>
          )}
          {attempt && !result && (
            <p style={{ fontSize: 12, color: "var(--ink-4)", margin: 0 }}>
              Bu suala artıq cavab vermişdiniz.
            </p>
          )}
        </div>
      ) : (
        <div style={{ paddingTop: 4 }}>
          <Button variant="accent" size="sm" onClick={handleSubmit} disabled={!selected || submitting}>
            {submitting ? "Göndərilir..." : "Cavabı göndər"}
          </Button>
        </div>
      )}
    </Tile>
  );
}

/* ── Main LessonPage ───────────────────────────────────────────── */
export default function LessonPage() {
  const { slug, lessonId } = useParams();
  const [lesson, setLesson]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [completed, setCompleted]   = useState(false);
  const [completing, setCompleting] = useState(false);

  const [activeQuestion, setActiveQuestion] = useState(null);
  const [blockedUntil, setBlockedUntil]     = useState(null);

  useEffect(() => {
    setLoading(true);
    endpoints.lessonDetail(slug, lessonId)
      .then(({ data }) => { setLesson(data); setCompleted(data.user_completed || false); })
      .catch(() => setError("Dərs yüklənə bilmədi."))
      .finally(() => setLoading(false));
  }, [slug, lessonId]);

  const handleQuestionTrigger = useCallback(q => {
    setActiveQuestion(q); setBlockedUntil(q.id);
  }, []);

  const handleModalSubmit = useCallback(async (questionId, selectedChoiceId) => {
    try {
      const { data } = await endpoints.submitLessonQuestion(slug, lessonId, questionId, {
        selected_choice_id: selectedChoiceId,
      });
      if (data.lesson_completed) setCompleted(true);
      return data;
    } catch (err) {
      return { error: err?.response?.data?.detail || "Xəta baş verdi." };
    }
  }, [slug, lessonId]);

  const handleModalContinue = useCallback(() => {
    setActiveQuestion(null); setBlockedUntil(null);
  }, []);

  const handleInlineAnswered = useCallback(data => {
    if (data.lesson_completed) setCompleted(true);
  }, []);

  const handleMarkComplete = async () => {
    setCompleting(true);
    try {
      await endpoints.completeLesson(slug, lessonId);
      setCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TileSkeleton height={80} />
          <TileSkeleton height={320} />
          <TileSkeleton height={180} />
        </div>
      </AppShell>
    );
  }

  if (error || !lesson) {
    return (
      <AppShell>
        <Tile>
          <EmptyState icon="◌" title="Dərs tapılmadı" description={error || ""}
            action={<Button as={Link} to={`/courses/${slug}`} variant="accent">← Kursa qayıt</Button>} />
        </Tile>
      </AppShell>
    );
  }

  const questions    = lesson.lesson_questions || [];
  const timelineQs   = questions.filter(q => q.at_seconds != null && q.at_seconds !== undefined);
  const inlineQs     = questions.filter(q => q.at_seconds == null || q.at_seconds === undefined);
  const ytId         = isYouTube(lesson.video_url) ? extractYouTubeId(lesson.video_url) : null;
  const hasNoQuestions = questions.length === 0;

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Link to="/courses"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}>
          Kurslar
        </Link>
        <span style={{ color: "var(--line-3)" }}>›</span>
        <Link to={`/courses/${slug}`}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", textDecoration: "none" }}>
          Kurs
        </Link>
        <span style={{ color: "var(--line-3)" }}>›</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-1)", fontWeight: 600 }}>
          {lesson.title}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Lesson header */}
        <Tile>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.25 }}>
              {lesson.title}
            </h1>
            {completed && <Chip size="sm" tone="mint">✓ Tamamlandı</Chip>}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {lesson.has_video    && <Chip size="sm">▶ Video</Chip>}
            {lesson.has_text     && <Chip size="sm">≡ Mətn</Chip>}
            {questions.length > 0 && <Chip size="sm" tone="sky">{questions.length} quiz</Chip>}
            {timelineQs.length  > 0 && (
              <Chip size="sm" tone="amber">⏱ {timelineQs.length} video quiz</Chip>
            )}
          </div>
        </Tile>

        {/* Video section */}
        {lesson.video_url && (
          <Tile pad="sm">
            {ytId ? (
              <YouTubePlayer
                videoId={ytId}
                timelineQuestions={timelineQs}
                onQuestionTrigger={handleQuestionTrigger}
                blockedUntil={blockedUntil}
              />
            ) : (
              <Html5Player
                videoUrl={lesson.video_url}
                timelineQuestions={timelineQs}
                onQuestionTrigger={handleQuestionTrigger}
                blockedUntil={blockedUntil}
              />
            )}
            {timelineQs.length > 0 && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,184,107,0.08)", border: "1px solid rgba(255,184,107,0.25)",
                fontSize: 12, color: "var(--warn)", marginTop: 4,
              }}>
                ⏱ Bu videoda {timelineQs.length} quiz var — video müəyyən anlarda avtomatik dayanacaq.
              </div>
            )}
          </Tile>
        )}

        {/* Text content */}
        {lesson.content && (
          <Tile>
            <div
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </Tile>
        )}

        {/* Inline quiz questions */}
        {inlineQs.length > 0 && (
          <div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-4)",
              marginBottom: 12,
            }}>
              Quiz Sualları
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {inlineQs.map(q => (
                <InlineQuestionBlock
                  key={q.id}
                  question={q}
                  courseSlug={slug}
                  lessonId={lessonId}
                  onAnswered={handleInlineAnswered}
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <Tile style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <Button variant="ghost" as={Link} to={`/courses/${slug}`}>
              ← Kursa qayıt
            </Button>
            <div style={{ display: "flex", gap: 8 }}>
              {hasNoQuestions && !completed && (
                <Button variant="accent" onClick={handleMarkComplete} disabled={completing}>
                  {completing ? "..." : "✓ Tamamlandı kimi işarələ"}
                </Button>
              )}
              {completed && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: "rgba(110,255,214,0.08)", border: "1px solid rgba(110,255,214,0.25)",
                  color: "var(--ok)",
                }}>
                  ✓ Bu dərs tamamlandı
                </span>
              )}
            </div>
          </div>
        </Tile>

      </div>

      {/* Video quiz modal */}
      {activeQuestion && (
        <QuizModal
          question={activeQuestion}
          onSubmit={handleModalSubmit}
          onContinue={handleModalContinue}
        />
      )}
    </AppShell>
  );
}
