import { useEffect, useState } from "react";
import "./Avatar.css";

const RANK_COLORS = {
  recruit: "#636d7f", script_kiddie: "#4d9fff", operative: "#00e5ff",
  hunter: "#39d353", specialist: "#a855f7", analyst: "#ffb300",
  architect: "#ff3d5a", operator: "#ff8099", ghost: "#ffffff",
};

export default function Avatar({
  user,             // { username, avatar_url, avatar_hue, rank }
  size = 36,
  rounded = "lg",   // sm | md | lg | full
  ring = false,
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [user?.avatar_url]);

  const radius = rounded === "full" ? "999px"
               : rounded === "sm" ? "8px"
               : rounded === "md" ? "10px"
               : "12px";
  const initial = (user?.username || user?.full_name || "?")[0]?.toUpperCase() || "?";
  const hue = Number(user?.avatar_hue) || 0;
  const rankColor = RANK_COLORS[user?.rank] || "var(--accent)";

  const style = {
    width: size,
    height: size,
    borderRadius: radius,
    boxShadow: ring ? `0 0 0 2px ${rankColor}40, 0 0 0 4px var(--bg)` : undefined,
    fontSize: size * 0.4,
  };

  if (user?.avatar_url && !failed) {
    return (
      <span className="avatar" style={style}>
        <img
          src={user.avatar_url}
          alt={user.username || "avatar"}
          onError={() => setFailed(true)}
          style={{ borderRadius: radius }}
        />
      </span>
    );
  }

  const bg = `linear-gradient(135deg, hsl(${hue} 75% 56%), hsl(${(hue + 60) % 360} 78% 60%))`;
  return (
    <span
      className="avatar avatar-fallback"
      style={{ ...style, background: bg, color: "#08111d" }}
    >
      {initial}
    </span>
  );
}
