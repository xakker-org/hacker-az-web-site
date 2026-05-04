import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

const NAV = [
  {
    label: "Platform",
    items: [
      { to: "/dashboard",   label: "Dashboard",    icon: "⌂" },
      { to: "/missions",    label: "Missions",     icon: "🎯", badge: "New" },
      { to: "/rooms",       label: "Labs",         icon: "⚡" },
      { to: "/self-study",  label: "Self-Study",   icon: "🧪" },
      { to: "/plans",       label: "Learning Path", icon: "🗺" },
      { to: "/courses",     label: "Courses",      icon: "📚" },
      { to: "/exams",       label: "Exams",        icon: "📝" },
    ],
  },
  {
    label: "Community",
    items: [
      { to: "/leaderboard", label: "Leaderboard",  icon: "🏆" },
      { to: "/badges",      label: "Badges",       icon: "🎖" },
      { to: "/profile",     label: "Profile",      icon: "👤" },
    ],
  },
];

const RANK_COLORS = {
  recruit: "#636d7f", script_kiddie: "#4d9fff", operative: "#00e5ff",
  hunter: "#39d353", specialist: "#a855f7", analyst: "#ffb300",
  architect: "#ff3d5a", operator: "#ff8099", ghost: "#ffffff",
};

export default function AppShell({ children, title, searchPlaceholder, onSearch, extraTopbar }) {
  const navigate = useNavigate();
  const [profile, setProfile]         = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoSrc, setLogoSrc]         = useState("/static/logo/xakkerLogoWhite2.png");

  useEffect(() => {
    if (!getAccessToken()) { navigate("/auth/login"); return; }
    let mounted = true;
    endpoints.myProfile()
      .then(({ data }) => mounted && setProfile(data))
      .catch(() => { clearTokens(); navigate("/auth/login"); });
    return () => { mounted = false; };
  }, [navigate]);

  const handleLogout = () => { clearTokens(); navigate("/auth/login"); };

  const name     = profile?.username || "Hacker";
  const initial  = name[0]?.toUpperCase() || "H";
  const xp       = profile?.xp ?? 0;
  const rank     = profile?.rank || "recruit";
  const rankDisp = rank.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  const rankPct  = profile?.rank_progress ?? 0;
  const xpNext   = profile?.xp_to_next ?? 0;
  const nextRank = profile?.next_rank;
  const streak   = profile?.streak_days ?? 0;
  const rankColor = RANK_COLORS[rank] || "var(--green)";

  return (
    <>
      <div className="xk-bg" aria-hidden="true" />
      <div className="xk-grid" aria-hidden="true" />

      <div className="xk-shell">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="xk-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* Sidebar */}
        <aside className={`xk-sidebar ${sidebarOpen ? "open" : ""}`}>
          {/* Brand */}
          <Link to="/dashboard" className="xk-brand" onClick={() => setSidebarOpen(false)}>
            <img
              src={logoSrc}
              alt="Xakker"
              onError={() => setLogoSrc("/static/logo/logoXakker.png")}
            />
          </Link>

          {/* Navigation */}
          <nav className="xk-nav" aria-label="Əsas menyu">
            {NAV.map((section) => (
              <div key={section.label}>
                <div className="xk-nav-label">{section.label}</div>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `xk-nav-link${isActive ? " active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="xk-nav-ico" aria-hidden="true">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span className="xk-nav-badge">{item.badge}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User card */}
          <div className="xk-user-card">
            <div className="xk-user-row">
              <div className="xk-avatar">{initial}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="xk-user-name">{name}</div>
                <div className="xk-user-rank" style={{ color: rankColor }}>{rankDisp}</div>
              </div>
              {streak > 0 && (
                <div className="xk-user-streak" title={`${streak} günlük ardıcıllıq`}>
                  🔥{streak}
                </div>
              )}
            </div>
            <div className="xk-xp-bar">
              <div className="xk-track">
                <div className="xk-fill" style={{ width: `${rankPct}%` }} />
              </div>
              <div className="xk-xp-row">
                <span style={{ color: "var(--green)", fontWeight: 700 }}>★ {xp.toLocaleString()} XP</span>
                <span>{nextRank ? `+${xpNext} → ${nextRank}` : "MAX"}</span>
              </div>
            </div>
            <button className="xk-logout" onClick={handleLogout} type="button">
              ⏻ Çıxış
            </button>
          </div>
        </aside>

        {/* Main area */}
        <div className="xk-main">
          {/* Topbar */}
          <header className="xk-topbar">
            <button
              className="xk-hamburger xk-btn"
              type="button"
              aria-label="Menyunu aç"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>

            {onSearch ? (
              <div className="xk-search">
                <span className="xk-search-ico" aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder={searchPlaceholder || "Axtar..."}
                  onChange={(e) => onSearch(e.target.value)}
                  aria-label={searchPlaceholder || "Axtar"}
                />
              </div>
            ) : (
              <div style={{ fontFamily: "var(--display)", fontWeight: 700, color: "var(--t1)", fontSize: 16 }}>
                {title}
              </div>
            )}

            <div className="xk-topbar-right">
              {extraTopbar}
              {streak > 0 && (
                <span className="xk-chip amber">🔥 <strong>{streak}</strong></span>
              )}
              <span className="xk-chip green">★ <strong>{xp.toLocaleString()}</strong></span>
            </div>
          </header>

          {/* Page content */}
          <div className="xk-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
