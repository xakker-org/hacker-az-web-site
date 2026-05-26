import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const done = lesson.user_completed;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/courses/${slug}/lessons/${lesson.id}`)}
      onKeyDown={e => e.key === "Enter" && navigate(`/courses/${slug}/lessons/${lesson.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: "13px 16px",
        borderRadius: 12,
        background: done
          ? "rgba(110,255,214,0.05)"
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        border: `1px solid ${done ? "rgba(110,255,214,0.20)" : hovered ? "var(--line-2)" : "var(--line)"}`,
        transition: "background 150ms, border-color 150ms",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {/* Nömrə / tamamlandı badge */}
      <div style={{
        width: 34,
        height: 34,
        borderRadius: 9,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-mono)",
        fontSize: done ? 15 : 12,
        fontWeight: 700,
        background: done ? "rgba(110,255,214,0.12)" : hovered ? `${accent}18` : "var(--bg-elev)",
        color: done ? "var(--ok)" : hovered ? accent : "var(--ink-4)",
        border: `1px solid ${done ? "rgba(110,255,214,0.28)" : hovered ? `${accent}40` : "var(--line-2)"}`,
        transition: "all 150ms",
      }}>
        {done ? "✓" : idx + 1}
      </div>

      {/* Başlıq + chip-lər */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: done ? "var(--ink-3)" : "var(--ink-1)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: 5,
        }}>
          {lesson.title}
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 5, alignItems: "center" }}>
          {lesson.has_video && (
            <span style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 600,
              padding: "2px 8px", borderRadius: 99,
              background: "rgba(108,179,255,0.10)",
              color: "#6cb3ff",
              border: "1px solid rgba(108,179,255,0.22)",
            }}>&#9654; Video</span>
          )}
          {lesson.has_text && (
            <span style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 600,
              padding: "2px 8px", borderRadius: 99,
              background: "rgba(192,132,252,0.10)",
              color: "#c084fc",
              border: "1px solid rgba(192,132,252,0.22)",
            }}>Mətn</span>
          )}
          {(lesson.question_count || 0) > 0 && (
            <span style={{
              display: "inline-block",
              fontSize: 10, fontWeight: 600,
              padding: "2px 8px", borderRadius: 99,
              background: "rgba(255,184,107,0.10)",
              color: "#ffb86b",
              border: "1px solid rgba(255,184,107,0.22)",
            }}>{lesson.question_count} quiz</span>
          )}
        </div>
      </div>

      {/* Sağ: status */}
      <div style={{ flexShrink: 0 }}>
        {done ? (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11, fontWeight: 600,
            padding: "3px 10px", borderRadius: 99,
            background: "rgba(110,255,214,0.10)",
            color: "var(--ok)",
            border: "1px solid rgba(110,255,214,0.25)",
          }}>
            ✓ Tamamlandı
          </span>
        ) : (
          <span style={{
            fontSize: 16,
            color: hovered ? accent : "var(--ink-4)",
            transition: "color 150ms, transform 150ms",
            display: "inline-block",
            transform: hovered ? "translateX(3px)" : "none",
          }}>&#8594;</span>
        )}
      </div>
    </div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
