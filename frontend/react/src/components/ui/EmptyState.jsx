import "./EmptyState.css";

export default function EmptyState({ icon = "◌", title, description, action }) {
  return (
    <div className="empty">
      <div className="empty-ico" aria-hidden="true">{icon}</div>
      {title && <h3 className="empty-title">{title}</h3>}
      {description && <p className="empty-desc">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
