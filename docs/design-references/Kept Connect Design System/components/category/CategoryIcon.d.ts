import * as React from 'react';

export type ServiceFamily =
  | 'water' | 'power' | 'climate' | 'structure'
  | 'surfaces' | 'grounds' | 'care' | 'fixtures';

/**
 * The service-family wayfinding icon — TIER 3 color. Color = which family,
 * glyph = the trade. A neutral chip with a family-colored glyph (never a
 * solid block), so a screen of categories reads calm, not rainbow.
 */
export interface CategoryIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Which of the 8 service families. */
  category?: ServiceFamily;
  /** Chip size in px. Default 46. */
  size?: number;
  /** Brighten the hue + darken the chip for dark provider surfaces. */
  dark?: boolean;
  /** false = bare glyph with no chip surface. Default true. */
  chip?: boolean;
}

export function CategoryIcon(props: CategoryIconProps): JSX.Element;

/** The 8 families: hue, label, glyph name, and example trades. */
export declare const CATEGORIES: Record<ServiceFamily, {
  hue: string; label: string; glyph: string; trades: string;
}>;
