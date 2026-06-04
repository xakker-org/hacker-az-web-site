// screens.jsx — secondary screens
const { useState: useStateS } = React;

function ScreenHead({ eyebrow, title, sub, children }) {
  return (
    <div className="xk-screen-head xk-reveal">
      <div>
        <div className="xk-greet-eyebrow">{eyebrow}</div>
        <h1 className="xk-screen-title">{title}</h1>
        {sub && <p className="xk-greet-sub">{sub}</p>}
      </div>
      {children && <div className="xk-greet-actions">{children}</div>}
    </div>
  );
}

/* ---------------- Missions ---------------- */
function MissionsScreen({ anim, onNavigate, nav }) {
  const { missions } = window.XK;
  const tracks = ["Hamısı", "Web", "Network", "System", "Crypto", "Recon"];
  const [filter, setFilter] = useStateS("Hamısı");
  const list = filter === "Hamısı" ? missions : missions.filter((m) => m.track === filter);
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="Platforma" title="Missiyalar" sub="Bacarıqlarını real ssenarilərlə sına.">
        <button className="xk-btn primary"><Icon name="plus" size={16} /> Yeni missiya</button>
      </ScreenHead>
      <div className="xk-filters xk-reveal" style={{ animationDelay: "60ms" }}>
        {tracks.map((t) => (
          <button key={t} className={`xk-filter ${filter === t ? "on" : ""}`} onClick={() => setFilter(t)}>{t}</button>
        ))}
      </div>
      <div className="xk-mission-grid">
        {list.map((m, i) => (
          <Card key={m.id} delay={100 + i * 70} className="xk-mission" interactive style={{ "--mc": m.color }} onClick={() => nav.deep("mission", { id: m.id })}>
            <div className="xk-mission-bar" />
            <div className="xk-mission-top">
              <span className="xk-feat-track">{m.track}</span>
              <Badge tone="muted">{m.level}</Badge>
            </div>
            <h3 className="xk-mission-title">{m.title}</h3>
            <div className="xk-mission-meta">
              <span><Icon name="layers" size={14} /> {m.lessons} dərs</span>
              <span><Icon name="bolt" size={14} /> {m.xp} XP</span>
            </div>
            <div className="xk-mission-prog">
              <ProgressBar value={m.progress} max={100} enabled={anim} color={m.color} />
              <span className="xk-mission-pct">{m.progress}%</span>
            </div>
            <button className="xk-btn outline block">{m.progress > 0 ? "Davam et" : "Başla"} <Icon name="arrow" size={15} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Labs ---------------- */
function LabsScreen({ anim, nav }) {
  const { labs } = window.XK;
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="Platforma" title="Laboratoriyalar" sub="İzolyasiya olunmuş mühitdə hücum və müdafiə məşq et." />
      <div className="xk-lab-grid">
        {labs.map((l, i) => (
          <Card key={l.id} delay={100 + i * 70} className="xk-lab" interactive onClick={l.status === "Hazır" ? () => nav.deep("lab", { id: l.id }) : undefined}>
            <div className="xk-lab-icon"><Icon name="beaker" size={22} /></div>
            <div className="xk-lab-meta">
              <h3 className="xk-lab-title">{l.title}</h3>
              <div className="xk-lab-tags">
                <span className="xk-chip">{l.env}</span>
                <span className="xk-chip">{l.difficulty}</span>
              </div>
            </div>
            <div className="xk-lab-right">
              <Badge tone={l.status === "Hazır" ? "ok" : "muted"}>{l.status}</Badge>
              <button className="xk-btn outline sm" disabled={l.status !== "Hazır"}>
                {l.status === "Hazır" ? "İşə sal" : "Tezliklə"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Leaderboard ---------------- */
function LeaderboardScreen() {
  const { leaderboard } = window.XK;
  const extra = [
    ...leaderboard,
    { rank: 6, name: "ph4ntom", points: 0 },
    { rank: 7, name: "byte", points: 0 },
    { rank: 8, name: "0xA1", points: 0 },
  ];
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="İcma" title="Reytinq" sub="Qlobal sıralamada yerini gör." />
      <div className="xk-podium xk-reveal" style={{ animationDelay: "80ms" }}>
        {[extra[1], extra[0], extra[2]].map((p, idx) => {
          const place = p.rank;
          return (
            <div key={p.rank} className={`xk-podium-col p${place}`}>
              <Avatar name={p.name} size={place === 1 ? 56 : 46} color={p.you ? null : "#26262c"} />
              <span className="xk-podium-name">{p.name}</span>
              <span className="xk-podium-pts">{p.points} <Icon name="star" size={12} fill="currentColor" stroke="none" /></span>
              <div className="xk-podium-bar"><span>{place}</span></div>
            </div>
          );
        })}
      </div>
      <Card delay={160} className="xk-board">
        {extra.map((p, i) => (
          <div key={p.rank} className={`xk-leader-row wide ${p.you ? "you" : ""}`} style={{ animationDelay: `${180 + i * 55}ms` }}>
            <span className={`xk-leader-rank r${p.rank}`}>{p.rank}</span>
            <Avatar name={p.name} size={32} color={p.you ? null : "#26262c"} />
            <span className="xk-leader-name">{p.name}{p.you && <span className="xk-you-tag">sən</span>}</span>
            <div className="xk-leader-spark"><ProgressBar value={p.points} max={200} /></div>
            <span className="xk-leader-pts">{p.points}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function ProfileScreen({ anim, nav }) {
  const { user, paths } = window.XK;
  const achievements = [
    { icon: "flame", label: "İlk streak", got: true },
    { icon: "check", label: "İlk düzgün cavab", got: true },
    { icon: "bolt", label: "50 XP", got: true },
    { icon: "shield", label: "İlk missiya", got: false },
    { icon: "medal", label: "Top 3", got: false },
    { icon: "star", label: "500 XP", got: false },
  ];
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="İcma" title="Profil" />
      <div className="xk-profile-grid">
        <Card delay={80} className="xk-profile-card">
          <div className="xk-profile-banner" />
          <Avatar name={user.name} size={84} />
          <h2 className="xk-profile-name">{user.name}</h2>
          <Badge tone="accent">{user.rankKey.toUpperCase()}</Badge>
          <div className="xk-profile-stats">
            <div><b><AnimatedNumber value={user.xp} enabled={anim} /></b><span>XP</span></div>
            <div><b><AnimatedNumber value={user.points} enabled={anim} /></b><span>Bal</span></div>
            <div><b>#{user.globalRank}</b><span>Sıra</span></div>
          </div>
          <div className="xk-profile-rankbar">
            <div className="xk-rank-next">{user.rank} → {user.nextRank}</div>
            <ProgressBar value={user.rankProgress} max={100} enabled={anim} />
          </div>
        </Card>

        <div className="xk-profile-right">
          <Card delay={150} className="xk-ach-card">
            <h3 className="xk-card-title">Nailiyyətlər</h3>
            <div className="xk-ach-grid">
              {achievements.map((a, i) => (
                <div key={i} className={`xk-ach ${a.got ? "got" : "locked"}`} style={{ animationDelay: `${200 + i * 60}ms` }}>
                  <span className="xk-ach-ico"><Icon name={a.icon} size={20} /></span>
                  <span className="xk-ach-label">{a.label}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card delay={220} className="xk-path-card">
            <h3 className="xk-card-title">Öyrənmə yolları</h3>
            <div className="xk-path-list">
              {paths.map((p, i) => (
                <div key={p.id} className="xk-path-row" style={{ "--mc": p.color, animationDelay: `${280 + i * 60}ms` }}>
                  <span className="xk-path-dot" />
                  <span className="xk-path-name">{p.title}</span>
                  <div className="xk-path-bar"><ProgressBar value={p.done} max={p.missions} enabled={anim} color={p.color} /></div>
                  <span className="xk-path-frac">{p.done}/{p.missions}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Generic / placeholder screens ---------------- */
function PathsScreen({ anim, nav }) {
  const { paths } = window.XK;
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow="Platforma" title="Öyrənmə yolları" sub="Sıfırdan mütəxəssisə qədər strukturlu marşrutlar." />
      <div className="xk-mission-grid">
        {paths.map((p, i) => (
          <Card key={p.id} delay={100 + i * 80} className="xk-mission" interactive style={{ "--mc": p.color }} onClick={() => nav.deep("path", { id: p.id })}>
            <div className="xk-mission-bar" />
            <div className="xk-lab-icon"><Icon name="route" size={22} /></div>
            <h3 className="xk-mission-title">{p.title}</h3>
            <div className="xk-mission-meta"><span><Icon name="target" size={14} /> {p.missions} missiya</span></div>
            <div className="xk-mission-prog">
              <ProgressBar value={p.done} max={p.missions} enabled={anim} color={p.color} />
              <span className="xk-mission-pct">{p.done}/{p.missions}</span>
            </div>
            <button className="xk-btn outline block">Yola başla <Icon name="arrow" size={15} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SimpleScreen({ icon, title, eyebrow, sub }) {
  return (
    <div className="xk-screen">
      <ScreenHead eyebrow={eyebrow} title={title} sub={sub} />
      <Card delay={100} className="xk-empty-screen">
        <div className="xk-empty-ico"><Icon name={icon} size={30} /></div>
        <h3>Tezliklə</h3>
        <p>Bu bölmə hazırlanır. Hələlik Panel və Missiyalardan istifadə et.</p>
      </Card>
    </div>
  );
}

Object.assign(window, { MissionsScreen, LabsScreen, LeaderboardScreen, ProfileScreen, PathsScreen, SimpleScreen });
