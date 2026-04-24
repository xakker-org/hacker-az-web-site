import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    endpoints.badges().then(({ data }) => setBadges(data || []));
  }, []);

  const filteredBadges = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return badges;
    return badges.filter((badge) => `${badge.name} ${badge.description}`.toLowerCase().includes(q));
  }, [badges, search]);

  return (
    <AppShell title="Badges" searchPlaceholder="Badge axtar..." onSearch={setSearch}>
      <div className="page-head">
        <div>
          <h1>Badges</h1>
          <p>Quest, room və exam nəticələrindən gələn uğur nişanları.</p>
        </div>
        <div className="page-head-actions">
          <span className="topbar-chip"><strong>{filteredBadges.filter((badge) => badge.earned).length}</strong> earned</span>
        </div>
      </div>

      <div className="badges-grid">
        {filteredBadges.map((badge) => (
          <div key={badge.id} className={`badge-card ${badge.earned ? "earned" : "locked"}`}>
            <div className="badge-icon" style={{ background: badge.color || undefined }}>{badge.icon || "✦"}</div>
            {badge.earned && <span className="badge-earned-tag">Earned</span>}
            <div className="badge-name">{badge.name}</div>
            <div className="badge-desc">{badge.description}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}