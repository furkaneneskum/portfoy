export default function Logo({ className = "h-8 w-8 text-yellow-400", title = "FEK monogram", decorative = false }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* F + E: ortak sol omurga, üst ve orta bar = F; alt bar = E */}
      <g fill="currentColor">
        <rect x="9" y="9" width="7" height="46" />
        <rect x="38" y="9" width="7" height="46" />
        <rect x="9" y="9" width="36" height="7" />
        <rect x="9" y="28" width="36" height="7" />
        <rect x="9" y="48" width="36" height="7" />
      </g>
      {/* K: E'nin orta hizasından çaprazlar */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M45 32 L57 10" />
        <path d="M45 32 L57 54" />
      </g>
    </svg>
  );
}
