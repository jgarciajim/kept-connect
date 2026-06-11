import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

/**
 * ButtonLink — marketing-local CTA. The shared <Button> (src/components/ui)
 * renders only a <button>, but marketing CTAs must be real links (to Clerk's
 * /sign-up, /sign-in). So this mirrors Button's token-styled look on a Next
 * <Link>, and reuses the lib's `kc-btn` class so the :active press animation
 * (defined in ui.css) applies. No lib edit, no hardcoded hex.
 *
 * (The long-term fix is an `as`/`asChild` prop on the shared Button — deferred
 * as a separate, out-of-scope change.)
 */
type Variant = "primary" | "secondary" | "outline";
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
};

export interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  style,
}: ButtonLinkProps) {
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
