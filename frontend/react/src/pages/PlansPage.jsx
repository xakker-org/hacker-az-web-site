import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    endpoints.plans().then(({ data }) => mounted && setPlans(data || [])).finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter((plan) => `${plan.title} ${plan.summary} ${plan.level}`.toLowerCase().includes(q));
  }, [plans, search]);

  return (
    <AppShell title="Learning Paths" searchPlaceholder="Plan axtar..." onSearch={setSearch}>
      <div className="page-head">
        <div>
          <h1>Learning Paths</h1>
          <p>Backend-də olan plan strukturu. Course-lar sırası və level-lər buradan görünür.</p>
        </div>
        <div className="page-head-actions">
          <span className="topbar-chip"><strong>{filteredPlans.length}</strong> plans</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-block">Loading plans...</div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="plan-card" style={{ "--plan-tint": "rgba(91, 139, 255, 0.22)" }}>
              <div className="plan-card-head">
                <div className="plan-card-icon">{plan.icon || "↗"}</div>
                <span className="chip chip-accent">{plan.level}</span>
              </div>
              <h3>{plan.title}</h3>
              <p>{plan.summary}</p>
              <div className="plan-courses">
                {(plan.courses || []).map((item, index) => (
                  <div key={item.id} className="plan-course-row">
                    <span><span className="idx">{index + 1}</span>{item.course.title}</span>
                    <span>{item.course.category || "General"}</span>
                  </div>
                ))}
              </div>
              <div className="room-card-meta">
                <span>{plan.room_count || 0} rooms</span>
                <span className="lb-xp">{plan.estimated_hours || 0}h</span>
              </div>
            </div>
          ))}
          {filteredPlans.length === 0 && <div className="empty-state panel">No plans found.</div>}
        </div>
      )}
    </AppShell>
  );
}