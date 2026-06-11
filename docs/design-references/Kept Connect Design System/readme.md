# Kept Connect — Design System

The brand and UI system for **Kept Connect**, a standalone, open marketplace app — *"Uber for getting things done at a property."* A homeowner, realtor, property manager, or self-host posts a job; the network dispatches it to vetted local providers; the job gets done, paid, and rated — **post → matched → done → paid → rated**, with zero friction and zero money-handling.

Connect is the **warm consumer sibling** of the **Kept ops tool** (the cleaner/operator work surface). It inherits that system's *structure* wholesale — surface tokens, radius ladder, type pairing, circular assignment — and runs its **own color identity and temperature** on top: a three-tier system where **terracotta = brand + action**, **emerald = verified-only**, and a calm **category palette = which trade**. It adds its own **mark** (the K-link dispatch fan-out) and its own **signature surfaces** (live match + the trust treatment).

> **North star — the feeling:** Effortless (post in under a minute, one choice at a time), Reassuring (a stranger is coming to someone's home — every surface quietly signals *vetted, handled, your money is safe*), and Warm but disciplined (warmth only where a person is welcomed or reassured; clean restraint where they read a price).

## Sources

This system was built from a written design direction, not a live codebase or Figma file. If you have access, read these for the full story:

- **`uploads/kept-connect-design-brief-new.md`** — the **current** design direction (the three-tier color system). This is the source of truth this DS implements.
- **`uploads/kept-connect-terracotta-uber.html`** — the requester flow exploration (home → quotes → track) that fixed the terracotta×Uber discipline and the canonical UI glyphs.
- **`uploads/kept-connect-provider-app.html`** — the provider-app exploration (dark chrome, round-robin offer + respond timer, fast pay, active job).
- **`uploads/kept-connect-category-colors.html`** — the 8 service-family category system, with exact hues, glyphs, and the chip-tint formula.
- **`uploads/kept-connect-fanout-refined.html`** — the refined logo exploration, the source of the locked mark geometry.
- **`uploads/kept-connect-design-brief.md`** — the *previous* brief (emerald-as-action). Superseded by the new brief; kept for history.
- **`kept-design-brief.md`** — the *ops* brief Connect inherits its structure from. **Not supplied** in this project; the chrome scale and tag tokens were reconstructed from how the Connect brief uses them — confirm against the ops brief if you have it.

There is **no product codebase or Figma** attached. The UI kits are faithful realizations of the brief's described surfaces, not recreations of shipped screens.

---

## Two temperatures, one system

Connect is **two apps** that run at different temperatures on purpose:

| | Requester app (warm) | Provider app (cool) |
|---|---|---|
| Who | homeowner / realtor / PM / self-host | the trades (Uber-driver analog) |
| Feel | consumer-grade, spacious, hospitable | a work tool — speed & clarity |
| Surface | `--canvas` / `--paper` + `--moment` warmth | dark `--chrome` |
| Warmth budget | full (in human moments) | near zero |
| Voice | calm concierge | terse, functional |

Same tokens, same mark, same radius ladder, same circular assignment across both — only **density, voice, and warmth** differ. *Same hand, different room.*

---

## CONTENT FUNDAMENTALS

How Connect writes. The requester voice is **plain, warm, and confident — a calm concierge, never cute, never corporate.** The provider voice is terser and more functional. Match the audience.

- **Casing: sentence case, everywhere.** Buttons, labels, headlines, nav. Never Title Case, never ALL CAPS (except the 11px tracked eyebrow labels). `Post a job`, not `Post A Job` or `Submit Request`.
- **Person:** address the user as **you** ("Finding *your* provider", "*your* money is safe"). Providers are named as people ("Marco has been notified").
- **Active, specific, named by what the person controls.** `Post a job`, not `Submit request`. `Award`, not `Confirm selection`. `Cash out instantly`, not `Initiate payout`.
- **Status speaks like a person:** `Finding your provider…` · `3 quotes in` · `On the way` · `Booked.` · `Paid — Marco has been notified.`
- **Empty states invite, never scold:** *"Nothing posted yet. What needs doing?"*
- **Errors give direction, never apology, never vague:** *"That didn't post — add a photo and try again."* Errors never say *sorry*.
- **The signature period.** Key headlines and the wordmark end in a **terracotta period**: `Booked.` `Today.` `On the way.` The period is the only colored glyph in the text; it means *resolved / done / live*.
- **Numbers are quiet and exact.** Money is tabular, right-aligned on the decimal, never rounded for show. No fake stats, no decorative figures.
- **Emoji: none.** Not in product, not in marketing. Warmth comes from type, surface, and imagery — never emoji. No exclamation-point enthusiasm; the calm *is* the brand.

**Voice examples**

- Composer prompt → `What needs doing?`
- Live match → `Finding your provider…` then `3 quotes in` then `Booked.`
- Confirmation → `Marco has been notified and is confirmed for today, 2–4pm. Your payment is held safely until the job's done.`
- Provider offer → `Leak under kitchen sink · Same day · 1.2 mi`
- Provider pay → `Cash out instantly`

---

## VISUAL FOUNDATIONS

**The governing rule — the warmth budget.** Ask of every surface: *is this welcoming someone, or informing them?* Welcoming → warmth allowed (`--moment` cream, larger Fraunces, imagery, air). Informing → clean paper, tabular, near-monochrome. **Never warm-wash a surface carrying numbers** (quotes, prices, provider stats, payment records, history).

**Color.** A warm, paper-first, near-monochrome base with a single decisive accent.
**Color — the three-tier system.** Connect runs Uber-style discipline: the chrome is black-and-white and **color only ever appears when it carries meaning.** Three tiers, each one job; everything else is neutral.
- **TIER 1 — Terracotta = brand + action + live.** `--terracotta #BD5E39` is the brand and *every primary action* and the live/active state. `--terracotta-deep #A8502F` (app-icon block, pressed), `--terracotta-bright #CF6E45` (the same role on dark chrome), `--terracotta-tint #F3E5DC` (selected / focus halo). If it's terracotta, it's the brand or it's actionable — never decorative.
- **TIER 2 — Emerald = verified, and only verified.** `--verified #2C8A63` (`--verified-bright #57B98E` on dark) is the verified check + "safe" affirmations and **nothing else.** Green follows the universal *verified* convention — the one place the system follows convention over brand.
- **TIER 3 — Category = which trade.** Eight service-family hues (`--cat-water` … `--cat-fixtures`) appear **only on trade icons**, rendered as a neutral chip with a family-colored glyph (never a solid block) so a wall of categories reads calm. Terracotta and emerald are deliberately excluded from this palette.
- **Neutral base:** `--canvas #F6F4EF` (app bg), `--paper #FFFFFF` (data), `--moment #F2ECDF` (warm cream — human moments only), `--neutral #F4F3F0` (quiet controls), `--hairline #ECEAE3`, ink `#1B1C19 / #6E6C63 / #A4A299`.
- Chrome (provider app): `--chrome #1A1916`, `--chrome-card #252320`, `--chrome-card-2 #2E2B27`, `--chrome-line #36332E`, `--chrome-cream #E9E6DD`, `--chrome-dim #8C887D`. On dark, terracotta + verified use their `-bright` variants and category hues brighten ~9%.
- `--blue #1C4471` is **marketing-site only** — never in product UI.

**Typography.** **Fraunces** (display serif, opsz) for human moments + headlines + the wordmark; **Hanken Grotesk** (grotesque sans) for all UI and data. **Weights 400 / 500 only** — no bold, no light. Sentence case. Fraunces is spent more freely here than in ops — it leads the composer greeting, the status headline, onboarding, confirmations. Data type is unchanged: Hanken, `tabular-nums`, money right-aligned on the decimal, quiet `--ink-3` headers. The requester scale runs a touch larger and airier (generous line-height); the provider app keeps the tighter ops scale.

**Spacing & layout.** 4px base scale. Mobile-first single column (`--app-width 420px`); marketing/wide content caps at `--container 960px`. Big touch targets (44px minimum, generous in the requester app). Respect safe-area insets in the native build. One obvious action per screen — **never two primaries**.

**Radius — the inherited ladder (do not fork):** `--r-chip 10` (chips, inputs) → `--r-card 18` (cards, panels) → `--r-lg 24` (heroes, app-icon block) → `--r-pill 999` (pills, tags, avatars, primary buttons). Use continuous corners (`corner-shape: superellipse`) where supported.

**Cards.** Soft, calm, paper-first. Hairline border (`1px var(--hairline)`), `--r-card` radius, optional soft shadow. A **left-edge ribbon** (4px) flags live/exception state in terracotta. Moment cards drop the border and sit on warm cream. Provider cards are dark `--chrome-card` / `--chrome-card-2` with a `--chrome-line` hairline; the live offer card carries a `--terracotta-deep` border.

**Shadows — restrained, warm, paper-first.** `--shadow-sm` (1px), `--shadow-card` (soft double-layer lift), `--shadow-lift` (elevated sheets). No hard or colored shadows. Avatars carry a **2px white inner border** (`box-shadow: 0 0 0 2px var(--paper)`) — part of the circular-assignment signature.

**Circular assignment (inherited signature).** People are always circles: soft-tinted avatar (stable tint from the name), 2px white inner border, optional **activity ring** carrying status. Connect *extends the ring states* — `responding` (neutral grey, gently pulsing — searching), `quoted` (terracotta), `awarded` (terracotta filled), `enroute` / `onsite` (terracotta live), `done` (neutral) — but never changes the circular shape language.

**Motion.** Calm and singular. Gentle ease (`cubic-bezier(0.22,0.61,0.36,1)`), fades and soft scales — **no bounce, no scattered animation.** The one orchestrated motion is the *live-match* "finding" pulse on the searching ring; everything else is still. Always respect `prefers-reduced-motion`.

**States.** Hover: subtle darken / surface lift (no big color shifts). Press: a small `scale(0.97)` shrink (buttons) — tactile, not flashy. Focus: terracotta border + soft `--terracotta-tint` halo on inputs. Disabled: 45% opacity. Selected: `--terracotta-tint` fill + terracotta border.

**Transparency & blur.** Used sparingly — translucent ink overlays on the dark chrome (`rgba(cream, 0.5–0.08)` for tiers of text/borders), tinted flag backgrounds for status tags. No heavy glassmorphism.

**Imagery.** The ops tool is near-imageless; Connect uses imagery to carry warmth — **real, warm, unstaged photography** of homes and trades at work (honest and human, never stocky "service smile" or fisheye). Imagery lives in **marketing, onboarding, and empty states only — never behind data**. If illustration is used, keep it geometric and restrained, descended from the mark's language (rounded, soft, line-led), one style, used sparingly. *(No photography is bundled in this DS — supply real assets; the kits use restraint + type + the mark in place of stock.)*

**The trust treatment (signature — restraint as reassurance).** Vetting is the product, so credentials are **visible but quiet**: a small emerald (`--verified`) **verified check** beside the name (one, clean — never a loud shield or gold seal); credential facts (`Licensed`, `Insured`, `Background checked`) as calm `--tag-bg` pills. Emerald here is the *only* place the system follows convention over brand. **No fake urgency, no trust theater, no "TOP RATED" shouting.** The calm is the credibility.

---

## ICONOGRAPHY

The icon set is the brand's **own glyph family**, lifted directly from the Kept Connect design explorations (the terracotta×Uber flow, the provider app, and the category system). They are not a third-party library — they're the canonical Connect glyphs, rendered inline in `ui_kits/*/icons.jsx` and the `CategoryIcon` component.

- **Monochrome line SVGs**, ~24px grid, 2px stroke, round caps + joins (matching the mark's soft geometry). They inherit `currentColor`.
- **Two roles.** *UI affordances* (home, jobs, chat, user, arrow, back, phone, camera, check, pin, clock, wallet) are neutral — `--ink` / `--ink-2` / `--ink-3` on light, cream/dim on chrome, terracotta only when the icon *is* the action. *Category glyphs* (droplet, bolt, wind, wall, roller, leaf, sparkle, key) live in `CategoryIcon`, colored by service family on a neutral chip — the TIER 3 wayfinding.
- **Stars** (ratings) are filled **terracotta** — not amber (amber is the `power` category). The **verified check** is the one filled emerald icon (a trust mark, not a UI icon).
- **No emoji, ever. No unicode glyphs as icons.** The only "decorative" mark in the system is the terracotta period.
- The **brand mark** is pure locked vector (`assets/logo-*.svg` + the `KeptConnectLogo` component) — never redrawn, never approximated with an icon.
- If you extend the set, match the 2px round-cap line style. The nearest off-the-shelf equivalents are **Lucide** or **Phosphor** (regular) — but prefer extending the brand glyphs already here.

---

## The mark — the "K-link" (dispatch fan-out)

A geometric **K reimagined as a dispatcher**: a stem with three arms firing outward from the vertex into chevron arrowheads — *one request dispatched to many providers.* Sibling to the ops house-K: same rounded-square block, same weight discipline, soft round-cap geometry. **Geometry is locked** (`viewBox 0 0 120 120`, block `rx 32`, stroke 9.5 / chevrons 8.5, round caps + joins). Chevrons, never solid triangles — filled triangles read sharp and foreign.

**Treatments** (in `assets/`, and via `<KeptConnectLogo treatment="…">`): `app-icon` (terracotta-deep block, cream mark — default), `on-light` (terracotta mark), `on-chrome` (dark block, provider app), `mono` (ink), `reversed` (cream over photography), `blue` (marketing only). **Lockup:** `Kept Connect` in Fraunces 500 with the terracotta period. Legible to **24px**.

---

## Index / manifest

**Root**
- `styles.css` — the global entry point consumers link. `@import`s only.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skills-compatible front-matter for use in Claude Code.

**`tokens/`** (all reached from `styles.css`)
- `fonts.css` — Fraunces + Hanken `@font-face` (via Google Fonts CDN — see note below).
- `colors.css` — the three-tier system: neutral base, terracotta (brand/action), emerald (verified), the 8 category hues, chrome scale, tags, marketing blue + semantic aliases.
- `typography.css` — families, the 400/500 weights, display + text scales, numeric features.
- `spacing.css` — 4px spacing scale, the radius ladder, shadows, motion, layout widths.

**`components/`** (React primitives — `window.KeptConnectDesignSystem_4a1eb7.<Name>`)
- `brand/KeptConnectLogo` — the mark + lockup, all treatments.
- `core/Button` — terracotta primary / secondary / outline / ghost / chrome variants.
- `core/Card` — paper / moment / chrome surfaces, ribbon edge.
- `category/CategoryIcon` — the 8 service-family wayfinding icons.
- `forms/Input` — composer field, textarea, money input.
- `people/Avatar` — circular assignment with marketplace status rings.
- `trust/Tag` — credential / trade / status pills.
- `trust/VerifiedBadge` — the quiet emerald verified check (TIER 2).

**`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand) for the Design System tab.

**`ui_kits/`**
- `requester/` — the warm consumer app: home → post → live match → quotes → track.
- `provider/` — the cool trades app: Today feed, offers, instant pay, active-job flow.

**`templates/`** (starting points consuming projects can copy — each loads `ds-base.js`)
- `requester-app/` — the warm post-a-job composer screen.
- `provider-app/` — the cool dark "Today" feed with the fast-pay strip.

**`assets/`** — `logo-*.svg` (the seven mark treatments).

---

### Notes & substitutions (please confirm)

1. **Fonts** load from **Google Fonts CDN** (no font binaries were supplied). Fraunces + Hanken Grotesk are the genuine brand faces, so this is the real type, not a lookalike — but to self-host, drop `.woff2` files into `assets/fonts/` and swap the `@import` in `tokens/fonts.css` for local `@font-face` rules.
2. **Icons** are the brand's own glyph family, taken from the design explorations (not a substitution). Extend in the same 2px round-cap line style.
3. **Shared ops tokens** (the chrome scale, tag tokens) were reconstructed from the Connect brief's usage — confirm against `kept-design-brief.md` if you have it. The brand/category color system here follows the **updated** brief (`uploads/kept-connect-design-brief-new.md`): terracotta brand/action, emerald verified-only, 8-family category palette.
4. **No photography** is bundled — supply real warm/unstaged imagery for marketing, onboarding, and empty states.
