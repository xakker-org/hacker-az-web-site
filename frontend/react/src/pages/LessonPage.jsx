import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// --- YouTube URL helpers ---
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function isYouTube(url) {
  return Boolean(url && (url.includes("youtube.com") || url.includes("youtu.be")));
}

// --- Quiz Modal ---
function QuizModal({ question, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // If locked (already answered), show read-only view immediately
  const attempt = question.user_attempt;

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

  const correctIds = result?.correct_choice_ids || attempt?.correct_choice_ids || [];
  const answered = Boolean(result) || Boolean(attempt);
  const isCorrect = result ? result.is_correct : attempt?.is_correct;

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <div className="quiz-modal-header">
          <span className="quiz-modal-badge">Quiz</span>
          <span className="quiz-modal-pts">{question.points} xal</span>
        </div>

        <p className="quiz-modal-question">{question.text}</p>

        <div className="quiz-modal-choices">
          {(question.choices || []).map((choice, idx) => {
            const letter = OPTION_LETTERS[idx] || `${idx + 1}`;
            const isSelected = answered
              ? (result?.selected_choice_id ?? attempt?.selected_choice_id) === choice.id
              : selected === choice.id;
            const isCorrectChoice = correctIds.includes(choice.id);

            let cls = "qm-choice";
            if (answered) {
              if (isCorrectChoice) cls += " qm-correct";
              else if (isSelected) cls += " qm-wrong";
              else cls += " qm-dimmed";
            } else if (isSelected) {
              cls += " qm-selected";
            }

            return (
              <button
                key={choice.id}
                type="button"
                className={cls}
                onClick={() => !answered && setSelected(choice.id)}
                disabled={answered}
              >
                <span className="qm-letter">{letter}</span>
                <span className="qm-text">{choice.text}</span>
                {answered && isCorrectChoice && <span className="qm-tag correct">✓ Düzgün</span>}
                {answered && isSelected && !isCorrectChoice && <span className="qm-tag wrong">Seçdiniz</span>}
              </button>
            );
          })}
        </div>

        {answered ? (
          <div className={`quiz-modal-result ${isCorrect ? "correct" : "wrong"}`}>
            <div className="quiz-result-row">
              <span>{isCorrect ? "✓ Düzgün cavab!" : "✗ Yanlış cavab"}</span>
              <span>
                {result?.points_awarded > 0
                  ? `+${result.points_awarded} xal`
                  : attempt?.points_awarded > 0
                  ? `+${attempt.points_awarded} xal (əvvəl qazanılıb)`
                  : "xal verilmir"}
              </span>
            </div>
            {(result?.explanation || attempt?.explanation) && (
              <p className="quiz-explanation">{result?.explanation || attempt?.explanation}</p>
            )}
            {attempt && !result && (
              <p className="quiz-already-note">Bu suala artıq cavab vermişdiniz.</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? "Göndərilir..." : "Cavabı göndər"}
          </button>
        )}
      </div>
    </div>
  );
}

// --- HTML5 Video Player ---
function Html5Player({ videoUrl, timelineQuestions, onQuestionTrigger, blockedUntil, onReady }) {
  const videoRef = useRef(null);
  const shownRef = useRef(new Set());

  useEffect(() => {
    const existing = shownRef.current;
    // Pre-mark already-answered questions so they don't interrupt again
    timelineQuestions.forEach((q) => {
      if (q.user_attempt) existing.add(q.id);
    });
  }, [timelineQuestions]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime;
    for (const q of timelineQuestions) {
      if (q.at_seconds !== null && q.at_seconds !== undefined && !shownRef.current.has(q.id)) {
        if (t >= q.at_seconds) {
          video.pause();
          shownRef.current.add(q.id);
          onQuestionTrigger(q);
          return;
        }
      }
    }
  }, [timelineQuestions, onQuestionTrigger]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (blockedUntil === null) {
      // Unblocked — resume
      video.play().catch(() => {});
    }
  }, [blockedUntil]);

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      controls
      className="lesson-video"
      onTimeUpdate={handleTimeUpdate}
      onCanPlay={() => onReady && onReady(videoRef.current)}
    />
  );
}

// --- YouTube Player ---
function YouTubePlayer({ videoId, timelineQuestions, onQuestionTrigger, blockedUntil }) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const shownRef = useRef(new Set());
  const pollRef = useRef(null);

  useEffect(() => {
    // Pre-mark answered questions
    timelineQuestions.forEach((q) => {
      if (q.user_attempt) shownRef.current.add(q.id);
    });
  }, [timelineQuestions]);

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    const initPlayer = () => {
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { enablejsapi: 1, rel: 0 },
        events: {
          onStateChange: (event) => {
            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              pollRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime?.() ?? 0;
                for (const q of timelineQuestions) {
                  if (q.at_seconds !== null && q.at_seconds !== undefined && !shownRef.current.has(q.id)) {
                    if (t >= q.at_seconds) {
                      playerRef.current?.pauseVideo?.();
                      shownRef.current.add(q.id);
                      onQuestionTrigger(q);
                      clearInterval(pollRef.current);
                      return;
                    }
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

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById("yt-api-script")) {
        const script = document.createElement("script");
        script.id = "yt-api-script";
        script.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(script);
      }
    }

    return () => {
      clearInterval(pollRef.current);
    };
  }, [videoId, timelineQuestions, onQuestionTrigger]);

  useEffect(() => {
    if (blockedUntil === null) {
      playerRef.current?.playVideo?.();
    }
  }, [blockedUntil]);

  return (
    <div className="lesson-video-wrap">
      <div ref={containerRef} className="lesson-video yt-player" />
    </div>
  );
}

// --- Inline question block (non-video / shown below) ---
function InlineQuestionBlock({ question, courseSlug, lessonId, onAnswered }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const attempt = question.user_attempt;
  const answered = Boolean(result) || Boolean(attempt);
  const correctIds = result?.correct_choice_ids || attempt?.correct_choice_ids || [];
  const isCorrect = result ? result.is_correct : attempt?.is_correct;

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    setError("");
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
    <div className={`inline-question ${answered ? (isCorrect ? "iq-correct" : "iq-wrong") : ""}`}>
      <div className="iq-header">
        <span className="iq-label">Quiz</span>
        <span className="iq-pts">{question.points} xal</span>
        {answered && (
          <span className={`iq-status ${isCorrect ? "correct" : "wrong"}`}>
            {isCorrect ? "✓ Düzgün" : "✗ Yanlış"}
          </span>
        )}
      </div>

      <p className="iq-question">{question.text}</p>

      <div className="iq-choices">
        {(question.choices || []).map((choice, idx) => {
          const letter = OPTION_LETTERS[idx];
          const isSelected = answered
            ? (result?.selected_choice_id ?? attempt?.selected_choice_id) === choice.id
            : selected === choice.id;
          const isCorrectChoice = correctIds.includes(choice.id);

          let cls = "iq-choice";
          if (answered) {
            if (isCorrectChoice) cls += " iq-c-correct";
            else if (isSelected) cls += " iq-c-wrong";
            else cls += " iq-c-dimmed";
          } else if (isSelected) {
            cls += " iq-c-selected";
          }

          return (
            <button
              key={choice.id}
              type="button"
              className={cls}
              onClick={() => !answered && setSelected(choice.id)}
              disabled={answered}
            >
              <span className="iq-letter">{letter}</span>
              <span>{choice.text}</span>
              {answered && isCorrectChoice && <span className="iq-tag correct">✓</span>}
            </button>
          );
        })}
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: 8 }}>{error}</div>}

      {answered ? (
        <div className={`iq-result ${isCorrect ? "correct" : "wrong"}`}>
          {(result?.explanation || attempt?.explanation) && (
            <p>{result?.explanation || attempt?.explanation}</p>
          )}
          {attempt && !result && <p className="iq-already">Bu suala artıq cavab vermişdiniz.</p>}
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          style={{ marginTop: 12 }}
          onClick={handleSubmit}
          disabled={!selected || submitting}
        >
          {submitting ? "Göndərilir..." : "Cavabı göndər"}
        </button>
      )}
    </div>
  );
}

// --- Main LessonPage ---
export default function LessonPage() {
  const { slug, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Quiz modal state for video-triggered questions
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [blockedUntil, setBlockedUntil] = useState(null);

  useEffect(() => {
    setLoading(true);
    endpoints.lessonDetail(slug, lessonId)
      .then(({ data }) => {
        setLesson(data);
        setCompleted(data.user_completed || false);
      })
      .catch(() => setError("Dərs yüklənə bilmədi."))
      .finally(() => setLoading(false));
  }, [slug, lessonId]);

  const handleQuestionTrigger = useCallback((question) => {
    setActiveQuestion(question);
    setBlockedUntil(question.id);
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
    setActiveQuestion(null);
    setBlockedUntil(null);
  }, []);

  const handleInlineAnswered = useCallback((data) => {
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

  if (loading) return <AppShell title="Dərs"><div className="loading-block">Dərs yüklənir...</div></AppShell>;
  if (error || !lesson) return <AppShell title="Dərs"><div className="alert alert-error">{error || "Dərs tapılmadı."}</div></AppShell>;

  const questions = lesson.lesson_questions || [];
  const timelineQs = questions.filter((q) => q.at_seconds !== null && q.at_seconds !== undefined);
  const inlineQs = questions.filter((q) => q.at_seconds === null || q.at_seconds === undefined);
  const ytId = isYouTube(lesson.video_url) ? extractYouTubeId(lesson.video_url) : null;
  const hasNoQuestions = questions.length === 0;

  return (
    <AppShell title={lesson.title}>
      <div className="lesson-layout">
        {/* Breadcrumb */}
        <div className="lesson-breadcrumb">
          <Link to="/courses">Kurslar</Link>
          <span>›</span>
          <Link to={`/courses/${slug}`}>Kurs</Link>
          <span>›</span>
          <span>{lesson.title}</span>
        </div>

        <div className="lesson-title-row">
          <h1 className="lesson-title">{lesson.title}</h1>
          {completed && <span className="lesson-completed-badge">✓ Tamamlandı</span>}
        </div>

        {/* Video section */}
        {lesson.video_url && (
          <div className="lesson-video-section">
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
              <div className="video-quiz-hint">
                Bu videoda {timelineQs.length} quiz sualı var. Video müəyyən anlarda avtomatik dayanacaq.
              </div>
            )}
          </div>
        )}

        {/* Text content */}
        {lesson.content && (
          <div className="lesson-content-section panel">
            <div className="lesson-content">{lesson.content}</div>
          </div>
        )}

        {/* Inline quiz questions */}
        {inlineQs.length > 0 && (
          <div className="lesson-quiz-section">
            <h2 style={{ marginBottom: 16 }}>Quiz Sualları</h2>
            <div className="inline-questions-list">
              {inlineQs.map((q) => (
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

        {/* Navigation / complete */}
        <div className="lesson-nav">
          <Link to={`/courses/${slug}`} className="btn btn-secondary">
            ← Kursa qayıt
          </Link>
          {hasNoQuestions && !completed && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleMarkComplete}
              disabled={completing}
            >
              {completing ? "..." : "✓ Tamamlandı kimi işarələ"}
            </button>
          )}
          {completed && (
            <span className="lesson-nav-done">✓ Bu dərs tamamlandı</span>
          )}
        </div>
      </div>

      {/* Quiz Modal overlay for video-triggered questions */}
      {activeQuestion && (
        <div>
          <QuizModal
            question={activeQuestion}
            onSubmit={handleModalSubmit}
          />
          <div className="quiz-modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleModalContinue}
            >
              Videoya davam et →
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
