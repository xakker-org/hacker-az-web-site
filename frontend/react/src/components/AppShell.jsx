import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

const NAV_PRIMARY = [
  { to: "/dashboard",  label: "Overview",       icon: "◈" },
  { to: "/self-study", label: "Self Study",      icon: "◍" },
  { to: "/courses",    label: "Kurslar",         icon: "📘" },
  { to: "/rooms",      label: "Rooms",           icon: "▣" },
  { to: "/plans",      label: "Learning Paths",  icon: "↗" },
  { to: "/leaderboard",label: "Leaderboard",     icon: "☱" },
];

const NAV_SECONDARY = [
  { to: "/profile", label: "My Profile", icon: "◎" },
  { to: "/badges", label: "Badges", icon: "✦" },
  { to: "/exams", label: "Exams", icon: "✎" },
];

export default function AppShell({ children, title, searchPlaceholder, onSearch, extraTopbar }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/auth/login");
      return;
    }
    let mounted = true;
    endpoints
      .myProfile()
      .then(({ data }) => mounted && setProfile(data))
      .catch(() => {
        clearTokens();
        navigate("/auth/login");
      });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    clearTokens();
    navigate("/auth/login");
  };

  const displayName = profile?.username || "Hacker";
  const initial = displayName.slice(0, 1).toUpperCase();
  const xp = profile?.xp ?? 0;
  const rank = profile?.rank || "Recruit";
  const xpToNext = profile?.xp_to_next ?? 0;
  const rankProgress = profile?.rank_progress ?? 0;
  const nextRank = profile?.next_rank;
  const streak = profile?.streak_days ?? 0;

  return (
    <div className="shell">
      <aside className={`shell-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/dashboard" className="shell-brand">
          <img
            src={logoSrc}
            alt="Xakker"
            onError={() => setLogoSrc("/static/logo/logoXakker.png")}
          />
          
        </Link>

        <nav className="shell-nav">
          <div className="shell-nav-section">Train</div>
          {NAV_PRIMARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `shell-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="shell-nav-ico">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="shell-nav-section">Account</div>
          {NAV_SECONDARY.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `shell-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="shell-nav-ico">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="shell-user-card">
          <div className="shell-user-row">
            <div className="shell-user-avatar">{initial}</div>
            <div style={{ minWidth: 0 }}>
              <div className="shell-user-name" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              <div className="shell-user-rank">{rank}</div>
            </div>
          </div>
          <div className="progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${rankProgress}%` }} />
            </div>
            <div className="shell-user-xp">
              <span>{xp} XP</span>
              <span>{nextRank ? `+${xpToNext} → ${nextRank}` : "Max"}</span>
            </div>
          </div>
          <button className="shell-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <button
            className="btn btn-ghost btn-sm shell-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            type="button"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          {onSearch ? (
            <div className="shell-topbar-search">
              <span style={{ color: "var(--ink-4)" }}>⌕</span>
              <input
                type="text"
                placeholder={searchPlaceholder || "Search rooms, tasks, people..."}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          ) : (
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--ink-0)" }}>
              {title}
            </div>
          )}

          <div className="shell-topbar-right">
            {extraTopbar}
            <span className="topbar-chip">
              <span className="streak-flame">🔥</span>
              <strong>{streak}</strong> day streak
            </span>
            <span className="topbar-chip">
              <span className="xp-star">★</span>
              <strong>{xp}</strong> XP
            </span>
          </div>
        </header>

        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
