// sidebar.jsx — navigation chrome
const { useState: useStateSB } = React;

function Logo({ collapsed }) {
  return (
    <div className="xk-logo">
      <div className="xk-logo-mark">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M4 4l16 16M20 4L4 20" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      {!collapsed && (
        <div className="xk-logo-text">
          <span className="xk-logo-name">xakker<span className="xk-accent">.org</span></span>
          <span className="xk-logo-tag">cybersecurity · öyrən · praktika</span>
        </div>
      )}
    </div>
  );
}

function NavItem({ item, active, collapsed, onClick }) {
  return (
    <button className={`xk-nav-item ${active ? "active" : ""}`} onClick={onClick} title={collapsed ? item.label : undefined}>
      <span className="xk-nav-ico"><Icon name={item.icon} size={19} /></span>
      {!collapsed && <span className="xk-nav-label">{item.label}</span>}
      {!collapsed && item.badge && <span className="xk-nav-badge">{item.badge}</span>}
      {active && <span className="xk-nav-active" />}
    </button>
  );
}

function Sidebar({ current, onNavigate, collapsed, onToggle }) {
  const { nav, user } = window.XK;
  return (
    <aside className={`xk-sidebar ${collapsed ? "collapsed" : ""}`}>
      <Logo collapsed={collapsed} />

      <div className="xk-nav-scroll">
        <div className="xk-nav-group">
          {!collapsed && <div className="xk-nav-heading">Platforma</div>}
          {nav.platform.map((it) => (
            <NavItem key={it.id} item={it} active={current === it.id} collapsed={collapsed}
              onClick={() => onNavigate(it.id)} />
          ))}
        </div>
        <div className="xk-nav-group">
          {!collapsed && <div className="xk-nav-heading">İcma</div>}
          {nav.community.map((it) => (
            <NavItem key={it.id} item={it} active={current === it.id} collapsed={collapsed}
              onClick={() => onNavigate(it.id)} />
          ))}
        </div>
      </div>

      <div className="xk-sidebar-foot">
        <button className="xk-collapse-btn" onClick={onToggle}>
          <Icon name="chevron" size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .3s" }} />
          {!collapsed && <span>Yığ</span>}
        </button>
        <div className="xk-user-chip" onClick={() => onNavigate("profile")}>
          <Avatar name={user.name} size={36} />
          {!collapsed && (
            <div className="xk-user-meta">
              <span className="xk-user-name">{user.name}</span>
              <span className="xk-user-sub">{user.rank} · {user.points}</span>
            </div>
          )}
          {!collapsed && <Icon name="logout" size={16} className="xk-user-out" />}
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onNavigate }) {
  const { user } = window.XK;
  const [lang, setLang] = useStateSB("AZ");
  return (
    <header className="xk-topbar">
      <button className="xk-search">
        <Icon name="search" size={17} />
        <span className="xk-search-ph">Missiya, kurs axtar…</span>
        <span className="xk-kbd"><kbd>Ctrl</kbd><kbd>K</kbd></span>
      </button>
      <div className="xk-topbar-right">
        <div className="xk-pill xk-pill-streak">
          <Icon name="flame" size={15} /> <b>{user.streak}g</b>
        </div>
        <div className="xk-pill xk-pill-points">
          <Icon name="star" size={14} fill="currentColor" stroke="none" /> <b>{user.points}</b>
        </div>
        <div className="xk-lang">
          <button className={lang === "AZ" ? "on" : ""} onClick={() => setLang("AZ")}>AZ</button>
          <button className={lang === "EN" ? "on" : ""} onClick={() => setLang("EN")}>EN</button>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, Topbar });
