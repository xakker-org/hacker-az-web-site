import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";
import ProgressRing from "../components/ui/ProgressRing";
import Avatar from "../components/ui/Avatar";
import AnimatedNumber from "../components/ui/AnimatedNumber";
import XKBar from "../components/ui/XKBar";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

/* ─── Translations ──────────────────────────────────────────── */
const T = {
  az: {
    greet: ["Sabahınız xeyir", "Günortanız xeyir", "Axşamınız xeyir"],
    sub: "Hər gün öyrən, irəliləyişini izlə.",
    missions: "Missiyalar",
    cont: "Davam et",
    xp: "Ümumi XP",
    streak: "Streak",
    accuracy: "Dəqiqlik",
    rank: "Rütbə",
    noActivityWeek: "Bu həftə aktivlik yoxdur",
    day: "gün",
    activity: "Aktivlik",
    last18w: "Son 18 həftə",
    activeDays: "aktiv gün",
    continueMission: "Davam et",
    recommended: "Tövsiyə olunan missiya",
    allMissions: "Hamısı",
    recentActivity: "Son fəaliyyət",
    yourAnswers: "Cavabladıqların",
    top5: "Top 5",
    leaderboard: "Reytinq",
    todayQuestion: "Bu gün",
    dailyQuestion: "Günün sualı",
    checkAnswer: "Yoxla",
    correct: "Doğru! +10 XP",
    wrong: "Yanlış — düzgün cavab işarələnib",
    noQuestions: "Sual tapılmadı",
    start: "Başla",
    global: "qlobal",
    notRanked: "Reytinqdə deyilsən",
    noActivity: "Hələ fəaliyyət yoxdur",
    startLearning: "Sual cavablamaqla başla.",
    noLeader: "Reytinq yoxdur",
    xpThisWeek: "XP bu həftə",
  },
  en: {
    greet: ["Good morning", "Good afternoon", "Good evening"],
    sub: "Learn daily, track your progress.",
    missions: "Missions",
    cont: "Continue",
    xp: "Total XP",
    streak: "Streak",
    accuracy: "Accuracy",
    rank: "Rank",
    noActivityWeek: "No activity this week",
    day: "day",
    activity: "Activity",
    last18w: "Last 18 weeks",
    activeDays: "active days",
    continueMission: "Continue",
    recommended: "Recommended mission",
    allMissions: "All",
    recentActivity: "Recent activity",
    yourAnswers: "Your answers",
    top5: "Top 5",
    leaderboard: "Leaderboard",
    todayQuestion: "Today",
    dailyQuestion: "Question of the day",
    checkAnswer: "Check",
    correct: "Correct! +10 XP",
    wrong: "Wrong — correct answer marked",
    noQuestions: "No questions found",
    start: "Start",
    global: "global",
    notRanked: "Not ranked",
    noActivity: "No activity yet",
    startLearning: "Start by answering questions.",
    noLeader: "No leaderboard yet",
    xpThisWeek: "XP this week",
  },
};

/* ─── Stat cards ────────────────────────────────────────────── */
function StatXP({ xp, weekXP, t }) {
  return (
    <div className="xk-card xk-card-int xk-stat" style={{ animationDelay: "80ms" }}>
      <div className="xk-stat-head">
        <span className="xk-stat-label">{t.xp}</span>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="xk-stat-ico">
          <path d="M13 2L4 14h7l-1 8 9-12h-7z"/>
        </svg>
      </div>
      <div className="xk-stat-value"><AnimatedNumber value={xp} /></div>
      <XKBar value={xp} max={Math.max(xp + 200, 500)} height={5} />
      <div className="xk-stat-note">
        {weekXP > 0 ? `+${weekXP} bu həftə` : t.noActivityWeek}
      </div>
    </div>
  );
}

function StatStreak({ streak, last7, t }) {
  const days = ["B","Ç","Ç","C","C","Ş","B"];
  return (
    <div className="xk-card xk-card-int xk-stat" style={{ animationDelay: "150ms" }}>
      <div className="xk-stat-head">
        <span className="xk-stat-label">{t.streak}</span>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="xk-stat-ico">
          <path d="M12 3c1 4 5 5 5 9a5 5 0 11-10 0c0-1.5.6-2.5 1.4-3.4C9 10 9.5 8.5 9 7c2 .5 3-1 3-4z"/>
        </svg>
      </div>
      <div className="xk-stat-value">
        <AnimatedNumber value={streak} /><span className="xk-stat-unit">{t.day}</span>
      </div>
      <div className="xk-week-dots">
        {days.map((d, i) => (
          <div key={i} className={`xk-week-dot ${last7[i] > 0 ? "on" : ""}`} style={{ animationDelay: `${600 + i * 50}ms` }}>
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatAccuracy({ accuracy, correct, total, t }) {
  return (
    <div className="xk-card xk-card-int xk-stat" style={{ animationDelay: "220ms" }}>
      <div className="xk-stat-body">
        <div>
          <div className="xk-stat-head" style={{ marginBottom: 8 }}>
            <span className="xk-stat-label">{t.accuracy}</span>
          </div>
          <div className="xk-stat-value">
            <AnimatedNumber value={Math.round(accuracy)} /><span className="xk-stat-unit">%</span>
          </div>
          <div className="xk-stat-note" style={{ marginTop: 8 }}>{correct} / {total} doğru</div>
        </div>
        <ProgressRing value={accuracy} size={82} strokeWidth={8} tone="accent" />
      </div>
    </div>
  );
}

function StatRank({ rank, rankPct, xpToNext, nextRank, globalRank, t }) {
  return (
    <div className="xk-card xk-card-int xk-stat" style={{ animationDelay: "290ms" }}>
      <div className="xk-stat-head">
        <span className="xk-stat-label">{t.rank}</span>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="xk-stat-ico">
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>
        </svg>
      </div>
      <div className="xk-rank-name">{rank.replace("_"," ")}</div>
      {nextRank && <div className="xk-rank-next">+{xpToNext} XP → {nextRank.replace("_"," ")}</div>}
      <div className="xk-rank-prog">
        <XKBar value={rankPct} max={100} height={5} />
        <span className="xk-rank-pct"><AnimatedNumber value={rankPct} />%</span>
      </div>
      <div className="xk-rank-global">
        {globalRank ? `#${globalRank} ${t.global}` : t.notRanked}
      </div>
    </div>
  );
}

/* ─── Continue card ─────────────────────────────────────────── */
const TRACK_COLORS = {
  web: "#ff3b3b", network: "#3b9bff", system: "#b06bff",
  crypto: "#34d399", recon: "#fbbf24",
};
function trackColor(track = "") {
  return TRACK_COLORS[(track || "").toLowerCase()] || "var(--accent)";
}

function ContinueCard({ rooms, t }) {
  if (!rooms.length) {
    return (
      <div className="xk-card xk-continue" style={{ animationDelay: "430ms" }}>
        <div className="xk-card-head">
          <div>
            <div className="xk-card-eyebrow">Davam et</div>
            <h3 className="xk-card-title">{t.recommended}</h3>
          </div>
          <Link to="/missions" className="xk-link">{t.allMissions} →</Link>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "24px 0", color: "var(--ink-3)", fontSize: 14 }}>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" opacity={0.4}>
            <path d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v4l3 2"/>
          </svg>
          <span>Aktiv missiya yoxdur</span>
          <Link to="/missions" className="xk-btn primary sm">Missiya seç →</Link>
        </div>
      </div>
    );
  }

  const featured = rooms[0];
  const suggestions = rooms.slice(1, 3);
  const mc = trackColor(featured.level);

  return (
    <div className="xk-card xk-continue" style={{ animationDelay: "430ms" }}>
      <div className="xk-card-head">
        <div>
          <div className="xk-card-eyebrow">Davam et</div>
          <h3 className="xk-card-title">{t.recommended}</h3>
        </div>
        <Link to="/missions" className="xk-link">{t.allMissions} →</Link>
      </div>

      <div className="xk-feat" style={{ "--feat-color": mc }}>
        <div className="xk-feat-top">
          <span className="xk-feat-track">{featured.level || "Mission"}</span>
          <span className="xk-badge xk-badge-muted">{featured.level || "Orta"}</span>
        </div>
        <div className="xk-feat-title">{featured.title}</div>
        <div className="xk-feat-meta">
          <span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/></svg>
            {featured.progress_percent || 0}% tamamlandı
          </span>
        </div>
        <Link to={`/rooms/${featured.slug}`} className="xk-btn primary block">
          {(featured.progress_percent || 0) > 0 ? "Davam et" : t.start} →
        </Link>
      </div>

      {suggestions.length > 0 && (
        <div className="xk-suggest">
          {suggestions.map((r) => (
            <Link key={r.id} to={`/rooms/${r.slug}`} className="xk-suggest-row" style={{ "--suggest-color": trackColor(r.level) }}>
              <span className="xk-suggest-dot" />
              <span className="xk-suggest-title">{r.title}</span>
              <span className="xk-suggest-xp">+XP</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Recent activity card ──────────────────────────────────── */
function RecentCard({ activity, t }) {
  return (
    <div className="xk-card" style={{ animationDelay: "500ms" }}>
      <div className="xk-card-head">
        <div>
          <div className="xk-card-eyebrow">Recent</div>
          <h3 className="xk-card-title">{t.yourAnswers}</h3>
        </div>
        <Link to="/self-study" className="xk-link">{t.allMissions} →</Link>
      </div>
      {activity.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 0", color: "var(--ink-3)", fontSize: 13, textAlign: "center" }}>
          <span style={{ fontSize: 24, opacity: 0.4 }}>◍</span>
          <strong style={{ color: "var(--ink-2)" }}>{t.noActivity}</strong>
          <span>{t.startLearning}</span>
        </div>
      ) : (
        <div className="xk-recent-list">
          {activity.slice(0, 5).map((it, i) => (
            <div key={i} className="xk-recent-row" style={{ animationDelay: `${520 + i * 70}ms` }}>
              <span className={`xk-recent-check ${it.is_correct ? "ok" : "no"}`}>
                {it.is_correct ? "✓" : "✗"}
              </span>
              <div className="xk-recent-meta">
                <span className="xk-recent-title">{it.question_title || it.title || "Sual"}</span>
                <span className="xk-recent-sub">{it.course_name || it.detail || ""}</span>
              </div>
              {(it.points_earned > 0) && (
                <span className="xk-recent-xp">+{it.points_earned}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Leaderboard card ──────────────────────────────────────── */
function LeaderCard({ leaderboard, currentUser, t }) {
  return (
    <div className="xk-card" style={{ animationDelay: "570ms" }}>
      <div className="xk-card-head">
        <div>
          <div className="xk-card-eyebrow">{t.top5}</div>
          <h3 className="xk-card-title">{t.leaderboard}</h3>
        </div>
        <Link to="/leaderboard" className="xk-link">→</Link>
      </div>
      {leaderboard.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--ink-3)", padding: "16px 0", textAlign: "center" }}>{t.noLeader}</div>
      ) : (
        <div className="xk-leader-list">
          {leaderboard.slice(0, 5).map((p, i) => {
            const isYou = p.username === currentUser;
            const rankCls = i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : "";
            return (
              <div key={p.username} className={`xk-leader-row ${isYou ? "you" : ""}`} style={{ animationDelay: `${590 + i * 70}ms` }}>
                <span className={`xk-leader-rank ${rankCls}`}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                </span>
                <Avatar user={p} size={28} rounded="sm" />
                <span className="xk-leader-name">
                  {p.username}
                  {isYou && <span className="xk-you-tag">sən</span>}
                </span>
                <span className="xk-leader-pts">{(p.xp || 0).toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Question of the day ───────────────────────────────────── */
function QuestionCard({ t }) {
  const [question, setQuestion] = useState(null);
  const [picked, setPicked]     = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    endpoints.questions({ limit: 10 })
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.results || []);
        if (list.length > 0) {
          const idx = Math.floor(Math.random() * Math.min(list.length, 10));
          setQuestion(list[idx]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const answered = picked !== null;

  if (loading) {
    return (
      <div className="xk-card xk-question-grad" style={{ animationDelay: "640ms" }}>
        <div className="xk-card-head">
          <div><div className="xk-card-eyebrow">{t.todayQuestion}</div><h3 className="xk-card-title">{t.dailyQuestion}</h3></div>
          <span className="xk-q-xp">+10 XP</span>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontSize: 13 }}>…</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="xk-card xk-question-grad" style={{ animationDelay: "640ms" }}>
        <div className="xk-card-head">
          <div><div className="xk-card-eyebrow">{t.todayQuestion}</div><h3 className="xk-card-title">{t.dailyQuestion}</h3></div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "24px 0", color: "var(--ink-3)", fontSize: 13, textAlign: "center" }}>
          <span>{t.noQuestions}</span>
          <Link to="/self-study" className="xk-btn outline sm">Suallara bax →</Link>
        </div>
      </div>
    );
  }

  const options = question.options || question.choices || [];
  const correctIndex = typeof question.correct_option === "number"
    ? question.correct_option
    : options.findIndex(o => o.is_correct);

  return (
    <div className="xk-card xk-question-grad" style={{ animationDelay: "640ms" }}>
      <div className="xk-card-head">
        <div>
          <div className="xk-card-eyebrow">{t.todayQuestion}</div>
          <h3 className="xk-card-title">{t.dailyQuestion}</h3>
        </div>
        <span className="xk-q-xp">+10 XP</span>
      </div>
      <p className="xk-q-prompt">
        {question.text || question.title || question.question || "Sualı yükləmək mümkün olmadı."}
      </p>
      {options.length > 0 ? (
        <>
          <div className="xk-q-opts">
            {options.map((o, i) => {
              const optText = typeof o === "string" ? o : (o.text || o.label || o.option || "");
              const isCorrect = i === correctIndex || (typeof o === "object" && o.is_correct);
              const cls = !answered ? "" : isCorrect ? "right" : i === picked ? "wrong" : "dim";
              return (
                <button key={i} className={`xk-q-opt ${cls}`} disabled={answered} onClick={() => setPicked(i)}>
                  <span className="xk-q-key">{String.fromCharCode(65 + i)}</span>
                  <span>{optText}</span>
                </button>
              );
            })}
          </div>
          {answered && (
            <div className={`xk-q-result ${picked === correctIndex ? "ok" : "no"}`}>
              {picked === correctIndex ? t.correct : t.wrong}
            </div>
          )}
        </>
      ) : (
        <Link to={`/self-study/question/${question.id}`} className="xk-btn primary block" style={{ marginTop: "auto" }}>
          Suala keç →
        </Link>
      )}
    </div>
  );
}

/* ─── Main dashboard page ────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { lang }  = useLang();
  const t         = T[lang] || T.az;

  const [data, setData] = useState({
    cabinet: null, profile: null, stats: null,
    graph: null, activity: [], leaderboard: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) { navigate("/auth/login"); return; }
    let mounted = true;
    Promise.allSettled([
      endpoints.cabinet(),
      endpoints.myProfile(),
      endpoints.profileStats(),
      endpoints.activityGraph(),
      endpoints.recentStudyActivity(10),
      endpoints.leaderboard(5),
    ]).then((res) => {
      if (!mounted) return;
      const [cabRes, profRes, statRes, graphRes, actRes, lbRes] = res;
      if (cabRes.status === "rejected" && cabRes.reason?.response?.status === 401) {
        clearTokens(); navigate("/auth/login"); return;
      }
      setData({
        cabinet:    cabRes.value?.data  || null,
        profile:    profRes.value?.data || null,
        stats:      statRes.value?.data || null,
        graph:      graphRes.value?.data || null,
        activity:   actRes.value?.data  || [],
        leaderboard: lbRes.value?.data?.entries || [],
      });
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [navigate]);

  /* ── Derived data ── */
  const profile  = data.profile || data.cabinet?.profile || {};
  const stats    = data.stats   || data.cabinet?.stats   || {};
  const days     = data.graph?.days || [];

  const xp       = stats.total_points_earned ?? profile.xp ?? 0;
  const accuracy = stats.accuracy_rate ?? stats.accuracy_percent ?? 0;
  const streak   = profile.streak_days ?? stats.streak ?? 0;
  const rank     = profile.rank || "Recruit";
  const rankPct  = profile.rank_progress ?? 0;
  const nextRank = profile.next_rank;
  const xpToNext = profile.xp_to_next ?? 0;
  const globalRank = stats.leaderboard_rank ?? null;
  const correct  = stats.correct_answers || 0;
  const total    = stats.total_questions_solved || 0;

  const currentUser = data.cabinet?.username || profile.username || "";

  /* Week XP (last 7 days) */
  const last7 = useMemo(() => {
    const map = new Map((days || []).map(d => [d.date, Number(d.value) || 0]));
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      arr.push(map.get(d.toISOString().slice(0, 10)) || 0);
    }
    return arr;
  }, [days]);

  const weekXP = last7.reduce((s, x) => s + x, 0);

  /* Active rooms for "continue" card */
  const rooms = data.cabinet?.rooms || [];
  const activeRooms = useMemo(() =>
    rooms.filter(r => (r.progress_percent || 0) < 100).slice(0, 3),
  [rooms]);

  /* Greeting */
  const hour     = new Date().getHours();
  const greet    = hour < 12 ? t.greet[0] : hour < 18 ? t.greet[1] : t.greet[2];
  const fullName = data.cabinet?.username || profile.full_name || profile.username || "Hacker";

  if (loading) {
    return (
      <AppShell>
        <div className="xk-greet">
          <div>
            <div className="xk-greet-eyebrow">{greet}</div>
            <h1 className="xk-greet-name" style={{ opacity: 0.4 }}>Yüklənir…</h1>
          </div>
        </div>
        <div className="xk-stats-grid">
          {[0,1,2,3].map(i => (
            <div key={i} className="xk-card" style={{ minHeight: 148, opacity: 0.4, animationDelay: `${i*70}ms` }} />
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Greeting ── */}
      <div className="xk-greet xk-reveal">
        <div>
          <div className="xk-greet-eyebrow">{greet}</div>
          <div className="xk-greet-row">
            <h1 className="xk-greet-name">{fullName}</h1>
            {rank && <span className="xk-rank-badge">{rank.replace("_"," ").toUpperCase()}</span>}
          </div>
          <p className="xk-greet-sub">{t.sub}</p>
        </div>
        <div className="xk-greet-actions">
          <Link to="/missions" className="xk-btn ghost">{t.missions}</Link>
          <Link to="/self-study" className="xk-btn primary">{t.cont} →</Link>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="xk-stats-grid">
        <StatXP xp={xp} weekXP={weekXP} t={t} />
        <StatStreak streak={streak} last7={last7} t={t} />
        <StatAccuracy accuracy={accuracy} correct={correct} total={total} t={t} />
        <StatRank rank={rank} rankPct={rankPct} xpToNext={xpToNext} nextRank={nextRank} globalRank={globalRank} t={t} />
      </div>

      {/* ── Mid: continue ── */}
      <div className="xk-mid-grid">
        <ContinueCard rooms={activeRooms} t={t} />
      </div>

      {/* ── Bottom: recent + leaderboard + question ── */}
      <div className="xk-bot-grid">
        <RecentCard activity={data.activity} t={t} />
        <LeaderCard leaderboard={data.leaderboard} currentUser={currentUser} t={t} />
        <QuestionCard t={t} />
      </div>
    </AppShell>
  );
}
