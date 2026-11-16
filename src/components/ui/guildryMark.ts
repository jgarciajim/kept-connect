/**
 * Guildry mark geometry — "The Join". A heavy, angled G whose left side is two
 * pieces held together by a butterfly key (the woodworking inlay that joins two
 * boards for good): the customer and the pro, joined by trust.
 *
 * Coordinates live in a 0–120 box. The outline is painted with fill + a 5-unit
 * round-joined stroke of the same color, which softens the corners and grows
 * the shape by 2.5 on every side (painted extent ≈ -2.5 … 122.5).
 * Seams are cut with a mask so they stay transparent on any background.
 */
export const G_PATH =
  "M24 0 H110 A10 10 0 0 1 120 10 V38 H90 V23 H39 V96 H90 V76 H63 V51 H120 V108 A10 10 0 0 1 110 118 H24 L0 74 V44 Z";

/** Butterfly key, spanning the horizontal seam through the left side. */
export const KEY_POINTS = "13,46 27,46 21.5,59 27,72 13,72 18.5,59";

/** Seam the key bridges. */
export const SEAM_PATH = "M-6 59 H18.5 M21.5 59 H46";

/** Diagonal cut through the bottom bar. */
export const SLASH_PATH = "M71 123 L82 91";

/** Below this rendered size the joint is a smudge — draw the plain G. */
export const MIN_DETAIL_PX = 24;
