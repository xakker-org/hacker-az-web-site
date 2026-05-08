import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
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

const LEVELS = [
  { value: "",             label: "Hamısı" },
  { value: "beginner",     label: "Başlanğıc" },
  { value: "intermediate", label: "Orta" },
  { value: "advanced",     label: "İrəliləmiş" },
];

export default function RoomsPage() {
  const [rooms, setRooms]       = useState([]);
  const [tags, setTags]         = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const [search, setSearch]     = useState("");
  const [debSearch, setDebSearch] = useState("");
  const [level, setLevel]       = useState("");
  const [tag, setTag]           = useState("");
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

  const total = rooms.length;
  const completed = rooms.filter(r => (r.progress_percent || 0) >= 100).length;
  const inProg = rooms.filter(r => {
    const p = r.progress_percent || 0;
    return p > 0 && p < 100;
  }).length;
  const totalXP = rooms.reduce((s, r) => s + (r.points || 0), 0);

  const catTabs = [{ value: "", label: "Hamısı", icon: "◫" }, ...cats.map(c => ({
    value: c.slug, label: c.name, icon: CAT_ICONS[c.slug?.toLowerCase()] || "▣",
  }))];

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Labs · Rooms</div>
          <h1 className="page-title">Real ssenarilər</h1>
          <div className="page-sub">Praktik kiber-təhlükəsizlik tapşırıqları, real dünya bənzətmələri.</div>
        </div>
      </div>

      <div className="bento" style={{ marginBottom: 16 }}>
        <Tile span={3}><Stat label="Cəmi otaq" value={total} size="md" /></Tile>
        <Tile span={3}><Stat label="Tamamlandı" value={completed} size="md" sparkTone="mint" /></Tile>
        <Tile span={3}><Stat label="Davam edir" value={inProg} size="md" sparkTone="sky" /></Tile>
        <Tile span={3}><Stat label="Toplam XP" value={totalXP.toLocaleString()} size="md" /></Tile>
      </div>

      {catTabs.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <Tabs value={activeCat} onChange={setActiveCat} options={catTabs} ariaLabel="Kateqoriyalar" />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Segmented value={level} onChange={setLevel} options={LEVELS} />
        {tags.length > 0 && (
          <Select value={tag} onChange={(e) => setTag(e.target.value)} style={{ width: "auto", minWidth: 180 }}>
            <option value="">Bütün teqlər</option>
            {tags.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </Select>
        )}
        <Input
          placeholder="Otaq adı..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 240, flex: 1, minWidth: 180 }}
        />
        <span style={{ marginLeft: "auto" }}>
          <Chip size="sm">{filtered.length} nəticə</Chip>
        </span>
      </div>

      {error && (
        <Tile><div style={{ color: "var(--c-4)" }}>{error}</div></Tile>
      )}

      {loading ? (
        <div className="bento">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="span-4"><TileSkeleton height={200} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState icon="▣" title="Otaq tapılmadı" description="Filtrləri sıfırla və yenidən cəhd et." />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map((r) => {
            const pct = r.progress_percent || 0;
            const isDone = pct >= 100;
            return (
              <Tile key={r.id} span={4} as={Link} to={`/rooms/${r.slug}`} interactive>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: "var(--bg-card-2)", border: "1px solid var(--line-2)",
                    display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0,
                  }}>{r.icon || CAT_ICONS[r.course?.category?.slug?.toLowerCase()] || "▣"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tile-title">{r.title}</div>
                    <div className="tile-sub" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {r.summary}
                    </div>
                  </div>
                  {isDone && <ProgressRing value={100} size={36} strokeWidth={4} tone="mint" />}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <DiffBadge level={r.level} />
                  {r.is_premium && <Chip size="sm" tone="amber">⭐ Pro</Chip>}
                  {r.tags?.slice(0, 2).map(t => <Chip key={t.id} size="sm">{t.name}</Chip>)}
                </div>
                <Bar value={pct} tone={isDone ? "mint" : "accent"} rightCaption={`${r.task_count || 0} task · ${pct}%`} />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", fontSize: 11, color: "var(--ink-3)" }}>
                  <span className="mono">⏱ {r.estimated_minutes || 0}m</span>
                  <span className="mono tnum" style={{ color: "var(--accent)", fontWeight: 700 }}>★ {r.points || 0}</span>
                </div>
              </Tile>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
