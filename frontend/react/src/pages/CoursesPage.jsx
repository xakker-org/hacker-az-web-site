import { useEffect, useState } from "react";
import api from "../services/api";
import { getAccessToken } from "../utils/tokens";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get("/courses/")
      .then((response) => {
        if (mounted) {
          setCourses(response.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Kurslar yuklenmedi. API baglantisini yoxla.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const enroll = async (courseId) => {
    if (!getAccessToken()) {
      alert("Enroll ucun once login ol.");
      return;
    }

    try {
      await api.post("/courses/enroll/", { course: courseId });
      alert("Kursa ugurla qeydiyyat oldun.");
    } catch {
      alert("Qeydiyyat zamani xeta oldu veya artiq qeydiyyatdan kecmisen.");
    }
  };

  return (
    <section className="panel">
      <h2>Courses</h2>
      <p>Aktiv telimler ve practical learning track-lar.</p>
      {loading && <div className="muted">Kurslar yuklenir...</div>}
      {error && <div className="error-text">{error}</div>}
      <div className="courses-grid">
        {courses.map((course) => (
          <article key={course.id} className="course-card">
            <div className="course-top">
              <h3>{course.title}</h3>
              <span>{course.category || "General"}</span>
            </div>
            <p>{course.description}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => enroll(course.id)}
            >
              Enroll
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
