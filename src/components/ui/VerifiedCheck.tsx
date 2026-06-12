import type { CSSProperties } from "react";

/**
 * VerifiedCheck — the trust treatment (TIER 2). A small emerald check beside a
 * provider name; emerald = safe/affirmed, the one place the system follows the
 * universal convention over brand. One, clean — never a loud shield or gold seal.
 */
export interface VerifiedCheckProps {
  size?: number;
  /** Show the word "Verified" beside the check. */
  label?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function VerifiedCheck({ size = 16, label = false, className = "", style }: VerifiedCheckProps) {
  return (
    <span
      className={`kc-verified ${className}`.trim()}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, ...style }}
      title="Verified"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="var(--verified)" />
        <path
          d="M8 12.2 L10.8 15 L16 9.4"
          fill="none"
          stroke="var(--cream)"
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, color: "var(--verified)", letterSpacing: "0.005em" }}>
          Verified
        </span>
      )}
    </span>
  );
}
