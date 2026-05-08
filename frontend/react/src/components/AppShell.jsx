import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";
import { useCommand } from "../contexts/CommandContext";
import Avatar from "./ui/Avatar";
import { Chip } from "./ui/Chip";
import Kbd from "./ui/Kbd";
import CommandPalette from "./ui/CommandPalette";

const NAV_MAIN = [
  { to: "/dashboard",   label: "Dashboard",      icon: "⌂" },
  { to: "/missions",    label: "Missions",       icon: "◎", badge: "New" },
  { to: "/rooms",       label: "Labs",           icon: "▣" },
  { to: "/self-study",  label: "Self-Study",     icon: "✎" },
  { to: "/plans",       label: "Learning Paths", icon: "↗" },
  { to: "/courses",     label: "Courses",        icon: "▤" },
];
const NAV_COMM = [
  { to: "/leaderboard", label: "Leaderboard", icon: "★" },
  { to: "/profile",     label: "Profile",     icon: "◉" },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { setOpen } = useCommand();
  const [profile, setProfile] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/static/logo/xakkerLogoWhite2.png");
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) { navigate("/auth/login"); return; }
    let mounted = true;
    endpoints.myProfile()
      .then(({ data }) => mounted && setProfile(data))
      .catch(() => { clearTokens(); navigate("/auth/login"); });
    return () => { mounted = false; };
  }, [navigate]);

  const handleLogout = () => { clearTokens(); navigate("/auth/login"); };

  const xp = profile?.xp ?? 0;
  const streak = profile?.streak_days ?? 0;
  const rank = profile?.rank || "recruit";
  const rankDisp = rank.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <div className="shell">
      {/* Mobile overlay */}
      {drawer && <div className="sb-overlay" onClick={() => setDrawer(false)} aria-hidden="true" />}

      <aside className={`sb${drawer ? " is-open" : ""}`}>
        <Link to="/dashboard" className="sb-brand" onClick={() => setDrawer(false)}>
          {!logoFailed ? (
            <img
              src={logoSrc}
              alt="Xakker"
              onError={() => {
                if (logoSrc.includes("xakkerLogoWhite2")) setLogoSrc("/static/logo/logoXakker.png");
                else setLogoFailed(true);
              }}
            />
          ) : (
            <span className="sb-brand-mark">X</span>
          )}
          <span className="sb-brand-name">Xakker</span>
        </Link>

        <div className="sb-section">
          <div className="sb-label">Platform</div>
          {NAV_MAIN.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sb-link${isActive ? " is-active" : ""}`}
              onClick={() => setDrawer(false)}
            >
              <span className="sb-link-ico" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="sb-link-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        <div className="sb-section">
          <div className="sb-label">Community</div>
          {NAV_COMM.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sb-link${isActive ? " is-active" : ""}`}
              onClick={() => setDrawer(false)}
            >
              <span className="sb-link-ico" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="sb-spacer" />

        <div className="sb-user">
          <Avatar user={profile || { username: "X" }} size={32} rounded="md" />
          <div className="sb-user-info">
            <div className="sb-user-name">{profile?.full_name || profile?.username || "Hacker"}</div>
            <div className="sb-user-meta">{rankDisp} · {xp.toLocaleString()} XP</div>
          </div>
          <button className="sb-user-logout" onClick={handleLogout} title="Çıxış" type="button">⏻</button>
        </div>
      </aside>

      <div className="main">
        <header className="tb">
          <button
            className="tb-burger"
            type="button"
            aria-label="Menyu"
            onClick={() => setDrawer(d => !d)}
          >☰</button>

          <button className="tb-cmd" type="button" onClick={() => setOpen(true)} aria-label="Axtar">
            <span className="tb-cmd-ico">⌕</span>
            <span className="tb-cmd-label">Mission, kurs, route axtar...</span>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </button>

          <div className="tb-right">
            {streak > 0 && <Chip tone="amber" icon="🔥">{streak}d</Chip>}
            <Chip tone="accent">★ <strong className="tnum">{xp.toLocaleString()}</strong></Chip>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
