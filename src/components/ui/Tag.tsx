import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/**
 * Tag — quiet descriptive pill. Credentials (Licensed, Insured, Background
 * checked) and trades render as calm --tag-bg pills. Trust facts are
 * *description*, not badges shouting for attention.
 */
type Variant = "default" | "trade" | "status";
type Status = "live" | "verified" | "neutral";

const STATUS_TONES: Record<Status, CSSProperties> = {
  live:     { background: "var(--terracotta-tint)", color: "var(--terracotta-deep)" },
  // Soft emerald tint derived from the token (replaces the reference's #E4F0EA).
  verified: { background: "color-mix(in srgb, var(--verified) 16%, var(--neutral))", color: "var(--verified)" },
  neutral:  { background: "var(--neutral)", color: "var(--ink-2)" },
};

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  status?: Status;
  icon?: ReactNode;
}

export function Tag({ variant = "default", status, icon, children, className = "", style, ...rest }: TagProps) {
  let tone: CSSProperties;
  if (variant === "status" && status) {
    tone = STATUS_TONES[status];
  } else if (variant === "trade") {
    tone = { background: "var(--paper)", color: "var(--ink-2)", boxShadow: "inset 0 0 0 1px var(--hairline)" };
  } else {
    tone = { background: "var(--tag-bg)", color: "var(--tag-ink)" };
  }

  return (
    <span
      className={`kc-tag ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 22,
        padding: "0 10px",
        fontFamily: "var(--font-ui)",
        fontWeight: 500,
        fontSize: 11,
        lineHeight: 1,
        letterSpacing: "0.005em",
        borderRadius: "var(--r-pill)",
        whiteSpace: "nowrap",
        ...tone,
        ...style,
      }}
      {...rest}
    >
      {icon && <span style={{ display: "inline-flex", flex: "0 0 auto" }}>{icon}</span>}
      {children}
    </span>
  );
}
