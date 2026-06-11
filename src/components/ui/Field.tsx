import type { CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

/**
 * Field — the composer input. Big touch targets, sentence-case labels that say
 * what they do, terracotta focus ring. Focus styling is CSS-only
 * (.kc-field:focus-within in ui.css) so this stays a server component.
 * Supports single-line and multiline (textarea), a leading prefix, and right-
 * aligned tabular figures for money.
 */
export interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: ReactNode;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
  prefix?: ReactNode;
  align?: "left" | "right";
  tabular?: boolean;
}

export function Field({
  label,
  hint,
  multiline = false,
  rows = 3,
  prefix,
  align = "left",
  tabular = false,
  disabled = false,
  className = "",
  style,
  ...rest
}: FieldProps) {
  const fieldStyle: CSSProperties = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-ui)",
    fontWeight: 400,
    fontSize: 15,
    lineHeight: 1.5,
    color: "var(--ink)",
    textAlign: align,
    resize: multiline ? "vertical" : "none",
    ...(tabular ? { fontVariantNumeric: "tabular-nums lining-nums" } : {}),
  };

  return (
    <label className={`kc-field ${className}`.trim()} style={{ display: "block", ...style }}>
      {label && (
        <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 7 }}>
          {label}
        </span>
      )}
      <span
        className="kc-field__control"
        style={{
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          gap: 9,
          padding: multiline ? "12px 14px" : "0 14px",
          minHeight: multiline ? "auto" : 48,
          background: "var(--paper)",
          border: "1px solid var(--hairline)",
          borderRadius: "var(--r-chip)",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {prefix && (
          <span style={{ flex: "0 0 auto", color: "var(--ink-3)", fontFamily: "var(--font-ui)", fontSize: 15 }}>{prefix}</span>
        )}
        {multiline ? (
          <textarea
            rows={rows}
            disabled={disabled}
            style={fieldStyle}
            {...(rest as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input disabled={disabled} style={fieldStyle} {...rest} />
        )}
      </span>
      {hint && <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{hint}</span>}
    </label>
  );
}
