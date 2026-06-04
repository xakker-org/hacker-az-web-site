// dashboard.jsx — main dashboard screen
const { useState: useStateDB } = React;

function GreetingHeader({ anim, onNavigate }) {
  const { user } = window.XK;
  const hour = 19;
  const greet = hour < 12 ? "Sabahınız xeyir" : hour < 18 ? "Günortanız xeyir" : "Axşamınız xeyir";
  return (
    <div className="xk-greet xk-reveal">
      <div className="xk-greet-left">
        <div className="xk-greet-eyebrow">{greet}</div>
        <div className="xk-greet-row">
          <h1 className="xk-greet-name">{user.name}</h1>
          <Badge tone="accent" className="xk-rank-badge">{user.rankKey.toUpperCase()}</Badge>
        </div>
        <p className="xk-greet-sub">Hər gün öyrən, irəliləyişini izlə.</p>
      </div>
      <div className="xk-greet-actions">
        <button className="xk-btn ghost" onClick={() => onNavigate("missions")}>Missiyalar</button>
        <button className="xk-btn primary" onClick={() => onNavigate("mission", { id: "m1" }, { push: true })}>
          Davam et <Icon name="arrow" size={17} />
        </button>
      </div>
    </div>
  );
}

function StatXP({ anim, delay }) {
  const { user } = window.XK;
  return (
    <Card delay={delay} className="xk-stat" interactive>
      <div className="xk-stat-head"><span className="xk-stat-label">Ümumi XP</span><Icon name="bolt" size={16} className="xk-stat-ico" /></div>
      <div className="xk-stat-value"><AnimatedNumber value={user.xp} enabled={anim} /></div>
      <ProgressBar value={user.xp} max={200} enabled={anim} />
      <div className="xk-stat-note">Bu həftə aktivlik yoxdur</div>
    </Card>
  );
}

function StatStreak({ anim, delay }) {
  const { user } = window.XK;
  return (
    <Card delay={delay} className="xk-stat" interactive>
      <div className="xk-stat-head"><span className="xk-stat-label">Streak</span><Icon name="flame" size={16} className="xk-stat-ico" /></div>
      <div className="xk-stat-value"><AnimatedNumber value={user.streak} enabled={anim} /><span className="xk-stat-unit">gün</span></div>
      <div className="xk-week-dots">
        {["B","Ç","Ç","C","C","Ş","B"].map((d, i) => (
          <div key={i} className={`xk-week-dot ${i === 6 ? "on" : ""}`} style={{ animationDelay: `${600 + i * 50}ms` }}>
            <span>{d}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StatAccuracy({ anim, delay }) {
  const { user } = window.XK;
  return (
    <Card delay={delay} className="xk-stat xk-stat-acc" interactive>
      <div className="xk-stat-body">
        <div>
          <div className="xk-stat-head"><span className="xk-stat-label">Dəqiqlik</span></div>
          <div className="xk-stat-value"><AnimatedNumber value={user.accuracy} enabled={anim} /><span className="xk-stat-unit">%</span></div>
          <div className="xk-stat-note">{user.correct} / {user.total} doğru</div>
        </div>
        <Ring value={user.accuracy} size={84} stroke={8} enabled={anim} />
      </div>
    </Card>
  );
}

function StatRank({ anim, delay }) {
  const { user } = window.XK;
  return (
    <Card delay={delay} className="xk-stat xk-stat-rank" interactive>
      <div className="xk-stat-head"><span className="xk-stat-label">Rütbə</span><Icon name="shield" size={16} className="xk-stat-ico" /></div>
      <div className="xk-rank-name">{user.rank}</div>
      <div className="xk-rank-next">+{user.xpToNext} XP → {user.nextRank}</div>
      <div className="xk-rank-prog">
        <ProgressBar value={user.rankProgress} max={100} enabled={anim} />
        <span className="xk-rank-pct"><AnimatedNumber value={user.rankProgress} enabled={anim} />%</span>
      </div>
      <div className="xk-rank-global">#{user.globalRank} qlobal</div>
    </Card>
  );
}

function ActivityCard({ anim, delay }) {
  const { activity, user } = window.XK;
  return (
    <Card delay={delay} className="xk-activity">
      <div className="xk-card-head">
        <div>
          <div className="xk-card-eyebrow">Aktivlik</div>
          <h3 className="xk-card-title">Son 18 həftə</h3>
        </div>
        <div className="xk-chip-row">
          <span className="xk-chip"><Icon name="flame" size={13} /> {user.streak}g streak</span>
          <span className="xk-chip accent">+0 XP bu həftə</span>
        </div>
      </div>
      <Heatmap days={activity} enabled={anim} />
      <div className="xk-activity-foot">
        <span><b>{user.xp}</b> XP</span>
        <span className="xk-dot-sep">·</span>
        <span><b>1</b> aktiv gün / 126</span>
        <HeatLegend />
      </div>
    </Card>
  );
}

function ContinueCard({ anim, delay, onNavigate }) {
  const { missions } = window.XK;
  const featured = missions[0];
  return (
    <Card delay={delay} className="xk-continue">
      <div className="xk-card-head">
        <div>
          <div className="xk-card-eyebrow">Davam et</div>
          <h3 className="xk-card-title">Tövsiyə olunan missiya</h3>
        </div>
        <button className="xk-link" onClick={() => onNavigate("missions")}>Hamısı <Icon name="arrow" size={14} /></button>
      </div>

      <div className="xk-feat" style={{ "--mc": featured.color }}>
        <div className="xk-feat-top">
          <span className="xk-feat-track">{featured.track}</span>
          <Badge tone="muted">{featured.level}</Badge>
        </div>
        <div className="xk-feat-title">{featured.title}</div>
        <div className="xk-feat-meta">
          <span><Icon name="layers" size={14} /> {featured.lessons} dərs</span>
          <span><Icon name="bolt" size={14} /> {featured.xp} XP</span>
        </div>
        <button className="xk-btn primary block" onClick={() => onNavigate("mission", { id: featured.id }, { push: true })}>
          Missiyanı başlat <Icon name="arrow" size={16} />
        </button>
      </div>

      <div className="xk-suggest">
        {missions.slice(1, 3).map((m, i) => (
          <button key={m.id} className="xk-suggest-row" style={{ "--mc": m.color }} onClick={() => onNavigate("mission", { id: m.id }, { push: true })}>
            <span className="xk-suggest-dot" />
            <span className="xk-suggest-title">{m.title}</span>
            <span className="xk-suggest-xp">+{m.xp}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function RecentCard({ delay, onNavigate }) {
  const { recent } = window.XK;
  return (
    <Card delay={delay} className="xk-recent">
      <div className="xk-card-head">
        <div><div className="xk-card-eyebrow">Son fəaliyyət</div><h3 className="xk-card-title">Cavabladıqların</h3></div>
        <button className="xk-link" onClick={() => onNavigate("missions")}>Hamısı <Icon name="arrow" size={14} /></button>
      </div>
      <div className="xk-recent-list">
        {recent.map((r, i) => (
          <div key={r.id} className="xk-recent-row" style={{ animationDelay: `${delay + 120 + i * 70}ms` }}>
            <span className="xk-recent-check"><Icon name="check" size={14} /></span>
            <div className="xk-recent-meta">
              <span className="xk-recent-title">{r.title}</span>
              <span className="xk-recent-sub">{r.sub}</span>
            </div>
            <span className="xk-recent-xp">+{r.xp}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LeaderCard({ delay, onNavigate }) {
  const { leaderboard } = window.XK;
  return (
    <Card delay={delay} className="xk-leader">
      <div className="xk-card-head">
        <div><div className="xk-card-eyebrow">Top 5</div><h3 className="xk-card-title">Reytinq</h3></div>
        <button className="xk-link" onClick={() => onNavigate("leaderboard")}><Icon name="arrow" size={14} /></button>
      </div>
      <div className="xk-leader-list">
        {leaderboard.map((p, i) => (
          <div key={p.rank} className={`xk-leader-row ${p.you ? "you" : ""}`} style={{ animationDelay: `${delay + 120 + i * 70}ms` }}>
            <span className={`xk-leader-rank r${p.rank}`}>{p.rank}</span>
            <Avatar name={p.name} size={28} color={p.you ? null : "#2a2a30"} />
            <span className="xk-leader-name">{p.name}{p.you && <span className="xk-you-tag">sən</span>}</span>
            <span className="xk-leader-pts">{p.points}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuestionCard({ delay }) {
  const { question } = window.XK;
  const [picked, setPicked] = useStateDB(null);
  const answered = picked !== null;
  return (
    <Card delay={delay} className="xk-question">
      <div className="xk-card-head">
        <div><div className="xk-card-eyebrow">Bu gün</div><h3 className="xk-card-title">{question.title}</h3></div>
        <span className="xk-q-xp">+{question.xp} XP</span>
      </div>
      <p className="xk-q-prompt">{question.prompt}</p>
      <div className="xk-q-opts">
        {question.options.map((o, i) => {
          const correct = i === question.correct;
          const cls = !answered ? "" : correct ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button key={i} className={`xk-q-opt ${cls}`} disabled={answered} onClick={() => setPicked(i)}>
              <span className="xk-q-key">{String.fromCharCode(65 + i)}</span>
              <span>{o}</span>
              {answered && correct && <Icon name="check" size={15} className="xk-q-mark" />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`xk-q-result ${picked === question.correct ? "ok" : "no"}`}>
          {picked === question.correct ? "Doğru! +10 XP" : "Yanlış — düzgün cavab işarələnib"}
        </div>
      )}
    </Card>
  );
}

function Dashboard({ anim, onNavigate }) {
  return (
    <div className="xk-dash">
      <GreetingHeader anim={anim} onNavigate={onNavigate} />
      <div className="xk-stats-grid">
        <StatXP anim={anim} delay={80} />
        <StatStreak anim={anim} delay={150} />
        <StatAccuracy anim={anim} delay={220} />
        <StatRank anim={anim} delay={290} />
      </div>
      <div className="xk-mid-grid">
        <ActivityCard anim={anim} delay={360} />
        <ContinueCard anim={anim} delay={430} onNavigate={onNavigate} />
      </div>
      <div className="xk-bot-grid">
        <RecentCard delay={500} onNavigate={onNavigate} />
        <LeaderCard delay={570} onNavigate={onNavigate} />
        <QuestionCard delay={640} />
      </div>
    </div>
  );
}

window.Dashboard = Dashboard;
