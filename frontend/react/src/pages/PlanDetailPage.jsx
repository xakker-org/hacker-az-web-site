import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { getMockPlans, getMockPlanRoadmap } from "../data/mockData";
import { useLang } from "../contexts/LanguageContext";

const TYPE_META = {
  course:  { label: { az: "Kurs",    en: "Course"  }, color: "#3b82f6", icon: "▤", hours: 6 },
  mission: { label: { az: "Missiya", en: "Mission" }, color: null,      icon: "◎", hours: 3 },
  room:    { label: { az: "Lab",     en: "Lab"     }, color: "#14b8a6", icon: "🧪", hours: 4 },
  exam:    { label: { az: "Sınaq",   en: "Exam"    }, color: "#c084fc", icon: "✦", hours: 2 },
};

function getTypeColor(type, planColor) {
  if (type === "mission") return planColor;
  return TYPE_META[type]?.color || planColor;
}

function zeroPad(n) {
  return String(n).padStart(2, "0");
}

export default function PlanDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const [hoveredStep, setHoveredStep] = useState(null);

  const plans   = getMockPlans();
  const plan    = plans.find(p => p.slug === slug);
  const roadmap = getMockPlanRoadmap(slug);

  const color = plan?.color || "var(--accent)";

  if (!plan) {
    return (
      <AppShell>
        <div className="xk-screen">
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">🗺️</div>
            <h3>Plan tapılmadı</h3>
            <button className="xk-btn primary" onClick={() => navigate("/plans")}>← Geri</button>
          </div>
        </div>
      </AppShell>
    );
  }

  const progress = plan.user_progress?.completed || 0;
  const total    = plan.user_progress?.total || roadmap.length || 0;
  const pct      = total > 0 ? Math.round((progress / total) * 100) : 0;

  // Summary stats
  const typeCounts = { course: 0, mission: 0, room: 0, exam: 0 };
  let totalHours = 0;
  const skillTags = new Set();
  roadmap.forEach(s => {
    if (typeCounts[s.type] !== undefined) typeCounts[s.type]++;
    const meta = TYPE_META[s.type];
    if (meta) totalHours += meta.hours;
    if (s.desc) {
      s.desc.split(",").forEach(tag => {
        const t = tag.trim().split(" ")[0];
        if (t.length > 2) skillTags.add(t);
      });
    }
  });
  const skillArray = Array.from(skillTags).slice(0, 6);

  const PATH_EMOJI = {
    "bug-bounty-hunter":   "🎯",
    "penetration-tester":  "🔓",
    "soc-analyst":         "🛡️",
    "crypto-expert":       "🔐",
    "red-team-specialist": "🚩",
  };
  const emoji = PATH_EMOJI[slug] || "🔒";

  return (
    <AppShell>
      <div className="xk-screen">

        {/* Back button */}
        <button
          onClick={() => navigate("/plans")}
          style={{
            background: "none", border: "none", color: "var(--ink-3)", cursor: "pointer",
            fontFamily: "var(--font-body)", fontSize: 13, marginBottom: 20,
            display: "inline-flex", alignItems: "center", gap: 6, padding: 0,
            transition: "color var(--dur-1) var(--ease)",
          }}
          onMouseOver={e => { e.currentTarget.style.color = "var(--ink-1)"; }}
          onMouseOut={e => { e.currentTarget.style.color = "var(--ink-3)"; }}
        >
          ←&nbsp;{lang === "az" ? "Öyrənmə yolları" : "Learning Paths"}
        </button>

        {/* Hero header */}
        <div className="xk-reveal" style={{
          borderRadius: "var(--r-card)",
          background: "var(--bg-card)",
          border: "1px solid var(--line)",
          overflow: "hidden",
          marginBottom: 28,
        }}>
          {/* Top color stripe */}
          <div style={{
            height: 5,
            background: `linear-gradient(90deg, ${color}, ${color}66)`,
          }} />

          <div style={{ padding: "24px 28px 26px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
              {/* Emoji icon */}
              <div style={{
                width: 64, height: 64, borderRadius: 18, flexShrink: 0,
                background: `${color}15`, border: `1.5px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 30, lineHeight: 1,
              }}>
                {emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink-1)", margin: "0 0 6px 0" }}>
                  {plan.title}
                </h1>
                <p style={{ fontSize: 14, color: "var(--ink-3)", margin: 0, lineHeight: 1.6, maxWidth: 560 }}>
                  {plan.summary}
                </p>
              </div>
            </div>

            {/* Summary stats row */}
            <div style={{
              display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20,
            }}>
              {[
                { val: roadmap.length, label: lang === "az" ? "Addım" : "Steps" },
                { val: `~${totalHours}s`, label: lang === "az" ? "Təxmini" : "Est. time" },
                { val: typeCounts.course, label: lang === "az" ? "Kurs" : "Courses" },
                { val: typeCounts.mission, label: lang === "az" ? "Missiya" : "Missions" },
                { val: typeCounts.room, label: lang === "az" ? "Lab" : "Labs" },
              ].map(s => (
                <div key={s.label} style={{
                  padding: "8px 14px", borderRadius: "var(--r-inner)",
                  background: "var(--bg-elev)", border: "1px solid var(--line-2)",
                  display: "flex", flexDirection: "column", gap: 2, minWidth: 64,
                }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700,
                    color: "var(--ink-1)",
                  }}>{s.val}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)",
                  }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Skill tags */}
            {skillArray.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                {skillArray.map(tag => (
                  <span key={tag} style={{
                    padding: "3px 9px", borderRadius: "var(--r-pill)",
                    background: `${color}12`, border: `1px solid ${color}25`,
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                    color: color, letterSpacing: "0.04em",
                  }}>{tag}</span>
                ))}
              </div>
            )}

            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                flex: 1, maxWidth: 380, height: 6, borderRadius: 99,
                background: "var(--bg-elev)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  borderRadius: 99, transition: "width 600ms var(--ease)",
                }} />
              </div>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: pct > 0 ? color : "var(--ink-4)",
              }}>
                {progress}/{total} {lang === "az" ? "tamamlandı" : "completed"} · {pct}%
              </span>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-4)",
          marginBottom: 20,
        }}>
          {lang === "az" ? "Yol xəritəsi" : "Roadmap"} · {roadmap.length} addım
        </div>

        {/* Roadmap timeline */}
        {roadmap.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">📭</div>
            <h3>{lang === "az" ? "Məlumat yoxdur" : "No data"}</h3>
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: 44 }}>

            {roadmap.map((step, i) => {
              const isLast     = i === roadmap.length - 1;
              const meta       = TYPE_META[step.type] || TYPE_META.mission;
              const typeColor  = getTypeColor(step.type, color);
              const typeLabel  = meta.label[lang] || meta.label.en;
              const isHov      = hoveredStep === step.id;
              const stepHours  = meta.hours;

              return (
                <div
                  key={step.id}
                  style={{ position: "relative", paddingBottom: isLast ? 0 : 12 }}
                >
                  {/* Connector line */}
                  {!isLast && (
                    <div style={{
                      position: "absolute",
                      left: -28,
                      top: 36,
                      bottom: 0,
                      width: 3,
                      borderRadius: 99,
                      background: step.done
                        ? "rgba(25,195,125,0.4)"
                        : `${color}20`,
                    }} />
                  )}

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    {/* Step node circle */}
                    <div style={{
                      position: "absolute",
                      left: -44,
                      top: 0,
                      zIndex: 1,
                      width: 36, height: 36, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: step.done
                        ? "rgba(25,195,125,0.18)"
                        : isHov
                          ? `${typeColor}28`
                          : `${typeColor}14`,
                      border: `2.5px solid ${step.done ? "var(--ok)" : typeColor}`,
                      color: step.done ? "var(--ok)" : typeColor,
                      fontSize: 13, fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      transition: "background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease)",
                      flexShrink: 0,
                      boxShadow: isHov ? `0 0 0 4px ${typeColor}18` : "none",
                    }}>
                      {step.done ? "✓" : zeroPad(i + 1)}
                    </div>

                    {/* Step card */}
                    <div
                      onClick={() => navigate(step.target)}
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      style={{
                        flex: 1, cursor: "pointer",
                        padding: "14px 18px 14px 16px",
                        borderRadius: "var(--r-card)",
                        background: isHov ? "var(--bg-card-2)" : "var(--bg-card)",
                        border: `1px solid ${isHov ? typeColor + "55" : "var(--line)"}`,
                        borderLeft: `3px solid ${step.done ? "var(--ok)" : typeColor}`,
                        transition: "border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), background var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease)",
                        transform: isHov ? "translateX(5px)" : "none",
                        boxShadow: isHov ? `0 4px 20px ${typeColor}14` : "none",
                        marginBottom: isLast ? 0 : 8,
                        display: "flex", flexDirection: "column", gap: 6,
                      }}
                    >
                      {/* Top row: type badge + step number + time */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: "var(--r-pill)",
                            background: `${typeColor}14`,
                            border: `1px solid ${typeColor}28`,
                            fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase",
                            color: step.done ? "var(--ok)" : typeColor,
                          }}>
                            {meta.icon}&nbsp;{typeLabel}
                          </span>
                          {step.done && (
                            <span style={{
                              padding: "2px 8px", borderRadius: "var(--r-pill)",
                              background: "rgba(25,195,125,0.1)",
                              border: "1px solid rgba(25,195,125,0.25)",
                              fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 700,
                              color: "var(--ok)",
                            }}>
                              ✓ Tamamlandı
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: "var(--ink-4)" }}>
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          <span style={{
                            fontFamily: "var(--font-mono)", fontSize: 10,
                            color: "var(--ink-4)",
                          }}>~{stepHours}s</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{
                        fontSize: 14.5, fontWeight: 600,
                        color: "var(--ink-1)", margin: 0, lineHeight: 1.3,
                      }}>
                        {step.title}
                      </h3>

                      {/* Description */}
                      {step.desc && (
                        <p style={{
                          fontSize: 12, color: "var(--ink-3)",
                          margin: 0, lineHeight: 1.55,
                        }}>
                          {step.desc}
                        </p>
                      )}

                      {/* Arrow hint */}
                      <div style={{
                        marginTop: 2, display: "flex", alignItems: "center", gap: 4,
                        opacity: isHov ? 1 : 0,
                        transition: "opacity var(--dur-2) var(--ease)",
                        color: typeColor, fontSize: 11,
                        fontFamily: "var(--font-mono)", fontWeight: 600,
                      }}>
                        {lang === "az" ? "Keç" : "Go"} →
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Done marker */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, paddingLeft: 0 }}>
              <div style={{
                position: "relative",
                left: -44,
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--bg-elev)", border: "2.5px dashed var(--line-2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "var(--ink-4)", flexShrink: 0,
              }}>
                🏁
              </div>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)",
                letterSpacing: "0.06em", marginLeft: -28,
              }}>
                {lang === "az" ? "Sertifikat — tamamlandıqdan sonra" : "Certificate — upon completion"}
              </span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
