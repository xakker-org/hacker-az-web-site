import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import "../styles/missions.css";

const DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };
const DIFF_CLASS = { easy: "ms-badge-easy", medium: "ms-badge-medium", hard: "ms-badge-hard", expert: "ms-badge-expert" };

function passState(passId, completedIds, allPasses) {
  if (completedIds.includes(passId)) return "completed";
  // first incomplete pass is "active"
  const firstIncomplete = allPasses.find((p) => !completedIds.includes(p.id));
  if (firstIncomplete && firstIncomplete.id === passId) return "active";
  return "locked";
}

export default function MissionDetailPage() {
  const { slug }      = useParams();
  const navigate      = useNavigate();
  const [mission, setMission]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError]       = useState(null);

  const fetchMission = () => {
    setLoading(true);
    endpoints.missionDetail(slug)
      .then(({ data }) => setMission(data))
      .catch(() => setError("Mission not found."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMission(); }, [slug]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await endpoints.missionStart(slug);
      fetchMission();
    } catch {
      setError("Failed to start mission.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <AppShell title="Mission"><div className="ms-spinner" /></AppShell>;
  if (error)   return <AppShell title="Mission"><div className="ms-empty">{error}</div></AppShell>;

  const prog         = mission.user_progress;
  const completedIds = prog?.completed_pass_ids ?? [];
  const totalPasses  = mission.passes?.length ?? 0;
  const donePasses   = completedIds.length;
  const pct          = totalPasses > 0 ? Math.round((donePasses / totalPasses) * 100) : 0;
  const allPassesDone = donePasses >= totalPasses && totalPasses > 0;
  const examUnlocked  = allPassesDone && mission.exam;
  const isCompleted   = prog?.is_completed;

  const iconBg = mission.cover_color + "22";

  return (
    <AppShell title={mission.title}>
      <div className="ms-page">
        {/* Back link */}
        <div className="ms-pass-nav" style={{ marginBottom: 16 }}>
          <Link to="/missions" className="">← Back to Missions</Link>
        </div>

        <div className="ms-detail">
          {/* LEFT: passes */}
          <div>
            {/* Hero */}
            <div className="ms-detail-hero">
              <div className="ms-detail-hero-bar" style={{ background: mission.cover_color }} />
              <div className="ms-detail-hero-body">
                <div className="ms-detail-icon" style={{ background: iconBg }}>
                  {mission.icon}
                </div>
                <div className="ms-detail-info">
                  <div className="ms-detail-title">{mission.title}</div>
                  <div className="ms-detail-desc">{mission.description}</div>
                  <div className="ms-detail-meta">
                    <span className={`ms-badge ${DIFF_CLASS[mission.difficulty] || "ms-badge-info"}`}>
                      {DIFF_LABEL[mission.difficulty] || mission.difficulty}
                    </span>
                    <span className="ms-badge ms-badge-info">{totalPasses} passes</span>
                    {mission.estimated_hours > 0 && (
                      <span className="ms-badge ms-badge-info">~{mission.estimated_hours}h</span>
                    )}
                    <span className="ms-badge" style={{ background: "rgba(158,255,0,.1)", color: "var(--green)", border: "1px solid var(--green-ring)" }}>
                      +{mission.xp_reward} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pass list */}
            <div className="ms-pass-list-card">
              <div className="ms-pass-list-header">
                <span>Passes</span>
                {prog && (
                  <span style={{ fontSize: 13, color: "var(--t3)", fontWeight: 500 }}>
                    {donePasses}/{totalPasses} completed
                  </span>
                )}
              </div>

              {mission.passes?.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--t3)", fontSize: 14 }}>
                  No passes published yet.
                </div>
              ) : (
                mission.passes?.map((p, idx) => {
                  const state = prog
                    ? passState(p.id, completedIds, mission.passes)
                    : idx === 0 ? "active" : "locked";
                  const isLocked = state === "locked" && !prog;
                  const isDone   = state === "completed";
                  const isActive = state === "active";

                  const canClick = isDone || isActive || !mission.passes;

                  return (
                    <Link
                      key={p.id}
                      to={canClick ? `/missions/${slug}/passes/${p.id}` : "#"}
                      className={`ms-pass-item${isDone ? " completed" : ""}${isActive ? " active" : ""}${isLocked ? " locked" : ""}`}
                      onClick={isLocked ? (e) => e.preventDefault() : undefined}
                    >
                      <div className={`ms-pass-state${isDone ? " done" : isActive ? " active-state" : " locked-state"}`}>
                        {isDone ? "✓" : isLocked ? "🔒" : String(p.order).padStart(2, "0")}
                      </div>
                      <div className="ms-pass-item-info">
                        <div className="ms-pass-item-title">Pass {p.order}: {p.title}</div>
                        <div className="ms-pass-item-sub">
                          {isDone ? "Completed" : isActive ? "In progress" : "Locked"}
                        </div>
                      </div>
                      <div className="ms-pass-item-time">{p.estimated_minutes} min</div>
                    </Link>
                  );
                })
              )}

              {/* Final Exam row */}
              {mission.exam && (
                <Link
                  to={examUnlocked ? `/missions/${slug}/exam` : "#"}
                  className={`ms-exam-row${examUnlocked ? "" : " locked"}`}
                  onClick={examUnlocked ? undefined : (e) => e.preventDefault()}
                >
                  <div className="ms-exam-icon">📋</div>
                  <div className="ms-exam-info">
                    <div className="ms-exam-title">
                      {isCompleted && prog?.exam_passed ? "✓ " : ""}
                      {mission.exam.title}
                    </div>
                    <div className="ms-exam-sub">
                      {examUnlocked
                        ? isCompleted && prog?.exam_passed
                          ? "Passed — Mission Complete!"
                          : `Pass ${mission.exam.passing_score}% to complete`
                        : `Complete all passes to unlock`}
                    </div>
                  </div>
                  {!examUnlocked && (
                    <span className="ms-badge ms-badge-info">🔒 Locked</span>
                  )}
                  {examUnlocked && !isCompleted && (
                    <span className="ms-badge ms-badge-exam">Take Exam →</span>
                  )}
                  {isCompleted && prog?.exam_passed && (
                    <span className="ms-badge" style={{ background: "var(--green-dim)", color: "var(--green)", border: "1px solid var(--green-ring)" }}>
                      ✓ Passed
                    </span>
                  )}
                </Link>
              )}
            </div>

            {/* Start CTA if not started */}
            {!prog && (
              <div style={{ marginTop: 16 }}>
                <button
                  className="ms-btn ms-btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                  onClick={handleStart}
                  disabled={starting}
                >
                  {starting ? "Starting…" : "🚀 Start Mission"}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: sidebar */}
          <div>
            {/* Progress card */}
            {prog && (
              <div className="ms-sidebar-card">
                <h3>Your Progress</h3>
                <div style={{ marginBottom: 12 }}>
                  <div className="ms-progress-label" style={{ marginBottom: 6 }}>
                    <span>{donePasses}/{totalPasses} passes</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="ms-progress-track">
                    <div
                      className={`ms-progress-fill${isCompleted ? "" : " blue"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="ms-stat-row">
                  <span className="ms-stat-label">Status</span>
                  <span className="ms-stat-value" style={{ color: isCompleted ? "var(--green)" : "var(--blue)" }}>
                    {isCompleted ? "✓ Completed" : "In Progress"}
                  </span>
                </div>
                {mission.exam && (
                  <div className="ms-stat-row">
                    <span className="ms-stat-label">Final Exam</span>
                    <span className="ms-stat-value" style={{ color: prog?.exam_passed ? "var(--green)" : "var(--t3)" }}>
                      {prog?.exam_passed ? "✓ Passed" : allPassesDone ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mission info */}
            <div className="ms-sidebar-card">
              <h3>Mission Info</h3>
              <div className="ms-stat-row">
                <span className="ms-stat-label">Difficulty</span>
                <span className="ms-stat-value">{DIFF_LABEL[mission.difficulty]}</span>
              </div>
              <div className="ms-stat-row">
                <span className="ms-stat-label">Passes</span>
                <span className="ms-stat-value">{totalPasses}</span>
              </div>
              <div className="ms-stat-row">
                <span className="ms-stat-label">Duration</span>
                <span className="ms-stat-value">~{mission.estimated_hours}h</span>
              </div>
              <div className="ms-stat-row">
                <span className="ms-stat-label">XP Reward</span>
                <span className="ms-stat-value" style={{ color: "var(--green)" }}>+{mission.xp_reward}</span>
              </div>
              {mission.exam && (
                <>
                  <div className="ms-stat-row">
                    <span className="ms-stat-label">Exam Pass Score</span>
                    <span className="ms-stat-value">{mission.exam.passing_score}%</span>
                  </div>
                  <div className="ms-stat-row">
                    <span className="ms-stat-label">Max Attempts</span>
                    <span className="ms-stat-value">
                      {mission.exam.max_attempts === 0 ? "Unlimited" : mission.exam.max_attempts}
                    </span>
                  </div>
                  {mission.exam.time_limit_minutes > 0 && (
                    <div className="ms-stat-row">
                      <span className="ms-stat-label">Time Limit</span>
                      <span className="ms-stat-value">{mission.exam.time_limit_minutes} min</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
