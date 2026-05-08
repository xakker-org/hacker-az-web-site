import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";

const T = {
  az: {
    eyebrow: "Labs · Rooms", title: "Real ssenarilər",
    sub: "Praktik kiber-təhlükəsizlik tapşırıqları, real dünya bənzətmələri.",
    totalRooms: "Cəmi otaq", completed: "Tamamlandı", inProgress: "Davam edir", totalXp: "Toplam XP",
    allLevels: "Hamısı", beginner: "Başlanğıc", intermediate: "Orta", advanced: "İrəli",
    allTags: "Bütün teqlər",
    searchPlaceholder: "Otaq adı...", results: "nəticə",
    notFound: "Otaq tapılmadı", resetFilters: "Filtrləri sıfırla.",
    all: "Hamısı",
  },
  en: {
    eyebrow: "Labs · Rooms", title: "Real scenarios",
    sub: "Practical cybersecurity challenges with real-world simulations.",
    totalRooms: "Total rooms", completed: "Completed", inProgress: "In progress", totalXp: "Total XP",
    allLevels: "All", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced",
    allTags: "All tags",
    searchPlaceholder: "Room name...", results: "results",
    notFound: "No rooms found", resetFilters: "Reset filters.",
    all: "All",
  },
};
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Tabs from "../components/ui/Tabs";
import Segmented from "../components/ui/Segmented";
import { Input, Select } from "../components/ui/Field";
import { Chip, DiffBadge } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

const CAT_ICONS = {
  web: "🌐", network: "🔌", linux: "🐧", crypto: "🔐",
  forensics: "🔍", osint: "👁", reverse: "⚙️", pwn: "💥", misc: "🧩",
};


const LEVEL_COLOR = {
  beginner:     "var(--d-easy)",
  intermediate: "var(--d-med)",
  advanced:     "var(--d-hard)",
  expert:       "var(--d-expert)",
};

export default function RoomsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [rooms, setRooms]     = useState([]);
  const [tags, setTags]       = useState([]);
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [search, setSearch]       = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [level, setLevel]         = useState("");
  const [tag, setTag]             = useState("");
  const [activeCat, setActiveCat] = useState("");

  const debRef = useRef(null);
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebSearch(search), 280);
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
      .then(([r, t, c]) => {
        if (!mounted) return;
        setRooms(r.data || []);
        setTags(t.data || []);
        setCats(c.data || []);
      })
      .catch(() => { if (mounted) setError("Otaqlar yüklənmədi"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [debSearch, level, tag]);

  const filtered = useMemo(() => {
    if (!activeCat) return rooms;
    return rooms.filter(r => {
      const slug = (r.course?.category?.slug || "").toLowerCase();
      const name = (r.course?.category?.name || "").toLowerCase();
      return slug === activeCat || name.includes(activeCat);
    });
  }, [rooms, activeCat]);

  const total     = rooms.length;
  const completed = rooms.filter(r => (r.progress_percent || 0) >= 100).length;
  const inProg    = rooms.filter(r => { const p = r.progress_percent || 0; return p > 0 && p < 100; }).length;
  const totalXP   = rooms.reduce((s, r) => s + (r.points || 0), 0);

  const catTabs = [
    { value: "", label: "Hamısı" },
    ...cats.map(c => ({ value: c.slug, label: c.name, icon: CAT_ICONS[c.slug?.toLowerCase()] || "▣" })),
  ];

  const LEVELS = [
    { value: "",             label: t.allLevels      },
    { value: "beginner",     label: t.beginner       },
    { value: "intermediate", label: t.intermediate   },
    { value: "advanced",     label: t.advanced       },
  ];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">{t.eyebrow}</div>
          <h1 className="page-title">{t.title}</h1>
          <div className="page-sub">{t.sub}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="bento" style={{ marginBottom: 16 }}>
        <Tile span={3}><Stat label={t.totalRooms} value={total} size="md" /></Tile>
        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <Stat label={t.completed} value={completed} size="md" />
            {total > 0 && (
              <ProgressRing value={Math.round(completed / total * 100)} size={48} strokeWidth={5} tone="accent" />
            )}
          </div>
        </Tile>
        <Tile span={3}><Stat label={t.inProgress} value={inProg} size="md" /></Tile>
        <Tile span={3}><Stat label={t.totalXp} value={totalXP.toLocaleString()} size="md" /></Tile>
      </div>

      {/* Category tabs */}
      {catTabs.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <Tabs value={activeCat} onChange={setActiveCat} options={catTabs} ariaLabel="Kateqoriyalar" />
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <Segmented value={level} onChange={setLevel} options={LEVELS} />
        {tags.length > 0 && (
          <Select value={tag} onChange={(e) => setTag(e.target.value)} style={{ width: "auto", minWidth: 160 }}>
            <option value="">{t.allTags}</option>
            {tags.map(tg => <option key={tg.id} value={tg.slug}>{tg.name}</option>)}
          </Select>
        )}
        <Input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 240, flex: 1, minWidth: 180 }}
        />
        <span style={{ marginLeft: "auto" }}>
          <Chip tone={filtered.length > 0 ? "accent" : "neutral"} size="sm">
            {filtered.length} {t.results}
          </Chip>
        </span>
      </div>

      {error && <Tile style={{ marginBottom: 16 }}><div style={{ color: "var(--bad)", padding: 8 }}>{error}</div></Tile>}

      {loading ? (
        <div className="bento">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="span-4"><TileSkeleton height={220} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState icon="▣" title={t.notFound} description={t.resetFilters} />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map((r) => {
            const pct      = r.progress_percent || 0;
            const isDone   = pct >= 100;
            const accent   = isDone ? "var(--ok)" : LEVEL_COLOR[r.level] || "var(--accent)";
            const catIcon  = CAT_ICONS[r.course?.category?.slug?.toLowerCase()] || "▣";

            return (
              <Tile key={r.id} span={4} as={Link} to={`/rooms/${r.slug}`} interactive style={{ overflow: "hidden" }}>
                {/* Top accent line */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: accent, opacity: isDone ? 0.8 : 0.45,
                }} />

                {/* Icon + title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 4 }}>
                  <span style={{
                    width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                    background: `linear-gradient(135deg, var(--bg-elev) 0%, ${isDone ? "rgba(110,255,214,0.08)" : "rgba(255,36,66,0.06)"} 100%)`,
                    border: "1px solid var(--line-2)",
                    display: "grid", placeItems: "center", fontSize: 22,
                  }}>
                    {r.icon || catIcon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-1)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: "var(--ink-3)",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5,
                    }}>
                      {r.summary}
                    </div>
                  </div>
                  {isDone && (
                    <span style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: "rgba(110,255,214,0.12)", border: "1px solid rgba(110,255,214,0.3)",
                      display: "grid", placeItems: "center", fontSize: 12, color: "var(--ok)",
                    }}>✓</span>
                  )}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <DiffBadge level={r.level} />
                  {r.is_premium && <Chip size="sm" tone="amber">Pro</Chip>}
                  {r.tags?.slice(0, 2).map(t => <Chip key={t.id} size="sm">{t.name}</Chip>)}
                </div>

                {/* Progress */}
                <Bar value={pct} tone={isDone ? "mint" : "accent"} rightCaption={`${r.task_count || 0} task · ${pct}%`} />

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginTop: 4, paddingTop: 10, borderTop: "1px solid var(--line)",
                  fontSize: 11, color: "var(--ink-4)",
                }}>
                  <span className="mono">⏱ {r.estimated_minutes || 0}m</span>
                  <span className="mono tnum" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 12 }}>
                    ★ {(r.points || 0).toLocaleString()} XP
                  </span>
                </div>
              </Tile>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
