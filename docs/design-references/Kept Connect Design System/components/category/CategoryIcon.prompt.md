The service-family wayfinding system — TIER 3 color. Color groups trades into 8 families; the glyph names the trade. Rendered as a neutral chip with a family-colored glyph (the calm Uber pattern), never a solid color block.

```jsx
<CategoryIcon category="water" />        {/* Plumbing, drains, water heater */}
<CategoryIcon category="power" size={40} />
<CategoryIcon category="grounds" dark /> {/* brightened for the provider app */}
<CategoryIcon category="care" chip={false} /> {/* bare glyph */}
```

Families: `water` (blue), `power` (amber), `climate` (teal), `structure` (slate), `surfaces` (violet), `grounds` (green), `care` (mauve), `fixtures` (taupe). Terracotta and emerald are deliberately excluded — they mean brand/action and verified. `CATEGORIES` exports each family's hue, label, and example trades.
