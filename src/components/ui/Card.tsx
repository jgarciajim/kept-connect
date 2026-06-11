import type { CSSProperties, HTMLAttributes } from "react";

/**
 * Card — the surface primitive.
 *   tone="paper"  clean data surface (quotes, prices, stats, history).
 *   tone="moment" warm cream, HUMAN MOMENTS ONLY (hero, onboarding,
 *                 confirmation, empty states) — never numbers on a moment card.
 *   tone="canvas" the app background tone, for nested fills.
 * The dark provider surface comes from <Surface tone="dark">, not a tone here.
 *
 * Panel = a Card on the larger --r-lg radius rung (heroes, sheets, panels).
 */
type Tone = "paper" | "moment" | "canvas";

const TONES: Record<Tone, CSSProperties> = {
  paper:  { background: "var(--paper)",  color: "var(--ink)", border: "1px solid var(--hairline)" },
  moment: { background: "var(--moment)", color: "var(--ink)", border: "1px solid transparent" },
  canvas: { background: "var(--canvas)", color: "var(--ink)", border: "1px solid var(--hairline)" },
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  lift?: boolean;
  padding?: number | string;
  radius?: string;
}

export function Card({
  tone = "paper",
  lift = false,
  padding = 20,
  radius = "var(--r-card)",
  children,
  className = "",
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={`kc-card ${className}`.trim()}
      style={{
        position: "relative",
        borderRadius: radius,
        padding,
        boxShadow: lift ? "var(--shadow-card)" : "none",
        overflow: "hidden",
        ...TONES[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Panel({ radius = "var(--r-lg)", padding = 24, className = "", ...rest }: CardProps) {
  return <Card radius={radius} padding={padding} className={`kc-panel ${className}`.trim()} {...rest} />;
}
