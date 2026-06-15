# Payments

Escrow lives behind one seam: the `PaymentAdapter` interface in `adapter.ts`
(`createEscrow` → hold, `releaseEscrow` → capture, `refundEscrow` → cancel/refund),
consumed by `actions.ts` (`payAndAward` / `releaseAndPay`).

- **`adapter.ts`** — `mockAdapter` + the active selector:
  `paymentAdapter = STRIPE_SECRET_KEY ? stripeAdapter : mockAdapter`.
  No key → **mock** (records the held→released ledger, no real money). This is the default.
- **`stripe.ts`** — the real adapter: a PaymentIntent with `capture_method: 'manual'`
  (authorize = hold, capture = release). Built lazily; never touched without a key.
- **`/api/stripe/webhook`** — signature-verified event endpoint (public; exempt from Clerk in
  `src/proxy.ts`).

## Activating real Stripe (George)

1. Create a Stripe account; enable **Connect** (Express) for provider payouts.
2. Add to `.env.local` (and Vercel project env):
   - `STRIPE_SECRET_KEY` (test key to start, `sk_test_…`)
   - `STRIPE_WEBHOOK_SECRET` (from `stripe listen` or the dashboard endpoint)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_test_…`)
3. Local webhook: `stripe listen --forward-to localhost:3001/api/stripe/webhook`.
4. Restart the app — `paymentAdapter` auto-switches to Stripe (no code change). Test cards drive a real
   authorize → capture against the escrow flow.

## Still TODO to fully wire (the activation follow-up)

These need live Stripe objects and so are stubbed with `TODO` comments:

- **Requester card capture** — confirm the PaymentIntent client-side via Stripe Elements
  (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`); store the `stripe_customer_id` on the requester.
- **Provider payouts** — Connect Express onboarding; store `stripe_account_id`; set
  `application_fee_amount` + `transfer_data.destination` in `createEscrow` so the platform fee/margin
  split routes to the provider's connected account.
- **Webhook → DB** — reconcile `payment_intent.*` events to the `payments` row by
  `metadata.requestId` (a definer/service-role write, since the webhook runs as no member).
- **Refunds UI**.
