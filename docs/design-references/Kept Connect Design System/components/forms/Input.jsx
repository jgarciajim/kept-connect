import React from 'react';

/**
 * Input — the composer field. Big touch targets, generous spacing,
 * sentence-case labels that say what they do. Emerald focus ring.
 * Supports single-line and multiline (textarea).
 */
export function Input({
  label = null,
  hint = null,
  multiline = false,
  rows = 3,
  value,
  defaultValue,
  placeholder = '',
  prefix = null,        // leading node (icon or text, e.g. "$")
  align = 'left',       // 'left' | 'right' — right for money/figures
  tabular = false,      // tabular-nums for numeric fields
  disabled = false,
  className = '',
  style = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);

  const fieldStyle = {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--font-ui)',
    fontWeight: 400,
    fontSize: 15,
    lineHeight: 1.5,
    color: 'var(--ink)',
    textAlign: align,
    resize: multiline ? 'vertical' : 'none',
    ...(tabular ? { fontVariantNumeric: 'tabular-nums lining-nums' } : {}),
  };

  const Field = multiline ? 'textarea' : 'input';

  return (
    <label className={`kc-field ${className}`} style={{ display: 'block', ...style }}>
      {label && (
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 13,
            color: 'var(--ink-2)',
            marginBottom: 7,
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          display: 'flex',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 9,
          padding: multiline ? '12px 14px' : '0 14px',
          minHeight: multiline ? 'auto' : 48,
          background: 'var(--paper)',
          border: `1px solid ${focused ? 'var(--terracotta)' : 'var(--hairline)'}`,
          boxShadow: focused ? '0 0 0 3px var(--terracotta-tint)' : 'none',
          borderRadius: 'var(--r-chip)',
          transition: 'border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {prefix && (
          <span style={{ flex: '0 0 auto', color: 'var(--ink-3)', fontFamily: 'var(--font-ui)', fontSize: 15 }}>
            {prefix}
          </span>
        )}
        <Field
          {...(value !== undefined ? { value } : { defaultValue })}
          placeholder={placeholder}
          rows={multiline ? rows : undefined}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={fieldStyle}
          {...rest}
        />
      </span>
      {hint && (
        <span style={{ display: 'block', fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
          {hint}
        </span>
      )}
    </label>
  );
}
