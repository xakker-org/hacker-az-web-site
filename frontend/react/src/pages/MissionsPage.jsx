import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";
import XKBar from "../components/ui/XKBar";
import { getMockMissions } from "../data/mockData";

const T = {
  az: {
    eyebrow: "Platforma", title: "Missiyalar",
    sub: "Bacarıqlarını real ssenarilərlə sına.",
    all: "Hamısı", web: "Web", network: "Network", system: "Sistem",
    crypto: "Kripto", recon: "Kəşfiyyat",
    start: "Başla", cont: "Davam et",
    lessons: "dərs", xp: "XP", hours: "saat",
    notFound: "Missiya tapılmadı",
  },
  en: {
    eyebrow: "Platform", title: "Missions",
    sub: "Test your skills with real-world scenarios.",
    all: "All", web: "Web", network: "Network", system: "System",
    crypto: "Crypto", recon: "Recon",
    start: "Start", cont: "Continue",
    lessons: "lessons", xp: "XP", hours: "hours",
    notFound: "No missions found",
  },
};

const TRACKS = ["Hamısı", "Web", "Network", "System", "Crypto", "Recon"];

/* Category color driven by track name */
const TRACK_COLORS = {
  web:     "#3b82f6",
  network: "#14b8a6",
  system:  "#8b5cf6",
  linux:   "#8b5cf6",
  sistem:  "#8b5cf6",
  crypto:  "#22c55e",
  kripto:  "#22c55e",
  pentest: "#ff3b3b",
  recon:   "#f59e0b",
  osint:   "#f59e0b",
};

function missionColor(m) {
  if (m.color) return m.color;
  const key = (m.track || m.category || m.title || "").toLowerCase();
  for (const [k, v] of Object.entries(TRACK_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "var(--accent)";
}

function missionTrack(m) {
  return m.track || m.category || "Mission";
}

function statusOf(p) {
  if (!p) return "not-started";
  if (p.is_completed) return "completed";
  return "in-progress";
}

export default function MissionsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [missions, setMissions] = useState([]);
  const [filter, setFilter]     = useState("Hamısı");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let ok = true;
    endpoints.missions()
      .then(({ data }) => {
        if (!ok) return;
        const items = Array.isArray(data) && data.length > 0 ? data : getMockMissions();
        setMissions(items);
      })
      .catch(() => { if (ok) setMissions(getMockMissions()); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "Hamısı") return missions;
    return missions.filter(m => {
      const hay = (m.track || m.category || m.title || "").toLowerCase();
      return hay.includes(filter.toLowerCase());
    });
  }, [missions, filter]);

  const Icon = ({ name }) => {
    const paths = {
      layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
      bolt:   "M13 2L4 14h7l-1 8 9-12h-7z",
      arrow:  "M5 12h14M13 6l6 6-6 6",
    };
    return (
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}>
        <path d={paths[name] || paths.arrow} />
      </svg>
    );
  };

  return (
    <AppShell>
      <div className="xk-screen">
        {/* Screen head */}
        <div className="xk-screen-head xk-reveal">
          <div>
            <div className="xk-greet-eyebrow">{t.eyebrow}</div>
            <h1 className="xk-screen-title">{t.title}</h1>
            <p className="xk-greet-sub">{t.sub}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="xk-filters xk-reveal" style={{ animationDelay: "60ms" }}>
          {TRACKS.map(tr => (
            <button
              key={tr}
              type="button"
              className={`xk-filter${filter === tr ? " on" : ""}`}
              onClick={() => setFilter(tr)}
            >
              {tr}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="xk-mission-grid">
            {Array.from({ length: 6 }).map((_, i) => <TileSkeleton key={i} height={230} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">◎</div>
            <h3>{t.notFound}</h3>
            <p>Filtri dəyiş.</p>
          </div>
        ) : (
          <div className="xk-mission-grid">
            {filtered.map((m, i) => {
              const p      = m.user_progress;
              const st     = statusOf(p);
              const color  = missionColor(m);
              const track  = missionTrack(m);
              const total  = p?.total_passes ?? m.pass_count ?? 0;
              const done   = p?.completed_passes ?? 0;
              const pct    = total > 0 ? Math.round((done / total) * 100) : 0;
              const diff   = m.difficulty || "beginner";
              const diffLabel = { easy:"Asan", beginner:"Asan", medium:"Orta", intermediate:"Orta", hard:"Çətin", advanced:"Çətin", expert:"Ekspert" }[diff] || diff;

              return (
                <Link
                  key={m.id}
                  to={`/missions/${m.slug}`}
                  className="xk-card xk-int xk-mission xk-reveal"
                  style={{ "--mc": color, animationDelay: `${100 + i * 70}ms`, textDecoration: "none", color: "inherit" }}
                >
                  {/* Top colored bar */}
                  <div className="xk-mission-bar" />

                  {/* Track + difficulty */}
                  <div className="xk-mission-top">
                    <span className="xk-feat-track">{track}</span>
                    <span className="xk-badge tone-muted">{diffLabel}</span>
                  </div>

                  {/* Title */}
                  <h3 className="xk-mission-title">{m.title}</h3>

                  {/* Meta */}
                  <div className="xk-mission-meta">
                    {total > 0 && (
                      <span><Icon name="layers" /> {total} {t.lessons}</span>
                    )}
                    <span><Icon name="bolt" /> {(m.xp_reward || 0).toLocaleString()} {t.xp}</span>
                    {m.estimated_hours > 0 && (
                      <span>~{m.estimated_hours} {t.hours}</span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {p && total > 0 && (
                    <div className="xk-mission-prog">
                      <div className="xk-track" style={{ height: 5 }}>
                        <div className="xk-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="xk-mission-pct">{pct}%</span>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    className={`xk-btn block${st === "completed" ? " ghost" : " outline"}`}
                    tabIndex={-1}
                    style={{ pointerEvents: "none" }}
                  >
                    {st === "completed" ? "✓ Tamamlandı" : st === "in-progress" ? t.cont : t.start}
                    {st !== "completed" && (
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
