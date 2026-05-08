import { useMemo, useState } from "react";

const DOW_SHORT = ["M","T","W","T","F","S","S"];
const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_S   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const BAR_MAX_H = 88;

function barColor(v) {
  if (!v || v < 1) return "rgba(255,255,255,0.07)";
  if (v < 5)       return "#0e4429";
  if (v < 15)      return "#006d32";
  if (v < 30)      return "#26a641";
  return "#39d353";
}
function barGlow(v) {
  if (v >= 30) return "0 2px 8px rgba(57,211,83,0.55)";
  if (v >= 15) return "0 1px 5px rgba(38,166,65,0.40)";
  return "none";
}

function fmt(iso) {
  const d = new Date(iso);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_S[d.getMonth()]} ${d.getDate()}`;
}

export default function ActivityBars({ days = [], weeks = 5 }) {
  const [hover, setHover] = useState(null);
  const [pos, setPos]     = useState({ x: 0, y: 0 });

  const weekGroups = useMemo(() => {
    const map  = new Map((days || []).map(d => [d.date, d]));
    const n    = weeks * 7;
    const bars = [];
    for (let i = n - 1; i >= 0; i--) {
      const d   = new Date();
      d.setDate(new Date().getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const rec = map.get(iso);
      bars.push({
        date: iso,
        value: rec ? Number(rec.value) || 0 : 0,
        isToday: i === 0,
        dow: (d.getDay() + 6) % 7,   // 0=Mon … 6=Sun
        jsDay: d.getDay(),
      });
    }

    // group into calendar weeks
    const groups = [];
    for (let w = 0; w < weeks; w++) {
      groups.push(bars.slice(w * 7, w * 7 + 7));
    }
    return groups;
  }, [days, weeks]);

  const flat    = weekGroups.flat();
  const maxVal  = Math.max(...flat.map(b => b.value), 1);
  const totalXP = flat.reduce((s, b) => s + b.value, 0);
  const active  = flat.filter(b => b.value > 0).length;
  const best    = flat.reduce((m, b) => b.value > m.value ? b : m, flat[0] || { value: 0 });

  const handleEnter = (bar) => setHover(bar);

  /* Clamp tooltip */
  const TIP_W = 160;
  const tipLeft = typeof window !== "undefined"
    ? Math.min(Math.max(pos.x - TIP_W / 2, 8), window.innerWidth - TIP_W - 8)
    : pos.x;
  const tipTop = pos.y - 70 > 4 ? pos.y - 70 : pos.y + 16;

  return (
    <div
      style={{ position: "relative", width: "100%" }}
      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setHover(null)}
    >
      {/* ── Bar chart ── */}
      <div style={{ display: "flex", gap: 6, width: "100%", alignItems: "flex-end" }}>
        {weekGroups.map((week, wi) => {
          const weekXP   = week.reduce((s, b) => s + b.value, 0);
          const weekDate = week[0]?.date ? `${MONTH_S[new Date(week[0].date).getMonth()]} ${new Date(week[0].date).getDate()}` : "";
          return (
            <div key={wi} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              {/* week XP label */}
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                color: weekXP > 0 ? "rgba(57,211,83,0.6)" : "rgba(255,255,255,0.12)",
                letterSpacing: "0.04em",
                textAlign: "center",
                height: 10,
              }}>
                {weekXP > 0 ? `${weekXP}` : ""}
              </div>

              {/* bars */}
              <div style={{
                display: "flex",
                gap: 2,
                alignItems: "flex-end",
                width: "100%",
                height: BAR_MAX_H,
              }}>
                {week.map((bar, di) => {
                  const h = bar.value > 0
                    ? Math.max(5, Math.round((bar.value / maxVal) * BAR_MAX_H))
                    : 3;
                  return (
                    <div
                      key={di}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: h,
                        background: barColor(bar.value),
                        borderRadius: bar.value > 0 ? "2px 2px 0 0" : "1px",
                        boxShadow: barGlow(bar.value),
                        cursor: bar.value > 0 ? "pointer" : "default",
                        outline: bar.isToday ? "1.5px solid rgba(57,211,83,0.85)" : "none",
                        outlineOffset: 1,
                        transition: "filter 60ms",
                        position: "relative",
                      }}
                      onMouseEnter={() => handleEnter(bar)}
                    />
                  );
                })}
              </div>

              {/* day labels */}
              <div style={{ display: "flex", gap: 2, width: "100%" }}>
                {week.map((bar, di) => (
                  <div key={di} style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 7,
                    color: bar.isToday ? "#39d353"
                          : bar.dow === 0 || bar.dow === 4 ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.10)",
                    fontWeight: bar.isToday ? 700 : 400,
                    userSelect: "none",
                    lineHeight: 1,
                  }}>
                    {bar.dow === 0 ? "M" : bar.dow === 2 ? "W" : bar.dow === 4 ? "F" : "·"}
                  </div>
                ))}
              </div>

              {/* week start date */}
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7,
                color: "rgba(255,255,255,0.14)",
                textAlign: "center",
                letterSpacing: "0.02em",
              }}>
                {weekDate}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer stats ── */}
      <div style={{
        display: "flex",
        gap: 14,
        marginTop: 12,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "rgba(255,255,255,0.28)",
        letterSpacing: "0.04em",
        flexWrap: "wrap",
      }}>
        <span style={{ color: totalXP > 0 ? "rgba(57,211,83,0.75)" : undefined }}>
          {totalXP > 0 ? `${totalXP.toLocaleString()} XP` : "0 XP"}
        </span>
        <span>{active} aktiv gün / {weeks * 7}</span>
        {best.value > 0 && (
          <span>ən yaxşı: {best.value} XP · {best.date}</span>
        )}
      </div>

      {/* ── Tooltip ── */}
      {hover && (
        <div style={{
          position: "fixed",
          left: tipLeft,
          top: tipTop,
          background: "#1c2128",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 7,
          padding: "8px 13px",
          pointerEvents: "none",
          zIndex: 9999,
          whiteSpace: "nowrap",
          boxShadow: "0 8px 28px rgba(0,0,0,0.7)",
          minWidth: 130,
        }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 4,
            letterSpacing: "0.04em",
          }}>
            {fmt(hover.date)}
          </div>
          {hover.value > 0 ? (
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              fontWeight: 700,
              color: "#39d353",
              display: "flex",
              alignItems: "baseline",
              gap: 4,
            }}>
              {hover.value}
              <span style={{ fontSize: 10, fontWeight: 400, color: "rgba(57,211,83,0.65)" }}>XP</span>
            </div>
          ) : (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
              Fəaliyyət yoxdur
            </div>
          )}
        </div>
      )}
    </div>
  );
}
