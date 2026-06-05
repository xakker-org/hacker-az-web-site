import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";
import { getMockRooms } from "../data/mockData";

/* ── Difficulty config ─────────────────────────────────────────── */
const DIFF = {
  beginner:     { label: "Asan",    color: "#6effd6", bg: "rgba(110,255,214,0.08)", border: "rgba(110,255,214,0.2)"  },
  easy:         { label: "Asan",    color: "#6effd6", bg: "rgba(110,255,214,0.08)", border: "rgba(110,255,214,0.2)"  },
  intermediate: { label: "Orta",    color: "#ffb86b", bg: "rgba(255,184,107,0.08)", border: "rgba(255,184,107,0.2)"  },
  medium:       { label: "Orta",    color: "#ffb86b", bg: "rgba(255,184,107,0.08)", border: "rgba(255,184,107,0.2)"  },
  advanced:     { label: "Çətin",   color: "#ff7a8a", bg: "rgba(255,122,138,0.08)", border: "rgba(255,122,138,0.2)"  },
  hard:         { label: "Çətin",   color: "#ff7a8a", bg: "rgba(255,122,138,0.08)", border: "rgba(255,122,138,0.2)"  },
  expert:       { label: "Ekspert", color: "#c084fc", bg: "rgba(192,132,252,0.08)", border: "rgba(192,132,252,0.2)"  },
};

const CAT_ICONS = {
  web: "🌐", network: "🔌", linux: "🐧", windows: "🪟",
  crypto: "🔐", forensics: "🔍", osint: "👁", reverse: "⚙️",
  pwn: "💥", misc: "🧩", ctf: "🚩",
};

const DIFF_ORDER = ["beginner", "easy", "intermediate", "medium", "advanced", "hard", "expert"];

const LEVEL_TABS = [
  { key: "",             label: "Hamısı",  color: null },
  { key: "beginner",    label: "Asan",    color: "#6effd6" },
  { key: "intermediate",label: "Orta",    color: "#ffb86b" },
  { key: "advanced",    label: "Çətin",   color: "#ff7a8a" },
  { key: "expert",      label: "Ekspert", color: "#c084fc" },
];

/* ── Single lab card ───────────────────────────────────────────── */
function LabCard({ room, idx }) {
  const pct    = room.progress_percent || 0;
  const isDone = pct >= 100;
  const lvKey  = (room.level || "beginner").toLowerCase();
  const diff   = DIFF[lvKey] || DIFF.beginner;
  const catKey = (room.course?.category?.slug || room.category?.slug || "misc").toLowerCase();
  const icon   = room.icon || CAT_ICONS[catKey] || "🧪";
  const xp     = room.total_points || room.xp || 150;

  return (
    <Link
      to={`/rooms/${room.slug}`}
      className={`lab-card${isDone ? " done" : ""}`}
      style={{ animationDelay: `${70 + idx * 50}ms` }}
    >
      {isDone && <div className="lab-card-done-badge">✓ TAMAMLANDI</div>}

      {/* Difficulty stripe */}
      <div className="lab-card-stripe" style={{ "--diff-color": diff.color }} />

      <div className="lab-card-body">
        {/* Top row: OS icon + difficulty badge */}
        <div className="lab-card-top">
          <div className="lab-os-icon" title={catKey}>{icon}</div>
          <div
            className="lab-diff-badge"
            style={{
              "--diff-color":  diff.color,
              "--diff-bg":     diff.bg,
              "--diff-border": diff.border,
            }}
          >
            <span className="lab-diff-dot" />
            {diff.label}
          </div>
        </div>

        {/* Lab name */}
        <h3 className="lab-name">{room.title}</h3>

        {/* Tags */}
        <div className="lab-tags">
          {room.env && (
            <span className="fi-badge fi-badge-muted">{room.env.toUpperCase()}</span>
          )}
          {room.tags?.slice(0, 3).map(t => (
            <span key={t.id} className="fi-badge fi-badge-muted">{t.name}</span>
          ))}
        </div>
      </div>

      {/* Footer: stats + CTA */}
      <div className="lab-card-footer">
        <div className="lab-stats">
          <span>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
            </svg>
            {xp} XP
          </span>
          {room.tasks_count > 0 && (
            <span>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
              {room.tasks_count} tapşırıq
            </span>
          )}
        </div>
        <span
          className="fi-btn primary sm"
          style={{ pointerEvents: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          {isDone ? "Bax" : "Başlat"}
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function RoomsPage() {
  const { lang } = useLang();

  const [rooms,     setRooms]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [deb,       setDeb]       = useState("");
  const [activeTab, setActiveTab] = useState("");
  const debRef = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDeb(search), 280);
    return () => clearTimeout(debRef.current);
  }, [search]);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    endpoints.rooms({ search: deb, level: activeTab })
      .then(r => {
        if (!ok) return;
        const items = (r.data || []).filter(x => x).length > 0 ? (r.data || []) : getMockRooms();
        setRooms(items);
      })
      .catch(() => { if (ok) setRooms(getMockRooms()); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [deb, activeTab]);

  /* Group by difficulty when showing all */
  const grouped = useMemo(() => {
    if (activeTab) return { [activeTab]: rooms };
    const g = {};
    for (const r of rooms) {
      const k = r.level?.toLowerCase() || "beginner";
      if (!g[k]) g[k] = [];
      g[k].push(r);
    }
    return g;
  }, [rooms, activeTab]);

  const sortedKeys = Object.keys(grouped)
    .sort((a, b) => DIFF_ORDER.indexOf(a) - DIFF_ORDER.indexOf(b));

  const totalDone = rooms.filter(r => (r.progress_percent || 0) >= 100).length;
  const progress  = rooms.length > 0 ? Math.round((totalDone / rooms.length) * 100) : 0;

  return (
    <AppShell>
      <div className="xk-screen">

        {/* ── Page header ── */}
        <div className="fi-page-head xk-reveal">
          <div>
            <p className="fi-page-section">Platforma</p>
            <h1 className="fi-page-title">Laboratoriyalar</h1>
            <p className="fi-page-sub">
              Real pentest mühitlərində port skanından privilege escalation-a kimi məşq et.
            </p>
          </div>

          {rooms.length > 0 && (
            <div className="lab-header-stats">
              {[
                { v: rooms.length, l: "Lab" },
                { v: totalDone,    l: "Tamamlandı" },
                { v: `${progress}%`, l: "İrəliləyiş" },
              ].map(s => (
                <div key={s.l} className="lab-stat-item">
                  <div className="lab-stat-value">{s.v}</div>
                  <div className="lab-stat-label">{s.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Filters + search ── */}
        <div
          className="xk-reveal"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 24,
            animationDelay: "50ms",
          }}
        >
          <div className="fi-filters" style={{ margin: 0 }}>
            {LEVEL_TABS.map(tab => (
              <button
                key={tab.key}
                type="button"
                className={`fi-filter${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                style={
                  activeTab === tab.key && tab.color
                    ? { background: `${tab.color}14`, borderColor: `${tab.color}40`, color: tab.color }
                    : undefined
                }
              >
                {tab.color && (
                  <span style={{
                    display: "inline-block",
                    width: 6, height: 6,
                    borderRadius: "50%",
                    background: activeTab === tab.key ? tab.color : "var(--ink-4)",
                    marginRight: 6,
                    verticalAlign: "middle",
                    transition: "background 150ms",
                  }} />
                )}
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", position: "relative" }}>
            <svg
              style={{
                position: "absolute", left: 11, top: "50%",
                transform: "translateY(-50%)",
                color: "var(--ink-4)", pointerEvents: "none",
              }}
              width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2} strokeLinecap="round"
            >
              <circle cx={11} cy={11} r={8} /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Lab axtar..."
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--line-2)",
                borderRadius: 10,
                padding: "7px 14px 7px 34px",
                fontSize: 13,
                color: "var(--ink-1)",
                outline: "none",
                width: 220,
                fontFamily: "var(--font-body)",
                transition: "border-color 150ms",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(255,59,59,0.35)")}
              onBlur={e  => (e.target.style.borderColor = "var(--line-2)")}
            />
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="lab-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <TileSkeleton key={i} height={190} />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">🧪</div>
            <h3>Lab tapılmadı</h3>
            <p>Filtrləri dəyiş və ya axtarışı sil.</p>
          </div>
        ) : (
          <>
            {sortedKeys.map(key => {
              const items = grouped[key];
              if (!items?.length) return null;
              const d = DIFF[key] || DIFF.beginner;
              return (
                <div key={key}>
                  {!activeTab && (
                    <div className="lab-section-head">
                      <span className="lab-section-label" style={{ color: d.color }}>
                        {d.label}
                      </span>
                      <div className="lab-section-line" />
                      <span className="lab-section-count">{items.length} lab</span>
                    </div>
                  )}
                  <div className="lab-grid">
                    {items.map((r, i) => (
                      <LabCard key={r.id} room={r} idx={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </AppShell>
  );
}
