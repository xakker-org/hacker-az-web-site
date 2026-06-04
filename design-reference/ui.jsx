// ui.jsx — shared UI primitives for xakker
const { useState, useEffect, useRef } = React;

/* ---------------- Icons (simple line iconography) ---------------- */
const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  target: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8zM12 11.5a.5.5 0 100 1 .5.5 0 000-1z",
  beaker: "M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3M6.5 15h11",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19a2 2 0 012-2h13",
  route: "M6 19a3 3 0 100-6 3 3 0 000 6zM18 11a3 3 0 100-6 3 3 0 000 6zM9 17h6a3 3 0 003-3M6 13V9a3 3 0 013-3",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  flame: "M12 3c1 4 5 5 5 9a5 5 0 11-10 0c0-1.5.6-2.5 1.4-3.4C9 10 9.5 8.5 9 7c2 .5 3-1 3-4z",
  star: "M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.6 1.2-6L3.3 9.4l6.1-.8z",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M5 12l4 4 10-10",
  chevron: "M15 6l-6 6 6 6",
  logout: "M16 17l5-5-5-5M21 12H9M12 19H6a2 2 0 01-2-2V7a2 2 0 012-2h6",
  medal: "M12 13a5 5 0 100-10 5 5 0 000 10zM8.5 11.5L7 21l5-3 5 3-1.5-9.5",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  command: "M9 9V6a3 3 0 10-3 3h12a3 3 0 10-3-3v3m0 0v6m0-6H9m0 6v3a3 3 0 10-3-3h12a3 3 0 10-3 3v-3m0 0H9",
  plus: "M12 5v14M5 12h14",
  dot: "M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0",
};

function Icon({ name, size = 20, stroke = 1.6, fill = "none", className = "", style }) {
  const d = ICONS[name] || ICONS.dot;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
         stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
         strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ---------------- AnimatedNumber: counts up on mount / value change ---------------- */
function AnimatedNumber({ value, duration = 1100, decimals = 0, enabled = true }) {
  const [display, setDisplay] = useState(enabled ? 0 : value);
  const ref = useRef({ raf: 0, from: 0 });
  useEffect(() => {
    if (!enabled) { setDisplay(value); return; }
    const from = ref.current.from;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const v = from + (value - from) * e;
      setDisplay(v);
      if (p < 1) ref.current.raf = requestAnimationFrame(tick);
      else ref.current.from = value;
    };
    cancelAnimationFrame(ref.current.raf);
    ref.current.raf = requestAnimationFrame(tick);
    // fallback: guarantee final value even if rAF is throttled (hidden iframe)
    const fb = setTimeout(() => { setDisplay(value); ref.current.from = value; }, duration + 400);
    return () => { cancelAnimationFrame(ref.current.raf); clearTimeout(fb); };
  }, [value, enabled, duration]);
  const out = decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString("az");
  return <span>{out}</span>;
}

/* ---------------- ProgressBar ---------------- */
function ProgressBar({ value, max = 100, height = 6, enabled = true, color }) {
  const [w, setW] = useState(enabled ? 0 : (value / max) * 100);
  useEffect(() => {
    const id = setTimeout(() => setW((value / max) * 100), 60);
    return () => clearTimeout(id);
  }, [value, max]);
  return (
    <div className="xk-track" style={{ height }}>
      <div className="xk-fill" style={{ width: `${w}%`, background: color || "var(--accent)" }} />
    </div>
  );
}

/* ---------------- Ring (circular progress) ---------------- */
function Ring({ value, size = 92, stroke = 8, enabled = true, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [v, setV] = useState(enabled ? 0 : value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), 60);
    return () => clearTimeout(id);
  }, [value]);
  const off = c - (v / 100) * c;
  return (
    <div className="xk-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--ring-bg)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--accent)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
      </svg>
      {label !== undefined && (
        <div className="xk-ring-label">
          <div className="xk-ring-value">{label}</div>
          {sub && <div className="xk-ring-sub">{sub}</div>}
        </div>
      )}
    </div>
  );
}

/* ---------------- Heatmap (GitHub-style activity grid) ---------------- */
function Heatmap({ days, enabled = true }) {
  const level = (xp) => (xp <= 0 ? 0 : xp < 20 ? 1 : xp < 50 ? 2 : xp < 100 ? 3 : 4);
  const weeks = Math.ceil(days.length / 7);
  const dowLabels = ["B", "Ç", "Ç", "C", "C", "Ş", "B"];
  return (
    <div className="xk-heat-wrap">
      <div className="xk-heat-dows">
        {dowLabels.map((l, i) => <span key={i}>{i % 2 ? l : ""}</span>)}
      </div>
      <div className="xk-heatmap" style={{ gridTemplateColumns: `repeat(${weeks}, 1fr)`, gridTemplateRows: "repeat(7, 1fr)" }}>
        {days.map((d, i) => (
          <div key={i} className={`xk-cell lvl-${level(d.xp)}`}
            style={{ animationDelay: enabled ? `${i * 6}ms` : "0ms" }}
            title={`${d.date.toLocaleDateString("az")} · ${d.xp} XP`} />
        ))}
      </div>
    </div>
  );
}

function HeatLegend() {
  return (
    <div className="xk-heat-legend">
      <span>Az</span>
      {[0, 1, 2, 3, 4].map((l) => <span key={l} className={`xk-cell lvl-${l}`} />)}
      <span>Çox</span>
    </div>
  );
}

/* ---------------- Card wrapper with reveal ---------------- */
function Card({ children, className = "", style, delay = 0, span, interactive, onClick }) {
  const s = { ...style, animationDelay: `${delay}ms` };
  if (span) s.gridColumn = `span ${span}`;
  if (onClick) s.cursor = "pointer";
  return (
    <div className={`xk-card xk-reveal ${interactive ? "xk-int" : ""} ${className}`} style={s} onClick={onClick}>
      {children}
    </div>
  );
}

/* ---------------- Badge ---------------- */
function Badge({ children, tone = "default", className = "" }) {
  return <span className={`xk-badge tone-${tone} ${className}`}>{children}</span>;
}

/* ---------------- Avatar ---------------- */
function Avatar({ name, size = 32, color }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  return (
    <div className="xk-avatar" style={{ width: size, height: size, fontSize: size * 0.42,
      background: color || "linear-gradient(135deg, var(--accent), #7a1717)" }}>
      {initial}
    </div>
  );
}

Object.assign(window, { Icon, AnimatedNumber, ProgressBar, Ring, Heatmap, HeatLegend, Card, Badge, Avatar });
