import type { NextRequest } from "next/server";
import Stripe from "stripe";

/**
 * Stripe webhook. Verifies the signature, then reconciles payment events to the
 * `payments` ledger. Public (exempt from Clerk in proxy.ts) — Stripe can't carry
 * a Clerk session. Node runtime so we get the raw request body for verification.
 *
 * Scaffold: signature verification is wired; the DB reconciliation is a TODO for
 * activation (needs a definer/service-role write — webhooks run as no member).
 */
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !secret) return new Response("Stripe not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.amount_capturable_updated": // funds authorized/held
    case "payment_intent.succeeded": // captured → released
    case "payment_intent.canceled": // hold released without charge
      // TODO (activation): reconcile to the payments row via
      // event.data.object.metadata.requestId (mark held/released/refunded).
      break;
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
