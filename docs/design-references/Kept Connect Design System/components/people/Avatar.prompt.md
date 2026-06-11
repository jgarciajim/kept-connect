The circular assignment avatar — soft-tinted, 2px white inner border, with an optional activity ring that carries marketplace status. The ring states drive the live-match moment.

```jsx
<Avatar name="Marco Reyes" status="quoted" />
<Avatar name="Dana Liu" src="/photo.jpg" size={56} status="awarded" />
<Avatar name="Sam Cole" status="responding" /> {/* pulses */}
```

Ring states: `responding` (neutral grey, pulsing — searching), `quoted` (terracotta), `awarded` (terracotta filled), `enroute` / `onsite` (terracotta live state), `done` (neutral). `none` = plain avatar. Never change the circular shape language — only the ring states extend.
