# Kept Connect — Design Direction & System

**Handoff brief for Claude Design & Claude Code.** Single source of truth for the visual language of **Kept Connect** — the standalone, open marketplace app ("Uber for getting things done at a property"). It is the **sibling** to `kept-design-brief.md` (the Kept ops tool): Connect inherits that system's *structure* wholesale and runs its own *color identity* and *temperature* on top. When a decision isn't here, inherit the ops brief; when the two could conflict, the rules in §1.4 (color) and §1.2 (warmth budget) decide.

> Read the ops brief first for the shared spine (surface tokens, radius ladder, circular assignment, type discipline). This document does not re-print those — it uses them, and replaces only the brand/accent system with Connect's own.

---

## 0. North star — the feeling

The ops tool is a **work surface**: clean, fast, deferential. Connect is for **homeowners, realtors, PMs, and self-hosts** — people, not operators — so it carries one quality the ops tool withholds: **it has to feel inviting.** You should *want* to open it.

Connect's job is to make "get someone trustworthy to my property" feel like ordering a car: **post → matched → done → paid → rated**, zero friction, zero money-handling. Three feelings drive every decision:

1. **Effortless.** Post in under a minute. One obvious action per screen.
2. **Reassuring.** A stranger is coming to a home. Every surface should quietly signal *this person is vetted, this is handled, your money is safe.* Trust is the product (§2.2).
3. **Warm, but disciplined.** Connect carries brand warmth the ops tool won't — but only in the human moments, never on the data (§1.2).

**Same hand, different room.** A person who uses Connect and later touches Kept ops must feel the same designer made both. The resemblance lives in the *structure and craft*, not the color — which is exactly how Connect can have its own identity and still read as family.

---

## 1. Foundations

### 1.1 What Connect inherits — and what it replaces

**Inherits verbatim** from `kept-design-brief.md`: the surface tokens (`--canvas` `--paper` `--hairline` `--ink/-2/-3`), the chrome tokens, the **radius ladder** (`--r-chip` 10 → `--r-pill` 999, continuous corners where supported), the **type system** (Fraunces + Hanken Grotesk, weights 400/500, sentence case, tabular money), and the **circular-assignment language** (tinted avatars, white inner border, activity-ring status).

**Replaces:** the brand/accent system. The ops tool's "emerald = action" rule does **not** carry over. Connect has its own color identity (§1.4), and emerald is demoted to a single semantic role (verified). Everything structural is shared; everything brand is Connect's own.

### 1.2 The warmth budget — where warmth is allowed

The ops rule is *warmth lives in the chrome; the working surface stays clean paper.* Connect relaxes this in **one controlled way** and holds it everywhere else:

- **Warmth is permitted on human moments** — onboarding, the post-a-job hero, live-match status, confirmations, empty states, marketing. These may use the warm `--moment` surface and larger expressive type.
- **Data still defers, on clean paper** — quotes, prices, provider stats, payment records, history. Anything read *to decide* stays on `--paper`, near-monochrome, tabular.

The test: **welcoming someone, or informing them?** Welcoming → warmth allowed. Informing → clean paper. Never warm-wash a surface carrying numbers.

```
--moment   #F2ECDF   warm cream for human moments ONLY (hero, onboarding,
                      confirmation, empty states, marketing). NEVER behind data.
```

### 1.3 Two temperatures inside Connect

Connect is two apps at two temperatures, on purpose:

- **The requester app** (homeowner / realtor / PM / self-host) — the **warm** one. Light surfaces, the full warmth budget, friendly voice, spacious. Where §0 lives.
- **The provider app** (the trades — the Uber-driver analog) — the **cool** one. A work tool, close sibling to the ops cleaner app: **dark chrome**, dense cards, one terracotta action per state, fast-pay always reachable. Barely touches the warmth budget. A provider wants speed, not hospitality.

Same mark, same color logic, same ladder across both — only density, voice, warmth, and light/dark differ. On the provider app's dark chrome, brighten the brand and verified colors (§1.4) for legibility.

### 1.4 Color — the three-tier system

Connect runs **Uber-style structural discipline**: the chrome is black-and-white, and **color only ever appears when it carries meaning.** Color works in exactly three tiers, each with one job:

```
TIER 1 — BRAND / ACTION  (terracotta)
--terracotta        #BD5E39   brand + every primary action + the live/active state
--terracotta-deep   #A8502F   app-icon block, pressed states
--terracotta-bright #CF6E45   the same role on DARK chrome (provider app)

TIER 2 — VERIFIED / TRUST  (emerald — semantic, reserved)
--verified          #2C8A63   the verified check + "safe" affirmations, NOTHING else
--verified-bright   #57B98E   verified on DARK chrome

TIER 3 — CATEGORY / WAYFINDING  (the service-family palette, §1.5)
--cat-*                       only ever on trade icons, to say "which trade"

NEUTRAL BASE (inherited)
--canvas #F6F4EF · --paper #FFFFFF · --ink/-2/-3 · chrome tokens
```

**Rules**
- **Terracotta = brand and do-this.** If it's terracotta, it's the brand or it's actionable. Never decorative.
- **Emerald = verified, and only verified.** Trust is a universal signal, so it follows convention (green) rather than brand. Reserve it — see §1.5.
- **Everything else is black and white.** A typical surface is near-monochrome; color is an event. This restraint is what keeps the app calm as trades multiply.
- **On dark (provider app):** use the `-bright` variants so terracotta and verified read against chrome.

*(Open marketing decision: the legacy brand blue `#1C4471/#92B5DF` may appear on the marketing site only — never in the product. Decide at marketing build; it doesn't affect the app.)*

### 1.5 Category color — service families

You cannot give every trade its own distinguishable muted color, and trying makes the UI noisy. So color groups trades into **eight service families**; the **icon glyph** identifies the specific trade. Color = coarse grouping, glyph = the trade. Any new trade slots into a family — no new color.

```
--cat-water     #2E6FB0   Plumbing · drains · water heater · pool & spa
--cat-power     #E0A12E   Electrical · lighting · solar · EV charger
--cat-climate   #2C8A8A   HVAC · ventilation · insulation
--cat-structure #4E6378   Carpentry · framing · drywall · roofing · masonry
--cat-surfaces  #6B5BD0   Painting · flooring · tile · wallpaper
--cat-grounds   #6F8F3F   Landscaping · tree work · snow removal · fencing
--cat-care      #A86A86   Cleaning · junk & haul · pest · pressure wash
--cat-fixtures  #7B7064   Handyman · locksmith · appliance · garage · smart home
```

- **Chips are a neutral surface with a family-colored glyph** (not a solid color block) — so a screen of categories reads calm, never rainbow.
- **Reserved:** terracotta and emerald **never** appear as a category color, or they'd lose their meaning. The category palette deliberately excludes both.

### 1.6 Typography — same faces, used more generously

Same Fraunces + Hanken pairing, but Connect spends Fraunces more freely than ops:

- **Fraunces leads the human moments** — the composer greeting ("What needs doing?"), status headlines ("On the way"), onboarding, confirmations.
- **The signature period flourish carries over,** now set in `--terracotta` (e.g. `Booked.`).
- **Scale runs a touch larger and airier** in the requester app; the provider app keeps the tighter ops scale.
- Data type unchanged: Hanken, tabular, right-aligned money, quiet `--ink-3` headers.

### 1.7 The mark — the "K-link" (locked: dispatch fan-out)

The house-K reimagined as a dispatcher: a geometric K whose three arms fire outward from the vertex into chevron arrowheads — *one request dispatched to many providers.* Sibling to the ops house-K; same block, same weight discipline, same soft round-cap geometry.

**Geometry (locked).** `viewBox 0 0 120 120`.

```
Block:  rounded square, rect x6 y6 w108 h108, rx 32 (squircle / corner-shape: superellipse)
K+fan:  stroke 9.5, round caps+joins
  stem    M38 30 V90
  arm up  M38 60 L82 36
  arm mid M38 60 L86 60
  arm low M38 60 L82 84
Arrows: chevrons, stroke 8.5, round caps+joins
  up   M77.45 46.46 L82 36 L70.75 34.16
  mid  M77 67 L86 60 L77 53
  low  M77.45 73.54 L82 84 L70.75 85.84
```

Chevrons, not solid triangles — round caps keep the soft family feel.

**Treatments:** app icon = `--terracotta-deep` block, cream mark `#F4F1E8` (the default). On light = terracotta mark, no block. On chrome = chrome block, cream mark. Mono = ink mark. Reversed = cream mark on photography. **Lockup:** `Kept Connect` in Fraunces 500 with the terracotta period; horizontal + stacked. **Clearspace:** ≥ block corner radius. **Min size:** app icon legible to 24px. Deliverable: `KeptConnectLogo` component + SVG outlines.

---

## 2. Signature elements

Connect keeps circular assignment and adds two signatures of its own — the moment that feels like Uber, and the one that feels safe.

### 2.1 Live match status — the "watch it happen" moment

After a person posts, this surface keeps them calm while the network resolves the job. A **warm moment** on the inherited circular language, with marketplace status states on the ring:

- **Fraunces status headline** advancing in plain language: `Finding your provider…` → `3 quotes in` → `Booked.` (terracotta period on resolve).
- **Provider avatars with status rings:** *responding* — neutral `--ink-3` ring; *quoted* — `--terracotta` ring; *awarded* — `--terracotta` filled. (Reuse the ops on-shift/en-route grammar for live job states.)
- **Subtle ambient motion** on the "finding" state only; respect `prefers-reduced-motion`.

### 2.2 The trust treatment — restraint as reassurance

Vetting is what a requester pays for, so credentials are **visible but quiet** — reassurance, not badges shouting.

- **Verified check** — a small `--verified` (emerald) check beside the provider name. Green because that's the universal "verified" convention; this is the one place to follow convention over brand. One, clean. Never a loud shield.
- **Credential tags** — `Licensed`, `Insured`, `Background checked` as quiet `--tag-bg` pills, same treatment as ops descriptive tags. Trust facts are description, rendered calm.
- **No trust theater** — no gold seals, no animated badges, no "TOP RATED" shouting. The calm is the credibility.

---

## 3. Components — the requester app

### 3.1 Post-a-job composer
The "where to?" moment; must feel under a minute. Warm `--moment` hero, Fraunces prompt ("What needs doing?"). Guided, progressive disclosure: describe → photo/video → location (auto-filled) → trade → urgency, dispatch mode behind a smart default. **One terracotta primary: `Post`.**

### 3.2 Quote / bid cards — clean data
Sealed quotes to compare. A **data surface — `--paper`, disciplined.** Provider (ringed avatar + name + verified check), **price tabular right-aligned** as the prominent figure, timeline + scope quiet beneath. One terracotta action: `Award`.

### 3.3 Provider profile — the trust surface
Header may use a restrained `--moment` band; data below stays clean paper. Rating + jobs (tabular), trades as quiet tags, credential tags + verified check, portfolio, reviews. Reviews are content, not decoration.

### 3.4 Masked thread
No raw phone/email ever surfaced. Calm paper thread, photo updates inline, mobile-first.

### 3.5 Ratings
Two-sided, one-tap stars + optional note. A warm confirmation moment, then done.

---

## 4. The provider app — the cool sibling

The Uber-driver analog. A near-twin of the ops cleaner app, not the requester app.

- **Dark `--chrome` surfaces**, lifted cards, dense layout. Terracotta uses `--terracotta-bright` (#CF6E45); verified uses `--verified-bright` (#57B98E); category colors brighten ~8–10% on dark.
- **One terracotta action per state:** `Accept` / `Quote` / `Start` / `Complete` / `Mark paid`.
- **Round-robin offer card** — the D10 dispatch mechanic as UI: trade (category color), distance, pay, a **respond timer**, Accept at the set rate (no bidding war), Decline. First-accept wins.
- **Fast pay, front and center** — available balance + `Cash out` (instant payout) is a primary, recurring element; it's the supply-retention lever, so it's always reachable.
- **The provider's "Today."** is their job feed + open offers (Fraunces greeting).
- Lean proof capture (before/after photo + status). 44px targets, safe-area insets.
- **Keep navigation in the WKWebView** — never bounce to Safari (the known Capacitor issue; don't regress).

Warmth budget here is near zero. A tool for someone working.

---

## 5. Voice & copy

Requester voice: **plain, warm, confident** — a calm concierge, never cute, never corporate. Active, specific, sentence case (*Post a job*, not *Submit request*). Status speaks like a person: `Finding your provider…` · `3 quotes in` · `On the way` · `Booked.` · `Paid — Marco has been notified.` Empty states invite ("Nothing posted yet. What needs doing?"). Errors give direction, not apology ("That didn't post — add a photo and try again."). The provider app stays terser and more functional.

---

## 6. Imagery

Real, warm, unstaged photography of homes and trades at work — never stocky or corporate. Imagery lives in marketing, onboarding, and empty states, not on working surfaces. Any illustration stays geometric and restrained, descended from the mark's language, used sparingly.

---

## 7. Rollout — surface by surface

1. **Mark + lockups + app icon** (§1.7).
2. **Post-a-job composer** (§3.1) — prove the warm-moment system.
3. **Live match status** (§2.1) — the signature moment.
4. **Quote cards + award** (§3.2) — prove the clean-data discipline beside the warmth.
5. **Provider profile + trust treatment** (§2.2, §3.3).
6. **Masked thread + ratings** (§3.4–3.5).
7. **The provider app** (§4) — the cool sibling; can run in parallel.
8. **Marketing site** — the warmest expression; where the blue-accent decision lands, if at all.

---

## 8. Implementation notes & don'ts

- **Inherit structural tokens; add the Connect brand + category tokens** (§1.4–1.5) and `--moment`. No hard-coded hexes.
- **Per-surface check:** moment or data? Moment → warmth allowed; data → clean paper, tabular, near-mono. Terracotta only on brand/action; emerald only on verified; category hues only on trade icons. Every corner on the ladder.

**Don'ts**
- No warm-washing a data surface (quotes, prices, stats, history).
- No emerald as a brand or action color — it means *verified* and nothing else.
- No terracotta or emerald in the category palette.
- No second action color; terracotta is the only one.
- No loud trust badges, gold seals, or fake urgency.
- No two primary actions on one surface.
- Don't make the provider app warm — it's a work tool.
- Don't regress the in-WKWebView navigation in the native build.

---

## 9. Principles, one paragraph

Same hand as the ops tool, one room warmer, in its own color. The structure is shared — tokens, ladder, circles, type — and the chrome is black-and-white so color always means something: terracotta for brand and action, emerald for verified, a calm family palette for which trade, nothing decorative. Warmth is spent only where a person is welcomed or reassured; the moment a surface carries a number, it returns to clean paper. The mark is the house-K turned dispatcher, firing outward to the network. Trust is rendered as calm, not as badges. The requester app is hospitable; the provider app is a tool. If a choice makes a homeowner feel *this is easy and this is safe*, it's right; if it decorates, or shouts trust, or warms up the data, it's wrong.
