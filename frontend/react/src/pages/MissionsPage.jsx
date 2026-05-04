import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { endpoints } from "../services/endpoints";
import "../styles/missions.css";

const DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard", expert: "Expert" };

const FILTERS = [
  { key: "all",         label: "All" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed",   label: "Completed" },
  { key: "not-started", label: "Not Started" },
];

function diffBadgeClass(d) {
  return `ms-badge ms-badge-${d}`;
}

function missionStatus(progress) {
  if (!progress) return "not-started";
  if (progress.is_completed) return "completed";
  return "in-progress";
}

function MissionCard({ mission }) {
  const prog = mission.user_progress;
  const status = missionStatus(prog);

  const totalPasses = prog?.total_passes ?? mission.pass_count;
  const donePasses  = prog?.completed_passes ?? 0;
  const pct = totalPasses > 0 ? Math.round((donePasses / totalPasses) * 100) : 0;

  const iconBg = mission.cover_color + "22";

  return (
    <Link
      to={`/missions/${mission.slug}`}
      className={`ms-card${status === "completed" ? " completed" : ""}`}
      style={{ "--accent-color": mission.cover_color, "--icon-bg": iconBg }}
    >
      <div className="ms-card-accent" style={{ background: mission.cover_color }} />
      <div className="ms-card-body">
        <div className="ms-card-header">
          <div className="ms-card-icon" style={{ background: iconBg }}>
            {mission.icon}
          </div>
          <div className="ms-card-title-group">
            <div className="ms-card-title">{mission.title}</div>
            <div className="ms-card-desc">
              {mission.short_description || mission.description}
            </div>
          </div>
        </div>

        <div className="ms-card-meta">
          <span className={diffBadgeClass(mission.difficulty)}>
            {DIFF_LABEL[mission.difficulty] || mission.difficulty}
          </span>
          <span className="ms-badge ms-badge-info">
            {mission.pass_count} passes
          </span>
          {mission.estimated_hours > 0 && (
            <span className="ms-badge ms-badge-info">
              ~{mission.estimated_hours}h
            </span>
          )}
          {mission.has_exam && (
            <span className="ms-badge ms-badge-exam">Final Exam</span>
          )}
        </div>

        {prog && (
          <div className="ms-card-progress">
            <div className="ms-progress-label">
              <span>{donePasses}/{totalPasses} passes</span>
              <span>{pct}%</span>
            </div>
            <div className="ms-progress-track">
              <div
                className={`ms-progress-fill${status === "in-progress" ? " blue" : ""}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        <div className="ms-card-footer">
          <span className="ms-xp-badge">+{mission.xp_reward} XP</span>
          <span className={`ms-status-badge ${status}`}>
            {status === "completed"   ? "✓ Completed"   :
             status === "in-progress" ? "→ In Progress"  : "Not Started"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    endpoints.missions()
      .then(({ data }) => setMissions(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = missions.filter((m) => {
    const st = missionStatus(m.user_progress);
    const matchFilter =
      filter === "all"          ||
      (filter === "completed"   && st === "completed") ||
      (filter === "in-progress" && st === "in-progress") ||
      (filter === "not-started" && st === "not-started");

    const matchSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <AppShell
      title="Missions"
      searchPlaceholder="Search missions…"
      onSearch={setSearch}
    >
      <div className="ms-page">
        <div className="ms-page-header">
          <div className="ms-page-title">Missions</div>
          <div className="ms-page-subtitle">
            Complete passes, conquer the final exam, earn XP.
          </div>
        </div>

        <div className="ms-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`ms-filter-btn${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ms-spinner" />
        ) : filtered.length === 0 ? (
          <div className="ms-empty">
            <div className="ms-empty-icon">🎯</div>
            {search
              ? "No missions match your search."
              : filter === "all"
              ? "No missions published yet."
              : `No ${filter.replace("-", " ")} missions.`}
          </div>
        ) : (
          <div className="ms-grid">
            {filtered.map((m) => (
              <MissionCard key={m.id} mission={m} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
