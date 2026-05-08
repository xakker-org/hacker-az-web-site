import "./Skeleton.css";

export default function Skeleton({ height = 14, width = "100%", radius = 6, className = "", style }) {
  return (
    <span
      className={`skel ${className}`}
      style={{ height, width, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

export function TileSkeleton({ height = 160 }) {
  return (
    <div className="tile" style={{ minHeight: height, gap: 12 }}>
      <Skeleton height={10} width="40%" />
      <Skeleton height={28} width="60%" />
      <Skeleton height={6} width="100%" radius={999} />
      <Skeleton height={12} width="80%" />
    </div>
  );
}
