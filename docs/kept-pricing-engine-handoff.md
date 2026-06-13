# Kept — Pricing & Rate-Card Engine
**Claude Code handoff. Ships with `kept-pricing-seed.json` (import it — it's the data).**

This builds the **pricing core**: a service catalog, a market-adjustment layer, an STR turnover
calculator, and the Connect rate-card economics engine. It runs as an admin/calculator surface and
slots into the multi-tenant DB later.

> **Scope — read first.** This is the pricing engine, *not* the whole marketplace. In scope:
> catalog, market config, turnover tiers, rate-card math, and the screens to drive them. **Out of
> scope (separate specs):** dispatch/ranker, provider vetting, two-sided accounts, Stripe rails,
> the push-to-Connect bridge. Build this as a self-contained module so it's demoable now and wires
> into Connect's job objects later. Don't scaffold marketplace/auth here.

---

## 1. Fits the platform

- **Stack (match existing):** Next.js + Vercel · Supabase (Postgres + RLS) · Prisma · Express API.
  See `PROJECT.md`. Don't introduce new infra.
- **D8 — one engine, service lines are configuration.** Pricing is config on the shared engine, not
  per-line code. Every service is a catalog row with a `billingBasis`; adding a line = adding rows,
  not modules.
- **D1 — multi-tenant.** Every business table carries `org_id` with RLS. Catalog defaults are global
  (org-null = platform template); a tenant's overrides are org-scoped. Follow `kept_schema.sql`.
- **Design system (match `kept-design-brief`):** paper & chrome tokens, emerald = action only,
  Fraunces page titles (end with an emerald period, e.g. `Pricing.`), Hanken Grotesk for UI/data,
  tabular nums right-aligned on money, the radius ladder, no cream on working surfaces. Reuse the
  existing token file — no hard-coded hexes.

---

## 2. Data model (Prisma)

All money in **USD cents (integer)** to avoid float drift. Percentages as decimals (0.12).
Org-scoped tables get `orgId` + RLS; catalog templates may be global (`orgId` null).

```prisma
enum BillingBasis { FLAT HOURLY PER_SQFT PER_UNIT PER_INCH SEASONAL RECURRING_MONTHLY RECURRING_ANNUAL }
enum FeeMode { SEED MATURE }

model ServiceCategory {
  id    String        @id @default(uuid())
  name  String        @unique          // "Cleaning", "Snow & ice", ...
  sort  Int           @default(0)
  services ServiceType[]
}

model ServiceType {                    // the catalog item
  id              String       @id @default(uuid())
  orgId           String?                          // null = platform template; set = tenant override
  slug            String
  categoryId      String
  category        ServiceCategory @relation(fields: [categoryId], references: [id])
  name            String
  unit            String                           // display: "per visit", "per sq ft"
  billingBasis    BillingBasis
  nationalLow     Int                              // cents
  nationalTypical Int
  nationalHigh    Int
  mountainBump    Boolean      @default(false)     // snow / roof / hard access
  notes           String?
  active          Boolean      @default(true)
  @@unique([orgId, slug])
  @@index([orgId, categoryId])
}

model MarketConfig {                   // per org (or global default)
  id             String  @id @default(uuid())
  orgId          String?  @unique
  mountainFactor Float   @default(1.40)            // x national
  snowAccessBump Float   @default(0.20)            // added when mountainBump = true
}

model ConnectFeeConfig {              // the rate-card economics, per org, per mode
  id                    String  @id @default(uuid())
  orgId                 String?
  mode                  FeeMode @default(SEED)
  requesterServiceFeePct Float  @default(0.10)
  providerCommissionPct  Float  @default(0.00)
  paymentsMarginPct      Float  @default(0.025)
  @@unique([orgId, mode])
}

model StrTurnoverTier {
  id        String @id @default(uuid())
  orgId     String?
  size      String                                 // "Studio".."5+ bedroom"
  beds      Int
  baths     Float
  low       Int
  typical   Int
  high      Int
  sort      Int    @default(0)
  notes     String?
}

model StrSetting { id String @id @default(uuid()); orgId String? @unique; deepCleanMultiplier Float @default(2.0) }

model StrAddOn { id String @id @default(uuid()); orgId String?; name String; unit String; low Int; typical Int; high Int; notes String? }
```

Seed all of the above from **`kept-pricing-seed.json`** (a `prisma/seed.ts` that reads it; convert
dollars → cents). 94 services, 6 turnover tiers, 5 add-ons, default configs are all in there.

---

## 3. The calculation engine (pure functions — match these exactly)

Put in `lib/pricing/`. These mirror the workbook formulas one-to-one; keep them deterministic and
unit-tested. Work in cents internally.

```ts
// market adjustment
mountainPrice(national, { mountainFactor, snowAccessBump }, mountainBump) =
  round(national * (mountainFactor + (mountainBump ? snowAccessBump : 0)))

// STR
deepClean(turnover, deepCleanMultiplier) = round(turnover * deepCleanMultiplier)

// Connect rate card — base = the provider's price (their entered rate, else mountain typical)
rateCard(base, { requesterServiceFeePct, providerCommissionPct, paymentsMarginPct }) => {
  providerPayout = round(base * (1 - providerCommissionPct))
  requesterFee   = round(base * requesterServiceFeePct)
  requesterAllIn = base + requesterFee
  connectTake    = requesterAllIn - providerPayout      // = fee + commission
  connectTakePct = connectTake / requesterAllIn          // NOTE: % of all-in, not of base
  paymentsMargin = round(requesterAllIn * paymentsMarginPct)
  connectNet     = connectTake + paymentsMargin
  return { providerPayout, requesterFee, requesterAllIn, connectTake, connectTakePct,
           paymentsMargin, connectNet }
}
```

**Worked check (must reproduce):** base $280, seed config (fee 10%) → requesterAllIn $308,
connectTake $28 = **9.1% of all-in**, paymentsMargin $7.70, connectNet $35.70. With the workbook's
12% fee: allIn $313.60, take 10.7%, net $41.44. (Take % reads below the headline fee % on purpose —
it's expressed against the all-in. Surface both.)

**Price basis rule (catalog → rate card):** a service's working "base" =
`tenantOverridePrice ?? mountainPrice(nationalTypical, marketConfig, mountainBump)`. So the app shows
real mountain-adjusted numbers immediately and auto-switches to the tenant's own price once entered.

---

## 4. API (Express)

Thin, org-scoped, RLS-backed. Minimum:

- `GET /catalog` → categories + services (with computed `mountainTypical`).
- `PATCH /catalog/:id` → tenant override (price, active). Writes an org-scoped `ServiceType`.
- `GET /market-config` · `PATCH /market-config` → mountain factor + bump.
- `GET /fee-config?mode=seed|mature` · `PATCH /fee-config`.
- `POST /rate-card` → body: list of `{ serviceId, base? }` → returns each row run through `rateCard()`.
- `GET /str/turnover` → tiers + deep-clean column + add-ons (mountain-adjusted).
- `POST /quote` → body: `{ lines: [{ serviceId, qty }], feeMode }` → returns line totals + a
  Connect fee breakdown (provider payout, requester all-in, connect net) for the whole quote.

---

## 5. Screens (the functional app)

Four screens, all on the design tokens. Titles in Fraunces with the emerald period.

1. **`Pricing.`** — the catalog. Paper table on canvas, grouped by category, ribbon-free. Columns:
   service · unit · national L/T/H · **mountain typical** (computed) · **your price** (editable
   input). One mountain-factor control at the top (emerald-accented). Editing "your price" writes a
   tenant override. This is the operator's pricing home.
2. **`Rate card.`** — the live economics table from §3. Three editable assumption chips (fee %,
   commission %, payments margin %) + a SEED/MATURE toggle. Columns: provider base · payout ·
   requester fee · requester pays · connect take $ · take % · net/job. Tabular, right-aligned.
3. **`Turnover.`** — STR calculator. Pick a size tier (or enter beds/baths) → show turnover (mtn),
   deep clean (× multiplier), and selectable add-ons; sum to a per-turn total. Editable deep-clean
   multiplier. This is the core-line tool.
4. **`Quote.`** — estimate builder. Add catalog services + quantities → subtotal, then the Connect
   breakdown (what the requester pays, what the provider nets, Connect net). One emerald primary
   action ("Create quote"). Read-only PDF/share later.

Keep it quiet: emerald only on actions and editable figures; money tabular; no cream on the table
surface; hairline under the header only.

---

## 6. Build sequence (smallest functional slice first)

1. Prisma schema + `seed.ts` from the JSON (dollars→cents). Verify counts: 94 services, 6 tiers.
2. `lib/pricing/` pure functions + unit tests against the §3 worked checks.
3. `GET /catalog` + the **`Pricing.`** screen (read-only, computed mountain column). ← first demo.
4. Tenant price override (editable "your price") + `PATCH /catalog`.
5. **`Rate card.`** screen + `/rate-card` + `/fee-config` (SEED/MATURE toggle).
6. **`Turnover.`** screen + `/str/turnover`.
7. **`Quote.`** builder + `/quote`.

Step 3 already gives George a working, demoable pricing app.

---

## 7. Confirm before/while building

- **Money in cents** everywhere (no floats for currency). Percentages stay floats.
- **Global vs tenant catalog:** ship platform templates (orgId null); tenant edits create org-scoped
  overrides — don't mutate the templates. Confirm this is the resolution layer you want.
- **Auth (D3, still open):** this module needs only "current org" context; don't build auth here —
  stub `getOrgId()` and wire to the real provider (Clerk vs Supabase Auth) once D3 lands.
- **Rate-card placement:** the economics are the *Connect* layer. Build the calculator now as pure
  functions; when Connect's job objects exist, the same functions run per job. Keep them framework-free.
- **Seed values are planning baselines, not quotes** (`_meta` in the JSON). Surface that in the UI
  near the national columns.

---

*Ships with `kept-pricing-seed.json`. Source ranges: national 2026 cost guides (Angi, HomeGuide,
HomeAdvisor, Housecall Pro, Fixr, Thumbtack, This Old House), aggregated typical ranges — planning
baselines, not quotes or advice.*
