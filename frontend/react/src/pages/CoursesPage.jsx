import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    endpoints.courses()
      .then(({ data }) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError("Kurslar yüklənə bilmədi."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) =>
      `${c.title} ${c.description} ${c.category || ""}`.toLowerCase().includes(q)
    );
  }, [courses, search]);

  return (
    <AppShell title="Kurslar" searchPlaceholder="Kurs axtar..." onSearch={setSearch}
      extraTopbar={<span className="topbar-chip"><strong>{courses.length}</strong> kurs</span>}
    >
      <div className="page-head">
        <div>
          <h1>Kurslar</h1>
          <p>Strukturlu dərslər, video məzmun və quiz sualları ilə öyrən.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-block">Kurslar yüklənir...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state panel">
          <h3>Kurs tapılmadı</h3>
          <p>Axtarışı dəyişdirin və ya admin paneldən kurs əlavə edin.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {filtered.map((course) => (
            <Link key={course.id} to={`/courses/${course.slug}`} className="course-card"
              style={{ "--course-color": course.cover_color || "#ff5672" }}
            >
              <div className="course-card-glow" />
              <div className="course-card-top">
                <span className="course-card-icon">{course.icon || "📘"}</span>
                {course.category && (
                  <span className="chip" style={{ fontSize: 11 }}>{course.category}</span>
                )}
              </div>
              <h3 className="course-card-title">{course.title}</h3>
              <p className="course-card-desc">{course.description}</p>
              <div className="course-card-meta">
                <span>{course.lesson_count || 0} dərs</span>
                <span>{course.room_count || 0} otaq</span>
                <span className="course-card-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
