import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";
import { endpoints } from "../services/endpoints";
import { TileSkeleton } from "../components/ui/Skeleton";

const T = {
  az: {
    eyebrow: "Platforma", title: "Laboratoriyalar",
    sub: "İzolyasiya olunmuş mühitdə hücum və müdafiə məşq et.",
    all: "Hamısı", beginner: "Başlanğıc", intermediate: "Orta", advanced: "İrəli",
    search: "Otaq axtar...",
    launch: "İşə sal", soon: "Tezliklə", done: "✓ Tamam",
    notFound: "Otaq tapılmadı",
    ready: "Hazır", testing: "Testlikdə",
  },
  en: {
    eyebrow: "Platform", title: "Laboratories",
    sub: "Practice attack and defense in isolated environments.",
    all: "All", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
    search: "Search rooms...",
    launch: "Launch", soon: "Coming soon", done: "✓ Done",
    notFound: "No rooms found",
    ready: "Ready", testing: "Testing",
  },
};

const CAT_ICONS = {
  web:"🌐", network:"🔌", linux:"🐧", crypto:"🔐",
  forensics:"🔍", osint:"👁", reverse:"⚙️", pwn:"💥", misc:"🧩",
};

const LEVELS = ["Hamısı", "Başlanğıc", "Orta", "İrəli"];

export default function RoomsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [rooms, setRooms]     = useState([]);
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [deb, setDeb]         = useState("");
  const [level, setLevel]     = useState("Hamısı");
  const debRef = useRef(null);

  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDeb(search), 280);
    return () => clearTimeout(debRef.current);
  }, [search]);

  useEffect(() => {
    let ok = true;
    setLoading(true);
    const lvMap = { "Başlanğıc": "beginner", "Orta": "intermediate", "İrəli": "advanced" };
    Promise.all([
      endpoints.rooms({ search: deb, level: lvMap[level] || "" }),
      endpoints.categories().catch(() => ({ data: [] })),
    ])
      .then(([r, c]) => { if (!ok) return; setRooms(r.data || []); setCats(c.data || []); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [deb, level]);

  return (
    <AppShell>
      <div className="xk-screen">
        {/* Head */}
        <div className="xk-screen-head xk-reveal">
          <div>
            <div className="xk-greet-eyebrow">{t.eyebrow}</div>
            <h1 className="xk-screen-title">{t.title}</h1>
            <p className="xk-greet-sub">{t.sub}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="xk-filters xk-reveal" style={{ animationDelay: "60ms" }}>
          {LEVELS.map(lv => (
            <button key={lv} type="button"
              className={`xk-filter${level === lv ? " on" : ""}`}
              onClick={() => setLevel(lv)}>
              {lv}
            </button>
          ))}
          <input
            className="xk-card"
            placeholder={t.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              marginLeft: "auto", maxWidth: 220, padding: "8px 14px",
              fontSize: 13, color: "var(--text-2)", border: "1px solid var(--border)",
              borderRadius: 20, background: "var(--surface-2)",
            }}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="xk-lab-grid">
            {Array.from({ length: 5 }).map((_, i) => <TileSkeleton key={i} height={80} />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="xk-empty-screen">
            <div className="xk-empty-ico">🧪</div>
            <h3>{t.notFound}</h3>
            <p>Filtrləri dəyiş.</p>
          </div>
        ) : (
          <div className="xk-lab-grid">
            {rooms.map((r, i) => {
              const pct    = r.progress_percent || 0;
              const isDone = pct >= 100;
              const catSlug = (r.course?.category?.slug || r.category?.slug || "misc").toLowerCase();
              const icon   = r.icon || CAT_ICONS[catSlug] || "🧪";
              const status = isDone ? "done" : r.is_premium ? "premium" : "ready";

              return (
                <div
                  key={r.id}
                  className="xk-card xk-int xk-lab xk-reveal"
                  style={{ animationDelay: `${100 + i * 70}ms`, cursor: "pointer" }}
                  onClick={() => window.location.href = `/rooms/${r.slug}`}
                >
                  {/* Icon */}
                  <div className="xk-lab-icon">{icon}</div>

                  {/* Meta */}
                  <div className="xk-lab-meta">
                    <h3 className="xk-lab-title">{r.title}</h3>
                    <div className="xk-lab-tags">
                      {r.env && <span className="xk-chip">{r.env}</span>}
                      {r.level && (
                        <span className="xk-chip">
                          {{ beginner:"Başlanğıc", intermediate:"Orta", advanced:"Çətin", expert:"Ekspert" }[r.level] || r.level}
                        </span>
                      )}
                      {r.tags?.slice(0, 2).map(tg => (
                        <span key={tg.id} className="xk-chip">{tg.name}</span>
                      ))}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="xk-lab-right">
                    {isDone
                      ? <span className="xk-badge tone-ok">{t.done}</span>
                      : r.is_premium
                      ? <span className="xk-badge tone-muted">Pro</span>
                      : <span className="xk-badge tone-ok">{t.ready}</span>}
                    <Link
                      to={`/rooms/${r.slug}`}
                      className="xk-btn outline sm"
                      onClick={e => e.stopPropagation()}
                    >
                      {isDone ? t.done.replace("✓ ", "") : t.launch}
                    </Link>
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
