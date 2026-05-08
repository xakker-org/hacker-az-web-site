import "./Button.css";

export default function Button({
  as: Component = "button",
  variant = "default",  // default | accent | ghost | quiet
  size = "md",          // sm | md | lg
  block,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    block && "btn-block",
    className,
  ].filter(Boolean).join(" ");
  return <Component className={cls} {...rest}>{children}</Component>;
}
