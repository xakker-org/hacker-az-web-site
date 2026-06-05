import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";
import { useCommand } from "../contexts/CommandContext";
import { useLang } from "../contexts/LanguageContext";
import Avatar from "./ui/Avatar";
import { Chip } from "./ui/Chip";
import Kbd from "./ui/Kbd";
import CommandPalette from "./ui/CommandPalette";

function Icon({ name, size = 16 }) {
  const icons = {
    dashboard: (
      <>
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
      </>
    ),
    missions: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
      </>
    ),
    labs: (
      <>
        <rect x="2.5" y="5" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 5V3.5C5.5 3.22 5.72 3 6 3H10C10.28 3 10.5 3.22 10.5 3.5V5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 8.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    study: (
      <>
        <rect x="2.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 6.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    paths: (
      <>
        <circle cx="3.5" cy="12.5" r="1.8" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.8" fill="currentColor"/>
        <circle cx="12.5" cy="3.5" r="1.8" fill="currentColor"/>
        <path d="M5 11L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 7L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    courses: (
      <>
        <path d="M2 5L8 2L14 5L8 8L2 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 9L8 12L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    leaderboard: (
      <>
        <rect x="2" y="8" width="3.5" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6.25" y="5" width="3.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10.5" y="2" width="3.5" height="13" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    profile: (
      <>
        <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 14C2.5 11.5 5.01 9.5 8 9.5C10.99 9.5 13.5 11.5 13.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    chevronLeft: (
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    chevronRight: (
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    logout: (
      <>
        <path d="M10 11L13 8L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 8H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 2.5H3.5C3.22 2.5 3 2.72 3 3V13C3 13.28 3.22 13.5 3.5 13.5H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    search: (
      <>
        <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {icons[name]}
    </svg>
  );
}

const NAV_MAIN = [
  { to: "/dashboard",   label: { az: "Dashboard",       en: "Dashboard"      }, icon: "dashboard" },
  { to: "/missions",    label: { az: "Missions",        en: "Missions"       }, icon: "missions",  badge: "New" },
  { to: "/rooms",       label: { az: "Labs",            en: "Labs"           }, icon: "labs" },
  { to: "/self-study",  label: { az: "Sərbəst Tədris",  en: "Self-Study"     }, icon: "study" },
  { to: "/plans",       label: { az: "Öyrənmə Yolları", en: "Learning Paths" }, icon: "paths" },
  { to: "/courses",     label: { az: "Kurslar",         en: "Courses"        }, icon: "courses" },
];

const NAV_COMM = [
  { to: "/leaderboard", label: { az: "Liderlik",  en: "Leaderboard" }, icon: "leaderboard" },
  { to: "/profile",     label: { az: "Profil",    en: "Profile"     }, icon: "profile" },
];

const COLLAPSED_KEY = "xk_sb_collapsed";

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const { setOpen } = useCommand();
  const { lang, setLang } = useLang();
  const [profile, setProfile] = useState(null);
  const [drawer, setDrawer]   = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; }
  });

  useEffect(() => {
    if (!getAccessToken()) { navigate("/auth/login"); return; }
    let mounted = true;
    endpoints.myProfile()
      .then(({ data }) => mounted && setProfile(data))
      .catch(() => { clearTokens(); navigate("/auth/login"); });
    return () => { mounted = false; };
  }, [navigate]);

  const toggleCollapsed = () => {
    setCollapsed(c => {
      const next = !c;
      try { localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  const handleLogout = () => { clearTokens(); navigate("/auth/login"); };

  const xp       = profile?.xp ?? 0;
  const streak   = profile?.streak_days ?? 0;
  const rank     = profile?.rank || "recruit";
  const rankDisp = rank.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  const isMac    = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <div className={`shell${collapsed ? " sb-collapsed" : ""}`}>
      {drawer && (
        <div className="sb-overlay" onClick={() => setDrawer(false)} aria-hidden="true" />
      )}

      <aside className={`sb${drawer ? " is-open" : ""}`}>
        {/* Brand + collapse toggle */}
        <div className="sb-brand-row">
          <Link to="/dashboard" className="sb-brand" onClick={() => setDrawer(false)}>
            <img
              src={collapsed ? "/static/logo/logoXakker.png" : "/static/logo/xakkerLogoWhite2.png"}
              alt="Xakker"
              className="sb-brand-img"
              onError={(e) => {
                e.currentTarget.src = "/static/logo/logoXakker.png";
                e.currentTarget.onerror = null;
              }}
            />
          </Link>
          <button
            type="button"
            className="sb-toggle"
            onClick={toggleCollapsed}
            title={collapsed ? (lang === "az" ? "Genişləndir" : "Expand") : (lang === "az" ? "Daralt" : "Collapse")}
          >
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Nav sections */}
        <nav className="sb-nav">
          <div className="sb-section">
            <div className="sb-label">Platform</div>
            {NAV_MAIN.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sb-link${isActive ? " is-active" : ""}`}
                onClick={() => setDrawer(false)}
                title={collapsed ? (item.label[lang] || item.label.az) : undefined}
              >
                <span className="sb-link-ico"><Icon name={item.icon} size={22} /></span>
                <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
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
                title={collapsed ? (item.label[lang] || item.label.az) : undefined}
              >
                <span className="sb-link-ico"><Icon name={item.icon} size={22} /></span>
                <span className="sb-link-label">{item.label[lang] || item.label.az}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sb-spacer" />

        {/* User */}
        <div className="sb-user" title={collapsed ? `${profile?.full_name || profile?.username || "Hacker"} — ${rankDisp}` : undefined}>
          <Avatar user={profile || { username: "X" }} size={36} rounded="md" />
          <div className="sb-user-info">
            <div className="sb-user-name">{profile?.full_name || profile?.username || "Hacker"}</div>
            <div className="sb-user-meta">{rankDisp} · {xp.toLocaleString()} XP</div>
          </div>
          <button
            className="sb-user-logout"
            onClick={handleLogout}
            title={lang === "az" ? "Çıxış" : "Logout"}
            type="button"
          >
            <Icon name="logout" size={14} />
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="tb">
          <button
            className="tb-burger"
            type="button"
            aria-label="Menyu"
            onClick={() => setDrawer(d => !d)}
          >
            ☰
          </button>

          <button
            className="tb-cmd"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Axtar"
          >
            <Icon name="search" size={14} />
            <span className="tb-cmd-label">
              {lang === "az" ? "Mission, kurs, route axtar..." : "Search missions, courses..."}
            </span>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </button>

          <div className="tb-right">
            {streak > 0 && <Chip tone="amber">🔥 {streak}d</Chip>}
            <Chip tone="accent">★ <strong className="tnum">{xp.toLocaleString()}</strong></Chip>
            <div className="tb-lang">
              <button
                type="button"
                className={`tb-lang-btn${lang === "az" ? " active" : ""}`}
                onClick={() => setLang("az")}
              >
                AZ
              </button>
              <button
                type="button"
                className={`tb-lang-btn${lang === "en" ? " active" : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>

      <CommandPalette />
    </div>
  );
}
