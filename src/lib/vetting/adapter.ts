import { checkrAdapter } from "./checkr";
import { stripeIdentityAdapter } from "./stripeIdentity";

/**
 * Vetting adapter — the single seam between onboarding and the real identity /
 * background-check providers. Mock by default; Checkr (background check) + Stripe
 * Identity (ID verification) implementations live in ./checkr and ./stripeIdentity
 * and are selected by env. Mirrors the payments adapter (src/lib/payments/adapter.ts).
 *
 * The mock returns a placeholder ref and leaves bg/id status 'pending' — NOTHING is
 * asserted as verified. Approval today is the admin's human review in /work/admin;
 * the real adapters + webhooks flip provider_verifications.bg_status/id_status later.
 */
export interface VettingSubject {
  memberId: string;
  legalFirstName: string;
  legalLastName: string;
  dob: string | null; // ISO date
}

export interface VettingAdapter {
  startBackgroundCheck(subject: VettingSubject): Promise<{ ref: string }>;
  startIdVerification(subject: VettingSubject): Promise<{ ref: string }>;
}

const mockAdapter: VettingAdapter = {
  async startBackgroundCheck() {
    return { ref: "mock_bg_" + Math.random().toString(36).slice(2, 12) };
  },
  async startIdVerification() {
    return { ref: "mock_id_" + Math.random().toString(36).slice(2, 12) };
  },
};

// Real providers compose in when keys are configured. No keys → the mock runs and
// the scaffold stays inert (today's behavior is unchanged).
const realAdapter: VettingAdapter = {
  startBackgroundCheck: (s) => checkrAdapter.startBackgroundCheck(s),
  startIdVerification: (s) => stripeIdentityAdapter.startIdVerification(s),
};

export const vettingAdapter: VettingAdapter = process.env.CHECKR_API_KEY ? realAdapter : mockAdapter;
