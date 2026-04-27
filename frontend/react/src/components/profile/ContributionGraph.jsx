import { useMemo, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function activityScore(day) {
  const solved = Number(day?.questions_solved) || 0;
  const correct = Number(day?.correct_answers) || 0;
  const points = Number(day?.points_earned) || 0;
  return solved + correct * 1.5 + Math.min(points / 8, 8);
}

function getLevel(score, maxScore) {
  if (score <= 0 || maxScore <= 0) return 0;
  const ratio = score / maxScore;
  if (ratio < 0.2) return 1;
  if (ratio < 0.4) return 2;
  if (ratio < 0.6) return 3;
  if (ratio < 0.8) return 4;
  return 5;
}

function toWeeks(days) {
  if (!days.length) return [];

  const first = new Date(days[0].date);
  const startPadding = first.getDay();
  const padded = [...Array(startPadding).fill(null), ...days];
  const weeks = [];

  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  return weeks;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ContributionGraph({ days }) {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, maxScore, totalActiveDays } = useMemo(() => {
    const list = Array.isArray(days) ? days : [];
    const max = list.reduce((peak, item) => Math.max(peak, activityScore(item)), 0);
    const active = list.filter((item) => (Number(item?.questions_solved) || 0) > 0).length;
    return { weeks: toWeeks(list), maxScore: max, totalActiveDays: active };
  }, [days]);

  const monthLabels = useMemo(
    () =>
      weeks.map((week) => {
        const firstRealDay = week.find(Boolean);
        if (!firstRealDay) return "";
        const month = MONTHS[new Date(firstRealDay.date).getMonth()];
        return month;
      }),
    [weeks],
  );

  if (!days?.length) {
    return <div className="profile-empty">No activity yet. Start solving to fill your graph.</div>;
  }

  return (
    <section className="profile-panel">
      <header className="profile-panel-header">
        <div>
          <h2 className="profile-panel-title">Activity Graph</h2>
          <p className="profile-panel-subtitle">{totalActiveDays} active days in the last year</p>
        </div>
      </header>

      <div className="contrib-graph-wrapper">
        <div className="contrib-month-row" aria-hidden="true">
          {monthLabels.map((label, index) => (
            <span key={`${label}-${index}`} className="contrib-month-label">{index === 0 || label !== monthLabels[index - 1] ? label : ""}</span>
          ))}
        </div>

        <div className="contrib-graph" role="grid" aria-label="Contribution graph">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="contrib-week" role="row">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <div key={`empty-${weekIndex}-${dayIndex}`} className="contrib-cell" data-level="0" />;
                }
                const score = activityScore(day);
                const level = getLevel(score, maxScore);
                return (
                  <button
                    key={day.date}
                    type="button"
                    className="contrib-cell"
                    data-level={level}
                    onMouseEnter={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        day,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    aria-label={`${formatDate(day.date)}: ${day.questions_solved} solved, ${day.points_earned} points`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="contrib-legend" aria-hidden="true">
        <span className="contrib-legend-label">Less</span>
        {[0, 1, 2, 3, 4, 5].map((lvl) => (
          <span key={lvl} className="contrib-legend-box" data-level={lvl} style={{ background: `var(--graph-${lvl})` }} />
        ))}
        <span className="contrib-legend-label">More</span>
      </div>

      {tooltip && (
        <div className="contrib-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="contrib-tooltip-date">{formatDate(tooltip.day.date)}</div>
          <div className="contrib-tooltip-row"><span>Solved</span><strong>{tooltip.day.questions_solved}</strong></div>
          <div className="contrib-tooltip-row"><span>Points</span><strong>{tooltip.day.points_earned}</strong></div>
          <div className="contrib-tooltip-row"><span>Correct</span><strong>{tooltip.day.correct_answers}</strong></div>
        </div>
      )}
    </section>
  );
}
