import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import { Input } from "../components/ui/Field";
import { Chip } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    let mounted = true;
    endpoints.courses()
      .then(({ data }) => { if (mounted) setCourses(Array.isArray(data) ? data : []); })
      .catch(() => { if (mounted) setError("Kurslar yüklənə bilmədi"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(c => `${c.title} ${c.description} ${c.category || ""}`.toLowerCase().includes(q));
  }, [courses, search]);

  const totalLessons = courses.reduce((s, c) => s + (c.lesson_count || 0), 0);
  const totalRooms = courses.reduce((s, c) => s + (c.room_count || 0), 0);

  return (
    <AppShell>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Courses</div>
          <h1 className="page-title">Strukturlu öyrənmə</h1>
          <div className="page-sub">Video dərslər, quizlər və real lab tapşırıqları.</div>
        </div>
      </div>

      <div className="bento" style={{ marginBottom: 16 }}>
        <Tile span={4}><Stat label="Cəmi kurs" value={courses.length} size="md" /></Tile>
        <Tile span={4}><Stat label="Dərs" value={totalLessons} size="md" /></Tile>
        <Tile span={4}><Stat label="Otaq" value={totalRooms} size="md" /></Tile>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Input
          placeholder="Kurs axtar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <Chip size="sm" style={{ marginLeft: "auto" }}>{filtered.length} nəticə</Chip>
      </div>

      {error && <Tile><div style={{ color: "var(--c-4)" }}>{error}</div></Tile>}

      {loading ? (
        <div className="bento">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="span-4"><TileSkeleton height={200} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState icon="▤" title="Kurs tapılmadı" description="Axtarış sözünü dəyişdirməyə cəhd et." />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map(c => {
            const accent = c.cover_color || "var(--accent)";
            const enrolled = Boolean(c.enrolled);
            return (
              <Tile key={c.id} span={4} as={Link} to={`/courses/${c.slug}`} interactive>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${accent}1f`,
                    border: `1px solid ${accent}40`,
                    display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0,
                  }}>{c.icon || "▤"}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tile-title">{c.title}</div>
                    {c.category && <Chip size="sm" style={{ marginTop: 4 }}>{c.category}</Chip>}
                  </div>
                </div>
                <p className="tile-sub" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                  {c.description}
                </p>
                {enrolled && c.progress_percent !== undefined && (
                  <Bar value={c.progress_percent} tone="accent" rightCaption={`${c.progress_percent}%`} />
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
                  <span>{c.lesson_count || 0} dərs · {c.room_count || 0} otaq</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>→</span>
                </div>
              </Tile>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
