import "./Chip.css";

export function Chip({ tone = "neutral", size = "md", children, icon, className = "", ...rest }) {
  const cls = ["chip", `chip-${tone}`, `chip-${size}`, className].join(" ");
  return (
    <span className={cls} {...rest}>
      {icon && <span className="chip-ico">{icon}</span>}
      {children}
    </span>
  );
}

const DIFF = {
  beginner:     { label: "Easy",   tone: "easy" },
  easy:         { label: "Easy",   tone: "easy" },
  intermediate: { label: "Medium", tone: "med" },
  medium:       { label: "Medium", tone: "med" },
  advanced:     { label: "Hard",   tone: "hard" },
  hard:         { label: "Hard",   tone: "hard" },
  expert:       { label: "Expert", tone: "expert" },
};

export function DiffBadge({ level, labelOverride }) {
  const m = DIFF[level] || DIFF.easy;
  return <span className={`chip chip-${m.tone} chip-sm chip-mono`}>{labelOverride || m.label}</span>;
}

export default Chip;
