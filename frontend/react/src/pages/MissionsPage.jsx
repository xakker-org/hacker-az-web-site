import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import Segmented from "../components/ui/Segmented";
import { Input } from "../components/ui/Field";
import { Chip, DiffBadge } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

const FILTERS = [
  { value: "all",         label: "Hamısı"       },
  { value: "in-progress", label: "Davam edir"   },
  { value: "completed",   label: "Tamamlandı"   },
  { value: "not-started", label: "Başlanmayıb"  },
];

function statusOf(p) {
  if (!p) return "not-started";
  if (p.is_completed) return "completed";
  return "in-progress";
}

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let mounted = true;
    endpoints.missions()
      .then(({ data }) => mounted && setMissions(Array.isArray(data) ? data : []))
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const counts = useMemo(() => {
    const by = { all: missions.length, "in-progress": 0, completed: 0, "not-started": 0 };
    missions.forEach(m => { by[statusOf(m.user_progress)]++; });
    return by;
  }, [missions]);

  const filtered = useMemo(() => {
    return missions.filter(m => {
      const st = statusOf(m.user_progress);
      const okStatus = filter === "all" || filter === st;
      const q = search.trim().toLowerCase();
      const okSearch = !q || `${m.title} ${m.description || ""}`.toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [missions, filter, search]);

  const totalXp = missions.reduce((s, m) => s + (m.xp_reward || 0), 0);
  const completedXp = missions.filter(m => m.user_progress?.is_completed).reduce((s, m) => s + (m.xp_reward || 0), 0);

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Missions</div>
          <h1 className="page-title">Praktiki tapşırıqlar</h1>
          <div className="page-sub">Pass-ları keç, final examı qazan, XP topla.</div>
        </div>
      </div>

      <div className="bento" style={{ marginBottom: 16 }}>
        <Tile span={3}><Stat label="Cəmi" value={counts.all} size="md" /></Tile>
        <Tile span={3}><Stat label="Davam edir" value={counts["in-progress"]} size="md" sparkTone="sky" /></Tile>
        <Tile span={3}><Stat label="Tamamlandı" value={counts.completed} size="md" hint={`${completedXp.toLocaleString()} / ${totalXp.toLocaleString()} XP`} /></Tile>
        <Tile span={3}>
          <Stat label="Tamamlanma" value={Math.round(missions.length > 0 ? (counts.completed / missions.length) * 100 : 0)} unit="%" size="md" />
          <Bar value={counts.completed} max={missions.length || 1} tone="accent" />
        </Tile>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={FILTERS.map(f => ({ ...f, count: counts[f.value] }))}
        />
        <Input
          placeholder="Mission axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 260, flex: 1, minWidth: 180 }}
        />
      </div>

      {loading ? (
        <div className="bento">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="span-4"><TileSkeleton height={200} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState icon="◎" title="Mission tapılmadı" description="Filtri sıfırla və ya başqa axtarış sözü cəhd et." />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map((m, i) => {
            const p = m.user_progress;
            const st = statusOf(p);
            const total = p?.total_passes ?? m.pass_count;
            const done = p?.completed_passes ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Tile key={m.id} span={4} as={Link} to={`/missions/${m.slug}`} interactive style={{ animationDelay: `${i * 30}ms` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: m.cover_color ? `${m.cover_color}22` : "var(--bg-card-2)",
                    border: "1px solid var(--line-2)",
                    display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0,
                  }}>{m.icon || "◎"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tile-title">{m.title}</div>
                    <div className="tile-sub" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {m.short_description || m.description}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <DiffBadge level={m.difficulty} />
                  <Chip size="sm">{m.pass_count} pass</Chip>
                  {m.estimated_hours > 0 && <Chip size="sm">~{m.estimated_hours}h</Chip>}
                  {m.has_exam && <Chip size="sm" tone="violet">Final exam</Chip>}
                </div>
                {p && (
                  <Bar
                    value={pct}
                    tone={st === "completed" ? "mint" : "accent"}
                    rightCaption={`${done}/${total} · ${pct}%`}
                  />
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 4 }}>
                  <span className="mono tnum" style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>+{m.xp_reward} XP</span>
                  <Chip
                    size="sm"
                    tone={st === "completed" ? "mint" : st === "in-progress" ? "sky" : "neutral"}
                  >
                    {st === "completed" ? "✓ Tamam" : st === "in-progress" ? "→ Davam" : "Başla"}
                  </Chip>
                </div>
              </Tile>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
