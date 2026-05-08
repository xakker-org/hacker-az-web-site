import { useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Heatmap.css";

const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function fmtDate(iso) {
  const d = new Date(iso);
  return `${DAY_NAMES[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
const GAP        = 3;   // px — gap between cells
const DOW_W      = 26;  // px — width of the day-of-week label column
const DOW_GAP    = 4;   // px — gap between DOW col and cells col

function defaultTone(v) {
  if (!v || v < 1)  return 0;
  if (v < 5)        return 1;
  if (v < 15)       return 2;
  if (v < 30)       return 3;
  return 4;
}

export default function Heatmap({
  days = [],
  weeks = 26,
  getTone = defaultTone,
  year = null,
}) {
  const [hover, setHover] = useState(null);
  const [pos, setPos]     = useState({ x: 0, y: 0 });
  const [cellPx, setCellPx] = useState(11);
  const wrapRef = useRef(null);

  /* ── Column count ── */
  const colCount = useMemo(() => {
    if (!year) return weeks;
    const s = new Date(year, 0, 1);
    s.setDate(s.getDate() - s.getDay());          // align to Sunday
    const e = new Date(year, 11, 31);
    e.setDate(e.getDate() + (6 - e.getDay()));    // align to Saturday
    return Math.round((e - s) / 86400000 / 7);
  }, [year, weeks]);

  /* ── Dynamic cell size: fills container width exactly ── */
  useLayoutEffect(() => {
    if (!wrapRef.current || !colCount) return;
    const calc = () => {
      const w = wrapRef.current.clientWidth;
      // w = DOW_W + DOW_GAP + colCount*cell + (colCount-1)*GAP
      const c = Math.floor((w - DOW_W - DOW_GAP - (colCount - 1) * GAP) / colCount);
      setCellPx(Math.max(10, Math.min(c, 22)));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [colCount]);

  /* ── Build grid ── */
  const grid = useMemo(() => {
    const map   = new Map(days.map(d => [d.date, d]));
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let start, end;

    if (year) {
      start = new Date(year, 0, 1);
      start.setDate(start.getDate() - start.getDay());
      end = new Date(year, 11, 31);
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else {
      const last      = days.length ? new Date(days[days.length - 1].date) : new Date();
      const daysToSat = (6 - last.getDay() + 7) % 7;
      end   = new Date(last);
      end.setDate(end.getDate() + daysToSat);
      start = new Date(end);
      start.setDate(start.getDate() - (weeks * 7 - 1));
    }

    const cells = [];
    for (let i = 0; i < colCount * 7; i++) {
      const d   = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const rec = map.get(iso);

      let tone;
      if (year) {
        if (d.getFullYear() !== year) tone = "x";
        else if (d > today)           tone = "f";
        else                          tone = getTone(rec?.value || 0);
      } else {
        tone = getTone(rec?.value || 0);
      }

      cells.push({ date: iso, d, rec, tone, future: year ? d > today : false });
    }

    const columns = Array.from({ length: colCount }, (_, c) =>
      cells.slice(c * 7, c * 7 + 7)
    );

    /* Only label months that belong to the selected year */
    const monthLabels = columns.map((col, ci) => {
      const top  = col[0]?.d;
      const prev = ci > 0 ? columns[ci - 1][0]?.d : null;
      if (!top) return null;
      if (year && top.getFullYear() !== year) return null;
      if (!prev || top.getMonth() !== prev.getMonth()) return MONTHS[top.getMonth()];
      return null;
    });

    return { columns, monthLabels };
  }, [days, weeks, getTone, year, colCount]);

  const handleMouseMove = (e) => setPos({ x: e.clientX, y: e.clientY });

  const handleEnter = (cell) => {
    if (cell.tone === "x" || cell.tone === "f") return;
    setHover(cell);
  };

  const activeDays = days.filter(d => Number(d.value) > 0).length;
  const totalXP    = days.reduce((s, d) => s + (Number(d.value) || 0), 0);

  /* Clamp tooltip to viewport */
  const TIP_W = 140;
  const tipLeft = Math.min(
    Math.max(pos.x - TIP_W / 2, 8),
    (typeof window !== "undefined" ? window.innerWidth : 1400) - TIP_W - 8
  );
  const tipTop = pos.y - 62 > 4 ? pos.y - 62 : pos.y + 14;

  return (
    <div
      ref={wrapRef}
      className="heat"
      style={{ "--cell": `${cellPx}px`, "--gap": `${GAP}px`, "--label-h": "14px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      <div className="heat-grid">
        {/* Day-of-week labels */}
        <div className="heat-dow" aria-hidden="true">
          {DOW_LABELS.map((d, i) => <span key={i}>{d}</span>)}
        </div>

        <div className="heat-cols">
          {/* Month labels */}
          <div className="heat-months" aria-hidden="true">
            {grid.monthLabels.map((m, i) => (
              <span key={i}>{m || ""}</span>
            ))}
          </div>

          {/* Cells */}
          <div className="heat-cells">
            {grid.columns.map((col, ci) => (
              <div className="heat-col" key={ci}>
                {col.map((cell, ri) => (
                  <button
                    key={ri}
                    type="button"
                    className={`heat-cell heat-tone-${cell.tone}`}
                    onMouseEnter={() => handleEnter(cell)}
                    aria-label={
                      cell.rec
                        ? `${cell.date}: ${cell.rec.value || 0} XP`
                        : cell.date
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="heat-foot">
        <span>
          {activeDays} aktiv gün
          {totalXP > 0 && ` · ${totalXP.toLocaleString()} XP`}
        </span>
        <span className="heat-legend" aria-hidden="true">
          <span>Az</span>
          {[0,1,2,3,4].map(t => <i key={t} className={`heat-cell heat-tone-${t}`} />)}
          <span>Çox</span>
        </span>
      </div>

      {hover && (
        <div
          className="heat-tooltip"
          style={{ left: tipLeft, top: tipTop, transform: "none" }}
          aria-hidden="true"
        >
          {hover.rec ? (
            <>
              <div className="heat-tooltip-val">
                {hover.rec.value || 0}
                <span className="heat-tooltip-unit"> XP</span>
              </div>
              <div className="heat-tooltip-date">{fmtDate(hover.date)}</div>
              {hover.rec.label && (
                <div className="heat-tooltip-label">{hover.rec.label}</div>
              )}
            </>
          ) : (
            <>
              <div className="heat-tooltip-empty">Fəaliyyət yoxdur</div>
              <div className="heat-tooltip-date">{fmtDate(hover.date)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
