import "./ProgressRing.css";

const TONE = {
  accent: "var(--accent)",
  mint:   "var(--c-1)",
  amber:  "var(--c-3)",
  coral:  "var(--c-4)",
  violet: "var(--c-5)",
  sky:    "var(--c-6)",
};

export default function ProgressRing({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 8,
  tone = "accent",
  label,
  sub,
  children,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  const color = TONE[tone] || TONE.accent;

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="var(--line-2)" strokeWidth={strokeWidth} fill="none"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={c} strokeDashoffset={off}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 800ms var(--ease, cubic-bezier(.22,1,.36,1))" }}
        />
      </svg>
      <div className="ring-center">
        {children ?? (
          <>
            {label && <div className="ring-value tnum">{label}</div>}
            {sub && <div className="ring-sub">{sub}</div>}
          </>
        )}
      </div>
    </div>
  );
}
