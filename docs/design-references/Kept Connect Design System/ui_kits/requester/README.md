# Requester app — UI kit

The **warm** Kept Connect surface: the homeowner / realtor / PM / self-host app. Consumer-grade, spacious, friendly. This is where the warmth budget lives.

Open `index.html` for the interactive flow:

**Home → post → live match → quotes → track**

1. **HomeScreen** (`ComposerScreen.jsx`) — greeting, the compose bar (terracotta go button), the **category trade row** (CategoryIcon wayfinding), and the in-progress job.
2. **ComposerScreen** (`ComposerScreen.jsx`) — the make-or-break post-a-job flow. Warm `--moment` hero ("What needs doing?"), progressive fields, category trade picker, one terracotta `Post`.
3. **MatchScreen** (`MatchScreen.jsx`) — the signature *live match* moment. Fraunces status headline that advances (`Finding your provider…` → `3 quotes in`), provider avatars with activity-ring states (neutral pulse while searching → terracotta when quoted). Carries the **QuoteCard** (clean `--paper` data surface — tabular price, emerald verified check, terracotta `Award`).
4. **ProfileScreen** (`ProfileScreen.jsx`) — the trust surface. Restrained `--moment` header band; stats, credentials, trades, and reviews on clean paper.
5. **TrackScreen** (`ProfileScreen.jsx`) — the live job: map with a terracotta route, "On the way.", masked contact, and a terracotta step tracker.
6. **ThreadScreen** (`ThreadScreen.jsx`) — the masked, job-scoped thread (§3.4). No raw phone/email; calm paper bubbles vs terracotta user bubbles, inline photo updates, a "contact stays private" job-context chip.
7. **RatingScreen** (`ThreadScreen.jsx`) — two-sided ratings (§3.5): a warm `--moment` moment, one-tap terracotta stars + optional note, then a "Thanks." confirmation.

Built on the DS primitives (`Button`, `Card`, `Avatar`, `Tag`, `VerifiedBadge`, `Input`, `KeptConnectLogo`, `CategoryIcon`). Icons are the brand's own glyphs in `icons.jsx`.
