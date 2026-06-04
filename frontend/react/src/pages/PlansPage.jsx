import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";
import XKBar from "../components/ui/XKBar";

const TRACK_COLORS = {
  web:"#3b82f6", network:"#14b8a6", linux:"#8b5cf6", sistem:"#8b5cf6",
  crypto:"#22c55e", kripto:"#22c55e", pentest:"#ff3b3b", recon:"#f59e0b", osint:"#f59e0b",
};
function pathColor(p) {
  if (p.color) return p.color;
  const k = (p.title || "").toLowerCase();
  for (const [key, val] of Object.entries(TRACK_COLORS)) { if (k.includes(key)) return val; }
  return "var(--accent)";
}

export default function PlansPage() {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    let ok = true;
    endpoints.plans()
      .then(({ data }) => { if (ok) setPlans(Array.isArray(data) ? data : []); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return plans;
    return plans.filter(p => `${p.title} ${p.summary || ""}`.toLowerCase().includes(q));
  }, [plans, search]);

  return (
    <AppShell>
      <div className="xk-screen">
        <div className="xk-screen-head xk-reveal">
          <div>
            <div className="xk-greet-eyebrow">Platforma</div>
            <h1 className="xk-screen-title">Öyrənmə yolları</h1>
            <p className="xk-greet-sub">Sıfırdan mütəxəssisə qədər strukturlu marşrutlar.</p>
          </div>
        </div>

        {loading ? (
          <div className="xk-mission-grid">
            {Array.from({ length: 3 }).map((_, i) => <TileSkeleton key={i} height={260} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">🗺️</div>
            <h3>Plan tapılmadı</h3>
          </div>
        ) : (
          <div className="xk-mission-grid">
            {filtered.map((p, i) => {
              const color  = pathColor(p);
              const total  = p.room_count || p.courses?.length || p.missions || 0;
              const done   = p.user_progress?.completed_rooms || p.user_progress?.completed || 0;
              const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className="xk-card xk-int xk-mission xk-reveal"
                  style={{ "--mc": color, animationDelay: `${100 + i * 80}ms`, cursor: "pointer" }}
                  onClick={() => {}}
                >
                  <div className="xk-mission-bar" />

                  {/* Icon */}
                  <div className="xk-lab-icon" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
                    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 19a3 3 0 100-6 3 3 0 000 6zM18 11a3 3 0 100-6 3 3 0 000 6zM9 17h6a3 3 0 003-3M6 13V9a3 3 0 013-3" />
                    </svg>
                  </div>

                  <h3 className="xk-mission-title">{p.title}</h3>

                  {p.summary && (
                    <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5, margin: 0 }}>{p.summary}</p>
                  )}

                  <div className="xk-mission-meta">
                    <span>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/></svg>
                      {total} missiya
                    </span>
                  </div>

                  <div className="xk-mission-prog">
                    <div className="xk-track" style={{ height: 5 }}>
                      <div className="xk-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="xk-mission-pct">{done}/{total}</span>
                  </div>

                  <button
                    className="xk-btn outline block"
                    style={{ pointerEvents: "none" }}
                    tabIndex={-1}
                  >
                    {pct > 0 ? "Davam et" : "Yola başla"}
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
