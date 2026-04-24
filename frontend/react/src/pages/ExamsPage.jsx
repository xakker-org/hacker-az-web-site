import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    endpoints.exams().then(({ data }) => setExams(data || []));
  }, []);

  const filteredExams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exams;
    return exams.filter((exam) => `${exam.title} ${exam.description} ${exam.level} ${exam.course?.title || ""}`.toLowerCase().includes(q));
  }, [exams, search]);

  return (
    <AppShell title="Exams" searchPlaceholder="Exam axtar..." onSearch={setSearch}>
      <div className="page-head">
        <div>
          <h1>Exams</h1>
          <p>İmtahanlar backend-dən gəlir və attempt flow birbaşa işləyir.</p>
        </div>
        <div className="page-head-actions">
          <span className="topbar-chip"><strong>{filteredExams.length}</strong> exams</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {filteredExams.map((exam) => (
          <article key={exam.id} className="room-card" style={{ "--room-tint": "rgba(91, 139, 255, 0.2)" }}>
            <div className="room-card-top">
              <div className="room-card-icon">⌨</div>
              <div className="room-card-chips">
                <span className="chip chip-level">{exam.level}</span>
                <span className="chip chip-blue">{exam.time_limit_minutes} min</span>
              </div>
            </div>
            <h3>{exam.title}</h3>
            <p>{exam.description}</p>
            <div className="room-card-meta">
              <span>{exam.course?.title}</span>
              <span className="lb-xp">{exam.question_count || 0} questions</span>
            </div>
            <Link to={`/dashboard/exams/${exam.slug}`} className="btn btn-primary btn-sm">Start exam</Link>
          </article>
        ))}
      </div>
    </AppShell>
  );
}