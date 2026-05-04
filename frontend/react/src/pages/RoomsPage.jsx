import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

const DIFF = {
  beginner:     { cls: "easy",   label: "Başlanğıc", dot: "var(--easy)" },
  intermediate: { cls: "medium", label: "Orta",      dot: "var(--medium)" },
  advanced:     { cls: "hard",   label: "İrəliləmiş",dot: "var(--hard)" },
};

const CAT_ICONS = {
  web:       "🌐", network: "🔌", linux:    "🐧",
  crypto:    "🔐", forensics:"🔍", osint:   "👁",
  reverse:   "⚙️",  pwn:    "💥", misc:    "🧩",
  default:   "🛡️",
};

function SkeletonCard() {
  return (
    <div className="mission-card" style={{ pointerEvents: "none" }}>
      <div className="xk-skel" style={{ height: 44, width: 44, borderRadius: "var(--r3)", marginBottom: 4 }} />
      <div className="xk-skel" style={{ height: 18, width: "75%", borderRadius: 4 }} />
      <div className="xk-skel" style={{ height: 14, width: "55%", borderRadius: 4 }} />
      <div className="xk-skel" style={{ height: 6,  width: "100%", borderRadius: 99, marginTop: 8 }} />
    </div>
  );
}

export default function RoomsPage() {
  const [rooms,      setRooms]      = useState([]);
  const [tags,       setTags]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const [search,    setSearch]    = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [level,     setLevel]     = useState("");
  const [tag,       setTag]       = useState("");
  const [activeTab, setActiveTab] = useState("");   // category slug

  const debRef = useRef(null);
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebSearch(search), 300);
    return () => clearTimeout(debRef.current);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      endpoints.rooms({ search: debSearch, level, tag }),
      endpoints.roomTags(),
      endpoints.categories(),
    ])
      .then(([rRes, tRes, cRes]) => {
        if (!mounted) return;
        setRooms(rRes.data || []);
        setTags(tRes.data  || []);
        setCategories(cRes.data || []);
      })
      .catch(() => { if (mounted) setError("Missionlar yüklənmədi."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [debSearch, level, tag]);

  const filtered = useMemo(() => {
    if (!activeTab) return rooms;
    return rooms.filter(r => {
      const slug = (r.course?.category?.slug || r.course?.category || "").toLowerCase();
      const name = (r.course?.category?.name  || "").toLowerCase();
      return slug === activeTab || name.includes(activeTab);
    });
  }, [rooms, activeTab]);

  const reset = useCallback(() => {
    setSearch(""); setLevel(""); setTag(""); setActiveTab("");
  }, []);

  const total     = rooms.length;
  const completed = rooms.filter(r => (r.progress_percent || 0) >= 100).length;
  const inProg    = rooms.filter(r => (r.progress_percent || 0) > 0 && r.progress_percent < 100).length;
  const totalXP   = rooms.reduce((s, r) => s + (r.points || 0), 0);

  return (
    <AppShell
      title="Missions"
      searchPlaceholder="Mission adı, kurs, tag axtar..."
      onSearch={setSearch}
      extraTopbar={<span className="xk-chip">{filtered.length} mission</span>}
    >
      {/* Header */}
      <div className="missions-header">
        <div>
          <div className="xk-eyebrow">⚡ Platforma</div>
          <h1>Missions</h1>
          <p style={{ marginTop: 4, color: "var(--t3)", fontSize: 14 }}>
            Real dünya ssenarilərinə əsaslanan praktiki tapşırıqlar
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="missions-stats">
        <div className="xk-panel missions-stat">
          <span className="missions-stat-val" style={{ color: "var(--green)" }}>{total}</span>
          <span className="missions-stat-key">Ümumi</span>
        </div>
        <div className="xk-panel missions-stat">
          <span className="missions-stat-val" style={{ color: "var(--easy)" }}>{completed}</span>
          <span className="missions-stat-key">Tamamlandı</span>
        </div>
        <div className="xk-panel missions-stat">
          <span className="missions-stat-val" style={{ color: "var(--blue)" }}>{inProg}</span>
          <span className="missions-stat-key">Davam edir</span>
        </div>
        <div className="xk-panel missions-stat">
          <span className="missions-stat-val" style={{ color: "var(--amber)" }}>
            {totalXP.toLocaleString()}
          </span>
          <span className="missions-stat-key">Toplam XP</span>
        </div>
      </div>

      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="xk-tabs" role="tablist" style={{ marginBottom: 16 }}>
          <button
            role="tab" type="button"
            className={`xk-tab${activeTab === "" ? " active" : ""}`}
            onClick={() => setActiveTab("")}
          >
            🔰 Hamısı
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              role="tab" type="button"
              className={`xk-tab${activeTab === cat.slug ? " active" : ""}`}
              onClick={() => setActiveTab(cat.slug)}
            >
              {CAT_ICONS[cat.slug?.toLowerCase()] || CAT_ICONS.default} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Filters row */}
      <div className="missions-filters">
        <select
          className="xk-select"
          value={level}
          onChange={e => { setLevel(e.target.value); }}
        >
          <option value="">Bütün səviyyələr</option>
          <option value="beginner">Başlanğıc</option>
          <option value="intermediate">Orta</option>
          <option value="advanced">İrəliləmiş</option>
        </select>

        {tags.length > 0 && (
          <select
            className="xk-select"
            value={tag}
            onChange={e => setTag(e.target.value)}
          >
            <option value="">Bütün teqlər</option>
            {tags.map(t => (
              <option key={t.id} value={t.slug}>{t.name}</option>
            ))}
          </select>
        )}

        {(level || tag || activeTab || search) && (
          <button type="button" className="xk-btn xk-btn-ghost xk-btn-sm" onClick={reset}>
            ✕ Sıfırla
          </button>
        )}

        <span className="xk-chip" style={{ marginLeft: "auto" }}>
          {filtered.length} nəticə
        </span>
      </div>

      {error && <div className="xk-alert xk-alert-err">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="missions-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="xk-panel xk-empty">
          <div className="xk-empty-ico">🔍</div>
          <h3>Mission tapılmadı</h3>
          <p>Filtrləri sıfırlayıb yenidən cəhd edin.</p>
          <button type="button" className="xk-btn xk-btn-secondary xk-btn-sm" onClick={reset}>
            Filtrləri sıfırla
          </button>
        </div>
      ) : (
        <div className="missions-grid">
          {filtered.map((room, i) => {
            const diff = DIFF[room.level] || DIFF.beginner;
            const pct  = room.progress_percent || 0;
            return (
              <Link
                key={room.id}
                to={`/rooms/${room.slug}`}
                className="mission-card xk-anim-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className={`mission-card-bar ${diff.cls}`} />
                {pct >= 100 && (
                  <div className="mission-completed-overlay">✓</div>
                )}
                <div className="mission-card-top">
                  <div className="mission-card-icon">{room.icon || "🧪"}</div>
                  <div className="mission-card-badges">
                    <span className={`xk-diff xk-diff-${diff.cls}`}>{diff.label}</span>
                    {room.is_premium && <span className="xk-tag">⭐ Pro</span>}
                  </div>
                </div>

                <h3>{room.title}</h3>
                <p>{room.summary}</p>

                {/* Tags */}
                {room.tags && room.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {room.tags.slice(0, 3).map(t => (
                      <span key={t.id} className="xk-tag">{t.name}</span>
                    ))}
                  </div>
                )}

                <div className="xk-prog" style={{ marginTop: "auto" }}>
                  <div className="xk-prog-track">
                    <div
                      className={`xk-prog-fill${pct >= 100 ? "" : " blue"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="xk-prog-meta">
                    <span>{pct}% tamamlandı</span>
                    <span>{room.task_count || 0} task</span>
                  </div>
                </div>

                <div className="mission-card-footer">
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span>⏱ {room.estimated_minutes || 0} dəq</span>
                    {room.course?.title && (
                      <span className="xk-tag">{room.course.title}</span>
                    )}
                  </div>
                  <span className="mission-xp">★ {room.points || 0}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
