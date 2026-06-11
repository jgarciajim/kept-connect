import { Card } from "@/components/ui";

/**
 * HowItWorks — the five-step flow, the spine of the product:
 * post → matched → done → paid → rated. Numbered paper cards, Fraunces labels,
 * one warm line each, terracotta numerals.
 */
const STEPS: { label: string; copy: string }[] = [
  { label: "Post", copy: "Tell us what needs doing. Under a minute — a photo helps." },
  { label: "Matched", copy: "We dispatch to vetted local pros. Quotes come to you." },
  { label: "Done", copy: "Your pro shows up and does the work. Track it the whole way." },
  { label: "Paid", copy: "Pay in-app when it’s finished — held safe until then." },
  { label: "Rated", copy: "Rate each other afterward. Good work rises." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "88px 24px", background: "var(--canvas)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 48 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "clamp(28px, 4vw, 38px)",
              letterSpacing: "-0.015em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Five steps, zero friction<span style={{ color: "var(--terracotta)" }}>.</span>
          </h2>
        </header>

        <ol
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          {STEPS.map((step, i) => (
            <li key={step.label}>
              <Card lift style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 22,
                    color: "var(--terracotta)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {i + 1}
                </span>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 20, color: "var(--ink)", margin: 0 }}>
                  {step.label}
                </h3>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>
                  {step.copy}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
