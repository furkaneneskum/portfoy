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
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M11 11 H41" />
        <path d="M11 11 V53" />
        <path d="M11 32 H37" />
        <path d="M11 53 H41" />
        <path d="M37 32 L53 11" />
        <path d="M37 32 L53 53" />
      </g>
    </svg>
  );
}
