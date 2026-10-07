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
- [x] **Scheduled `dispatch_tick()`** on hosted (pg_cron) — DONE 2026-10-07, verified firing every
      minute (`cron.job_run_details` shows successive succeeded runs). The 45s offer timer now sweeps;
      stalled rounds advance. Core match loop is live on hosted.
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
- [x] **Scheduled `recompute_eta_calibration()`** (same pg_cron run, nightly 03:00 UTC) — DONE 2026-10-07.

## Phase 1 — Website & signup (tonight onward)
- [x] **Pros landing page** (`/providers`, "for Pros") — pitch + "Start earning" → sign-up → the
      7-step web onboarding funnel (already complete end-to-end on web).
- [x] **Customers landing** — the `/` home IS the Customers landing: dual CTA (Post a job / I'm a Pro),
      inclusive voice, `ForProviders` supply pitch. Hero/HowItWorks/Footer already use Pros & Customers.
- [x] **Marketing nav/footer** — real links (How it works, For Pros, Sign in, Get started).
- [x] **Terminology pass** in the app shells — audited all `src/**/*.{ts,tsx}` for visible copy;
      fixed 7 stale "provider"→"Pro" strings (empty-state CTA, post hint, live-match headline, Pro
      profile title, admin labels/placeholder, admin-queue name fallback). "homeowners" in the root
      meta is intentional (it enumerates kinds of Customers). Dev-only `/styleguide` left as-is.

## Phase 2 — Backend correctness for a faithful test
- [x] **Admin approval flow** verified — full path proven by pgTAP against local
      (`provider_verification_test` 12/12, `verified_gate_test` 8/8): Pro self-submits → only an admin
      can approve/reject → approval flips `provider_profiles.verified` → the Pro then sees requests,
      can offer, and is dispatch-eligible. UI is wired (`/work/admin` + `/work/you` gate on
      `isCurrentMemberAdmin()`; queue shows signed doc links). **One manual step (George):** no member
      is an admin yet — run `supabase/scripts/grant-admin.sql` once in the hosted SQL Editor to flag
      your own member row `is_admin = true`, or `/work/admin` shows "Not authorized".
- [ ] **Env-gate the demo seed data** (`seed_catalog`, `seed_starter_rates`, dispatch `services`) so
      test data is intentional, not auto-injected. DESIGN CALL pending (George): these are migrations,
      so they run on every environment incl. a future prod. Options: (a) GUC guard
      `current_setting('app.seed_demo', true)`, (b) move to `supabase/seed.sql` (runs on local
      `db reset`, not `db push`), (c) explicit drop-before-prod. Recommend (a) — smallest diff, keeps
      local+pgTAP working. Not done unattended on purpose.
- [x] **`.env.example`** — now tracked (`!.env.example` opt-in); has `MAPBOX_TOKEN`, `GEO_PROVIDER`,
      and the scheduler + service-role-key notes. (commit `f7e8f6b`)
- [x] **mock.ts audit** — both `src/lib/{provider,requester}/mock.ts` are real data layers now
      (every accessor delegates to `./queries.ts` → RLS-scoped Supabase). ONE fixture remains:
      `requester/mock.ts` `getCategoryShortcuts` returns static `CATEGORY_SHORTCUTS` (UI tile config,
      not business data — harmless for the test). Nothing else returns fake data.

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
