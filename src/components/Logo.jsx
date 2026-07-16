import { useId } from "react";

export default function Logo({ className = "h-8 w-8", title = "FEK monogram", decorative = false }) {
  const gradientId = useId();

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0DC8A" />
          <stop offset="45%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7B1A" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke={`url(#${gradientId})`}
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
