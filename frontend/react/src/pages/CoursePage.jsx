import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function CoursePage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    endpoints.courseDetail(slug)
      .then(({ data }) => setCourse(data))
      .catch(() => setError("Kurs yüklənə bilmədi."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <AppShell title="Kurs"><div className="loading-block">Kurs yüklənir...</div></AppShell>;
  if (error || !course) return <AppShell title="Kurs"><div className="alert alert-error">{error || "Kurs tapılmadı."}</div></AppShell>;

  const lessons = course.lessons || [];
  const completedCount = lessons.filter((l) => l.user_completed).length;

  return (
    <AppShell title={course.title}>
      {/* Hero */}
      <div className="course-hero panel" style={{ "--course-color": course.cover_color || "#ff5672" }}>
        <div className="course-hero-glow" />
        <div className="course-hero-inner">
          <Link to="/courses" className="btn btn-secondary btn-sm" style={{ alignSelf: "flex-start", marginBottom: 16 }}>
            ← Kurslara qayıt
          </Link>
          <div className="course-hero-top">
            <span className="course-hero-icon">{course.icon || "📘"}</span>
            <div>
              {course.category && <div className="course-hero-category">{course.category}</div>}
              <h1>{course.title}</h1>
              <p className="course-hero-desc">{course.description}</p>
              <div className="course-hero-chips">
                <span className="chip chip-blue">{lessons.length} dərs</span>
                {course.room_count > 0 && <span className="chip">{course.room_count} otaq</span>}
                {lessons.length > 0 && (
                  <span className="chip chip-green">{completedCount}/{lessons.length} tamamlandı</span>
                )}
              </div>
            </div>
          </div>

          {lessons.length > 0 && (
            <div className="course-progress-bar">
              <div
                className="course-progress-fill"
                style={{ width: `${Math.round((completedCount / lessons.length) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lessons */}
      <div className="course-body">
        <div className="course-lessons-section">
          <h2 style={{ marginBottom: 16 }}>Dərslər</h2>

          {lessons.length === 0 ? (
            <div className="empty-state panel">Bu kursda hələ dərs əlavə edilməyib.</div>
          ) : (
            <div className="lesson-list">
              {lessons.map((lesson, idx) => {
                const qCount = lesson.question_count || 0;
                return (
                  <Link
                    key={lesson.id}
                    to={`/courses/${slug}/lessons/${lesson.id}`}
                    className={`lesson-item ${lesson.user_completed ? "lesson-item-done" : ""}`}
                  >
                    <div className={`lesson-item-num ${lesson.user_completed ? "done" : ""}`}>
                      {lesson.user_completed ? "✓" : idx + 1}
                    </div>
                    <div className="lesson-item-body">
                      <div className="lesson-item-title">{lesson.title}</div>
                      <div className="lesson-item-meta">
                        {lesson.has_video && <span className="lesson-meta-tag video-tag">▶ Video</span>}
                        {lesson.has_text && <span className="lesson-meta-tag text-tag">📄 Mətn</span>}
                        {qCount > 0 && <span className="lesson-meta-tag quiz-tag">{qCount} quiz</span>}
                      </div>
                    </div>
                    {lesson.user_completed
                      ? <span className="lesson-item-done-badge">Tamamlandı ✓</span>
                      : <span className="lesson-item-arrow">→</span>
                    }
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
