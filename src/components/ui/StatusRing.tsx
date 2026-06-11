import type { CSSProperties, ReactNode } from "react";

/**
 * StatusRing — the activity ring of the circular-assignment language, wrapping
 * an Avatar (or any node) with a marketplace status ring:
 *   responding — neutral --ink-3 ring, gently pulsing (searching the network)
 *   quoted     — --terracotta ring
 *   awarded    — --terracotta filled ring
 * The pulse is CSS-only (.kc-ring--responding in ui.css) and respects
 * prefers-reduced-motion. state="none" renders children with no ring.
 */
export type RingState = "none" | "responding" | "quoted" | "awarded";

const RINGS: Record<Exclude<RingState, "none">, { color: string; fill: boolean; pulse?: boolean }> = {
  responding: { color: "var(--ink-3)", fill: false, pulse: true },
  quoted:     { color: "var(--terracotta)", fill: false },
  awarded:    { color: "var(--terracotta)", fill: true },
};

export interface StatusRingProps {
  state?: RingState;
  /** Size of the inner content (match the wrapped Avatar's size). */
  size?: number;
  /** Ring thickness; defaults to ~6% of size (min 2px). */
  width?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function StatusRing({ state = "none", size = 44, width, className = "", style, children }: StatusRingProps) {
  if (state === "none") return <>{children}</>;

  const ring = RINGS[state];
  const ringWidth = width ?? Math.max(2, Math.round(size * 0.06));
  const gap = ringWidth + 3; // ring sits outside a small gap
  const total = size + (gap + ringWidth) * 2;

  return (
    <span
      className={`kc-ring ${ring.pulse ? "kc-ring--responding" : ""} ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: total,
        height: total,
        borderRadius: "50%",
        border: `${ringWidth}px solid ${ring.color}`,
        background: ring.fill ? ring.color : "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
