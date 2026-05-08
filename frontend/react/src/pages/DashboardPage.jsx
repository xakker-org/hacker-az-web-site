import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";

const T = {
  az: {
    greet: ["Sabahınız xeyir", "Günortanız xeyir", "Axşamınız xeyir"],
    sub: "Hər gün öyrən, irəliləyişini izlə.",
    missions: "Missions",
    cont: "Davam et →",
    accuracy: "Dəqiqlik",
    streak: "Streak",
    rank: "Rank",
    activity: "Fəaliyyət",
    last35: "Son 35 gün",
    active: "aktiv",
    xpMonth: "XP bu ay",
    activeMissions: "Aktiv missionlar",
    allRooms: "Hamısı →",
    selectMission: "Mission seç",
    noActive: "Aktiv yoxdur",
    pickMission: "Yeni mission seç.",
    recentActivity: "Son fəaliyyət",
    allActivity: "Hamısı →",
    noActivity: "Hələ fəaliyyət yoxdur",
    startActivity: "Sual cavablamaqla başla.",
    top5: "Top 5",
    leaderboard: "Liderlik",
    newQuestion: "Yeni sual",
    practiceCheck: "Praktiki yoxlama",
    skillBreakdown: "Bacarıq dağılımı",
    correct: "Doğru cavab",
    wrong: "Yanlış cavab",
    attempts: "Cəmi cəhd",
    bestDay: "Ən yaxşı gün",
    global: "qlobal",
    notInRank: "Reytinqdə yoxsan",
    noLeaderboard: "Reytinq yoxdur",
    thisWeek: "bu həftə",
    noActivityWeek: "Bu həftə aktivlik yoxdur",
    correctOf: "doğru",
  },
  en: {
    greet: ["Good morning", "Good afternoon", "Good evening"],
    sub: "Learn daily, track your progress.",
    missions: "Missions",
    cont: "Continue →",
    accuracy: "Accuracy",
    streak: "Streak",
    rank: "Rank",
    activity: "Activity",
    last35: "Last 35 days",
    active: "active",
    xpMonth: "XP this month",
    activeMissions: "Active missions",
    allRooms: "All →",
    selectMission: "Select mission",
    noActive: "Nothing active",
    pickMission: "Pick a new mission.",
    recentActivity: "Recent activity",
    allActivity: "All →",
    noActivity: "No activity yet",
    startActivity: "Start by answering questions.",
    top5: "Top 5",
    leaderboard: "Leaderboard",
    newQuestion: "New question",
    practiceCheck: "Practice check",
    skillBreakdown: "Skill breakdown",
    correct: "Correct answers",
    wrong: "Wrong answers",
    attempts: "Total attempts",
    bestDay: "Best day",
    global: "global",
    notInRank: "Not in ranking",
    noLeaderboard: "No ranking yet",
    thisWeek: "this week",
    noActivityWeek: "No activity this week",
    correctOf: "correct",
  },
};
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Sparkline from "../components/ui/Sparkline";
import ActivityBars from "../components/ui/ActivityBars";
import Avatar from "../components/ui/Avatar";
import { Chip, DiffBadge } from "../components/ui/Chip";
import Button from "../components/ui/Button";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

function aggregateLast30(days) {
  const arr = [];
  const now = new Date();
  const map = new Map((days || []).map(d => [d.date, Number(d.value) || 0]));
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    arr.push(map.get(d.toISOString().slice(0, 10)) || 0);
  }
  return arr;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [data, setData] = useState({
    cabinet: null, profile: null, stats: null,
    graph: null, activity: [], leaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

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
        cabinet: cabRes.value?.data || null,
        profile: profRes.value?.data || null,
        stats:   statRes.value?.data || null,
        graph:   graphRes.value?.data || null,
        activity: actRes.value?.data || [],
        leaderboard: lbRes.value?.data?.entries || [],
      });
    }).catch(() => setError("Kabinet yüklənmədi"))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [navigate]);

  const profile = data.profile || data.cabinet?.profile || {};
  const stats   = data.stats   || data.cabinet?.stats   || {};
  const days    = data.graph?.days || [];
  const last30  = useMemo(() => aggregateLast30(days), [days]);

  const xp       = stats.total_points_earned ?? profile.xp ?? 0;
  const accuracy = stats.accuracy_rate ?? stats.accuracy_percent ?? 0;
  const streak   = profile.streak_days ?? stats.streak ?? 0;
  const rank     = profile.rank || "Recruit";
  const rankPct  = profile.rank_progress ?? 0;
  const nextRank = profile.next_rank;
  const xpToNext = profile.xp_to_next ?? 0;

  const rooms       = data.cabinet?.rooms || [];
  const activeRooms = rooms.filter(r => (r.progress_percent || 0) > 0 && (r.progress_percent || 0) < 100).slice(0, 3);

  const hour     = new Date().getHours();
  const greet    = hour < 12 ? t.greet[0] : hour < 18 ? t.greet[1] : t.greet[2];
  const fullName = data.cabinet?.username || profile.full_name || profile.username || "Hacker";
  const weekXP   = last30.slice(-7).reduce((s, x) => s + x, 0);
  const activeDays = days.filter(d => Number(d.value) > 0).length;

  if (loading) {
    return (
      <AppShell>
        <div className="page-head">
          <div>
            <div className="page-eyebrow">Dashboard</div>
            <h1 className="page-title">Yüklənir...</h1>
          </div>
        </div>
        <div className="bento">
          {[3,3,3,3,8,4,6,3,3,12].map((s, i) => (
            <div key={i} className={`span-${s}`}><TileSkeleton height={s >= 8 ? 240 : 130} /></div>
          ))}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">{greet}</div>
          <h1 className="page-title">
            {fullName}
            {rank && (
              <span className="mono" style={{
                fontSize: "0.55em", color: "var(--accent)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                marginLeft: 12, fontWeight: 700,
                background: "var(--accent-soft)",
                border: "1px solid var(--accent-ring)",
                borderRadius: 6, padding: "2px 8px",
                verticalAlign: "middle",
              }}>
                {rank.replace("_"," ")}
              </span>
            )}
          </h1>
          <div className="page-sub">{t.sub}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" as={Link} to="/missions">{t.missions}</Button>
          <Button variant="accent" as={Link} to="/self-study">{t.cont}</Button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "10px 16px", marginBottom: 16,
          background: "rgba(255,36,66,0.08)", border: "1px solid rgba(255,36,66,0.28)",
          color: "var(--accent)", borderRadius: 12, fontSize: 13,
        }}>{error}</div>
      )}

      <div className="bento">

        {/* ── 4 hero stats ── */}
        <Tile span={3} style={{ background: "linear-gradient(135deg, rgba(255,36,66,0.08) 0%, var(--bg-card) 100%)" }}>
          <Stat
            label="Total XP"
            value={xp.toLocaleString()}
            spark={last30}
            sparkTone="coral"
            size="lg"
            hint={weekXP > 0 ? `+${weekXP} bu həftə` : "Bu həftə aktivlik yoxdur"}
          />
        </Tile>

        <Tile span={3}>
          <Stat label={t.streak} value={streak} unit="day" size="lg" hint={streak > 0 ? "🔥" : ""} />
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const v = last30[last30.length - 7 + i] || 0;
              return (
                <span key={i} style={{
                  flex: 1, height: 20, borderRadius: 4,
                  background: v > 0 ? "var(--accent)" : "var(--bg-elev)",
                  opacity: v > 0 ? 0.25 + Math.min(0.75, v / 10) : 1,
                  transition: "opacity 120ms",
                }} />
              );
            })}
          </div>
        </Tile>

        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Stat label={t.accuracy} value={Math.round(accuracy)} unit="%" size="lg" />
            <ProgressRing value={accuracy} size={60} strokeWidth={7} tone="accent" />
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            {stats.correct_answers || 0} / {stats.total_questions_solved || 0} doğru
          </div>
        </Tile>

        <Tile span={3} as={Link} to="/profile" interactive>
          <TileHead
            eyebrow={t.rank}
            title={rank.replace("_"," ")}
            sub={nextRank ? `+${xpToNext} → ${nextRank.replace("_"," ")}` : "Maximum rank"}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
            <ProgressRing value={rankPct} size={60} strokeWidth={6} tone="accent" label={`${rankPct}%`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Bar value={rankPct} tone="accent" />
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
                {stats.leaderboard_rank ? `#${stats.leaderboard_rank} qlobal` : "Reytinqdə yoxsan"}
              </div>
            </div>
          </div>
        </Tile>

        {/* ── Activity bars ── */}
        <Tile span={8}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>
                {t.activity}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.2 }}>
                {t.last35}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>
                {activeDays} {t.active} · {last30.reduce((s, x) => s + x, 0).toLocaleString()} {t.xpMonth}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {streak > 0 && <Chip tone="amber" size="sm">🔥 {streak}d streak</Chip>}
              <Chip tone="accent" size="sm">+{weekXP > 0 ? weekXP : 0} XP bu həftə</Chip>
            </div>
          </div>
          <ActivityBars days={days} weeks={5} />
        </Tile>

        {/* ── Active rooms ── */}
        <Tile span={4}>
          <TileHead
            eyebrow={lang === "az" ? "Davam et" : "Continue"}
            title={t.activeMissions}
            action={<Link to="/rooms" style={{ fontSize: 11, color: "var(--ink-3)" }}>{t.allRooms}</Link>}
          />
          {activeRooms.length === 0 ? (
            <EmptyState
              icon="◎"
              title={t.noActive}
              description={t.pickMission}
              action={<Button as={Link} to="/missions" variant="accent" size="sm">{t.selectMission}</Button>}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              {activeRooms.map(r => (
                <Link key={r.id} to={`/rooms/${r.slug}`} style={{
                  display: "block", padding: 12, borderRadius: 12,
                  background: "var(--bg-card-2)", border: "1px solid var(--line)",
                  textDecoration: "none",
                  transition: "border-color var(--dur-1), background var(--dur-1)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-ring)"; e.currentTarget.style.background = "var(--bg-elev)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--bg-card-2)"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{r.icon || "🧪"}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.title}
                    </span>
                    <DiffBadge level={r.level} />
                  </div>
                  <Bar value={r.progress_percent || 0} tone="accent" rightCaption={`${r.progress_percent || 0}%`} />
                </Link>
              ))}
            </div>
          )}
        </Tile>

        {/* ── Recent activity ── */}
        <Tile span={6}>
          <TileHead
            eyebrow="Recent"
            title={t.recentActivity}
            action={<Link to="/self-study" style={{ fontSize: 11, color: "var(--ink-3)" }}>{t.allActivity}</Link>}
          />
          {data.activity.length === 0 ? (
            <EmptyState icon="◍" title={t.noActivity} description={t.startActivity} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.activity.slice(0, 6).map((it, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 0",
                  borderBottom: i < 5 ? "1px solid var(--line)" : "none",
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: it.is_correct ? "rgba(110,255,214,0.08)" : "rgba(255,122,138,0.08)",
                    border: `1px solid ${it.is_correct ? "rgba(110,255,214,0.25)" : "rgba(255,122,138,0.25)"}`,
                    color: it.is_correct ? "var(--ok)" : "var(--bad)",
                    display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700,
                  }}>{it.is_correct ? "✓" : "✗"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.question_title || it.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                      {it.course_name || it.detail || ""}
                    </div>
                  </div>
                  {it.points_earned > 0 && (
                    <span className="mono tnum" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700 }}>
                      +{it.points_earned}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Tile>

        {/* ── Top 5 ── */}
        <Tile span={3}>
          <TileHead
            eyebrow={t.top5}
            title={t.leaderboard}
            action={<Link to="/leaderboard" style={{ fontSize: 11, color: "var(--ink-3)" }}>→</Link>}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.leaderboard.slice(0, 5).map((u, i) => (
              <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{
                  width: 22, fontSize: 11, fontWeight: 800,
                  color: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "var(--ink-4)",
                  flexShrink: 0,
                }}>
                  {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                </span>
                <Avatar user={u} size={24} rounded="sm" />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.username}
                </span>
                <span className="mono tnum" style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>
                  {(u.xp || 0).toLocaleString()}
                </span>
              </div>
            ))}
            {data.leaderboard.length === 0 && (
              <div style={{ fontSize: 11, color: "var(--ink-4)", padding: "16px 0", textAlign: "center" }}>
                {t.noLeaderboard}
              </div>
            )}
          </div>
        </Tile>

        {/* ── CTA ── */}
        <Tile span={3} variant="accent" as={Link} to="/self-study" interactive>
          <TileHead eyebrow="Today" title={t.newQuestion} sub={t.practiceCheck} />
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 28 }}>✎</span>
            <Sparkline data={[2,4,3,6,5,7,8,6,9,12]} tone="coral" height={32} variant="area" />
          </div>
        </Tile>

        {/* ── Skill breakdown ── */}
        <Tile span={12}>
          <TileHead
            eyebrow="Performance"
            title={t.skillBreakdown}
            action={<Chip tone="accent" size="sm">{activeDays} {t.active}</Chip>}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { label: t.correct,  value: stats.correct_answers || 0,   max: stats.total_questions_solved || 1, tone: "mint",   caption: `${stats.correct_answers || 0}` },
              { label: t.wrong,    value: stats.wrong_answers || 0,     max: stats.total_questions_solved || 1, tone: "coral",  caption: `${stats.wrong_answers || 0}` },
              { label: t.attempts, value: stats.total_attempts || 0,    max: Math.max(stats.total_attempts || 0, 100), tone: "amber", caption: `${stats.total_attempts || 0}` },
              { label: t.bestDay,  value: stats.best_day_points || 0,   max: Math.max(stats.best_day_points || 0, 200), tone: "violet", caption: `${stats.best_day_points || 0} XP` },
            ].map(({ label, value, max, tone, caption }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  {label}
                </div>
                <Bar value={value} max={max} tone={tone} rightCaption={caption} />
              </div>
            ))}
          </div>
        </Tile>

      </div>
    </AppShell>
  );
}
