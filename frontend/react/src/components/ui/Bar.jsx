import "./Bar.css";

const TONE = {
  accent: "linear-gradient(90deg, var(--accent), var(--c-1))",
  mint:   "linear-gradient(90deg, var(--c-1), var(--c-6))",
  amber:  "linear-gradient(90deg, var(--c-3), var(--accent))",
  coral:  "linear-gradient(90deg, var(--c-4), var(--c-5))",
  violet: "linear-gradient(90deg, var(--c-5), var(--c-6))",
  sky:    "linear-gradient(90deg, var(--c-6), var(--c-1))",
};

export default function Bar({
  value = 0,
  max = 100,
  tone = "accent",
  height = 6,
  caption,
  rightCaption,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="bar">
      <div className="bar-track" style={{ height }}>
        <div
          className="bar-fill"
          style={{ width: `${pct}%`, background: TONE[tone] || TONE.accent }}
        />
      </div>
      {(caption || rightCaption) && (
        <div className="bar-meta">
          <span>{caption}</span>
          {rightCaption && <span>{rightCaption}</span>}
        </div>
      )}
    </div>
  );
}
