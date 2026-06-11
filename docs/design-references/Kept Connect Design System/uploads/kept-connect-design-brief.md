# Kept Connect — Design Direction & System

**Handoff brief for Claude Design & Claude Code.** This is the single source of truth for the visual language of **Kept Connect** — the standalone, open marketplace app (“Uber for getting things done at a property”). It is the **sibling** to `kept-design-brief.md` (the Kept ops tool). Connect inherits that system’s spine wholesale and changes only its *temperature* and adds its own *mark* and *surfaces*. When a decision isn’t here, inherit the ops brief; when the two could conflict, the rule in §1.2 (warmth budget) decides.

> Read the ops brief first. This document assumes it. It does not re-print the shared tokens, the radius ladder, the ribbon grammar, or the circular-assignment language — it *uses* them.

-----

## 0. North star — the feeling

The ops tool is a **work surface**: clean, fast, deferential, near-monochrome. Connect is for **homeowners, realtors, PMs, and self-hosts** — people, not operators — so it carries one more quality the ops tool deliberately withholds: **it has to feel inviting.** You should *want* to open it.

Connect’s job is to make “get someone trustworthy to my property” feel like ordering a car: **post → matched → done → paid → rated**, with zero friction and zero money-handling. Three feelings drive every decision:

1. **Effortless.** Post in under a minute. One obvious action per screen. The product does the work; the person makes one choice at a time.
1. **Reassuring.** A stranger is coming to someone’s home. Every surface should quietly signal *this person is vetted, this is handled, your money is safe.* Trust is the product (see §2.2).
1. **Warm, but disciplined.** Connect is allowed brand warmth the ops tool is not — but only in the human moments, never on the data (§1.2). Warmth where a person is being welcomed or reassured; clean restraint where they’re reading a price.

**Same hand, different room.** A person who uses Connect and later touches Kept ops (via “push to Connect,” or because they run a cleaning business too) must feel the same designer made both. Family resemblance is a trust asset — don’t break it to look different.

-----

## 1. Foundations

### 1.1 What Connect inherits verbatim (do not redesign)

From `kept-design-brief.md`, unchanged:

- **The full token set** — `--canvas` `--paper` `--hairline` `--ink/-2/-3`, `--emerald`, the chrome tokens, the tag tokens.
- **The radius ladder** — `--r-chip` 10 → `--r-pill` 999, plus continuous corners (`corner-shape: superellipse`) where supported.
- **Typography** — Fraunces (display) + Hanken Grotesk (UI), weights **400/500 only**, sentence case everywhere, `tabular-nums` on figures, money right-aligned on the decimal.
- **Circular assignment language** — soft-tinted avatars, 2px white inner border, activity-ring status. Connect extends the ring *states* (§2.1) but never the shape language.
- **Emerald = action, always.** Green means *do something* (or *this is verified/safe*). Never decorative. This rule is absolute and shared.

If it’s in the ops brief and not contradicted below, it applies here.

### 1.2 The temperature shift — the “warmth budget”

The ops brief’s core spatial rule is *warmth lives in the chrome, never on the content surface; the working surface stays clean paper.* Connect **relaxes that rule in one controlled way** and keeps it everywhere else:

- **Warmth is permitted on human moments.** Onboarding, the post-a-job composer’s hero, live-match status, confirmations, empty states, and all marketing may use the warm **`--moment`** surface and larger expressive type. These are the welcoming/reassuring beats.
- **Data still defers, on clean paper.** Quotes, prices, provider stats, payment records, job history, schedules — anything a person *reads to decide* — stays on `--paper`, near-monochrome, tabular, disciplined. The ops rule holds here unchanged.

The test: **is this surface welcoming someone, or informing them?** Welcoming → warmth allowed. Informing → clean paper. Never warm-wash a surface that’s carrying numbers.

```
/* Connect addition — the only new surface token */
--moment   #F2ECDF   warm cream for human moments ONLY (hero, onboarding,
                      confirmation, empty states, marketing). NEVER behind data.
```

### 1.3 Two temperatures *inside* Connect

Connect is two apps, and they run at different temperatures on purpose:

- **The requester app** (homeowner / realtor / PM / self-host) — the **warm** one. Consumer-grade, spacious, friendly voice, the full warmth budget. This is where §0 lives.
- **The provider app** (the trades — the Uber-driver analog) — the **cool** one. It is a *work tool*, a close sibling to the ops cleaner app: dark chrome bottom nav, dense job/offer cards, the ribbon left edge, one emerald action per state. It barely touches the warmth budget. A provider wants speed and clarity, not hospitality.

Same tokens, same mark, same radius ladder across both — only density, voice, and warmth differ.

### 1.4 Color

- **Emerald `--emerald #2C8A63` stays the single action/affirmation color across both products.** It is also Connect’s “verified / safe” color (§2.2). Do not fork it. A consistent action color across Kept and Connect *is* the family trust signal.
- **Warmth comes from `--moment` and from imagery (§6), not from a second accent.** Connect distinguishes itself by feeling warmer and more human, not by changing the action color.
- **Open decision — a Connect marketing accent.** If Connect’s *marketing site* wants a distinguishing accent, the candidate is the legacy brand blue (`#1C4471` deep / `#92B5DF` light). **Recommendation: do not introduce it into the product UI** — keep it to marketing only, if at all. Decide before the marketing build; it does not affect the app.

### 1.5 Typography — same faces, used more generously

Connect uses the *same* Fraunces + Hanken pairing, but spends Fraunces more freely than the ops tool does:

- **Fraunces leads the human moments** — the composer greeting (“What needs doing?”), the status headline (“Finding your provider”), onboarding, confirmations. The ops tool reserves Fraunces for page titles; Connect lets it carry warmth in-flow.
- **The signature period flourish carries over.** Key headlines and the wordmark end in an emerald period (e.g. `Booked.`).
- **Scale runs a touch larger and airier** in the requester app than in ops — generous line-height, more breathing room — because comprehension here is emotional, not just functional. The provider app keeps the tighter ops scale.
- Data type is unchanged: Hanken, tabular, right-aligned money, quiet `--ink-3` headers.

### 1.6 The mark — the “K-link” (locked: dispatch fan-out)

Connect’s mark is the **house-K reimagined as a dispatcher**: a geometric K whose three arms fire outward from the vertex into chevron arrowheads — *one request dispatched to many providers.* It is a sibling to the ops house-K: same rounded-square block, same weight discipline, same soft round-cap geometry.

**Geometry (locked).** `viewBox 0 0 120 120`.

```
Block:   rounded square, rect x6 y6 w108 h108, rx 32 (treat as squircle /
         corner-shape: superellipse where supported)

K + fan: stroke 9.5, round caps + joins
  stem      M38 30 V90
  arm up    M38 60 L82 36
  arm mid   M38 60 L86 60
  arm low   M38 60 L82 84

Arrowheads: chevrons, stroke 8.5, round caps + joins
  up        M77.45 46.46  L82 36  L70.75 34.16
  mid       M77 67        L86 60  L77 53
  low       M77.45 73.54  L82 84  L70.75 85.84
```

**Why chevrons, not solid triangles:** round-cap chevrons keep the soft, geometric family feel. A filled triangle reads sharp and foreign against the rest of the system. Hold the chevron treatment.

**Treatments**

- **App icon** — `--emerald` block, cream mark (`#F4F1E8`). The default.
- **On light** — emerald mark, no block, on `--canvas`/`--paper`.
- **On chrome** — `--chrome` block, cream or `--chrome-active` (#6BD6A4) mark.
- **Mono** — `--ink` mark, no block. **Reversed** — cream mark, no block, for photography.

**Lockups**

- **Wordmark:** `Kept Connect` set in **Fraunces 500**, with the signature emerald period — horizontal (mark left of wordmark) and stacked (mark above). “Kept” and “Connect” share weight; the period is the only color.
- **Clearspace:** at least the block’s corner radius (≈ ¼ of the block) on all sides; for the lockup, the mark’s stem width between mark and wordmark.
- **Minimum size:** app icon legible to **24px** (verified — the arrowheads still read); wordmark min cap-height ≈ 16px. Below that, mark only.

Deliverables: refined vector mark, both lockups, the five treatments, and a one-page spec (clearspace / min size / do-don’ts). Ship as a `KeptConnectLogo` component + SVG outlines, matching the `KeptLogo` delivery.

-----

## 2. Signature elements

The ops tool’s signatures are the ribbon flags and the circular assignment. Connect keeps circular assignment and adds **two signatures of its own** — the two moments that make it feel like Uber and make it feel safe.

### 2.1 Live match status — the “watch it happen” moment

The emotional core. After a person posts, this surface keeps them calm and confident while the network resolves the job. It is a **warm moment** (§1.2) built on the **inherited circular language**, with marketplace status states added to the activity ring:

- **A Fraunces status headline** that advances in plain language: `Finding your provider…` → `3 quotes in` → `Booked.` (emerald period on the resolved state).
- **Provider avatars with status rings**, reusing the ring system, new states:
  - *responding* — `--flag-sameday` #EFA02A ring (in motion)
  - *quoted* — `--emerald` ring
  - *awarded* — `--emerald` filled ring
  - *en route / on site / done* — reuse the ops on-shift/en-route/off grammar
- **Subtle ambient motion** on the “finding” state only (a gentle pulse on the searching ring). Respect `prefers-reduced-motion`. One orchestrated moment beats scattered animation.

This surface is where “you WANT to use it” is won or lost. Make it feel handled, never anxious.

### 2.2 The trust treatment — restraint as reassurance

Vetting is what a requester pays the take rate for, so credentials must be **visible but quiet** — reassurance, not badges shouting for attention. This is Connect’s second signature and its discipline test.

- **Verified check** — a small emerald check (emerald = safe/affirmed here). One, clean, beside the provider name. Never a loud shield or ribbon.
- **Credential tags** — `Licensed`, `Insured`, `Background checked` as quiet `--tag-bg` pills (`--r-pill`, 11px, `--tag-ink`) — the same tag treatment as ops descriptive tags. Trust facts are *description*, rendered calm.
- **No fake urgency, no trust theater.** No gold seals, no animated badges, no “⭐ TOP RATED” shouting. The calm is the credibility. If everything is loud, nothing is trusted.

-----

## 3. Components — the requester app

Built on the shared components; only the Connect-specific notes here.

### 3.1 Post-a-job composer — the make-or-break flow

The “where to?” moment. Must feel posting takes **under a minute**.

- **Warm hero**, `--moment` surface, Fraunces prompt: *“What needs doing?”*
- **Guided, not a wall of fields.** Progressive disclosure: describe → photo/video drop → location (auto-filled from saved properties) → trade → urgency. Dispatch mode sits behind a smart default; advanced users can change it.
- **One emerald primary: `Post`.** Never two primaries. The single obvious tap.
- Big touch targets, generous spacing, sentence-case labels that say what they do.

### 3.2 Quote / bid cards — clean data, no warmth

Sealed quotes to compare. **This is a data surface — `--paper`, disciplined.**

- Provider: ringed avatar + name + rating + verified check (§2.2).
- **Price: tabular, right-aligned**, the one prominent figure. Timeline + scope quiet beneath.
- Compare-and-award: one emerald action — `Award`.
- Stack like ops rows; let the numbers stack on the decimal.

### 3.3 Provider profile — the trust surface

Where a requester decides to let someone into their home.

- Header may use a restrained `--moment` band; the data below stays clean paper.
- Rating + jobs completed (tabular), trades as quiet tags, credential tags + verified check (§2.2), photo portfolio, reviews.
- Reviews are content, not decoration — real, specific, quiet.

### 3.4 Masked thread — job-scoped comms

No raw phone/email ever surfaced. Calm paper thread, photo updates inline, mobile-first. Reuse the ops message/card patterns.

### 3.5 Ratings

Two-sided, **one-tap stars + optional note.** A warm confirmation moment (`--moment`), then done. Don’t make rating feel like a form.

-----

## 4. The provider app — the cool sibling

The Uber-driver analog. Treat it as a near-twin of the **ops cleaner app**, not the requester app.

- **Dark `--chrome` bottom nav**, `--r-card` job/offer cards on `--canvas`, ribbon left edge for exceptions/urgency, circular assignment + status rings.
- **One emerald action per state:** `Accept` / `Quote` / `Start` / `Complete` / `Mark paid`.
- **Fast pay, front and center** — the payout / instant-payout affordance is a primary, recurring element (it’s the supply-retention lever). Show earned + available prominently, tabular.
- **The provider’s “Today.”** is their job feed + open offers — same Fraunces greeting pattern as the cleaner app.
- Lean proof capture (photo + status). 44px targets, safe-area insets.
- **Keep navigation in the WKWebView** — post-login and links stay in-app, never bounce to Safari (the known Capacitor issue; do not regress).

Warmth budget here is near zero. This is a tool for someone working.

-----

## 5. Voice & copy

The ops voice is terse and operational. Connect’s requester voice is **plain, warm, and confident** — a calm concierge, never cute, never corporate.

- **Active, specific, sentence case.** Name things by what the person controls. *Post a job*, not *Submit request*.
- **Status speaks like a person:** `Finding your provider…` · `3 quotes in` · `On the way` · `Booked.` · `Paid — Marco has been notified.`
- **Empty states invite:** *“Nothing posted yet. What needs doing?”*
- **Errors give direction, not apology:** *“That didn’t post — add a photo and try again.”* Errors never say sorry and are never vague.
- The provider app stays terser and more functional — match the audience.

-----

## 6. Imagery

The ops tool is near-imageless (data). Connect uses imagery to carry warmth — but only in the moments, never behind data.

- **Real, warm, unstaged photography** of homes and trades at work. Avoid stocky, corporate, fisheye “service smile” imagery. Honest and human.
- Imagery lives in **marketing, onboarding, and empty states** — not in the working surfaces.
- If illustration is used, keep it geometric and restrained, descended from the mark’s language (rounded, soft, line-led). One style, used sparingly.

-----

## 7. Rollout — surface by surface

Apply the system in this order; each inherits everything above.

1. **The mark + lockups + app icon** (§1.6) — the identity, first.
1. **Post-a-job composer** (§3.1) — the make-or-break flow; prove the warm-moment system here.
1. **Live match status** (§2.1) — the signature moment.
1. **Quote cards + award** (§3.2) — prove the clean-data discipline beside the warmth.
1. **Provider profile + trust treatment** (§2.2, §3.3).
1. **Masked thread + ratings** (§3.4–3.5).
1. **The provider app** (§4) — the cool sibling, last in the requester track but it can run in parallel.
1. **Marketing site** — the warmest expression; where the blue-accent decision (§1.4) lands if at all.

-----

## 8. Implementation notes & don’ts

- **Inherit tokens; add only `--moment`.** No hard-coded hexes; consume the shared theme plus the one Connect addition.
- **Per-surface done check:** is it a moment or data? Moment → warmth allowed; data → clean paper, tabular, near-mono. Emerald only on action/verified. Every corner on the ladder. Circular assignment for people; ring states for status.

**Don’ts**

- No warm-washing a data surface (quotes, prices, stats, history).
- No second action color; emerald stays the only one.
- No loud trust badges, gold seals, or fake urgency — restraint is the credibility.
- No two primary actions on one surface.
- No forked mark, off-ladder radii, or new flag colors.
- Don’t make the provider app warm — it’s a work tool.
- Don’t regress the in-WKWebView navigation in the native build.

-----

## 9. Principles, one paragraph

Same hand as the ops tool, one room warmer. Connect inherits the whole system — tokens, ladder, circles, type, emerald-only-action — and spends its one new freedom, warmth, only where it welcomes or reassures a person; the moment a surface carries a number, it returns to clean paper. The mark is the house-K turned dispatcher, firing outward to the network. Trust is rendered as calm, not as badges. The requester app is hospitable; the provider app is a tool. If a choice makes a homeowner feel *this is easy and this is safe*, it’s right; if it decorates, or shouts trust, or warms up the data, it’s wrong.