# Kept Connect — Dispatch & Rate-Card Spec

**Claude Code build brief.** The three dispatch modes, the ranker, and — critically — a rate-card
model designed so providers stay independent contractors, not employees. Companion to
`kept-connect-marketplace.md` (§3 dispatch), `kept-connect-pricing-and-trust.md`, and the schema
sketch there. Classification/licensing notes are flags for counsel, not legal advice.

---

## 0. The guardrail that shapes everything

**The platform must never unilaterally set a provider's price.** If Connect dictates pricing *and*
assignment *and* control, providers can be reclassified as employees (the Uber/Handy/AB5 risk) —
a large liability. Every mechanic below is built so the provider **sets or opts into their own
rates and freely accepts or declines** each offer. This isn't only legal hygiene — it's the same
autonomy that protects supply economics (D10). The two goals point the same way.

**Three independence tests every dispatch mechanic must pass:**
1. **Price autonomy** — the provider set, or affirmatively opted into, the rate being offered.
2. **Accept/decline freedom** — declining carries no penalty that functions as coercion (see §4 on
   how the ranker handles this carefully).
3. **Method autonomy** — the provider controls how the work is done; Connect specifies the
   *outcome and proof*, not the manner of labor.

---

## 1. The three dispatch modes

| Mode | Feels like | Best for | Who sets price |
|---|---|---|---|
| **Instant match** | Uber | small, standardized, urgent | provider's **own pre-set rate** for that job type, or a rate card they opted into |
| **Sealed quote** | a tidy RFP | scoped projects | provider quotes their own price per job |
| **Direct assign** | texting your guy | repeat / favorited | provider's standing rate, requester confirms |

All three run the full in-app money + masked-comms + proof loop (the disintermediation defense).

---

## 2. Instant match — classification-safe round-robin

The hard one to get right, because "platform sets a rate card" is the classification trap. The fix:
**the rate card is provider-defined, not platform-imposed.**

### 2.1 How pricing is set (the safe pattern)
- Each provider, at onboarding, **sets their own rates** per trade and job type (e.g., "$X
  service-call flat," "$Y/hr," "$Z to re-key"). They can update anytime.
- Optionally, Connect publishes a **suggested/benchmark rate** per trade per geo (informational —
  "pros in your area charge $A–$B"). The provider may **opt into** the benchmark with one toggle, or
  set their own. Opting in is an affirmative choice, logged with timestamp + version.
- The instant-match offer is always **at the provider's own accepted rate** — never a number the
  platform forced on them.

> Build note: store the rate as belonging to the provider (`provider_rates`), and log every
> benchmark opt-in as an explicit event. At dispatch, the offered price reads from the provider's
> rate, not a platform table. This record is the classification defense.

### 2.2 The dispatch loop
```
job posted (requester, trade, geo, urgency, job_type)
  → rank eligible providers (§3)
  → offer to provider #1 AT THAT PROVIDER'S OWN RATE for this job_type
     (provider sees job details + the price = their own rate; ACCEPT / DECLINE)
  → on ACCEPT  → job_grant created → scheduled → loop ends
  → on DECLINE or TIMEOUT (e.g., 60–120s) → offer to provider #2 … round-robin
  → if requester's max < provider rate → skip / surface as "quote" instead
```

- **First accept wins.** No bidding, no negotiation, no price race (D10).
- **Requester sees the price before posting** (from the rate card / benchmark range) so there's no
  surprise — and sees the matched provider's full profile **at acceptance** (visibility spec).

### 2.3 Why this stays safe
The provider chose their price, chose to be available, and chose to accept this specific job. The
platform matched and handled money/trust — it didn't set wages or compel work.

---

## 3. The ranker — who gets the offer first

A composite weighted score (v1 can be simple and still feel like magic). **Never lowest price** —
ranking on price trains a race to the bottom and starves supply (D10).

Inputs (weighted):
- rating (two-sided),
- completion / on-time history,
- proximity to the job (coverage, D9),
- current load / availability,
- response speed to past offers,
- credential standing (license/COI current — expiry auto-pauses eligibility).

> Classification caution on "response speed" and "decline" signals: rank on *positive* engagement
> (accept rate, reliability) rather than *punishing* declines in a way that coerces acceptance. A
> provider who declines should not be measurably harmed for exercising the freedom that keeps them
> independent. Tune so declining is genuinely free; surface this to counsel.

v1 = a transparent weighted sum; iterate toward learned weights once there's data.

---

## 4. Sealed quote — for scoped projects

- Requester posts scope + media + window.
- Connect invites **N qualified providers** (ranker-selected) to quote.
- Each returns **price + timeline + scope, sealed** — providers can't see each other's numbers (no
  public auction; prevents the race).
- Requester compares quote cards (provider profile + rating + price + timeline) and **awards one** →
  `job_grant`.

Classification-clean by construction: providers set their own prices entirely.

---

## 5. Direct assign — repeat / favorited

- Requester sends straight to a known/favorited provider at that provider's standing rate.
- Provider accepts/declines; full money + comms + proof loop still runs in-app (keeps the
  relationship in-product — anti-leak lever #3).

---

## 6. Data model deltas (on top of the §5 sketch in the marketplace doc)

```
provider_rates        (provider_id, trade, job_type, rate_type[flat|hourly|per_unit],
                       amount, currency, effective_from)        -- provider-owned pricing
rate_benchmarks       (trade, geo, suggested_low, suggested_high, version)  -- informational only
benchmark_optins      (provider_id, trade, geo, benchmark_version, opted_in_at)  -- audit trail
offers                (job_id, provider_id, offered_rate, rate_source['own'|'benchmark'],
                       status[offered|accepted|declined|expired], offered_at, responded_at)
job_grants            (job_id, provider_id, granted_at)         -- single-provider visibility
ranker_scores         (job_id, provider_id, score, factors_json) -- explainability/audit
```

Keep `offers.rate_source` and `benchmark_optins` — together they prove every offered price traces
to the provider's own choice. That trail is the build-level classification defense.

---

## 7. Edge cases to handle

- **No eligible providers in geo** → return "no coverage" to the requester/partner *before* they
  post (coverage pre-check), so a partner embed never dead-ends thousands of users (§ supply-gating).
- **Provider credential expires mid-pipeline** → auto-drop from eligibility; don't offer.
- **All providers decline** → escalate to sealed-quote, or widen geo radius, or queue for concierge
  match (human-fills-the-gap during seeding).
- **Requester max below all rates** → route to sealed quote (let providers bid their own price) or
  show the benchmark range and let them raise the budget.
- **Same provider, multiple offers** → cap concurrent offers per provider to avoid double-booking.
- **Tie in ranker** → break by response speed then proximity (not price).

---

## 8. Build sequence (smallest safe slice first)

1. **`provider_rates` + onboarding rate entry** — providers set their own prices. (Foundation; the
   classification spine.)
2. **Direct assign** — simplest full loop (money + comms + proof) at the provider's standing rate.
3. **Sealed quote** — invite N, sealed returns, award. (No new pricing risk.)
4. **Instant match** — round-robin at provider rates + the ranker v1. (Only after local supply
   density exists.)
5. **Benchmarks + opt-in** — informational rate guidance, logged opt-ins. (Quality-of-life; keep the
   audit trail.)

---

## 9. Guardrails to put in front of counsel before building §2/§3

- Confirm the **provider-set / opt-in rate-card** structure is sufficient for independent-contractor
  status in your launch jurisdictions.
- Confirm the **ranker's treatment of declines** doesn't create de-facto coercion.
- Confirm **trade-by-trade, jurisdiction-by-jurisdiction licensing** verification gates eligibility
  for regulated trades.
- Confirm the **guarantee** is structured as a partnered insurance product, not self-underwritten.

These are design constraints, not afterthoughts — they shape the rate-card and ranker tables above,
so settle them before §2/§3 get built.

---

## 10. Bottom line

- **Provider-set (or opted-into) pricing + free accept/decline + outcome-not-method control** keeps
  supply independent and protects supply economics — the same design serves both.
- **Instant match** is round-robin *at the provider's own rate*, first-accept-wins, ranked on
  reliability not price.
- **Sealed quote** and **direct assign** are classification-clean by construction.
- The **audit trail** (`provider_rates`, `benchmark_optins`, `offers.rate_source`, `ranker_scores`)
  is what proves it — build it in from the first slice.
- **Coverage pre-check** protects partner embeds from dead-ends; **concierge fallback** fills gaps
  during seeding.

Build the provider-rate foundation and direct-assign loop first; add sealed quote; add instant match
only once a market has real supply density.

---

*Classification and licensing points are flags for legal counsel, not legal advice. Build this with
counsel's sign-off on the rate-card and ranker mechanics before the instant-match path ships.*
