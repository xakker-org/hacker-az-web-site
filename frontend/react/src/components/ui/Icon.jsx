/**
 * Inline SVG icon component.
 * Viewbox 16×16. name must be one of the keys below.
 * Usage: <Icon name="missions" size={18} />
 */
export default function Icon({ name, size = 16, className = "", style }) {
  const icons = {
    dashboard: (
      <>
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="8.5" y="2" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="2" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="currentColor" opacity=".9"/>
      </>
    ),
    missions: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
      </>
    ),
    labs: (
      <>
        <rect x="2.5" y="5" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 5V3.5C5.5 3.22 5.72 3 6 3H10C10.28 3 10.5 3.22 10.5 3.5V5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 8.5H13.5" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    study: (
      <>
        <rect x="2.5" y="2.5" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 6.5H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 9H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    paths: (
      <>
        <circle cx="3.5" cy="12.5" r="1.8" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.8" fill="currentColor"/>
        <circle cx="12.5" cy="3.5" r="1.8" fill="currentColor"/>
        <path d="M5 11L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M9 7L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    courses: (
      <>
        <path d="M2 5L8 2L14 5L8 8L2 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 9L8 12L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    leaderboard: (
      <>
        <rect x="2" y="8" width="3.5" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6.25" y="5" width="3.5" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10.5" y="2" width="3.5" height="13" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    profile: (
      <>
        <circle cx="8" cy="5.5" r="2.75" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.5 14C2.5 11.5 5.01 9.5 8 9.5C10.99 9.5 13.5 11.5 13.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    chevronLeft: (
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    chevronRight: (
      <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    chevronDown: (
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    logout: (
      <>
        <path d="M10 11L13 8L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 8H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 2.5H3.5C3.22 2.5 3 2.72 3 3V13C3 13.28 3.22 13.5 3.5 13.5H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    search: (
      <>
        <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    play: (
      <path d="M5 3l9 5-9 5V3z" fill="currentColor"/>
    ),
    book: (
      <>
        <path d="M4 2.5H11.5C12.33 2.5 13 3.17 13 4V13C13 13.83 12.33 14.5 11.5 14.5H4C3.17 14.5 2.5 13.83 2.5 13V4C2.5 3.17 3.17 2.5 4 2.5Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 5.5H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.5 10.5H8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    terminal: (
      <>
        <rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 7L7.5 9L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    check: (
      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    lock: (
      <>
        <rect x="4" y="7" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5.5 7V5.5C5.5 4.12 6.62 3 8 3C9.38 3 10.5 4.12 10.5 5.5V7" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    star: (
      <path d="M8 2l1.8 3.6L14 6.4l-3 2.9.7 4.1L8 11.4 4.3 13.4l.7-4.1-3-2.9 4.2-.8L8 2z" fill="currentColor"/>
    ),
    xp: (
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </>
    ),
    layers: (
      <>
        <path d="M2 6l6-3.5L14 6l-6 3.5L2 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M2 10l6 3.5L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ),
    trophy: (
      <>
        <path d="M8 11v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 2.5H12V8C12 10.21 10.21 12 8 12C5.79 12 4 10.21 4 8V2.5Z" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4 5H2V7C2 8.1 2.9 9 4 9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 5H14V7C14 8.1 13.1 9 12 9" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    arrowRight: (
      <path d="M3 8H13M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    ),
    map: (
      <>
        <path d="M2 4.5L6 2.5L10 4.5L14 2.5V11.5L10 13.5L6 11.5L2 13.5V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 2.5V11.5M10 4.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
      </>
    ),
    beaker: (
      <>
        <path d="M5.5 2.5V7L2.5 12C2.5 13.1 3.4 14 4.5 14H11.5C12.6 14 13.5 13.1 13.5 12L10.5 7V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 2.5H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="6.5" cy="11" r="1" fill="currentColor" opacity=".7"/>
        <circle cx="9.5" cy="9.5" r="0.8" fill="currentColor" opacity=".5"/>
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      style={{ display: "block", flexShrink: 0, ...style }}
    >
      {icons[name] || null}
    </svg>
  );
}
