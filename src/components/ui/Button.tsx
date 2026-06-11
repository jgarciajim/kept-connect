import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

/**
 * Button — the single terracotta primary is the one obvious action per surface.
 * Never two primaries on one screen; terracotta always means "do something".
 * Dark (provider) styling is handled by the <Surface tone="dark"> token remap,
 * so there are no separate chrome variants here.
 */
type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { fontSize: number; padding: string; height: number; gap: number }> = {
  sm: { fontSize: 13, padding: "8px 14px", height: 36, gap: 6 },
  md: { fontSize: 15, padding: "11px 20px", height: 44, gap: 8 },
  lg: { fontSize: 17, padding: "15px 26px", height: 54, gap: 9 },
};

const VARIANTS: Record<Variant, CSSProperties> = {
  primary:   { background: "var(--terracotta)", color: "var(--cream)" },
  secondary: { background: "var(--paper)", color: "var(--ink)", borderColor: "var(--hairline)" },
  outline:   { background: "transparent", color: "var(--terracotta)", borderColor: "var(--terracotta)" },
  ghost:     { background: "transparent", color: "var(--ink-2)" },
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  icon,
  iconRight,
  children,
  className = "",
  style,
  type = "button",
  ...rest
}: ButtonProps) {
  const s = SIZES[size];
  return (
    <button
      type={type}
      disabled={disabled}
      className={`kc-btn ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        width: fullWidth ? "100%" : "auto",
        fontFamily: "var(--font-ui)",
        fontWeight: 500,
        fontSize: s.fontSize,
        lineHeight: 1,
        letterSpacing: "-0.005em",
        borderRadius: "var(--r-pill)",
        border: "1px solid transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        whiteSpace: "nowrap",
        userSelect: "none",
        ...VARIANTS[variant],
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: "inline-flex", flex: "0 0 auto" }}>{icon}</span>}
      {children}
      {iconRight && <span style={{ display: "inline-flex", flex: "0 0 auto" }}>{iconRight}</span>}
    </button>
  );
}
