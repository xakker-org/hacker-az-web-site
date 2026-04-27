function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentActivity({ activities }) {
  if (!activities?.length) {
    return (
      <section className="profile-panel">
        <header className="profile-panel-header">
          <div>
            <h2 className="profile-panel-title">Recent Activity</h2>
            <p className="profile-panel-subtitle">Your latest answer events will appear here</p>
          </div>
        </header>
        <div className="profile-empty">No recent activity found.</div>
      </section>
    );
  }

  return (
    <section className="profile-panel">
      <header className="profile-panel-header">
        <div>
          <h2 className="profile-panel-title">Recent Activity</h2>
          <p className="profile-panel-subtitle">Latest self-study and course attempts</p>
        </div>
      </header>

      <div className="recent-activity-list">
        {activities.map((item) => (
          <article key={`${item.type}-${item.id}`} className="activity-item">
            <div className={`activity-dot ${item.is_correct ? "correct" : "wrong"}`}>{item.is_correct ? "✓" : "✕"}</div>
            <div className="activity-body">
              <div className="activity-title">{item.question_title || "Untitled question"}</div>
              <div className="activity-meta">
                <span className={`activity-badge ${item.type === "course" ? "course" : "self-study"}`}>
                  {item.type === "course" ? "Course" : "Self Study"}
                </span>
                <span className="activity-time">{formatWhen(item.attempted_at)}</span>
                <span className="activity-course">{item.course_name || "General"}</span>
                <span className={`activity-points ${Number(item.points_earned) > 0 ? "" : "zero"}`}>
                  +{Number(item.points_earned) || 0} pts
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
