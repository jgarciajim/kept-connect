import { stripeAdapter } from "./stripe";

/**
 * Payment adapter — the single seam between the app's escrow flow and a real
 * payment provider. Mock by default; the Stripe implementation (PaymentIntent
 * manual-capture + Connect transfers) lives in ./stripe and is selected by env —
 * nothing else in the app changes.
 */
export interface EscrowInput {
  requestId: string;
  totalCents: number;
}

export interface PaymentAdapter {
  createEscrow(input: EscrowInput): Promise<{ ref: string }>;
  releaseEscrow(ref: string): Promise<void>;
  refundEscrow(ref: string): Promise<void>;
}

const mockAdapter: PaymentAdapter = {
  async createEscrow() {
    return { ref: "mock_" + Math.random().toString(36).slice(2, 12) };
  },
  async releaseEscrow() {},
  async refundEscrow() {},
};

// The active adapter — Stripe when keys are configured, else the mock. No keys →
// today's behavior is byte-for-byte unchanged (the scaffold stays inert).
export const paymentAdapter: PaymentAdapter = process.env.STRIPE_SECRET_KEY ? stripeAdapter : mockAdapter;
