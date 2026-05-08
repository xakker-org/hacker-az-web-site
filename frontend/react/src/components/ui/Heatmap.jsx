import { useMemo, useState } from "react";
import "./Heatmap.css";

/**
 * GitHub-style activity heatmap.
 * Props:
 *   days    — [{ date: "YYYY-MM-DD", value: number, label?: string }]
 *   weeks   — number of weeks to show (default 26 = ~6 months for compact, 53 for full)
 *   getTone — (v) => 0..4 level
 */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW = ["", "Mon", "", "Wed", "", "Fri", ""];

function defaultTone(v) {
  if (!v) return 0;
  if (v < 1) return 0;
  if (v < 3) return 1;
  if (v < 6) return 2;
  if (v < 12) return 3;
  return 4;
}

export default function Heatmap({ days = [], weeks = 26, getTone = defaultTone, compact = false }) {
  const [hover, setHover] = useState(null);

  const grid = useMemo(() => {
    // Build map of date -> day record
    const map = new Map(days.map(d => [d.date, d]));
    // Anchor on last date or today
    const last = days.length ? new Date(days[days.length - 1].date) : new Date();
    // Walk backwards weeks*7 days from last (Sat as last col)
    const cols = weeks;
    const totalDays = cols * 7;
    // Find Saturday >= last
    const endDow = last.getDay(); // 0=Sun ... 6=Sat
    const daysToEnd = (6 - endDow + 7) % 7;
    const end = new Date(last);
    end.setDate(end.getDate() + daysToEnd);
    const start = new Date(end);
    start.setDate(start.getDate() - (totalDays - 1));

    const cells = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const rec = map.get(iso);
      cells.push({
        date: iso,
        d,
        rec,
        tone: getTone(rec?.value || 0),
      });
    }
    // organize by column (week) — col-major
    const columns = [];
    for (let c = 0; c < cols; c++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        col.push(cells[c * 7 + r]);
      }
      columns.push(col);
    }
    // detect month label positions (first occurrence per month at row 0)
    const monthLabels = columns.map((col, ci) => {
      const top = col[0]?.d;
      if (!top) return null;
      const prev = ci > 0 ? columns[ci - 1][0]?.d : null;
      if (!prev || top.getMonth() !== prev.getMonth()) {
        return MONTHS[top.getMonth()];
      }
      return null;
    });

    return { columns, monthLabels };
  }, [days, weeks, getTone]);

  return (
    <div className={`heat ${compact ? "heat-compact" : ""}`}>
      <div className="heat-grid">
        <div className="heat-dow" aria-hidden="true">
          {DOW.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="heat-cols">
          <div className="heat-months" aria-hidden="true">
            {grid.monthLabels.map((m, i) => <span key={i}>{m || ""}</span>)}
          </div>
          <div className="heat-cells">
            {grid.columns.map((col, ci) => (
              <div className="heat-col" key={ci}>
                {col.map((cell, ri) => (
                  <button
                    key={ri}
                    type="button"
                    className={`heat-cell heat-tone-${cell.tone}`}
                    title={cell.rec ? `${cell.date} · ${cell.rec.value || 0}` : cell.date}
                    onMouseEnter={() => setHover(cell)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(cell)}
                    onBlur={() => setHover(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="heat-foot">
        <span className="heat-tip">
          {hover
            ? `${hover.date}${hover.rec?.label ? " · " + hover.rec.label : ""}${hover.rec?.value ? " · " + hover.rec.value : ""}`
            : days.length
              ? `${days.reduce((s, d) => s + (d.value || 0), 0)} active days`
              : "No activity yet"}
        </span>
        <span className="heat-legend" aria-hidden="true">
          <span>Less</span>
          <i className="heat-cell heat-tone-0" />
          <i className="heat-cell heat-tone-1" />
          <i className="heat-cell heat-tone-2" />
          <i className="heat-cell heat-tone-3" />
          <i className="heat-cell heat-tone-4" />
          <span>More</span>
        </span>
      </div>
    </div>
  );
}
