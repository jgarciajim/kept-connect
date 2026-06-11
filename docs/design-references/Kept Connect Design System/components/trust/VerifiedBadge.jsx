import React from 'react';

/**
 * VerifiedBadge — the trust treatment, signature #2.
 * A small emerald check beside a provider name. Emerald = safe/affirmed.
 * One, clean. Never a loud shield, gold seal, or animated badge —
 * restraint is the credibility.
 */
export function VerifiedBadge({
  size = 16,
  label = false,        // show "Verified" text beside the check
  className = '',
  style = {},
  ...rest
}) {
  return (
    <span
      className={`kc-verified ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...style }}
      title="Verified"
      {...rest}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="var(--verified)" />
        <path
          d="M8 12.2 L10.8 15 L16 9.4"
          fill="none"
          stroke="var(--cream)"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 12,
            color: 'var(--verified)',
            letterSpacing: '0.005em',
          }}
        >
          Verified
        </span>
      )}
    </span>
  );
}
