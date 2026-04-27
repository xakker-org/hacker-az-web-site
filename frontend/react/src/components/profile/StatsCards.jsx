const CARD_CONFIG = [
  { key: "total_points_earned", label: "Total Points", icon: "★", tone: "accent" },
  { key: "total_questions_solved", label: "Solved Questions", icon: "◈", tone: "green" },
  { key: "correct_answers", label: "Correct Answers", icon: "✓", tone: "blue" },
  { key: "wrong_answers", label: "Wrong Answers", icon: "✕", tone: "amber" },
  { key: "accuracy_rate", label: "Accuracy Rate", icon: "%", tone: "violet", suffix: "%" },
  { key: "leaderboard_rank", label: "Current Rank", icon: "#", tone: "cyan", prefix: "#" },
  { key: "active_days", label: "Active Days", icon: "◍", tone: "green" },
  { key: "best_day_points", label: "Best Day", icon: "⇧", tone: "accent", suffix: " pts" },
];

function formatValue(value, { prefix = "", suffix = "" }) {
  const numeric = Number(value) || 0;
  return `${prefix}${numeric.toLocaleString()}${suffix}`;
}

export default function StatsCards({ stats }) {
  return (
    <section className="profile-stats-grid" aria-label="Profile statistics">
      {CARD_CONFIG.map((card) => (
        <article key={card.key} className={`profile-stat-card ${card.tone}`}>
          <span className="profile-stat-ico" aria-hidden="true">{card.icon}</span>
          <span className="profile-stat-value">{formatValue(stats?.[card.key], card)}</span>
          <span className="profile-stat-label">{card.label}</span>
        </article>
      ))}
    </section>
  );
}
