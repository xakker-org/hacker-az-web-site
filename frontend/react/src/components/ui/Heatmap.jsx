import { useLayoutEffect, useMemo, useRef, useState } from "react";
import "./Heatmap.css";

const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const DOW_W  = 28;   // day-of-week label column width (px)
const DOW_G  = 4;    // gap between dow col and weeks (px)
const GAP    = 3;    // gap between cells (px)
const MIN_C  = 10;   // minimum cell size (px)
const MAX_C  = 16;   // maximum cell size (px)

function localISO(d) {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function fmtDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_FULL[date.getDay()]}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

function defaultTone(v) {
  if (!v || v < 1)  return 0;
  if (v < 5)        return 1;
  if (v < 15)       return 2;
  if (v < 30)       return 3;
  return 4;
}

export default function Heatmap({
  days = [],
  year = new Date().getFullYear(),
  years = [],
  onYearChange = null,
  getTone = defaultTone,
}) {
  const [hover,  setHover ] = useState(null);
  const [tip,    setTip   ] = useState({ x: 0, y: 0 });
  const [cellPx, setCellPx] = useState(MIN_C);
  const containerRef        = useRef(null);

  const map = useMemo(() => new Map(days.map(d => [d.date, d])), [days]);

  const { columns, monthLabels } = useMemo(() => {
    const y = year || new Date().getFullYear();

    const start = new Date(y, 0, 1);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(y, 11, 31);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const colCount = Math.round((end - start) / 86400000 / 7) + 1;
    const cols     = [];
    const mLabels  = [];

    for (let c = 0; c < colCount; c++) {
      const col = [];
      for (let r = 0; r < 7; r++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + c * 7 + r);
        const iso    = localISO(d);
        const rec    = map.get(iso);
        const inYear = d.getFullYear() === y;
        const future = d > today;

        col.push({
          date: iso, d, rec,
          tone: !inYear ? "x" : future ? "f" : getTone(rec?.value || 0),
          inYear,
        });
      }
      cols.push(col);

      const first  = col.find(cell => cell.inYear);
      const pfirst = c > 0 ? cols[c - 1].find(cell => cell.inYear) : null;
      mLabels.push(
        first && (!pfirst || first.d.getMonth() !== pfirst.d.getMonth())
          ? MONTHS[first.d.getMonth()]
          : ""
      );
    }

    return { columns: cols, monthLabels: mLabels };
  }, [days, year, map, getTone]);

  /* ── Fit cells to container width ── */
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || !columns.length) return;

    const calc = () => {
      const w = el.clientWidth;
      // w = DOW_W + DOW_G + colCount*cell + (colCount-1)*GAP
      const n = columns.length;
      const c = Math.floor((w - DOW_W - DOW_G - (n - 1) * GAP) / n);
      setCellPx(Math.max(MIN_C, Math.min(c, MAX_C)));
    };

    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns.length]);

  const totalXP    = days.reduce((s, d) => s + (Number(d.value) || 0), 0);
  const activeDays = days.filter(d => Number(d.value) > 0).length;

  const TIP_W = 180;
  const tipX  = Math.min(
    Math.max(tip.x - TIP_W / 2, 8),
    (typeof window !== "undefined" ? window.innerWidth : 1400) - TIP_W - 8
  );
  const tipY = tip.y - 72 > 4 ? tip.y - 72 : tip.y + 18;

  // derived sizes
  const stride   = cellPx + GAP;   // cell + gap rhythm
  const dowPadPx = 17 + 4;         // month-label height + gh-right gap

  return (
    <div
      ref={containerRef}
      className="gh"
      style={{ "--gh-cell": `${cellPx}px`, "--gh-stride": `${stride}px` }}
      onMouseMove={e => setTip({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setHover(null)}
    >
      {/* ── Header ── */}
      <div className="gh-head">
        <span className="gh-count">
          {activeDays} aktiv gün &nbsp;·&nbsp; {totalXP.toLocaleString()} XP
          {year && <span className="gh-count-year"> {year}</span>}
        </span>

        {years.length > 1 && onYearChange && (
          <div className="gh-years">
            {[...years].reverse().map(y => (
              <button
                key={y}
                type="button"
                className={`gh-ybtn${y === year ? " gh-ybtn--on" : ""}`}
                onClick={() => onYearChange(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Graph ── */}
      <div className="gh-scroll">
        <div className="gh-inner">

          {/* Day-of-week labels */}
          <div
            className="gh-dow"
            style={{
              gridTemplateRows: `repeat(7, ${stride}px)`,
              paddingTop: dowPadPx,
            }}
          >
            <span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span />
          </div>

          {/* Months + weeks */}
          <div className="gh-right">
            <div className="gh-months">
              {monthLabels.map((m, i) => (
                <span key={i} className="gh-mlabel" style={{ width: stride }}>{m}</span>
              ))}
            </div>

            <div className="gh-weeks">
              {columns.map((col, ci) => (
                <div key={ci} className="gh-week">
                  {col.map((cell, ri) => (
                    <div
                      key={ri}
                      className={`gh-cell gh-t${cell.tone}`}
                      onMouseEnter={() => cell.tone !== "x" && cell.tone !== "f" && setHover(cell)}
                      onMouseLeave={() => setHover(null)}
                      role="gridcell"
                      aria-label={cell.rec ? `${cell.date}: ${cell.rec.value || 0} XP` : cell.date}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="gh-foot">
        <div className="gh-legend">
          <span>Az</span>
          {[0, 1, 2, 3, 4].map(t => (
            <div key={t} className={`gh-cell gh-t${t}`} style={{ pointerEvents: "none" }} />
          ))}
          <span>Çox</span>
        </div>
      </div>

      {/* ── Tooltip ── */}
      {hover && (
        <div className="gh-tip" style={{ left: tipX, top: tipY }} aria-hidden>
          {hover.rec?.value ? (
            <span className="gh-tip-val"><strong>{hover.rec.value} XP</strong> qazanıldı</span>
          ) : (
            <span className="gh-tip-empty">Fəaliyyət yoxdur</span>
          )}
          <span className="gh-tip-date">{fmtDate(hover.date)}</span>
        </div>
      )}
    </div>
  );
}
