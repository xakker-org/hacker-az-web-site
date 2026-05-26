import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile from "../components/ui/Tile";
import Button from "../components/ui/Button";
import { Chip } from "../components/ui/Chip";
import Bar from "../components/ui/Bar";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { endpoints } from "../services/endpoints";

export default function PassContentPage() {
  const { slug, passId } = useParams();
  const navigate          = useNavigate();

  const [pass, setPass]               = useState(null);
  const [mission, setMission]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [completing, setCompleting]   = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState(null);

  useEffect(() => {
    setLoading(true); setResult(null);
    Promise.all([
      endpoints.missionPassDetail(slug, passId),
      endpoints.missionDetail(slug),
    ])
      .then(([passRes, missionRes]) => {
        setPass(passRes.data);
        setMission(missionRes.data);
      })
      .catch(() => setError("Pass tapılmadı."))
      .finally(() => setLoading(false));
  }, [slug, passId]);

  const handleComplete = async () => {
    if (pass?.is_completed) return;
    setCompleting(true);
    try {
      const { data } = await endpoints.missionPassComplete(slug, passId);
      setResult(data);
      setPass(prev => ({ ...prev, is_completed: true }));
    } catch {
      setError("Pass tamamlana bilmədi.");
    } finally {
      setCompleting(false);
    }
  };

  const handleNext = () => {
    if (!mission) return;
    const passes       = mission.passes || [];
    const currentIndex = passes.findIndex(p => String(p.id) === String(passId));
    const nextPass     = passes[currentIndex + 1];
    if (!nextPass) {
      if (result?.all_passes_done && mission.exam) {
        navigate(`/missions/${slug}/exam`);
      } else {
        navigate(`/missions/${slug}`);
      }
      return;
    }
    navigate(`/missions/${slug}/passes/${nextPass.id}`);
  };

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TileSkeleton height={80} />
          <TileSkeleton height={420} />
          <TileSkeleton height={64} />
        </div>
      </AppShell>
    );
  }

  if (error && !pass) {
    return (
      <AppShell>
        <Tile>
          <EmptyState icon="◌" title="Pass tapılmadı" description={error || ""}
            action={<Button as={Link} to={`/missions/${slug}`} variant="accent">← Mission</Button>} />
        </Tile>
      </AppShell>
    );
  }

  const passes        = mission?.passes || [];
  const currentIndex  = passes.findIndex(p => String(p.id) === String(passId));
  const prevPass      = passes[currentIndex - 1];
  const nextPass      = passes[currentIndex + 1];
  const isLast        = currentIndex === passes.length - 1;
  const alreadyDone   = pass?.is_completed;
  const justCompleted = result !== null;

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <Link to="/missions"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-4)", textDecoration: "none" }}>
          Missions
        </Link>
        <span style={{ color: "var(--line-3)" }}>/</span>
        <Link to={`/missions/${slug}`}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", textDecoration: "none" }}>
          {mission?.title}
        </Link>
        <span style={{ color: "var(--line-3)" }}>/</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-1)", fontWeight: 600 }}>
          Pass {pass?.order}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Pass header */}
        <Tile style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.03) 100%)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              width: 48, height: 48, borderRadius: 13, flexShrink: 0,
              background: alreadyDone ? "rgba(110,255,214,0.12)" : "var(--accent-soft)",
              border: `1px solid ${alreadyDone ? "rgba(110,255,214,0.28)" : "var(--accent-ring)"}`,
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700,
              color: alreadyDone ? "var(--ok)" : "var(--accent)",
            }}>
              {alreadyDone ? "✓" : String(pass?.order || 1).padStart(2, "0")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.25 }}>
                {pass?.title}
              </h2>
              <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
                  ⏱ ~{pass?.estimated_minutes} dəq
                </span>
                <span style={{ color: "var(--line-2)", fontSize: 12 }}>·</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>
                  {currentIndex + 1} / {passes.length}
                </span>
                {alreadyDone && <Chip size="sm" tone="mint">✓ Tamamlandı</Chip>}
              </div>
            </div>
          </div>
          <Bar
            value={currentIndex + 1}
            max={passes.length}
            tone={alreadyDone ? "mint" : "accent"}
            rightCaption={`${currentIndex + 1}/${passes.length}`}
          />
        </Tile>

        {/* Success banner */}
        {justCompleted && (
          <div style={{
            padding: "14px 18px", borderRadius: 12,
            background: "rgba(110,255,214,0.08)", border: "1px solid rgba(110,255,214,0.28)",
            display: "flex", alignItems: "center", gap: 12,
            fontSize: 13, fontWeight: 600, color: "var(--ok)",
          }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <span>Pass tamamlandı!</span>
            {result?.all_passes_done && mission?.exam && (
              <span style={{ color: "var(--c-3)", marginLeft: 4 }}>
                🎉 Bütün pass-lar bitdi — Final Exam açıldı!
              </span>
            )}
            {result?.all_passes_done && !mission?.exam && (
              <span style={{ marginLeft: 4 }}>🎉 Mission tamamlandı!</span>
            )}
          </div>
        )}

        {error && !justCompleted && (
          <div style={{
            padding: "12px 16px", borderRadius: 12,
            background: "rgba(255,122,138,0.08)", border: "1px solid rgba(255,122,138,0.28)",
            color: "var(--bad)", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Content */}
        <Tile>
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: pass?.content || "<p>İçerik mövcud deyil.</p>" }}
          />
        </Tile>

        {/* Sticky actions bar */}
        <Tile style={{
          padding: "14px 20px",
          position: "sticky", bottom: 16,
          background: "rgba(17,20,26,0.96)",
          backdropFilter: "blur(16px)",
          border: "1px solid var(--line-2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            {/* Left: back + pass dots */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {prevPass ? (
                <Button variant="ghost" size="sm" as={Link} to={`/missions/${slug}/passes/${prevPass.id}`}>
                  ← Əvvəlki
                </Button>
              ) : (
                <Button variant="ghost" size="sm" as={Link} to={`/missions/${slug}`}>
                  ← Mission
                </Button>
              )}
              <div style={{ display: "flex", gap: 4 }}>
                {passes.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/missions/${slug}/passes/${p.id}`}
                    style={{
                      width: 8, height: 8, borderRadius: "50%", display: "block",
                      background: i === currentIndex
                        ? "var(--accent)"
                        : i < currentIndex ? "var(--ok)" : "var(--line-2)",
                      transition: "background var(--dur-1)",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right: complete + next */}
            <div style={{ display: "flex", gap: 8 }}>
              {!alreadyDone && !justCompleted ? (
                <Button variant="accent" onClick={handleComplete} disabled={completing}>
                  {completing ? "Saxlanır..." : "✓ Tamamlandı kimi işarələ"}
                </Button>
              ) : (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: "rgba(110,255,214,0.08)", border: "1px solid rgba(110,255,214,0.25)",
                  color: "var(--ok)",
                }}>
                  ✓ Tamamlandı
                </span>
              )}

              {(alreadyDone || justCompleted) && (
                isLast ? (
                  mission?.exam ? (
                    <Button variant="accent" as={Link} to={`/missions/${slug}/exam`}>
                      📋 Final Exam →
                    </Button>
                  ) : (
                    <Button variant="ghost" as={Link} to={`/missions/${slug}`}>
                      ← Mission
                    </Button>
                  )
                ) : (
                  <Button variant="accent" onClick={handleNext}>
                    Növbəti →
                  </Button>
                )
              )}
            </div>
          </div>
        </Tile>

      </div>
    </AppShell>
  );
}
