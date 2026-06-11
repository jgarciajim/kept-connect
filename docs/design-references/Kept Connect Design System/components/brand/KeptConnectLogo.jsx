import React from 'react';

/**
 * Kept Connect mark — the "K-link" dispatch fan-out.
 * A geometric K whose three arms fire from the vertex into chevron
 * arrowheads: one request dispatched to many providers.
 * Pure vector, viewBox 0 0 120 120. Locked geometry — do not redraw.
 */
function Mark({ stroke }) {
  return (
    <>
      <g fill="none" stroke={stroke} strokeWidth="9.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M38 30 V90" />
        <path d="M38 60 L82 36" />
        <path d="M38 60 L86 60" />
        <path d="M38 60 L82 84" />
      </g>
      <g fill="none" stroke={stroke} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M77.45 46.46 L82 36 L70.75 34.16" />
        <path d="M77 67 L86 60 L77 53" />
        <path d="M77.45 73.54 L82 84 L70.75 85.84" />
      </g>
    </>
  );
}

const TREATMENTS = {
  'app-icon':  { block: 'var(--terracotta-deep)', mark: 'var(--cream)' },
  'on-light':  { block: 'none',                   mark: 'var(--terracotta)' },
  'on-chrome': { block: 'var(--chrome)',          mark: 'var(--cream)' },
  'mono':      { block: 'none',                   mark: 'var(--ink)' },
  'reversed':  { block: 'none',                   mark: 'var(--cream)' },
  'blue':      { block: 'var(--blue)',            mark: 'var(--blue-ink)' },
};

/**
 * KeptConnectLogo — the brand identity.
 * variant="mark" renders just the squircle mark; variant="lockup"
 * renders mark + "Kept Connect." wordmark (horizontal or stacked).
 */
export function KeptConnectLogo({
  treatment = 'on-light',
  variant = 'mark',
  size = 48,
  orientation = 'horizontal',
  className = '',
  style = {},
}) {
  const t = TREATMENTS[treatment] || TREATMENTS['on-light'];
  const hasBlock = t.block !== 'none';
  const radius = Math.round(size * 0.27); // squircle ≈ rx32/120

  const markSvg = (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{
        display: 'block',
        borderRadius: hasBlock ? radius : 0,
        flex: '0 0 auto',
        ...(hasBlock ? { } : {}),
      }}
      aria-hidden="true"
    >
      {hasBlock && <rect x="6" y="6" width="108" height="108" rx="32" fill={t.block} />}
      <Mark stroke={t.mark} />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={className} style={{ display: 'inline-flex', ...style }}>{markSvg}</span>;
  }

  // Wordmark color follows treatment: cream/blue-ink on dark, else ink.
  const wordColor =
    treatment === 'reversed' || treatment === 'on-chrome'
      ? 'var(--cream)'
      : treatment === 'blue'
      ? 'var(--blue-ink)'
      : 'var(--ink)';

  const wordSize = Math.round(size * 0.78);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: orientation === 'stacked' ? 'column' : 'row',
        alignItems: 'center',
        gap: orientation === 'stacked' ? size * 0.22 : size * 0.34,
        ...style,
      }}
    >
      {markSvg}
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: wordSize,
          letterSpacing: '-0.015em',
          lineHeight: 1,
          color: wordColor,
          whiteSpace: 'nowrap',
        }}
      >
        Kept <span style={{ fontWeight: 400 }}>Connect</span>
        <span style={{ color: 'var(--terracotta)' }}>.</span>
      </span>
    </span>
  );
}
