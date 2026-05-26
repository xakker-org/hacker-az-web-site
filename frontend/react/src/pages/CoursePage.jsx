import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Stat from "../components/ui/Stat";
import Bar from "../components/ui/Bar";
import Button from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import EmptyState from "../components/ui/EmptyState";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

const CATEGORY_ACCENT = {
  web: "#6cb3ff", network: "#6effd6", linux: "#ffb86b",
  crypto: "#c084fc", forensics: "#9eff6e", osint: "#ff7a8a",
  reverse: "#ffb86b", pwn: "#ff7a8a",
};

export default function CoursePage() {
  const { slug } = useParams();
  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    setLoading(true);
    endpoints.courseDetail(slug)
      .then(({ data }) => setCourse(data))
      .catch(() => setError("Kurs yüklənə bilmədi."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TileSkeleton height={220} />
          <TileSkeleton height={380} />
        </div>
      </AppShell>
    );
  }

  if (error || !course) {
    return (
      <AppShell>
        <Tile>
          <EmptyState icon="▤" title="Kurs tapılmadı" description={error || ""}
            action={<Button as={Link} to="/courses" variant="accent">← Kurslara qayıt</Button>} />
        </Tile>
      </AppShell>
    );
  }

  const lessons        = course.lessons || [];
  const completedCount = lessons.filter(l => l.user_completed).length;
  const pct            = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const catKey         = (course.category || "").toLowerCase();
  const accent         = course.cover_color || CATEGORY_ACCENT[catKey] || "var(--accent)";

  return (
    <AppShell>
      {/* Hero tile */}
      <Tile style={{
        marginBottom: 0, overflow: "hidden",
        background: `linear-gradient(135deg, ${accent}12 0%, var(--bg-card) 60%)`,
        border: `1px solid ${accent}22`,
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: accent, opacity: 0.7,
        }} />

        <Button variant="ghost" size="sm" as={Link} to="/courses" style={{ alignSelf: "flex-start" }}>
          ← Kurslara qayıt
        </Button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          <span style={{
            width: 64, height: 64, borderRadius: 16, flexShrink: 0,
            background: `${accent}18`, border: `1px solid ${accent}30`,
            display: "grid", placeItems: "center", fontSize: 30,
          }}>
            {course.icon || "▤"}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {course.category && (
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: accent, marginBottom: 6,
              }}>
                {course.category}
              </div>
            )}
            <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700, color: "var(--ink-1)" }}>
              {course.title}
            </h1>
            {course.description && (
              <p style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.65, margin: "0 0 12px", maxWidth: 600 }}>
                {course.description}
              </p>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Chip size="sm" tone="sky">{lessons.length} dərs</Chip>
              {course.room_count > 0 && <Chip size="sm">{course.room_count} otaq</Chip>}
              {completedCount > 0 && (
                <Chip size="sm" tone="mint">{completedCount}/{lessons.length} tamamlandı</Chip>
              )}
            </div>
          </div>
        </div>

        {lessons.length > 0 && (
          <Bar value={pct} max={100} tone={pct >= 100 ? "mint" : "accent"} rightCaption={`${pct}%`} />
        )}
      </Tile>

      {/* Stats row */}
      {lessons.length > 0 && (
        <div className="bento" style={{ marginBottom: 0 }}>
          <Tile span={4}><Stat label="Dərslər" value={lessons.length} size="md" /></Tile>
          <Tile span={4}><Stat label="Tamamlandı" value={completedCount} size="md" hint={`${pct}%`} /></Tile>
          <Tile span={4}><Stat label="Otaqlar" value={course.room_count || 0} size="md" /></Tile>
        </div>
      )}

      {/* Lessons list */}
      <Tile>
        <TileHead eyebrow="Lessons" title="Dərslər"
          action={
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
              {completedCount}/{lessons.length}
            </span>
          }
        />

        {lessons.length === 0 ? (
          <EmptyState icon="◌" title="Hələ dərs yoxdur" description="Bu kursda hələ dərs əlavə edilməyib." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {lessons.map((lesson, idx) => {
              const done = lesson.user_completed;
              return (
                <Link
                  key={lesson.id}
                  to={`/courses/${slug}/lessons/${lesson.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: done ? "rgba(110,255,214,0.05)" : "var(--bg-card-2)",
                    border: `1px solid ${done ? "rgba(110,255,214,0.22)" : "var(--line)"}`,
                    textDecoration: "none", color: "inherit",
                    transition: "border-color var(--dur-1), background var(--dur-1)",
                  }}
                  onMouseEnter={e => {
                    if (!done) {
                      e.currentTarget.style.borderColor = "var(--line-3)";
                      e.currentTarget.style.background  = "var(--bg-elev)";
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = done ? "rgba(110,255,214,0.22)" : "var(--line)";
                    e.currentTarget.style.background  = done ? "rgba(110,255,214,0.05)" : "var(--bg-card-2)";
                  }}
                >
                  {/* Number / check */}
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                    background: done ? "rgba(110,255,214,0.12)" : "var(--bg-elev)",
                    color: done ? "var(--ok)" : "var(--ink-4)",
                    border: `1px solid ${done ? "rgba(110,255,214,0.28)" : "var(--line)"}`,
                  }}>
                    {done ? "✓" : idx + 1}
                  </span>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: done ? "var(--ink-3)" : "var(--ink-1)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {lesson.title}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      {lesson.has_video && <Chip size="sm">▶ Video</Chip>}
                      {lesson.has_text  && <Chip size="sm">📄 Mətn</Chip>}
                      {(lesson.question_count || 0) > 0 && (
                        <Chip size="sm" tone="sky">{lesson.question_count} quiz</Chip>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  {done ? (
                    <Chip size="sm" tone="mint">Tamamlandı ✓</Chip>
                  ) : (
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 13,
                      color: accent, fontWeight: 700,
                    }}>→</span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </Tile>
    </AppShell>
  );
}
