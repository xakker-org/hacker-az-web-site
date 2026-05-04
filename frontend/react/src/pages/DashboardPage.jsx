import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

const EMPTY = {
  username: "Hacker", email: "",
  enrolled_courses: [], plans: [], rooms: [],
  recommended_rooms: [], exams: [], recent_activity: [],
  profile: { xp: 0, rank: "Recruit", streak_days: 0, rank_progress: 0, next_rank: null, xp_to_next: 0 },
  stats: { active_courses: 0, tasks_completed: 0, rooms_completed: 0, available_rooms: 0, available_exams: 0, xp: 0, streak: 0 },
};

const DIFF_MAP = {
  beginner:     { cls: "easy",   label: "Başlanğıc" },
  intermediate: { cls: "medium", label: "Orta"      },
  advanced:     { cls: "hard",   label: "İrəliləmiş"},
};

const ACT_ICO = {
  task_complete: "✓", room_complete: "▣", badge_earned: "★",
  rank_up: "↑", exam_submit: "📝", default: "◍",
};

const ACT_CLR = {
  task_complete: "var(--green)", room_complete: "var(--blue)",
  badge_earned: "var(--amber)", rank_up: "var(--purple)",
  exam_submit: "var(--cyan)", default: "var(--t3)",
};

function DiffBadge({ level }) {
  const m = DIFF_MAP[level] || { cls: "easy", label: level };
  return <span className={`xk-diff xk-diff-${m.cls}`}>{m.label}</span>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cabinet, setCabinet] = useState(EMPTY);
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!getAccessToken()) { navigate("/auth/login"); return; }
    let mounted = true;
    endpoints.cabinet()
      .then(({ data }) => {
        if (!mounted) return;
        setCabinet(c => ({ ...c, ...data, profile: { ...c.profile, ...(data?.profile || {}) }, stats: { ...c.stats, ...(data?.stats || {}) } }));
      })
      .catch(err => {
        if (!mounted) return;
        const s = err?.response?.status;
        if (s === 401 || s === 403) { clearTokens(); navigate("/auth/login"); return; }
        setError("Kabinet yüklənmədi.");
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [navigate]);

  const q = query.trim().toLowerCase();
  const rooms = useMemo(() => !q ? cabinet.rooms || [] : (cabinet.rooms || []).filter(r => `${r.title} ${r.summary}`.toLowerCase().includes(q)), [cabinet.rooms, q]);
  const activity = cabinet.recent_activity || [];
  const profile  = cabinet.profile || EMPTY.profile;
  const stats    = cabinet.stats   || EMPTY.stats;
  const hour     = new Date().getHours();
  const greet    = hour < 12 ? "Sabahınız xeyir" : hour < 18 ? "Günortanız xeyir" : "Axşamınız xeyir";

  if (loading) {
    return (
      <AppShell title="Ana Səhifə">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="xk-panel" style={{ height: 120 }}>
              <div className="xk-skel" style={{ height: "100%", borderRadius: "var(--r4)" }} />
            </div>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Ana Səhifə" searchPlaceholder="Mission, kurs axtar..." onSearch={setQuery}>
      {error && <div className="xk-alert xk-alert-err">{error}</div>}

      {/* Hero */}
      <div className="xk-panel dash-hero">
        <div>
          <div className="dash-greeting">{greet},</div>
          <h1 className="dash-name">
            {cabinet.username || "Hacker"} <span>👾</span>
          </h1>
          <p className="dash-sub">
            Hər gün öyrən, irəliləyişini izlə. Cybersecurity dünyasında öz yerini al.
          </p>
          <div className="dash-ctas">
            <Link to="/missions" className="xk-btn xk-btn-primary">🎯 Missions</Link>
            <Link to="/rooms" className="xk-btn xk-btn-secondary">⚡ Rooms</Link>
            <Link to="/self-study" className="xk-btn xk-btn-ghost">🧪 Labs</Link>
            <Link to="/plans"      className="xk-btn xk-btn-ghost">🗺 Planlar</Link>
          </div>
        </div>
        <div className="dash-rank-box">
          <div className="dash-rank-top">
            <span className="dash-rank-name">{profile.rank || "Recruit"}</span>
            <span className="xk-tag green">★ {(profile.xp || 0).toLocaleString()} XP</span>
          </div>
          <div className="xk-prog">
            <div className="xk-prog-track" style={{ height: 8 }}>
              <div className="xk-prog-fill" style={{ width: `${profile.rank_progress || 0}%` }} />
            </div>
            <div className="xk-prog-meta">
              <span>{profile.rank_progress || 0}%</span>
              {profile.next_rank && <span>→ {profile.next_rank}: +{profile.xp_to_next} XP</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="xk-panel dash-stat green">
          <div className="dash-stat-icon">★</div>
          <div className="dash-stat-val">{(stats.xp || profile.xp || 0).toLocaleString()}</div>
          <div className="dash-stat-label">Ümumi XP</div>
        </div>
        <div className="xk-panel dash-stat blue">
          <div className="dash-stat-icon">✓</div>
          <div className="dash-stat-val">{stats.tasks_completed || 0}</div>
          <div className="dash-stat-label">Tamamlanan Task</div>
        </div>
        <div className="xk-panel dash-stat purple">
          <div className="dash-stat-icon">▣</div>
          <div className="dash-stat-val">{stats.rooms_completed || 0}</div>
          <div className="dash-stat-label">Keçirilən Mission</div>
        </div>
        <div className="xk-panel dash-stat amber">
          <div className="dash-stat-icon">🔥</div>
          <div className="dash-stat-val">{profile.streak_days || stats.streak || 0}</div>
          <div className="dash-stat-label">Gün Ardıcıllıq</div>
        </div>
      </div>

      {/* Continue missions */}
      {rooms.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div className="xk-section-head">
            <div>
              <h2>⚡ Öyrənməyə davam et</h2>
              <div className="xk-section-sub">Aktiv rooms — hər hansını davam etdir</div>
            </div>
            <Link to="/rooms" className="xk-btn xk-btn-secondary xk-btn-sm">Hamısına bax →</Link>
          </div>
          <div className="missions-grid">
            {rooms.slice(0, 6).map(room => (
              <Link
                key={room.id}
                to={`/rooms/${room.slug}`}
                className="mission-card"
              >
                <div className={`mission-card-bar ${DIFF_MAP[room.level]?.cls || "easy"}`} />
                {room.progress_percent >= 100 && <div className="mission-completed-overlay">✓</div>}
                <div className="mission-card-top">
                  <div className="mission-card-icon">{room.icon || "🧪"}</div>
                  <div className="mission-card-badges">
                    <DiffBadge level={room.level} />
                    {room.is_premium && <span className="xk-tag">Premium</span>}
                  </div>
                </div>
                <h3>{room.title}</h3>
                <p>{room.summary}</p>
                <div className="xk-prog">
                  <div className="xk-prog-track">
                    <div className="xk-prog-fill blue" style={{ width: `${room.progress_percent || 0}%` }} />
                  </div>
                  <div className="xk-prog-meta">
                    <span>{room.progress_percent || 0}% tamamlandı</span>
                    <span>{room.task_count || 0} task</span>
                  </div>
                </div>
                <div className="mission-card-footer">
                  <span>⏱ {room.estimated_minutes || 0} dəq</span>
                  <span className="mission-xp">★ {room.points || 0} XP</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom grid */}
      <div className="dash-bottom">
        {/* Activity */}
        <div className="xk-panel">
          <div className="xk-section-head" style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--b1)", marginBottom: 0 }}>
            <div><h2 style={{ fontSize: 16 }}>Son Fəaliyyət</h2></div>
            <Link to="/self-study" className="xk-btn xk-btn-ghost xk-btn-sm">Labs →</Link>
          </div>
          <div className="xk-activity">
            {activity.length > 0 ? activity.slice(0, 8).map(item => (
              <div key={item.id} className="xk-act-item">
                <div className="xk-act-ico" style={{ color: ACT_CLR[item.kind] || ACT_CLR.default }}>
                  {ACT_ICO[item.kind] || ACT_ICO.default}
                </div>
                <div>
                  <div className="xk-act-title">{item.title}</div>
                  <div className="xk-act-meta">{item.detail}</div>
                </div>
                {item.xp_delta > 0 && (
                  <div className="xk-act-xp">+{item.xp_delta} XP</div>
                )}
              </div>
            )) : (
              <div className="xk-empty" style={{ padding: "32px 20px" }}>
                <div className="xk-empty-ico">◍</div>
                <p>Hələ heç bir fəaliyyət yoxdur. Rooms-dan başla!</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile snap */}
        <div className="xk-panel">
          <div className="xk-section-head" style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--b1)", marginBottom: 0 }}>
            <h2 style={{ fontSize: 16 }}>Profil</h2>
            <Link to="/profile" className="xk-btn xk-btn-ghost xk-btn-sm">Bax →</Link>
          </div>
          <div className="dash-prof-snap">
            <div className="dash-prof-avatar">{(cabinet.username || "H")[0].toUpperCase()}</div>
            <div className="dash-prof-name">{cabinet.username}</div>
            <div className="dash-prof-email">{cabinet.email}</div>
            <div className="dash-prof-chips">
              <span className="xk-chip green">{profile.rank || "Recruit"}</span>
              {(profile.streak_days || 0) > 0 && (
                <span className="xk-chip amber">🔥 {profile.streak_days} gün</span>
              )}
            </div>
            <div className="xk-prog" style={{ width: "100%", marginTop: 8 }}>
              <div className="xk-prog-track">
                <div className="xk-prog-fill" style={{ width: `${profile.rank_progress || 0}%` }} />
              </div>
              <div className="xk-prog-meta">
                <span>{(profile.xp || 0).toLocaleString()} XP</span>
                {profile.next_rank && <span>+{profile.xp_to_next} → {profile.next_rank}</span>}
              </div>
            </div>
            <div className="dash-quick">
              <Link to="/badges"      className="dash-quick-link">🎖 Nişanlar</Link>
              <Link to="/leaderboard" className="dash-quick-link">🏆 Liderlik</Link>
              <Link to="/courses"     className="dash-quick-link">📚 Kurslar</Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
