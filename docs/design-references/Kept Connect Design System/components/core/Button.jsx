import React from 'react';

/**
 * Button — the single emerald primary is the one obvious action per surface.
 * Never two primaries on one screen. Emerald means "do something", always.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon = null,
  iconRight = null,
  children,
  className = '',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { fontSize: 13, padding: '8px 14px', height: 36, gap: 6 },
    md: { fontSize: 15, padding: '11px 20px', height: 44, gap: 8 },
    lg: { fontSize: 17, padding: '15px 26px', height: 54, gap: 9 },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    fontSize: s.fontSize,
    lineHeight: 1,
    letterSpacing: '-0.005em',
    borderRadius: 'var(--r-pill)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };

  const variants = {
    primary: {
      background: 'var(--terracotta)',
      color: 'var(--cream)',
    },
    secondary: {
      background: 'var(--paper)',
      color: 'var(--ink)',
      borderColor: 'var(--hairline)',
    },
    // Terracotta outline — the "ghost award" pattern (actionable, quieter)
    outline: {
      background: 'transparent',
      color: 'var(--terracotta)',
      borderColor: 'var(--terracotta)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink-2)',
    },
    // For use on dark chrome surfaces (provider app) — brightened terracotta
    'chrome-primary': {
      background: 'var(--terracotta-bright)',
      color: 'var(--cream)',
    },
    'chrome-ghost': {
      background: 'transparent',
      color: 'var(--chrome-cream)',
      borderColor: 'var(--chrome-line)',
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`kc-btn kc-btn--${variant} ${className}`}
      style={{ ...base, ...(variants[variant] || variants.primary), ...style }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', flex: '0 0 auto' }}>{icon}</span>}
      {children}
      {iconRight && <span style={{ display: 'inline-flex', flex: '0 0 auto' }}>{iconRight}</span>}
    </button>
  );
}
