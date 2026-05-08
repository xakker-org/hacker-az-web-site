import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Sparkline from "../components/ui/Sparkline";
import Heatmap from "../components/ui/Heatmap";
import Avatar from "../components/ui/Avatar";
import { Chip, DiffBadge } from "../components/ui/Chip";
import Button from "../components/ui/Button";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";
import { clearTokens, getAccessToken } from "../utils/tokens";

const ACT_ICO = {
  task_complete: "✓",
  room_complete: "▣",
  badge_earned: "★",
  rank_up: "↑",
  exam_submit: "✎",
  default: "◍",
};

function aggregateLast30(days) {
  // days: [{date, value}]
  const arr = [];
  const now = new Date();
  const map = new Map((days || []).map(d => [d.date, Number(d.value) || 0]));
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    arr.push(map.get(iso) || 0);
  }
  return arr;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    cabinet: null,
    profile: null,
    stats: null,
    graph: null,
    activity: [],
    leaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        stats: statRes.value?.data || null,
        graph: graphRes.value?.data || null,
        activity: actRes.value?.data || [],
        leaderboard: lbRes.value?.data?.entries || [],
      });
    }).catch(() => setError("Kabinet yüklənmədi"))
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [navigate]);

  const profile = data.profile || data.cabinet?.profile || {};
  const stats = data.stats || data.cabinet?.stats || {};
  const days = data.graph?.days || [];
  const last30 = useMemo(() => aggregateLast30(days), [days]);

  const xp = stats.total_points_earned ?? profile.xp ?? 0;
  const accuracy = stats.accuracy_rate ?? stats.accuracy_percent ?? 0;
  const streak = profile.streak_days ?? stats.streak ?? 0;
  const rank = profile.rank || "Recruit";
  const rankPct = profile.rank_progress ?? 0;
  const nextRank = profile.next_rank;
  const xpToNext = profile.xp_to_next ?? 0;

  const rooms = data.cabinet?.rooms || [];
  const activeRooms = rooms.filter(r => (r.progress_percent || 0) > 0 && (r.progress_percent || 0) < 100).slice(0, 3);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Sabahınız xeyir" : hour < 18 ? "Günortanız xeyir" : "Axşamınız xeyir";
  const fullName = data.cabinet?.username || profile.full_name || profile.username || "Hacker";

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
            <div key={i} className={`span-${s}`}><TileSkeleton height={s >= 8 ? 240 : 140} /></div>
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
          <h1 className="page-title">{fullName} <span style={{ opacity: 0.6 }}>·</span> <span className="mono" style={{ fontSize: "0.7em", color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{rank}</span></h1>
          <div className="page-sub">Hər gün öyrən, irəliləyişini izlə.</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" as={Link} to="/missions">Missions</Button>
          <Button variant="accent" as={Link} to="/self-study">Davam et →</Button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 16, background: "rgba(255,122,138,0.08)", border: "1px solid rgba(255,122,138,0.3)", color: "var(--c-4)", borderRadius: 12 }}>
          {error}
        </div>
      )}

      <div className="bento">
        {/* Row 1 — 4 hero stat tiles */}
        <Tile span={3}>
          <Stat
            label="Total XP"
            value={xp.toLocaleString()}
            spark={last30}
            sparkTone="lime"
            size="lg"
            hint={`+${last30.slice(-7).reduce((s, x) => s + x, 0)} bu həftə`}
          />
        </Tile>

        <Tile span={3}>
          <Stat
            label="Streak"
            value={streak}
            unit="day"
            size="lg"
            hint={streak > 0 ? "Davam et 🔥" : "Bu gün başla"}
          />
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const v = last30[last30.length - 7 + i] || 0;
              return (
                <span key={i} style={{
                  flex: 1,
                  height: 22,
                  borderRadius: 4,
                  background: v > 0 ? "var(--accent)" : "var(--bg-elev)",
                  opacity: v > 0 ? 0.4 + Math.min(0.6, v / 10) : 1,
                }} />
              );
            })}
          </div>
        </Tile>

        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Stat label="Accuracy" value={Math.round(accuracy)} unit="%" size="lg" />
            <ProgressRing value={accuracy} size={64} strokeWidth={6} tone="mint" />
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
            {stats.correct_answers || 0} / {stats.total_questions_solved || 0} doğru
          </div>
        </Tile>

        <Tile span={3} as={Link} to="/profile" interactive>
          <TileHead eyebrow="Rank" title={rank} sub={nextRank ? `+${xpToNext} → ${nextRank}` : "Maximum"} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ProgressRing value={rankPct} size={68} strokeWidth={6} tone="accent" label={`${rankPct}%`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Bar value={rankPct} tone="accent" />
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
                {stats.leaderboard_rank ? `#${stats.leaderboard_rank} qlobal` : "Reytinqdə yoxsan"}
              </div>
            </div>
          </div>
        </Tile>

        {/* Row 2 — heatmap (8) + continue learning (4) */}
        <Tile span={8}>
          <TileHead
            eyebrow="Activity"
            title="Son 6 ay"
            sub={`${days.filter(d => Number(d.value) > 0).length} aktiv gün`}
            action={<Chip tone="accent" size="sm">★ {(last30.reduce((s, x) => s + x, 0)).toLocaleString()} XP / 30d</Chip>}
          />
          <Heatmap days={days} weeks={26} />
        </Tile>

        <Tile span={4}>
          <TileHead eyebrow="Davam et" title="Aktiv missionlar" action={<Link to="/rooms" style={{ fontSize: 11, color: "var(--ink-3)" }}>Hamısı →</Link>} />
          {activeRooms.length === 0 ? (
            <EmptyState icon="◎" title="Aktiv yoxdur" description="Yeni mission seç və öyrənməyə başla." action={<Button as={Link} to="/missions" variant="accent" size="sm">Mission seç</Button>} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              {activeRooms.map(r => (
                <Link key={r.id} to={`/rooms/${r.slug}`} style={{ display: "block", padding: 12, borderRadius: 12, background: "var(--bg-card-2)", border: "1px solid var(--line)", transition: "border-color 120ms" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>{r.icon || "🧪"}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</span>
                    <DiffBadge level={r.level} />
                  </div>
                  <Bar value={r.progress_percent || 0} tone="accent" rightCaption={`${r.progress_percent || 0}%`} />
                </Link>
              ))}
            </div>
          )}
        </Tile>

        {/* Row 3 — recent activity (6) + mini leaderboard (3) + recommended (3) */}
        <Tile span={6}>
          <TileHead eyebrow="Recent" title="Son fəaliyyət" action={<Link to="/self-study" style={{ fontSize: 11, color: "var(--ink-3)" }}>Hamısı →</Link>} />
          {data.activity.length === 0 ? (
            <EmptyState icon="◍" title="Hələ fəaliyyət yoxdur" description="Sual cavablamaqla başla." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.activity.slice(0, 6).map((it, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 5 ? "1px solid var(--line)" : "none" }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: it.is_correct ? "rgba(110,255,214,0.10)" : "rgba(255,122,138,0.10)",
                    border: `1px solid ${it.is_correct ? "rgba(110,255,214,0.28)" : "rgba(255,122,138,0.28)"}`,
                    color: it.is_correct ? "var(--c-1)" : "var(--c-4)",
                    display: "grid", placeItems: "center", fontSize: 13, flexShrink: 0,
                  }}>{it.is_correct ? "✓" : "✗"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.question_title || it.title}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{it.course_name || it.detail || ""}</div>
                  </div>
                  {it.points_earned > 0 && <span className="mono tnum" style={{ fontSize: 11, color: "var(--accent)" }}>+{it.points_earned}</span>}
                </div>
              ))}
            </div>
          )}
        </Tile>

        <Tile span={3}>
          <TileHead eyebrow="Top 5" title="Liderlik" action={<Link to="/leaderboard" style={{ fontSize: 11, color: "var(--ink-3)" }}>→</Link>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.leaderboard.slice(0, 5).map((u, i) => (
              <div key={u.username} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ width: 18, fontSize: 11, color: "var(--ink-4)", fontWeight: 700 }}>{i + 1}</span>
                <Avatar user={u} size={24} rounded="sm" />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: "var(--ink-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.username}</span>
                <span className="mono tnum" style={{ fontSize: 11, color: "var(--accent)" }}>{(u.xp || 0).toLocaleString()}</span>
              </div>
            ))}
            {data.leaderboard.length === 0 && (
              <div style={{ fontSize: 11, color: "var(--ink-4)", padding: "20px 0", textAlign: "center" }}>Reytinq yoxdur</div>
            )}
          </div>
        </Tile>

        <Tile span={3} variant="accent" as={Link} to="/self-study" interactive>
          <TileHead eyebrow="Today" title="Yeni sual" sub="Praktiki yoxlama" />
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 24 }}>✎</span>
            <Sparkline data={[2,4,3,6,5,7,8,6,9,12]} tone="lime" height={32} variant="area" />
          </div>
        </Tile>

        {/* Row 4 — full-width skill breakdown */}
        <Tile span={12}>
          <TileHead
            eyebrow="Performance"
            title="Bacarıq dağılımı"
            action={<Chip tone="neutral" size="sm">{stats.active_days || 0} aktiv gün</Chip>}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Doğru cavab</div>
              <Bar value={stats.correct_answers || 0} max={stats.total_questions_solved || 1} tone="mint" rightCaption={`${stats.correct_answers || 0}`} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Yanlış cavab</div>
              <Bar value={stats.wrong_answers || 0} max={stats.total_questions_solved || 1} tone="coral" rightCaption={`${stats.wrong_answers || 0}`} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Cəmi cəhd</div>
              <Bar value={stats.total_attempts || 0} max={Math.max(stats.total_attempts || 0, 100)} tone="amber" rightCaption={`${stats.total_attempts || 0}`} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Ən yaxşı gün</div>
              <Bar value={stats.best_day_points || 0} max={Math.max(stats.best_day_points || 0, 200)} tone="violet" rightCaption={`${stats.best_day_points || 0} XP`} />
            </div>
          </div>
        </Tile>
      </div>
    </AppShell>
  );
}
