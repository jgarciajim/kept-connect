# Guildry — Go-Live Plan (private testing)

Living checklist. Goal: a real, usable private test — our starter Pros + a few invited
Customers running the full post → match → do → (mock) pay → rate loop end to end.

## Decisions locked (2026-10-06)
- **Terminology:** supply side = **Pros**, demand side = **Customers** (inclusive of renters,
  owners, property managers, businesses). Replaces "provider"/"homeowner" in all user-facing copy.
- **Payments:** keep the **mock escrow** for this test. Real Stripe Connect is a fast-follow.
- **Audience:** **private** — we seed/vet the starter Pros ourselves; Customers are invite-only.

This descopes (for now): real Stripe, real background checks (Checkr/Stripe Identity), email/SMS,
public abuse-hardening, and the full kept-connect→Guildry code rename.

---

## Phase 0 — Make the core loop actually run (tonight / this week)
- [ ] **Schedule `dispatch_tick()`** on hosted (pg_cron). Today nothing sweeps the 45s offer timer,
      so offers never expire and stalled rounds never advance. THE functional blocker. (~1-min sweep.)
- [x] **Pricing source material is in the repo already** — `docs/kept-pricing-seed.json` (94 services,
      12 categories, mountain config, Connect fee config); the engine `src/lib/pricing/` consumes it
      (`calc.ts` mountainPrice/rateCard, 15 tests green). Nothing was missing — it's JSON, not .xlsx.
- [x] **Starter-Pro rates seeded** (migration `20260701130000`, on hosted 2026-10-06) — 24 flat
      sub-job rates across the 4 Pros at the mountain benchmark, so "near you" estimates + quote
      pricing are realistic. Needed for quotes/estimates, not for instant dispatch.
- [x] **Rate-editor economics** — `/work/rates` + onboarding now show suggested benchmark + "you
      keep / Customer pays" per flat price (commit `db9505f`).
- [x] **Starter Pros are live** — seed sets verified + online; they're dispatchable for instant jobs
      in their trades once the tick runs.
- [ ] **Classification flag (counsel, not tonight):** instant dispatch currently offers at the
      platform's `services.base_price`, not the Pro's own rate — the dispatch spec §0–2 says the
      platform must never set the price. Fast-follow: route instant pricing through `provider_rates`.
- [ ] **Schedule `recompute_eta_calibration()`** (same pg_cron handoff; low priority, daily).

## Phase 1 — Website & signup (tonight onward)
- [ ] **Pros landing page** (`/providers`, "for Pros") — pitch + "Start earning" → sign-up → the
      7-step web onboarding funnel (already complete end-to-end on web).
- [ ] **Customers landing** — reframe `/` home copy around Customers; clear dual CTA (Get help / Join
      as a Pro). Terminology: Pros & Customers throughout Hero/HowItWorks/Footer.
- [ ] **Marketing nav/footer** — real links (How it works, For Pros, Sign in, Get started).
- [ ] **Terminology pass** in the app shells (labels that say "provider"/"homeowner" in UI copy).

## Phase 2 — Backend correctness for a faithful test
- [ ] **Admin approval flow** usable (`/work/admin`) — Pros submit → we approve → live. Confirm it
      works against hosted for the starter Pros.
- [ ] **Env-gate the demo seed data** (`seed_catalog`, dispatch `services`) so test data is
      intentional, not auto-injected.
- [ ] **`.env.example`** — add `MAPBOX_TOKEN`, `GEO_PROVIDER`, and note the scheduler + service-role
      key needs.
- [ ] **mock.ts audit** — confirm which `mock.ts` exports still return fixtures vs. hit the DB.

## Phase 3 — Fast-follows (after the test proves the loop)
- [ ] Real **Stripe Connect** (authorize/capture + Express payouts + webhook reconciliation).
- [ ] Real **vetting** (Checkr background + Stripe Identity) replacing manual admin approval.
- [ ] **Transactional email/SMS** (offers, awards, approvals) — pick a provider (Resend/Postmark).
- [ ] **kept-connect → Guildry** rename sweep (titles, logo, footer, onboarding copy).
- [ ] Public-beta hardening (abuse guards, rate limits, open signup).

---

## Tonight's targets
1. Pros & Customers landing pages + nav/terminology (Phase 1).
2. Schedule `dispatch_tick` on hosted (Phase 0 — unblocks the match loop).
3. Starter-Pro rates — once the Drive sheet is confirmed.
