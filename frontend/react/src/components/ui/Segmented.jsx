import "./Segmented.css";

export default function Segmented({ value, onChange, options, size = "md", block, ariaLabel }) {
  const cls = ["seg", `seg-${size}`, block && "seg-block"].filter(Boolean).join(" ");
  return (
    <div className={cls} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = (opt.value ?? opt.key) === value;
        return (
          <button
            key={opt.value ?? opt.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`seg-item${active ? " is-active" : ""}`}
            onClick={() => onChange(opt.value ?? opt.key)}
          >
            {opt.icon && <span className="seg-ico">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && <span className="seg-count tnum">{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
