export default function Logo({
  className = "h-8 w-8",
  title = "FEK monogram",
  decorative = false,
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="#D4AF37">
        {/* F */}
        <rect x="7" y="11" width="5" height="42" />
        <rect x="7" y="11" width="17" height="5" />
        <rect x="7" y="28" width="13" height="5" />

        {/* E */}
        <rect x="26" y="11" width="5" height="42" />
        <rect x="26" y="11" width="16" height="5" />
        <rect x="26" y="28" width="16" height="5" />
        <rect x="26" y="46" width="16" height="5" />
        <rect x="37" y="11" width="5" height="42" />

        {/* K */}
        <rect x="46" y="11" width="5" height="42" />
        <polygon points="51,28 51,33 61,11 56,11" />
        <polygon points="51,28 51,33 61,53 56,53" />
      </g>
    </svg>
  );
}
