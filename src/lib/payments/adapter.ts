/**
 * Payment adapter — the single seam between the app's escrow flow and a real
 * payment provider. Today it's a mock (no external call); swapping in Stripe
 * (PaymentIntent manual-capture + Connect transfers) is a new implementation of
 * this interface plus a webhook — nothing else in the app changes.
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

// The active adapter. Replace with a Stripe adapter once keys + Connect exist.
export const paymentAdapter: PaymentAdapter = mockAdapter;
