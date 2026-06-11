import React from 'react';

/**
 * Avatar — the circular assignment language, inherited from the ops tool.
 * Soft-tinted circle, 2px white inner border, optional activity-ring status.
 * Connect extends the ring STATES for the marketplace (responding/quoted/
 * awarded/en-route/on-site/done) but never the shape language.
 */
const RING = {
  none:       null,
  responding: { color: 'var(--ink-3)',     fill: false, pulse: true },   // searching — neutral, in motion
  quoted:     { color: 'var(--terracotta)', fill: false },
  awarded:    { color: 'var(--terracotta)', fill: true },                // filled ring
  enroute:    { color: 'var(--terracotta)', fill: false },               // live job state
  onsite:     { color: 'var(--terracotta)', fill: false },
  done:       { color: 'var(--ink-3)',     fill: false },
};

// Stable soft tint from a name (avatar background when no image).
const TINTS = [
  '#E4F0EA', '#F3E7D8', '#E6E9F2', '#F1E6E6', '#E8EFE6', '#EFE9F1', '#E9EEF0',
];
function tintFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}
function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function Avatar({
  name = '',
  src = null,
  size = 44,
  status = 'none',     // ring state, see RING
  className = '',
  style = {},
  ...rest
}) {
  const ring = RING[status] || null;
  const ringWidth = Math.max(2, Math.round(size * 0.06));
  const gap = ring ? ringWidth + 3 : 0; // ring sits outside a small gap

  const inner = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: src ? `center/cover no-repeat url(${src})` : tintFor(name),
        boxShadow: '0 0 0 2px var(--paper)', // 2px white inner border (signature)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ink-2)',
        fontFamily: 'var(--font-ui)',
        fontWeight: 500,
        fontSize: Math.round(size * 0.36),
        letterSpacing: '0.01em',
        flex: '0 0 auto',
        overflow: 'hidden',
      }}
    >
      {!src && initials(name)}
    </div>
  );

  if (!ring) {
    return (
      <span className={`kc-avatar ${className}`} style={{ display: 'inline-flex', ...style }} {...rest}>
        {inner}
      </span>
    );
  }

  const total = size + (gap + ringWidth) * 2;
  return (
    <span
      className={`kc-avatar kc-avatar--${status} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: total,
        height: total,
        borderRadius: '50%',
        border: `${ringWidth}px solid ${ring.color}`,
        background: ring.fill ? ring.color : 'transparent',
        ...(ring.pulse ? { animation: 'kc-ring-pulse 1.6s var(--ease) infinite' } : {}),
        ...style,
      }}
      {...rest}
    >
      <style>{`
        @keyframes kc-ring-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(164,162,153,0.0); }
          50%      { box-shadow: 0 0 0 5px rgba(164,162,153,0.20); }
        }
        @media (prefers-reduced-motion: reduce) {
          .kc-avatar--responding { animation: none !important; }
        }
      `}</style>
      {inner}
    </span>
  );
}
