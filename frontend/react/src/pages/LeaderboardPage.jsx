import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";

const T = {
  az: {
    eyebrow: "İcma", title: "Reytinq", sub: "Qlobal sıralamada yerini gör.",
    you: "sən", loading: "Yüklənir...", notFound: "Heç kim tapılmadı",
  },
  en: {
    eyebrow: "Community", title: "Leaderboard", sub: "See your position in the global rankings.",
    you: "you", loading: "Loading...", notFound: "No one found",
  },
};

function initials(u) { return (u || "?").charAt(0).toUpperCase(); }

const SORT_TABS = [
  { v: "xp", l: "XP" }, { v: "tasks", l: "Tasks" },
  { v: "rooms", l: "Rooms" }, { v: "streak", l: "Streak" },
];

export default function LeaderboardPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [entries, setEntries] = useState([]);
  const [me, setMe]           = useState(null);
  const [tab, setTab]         = useState("xp");
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    let ok = true;
    Promise.all([
      endpoints.leaderboard(100),
      endpoints.me().catch(() => null),
    ]).then(([lb, m]) => {
      if (!ok) return;
      setEntries(lb.data?.entries || []);
      setMe(m?.data?.username || null);
    }).finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const sorted = useMemo(() => {
    const a = [...entries];
    if (tab === "tasks")  return a.sort((x, y) => (y.tasks_completed || 0) - (x.tasks_completed || 0));
    if (tab === "rooms")  return a.sort((x, y) => (y.rooms_completed || 0) - (x.rooms_completed || 0));
    if (tab === "streak") return a.sort((x, y) => (y.streak_days || 0) - (x.streak_days || 0));
    return a;
  }, [entries, tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(e => e.username?.toLowerCase().includes(q));
  }, [sorted, search]);

  const top3 = sorted.slice(0, 3);
  function val(e) {
    if (tab === "tasks")  return e.tasks_completed || 0;
    if (tab === "rooms")  return e.rooms_completed || 0;
    if (tab === "streak") return e.streak_days || 0;
    return e.xp || 0;
  }
  const maxVal = val(sorted[0] || {}) || 1;

  /* Podium: #2 left, #1 center, #3 right */
  const podiumOrder = [top3[1], top3[0], top3[2]];
  const podiumRank  = [2, 1, 3];

  return (
    <AppShell>
      <div className="xk-screen">
        {/* Head */}
        <div className="xk-screen-head xk-reveal">
          <div>
            <div className="xk-greet-eyebrow">{t.eyebrow}</div>
            <h1 className="xk-screen-title">{t.title}</h1>
            <p className="xk-greet-sub">{t.sub}</p>
          </div>
        </div>

        {loading ? <TileSkeleton height={500} /> : (
          <>
            {/* Podium */}
            {top3.length >= 2 && (
              <div className="xk-podium xk-reveal" style={{ animationDelay: "80ms" }}>
                {podiumOrder.map((u, idx) => {
                  if (!u) return <div key={idx} className={`xk-podium-col p${podiumRank[idx]}`} />;
                  const rank  = podiumRank[idx];
                  const isYou = u.username === me;
                  return (
                    <div key={u.username} className={`xk-podium-col p${rank}`}>
                      <div className="xk-avatar" style={{
                        width: rank === 1 ? 56 : 46, height: rank === 1 ? 56 : 46,
                        fontSize: rank === 1 ? 22 : 18,
                        background: isYou
                          ? "linear-gradient(135deg, var(--accent), #7a1717)"
                          : rank === 1 ? "linear-gradient(135deg, rgba(var(--accent-rgb),.4), rgba(var(--accent-rgb),.1))" : "#26262c",
                        border: rank === 1 ? "2px solid rgba(var(--accent-rgb),.5)" : "none",
                        borderRadius: "50%",
                      }}>
                        {initials(u.username)}
                      </div>
                      <span className="xk-podium-name">{u.username}</span>
                      <span className="xk-podium-pts">
                        {val(u).toLocaleString()}
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                          <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.6 1.2-6L3.3 9.4l6.1-.8z" />
                        </svg>
                      </span>
                      <div className="xk-podium-bar"><span>{rank}</span></div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sort tabs + search */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <div className="xk-filters" style={{ marginBottom: 0 }}>
                {SORT_TABS.map(s => (
                  <button key={s.v} type="button"
                    className={`xk-filter${tab === s.v ? " on" : ""}`}
                    style={{ padding: "6px 14px" }}
                    onClick={() => setTab(s.v)}>
                    {s.l}
                  </button>
                ))}
              </div>
              <input
                className="xk-card"
                placeholder="İstifadəçi axtar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  marginLeft: "auto", maxWidth: 220, padding: "8px 14px",
                  fontSize: 13, color: "var(--text-2)",
                  border: "1px solid var(--border)", borderRadius: 20,
                  background: "var(--surface-2)",
                }}
              />
            </div>

            {/* Board table */}
            <div className="xk-card xk-board xk-reveal" style={{ animationDelay: "160ms" }}>
              {filtered.map((e, i) => {
                const pos   = sorted.indexOf(e) + 1;
                const isYou = e.username === me;
                const v     = val(e);
                const pct   = Math.max(1, (v / maxVal) * 100);
                const rankCls = pos === 1 ? "r1" : pos === 2 ? "r2" : pos === 3 ? "r3" : "";

                return (
                  <div key={e.username}
                    className={`xk-leader-row wide xk-reveal${isYou ? " you" : ""}`}
                    style={{ animationDelay: `${180 + i * 55}ms` }}>
                    <span className={`xk-leader-rank ${rankCls}`}>
                      {pos <= 3 ? ["🥇","🥈","🥉"][pos - 1] : pos}
                    </span>
                    <div className="xk-avatar" style={{
                      width: 32, height: 32, fontSize: 13, borderRadius: "50%",
                      background: isYou
                        ? "linear-gradient(135deg, var(--accent), #7a1717)"
                        : "#26262c",
                    }}>
                      {initials(e.username)}
                    </div>
                    <span className="xk-leader-name">
                      {e.username}
                      {isYou && <span className="xk-you-tag">{t.you}</span>}
                    </span>
                    <div className="xk-leader-spark">
                      <div className="xk-track" style={{ height: 5 }}>
                        <div className="xk-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="xk-leader-pts">{v.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
