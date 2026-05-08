import "./Tabs.css";

export default function Tabs({ value, onChange, options, ariaLabel }) {
  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = (opt.value ?? opt.key) === value;
        return (
          <button
            key={opt.value ?? opt.key}
            role="tab"
            type="button"
            aria-selected={active}
            className={`tab${active ? " is-active" : ""}`}
            onClick={() => onChange(opt.value ?? opt.key)}
          >
            {opt.icon && <span className="tab-ico">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.count !== undefined && <span className="tab-count tnum">{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
