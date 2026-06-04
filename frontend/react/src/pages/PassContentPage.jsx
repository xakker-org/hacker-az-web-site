import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";

function ChevronIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function ArrowIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function PassContentPage() {
  const { slug, passId } = useParams();
  const navigate         = useNavigate();

  const [pass, setPass]             = useState(null);
  const [mission, setMission]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [completing, setCompleting] = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState(null);

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
        <TileSkeleton height={40} />
        <TileSkeleton height={60} style={{ marginTop: 16 }} />
        <TileSkeleton height={400} style={{ marginTop: 16 }} />
      </AppShell>
    );
  }

  if (error && !pass) {
    return (
      <AppShell>
        <div className="xk-back-row">
          <Link to={`/missions/${slug}`} className="xk-back"><ChevronIcon /> Mission</Link>
        </div>
        <div className="xk-empty-screen">
          <h3>Pass tapılmadı</h3><p>{error}</p>
        </div>
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
      {/* Back */}
      <div className="xk-back-row xk-reveal">
        <Link to="/missions" className="xk-back"><ChevronIcon /> Geri</Link>
        <div className="xk-crumbs">
          <span>{mission?.title}</span>
          <span className="xk-crumb-sep">/</span>
          <span className="cur">Pass {pass?.order}</span>
        </div>
      </div>

      <div className="xk-lesson-view">
        {/* Progress bar + dots */}
        <div className="xk-lesson-head xk-reveal" style={{ animationDelay: "60ms" }}>
          <div className="xk-lesson-progress">
            <div className="xk-lp-track">
              <div className="xk-lp-fill" style={{ width: `${passes.length > 0 ? ((currentIndex + 1) / passes.length) * 100 : 0}%` }} />
            </div>
            <span className="xk-lp-label">Dərs {currentIndex + 1} / {passes.length}</span>
          </div>
          <div className="xk-lesson-dots">
            {passes.map((p, i) => (
              <Link
                key={p.id}
                to={`/missions/${slug}/passes/${p.id}`}
                className={`xk-ldot${i === currentIndex ? " cur" : ""}${i < currentIndex || p.is_completed ? " done" : ""}`}
                title={`Pass ${p.order}`}
              />
            ))}
          </div>
        </div>

        {/* Lesson stage */}
        <div className="xk-lesson-stage xk-reveal" style={{ animationDelay: "80ms" }}>
          <div className="xk-lesson-type-tag">
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-4 2zM4 19a2 2 0 012-2h13" />
            </svg>
            Nəzəriyyə · +{pass?.xp_reward || 10} XP
            {alreadyDone && " · ✓ Tamamlandı"}
          </div>

          <h1 className="xk-lesson-h1">{pass?.title}</h1>

          {/* Content */}
          <div
            className="rich-content"
            style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: pass?.content || "<p>Məzmun yükləmək mümkün olmadı.</p>" }}
          />

          {/* Success banner */}
          {justCompleted && (
            <div className="xk-explain ok" style={{ marginTop: 20 }}>
              <b>✓ Pass tamamlandı!</b>
              {result?.all_passes_done && mission?.exam && (
                <span style={{ color: "var(--text-2)", marginLeft: 8 }}>
                  🎉 Bütün pass-lar bitdi — Final Exam açıldı!
                </span>
              )}
              {result?.all_passes_done && !mission?.exam && (
                <span style={{ marginLeft: 8 }}>🎉 Mission tamamlandı!</span>
              )}
            </div>
          )}

          {error && !justCompleted && (
            <div className="xk-explain no" style={{ marginTop: 16 }}>
              {error}
            </div>
          )}

          {/* Footer nav */}
          <div className="xk-lesson-foot">
            <button className="xk-btn ghost" onClick={() => prevPass ? navigate(`/missions/${slug}/passes/${prevPass.id}`) : navigate(`/missions/${slug}`)}>
              Əvvəlki
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              {!alreadyDone && !justCompleted ? (
                <button className="xk-btn primary" onClick={handleComplete} disabled={completing}>
                  {completing ? "Saxlanır..." : "✓ Tamamlandı kimi işarələ"}
                </button>
              ) : (
                <span className="xk-badge" style={{ background: "rgba(25,195,125,.14)", color: "#19c37d", border: "1px solid rgba(25,195,125,.3)", padding: "8px 14px", borderRadius: 9 }}>
                  ✓ Tamamlandı
                </span>
              )}
              {(alreadyDone || justCompleted) && (
                isLast ? (
                  mission?.exam
                    ? <Link to={`/missions/${slug}/exam`} className="xk-btn primary">📋 Final Exam <ArrowIcon /></Link>
                    : <Link to={`/missions/${slug}`} className="xk-btn ghost">← Mission</Link>
                ) : (
                  <button className="xk-btn primary" onClick={handleNext}>
                    Növbəti dərs <ArrowIcon />
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
