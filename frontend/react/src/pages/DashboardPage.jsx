import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

const emptyCabinet = {
  username: "Hacker",
  email: "",
  enrolled_courses: [],
  plans: [],
  rooms: [],
  recommended_rooms: [],
  exams: [],
  recent_activity: [],
  profile: {
    xp: 0,
    rank: "Recruit",
    streak_days: 0,
    rank_progress: 0,
    next_rank: null,
    xp_to_next: 0,
  },
  stats: {
    active_courses: 0,
    active_plans: 0,
    available_rooms: 0,
    available_exams: 0,
    tasks_completed: 0,
    rooms_completed: 0,
    xp: 0,
    rank: "Recruit",
    streak: 0,
  },
};

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cabinet, setCabinet] = useState(emptyCabinet);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/auth/login");
      return;
    }

    let mounted = true;
    endpoints
      .cabinet()
      .then(({ data }) => {
        if (!mounted) return;
        setCabinet((current) => ({
          ...current,
          ...data,
          profile: { ...current.profile, ...(data?.profile || {}) },
          stats: { ...current.stats, ...(data?.stats || {}) },
        }));
      })
      .catch((requestError) => {
        if (!mounted) return;
        const status = requestError?.response?.status;
        if (status === 401 || status === 403) {
          clearTokens();
          navigate("/auth/login");
          return;
        }
        setError("Kabinet yüklənmədi. Backend bağlantısını yoxla.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const query = searchTerm.trim().toLowerCase();

  const filteredRooms = useMemo(() => {
    if (!query) return cabinet.rooms || [];
    return (cabinet.rooms || []).filter((room) =>
      `${room.title} ${room.summary} ${room.course?.title || ""} ${room.level}`.toLowerCase().includes(query)
    );
  }, [cabinet.rooms, query]);

  const filteredPlans = useMemo(() => {
    if (!query) return cabinet.plans || [];
    return (cabinet.plans || []).filter((plan) =>
      `${plan.title} ${plan.summary} ${plan.level}`.toLowerCase().includes(query)
    );
  }, [cabinet.plans, query]);

  const filteredExams = useMemo(() => {
    if (!query) return cabinet.exams || [];
    return (cabinet.exams || []).filter((exam) =>
      `${exam.title} ${exam.description} ${exam.course?.title || ""}`.toLowerCase().includes(query)
    );
  }, [cabinet.exams, query]);

  const recentActivity = cabinet.recent_activity || [];
  const profile = cabinet.profile || emptyCabinet.profile;
  const stats = cabinet.stats || emptyCabinet.stats;

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="loading-block">Kabinet hazırlanır...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Dashboard"
      searchPlaceholder="Kurs, plan, room, exam axtar..."
      onSearch={setSearchTerm}
      extraTopbar={
        <>
          <span className="topbar-chip">
            <strong>{profile.rank}</strong>
          </span>
          <span className="topbar-chip">
            <strong>{profile.streak_days || 0}</strong> day streak
          </span>
        </>
      }
    >
      {error && <div className="alert alert-error">{error}</div>}

      <section className="dash-hero">
        <div className="dash-hero-main">
          <span className="dash-hero-eyebrow">Self-study cabinet</span>
          <h1>Welcome back, {cabinet.username || "Hacker"}.</h1>
          <p>
            Bütün data backend-dən gəlir: enrolled courses, learning plans, rooms, exams və profile
            status bir yerdə toplanır.
          </p>
          <div className="dash-hero-ctas">
            <Link to="/rooms" className="btn btn-primary btn-sm">
              Explore rooms
            </Link>
            <Link to="/plans" className="btn btn-secondary btn-sm">
              View plans
            </Link>
          </div>
        </div>

        <aside className="dash-hero-aside">
          <div className="dash-rank-row">
            <div>
              <div className="dash-rank-big">{profile.rank}</div>
              <div className="dash-rank-next">
                {profile.next_rank ? `Next: ${profile.next_rank}` : "Max rank reached"}
              </div>
            </div>
            <span className="chip chip-accent">{profile.xp} XP</span>
          </div>
          <div className="progress">
            <div className="progress-track">
              <div className="progress-fill blue" style={{ width: `${profile.rank_progress || 0}%` }} />
            </div>
            <div className="progress-meta">
              <span>{profile.xp_to_next || 0} XP to next</span>
              <span>{profile.rank_progress || 0}%</span>
            </div>
          </div>
          <div className="dash-stat-row">
            <div className="dash-stat">
              <div className="dash-stat-value">{stats.active_courses || 0}</div>
              <div className="dash-stat-label">Courses</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">{stats.available_rooms || 0}</div>
              <div className="dash-stat-label">Rooms</div>
            </div>
            <div className="dash-stat">
              <div className="dash-stat-value">{stats.available_exams || 0}</div>
              <div className="dash-stat-label">Exams</div>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel" style={{ marginBottom: 22 }}>
        <div className="panel-title">
          <div>
            <h2>Progress</h2>
            <div className="panel-title-sub">Backend summary snapshot</div>
          </div>
        </div>
        <div className="progress-grid">
          <div className="progress-card panel">
            <div className="progress-label">Courses completed</div>
            <div className="progress-value">{stats.active_courses || 0}</div>
            <div className="progress-meta">Active enrollments</div>
          </div>
          <div className="progress-card panel">
            <div className="progress-label">Rooms completed</div>
            <div className="progress-value">{stats.rooms_completed || 0}</div>
            <div className="progress-meta">Backend room progress</div>
          </div>
          <div className="progress-card panel">
            <div className="progress-label">Tasks completed</div>
            <div className="progress-value">{stats.tasks_completed || 0}</div>
            <div className="progress-meta">Practice flow</div>
          </div>
          <div className="progress-card panel">
            <div className="progress-label">Streak days</div>
            <div className="progress-value">{profile.streak_days || stats.streak || 0}</div>
            <div className="progress-meta">Keep the run alive</div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 22 }}>
        <div className="panel-title">
          <div>
            <h2>Continue Learning</h2>
            <div className="panel-title-sub">Your active backend content</div>
          </div>
        </div>
        <div className="grid-rooms">
          {filteredRooms.map((room) => (
            <Link
              key={room.id}
              to={`/rooms/${room.slug}`}
              className="room-card"
              style={{ "--room-tint": room.cover_color || "rgba(255, 86, 114, 0.22)" }}
            >
              <div className="room-card-top">
                <div className="room-card-icon">{room.icon || "◈"}</div>
                <div className="room-card-chips">
                  <span className="chip chip-level">{levelLabels[room.level] || room.level}</span>
                  <span className="chip chip-blue">{room.course?.title}</span>
                </div>
              </div>
              <h3>{room.title}</h3>
              <p>{room.summary}</p>
              <div className="progress">
                <div className="progress-track">
                  <div className="progress-fill blue" style={{ width: `${room.progress_percent || 0}%` }} />
                </div>
                <div className="progress-meta">
                  <span>{room.progress_percent || 0}% done</span>
                  <span>{room.task_count || 0} tasks</span>
                </div>
              </div>
              <div className="room-card-meta">
                <span>{room.estimated_minutes || 0} min</span>
                <span className="lb-xp">{room.points || 0} XP</span>
              </div>
            </Link>
          ))}
          {filteredRooms.length === 0 && <div className="empty-state panel">No rooms match the search.</div>}
        </div>
      </section>

      <section style={{ marginBottom: 22 }}>
        <div className="panel-title">
          <div>
            <h2>Learning Paths</h2>
            <div className="panel-title-sub">Structured courses from backend plans</div>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="plan-card" style={{ "--plan-tint": "rgba(91, 139, 255, 0.22)" }}>
              <div className="plan-card-head">
                <div className="plan-card-icon">{plan.icon || "↗"}</div>
                <span className="chip chip-accent">{levelLabels[plan.level] || plan.level}</span>
              </div>
              <h3>{plan.title}</h3>
              <p>{plan.summary}</p>
              <div className="plan-courses">
                {(plan.courses || []).map((entry, index) => (
                  <div key={entry.id} className="plan-course-row">
                    <span>
                      <span className="idx">{index + 1}</span>
                      {entry.course.title}
                    </span>
                    <span>{entry.course.category || "General"}</span>
                  </div>
                ))}
              </div>
              <div className="room-card-meta">
                <span>{plan.room_count || 0} rooms</span>
                <span className="lb-xp">{plan.estimated_hours || 0}h</span>
              </div>
            </div>
          ))}
          {filteredPlans.length === 0 && <div className="empty-state panel">No plans match the search.</div>}
        </div>
      </section>

      <section style={{ marginBottom: 22 }}>
        <div className="panel-title">
          <div>
            <h2>Exam Room</h2>
            <div className="panel-title-sub">Quick access to published exams</div>
          </div>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {filteredExams.map((exam) => (
            <article key={exam.id} className="room-card" style={{ "--room-tint": "rgba(91, 139, 255, 0.2)" }}>
              <div className="room-card-top">
                <div className="room-card-icon">⌨</div>
                <div className="room-card-chips">
                  <span className="chip chip-level">{levelLabels[exam.level] || exam.level}</span>
                  <span className="chip chip-blue">{exam.time_limit_minutes} min</span>
                </div>
              </div>
              <h3>{exam.title}</h3>
              <p>{exam.description}</p>
              <div className="room-card-meta">
                <span>{exam.course?.title}</span>
                <span className="lb-xp">{exam.question_count || 0} questions</span>
              </div>
              <Link to={`/dashboard/exams/${exam.slug}`} className="btn btn-primary btn-sm">
                Start exam
              </Link>
            </article>
          ))}
          {filteredExams.length === 0 && <div className="empty-state panel">No exams match the search.</div>}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22, marginBottom: 22 }}>
        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Recent Activity</h2>
              <div className="panel-title-sub">Pulled from backend activity log</div>
            </div>
          </div>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} className="activity-item">
                  <div className="activity-icon">{item.kind === "exam_submit" ? "⌨" : "★"}</div>
                  <div className="activity-body">
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-meta">{item.detail}</div>
                  </div>
                  <div className={`activity-xp ${item.xp_delta < 0 ? "negative" : ""}`}>
                    {item.xp_delta > 0 ? `+${item.xp_delta}` : item.xp_delta}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No recent activity yet.</div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <div>
              <h2>Profile Snapshot</h2>
              <div className="panel-title-sub">Rank and progress state</div>
            </div>
          </div>
          <div className="profile-hero" style={{ gridTemplateColumns: "1fr", marginBottom: 0 }}>
            <div className="profile-avatar" style={{ margin: "0 auto" }}>
              {cabinet.username?.[0]?.toUpperCase() || "H"}
            </div>
            <div className="profile-meta" style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: "28px" }}>{cabinet.username}</h1>
              <p>{cabinet.email}</p>
              <div className="profile-meta-row" style={{ justifyContent: "center" }}>
                <span className="chip chip-accent">{profile.rank}</span>
                <span className="chip">{profile.streak_days || 0} day streak</span>
              </div>
            </div>
            <div className="progress">
              <div className="progress-track">
                <div className="progress-fill blue" style={{ width: `${profile.rank_progress || 0}%` }} />
              </div>
              <div className="progress-meta">
                <span>{profile.xp || 0} XP</span>
                <span>{profile.xp_to_next || 0} to next rank</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel" style={{ marginBottom: 22 }}>
        <div className="panel-title">
          <div>
            <h2>Recent Self-Study Activity</h2>
            <div className="panel-title-sub">Quick view of your latest question activity</div>
          </div>
          <Link to="/self-study" className="btn btn-secondary btn-sm">
            Open Self-Study
          </Link>
        </div>
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((item) => (
              <div key={`study-${item.id}`} className="activity-item">
                <div className="activity-icon">◍</div>
                <div className="activity-body">
                  <div className="activity-title">{item.title}</div>
                  <div className="activity-meta">{item.detail || "Self-study update"}</div>
                </div>
                <div className={`activity-xp ${item.xp_delta < 0 ? "negative" : ""}`}>
                  {item.xp_delta > 0 ? `+${item.xp_delta}` : item.xp_delta}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No self-study activity yet.</div>
          )}
        </div>
      </section>
    </AppShell>
  );
}