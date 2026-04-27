import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const rankColors = {
  recruit:       "#8690a8",
  script_kiddie: "#5b8bff",
  operative:     "#38d3ff",
  hunter:        "#4ce0a5",
  specialist:    "#9d7bff",
  analyst:       "#ffb86b",
  architect:     "#ff5672",
  operator:      "#ff8099",
  ghost:         "#ffffff",
};

const rankLabels = {
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

const medals = ["🥇", "🥈", "🥉"];
const posClass = ["gold", "silver", "bronze"];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      `${e.username} ${rankLabels[e.rank] || e.rank} ${e.country || ""}`.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const myRank = useMemo(() => {
    if (!currentUser) return null;
    const idx = entries.findIndex((e) => e.username === currentUser);
    return idx >= 0 ? idx + 1 : null;
  }, [entries, currentUser]);

  const myEntry = useMemo(
    () => entries.find((e) => e.username === currentUser),
    [entries, currentUser]
  );

  return (
    <AppShell title="Liderlik Cədvəli" searchPlaceholder="İstifadəçi axtar..." onSearch={setSearch}>
      {/* Page header */}
      <div className="page-head">
        <div>
          <h1>Liderlik Cədvəli</h1>
          <p>Ən çox XP toplayan tələbələr sıralanır. Sualları düzgün cavablandır, xal qazanıb zirvəyə çıx.</p>
        </div>
        <div className="page-head-actions">
          <span className="topbar-chip">
            <strong>{filtered.length}</strong> istifadəçi
          </span>
        </div>
      </div>

      {/* My position card */}
      {myEntry && (
        <div className="lb-my-card panel" style={{ marginBottom: 20 }}>
          <div className="lb-my-inner">
            <div className="lb-my-pos">
              #{myRank}
              <span className="lb-my-pos-label">mövqeyiniz</span>
            </div>
            <div className="lb-avatar lb-my-avatar"
              style={{ background: `linear-gradient(135deg, ${rankColors[myEntry.rank] || "var(--accent)"}, var(--blue))` }}
            >
              {myEntry.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="lb-my-name">{myEntry.username}</div>
              <div className="lb-my-rank" style={{ color: rankColors[myEntry.rank] || "var(--ink-3)" }}>
                {rankLabels[myEntry.rank] || myEntry.rank}
              </div>
            </div>
            <div className="lb-my-stats">
              <div className="lb-my-stat"><span className="lb-my-stat-val">{myEntry.xp}</span><span className="lb-my-stat-key">XP</span></div>
              <div className="lb-my-stat"><span className="lb-my-stat-val">{myEntry.tasks_completed}</span><span className="lb-my-stat-key">Task</span></div>
              <div className="lb-my-stat"><span className="lb-my-stat-val">{myEntry.streak_days}</span><span className="lb-my-stat-key">Gün streak</span></div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-block">Cədvəl yüklənir...</div>
      ) : (
        <div className="lb-table-wrap panel" style={{ padding: 0, overflow: "hidden" }}>
          <table className="lb-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>İstifadəçi</th>
                <th>XP</th>
                <th>Rank</th>
                <th>Streak</th>
                <th>Tasklar</th>
                <th>Otaqlar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--ink-3)" }}>
                    Heç kim tapılmadı.
                  </td>
                </tr>
              )}
              {filtered.map((entry) => {
                const globalIdx = entries.indexOf(entry);
                const pos = globalIdx + 1;
                const isMe = entry.username === currentUser;
                const color = rankColors[entry.rank] || "var(--ink-3)";

                return (
                  <tr
                    key={entry.username}
                    className={`lb-row ${isMe ? "lb-row-me" : ""}`}
                  >
                    <td>
                      <span className={`lb-rank ${posClass[globalIdx] || ""}`}>
                        {medals[globalIdx] || `#${pos}`}
                      </span>
                    </td>
                    <td>
                      <div className="lb-user">
                        <div
                          className="lb-avatar"
                          style={{ background: `linear-gradient(135deg, ${color}, var(--blue))` }}
                        >
                          {entry.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="lb-username">
                            {entry.username}
                            {isMe && <span className="lb-me-badge">siz</span>}
                          </div>
                          {entry.country && (
                            <div className="activity-meta">{entry.country}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="lb-xp">{entry.xp.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="lb-rank-badge" style={{ color }}>
                        {rankLabels[entry.rank] || entry.rank}
                      </span>
                    </td>
                    <td>
                      <span className="lb-streak">
                        {entry.streak_days > 0 && "🔥 "}
                        {entry.streak_days || 0} gün
                      </span>
                    </td>
                    <td>{entry.tasks_completed || 0}</td>
                    <td>{entry.rooms_completed || 0}</td>
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
