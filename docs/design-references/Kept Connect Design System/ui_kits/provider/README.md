# Provider app — UI kit

The **cool** Kept Connect surface: the trades app, the Uber-driver analog. A near-twin of the ops cleaner app — dark `--chrome`, dense cards, speed over hospitality. The warmth budget is near zero. Terracotta brightens to `--terracotta-bright`; verified to `--verified-bright`; category hues brighten ~9%.

Open `index.html` for the interactive flow:

1. **FeedScreen** (`Screens.jsx`) — the job feed. Fraunces greeting, the **fast-pay strip** (available balance + `Cash out` — the supply-retention lever, always reachable), the **round-robin OfferCard** (category icon, respond timer, set rate, `Accept` / `Decline` — first-accept wins, no bidding war), and scheduled work.
2. **ActiveScreen** (`Screens.jsx`) — the active-job flow. Map, masked customer contact, before/after proof capture, and one terracotta action per state: `Start job` → `Mark complete` → `Mark paid` → "Paid — nice work."
3. **EarningsScreen** (`Screens.jsx`) — instant cash-out and the tabular payout history.

Shell pieces (`Shell.jsx`): dark `VStatusBar`, `VBottomNav` (Jobs / Active / Earnings / You), and the round-robin `OfferCard`. Icons are the brand's own glyphs in `icons.jsx`.
