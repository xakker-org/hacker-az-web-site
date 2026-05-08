import { forwardRef } from "react";

/**
 * Bento Tile primitive.
 * Variants: default | accent | quiet | flat
 * Spans set via className "span-N" (1..12) and optional "row-N".
 */
const Tile = forwardRef(function Tile(
  {
    as: Component = "div",
    variant = "default",
    span,
    row,
    interactive = false,
    pad,
    className = "",
    children,
    ...rest
  },
  ref,
) {
  const classes = ["tile"];
  if (variant === "accent") classes.push("tile-accent");
  if (variant === "quiet") classes.push("tile-quiet");
  if (variant === "flat")  classes.push("tile-flat");
  if (pad === "sm") classes.push("tile-pad-sm");
  if (pad === "lg") classes.push("tile-pad-lg");
  if (span) classes.push(`span-${span}`);
  if (row) classes.push(`row-${row}`);
  if (interactive) classes.push("is-interactive");
  if (className) classes.push(className);

  return (
    <Component ref={ref} className={classes.join(" ")} {...rest}>
      {children}
    </Component>
  );
});

export function TileHead({ eyebrow, title, sub, action, children }) {
  return (
    <div className="tile-head">
      <div className="tile-head-l">
        {eyebrow && <div className="tile-eyebrow">{eyebrow}</div>}
        {title && <div className="tile-title">{title}</div>}
        {sub && <div className="tile-sub">{sub}</div>}
        {children}
      </div>
      {action && <div className="tile-action">{action}</div>}
    </div>
  );
}

export default Tile;
