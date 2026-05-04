import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const RANK_COLORS = {
  recruit:       "#636d7f",
  script_kiddie: "#4d9fff",
  operative:     "#00e5ff",
  hunter:        "#39d353",
  specialist:    "#a855f7",
  analyst:       "#ffb300",
  architect:     "#ff3d5a",
  operator:      "#ff8099",
  ghost:         "#ffffff",
};

const RANK_LABELS = {
  recruit:       "Recruit",
  script_kiddie: "Script Kiddie",
  operative:     "Operative",
  hunter:        "Hunter",
  specialist:    "Specialist",
  analyst:       "Analyst",
  architect:     "Architect",
  operator:      "Operator",
  ghost:         "Ghost",
};

const TABS = [
  { key: "xp",     label: "XP",         icon: "★" },
  { key: "tasks",  label: "Tasklar",     icon: "✓" },
  { key: "rooms",  label: "Missions",    icon: "⚡" },
  { key: "streak", label: "Ardıcıllıq",  icon: "🔥" },
];

function Podium({ entry, pos, isMe }) {
  if (!entry) return <div className="podium-slot" />;
  const color = RANK_COLORS[entry.rank] || "var(--green)";
  const medals = ["🥇", "🥈", "🥉"];
  const cls    = ["podium-1st", "podium-2nd", "podium-3rd"];
  return (
    <div className={`podium-slot ${cls[pos - 1]}`}>
      <div className="podium-medal">{medals[pos - 1]}</div>
      <div
        className="podium-avatar"
        style={{
          background: `linear-gradient(135deg, ${color}, var(--blue))`,
          boxShadow: isMe ? "0 0 0 3px var(--green), 0 0 20px rgba(158,255,0,0.4)" : `0 0 20px ${color}44`,
        }}
      >
        {entry.username?.[0]?.toUpperCase() || "?"}
        {isMe && <span className="podium-me-dot" />}
      </div>
      <div className="podium-name" style={{ color: isMe ? "var(--green)" : "var(--t1)" }}>
        {entry.username}
      </div>
      <div className="podium-rank" style={{ color }}>{RANK_LABELS[entry.rank] || entry.rank}</div>
      <div className="podium-xp">★ {(entry.xp || 0).toLocaleString()}</div>
      <div className="podium-num">#{pos}</div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries,     setEntries]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState("xp");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    Promise.all([
      endpoints.leaderboard(100),
      endpoints.me().catch(() => null),
    ]).then(([lbRes, meRes]) => {
      setEntries(lbRes.data?.entries || []);
      setCurrentUser(meRes?.data?.username || null);
    }).finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const copy = [...entries];
    if (activeTab === "tasks")  return copy.sort((a, b) => (b.tasks_completed  || 0) - (a.tasks_completed  || 0));
    if (activeTab === "rooms")  return copy.sort((a, b) => (b.rooms_completed  || 0) - (a.rooms_completed  || 0));
    if (activeTab === "streak") return copy.sort((a, b) => (b.streak_days      || 0) - (a.streak_days      || 0));
    return copy;
  }, [entries, activeTab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(e =>
      `${e.username} ${RANK_LABELS[e.rank] || e.rank} ${e.country || ""}`.toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const myGlobalRank = useMemo(() => {
    const i = entries.findIndex(e => e.username === currentUser);
    return i >= 0 ? i + 1 : null;
  }, [entries, currentUser]);

  const myEntry = useMemo(() => entries.find(e => e.username === currentUser), [entries, currentUser]);
  const top3    = sorted.slice(0, 3);
  const hasPodium = !search && sorted.length >= 3;

  return (
    <AppShell title="Liderlik Cədvəli" searchPlaceholder="İstifadəçi axtar..." onSearch={setSearch}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div className="xk-eyebrow">🏆 Platforma</div>
        <h1>Liderlik Cədvəli</h1>
        <p style={{ marginTop: 4, fontSize: 14, color: "var(--t3)" }}>
          XP toplayaraq zirvəyə çıx. Hər düzgün cavab sənə yeni bir pillə qazandırır.
        </p>
      </div>

      {/* My card */}
      {myEntry && (
        <div className="xk-panel lb-me" style={{ marginBottom: 22, borderColor: "var(--green-ring)", boxShadow: "0 0 0 1px var(--green-ring) inset, 0 0 28px rgba(158,255,0,0.08)" }}>
          <div className="lb-me-pos">
            <span className="lb-me-pos-num">#{myGlobalRank}</span>
            <span className="lb-me-pos-lbl">mövqeyiniz</span>
          </div>
          <div
            className="podium-avatar"
            style={{
              width: 52, height: 52, fontSize: 20,
              background: `linear-gradient(135deg, ${RANK_COLORS[myEntry.rank] || "var(--green)"}, var(--blue))`,
              boxShadow: "0 0 20px rgba(158,255,0,0.3)",
              flexShrink: 0,
            }}
          >
            {myEntry.username?.[0]?.toUpperCase()}
          </div>
          <div className="lb-me-info">
            <div className="lb-me-name">
              {myEntry.username}
              <span className="lb-you-badge">siz</span>
            </div>
            <div className="lb-me-rank" style={{ color: RANK_COLORS[myEntry.rank] || "var(--green)" }}>
              {RANK_LABELS[myEntry.rank] || myEntry.rank}
            </div>
          </div>
          <div className="lb-me-stats">
            <div className="lb-me-stat">
              <span className="lb-me-stat-val" style={{ color: "var(--green)" }}>{(myEntry.xp || 0).toLocaleString()}</span>
              <span className="lb-me-stat-key">XP</span>
            </div>
            <div className="lb-me-stat">
              <span className="lb-me-stat-val">{myEntry.tasks_completed || 0}</span>
              <span className="lb-me-stat-key">Task</span>
            </div>
            <div className="lb-me-stat">
              <span className="lb-me-stat-val">{myEntry.rooms_completed || 0}</span>
              <span className="lb-me-stat-key">Mission</span>
            </div>
            <div className="lb-me-stat">
              <span className="lb-me-stat-val" style={{ color: "var(--amber)" }}>{myEntry.streak_days || 0}</span>
              <span className="lb-me-stat-key">🔥 Gün</span>
            </div>
          </div>
        </div>
      )}

      {/* Podium */}
      {!loading && hasPodium && (
        <div className="lb-podium">
          <Podium entry={top3[1]} pos={2} isMe={top3[1]?.username === currentUser} />
          <Podium entry={top3[0]} pos={1} isMe={top3[0]?.username === currentUser} />
          <Podium entry={top3[2]} pos={3} isMe={top3[2]?.username === currentUser} />
        </div>
      )}

      {/* Tabs */}
      <div className="xk-tab-row">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`xk-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <span className="xk-chip" style={{ marginLeft: "auto" }}>
          {filtered.length} hacker
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="xk-loading">
          <div className="xk-spinner" />
          <span>Cədvəl yüklənir...</span>
        </div>
      ) : (
        <div className={`lb-wrap${hasPodium ? "" : " no-podium"}`}>
          <table className="lb-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>İstifadəçi</th>
                <th><span className={activeTab === "xp" ? "lb-col-active" : ""}>★ XP</span></th>
                <th>Rank</th>
                <th><span className={activeTab === "streak" ? "lb-col-active" : ""}>🔥</span></th>
                <th><span className={activeTab === "tasks"  ? "lb-col-active" : ""}>✓ Task</span></th>
                <th><span className={activeTab === "rooms"  ? "lb-col-active" : ""}>⚡ Mission</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px 20px", color: "var(--t3)" }}>
                    Heç kim tapılmadı
                  </td>
                </tr>
              )}
              {filtered.map((entry, visIdx) => {
                const globalIdx = sorted.indexOf(entry);
                const pos    = globalIdx + 1;
                const isMe   = entry.username === currentUser;
                const color  = RANK_COLORS[entry.rank] || "var(--green)";
                const isTop  = pos <= 3 && !search;

                return (
                  <tr
                    key={entry.username}
                    className={`lb-row${isMe ? " lb-row-me" : ""}`}
                    style={{ animationDelay: `${visIdx * 25}ms` }}
                  >
                    <td>
                      <span className={`lb-pos${isTop ? ` lb-pos-${pos}` : ""}`}>
                        {pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : `#${pos}`}
                      </span>
                    </td>
                    <td>
                      <div className="lb-user-cell">
                        <div
                          className="lb-mini-avatar"
                          style={{
                            background: `linear-gradient(135deg, ${color}, var(--blue))`,
                            boxShadow: isTop ? `0 0 14px ${color}55` : "none",
                          }}
                        >
                          {entry.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="lb-uname">
                            {entry.username}
                            {isMe && <span className="lb-you-badge">siz</span>}
                          </div>
                          {entry.country && <div className="lb-country">{entry.country}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`lb-xp-val${activeTab === "xp" ? " lb-val-active" : ""}`}>
                        {(entry.xp || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="lb-rank-txt" style={{ color }}>{RANK_LABELS[entry.rank] || entry.rank}</span>
                    </td>
                    <td>
                      <span className={activeTab === "streak" ? "lb-val-active" : ""} style={{ color: "var(--amber)" }}>
                        {(entry.streak_days || 0) > 0 ? `🔥 ${entry.streak_days}` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className={activeTab === "tasks" ? "lb-val-active" : ""}>{entry.tasks_completed || 0}</span>
                    </td>
                    <td>
                      <span className={activeTab === "rooms" ? "lb-val-active" : ""}>{entry.rooms_completed || 0}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
