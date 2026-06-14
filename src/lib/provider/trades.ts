import type { CategoryKey } from "@/components/ui";

/**
 * Provider-facing label per trade category (the 8 families). The provider surface
 * displays/edits trades off `provider_profiles.trades` (the category_key[]) keyed
 * through this map — one source of truth for both onboarding and the profile editor.
 */
export const TRADE_LABELS: Record<CategoryKey, string> = {
  water: "Plumbing",
  power: "Electrical",
  climate: "Heating & Cooling",
  structure: "Carpentry & Roofing",
  surfaces: "Painting & Floors",
  grounds: "Yard & Snow",
  care: "Home Care",
  fixtures: "Appliances",
};

export const ALL_TRADES = Object.keys(TRADE_LABELS) as CategoryKey[];
