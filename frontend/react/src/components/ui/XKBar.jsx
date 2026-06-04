import { useEffect, useState } from "react";

/**
 * Animated progress bar using the xk-track / xk-fill CSS classes.
 * The fill width animates from 0 on mount (60ms delay so React has painted).
 * Extracted from DashboardPage for reuse across all screens.
 */
export default function XKBar({ value, max = 100, height = 6, color }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW((value / max) * 100), 60);
    return () => clearTimeout(id);
  }, [value, max]);

  return (
    <div className="xk-track" style={{ height }}>
      <div
        className="xk-fill"
        style={{ width: `${w}%`, background: color || "var(--accent)" }}
      />
    </div>
  );
}
