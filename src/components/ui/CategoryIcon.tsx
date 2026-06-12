import type { CSSProperties, ReactElement } from "react";

/**
 * CategoryIcon — the service-family wayfinding system (TIER 3 color).
 * Color groups trades into 8 families; the glyph identifies the trade.
 * Rendered the Uber way: a NEUTRAL chip surface with a family-colored glyph
 * (never a solid color block), so a wall of categories reads calm.
 *
 * Tints are derived with color-mix() from the --cat-* tokens, and dark
 * brightening is handled by the <Surface tone="dark"> remap — so this
 * component holds no hex and needs no `dark` prop.
 */
export type CategoryKey =
  | "water" | "power" | "climate" | "structure"
  | "surfaces" | "grounds" | "care" | "fixtures";

export const CATEGORIES: Record<CategoryKey, { label: string; glyph: GlyphKey; trades: string }> = {
  water:     { label: "Water",     glyph: "droplet", trades: "Plumbing · drains · water heater · pool & spa" },
  power:     { label: "Power",     glyph: "bolt",    trades: "Electrical · lighting · solar · EV charger" },
  climate:   { label: "Climate",   glyph: "wind",    trades: "HVAC · ventilation · insulation" },
  structure: { label: "Structure", glyph: "wall",    trades: "Carpentry · framing · drywall · roofing · masonry" },
  surfaces:  { label: "Surfaces",  glyph: "roller",  trades: "Painting · flooring · tile · wallpaper" },
  grounds:   { label: "Grounds",   glyph: "leaf",    trades: "Landscaping · tree work · snow removal · fencing" },
  care:      { label: "Care",      glyph: "sparkle", trades: "Cleaning · junk & haul · pest · pressure wash" },
  fixtures:  { label: "Fixtures",  glyph: "key",     trades: "Handyman · locksmith · appliance · garage · smart home" },
};

type GlyphKey = "droplet" | "bolt" | "wind" | "wall" | "roller" | "leaf" | "sparkle" | "key";

const GLYPHS: Record<GlyphKey, ReactElement> = {
  droplet: <path d="M12 3.5C12 3.5 6.5 9.5 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.5 12 3.5 12 3.5z" />,
  bolt:    <path d="M13 3 6.5 13H11l-.5 8 7-10.5H12.5z" />,
  wind:    <><path d="M4 9h10a2.4 2.4 0 1 0-2.4-2.4" /><path d="M4 14h14a2.4 2.4 0 1 1-2.4 2.4" /></>,
  wall:    <><rect x="3" y="5.5" width="8" height="5" rx="1" /><rect x="13" y="5.5" width="8" height="5" rx="1" /><rect x="8" y="13" width="8" height="5" rx="1" /></>,
  roller:  <><rect x="4.5" y="5" width="12" height="6" rx="2.2" /><path d="M10.5 11v3.2h-3V20" /></>,
  leaf:    <><path d="M5.5 18.5C5.5 10.5 11 5 19 5c0 8-5.5 13.5-13.5 13.5z" /><path d="M6 18C10 14 14 10 18 6.5" /></>,
  sparkle: <path d="M12 4l1.6 5.4L19 11l-5.4 1.6L12 18l-1.6-5.4L5 11l5.4-1.6z" />,
  key:     <><circle cx="8" cy="9" r="3.2" /><path d="M10.3 11.3 19 20M16 17l2-2" /></>,
};

export interface CategoryIconProps {
  category?: CategoryKey;
  size?: number;
  /** false = bare glyph, no chip surface. */
  chip?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function CategoryIcon({ category = "water", size = 46, chip = true, className = "", style }: CategoryIconProps) {
  const cat = CATEGORIES[category];
  const hue = `var(--cat-${category})`;
  const glyphSize = Math.round(size * 0.5);

  const svg = (
    <svg
      width={chip ? glyphSize : size}
      height={chip ? glyphSize : size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={hue}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[cat.glyph]}
    </svg>
  );

  if (!chip) {
    return (
      <span className={`kc-cat ${className}`.trim()} title={cat.label} style={{ display: "inline-flex", ...style }}>
        {svg}
      </span>
    );
  }

  return (
    <span
      className={`kc-cat kc-cat--${category} ${className}`.trim()}
      title={cat.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: `color-mix(in srgb, ${hue} var(--cat-chip-mix), var(--neutral))`,
        flex: "0 0 auto",
        ...style,
      }}
    >
      {svg}
    </span>
  );
}
