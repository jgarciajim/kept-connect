import type { VettingSubject } from "./adapter";

/**
 * Checkr background-check adapter (swap-in stub). Wire the real Checkr flow here:
 * create a candidate, kick off an invitation/report, store the report id as the
 * ref, and a webhook (src/app/api/.../route.ts) flips
 * provider_verifications.bg_status to verified/rejected.
 *
 * Inert until CHECKR_API_KEY is set — the mock adapter runs instead, so this never
 * executes without configuration.
 */
export const checkrAdapter = {
  async startBackgroundCheck(_subject: VettingSubject): Promise<{ ref: string }> {
    throw new Error("Checkr background check not implemented — set CHECKR_API_KEY and wire src/lib/vetting/checkr.ts");
  },
};
