// Shared brand logo. Placeholder mark — replace artwork in public/brand/
// and/or this inline SVG with the final Kept Connect mark.
export function KeptConnectLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Kept Connect"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="60" height="60" rx="14" fill="currentColor" opacity="0.1" />
      <path
        d="M20 16v32M20 32l16-16M20 32l16 16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="32" r="5" fill="currentColor" />
    </svg>
  );
}
