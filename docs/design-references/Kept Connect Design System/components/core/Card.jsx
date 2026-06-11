import React from 'react';

/**
 * Card — the surface primitive.
 * tone="paper" = clean data surface (quotes, prices, stats, history).
 * tone="moment" = warm cream, HUMAN MOMENTS ONLY (hero, onboarding,
 * confirmation, empty states). Never put numbers on a moment card.
 * tone="chrome" = dark provider-app card.
 */
export function Card({
  tone = 'paper',
  ribbon = null,        // null | 'sameday' | 'urgent' | 'emerald' — left-edge ribbon flag
  padding = 20,
  radius = 'var(--r-card)',
  lift = false,         // raise with a soft shadow
  children,
  className = '',
  style = {},
  ...rest
}) {
  const tones = {
    paper:  { background: 'var(--paper)',  color: 'var(--ink)', border: '1px solid var(--hairline)' },
    moment: { background: 'var(--moment)', color: 'var(--ink)', border: '1px solid transparent' },
    canvas: { background: 'var(--canvas)', color: 'var(--ink)', border: '1px solid var(--hairline)' },
    chrome: { background: 'var(--chrome-2)', color: 'var(--cream)', border: '1px solid rgba(244,241,232,0.08)' },
  };
  const ribbonColors = {
    sameday: 'var(--flag-sameday)',
    urgent:  'var(--flag-urgent)',
    emerald: 'var(--emerald)',
  };

  return (
    <div
      className={`kc-card kc-card--${tone} ${className}`}
      style={{
        position: 'relative',
        borderRadius: radius,
        padding,
        boxShadow: lift ? 'var(--shadow-card)' : 'none',
        overflow: 'hidden',
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {ribbon && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: ribbonColors[ribbon] || 'var(--emerald)',
          }}
        />
      )}
      {children}
    </div>
  );
}
