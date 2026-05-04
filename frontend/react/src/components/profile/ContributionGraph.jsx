import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function toDateKeyLocal(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toGitHubGrid(days) {
  if (!days.length) return { grid: [], monthLabels: [] };

  // Create day map for quick lookup
  const dayMap = {};
  days.forEach((day) => {
    dayMap[day.date] = day;
  });

  // Find first and last dates
  const firstDate = new Date(days[0].date);
  const lastDate = new Date(days[days.length - 1].date);

  // Start from Sunday of the first week
  const startDate = new Date(firstDate);
  startDate.setDate(startDate.getDate() - firstDate.getDay());

  // Create 7 rows (one per day of week), each row is an array of weeks/cells
  const grid = Array(7).fill(null).map(() => []);
  const monthCells = [];

  let currentDate = new Date(startDate);
  let prevMonth = -1;

  while (currentDate <= lastDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = toDateKeyLocal(currentDate);
    const day = dayMap[dateStr] || null;

    // Only label when the month actually changes at week boundary.
    if (dayOfWeek === 0) {
      const monthIndex = currentDate.getMonth();
      if (monthIndex !== prevMonth) {
        monthCells.push({
          weekIndex: grid[0].length,
          month: MONTHS[monthIndex],
          dayOfMonth: currentDate.getDate(),
        });
        prevMonth = monthIndex;
      }
    }

    grid[dayOfWeek].push(day);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create month labels with GitHub-like spacing behavior.
  // 1) Hide tiny partial month at the beginning of the 365-day window.
  // 2) Avoid overlapping labels by enforcing a minimum week gap.
  const labelsByWeek = {};
  const minWeekGap = 4;
  let lastShownWeek = -Infinity;

  monthCells.forEach((mark, index) => {
    const isFirstLabel = index === 0;
    const isPartialStartMonth = isFirstLabel && firstDate.getDate() > 7;
    const isMonthTick = mark.dayOfMonth <= 7;
    const hasEnoughSpace = mark.weekIndex - lastShownWeek >= minWeekGap;

    if (!isPartialStartMonth && isMonthTick && hasEnoughSpace) {
      labelsByWeek[mark.weekIndex] = mark.month;
      lastShownWeek = mark.weekIndex;
    }
  });

  const monthLabels = Array.from({ length: grid[0].length }, (_, weekIndex) => labelsByWeek[weekIndex] || "");

  return { grid, monthLabels };
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ContributionGraph({ days, years = [], selectedYear, onYearChange }) {
  const [tooltip, setTooltip] = useState(null);

  const { grid, monthLabels, maxScore, totalContributions } = useMemo(() => {
    const list = Array.isArray(days) ? days : [];
    const max = list.reduce((peak, item) => Math.max(peak, activityScore(item)), 0);
    const total = list.reduce((sum, item) => sum + (Number(item?.questions_solved) || 0), 0);
    const { grid: g, monthLabels: m } = toGitHubGrid(list);
    return { grid: g, monthLabels: m, maxScore: max, totalContributions: total };
  }, [days]);

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => b - a),
    [years],
  );

  const showTooltip = (event, day) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    setTooltip({
      x: centerX,
      y: Math.max(rect.top - 8, 12),
      day,
    });
  };

  if (!days?.length) {
    return <div className="profile-empty">No activity yet. Start solving to fill your graph.</div>;
  }

  return (
    <section className="profile-panel">
      <header className="profile-panel-header">
        <div>
          <h2 className="profile-panel-title">{totalContributions.toLocaleString()} contributions in the last year</h2>
          <p className="profile-panel-subtitle">Learn how we count contributions</p>
        </div>
        {sortedYears.length > 0 && (
          <div className="contrib-header-right">
            <span className="contrib-settings">Contribution settings <span className="contrib-settings-caret">▼</span></span>
            <div className="contrib-year-rail">
              {sortedYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={`contrib-year-rail-item ${year === selectedYear ? "active" : ""}`}
                  onClick={() => onYearChange && onYearChange(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="contrib-graph-container">
        <div className="contrib-graph-wrapper-github">
          {/* Day of week labels on left */}
          <div className="contrib-day-labels">
            <div className="contrib-label-spacer" />
            {DAY_LABELS.map((dayLabel, idx) => (
              <div key={idx} className="contrib-day-label" style={{ visibility: idx % 2 === 1 ? "visible" : "hidden" }}>
                {idx % 2 === 1 ? dayLabel : ""}
              </div>
            ))}
          </div>

          {/* Main graph */}
          <div className="contrib-graph-main">
            {/* Month labels on top */}
            <div className="contrib-month-header">
              <div className="contrib-month-labels">
                {monthLabels.map((month, idx) => (
                  <span key={idx} className={`contrib-month-label ${month ? "active" : ""}`}>
                    {month}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid of cells */}
            <div className="contrib-grid-github">
              {grid.map((row, dayOfWeek) => (
                <div key={dayOfWeek} className="contrib-row">
                  {row.map((day, weekIdx) => {
                    if (!day) {
                      return <div key={`empty-${dayOfWeek}-${weekIdx}`} className="contrib-cell" data-level="0" />;
                    }
                    const score = activityScore(day);
                    const level = getLevel(score, maxScore);
                    return (
                      <button
                        key={day.date}
                        type="button"
                        className="contrib-cell"
                        data-level={level}
                        onMouseEnter={(event) => showTooltip(event, day)}
                        onMouseLeave={() => setTooltip(null)}
                        aria-label={`${formatDate(day.date)}: ${day.questions_solved} solved, ${day.points_earned} points`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="contrib-legend" aria-hidden="true">
        <span className="contrib-legend-label">Less</span>
        {[0, 1, 2, 3, 4, 5].map((lvl) => (
          <span key={lvl} className="contrib-legend-box" data-level={lvl} style={{ background: `var(--graph-${lvl})` }} />
        ))}
        <span className="contrib-legend-label">More</span>
      </div>

      {tooltip && createPortal(
        <div
          className="contrib-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="contrib-tooltip-date">{formatDate(tooltip.day.date)}</div>
          <div className="contrib-tooltip-row"><span>Solved</span><strong>{tooltip.day.questions_solved}</strong></div>
          <div className="contrib-tooltip-row"><span>Points</span><strong>{tooltip.day.points_earned}</strong></div>
          <div className="contrib-tooltip-row"><span>Correct</span><strong>{tooltip.day.correct_answers}</strong></div>
        </div>,
        document.body
      )}
    </section>
  );
}
