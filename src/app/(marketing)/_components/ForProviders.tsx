import { CategoryIcon, CATEGORIES, type CategoryKey } from "@/components/ui";
import { ButtonLink } from "./ButtonLink";

/**
 * ForProviders — the supply-side pitch (#providers). Warm marketing voice (the
 * cool dark tool lives in the app, not here). Set your rate, accept the offers
 * you want, cash out instantly. A calm strip of the 8 service families shows
 * breadth without going rainbow.
 */
const FAMILIES = Object.keys(CATEGORIES) as CategoryKey[];

const POINTS: { label: string; copy: string }[] = [
  { label: "Set your rate", copy: "Accept jobs at the rate you set — no bidding wars, no race to the bottom." },
  { label: "Work that finds you", copy: "Nearby jobs are offered one at a time. Take the ones you want, skip the rest." },
  { label: "Cash out instantly", copy: "Get paid the moment a job is done. Your money, the same day." },
];

export function ForProviders() {
  return (
    <section id="providers" style={{ padding: "88px 24px", background: "var(--canvas)" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(28px, 4vw, 38px)",
            letterSpacing: "-0.015em",
            color: "var(--ink)",
            margin: "0 0 12px",
          }}
        >
          Work that comes to you<span style={{ color: "var(--terracotta)" }}>.</span>
        </h2>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)", margin: "0 auto 28px", maxWidth: 560 }}>
          For the trades. Keep your schedule full without chasing leads or invoices.
        </p>

        {/* Calm breadth-of-trades strip — neutral chips, family-colored glyphs. */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 44 }}>
          {FAMILIES.map((key) => (
            <CategoryIcon key={key} category={key} size={44} />
          ))}
        </div>

        <ul
          style={{
            listStyle: "none",
            margin: "0 0 36px",
            padding: 0,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            textAlign: "left",
          }}
        >
          {POINTS.map((p) => (
            <li key={p.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 18, color: "var(--ink)", margin: 0 }}>
                {p.label}
              </h3>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>
                {p.copy}
              </p>
            </li>
          ))}
        </ul>

        <ButtonLink href="/sign-up" size="lg">
          Start earning
        </ButtonLink>
      </div>
    </section>
  );
}
