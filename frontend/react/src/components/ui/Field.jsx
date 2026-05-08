import "./Field.css";

export default function Field({ label, hint, error, children, htmlFor }) {
  return (
    <label className="field" htmlFor={htmlFor}>
      {label && <span className="field-label">{label}</span>}
      {children}
      {error
        ? <span className="field-error">{error}</span>
        : hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function Input({ className = "", ...rest }) {
  return <input className={`input ${className}`} {...rest} />;
}
export function Textarea({ className = "", ...rest }) {
  return <textarea className={`input input-area ${className}`} {...rest} />;
}
export function Select({ className = "", children, ...rest }) {
  return (
    <span className={`select-wrap ${className}`}>
      <select className="input select" {...rest}>{children}</select>
      <span className="select-caret" aria-hidden="true">▾</span>
    </span>
  );
}
