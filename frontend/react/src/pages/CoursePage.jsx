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

function LessonRow({ lesson, idx, slug, accent }) {
  const [hovered, setHovered] = useState(false);
  const done = lesson.user_completed;

  return (
    <Link
      to={`/courses/${slug}/lessons/${lesson.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "14px",
        padding: "14px 16px",
        borderRadius: "12px",
        background: done
          ? "rgba(110,255,214,0.05)"
          : hovered
          ? "var(--bg-elev)"
          : "var(--bg-card-2)",
        border: `1px solid ${
          done
            ? "rgba(110,255,214,0.20)"
            : hovered
            ? "var(--line-3)"
            : "var(--line-2)"
        }`,
        textDecoration: "none",
        color: "inherit",
        transition: "background 140ms ease, border-color 140ms ease",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Index / check badge */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: "var(--font-mono)",
        fontSize: done ? "16px" : "12px",
        fontWeight: 700,
        background: done
          ? "rgba(110,255,214,0.12)"
          : hovered
          ? `${accent}18`
          : "var(--bg-elev)",
        color: done ? "var(--ok)" : hovered ? accent : "var(--ink-4)",
        border: `1px solid ${
          done
            ? "rgba(110,255,214,0.28)"
            : hovered
            ? `${accent}40`
            : "var(--line-2)"
        }`,
        transition: "all 140ms ease",
      }}>
        {done ? "✓" : idx + 1}
      </div>

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "13px",
          fontWeight: 600,
          color: done ? "var(--ink-3)" : "var(--ink-1)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: "5px",
          transition: "color 140ms ease",
        }}>
          {lesson.title}
        </div>
        <div style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          alignItems: "center",
        }}>
          {lesson.has_video && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 600,
              background: "rgba(108,179,255,0.10)",
              color: "var(--c-6)",
              border: "1px solid rgba(108,179,255,0.22)",
            }}>
              ▶ Video
            </span>
          )}
          {lesson.has_text && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 600,
              background: "rgba(192,132,252,0.10)",
              color: "var(--c-5)",
              border: "1px solid rgba(192,132,252,0.22)",
            }}>
              ≡ Mətn
            </span>
          )}
          {(lesson.question_count || 0) > 0 && (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "10px",
              fontWeight: 600,
              background: "rgba(255,184,107,0.10)",
              color: "var(--c-3)",
              border: "1px solid rgba(255,184,107,0.22)",
            }}>
              ? {lesson.question_count} quiz
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div style={{ flexShrink: 0 }}>
        {done ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 600,
            background: "rgba(110,255,214,0.10)",
            color: "var(--ok)",
            border: "1px solid rgba(110,255,214,0.25)",
          }}>
            ✓ Tamamlandı
          </span>
        ) : (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 700,
            color: hovered ? accent : "var(--ink-4)",
            background: hovered ? `${accent}14` : "transparent",
            border: `1px solid ${hovered ? `${accent}35` : "transparent"}`,
            transition: "all 140ms ease",
          }}>
            →
          </span>
        )}
      </div>
    </Link>
  );
}

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
        marginBottom: 0,
        overflow: "hidden",
        background: `linear-gradient(135deg, ${accent}10 0%, var(--bg-card) 55%)`,
        border: `1px solid ${accent}25`,
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "3px",
          background: `linear-gradient(90deg, ${accent}, ${accent}60)`,
          opacity: 0.8,
        }} />

        <Button variant="ghost" size="sm" as={Link} to="/courses"
          style={{ alignSelf: "flex-start" }}>
          ← Kurslara qayıt
        </Button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "18px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            flexShrink: 0,
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
          }}>
            {course.icon || "▤"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {course.category && (
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: accent,
                marginBottom: "6px",
              }}>
                {course.category}
              </div>
            )}
            <h1 style={{ margin: "0 0 6px", fontSize: "26px", fontWeight: 700, color: "var(--ink-1)" }}>
              {course.title}
            </h1>
            {course.description && (
              <p style={{
                fontSize: "13px",
                color: "var(--ink-3)",
                lineHeight: 1.65,
                margin: "0 0 12px",
                maxWidth: "600px",
              }}>
                {course.description}
              </p>
            )}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
        <TileHead
          eyebrow="Proqram"
          title="Dərslər"
          action={
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--ink-3)",
            }}>
              {completedCount}/{lessons.length}
            </span>
          }
        />

        {lessons.length === 0 ? (
          <EmptyState
            icon="◌"
            title="Hələ dərs yoxdur"
            description="Bu kursda hələ dərs əlavə edilməyib."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {lessons.map((lesson, idx) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                idx={idx}
                slug={slug}
                accent={accent}
              />
            ))}
          </div>
        )}
      </Tile>
    </AppShell>
  );
}
