import type { CampaignTheme } from "./campaigns";

/**
 * Campaign theme → art tints.
 *
 * These hex values are DELIBERATELY off-core editorial art tints — soft seasonal
 * washes for campaign card backgrounds and decorative art. They are NOT system
 * tokens, which is exactly why they live here in the requester surface and NOT
 * in globals.css / tokens.css: the core palette is the disciplined product
 * surface; this is the warm marketing layer painted on top of it.
 *
 * Hard rule: nothing here ever colors an action. The CTA, badges' "live" feel,
 * and any interactive element ignore the theme and use var(--terracotta) /
 * var(--terracotta-deep). A theme only tints art and backgrounds.
 */
export interface CampaignThemeStyle {
  heroBg: string; // hero card background (gradient) — used when there's no banner image
  scrim: string; // left wash over a banner image so the headline/CTA stay legible
  kicker: string; // hero/eyebrow text on the themed background
  subtitle: string; // hero subtitle on the themed background
  art: string; // decorative art stroke/fill on the hero
  railBg: string; // rail card image-block background
  railArt: string; // rail card art stroke/fill
}

export const CAMPAIGN_THEMES: Record<CampaignTheme, CampaignThemeStyle> = {
  winter: {
    heroBg: "linear-gradient(135deg,#EAF1F4 0%,#E3EAEE 60%,#DEE7E2 100%)",
    scrim: "#EAF1F4",
    kicker: "#5C7D8A",
    subtitle: "#41555E",
    art: "#9DB7C2",
    railBg: "#E5EAEA",
    railArt: "#5C7D8A",
  },
  fall: {
    heroBg: "linear-gradient(135deg,#F4EADB 0%,#EFE0CC 60%,#ECD9C0 100%)",
    scrim: "#F4EADB",
    kicker: "#9C7B3A",
    subtitle: "#6E5A38",
    art: "#C49A57",
    railBg: "#EDE5D8",
    railArt: "#9C7B3A",
  },
  spring: {
    heroBg: "linear-gradient(135deg,#E9F1E6 0%,#E1EBDC 60%,#DBE8D6 100%)",
    scrim: "#E9F1E6",
    kicker: "#5C7D52",
    subtitle: "#44563E",
    art: "#9DBE8C",
    railBg: "#E7EDE0",
    railArt: "#5C7D52",
  },
  summer: {
    heroBg: "linear-gradient(135deg,#F5ECD9 0%,#F0E2C7 60%,#EDDBB8 100%)",
    scrim: "#F5ECD9",
    kicker: "#A8772E",
    subtitle: "#6E5630",
    art: "#D8B26A",
    railBg: "#EFE6D2",
    railArt: "#A8772E",
  },
  neutral: {
    heroBg: "linear-gradient(135deg,#F0EEE8 0%,#EAE7DF 60%,#E5E2D9 100%)",
    scrim: "#F0EEE8",
    kicker: "#7C7A70",
    subtitle: "#54524A",
    art: "#B8B4AA",
    railBg: "#EFEDE7",
    railArt: "#8C887D",
  },
};
