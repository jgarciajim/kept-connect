The button. Terracotta `primary` is the single obvious action per surface (Post, Award, Accept) — never two primaries on one screen. `outline` (terracotta border/text) is the quieter actionable twin; `secondary` (paper + hairline) and `ghost` for everything else.

```jsx
<Button>Post</Button>
<Button variant="outline">Award</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">Skip</Button>
```

Sizes sm/md/lg (md = 44px touch target). Use `chrome-primary` / `chrome-ghost` on the dark provider-app surfaces (brightened terracotta). Press state shrinks slightly; disabled drops to 45% opacity.
