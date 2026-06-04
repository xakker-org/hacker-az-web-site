import { useEffect, useRef, useState } from "react";

/**
 * Count-up animated number.
 * Extracted from DashboardPage for reuse across all screens.
 */
export default function AnimatedNumber({ value, duration = 1100 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef({ raf: 0, from: 0 });

  useEffect(() => {
    const from = ref.current.from;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (value - from) * e;
      setDisplay(v);
      if (p < 1) ref.current.raf = requestAnimationFrame(tick);
      else ref.current.from = value;
    };
    cancelAnimationFrame(ref.current.raf);
    ref.current.raf = requestAnimationFrame(tick);
    const fb = setTimeout(() => {
      setDisplay(value);
      ref.current.from = value;
    }, duration + 400);
    return () => {
      cancelAnimationFrame(ref.current.raf);
      clearTimeout(fb);
    };
  }, [value, duration]);

  return <span>{Math.round(display).toLocaleString("az")}</span>;
}
