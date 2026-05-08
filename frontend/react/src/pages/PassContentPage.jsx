import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";

export default function PassContentPage() {
  const { slug, passId } = useParams();
  const navigate         = useNavigate();

  const [pass, setPass]           = useState(null);
  const [mission, setMission]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [completing, setCompleting] = useState(false);
  const [result, setResult]       = useState(null);  // { completed_passes, total_passes, all_passes_done }
  const [error, setError]         = useState(null);

  useEffect(() => {
    setLoading(true);
    setResult(null);
    Promise.all([
      endpoints.missionPassDetail(slug, passId),
      endpoints.missionDetail(slug),
    ])
      .then(([passRes, missionRes]) => {
        setPass(passRes.data);
        setMission(missionRes.data);
      })
      .catch(() => setError("Pass not found."))
      .finally(() => setLoading(false));
  }, [slug, passId]);

  const handleComplete = async () => {
    if (pass?.is_completed) return;
    setCompleting(true);
    try {
      const { data } = await endpoints.missionPassComplete(slug, passId);
      setResult(data);
      setPass((prev) => ({ ...prev, is_completed: true }));
    } catch {
      setError("Failed to mark pass as complete.");
    } finally {
      setCompleting(false);
    }
  };

  const handleNext = () => {
    if (!mission) return;
    const passes = mission.passes || [];
    const currentIndex = passes.findIndex((p) => String(p.id) === String(passId));
    const nextPass = passes[currentIndex + 1];

    if (!nextPass) {
      // No more passes — go to exam if available, else mission detail
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
      <AppShell title="Pass">
        <div className="ms-spinner" />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Pass">
        <div className="ms-empty">{error}</div>
      </AppShell>
    );
  }

  const passes = mission?.passes || [];
  const currentIndex = passes.findIndex((p) => String(p.id) === String(passId));
  const prevPass = passes[currentIndex - 1];
  const nextPass = passes[currentIndex + 1];
  const isLast   = currentIndex === passes.length - 1;
  const alreadyDone = pass?.is_completed;
  const justCompleted = result !== null;

  return (
    <AppShell title={`Pass ${pass?.order}: ${pass?.title}`}>
      <div className="ms-pass-page">
        {/* Breadcrumb */}
        <div className="ms-pass-nav">
          <Link to="/missions">Missions</Link>
          <span className="ms-pass-nav-sep">/</span>
          <Link to={`/missions/${slug}`}>{mission?.title}</Link>
          <span className="ms-pass-nav-sep">/</span>
          <span className="ms-pass-current">Pass {pass?.order}</span>
        </div>

        {/* Pass header */}
        <div className="ms-pass-header-card">
          <div className="ms-pass-num">{String(pass?.order).padStart(2, "0")}</div>
          <div className="ms-pass-header-info">
            <div className="ms-pass-header-title">{pass?.title}</div>
            <div className="ms-pass-header-meta">
              <span>~{pass?.estimated_minutes} min</span>
              <span>•</span>
              <span>
                Pass {currentIndex + 1} of {passes.length}
              </span>
              {alreadyDone && (
                <>
                  <span>•</span>
                  <span style={{ color: "var(--green)" }}>✓ Completed</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="ms-pass-content-card"
          dangerouslySetInnerHTML={{ __html: pass?.content || "<p>No content available.</p>" }}
        />

        {/* Post-complete banner */}
        {justCompleted && (
          <div
            style={{
              background: "var(--green-dim)",
              border: "1.5px solid var(--green-ring)",
              borderRadius: "var(--r3)",
              padding: "14px 18px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              color: "var(--green)",
              fontWeight: 600,
            }}
          >
            ✓ Pass marked as completed!
            {result.all_passes_done && mission?.exam && (
              <span style={{ color: "var(--amber)", marginLeft: 8 }}>
                🎉 All passes done — Final Exam is now unlocked!
              </span>
            )}
            {result.all_passes_done && !mission?.exam && (
              <span style={{ color: "var(--green)", marginLeft: 8 }}>
                🎉 Mission completed!
              </span>
            )}
          </div>
        )}

        {/* Actions bar */}
        <div className="ms-pass-actions">
          <div className="ms-pass-actions-left">
            {prevPass ? (
              <Link
                to={`/missions/${slug}/passes/${prevPass.id}`}
                className="ms-btn ms-btn-ghost"
              >
                ← Previous
              </Link>
            ) : (
              <Link to={`/missions/${slug}`} className="ms-btn ms-btn-ghost">
                ← Mission
              </Link>
            )}
          </div>

          <div className="ms-pass-indicator">
            {passes.map((p, i) => (
              <span
                key={p.id}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    i === currentIndex
                      ? "var(--blue)"
                      : i < currentIndex
                      ? "var(--green)"
                      : "var(--b2)",
                  display: "inline-block",
                  margin: "0 2px",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {!alreadyDone && !justCompleted ? (
              <button
                className="ms-btn ms-btn-primary"
                onClick={handleComplete}
                disabled={completing}
              >
                {completing ? "Saving…" : "✓ Mark Complete"}
              </button>
            ) : (
              <button className="ms-btn ms-btn-completed" disabled>
                ✓ Completed
              </button>
            )}

            {(alreadyDone || justCompleted) && (
              isLast ? (
                mission?.exam ? (
                  <Link to={`/missions/${slug}/exam`} className="ms-btn ms-btn-primary">
                    📋 Final Exam →
                  </Link>
                ) : (
                  <Link to={`/missions/${slug}`} className="ms-btn ms-btn-secondary">
                    ← Mission Overview
                  </Link>
                )
              ) : (
                <button className="ms-btn ms-btn-secondary" onClick={handleNext}>
                  Next Pass →
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
