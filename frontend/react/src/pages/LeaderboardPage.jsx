import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    endpoints.leaderboard().then(({ data }) => setEntries(data?.entries || []));
  }, []);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) => `${entry.username} ${entry.rank} ${entry.country || ""}`.toLowerCase().includes(q));
  }, [entries, search]);

  return (
    <AppShell title="Leaderboard" searchPlaceholder="User axtar..." onSearch={setSearch}>
      <div className="page-head">
        <div>
          <h1>Leaderboard</h1>
          <p>XP, rank və streak məlumatları birbaşa backend user profile-larından gəlir.</p>
        </div>
        <div className="page-head-actions">
          <span className="topbar-chip"><strong>{filteredEntries.length}</strong> members</span>
        </div>
      </div>

      <table className="lb-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>XP</th>
            <th>Streak</th>
            <th>Tasks</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry, index) => (
            <tr key={entry.username}>
              <td className={`lb-rank ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""}`}>
                #{index + 1}
              </td>
              <td>
                <div className="lb-user">
                  <div className="lb-avatar">{entry.username?.[0]?.toUpperCase() || "H"}</div>
                  <div>
                    <div>{entry.username}</div>
                    <div className="activity-meta">{entry.rank}{entry.country ? ` • ${entry.country}` : ""}</div>
                  </div>
                </div>
              </td>
              <td className="lb-xp">{entry.xp}</td>
              <td>{entry.streak_days || 0} days</td>
              <td>{entry.tasks_completed || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AppShell>
  );
}