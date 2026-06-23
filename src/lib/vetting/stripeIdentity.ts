import type { VettingSubject } from "./adapter";

/**
 * Stripe Identity adapter (swap-in stub). Wire the real flow here: create a
 * VerificationSession, return its id as the ref, and a webhook flips
 * provider_verifications.id_status to verified/rejected.
 *
 * Inert until configured — the mock adapter runs instead.
 */
export const stripeIdentityAdapter = {
  async startIdVerification(_subject: VettingSubject): Promise<{ ref: string }> {
    throw new Error("Stripe Identity not implemented — wire src/lib/vetting/stripeIdentity.ts");
  },
};
