import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";
import { getMockPlans, getMockPlanRoadmap } from "../data/mockData";

const PATH_EMOJI = {
  "bug-bounty-hunter":   "🎯",
  "penetration-tester":  "🔓",
  "soc-analyst":         "🛡️",
  "crypto-expert":       "🔐",
  "red-team-specialist": "🚩",
};

const DIFFICULTY_LABEL = {
  "bug-bounty-hunter":   { label: "Orta",        color: "#f59e0b" },
  "penetration-tester":  { label: "Çətin",        color: "#ff3b3b" },
  "soc-analyst":         { label: "Başlanğıc",    color: "#22c55e" },
  "crypto-expert":       { label: "Orta",         color: "#f59e0b" },
  "red-team-specialist": { label: "Ekspert",       color: "#c084fc" },
};

function countStepTypes(slug) {
  const roadmap = getMockPlanRoadmap(slug);
  const counts = { mission: 0, course: 0, room: 0, exam: 0 };
  roadmap.forEach(s => { if (counts[s.type] !== undefined) counts[s.type]++; });
  return { ...counts, total: roadmap.length };
}

function estimateHours(counts) {
  return counts.mission * 3 + counts.course * 6 + counts.room * 4 + counts.exam * 2;
}

export default function PlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    let ok = true;
    endpoints.plans()
      .then(({ data }) => {
        if (!ok) return;
        setPlans(Array.isArray(data) && data.length > 0 ? data : getMockPlans());
      })
      .catch(() => { if (ok) setPlans(getMockPlans()); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  return (
    <AppShell>
      <div className="xk-screen">

        {/* Page header */}
        <div className="xk-screen-head xk-reveal" style={{ marginBottom: 8 }}>
          <div>
            <div className="xk-greet-eyebrow">Platforma</div>
            <h1 className="xk-screen-title">Öyrənmə Yolları</h1>
            <p className="xk-greet-sub" style={{ maxWidth: 520 }}>
              Sıfırdan mütəxəssisə — hər karyera yolu üçün strukturlu marşrut. Bir yol seç, addım-addım irəlilə.
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="xk-reveal" style={{
          display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap",
          animationDelay: "60ms",
        }}>
          {[
            { label: "Karyera yolu", value: "5" },
            { label: "Ümumi addım", value: "41" },
            { label: "Mütəxəssislik sahəsi", value: "6" },
            { label: "Sertifikat", value: "Tezliklə" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "10px 18px", borderRadius: "var(--r-inner)",
              background: "var(--bg-card)", border: "1px solid var(--line)",
              display: "flex", flexDirection: "column", gap: 2,
            }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--ink-1)" }}>{s.value}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)" }}>{s.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {Array.from({ length: 3 }).map((_, i) => <TileSkeleton key={i} height={340} />)}
          </div>
        ) : plans.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">🗺️</div>
            <h3>Plan tapılmadı</h3>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {plans.map((p, i) => {
              const color    = p.color || "var(--accent)";
              const emoji    = PATH_EMOJI[p.slug] || "🔒";
              const diff     = DIFFICULTY_LABEL[p.slug] || { label: "Orta", color: "#f59e0b" };
              const counts   = countStepTypes(p.slug);
              const hours    = estimateHours(counts);
              const done     = p.user_progress?.completed || 0;
              const total    = p.user_progress?.total || counts.total || 0;
              const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
              const isHov    = hovered === p.id;

              return (
                <div
                  key={p.id}
                  className="xk-reveal"
                  style={{ animationDelay: `${100 + i * 80}ms` }}
                  onMouseEnter={() => setHovered(p.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    onClick={() => navigate(`/plans/${p.slug}`)}
                    style={{
                      borderRadius: "var(--r-card)",
                      background: "var(--bg-card)",
                      border: `1px solid ${isHov ? color + "50" : "var(--line)"}`,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease)",
                      transform: isHov ? "translateY(-3px)" : "none",
                      boxShadow: isHov ? `0 12px 40px ${color}18` : "none",
                      display: "flex", flexDirection: "column",
                    }}
                  >
                    {/* Colored header band */}
                    <div style={{
                      height: 6,
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      flexShrink: 0,
                    }} />

                    <div style={{ padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>

                      {/* Icon + difficulty badge row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{
                          width: 54, height: 54, borderRadius: 14,
                          background: `${color}15`,
                          border: `1.5px solid ${color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 26, lineHeight: 1,
                          transition: "background var(--dur-2) var(--ease)",
                          ...(isHov ? { background: `${color}25` } : {}),
                        }}>
                          {emoji}
                        </div>
                        <div style={{
                          padding: "4px 10px", borderRadius: "var(--r-pill)",
                          background: `${diff.color}15`,
                          border: `1px solid ${diff.color}30`,
                          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                          letterSpacing: "0.1em", textTransform: "uppercase",
                          color: diff.color,
                        }}>
                          {diff.label}
                        </div>
                      </div>

                      {/* Title + summary */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-1)", margin: 0, lineHeight: 1.3 }}>
                          {p.title}
                        </h3>
                        <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6, margin: 0 }}>
                          {p.summary}
                        </p>
                      </div>

                      {/* Step-type pills */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {counts.mission > 0 && (
                          <span style={{
                            padding: "3px 9px", borderRadius: "var(--r-pill)",
                            background: `${color}12`, border: `1px solid ${color}25`,
                            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                            color: color,
                          }}>
                            {counts.mission} missiya
                          </span>
                        )}
                        {counts.course > 0 && (
                          <span style={{
                            padding: "3px 9px", borderRadius: "var(--r-pill)",
                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)",
                            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                            color: "#3b82f6",
                          }}>
                            {counts.course} kurs
                          </span>
                        )}
                        {counts.room > 0 && (
                          <span style={{
                            padding: "3px 9px", borderRadius: "var(--r-pill)",
                            background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.22)",
                            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                            color: "#14b8a6",
                          }}>
                            {counts.room} lab
                          </span>
                        )}
                        {counts.exam > 0 && (
                          <span style={{
                            padding: "3px 9px", borderRadius: "var(--r-pill)",
                            background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.22)",
                            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                            color: "#c084fc",
                          }}>
                            {counts.exam} sınaq
                          </span>
                        )}
                      </div>

                      {/* Duration estimate */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 6,
                        color: "var(--ink-4)", fontSize: 12,
                      }}>
                        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>~{hours} saat · {counts.total} addım</span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            İrəliləyiş
                          </span>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: pct > 0 ? color : "var(--ink-4)" }}>
                            {pct}%
                          </span>
                        </div>
                        <div style={{
                          height: 4, borderRadius: 99, background: "var(--bg-elev)", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${Math.max(pct, 0)}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                            borderRadius: 99,
                            transition: "width 600ms var(--ease)",
                          }} />
                        </div>
                      </div>

                      {/* CTA button */}
                      <button
                        style={{
                          marginTop: 4,
                          width: "100%", padding: "10px 0",
                          borderRadius: "var(--r-inner)",
                          background: isHov ? color : `${color}15`,
                          border: `1.5px solid ${color}`,
                          color: isHov ? "#fff" : color,
                          fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                          cursor: "pointer",
                          transition: "background var(--dur-2) var(--ease), color var(--dur-2) var(--ease)",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          letterSpacing: "0.02em",
                        }}
                        tabIndex={-1}
                      >
                        {pct > 0 ? "Davam et" : "Yola başla"}
                        <span style={{ fontSize: 14 }}>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
