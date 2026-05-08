import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useLang } from "../contexts/LanguageContext";

const T = {
  az: {
    eyebrow: "Courses", title: "Strukturlu öyrənmə",
    sub: "Video dərslər, quizlər və real lab tapşırıqları.",
    totalCourses: "Cəmi kurs", enrolled: "Qeydiyyatlı", completed: "Tamamlandı", lessons: "Dərs",
    searchPlaceholder: "Kurs axtar...", results: "nəticə",
    notFound: "Kurs tapılmadı",
    resetFilters: "Axtarış sözünü dəyişdir və ya kateqoriyanı sıfırla.",
    resetBtn: "Filtrləri sıfırla",
    done: "✓ Tamam", active: "→ Davam",
    all: "Hamısı",
  },
  en: {
    eyebrow: "Courses", title: "Structured learning",
    sub: "Video lessons, quizzes and real lab challenges.",
    totalCourses: "Total courses", enrolled: "Enrolled", completed: "Completed", lessons: "Lessons",
    searchPlaceholder: "Search courses...", results: "results",
    notFound: "No courses found",
    resetFilters: "Change your search or reset the category.",
    resetBtn: "Reset filters",
    done: "✓ Done", active: "→ Active",
    all: "All",
  },
};
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import Tabs from "../components/ui/Tabs";
import { Input } from "../components/ui/Field";
import { Chip } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import { endpoints } from "../services/endpoints";

const CATEGORY_ACCENT = {
  "web": "#6cb3ff",
  "network": "#6effd6",
  "linux": "#ffb86b",
  "crypto": "#c084fc",
  "forensics": "#9eff6e",
  "osint": "#ff7a8a",
  "reverse": "#ffb86b",
  "pwn": "#ff7a8a",
};

function categoryAccent(name) {
  const key = (name || "").toLowerCase();
  return CATEGORY_ACCENT[key] || "var(--accent)";
}

export default function CoursesPage() {
  const { lang } = useLang();
  const t = T[lang] || T.az;
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [activeCat, setCat]   = useState("");

  useEffect(() => {
    let ok = true;
    endpoints.courses()
      .then(({ data }) => { if (ok) setCourses(Array.isArray(data) ? data : []); })
      .catch(() => { if (ok) setError("Kurslar yüklənə bilmədi"); })
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, []);

  const cats = useMemo(() => {
    const seen = new Set();
    const list = [];
    courses.forEach(c => {
      const cat = c.category || c.category_name || "";
      if (cat && !seen.has(cat)) { seen.add(cat); list.push(cat); }
    });
    return list;
  }, [courses]);

  const catTabs = [
    { value: "", label: t.all },
    ...cats.map(c => ({ value: c, label: c })),
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(c => {
      const matchCat = !activeCat || (c.category || c.category_name || "") === activeCat;
      const matchQ   = !q || `${c.title} ${c.description || ""} ${c.category || ""}`.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [courses, search, activeCat]);

  const enrolled  = courses.filter(c => c.enrolled).length;
  const completed = courses.filter(c => c.progress_percent >= 100).length;
  const totalLess = courses.reduce((s, c) => s + (c.lesson_count || 0), 0);

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
        <Tile span={3}><Stat label={t.totalCourses} value={courses.length} size="md" /></Tile>
        <Tile span={3}><Stat label={t.enrolled} value={enrolled} size="md" /></Tile>
        <Tile span={3}>
          <Stat label={t.completed} value={completed} size="md"
            hint={enrolled > 0 ? `${Math.round(completed / enrolled * 100)}%` : ""} />
        </Tile>
        <Tile span={3}><Stat label={t.lessons} value={totalLess} size="md" /></Tile>
      </div>

      {/* Category tabs */}
      {catTabs.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <Tabs value={activeCat} onChange={setCat} options={catTabs} ariaLabel="Kateqoriyalar" />
        </div>
      )}

      {/* Search */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
        <Input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320, flex: 1 }}
        />
        <Chip size="sm" tone={filtered.length > 0 ? "accent" : "neutral"} style={{ marginLeft: "auto" }}>
          {filtered.length} {t.results}
        </Chip>
      </div>

      {error && (
        <Tile style={{ marginBottom: 16 }}>
          <div style={{ color: "var(--bad)", padding: 4 }}>{error}</div>
        </Tile>
      )}

      {loading ? (
        <div className="bento">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="span-4"><TileSkeleton height={210} /></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Tile>
          <EmptyState
            icon="▤"
            title={t.notFound}
            description={t.resetFilters}
            action={search || activeCat
              ? <Button variant="ghost" onClick={() => { setSearch(""); setCat(""); }}>{t.resetBtn}</Button>
              : null}
          />
        </Tile>
      ) : (
        <div className="bento">
          {filtered.map(c => {
            const catName  = c.category || c.category_name || "";
            const accent   = c.cover_color || categoryAccent(catName);
            const isEnroll = Boolean(c.enrolled);
            const pct      = c.progress_percent || 0;
            const done     = pct >= 100;

            return (
              <Tile key={c.id} span={4} as={Link} to={`/courses/${c.slug}`} interactive style={{ overflow: "hidden" }}>
                {/* Colored top accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: accent, opacity: done ? 0.8 : 0.4,
                }} />

                {/* Icon + title */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `${accent}18`,
                    border: `1px solid ${accent}30`,
                    display: "grid", placeItems: "center", fontSize: 20,
                  }}>
                    {c.icon || "▤"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: "var(--ink-1)",
                      marginBottom: 4, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {c.title}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {catName && <Chip size="sm">{catName}</Chip>}
                      {done && <Chip size="sm" tone="mint">{t.done}</Chip>}
                      {isEnroll && !done && <Chip size="sm" tone="sky">{t.active}</Chip>}
                    </div>
                  </div>
                </div>

                {c.description && (
                  <p style={{
                    fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {c.description}
                  </p>
                )}

                {isEnroll && (
                  <Bar value={pct} tone={done ? "mint" : "accent"} rightCaption={`${pct}%`} />
                )}

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--line)",
                  fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)",
                }}>
                  <span>{c.lesson_count || 0} dərs · {c.room_count || 0} otaq</span>
                  <span style={{ color: accent, fontWeight: 700 }}>→</span>
                </div>
              </Tile>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
