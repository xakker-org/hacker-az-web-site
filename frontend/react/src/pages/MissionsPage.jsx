import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";

const T = {
  az: {
    eyebrow: "Missions", title: "Praktiki tapşırıqlar",
    sub: "Pass-ları keç, final exam qazan, XP topla.",
    all: "Hamısı", inProgress: "Davam edir", completed: "Tamamlandı", notStarted: "Başlanmayıb",
    totalMissions: "Cəmi mission", inProgressStat: "Davam edir", completedStat: "Tamamlandı", completion: "Tamamlanma",
    searchPlaceholder: "Mission axtar...", results: "nəticə",
    notFound: "Mission tapılmadı", resetFilters: "Filtri sıfırla",
    reset: "Sıfırla",
    statusCompleted: "✓ Tamam", statusInProgress: "→ Davam", statusNotStarted: "Başla →",
  },
  en: {
    eyebrow: "Missions", title: "Practice missions",
    sub: "Complete passes, earn the final exam, collect XP.",
    all: "All", inProgress: "In Progress", completed: "Completed", notStarted: "Not Started",
    totalMissions: "Total missions", inProgressStat: "In progress", completedStat: "Completed", completion: "Completion",
    searchPlaceholder: "Search missions...", results: "results",
    notFound: "No missions found", resetFilters: "Reset filters",
    reset: "Reset",
    statusCompleted: "✓ Done", statusInProgress: "→ Active", statusNotStarted: "Start →",
  },
};
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Segmented from "../components/ui/Segmented";
import { Input } from "../components/ui/Field";
import { Chip, DiffBadge } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import { endpoints } from "../services/endpoints";

const DIFF_COLOR = {
  easy:         "#6effd6",
  beginner:     "#6effd6",
  medium:       "#ffb86b",
  intermediate: "#ffb86b",
  hard:         "#ff7a8a",
  advanced:     "#ff7a8a",
  expert:       "#c084fc",
};

function statusOf(p) {
  if (!p) return "not-started";
  if (p.is_completed) return "completed";
  return "in-progress";
}


export default function MissionsPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [missions, setMissions] = useState([]);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let ok = true;
    endpoints.missions()
      .then(({ data }) => ok && setMissions(Array.isArray(data) ? data : []))
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const counts = useMemo(() => {
    const by = { all: missions.length, "in-progress": 0, completed: 0, "not-started": 0 };
    missions.forEach(m => { by[statusOf(m.user_progress)]++; });
    return by;
  }, [missions]);

  const filtered = useMemo(() => {
    return missions.filter(m => {
      const st   = statusOf(m.user_progress);
      const okSt = filter === "all" || filter === st;
      const q    = search.trim().toLowerCase();
      const okQ  = !q || `${m.title} ${m.description || ""}`.toLowerCase().includes(q);
      return okSt && okQ;
    });
  }, [missions, filter, search]);

  const totalXP     = missions.reduce((s, m) => s + (m.xp_reward || 0), 0);
  const completedXP = missions.filter(m => m.user_progress?.is_completed).reduce((s, m) => s + (m.xp_reward || 0), 0);
  const completePct = missions.length > 0 ? Math.round((counts.completed / missions.length) * 100) : 0;

  const FILTERS = [
    { value: "all",         label: t.all          },
    { value: "in-progress", label: t.inProgress   },
    { value: "completed",   label: t.completed    },
    { value: "not-started", label: t.notStarted   },
  ];
  const STATUS_META = {
    completed:    { tone: "mint",    label: t.statusCompleted   },
    "in-progress":{ tone: "sky",     label: t.statusInProgress  },
    "not-started":{ tone: "neutral", label: t.statusNotStarted  },
  };

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
      <div className="bento" style={{ marginBottom: 20 }}>
        <Tile span={3}><Stat label={t.totalMissions} value={counts.all} size="md" /></Tile>
        <Tile span={3}><Stat label={t.inProgressStat} value={counts["in-progress"]} size="md" /></Tile>
        <Tile span={3}>
          <Stat label={t.completedStat} value={counts.completed} size="md"
            hint={`${completedXP.toLocaleString()} / ${totalXP.toLocaleString()} XP`} />
        </Tile>
        <Tile span={3}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ProgressRing value={completePct} size={56} strokeWidth={6} tone="accent" label={`${completePct}%`} />
            <Stat label={t.completion} value={completePct} unit="%" size="md" />
          </div>
        </Tile>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <Segmented
          value={filter}
          onChange={setFilter}
          options={FILTERS.map(f => ({ ...f, count: counts[f.value] }))}
        />
        <Input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260, flex: 1, minWidth: 180 }}
        />
        <Chip size="sm" tone={filtered.length > 0 ? "accent" : "neutral"} style={{ marginLeft: "auto" }}>
          {filtered.length} {t.results}
        </Chip>
      </div>

      {loading ? (
        <div className="bento">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="span-4"><TileSkeleton height={210} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState
            icon="◎"
            title={t.notFound}
            description={t.resetFilters}
            action={<Button variant="ghost" onClick={() => { setFilter("all"); setSearch(""); }}>{t.reset}</Button>}
          />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map((m, i) => {
            const p     = m.user_progress;
            const st    = statusOf(p);
            const meta  = STATUS_META[st];
            const total = p?.total_passes ?? m.pass_count ?? 0;
            const done  = p?.completed_passes ?? 0;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            const diffColor = DIFF_COLOR[m.difficulty?.toLowerCase()] || "var(--accent)";

            return (
              <Tile
                key={m.id}
                span={4}
                as={Link}
                to={`/missions/${m.slug}`}
                interactive
                style={{
                  animationDelay: `${i * 20}ms`,
                  borderTop: `2px solid ${st === "completed" ? "var(--ok)" : diffColor}22`,
                  borderColor: st === "completed" ? "rgba(110,255,214,0.18)" : undefined,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Colored top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: st === "completed" ? "var(--ok)" : diffColor,
                  opacity: st === "completed" ? 0.7 : 0.5,
                }} />

                {/* Icon + title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: m.cover_color ? `${m.cover_color}18` : "var(--bg-card-2)",
                    border: "1px solid var(--line-2)",
                    display: "grid", placeItems: "center", fontSize: 20,
                  }}>
                    {m.icon || "◎"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: "var(--ink-1)",
                      marginBottom: 4, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {m.title}
                    </div>
                    <div style={{
                      fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {m.short_description || m.description}
                    </div>
                  </div>
                </div>

                {/* Chips */}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  <DiffBadge level={m.difficulty} />
                  {total > 0 && <Chip size="sm">{total} pass</Chip>}
                  {m.estimated_hours > 0 && <Chip size="sm">~{m.estimated_hours}h</Chip>}
                  {m.has_exam && <Chip size="sm" tone="violet">Final exam</Chip>}
                </div>

                {/* Progress bar */}
                {p && total > 0 && (
                  <Bar
                    value={pct}
                    tone={st === "completed" ? "mint" : "accent"}
                    rightCaption={`${done}/${total} · ${pct}%`}
                  />
                )}

                {/* Footer */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--line)",
                }}>
                  <span className="mono tnum" style={{ color: "var(--accent)", fontWeight: 800, fontSize: 14 }}>
                    +{(m.xp_reward || 0).toLocaleString()} XP
                  </span>
                  <Chip size="sm" tone={meta.tone}>{meta.label}</Chip>
                </div>
              </Tile>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
