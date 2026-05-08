/**
 * Inline SVG sparkline. Pure, no deps.
 * Props:
 *   data    — number[]
 *   height  — px (default 28)
 *   tone    — accent | mint | amber | coral | violet | sky
 *   variant — line (default) | area | bars
 */
const TONE = {
  accent: "var(--accent)",
  mint:   "var(--c-1)",
  lime:   "var(--c-2)",
  amber:  "var(--c-3)",
  coral:  "var(--c-4)",
  violet: "var(--c-5)",
  sky:    "var(--c-6)",
};

export default function Sparkline({
  data = [],
  height = 28,
  tone = "accent",
  variant = "line",
  strokeWidth = 1.5,
}) {
  if (!data || data.length < 2) return <svg height={height} aria-hidden="true" />;
  const w = 100;
  const h = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const color = TONE[tone] || TONE.accent;
  const id = `spk-${Math.random().toString(36).slice(2, 8)}`;

  if (variant === "bars") {
    const bw = Math.max(2, step * 0.7);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden="true">
        {data.map((v, i) => {
          const bh = ((v - min) / span) * h;
          const x = i * step + (step - bw) / 2;
          const y = h - bh;
          return <rect key={i} x={x} y={y} width={bw} height={bh} rx="1" fill={color} opacity={0.85} />;
        })}
      </svg>
    );
  }

  const points = data.map((v, i) => [i * step, h - ((v - min) / span) * h]);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  const dArea = `${d} L${w} ${h} L0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden="true">
      {variant === "area" && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"  stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={dArea} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
