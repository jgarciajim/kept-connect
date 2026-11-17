import { useId, type CSSProperties } from "react";
import { G_PATH, KEY_POINTS, MIN_DETAIL_PX, SEAM_PATH, SLASH_PATH } from "./guildryMark";

/**
 * Guildry mark — "The Join" (see ./guildryMark.ts for the geometry and story).
 * The butterfly key is painted --guild-key only where the mark is terracotta;
 * everywhere else it is a cutout, so the mark always works in one color.
 */
function Mark({
  color,
  keyColor,
  detail,
  maskId,
  transform,
}: {
  color: string;
  keyColor?: string;
  detail: boolean;
  maskId: string;
  transform: string;
}) {
  return (
    <g transform={transform}>
      {detail && (
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="-20" y="-20" width="160" height="160">
            <rect x="-20" y="-20" width="160" height="160" fill="#fff" />
            <path d={SEAM_PATH} fill="none" stroke="#000" strokeWidth={2.6} />
            <polygon points={KEY_POINTS} fill="none" stroke="#000" strokeWidth={2.6} strokeLinejoin="round" />
            <path d={SLASH_PATH} fill="none" stroke="#000" strokeWidth={3.2} />
          </mask>
        </defs>
      )}
      <path
        d={G_PATH}
        fill={color}
        stroke={color}
        strokeWidth={5}
        strokeLinejoin="round"
        mask={detail ? `url(#${maskId})` : undefined}
      />
      {detail && keyColor && <polygon points={KEY_POINTS} fill={keyColor} />}
    </g>
  );
}

export type LogoTreatment = "app-icon" | "on-light" | "on-chrome" | "mono" | "reversed" | "blue";

const TREATMENTS: Record<LogoTreatment, { block: string; mark: string; key?: string }> = {
  "app-icon":  { block: "var(--terracotta-deep)", mark: "var(--cream)" },
  "on-light":  { block: "none",                   mark: "var(--terracotta)", key: "var(--guild-key)" },
  "on-chrome": { block: "var(--chrome)",          mark: "var(--terracotta-bright)" },
  "mono":      { block: "none",                   mark: "var(--ink)" },
  "reversed":  { block: "none",                   mark: "var(--cream)" },
  "blue":      { block: "var(--blue)",            mark: "var(--blue-ink)" },
};

export interface GuildryLogoProps {
  treatment?: LogoTreatment;
  variant?: "mark" | "lockup";
  size?: number;
  orientation?: "horizontal" | "stacked";
  className?: string;
  style?: CSSProperties;
}

export function GuildryLogo({
  treatment = "on-light",
  variant = "mark",
  size = 48,
  orientation = "horizontal",
  className = "",
  style,
}: GuildryLogoProps) {
  const t = TREATMENTS[treatment];
  const hasBlock = t.block !== "none";
  const radius = Math.round(size * 0.27); // squircle ≈ rx32/120
  const maskId = `guildry-key-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  // Fit the mark (painted extent ≈ -2.5…122.5) inside the 108 block, or near-full-bleed without one.
  const transform = hasBlock ? "translate(26.4 27) scale(0.56)" : "translate(6 7) scale(0.9)";

  const markSvg = (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ display: "block", borderRadius: hasBlock ? radius : 0, flex: "0 0 auto" }}
      aria-hidden="true"
    >
      {hasBlock && <rect x="6" y="6" width="108" height="108" rx="32" fill={t.block} />}
      <Mark
        color={t.mark}
        keyColor={t.key}
        detail={size >= MIN_DETAIL_PX}
        maskId={maskId}
        transform={transform}
      />
    </svg>
  );

  if (variant === "mark") {
    return (
      <span className={className} style={{ display: "inline-flex", ...style }}>
        {markSvg}
      </span>
    );
  }

  const wordColor =
    treatment === "reversed" || treatment === "on-chrome"
      ? "var(--cream)"
      : treatment === "blue"
      ? "var(--blue-ink)"
      : "var(--ink)";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: orientation === "stacked" ? "column" : "row",
        alignItems: "center",
        gap: orientation === "stacked" ? size * 0.22 : size * 0.34,
        ...style,
      }}
    >
      {markSvg}
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: Math.round(size * 0.78),
          letterSpacing: "-0.015em",
          lineHeight: 1,
          color: wordColor,
          whiteSpace: "nowrap",
        }}
      >
        Guildry<span style={{ color: "var(--terracotta)" }}>.</span>
      </span>
    </span>
  );
}
