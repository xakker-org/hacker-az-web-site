import { useMemo } from "react";

function clampPercent(value) {
  const n = Number(value) || 0;
  return Math.max(0, Math.min(100, n));
}

function findRecentScore(days, count) {
  const list = Array.isArray(days) ? days : [];
  const part = list.slice(-count);
  const solved = part.reduce((sum, d) => sum + (Number(d?.questions_solved) || 0), 0);
  const correct = part.reduce((sum, d) => sum + (Number(d?.correct_answers) || 0), 0);
  if (solved === 0) return 0;
  return (correct / solved) * 100;
}

function topicStats(activities) {
  const map = new Map();
  (activities || []).forEach((item) => {
    const key = item.course_name || (item.type === "course" ? "Course" : "Self Study");
    const current = map.get(key) || { attempts: 0, correct: 0 };
    current.attempts += 1;
    current.correct += item.is_correct ? 1 : 0;
    map.set(key, current);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      attempts: value.attempts,
      accuracy: value.attempts ? (value.correct / value.attempts) * 100 : 0,
    }))
    .filter((item) => item.attempts >= 2)
    .sort((a, b) => b.accuracy - a.accuracy);
}

export default function PerformanceSummary({ stats, days, activities }) {
  const summary = useMemo(() => {
    const week = clampPercent(findRecentScore(days, 7));
    const month = clampPercent(findRecentScore(days, 30));
    const topics = topicStats(activities);
    return {
      week,
      month,
      topTopic: topics[0] || null,
      weakTopic: topics[topics.length - 1] || null,
    };
  }, [days, activities]);

  return (
    <section className="profile-panel">
      <header className="profile-panel-header">
        <div>
          <h2 className="profile-panel-title">Performance Summary</h2>
          <p className="profile-panel-subtitle">Progress trends and strongest topics</p>
        </div>
      </header>

      <div className="perf-grid">
        <article className="perf-card">
          <div className="perf-card-label">Overall Accuracy</div>
          <div className="perf-bar-track"><div className="perf-bar-fill green" style={{ width: `${clampPercent(stats?.accuracy_rate)}%` }} /></div>
          <div className="perf-bar-value">{clampPercent(stats?.accuracy_rate).toFixed(1)}%</div>
        </article>

        <article className="perf-card">
          <div className="perf-card-label">Last 7 Days</div>
          <div className="perf-bar-track"><div className="perf-bar-fill blue" style={{ width: `${summary.week}%` }} /></div>
          <div className="perf-bar-value">{summary.week.toFixed(1)}%</div>
        </article>

        <article className="perf-card">
          <div className="perf-card-label">Last 30 Days</div>
          <div className="perf-bar-track"><div className="perf-bar-fill accent" style={{ width: `${summary.month}%` }} /></div>
          <div className="perf-bar-value">{summary.month.toFixed(1)}%</div>
        </article>

        <article className="perf-card">
          <div className="perf-card-label">Best Points Day</div>
          <div className="perf-bar-value">
            {stats?.best_day_date ? `${stats.best_day_date} (${stats.best_day_points || 0} pts)` : "No points yet"}
          </div>
        </article>

        <article className="perf-card">
          <div className="perf-card-label">Best Topic</div>
          <div className="perf-bar-value">
            {summary.topTopic ? `${summary.topTopic.name} (${summary.topTopic.accuracy.toFixed(0)}%)` : "Not enough data"}
          </div>
        </article>

        <article className="perf-card">
          <div className="perf-card-label">Most Mistakes</div>
          <div className="perf-bar-value">
            {summary.weakTopic ? `${summary.weakTopic.name} (${summary.weakTopic.accuracy.toFixed(0)}%)` : "Not enough data"}
          </div>
        </article>
      </div>
    </section>
  );
}
