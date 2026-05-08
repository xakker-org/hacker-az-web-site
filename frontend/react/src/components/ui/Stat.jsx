import Sparkline from "./Sparkline";
import "./Stat.css";

/**
 * Big number + optional label, delta, sparkline.
 * Used inside <Tile>. Bento-friendly.
 */
export default function Stat({
  label,
  value,
  unit,
  hint,
  delta,            // {value: number, dir: "up"|"down"}
  spark,            // number[]
  sparkTone,        // "accent" | "mint" | "amber" | "coral" | "violet"
  size = "md",      // sm | md | lg
}) {
  const cls = ["stat", `stat-${size}`].join(" ");
  return (
    <div className={cls}>
      {label && <div className="stat-label">{label}</div>}
      <div className="stat-row">
        <span className="stat-value tnum">{value}{unit && <span className="stat-unit">{unit}</span>}</span>
        {delta !== undefined && delta !== null && (
          <span className={`stat-delta ${delta.dir === "down" ? "is-down" : "is-up"}`}>
            {delta.dir === "down" ? "↓" : "↑"} {delta.value}
          </span>
        )}
      </div>
      {spark && spark.length > 1 && (
        <div className="stat-spark">
          <Sparkline data={spark} tone={sparkTone} height={28} />
        </div>
      )}
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
