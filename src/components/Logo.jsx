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
        {/* Sol dikey omurga — F & E paylaşımlı */}
        <rect x="8" y="8" width="7" height="48" />
        {/* E sağ dikey — K ile entegre */}
        <rect x="37" y="8" width="7" height="48" />
        {/* F üst bar + E üst bar */}
        <rect x="8" y="8" width="36" height="7" />
        {/* F orta bar + E orta bar (F burada E ile birleşir) */}
        <rect x="8" y="27" width="36" height="7" />
        {/* E alt bar */}
        <rect x="8" y="49" width="36" height="7" />
        {/* K üst çapraz */}
        <polygon points="44,27 44,34 59,8 52,8" />
        {/* K alt çapraz */}
        <polygon points="44,27 44,34 59,56 52,56" />
      </g>
    </svg>
  );
}
