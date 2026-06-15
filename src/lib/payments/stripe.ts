import "server-only";
import Stripe from "stripe";
import type { PaymentAdapter } from "./adapter";

/**
 * Stripe implementation of the PaymentAdapter — escrow as a PaymentIntent with
 * manual capture: createEscrow authorizes/holds, releaseEscrow captures, refund
 * cancels (uncaptured) or refunds. Selected over the mock only when
 * STRIPE_SECRET_KEY is set (see adapter.ts); the client is built lazily so a
 * keyless build/runtime never touches Stripe.
 *
 * Scaffold: the pieces that need live Stripe objects are marked TODO — they're
 * the activation step (see ./README.md), not exercisable without keys + account.
 */
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export const stripeAdapter: PaymentAdapter = {
  async createEscrow({ requestId, totalCents }) {
    const pi = await getStripe().paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      capture_method: "manual", // authorize now, capture on release = escrow hold
      metadata: { requestId },
      // TODO (activation — needs live objects):
      //  - customer + payment_method: the requester confirms via Stripe Elements
      //    client-side; this server-created intent is then confirmed there.
      //  - application_fee_amount + transfer_data.destination = the provider's
      //    Connect account, so the platform fee/margin split routes correctly.
    });
    return { ref: pi.id };
  },

  async releaseEscrow(ref) {
    await getStripe().paymentIntents.capture(ref);
  },

  async refundEscrow(ref) {
    const pi = await getStripe().paymentIntents.retrieve(ref);
    // Uncaptured holds are cancelled; captured charges are refunded.
    if (pi.status === "requires_capture" || pi.status === "requires_confirmation" || pi.status === "requires_payment_method") {
      await getStripe().paymentIntents.cancel(ref);
    } else {
      await getStripe().refunds.create({ payment_intent: ref });
    }
  },
};
