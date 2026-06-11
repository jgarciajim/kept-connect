import React from 'react';

/**
 * Tag — quiet descriptive pill. Credentials (Licensed, Insured,
 * Background checked) and trades render as calm --tag-bg pills.
 * Trust facts are *description*, not badges shouting for attention.
 */
export function Tag({
  variant = 'default',  // default | trade | status
  status = null,        // for variant="status": 'live' | 'verified' | 'neutral'
  icon = null,
  children,
  className = '',
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    height: 22,
    padding: '0 10px',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    fontSize: 11,
    lineHeight: 1,
    letterSpacing: '0.005em',
    borderRadius: 'var(--r-pill)',
    whiteSpace: 'nowrap',
  };

  const statusColors = {
    live:     { bg: 'var(--terracotta-tint)', ink: 'var(--terracotta-deep)' },
    verified: { bg: '#E4F0EA',                ink: 'var(--verified)' },
    neutral:  { bg: 'var(--neutral)',         ink: 'var(--ink-2)' },
  };

  let toneStyle;
  if (variant === 'status' && status && statusColors[status]) {
    toneStyle = { background: statusColors[status].bg, color: statusColors[status].ink };
  } else if (variant === 'trade') {
    toneStyle = { background: 'var(--paper)', color: 'var(--ink-2)', boxShadow: 'inset 0 0 0 1px var(--hairline)' };
  } else {
    toneStyle = { background: 'var(--tag-bg)', color: 'var(--tag-ink)' };
  }

  return (
    <span
      className={`kc-tag kc-tag--${variant} ${className}`}
      style={{ ...base, ...toneStyle, ...style }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', flex: '0 0 auto' }}>{icon}</span>}
      {children}
    </span>
  );
}
