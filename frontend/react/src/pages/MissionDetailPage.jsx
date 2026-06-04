import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { TileSkeleton } from "../components/ui/Skeleton";
import XKBar from "../components/ui/XKBar";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";

function passState(passId, completedIds, allPasses) {
  if (completedIds.includes(passId)) return "completed";
  const firstIncomplete = allPasses.find(p => !completedIds.includes(p.id));
  if (firstIncomplete && firstIncomplete.id === passId) return "active";
  return "locked";
}

const TRACK_COLORS = {
  web:"#3b82f6", network:"#14b8a6", system:"#8b5cf6", linux:"#8b5cf6",
  sistem:"#8b5cf6", crypto:"#22c55e", kripto:"#22c55e", pentest:"#ff3b3b",
  recon:"#f59e0b", osint:"#f59e0b",
};
function missionColor(m) {
  if (m.color) return m.color;
  const k = (m.track || m.category || m.title || "").toLowerCase();
  for (const [key, val] of Object.entries(TRACK_COLORS)) {
    if (k.includes(key)) return val;
  }
  return "var(--accent)";
}

function SvgIcon({ d, size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, color: "var(--muted)" }}>
      <path d={d} />
    </svg>
  );
}

export default function MissionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();

  const [mission, setMission]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError]       = useState(null);

  const fetchMission = () => {
    setLoading(true);
    endpoints.missionDetail(slug)
      .then(({ data }) => setMission(data))
      .catch(() => setError("Mission tapılmadı"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMission(); }, [slug]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await endpoints.missionStart(slug);
      fetchMission();
    } catch {
      setError("Mission başladıla bilmədi.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TileSkeleton height={40} />
          <TileSkeleton height={220} />
          <TileSkeleton height={400} />
        </div>
      </AppShell>
    );
  }

  if (error || !mission) {
    return (
      <AppShell>
        <div className="xk-back-row">
          <Link to="/missions" className="xk-back">← Geri</Link>
        </div>
        <div className="xk-empty-screen">
          <div className="xk-empty-ico">◎</div>
          <h3>Mission tapılmadı</h3>
          <p>Bu mission mövcud deyil.</p>
        </div>
      </AppShell>
    );
  }

  const prog         = mission.user_progress;
  const completedIds = prog?.completed_pass_ids ?? [];
  const totalPasses  = mission.passes?.length ?? 0;
  const donePasses   = completedIds.length;
  const pct          = totalPasses > 0 ? Math.round((donePasses / totalPasses) * 100) : 0;
  const allPassesDone = donePasses >= totalPasses && totalPasses > 0;
  const examUnlocked = allPassesDone && mission.exam;
  const isCompleted  = prog?.is_completed;
  const started      = donePasses > 0;
  const color        = missionColor(mission);
  const track        = mission.track || mission.category || "Missiya";
  const totalXp      = (mission.passes || []).reduce((s, p) => s + (p.xp_reward || 10), 0) || mission.xp_reward || 0;

  const LEARN_MAP = {
    web: ["HTTP protokolu və başlıqlar", "XSS və SQL injection əsasları", "Brauzer təhlükəsizlik modeli"],
    network: ["TCP/IP və portlar", "Nmap ilə skan", "Xidmət barmaq izləri"],
    system: ["Linux icazə modeli", "Privilege escalation", "SUID/SGID istismarı"],
    linux: ["Linux icazə modeli", "Privilege escalation", "SUID/SGID istismarı"],
    crypto: ["Heş və şifrələmə", "Simmetrik/asimmetrik açarlar", "Parol qırma"],
    recon: ["OSINT metodları", "DNS kəşfiyyatı", "Alt-domen tapma"],
  };
  const learnItems = LEARN_MAP[(mission.track || "").toLowerCase()] || [];

  const nextIdx = prog ? completedIds.length : 0;
  const firstPassId = mission.passes?.[nextIdx]?.id || mission.passes?.[0]?.id;

  return (
    <AppShell>
      {/* Back row */}
      <div className="xk-back-row xk-reveal">
        <Link to="/missions" className="xk-back">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Geri
        </Link>
        <div className="xk-crumbs">
          <span>Missiyalar</span>
          <span className="xk-crumb-sep">/</span>
          <span className="cur">{track}</span>
        </div>
      </div>

      {/* Hero banner */}
      <div className="xk-detail-hero xk-reveal" style={{ "--mc": color, animationDelay: "60ms" }}>
        <div className="xk-hero-bar" />
        <div className="xk-hero-main">
          <div className="xk-hero-top">
            <span className="xk-feat-track">{track}</span>
            <span className="xk-badge tone-muted">
              {{ easy:"Asan", beginner:"Asan", medium:"Orta", intermediate:"Orta", hard:"Çətin", advanced:"Çətin", expert:"Ekspert" }[mission.difficulty] || mission.difficulty || "Orta"}
            </span>
          </div>
          <h1 className="xk-hero-title">{mission.title}</h1>
          {mission.description && (
            <p className="xk-hero-desc">{mission.description}</p>
          )}
          <div className="xk-hero-meta">
            <span>
              <SvgIcon d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5" />
              {totalPasses} dərs
            </span>
            <span>
              <SvgIcon d="M13 2L4 14h7l-1 8 9-12h-7z" />
              {totalXp.toLocaleString()} XP
            </span>
            {mission.estimated_hours > 0 && (
              <span>
                <SvgIcon d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2" />
                ~{mission.estimated_hours * 60} dəq
              </span>
            )}
          </div>
          <div className="xk-hero-actions">
            {!prog ? (
              <button className="xk-btn primary" onClick={handleStart} disabled={starting}>
                {starting ? "Başlanır..." : "Missiyanı başlat"}
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            ) : (
              <Link
                to={firstPassId ? `/missions/${slug}/passes/${firstPassId}` : "#"}
                className="xk-btn primary"
              >
                {pct === 100 ? "Təkrar bax" : started ? "Davam et" : "Başla"}
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            )}
            {prog && totalPasses > 0 && (
              <div className="xk-hero-prog">
                <div className="xk-track" style={{ height: 5 }}>
                  <div className="xk-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span>{donePasses}/{totalPasses} tamamlandı</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-col grid: lessons + aside */}
      <div className="xk-detail-grid">

        {/* Pass list */}
        <div className="xk-card xk-lessons-card xk-reveal" style={{ animationDelay: "140ms" }}>
          <h3 className="xk-card-title">Dərslər</h3>

          {(!mission.passes || mission.passes.length === 0) ? (
            <div className="xk-empty-screen" style={{ padding: "32px 0" }}>
              <p>Hələ heç bir pass yayımlanmayıb.</p>
            </div>
          ) : (
            <div className="xk-lesson-list">
              {mission.passes.map((p, idx) => {
                const state    = prog ? passState(p.id, completedIds, mission.passes) : idx === 0 ? "active" : "locked";
                const isDone   = state === "completed";
                const isActive = state === "active";
                const isLocked = state === "locked" && !!prog;
                const canClick = isDone || isActive || !prog;
                const typeIcon = "book";

                return (
                  <Link
                    key={p.id}
                    to={canClick ? `/missions/${slug}/passes/${p.id}` : "#"}
                    onClick={!canClick ? e => e.preventDefault() : undefined}
                    className={`xk-lesson-row${isDone ? " done" : ""}${isActive ? " next" : ""}`}
                    style={{
                      animationDelay: `${180 + idx * 45}ms`,
                      opacity: isLocked ? 0.5 : 1,
                      pointerEvents: isLocked ? "none" : "auto",
                      textDecoration: "none",
                      display: "flex",
                    }}
                  >
                    <span className="xk-lesson-status">
                      {isDone
                        ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12l4 4 10-10" /></svg>
                        : isActive
                        ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        : <span className="xk-lesson-num">{p.order || idx + 1}</span>}
                    </span>
                    <div className="xk-lesson-meta">
                      <span className="xk-lesson-title">Pass {p.order || idx + 1}: {p.title}</span>
                      <span className="xk-lesson-type">
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                          <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2zM4 19a2 2 0 012-2h13" />
                        </svg>
                        Nəzəriyyə
                        {p.estimated_minutes > 0 && ` · ${p.estimated_minutes} dəq`}
                      </span>
                    </div>
                    <span className="xk-lesson-xp">+{p.xp_reward || 10}</span>
                  </Link>
                );
              })}

              {/* Final exam */}
              {mission.exam && (
                <Link
                  to={examUnlocked ? `/missions/${slug}/exam` : "#"}
                  onClick={!examUnlocked ? e => e.preventDefault() : undefined}
                  className={`xk-lesson-row${isCompleted && prog?.exam_passed ? " done" : examUnlocked ? " next" : ""}`}
                  style={{
                    marginTop: 8,
                    opacity: !examUnlocked ? 0.55 : 1,
                    pointerEvents: !examUnlocked ? "none" : "auto",
                    textDecoration: "none",
                    display: "flex",
                  }}
                >
                  <span className="xk-lesson-status">
                    {isCompleted && prog?.exam_passed
                      ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12l4 4 10-10" /></svg>
                      : examUnlocked
                      ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                      : <span style={{ fontSize: 14 }}>🔒</span>}
                  </span>
                  <div className="xk-lesson-meta">
                    <span className="xk-lesson-title">📋 {mission.exam.title}</span>
                    <span className="xk-lesson-type">
                      Final Exam · Keç faizi: {mission.exam.passing_score}%
                    </span>
                  </div>
                  {examUnlocked && <span className="xk-badge tone-accent">Exam ver →</span>}
                  {isCompleted && prog?.exam_passed && <span className="xk-badge tone-ok">✓ Keçildi</span>}
                </Link>
              )}
            </div>
          )}

          {/* Start CTA */}
          {!prog && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
              <button className="xk-btn primary block" onClick={handleStart} disabled={starting}>
                {starting ? "Başlanır..." : "🚀 Missiyanı başlat"}
              </button>
            </div>
          )}
        </div>

        {/* Aside */}
        <div className="xk-detail-aside">
          {/* Progress */}
          {prog && (
            <div className="xk-card xk-reveal" style={{ animationDelay: "200ms" }}>
              <div className="xk-card-eyebrow">İrəliləyişiniz</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                    {donePasses}/{totalPasses}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                    {isCompleted ? "✓ Tamamlandı" : "Davam edir"}
                  </div>
                </div>
                <div style={{
                  width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
                  display: "grid", placeItems: "center",
                  background: isCompleted ? "rgba(25,195,125,.12)" : "rgba(var(--accent-rgb),.12)",
                  border: `2px solid ${isCompleted ? "rgba(25,195,125,.3)" : "rgba(var(--accent-rgb),.3)"}`,
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
                  color: isCompleted ? "#19c37d" : "var(--accent)",
                }}>
                  {pct}%
                </div>
              </div>
              <div className="xk-track" style={{ height: 6 }}>
                <div className="xk-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
              {mission.exam && (
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 12.5 }}>
                  <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>Final Exam</span>
                  <span style={{ color: prog?.exam_passed ? "#19c37d" : allPassesDone ? "var(--accent)" : "var(--muted)", fontWeight: 600 }}>
                    {prog?.exam_passed ? "✓ Keçildi" : allPassesDone ? "Açıldı" : "Kilidli"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* What you'll learn */}
          {learnItems.length > 0 && (
            <div className="xk-card xk-aside-card xk-reveal" style={{ animationDelay: "260ms" }}>
              <div className="xk-card-eyebrow">Nə öyrənəcəksən</div>
              <ul className="xk-learn-list">
                {learnItems.map((x, i) => (
                  <li key={i}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>
                      <path d="M5 12l4 4 10-10" />
                    </svg>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reward */}
          <div className="xk-card xk-aside-card xk-reveal" style={{ animationDelay: "320ms" }}>
            <div className="xk-card-eyebrow">Mükafat</div>
            <div className="xk-reward-row">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ color: "var(--accent)" }}>
                <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
              </svg>
              <b>{totalXp.toLocaleString()} XP</b>
            </div>
            <div className="xk-reward-row">
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ color: "var(--accent)" }}>
                <path d="M12 13a5 5 0 100-10 5 5 0 000 10zM8.5 11.5L7 21l5-3 5 3-1.5-9.5" />
              </svg>
              "{track} Başlanğıc" nişanı
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
