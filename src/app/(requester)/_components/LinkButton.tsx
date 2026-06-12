import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * LinkButton — requester-local CTA. The shared <Button> renders only a <button>,
 * but most app actions navigate (Award, Rate, View profile, …). So this mirrors
 * Button's token-styled look on a Next <Link>, reusing the lib's `kc-btn` class
 * for the :active press animation. No lib edit, no hardcoded hex.
 *
 * (Mirrors marketing's ButtonLink — both collapse once the shared Button gains an
 * `as`/`asChild` prop, a deferred shared change.)
 */
type Variant = "primary" | "secondary" | "outline" | "ghost";
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

export interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  style,
}: LinkButtonProps) {
  const s = SIZES[size];
  return (
    <Link
      href={href}
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
        textDecoration: "none",
        whiteSpace: "nowrap",
        ...VARIANTS[variant],
        ...style,
      }}
    >
      {children}
    </Link>
  );
}
