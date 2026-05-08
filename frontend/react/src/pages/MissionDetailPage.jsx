import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import Tile, { TileHead } from "../components/ui/Tile";
import Bar from "../components/ui/Bar";
import ProgressRing from "../components/ui/ProgressRing";
import Button from "../components/ui/Button";
import { Chip, DiffBadge } from "../components/ui/Chip";
import { TileSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Stat from "../components/ui/Stat";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";

const T = {
  az: {
    backToMissions: "← Missions",
    startMission: "🚀 Missiyaya başla",
    starting: "Başlanır...",
    notFound: "Mission tapılmadı",
    notFoundDesc: "Bu mission mövcud deyil.",
    backBtn: "← Geri",
    passes: "Pass-lar",
    passesOf: "tamamlandı",
    completed: "Tamamlandı",
    inProgress: "Davam edir",
    locked: "Kilidli",
    min: "dəq",
    yourProgress: "İrəliləyişiniz",
    status: "Status",
    finalExam: "Final Exam",
    passed: "Keçildi",
    passScore: "Keç faizi",
    maxAttempts: "Max cəhd",
    unlimited: "Limitsiz",
    timeLimit: "Vaxt limiti",
    missionInfo: "Mission Məlumatı",
    difficulty: "Çətinlik",
    duration: "Müddət",
    xpReward: "XP mükafat",
    examPassed: "✓ Keçildi",
    unlocked: "Açıldı",
    completeToUnlock: "Açmaq üçün bütün pass-ları tamamla",
    takeExam: "Exam ver →",
    missionComplete: "Keçildi — Mission Tamamlandı!",
    noPassesYet: "Hələ heç bir pass yayımlanmayıb.",
    passLabel: "Pass",
  },
  en: {
    backToMissions: "← Missions",
    startMission: "🚀 Start Mission",
    starting: "Starting...",
    notFound: "Mission not found",
    notFoundDesc: "This mission does not exist.",
    backBtn: "← Back",
    passes: "Passes",
    passesOf: "completed",
    completed: "Completed",
    inProgress: "In Progress",
    locked: "Locked",
    min: "min",
    yourProgress: "Your Progress",
    status: "Status",
    finalExam: "Final Exam",
    passed: "Passed",
    passScore: "Pass score",
    maxAttempts: "Max attempts",
    unlimited: "Unlimited",
    timeLimit: "Time limit",
    missionInfo: "Mission Info",
    difficulty: "Difficulty",
    duration: "Duration",
    xpReward: "XP Reward",
    examPassed: "✓ Passed",
    unlocked: "Unlocked",
    completeToUnlock: "Complete all passes to unlock",
    takeExam: "Take Exam →",
    missionComplete: "Passed — Mission Complete!",
    noPassesYet: "No passes published yet.",
    passLabel: "Pass",
  },
};

function passState(passId, completedIds, allPasses) {
  if (completedIds.includes(passId)) return "completed";
  const firstIncomplete = allPasses.find(p => !completedIds.includes(p.id));
  if (firstIncomplete && firstIncomplete.id === passId) return "active";
  return "locked";
}

export default function MissionDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = T[lang] || T.az;

  const [mission, setMission]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError]       = useState(null);

  const fetchMission = () => {
    setLoading(true);
    endpoints.missionDetail(slug)
      .then(({ data }) => setMission(data))
      .catch(() => setError(t.notFound))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMission(); }, [slug]);

  const handleStart = async () => {
    setStarting(true);
    try {
      await endpoints.missionStart(slug);
      fetchMission();
    } catch {
      setError(lang === "az" ? "Mission başladıla bilmədi." : "Failed to start mission.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="bento">
          <div className="span-12"><TileSkeleton height={120} /></div>
          <div className="span-8"><TileSkeleton height={380} /></div>
          <div className="span-4"><TileSkeleton height={280} /></div>
        </div>
      </AppShell>
    );
  }

  if (error || !mission) {
    return (
      <AppShell>
        <Tile>
          <EmptyState icon="◎" title={t.notFound} description={t.notFoundDesc}
            action={<Button as={Link} to="/missions" variant="accent">{t.backToMissions}</Button>} />
        </Tile>
      </AppShell>
    );
  }

  const prog          = mission.user_progress;
  const completedIds  = prog?.completed_pass_ids ?? [];
  const totalPasses   = mission.passes?.length ?? 0;
  const donePasses    = completedIds.length;
  const pct           = totalPasses > 0 ? Math.round((donePasses / totalPasses) * 100) : 0;
  const allPassesDone = donePasses >= totalPasses && totalPasses > 0;
  const examUnlocked  = allPassesDone && mission.exam;
  const isCompleted   = prog?.is_completed;

  const DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };

  return (
    <AppShell>
      {/* ── Header ── */}
      <div className="page-head">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: mission.cover_color ? `${mission.cover_color}18` : "var(--bg-elev)",
            border: "1px solid var(--line-2)",
            display: "grid", placeItems: "center", fontSize: 26,
          }}>
            {mission.icon || "◎"}
          </span>
          <div>
            <div className="page-eyebrow">Missions</div>
            <h1 className="page-title">{mission.title}</h1>
            {mission.description && <div className="page-sub">{mission.description}</div>}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              <DiffBadge level={mission.difficulty} />
              <Chip size="sm">{totalPasses} passes</Chip>
              {mission.estimated_hours > 0 && <Chip size="sm">~{mission.estimated_hours}h</Chip>}
              <Chip size="sm" tone="accent">★ {(mission.xp_reward || 0).toLocaleString()} XP</Chip>
              {isCompleted && <Chip size="sm" tone="mint">✓ {t.completed}</Chip>}
            </div>
          </div>
        </div>
        <Button variant="ghost" as={Link} to="/missions" size="sm">{t.backBtn}</Button>
      </div>

      {/* ── 2-col layout ── */}
      <div className="bento" style={{ alignItems: "start" }}>

        {/* LEFT: Pass list */}
        <div className="span-8" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Progress bar */}
          {prog && (
            <Tile>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <ProgressRing value={pct} size={60} strokeWidth={6} tone={isCompleted ? "mint" : "accent"} label={`${pct}%`} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
                    <span>{donePasses}/{totalPasses} {t.passesOf}</span>
                    <span style={{ color: isCompleted ? "var(--ok)" : "var(--accent)", fontWeight: 700 }}>
                      {isCompleted ? t.completed : t.inProgress}
                    </span>
                  </div>
                  <Bar value={pct} tone={isCompleted ? "mint" : "accent"} />
                </div>
              </div>
            </Tile>
          )}

          {/* Pass list */}
          <Tile>
            <TileHead
              eyebrow={t.passes}
              title={`${totalPasses} ${t.passes}`}
              action={prog && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>
                  {donePasses}/{totalPasses}
                </span>
              )}
            />

            {(!mission.passes || mission.passes.length === 0) ? (
              <EmptyState icon="◌" title={t.noPassesYet} description="" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {mission.passes.map((p, idx) => {
                  const state    = prog ? passState(p.id, completedIds, mission.passes) : idx === 0 ? "active" : "locked";
                  const isDone   = state === "completed";
                  const isActive = state === "active";
                  const isLocked = state === "locked" && !!prog;
                  const canClick = isDone || isActive || !prog;

                  return (
                    <Link
                      key={p.id}
                      to={canClick ? `/missions/${slug}/passes/${p.id}` : "#"}
                      onClick={!canClick ? (e) => e.preventDefault() : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "11px 14px", borderRadius: 12,
                        background: isActive ? "var(--accent-soft)" : "var(--bg-card-2)",
                        border: `1px solid ${isActive ? "var(--accent-ring)" : isDone ? "rgba(110,255,214,0.25)" : "var(--line)"}`,
                        textDecoration: "none", color: "inherit",
                        opacity: isLocked ? 0.5 : 1,
                        pointerEvents: isLocked ? "none" : "auto",
                        transition: "border-color var(--dur-1), background var(--dur-1)",
                      }}
                    >
                      <span style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                        display: "grid", placeItems: "center",
                        fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
                        background: isDone ? "rgba(110,255,214,0.12)" : isActive ? "rgba(255,36,66,0.12)" : "var(--bg-elev)",
                        color: isDone ? "var(--ok)" : isActive ? "var(--accent)" : "var(--ink-4)",
                        border: `1px solid ${isDone ? "rgba(110,255,214,0.28)" : isActive ? "var(--accent-ring)" : "var(--line)"}`,
                      }}>
                        {isDone ? "✓" : isLocked ? "🔒" : String(p.order).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 600,
                          color: isActive ? "var(--accent)" : isDone ? "var(--ink-3)" : "var(--ink-1)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {t.passLabel} {p.order}: {p.title}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                          {isDone ? t.completed : isActive ? t.inProgress : t.locked}
                        </div>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", flexShrink: 0 }}>
                        {p.estimated_minutes} {t.min}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Final Exam row */}
            {mission.exam && (
              <Link
                to={examUnlocked ? `/missions/${slug}/exam` : "#"}
                onClick={!examUnlocked ? (e) => e.preventDefault() : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 14px", borderRadius: 12, marginTop: 8,
                  background: examUnlocked ? "var(--accent-soft)" : "var(--bg-card-2)",
                  border: `1px solid ${examUnlocked ? "var(--accent-ring)" : isCompleted && prog?.exam_passed ? "rgba(110,255,214,0.25)" : "var(--line)"}`,
                  textDecoration: "none", color: "inherit",
                  opacity: !examUnlocked ? 0.6 : 1,
                  transition: "border-color var(--dur-1)",
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  display: "grid", placeItems: "center", fontSize: 14,
                  background: isCompleted && prog?.exam_passed ? "rgba(110,255,214,0.12)" : "var(--accent-soft)",
                  border: `1px solid ${isCompleted && prog?.exam_passed ? "rgba(110,255,214,0.28)" : "var(--accent-ring)"}`,
                }}>
                  📋
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: examUnlocked ? "var(--accent)" : "var(--ink-2)" }}>
                    {isCompleted && prog?.exam_passed ? "✓ " : ""}{mission.exam.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-4)", fontFamily: "var(--font-mono)", marginTop: 1 }}>
                    {examUnlocked
                      ? isCompleted && prog?.exam_passed
                        ? t.missionComplete
                        : `${t.passScore}: ${mission.exam.passing_score}%`
                      : t.completeToUnlock}
                  </div>
                </div>
                {examUnlocked && !isCompleted && (
                  <Chip size="sm" tone="accent">{t.takeExam}</Chip>
                )}
                {isCompleted && prog?.exam_passed && (
                  <Chip size="sm" tone="mint">{t.examPassed}</Chip>
                )}
                {!examUnlocked && (
                  <Chip size="sm">🔒 {t.locked}</Chip>
                )}
              </Link>
            )}

            {/* Start CTA */}
            {!prog && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <Button
                  variant="accent"
                  onClick={handleStart}
                  disabled={starting}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {starting ? t.starting : t.startMission}
                </Button>
              </div>
            )}
          </Tile>
        </div>

        {/* RIGHT: Sidebar */}
        <div className="span-4" style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Progress card */}
          {prog && (
            <Tile style={{ background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,36,66,0.05) 100%)" }}>
              <TileHead eyebrow={t.yourProgress} title={`${donePasses}/${totalPasses}`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Bar value={pct} tone={isCompleted ? "mint" : "accent"} rightCaption={`${pct}%`} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{t.status}</span>
                  <span style={{ color: isCompleted ? "var(--ok)" : "var(--accent)", fontWeight: 600 }}>
                    {isCompleted ? t.completed : t.inProgress}
                  </span>
                </div>
                {mission.exam && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{t.finalExam}</span>
                    <span style={{ color: prog?.exam_passed ? "var(--ok)" : "var(--ink-3)", fontWeight: 600 }}>
                      {prog?.exam_passed ? t.examPassed : allPassesDone ? t.unlocked : t.locked}
                    </span>
                  </div>
                )}
              </div>
            </Tile>
          )}

          {/* Mission info */}
          <Tile>
            <TileHead eyebrow="Info" title={t.missionInfo} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: t.difficulty, value: <DiffBadge level={mission.difficulty} /> },
                { label: t.passes,     value: <span className="mono" style={{ fontWeight: 700, color: "var(--ink-1)" }}>{totalPasses}</span> },
                { label: t.duration,   value: <span className="mono" style={{ color: "var(--ink-2)" }}>~{mission.estimated_hours}h</span> },
                { label: t.xpReward,   value: <span className="mono tnum" style={{ color: "var(--accent)", fontWeight: 700 }}>+{mission.xp_reward} XP</span> },
                ...(mission.exam ? [
                  { label: t.passScore,   value: <span className="mono" style={{ color: "var(--ink-2)" }}>{mission.exam.passing_score}%</span> },
                  { label: t.maxAttempts, value: <span className="mono" style={{ color: "var(--ink-2)" }}>{mission.exam.max_attempts === 0 ? t.unlimited : mission.exam.max_attempts}</span> },
                  ...(mission.exam.time_limit_minutes > 0 ? [
                    { label: t.timeLimit, value: <span className="mono" style={{ color: "var(--ink-2)" }}>{mission.exam.time_limit_minutes} {t.min}</span> }
                  ] : []),
                ] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>{label}</span>
                  {value}
                </div>
              ))}
            </div>
          </Tile>
        </div>
      </div>
    </AppShell>
  );
}
