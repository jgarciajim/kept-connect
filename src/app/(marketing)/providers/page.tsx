import type { Metadata } from "next";
import { CategoryIcon, CATEGORIES, Card, type CategoryKey } from "@/components/ui";
import { ButtonLink } from "../_components/ButtonLink";

export const metadata: Metadata = {
  title: "Guildry for Pros — work that comes to you",
  description:
    "Set your own rates, accept the jobs you want, and get paid the day the work is done. Sign up on your computer or finish in the app.",
};

const FAMILIES = Object.keys(CATEGORIES) as CategoryKey[];

const POINTS: { label: string; copy: string }[] = [
  { label: "Set your own rates", copy: "You price your work — trip charge, hourly, or per job. No bidding wars, no race to the bottom." },
  { label: "Work that finds you", copy: "Nearby jobs are offered to you one at a time. Accept the ones you want, skip the rest — declining is always free." },
  { label: "Cash out the same day", copy: "Payment is held safe the moment a Customer books. When the job's done, it's released straight to you." },
];

const STEPS: { label: string; copy: string }[] = [
  { label: "Apply & get verified", copy: "Tell us your trades and upload your license, insurance, and ID. We review and approve you." },
  { label: "Set your rates", copy: "Price the exact services you offer — the common jobs, your trip charge, your hourly." },
  { label: "Accept offers", copy: "Get matched to nearby Customers. Tap to accept, mark yourself on the way with an ETA." },
  { label: "Get paid", copy: "Finish the work, mark it done, and the held payment releases to you." },
];

export default function ProvidersLanding() {
  return (
    <main>
      {/* Hero — supply-side, warm cream band. */}
      <section style={{ background: "var(--moment)", padding: "96px 24px 104px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", margin: 0 }}>
            For the trades
          </p>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(40px, 7vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.015em", color: "var(--ink)", margin: 0 }}>
            Work that comes to you<span style={{ color: "var(--terracotta)" }}>.</span>
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "clamp(16px, 2.2vw, 19px)", lineHeight: 1.5, color: "var(--ink-2)", margin: 0, maxWidth: 560 }}>
            Keep your schedule full without chasing leads or invoices. Set your rates, accept the jobs
            you want, and get paid the day the work is done.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 4 }}>
            <ButtonLink href="/sign-up?redirect_url=/work/start" size="lg">Start earning</ButtonLink>
            <ButtonLink href="/sign-in" variant="outline" size="lg">Sign in</ButtonLink>
          </div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", margin: "4px 0 0" }}>
            Sign up on your computer or finish in the app — your progress saves as you go.
          </p>
        </div>
      </section>

      {/* Why Pros */}
      <section style={{ padding: "88px 24px", background: "var(--canvas)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px, 4vw, 38px)", letterSpacing: "-0.015em", color: "var(--ink)", margin: "0 0 12px" }}>
            Your business, your terms<span style={{ color: "var(--terracotta)" }}>.</span>
          </h2>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)", margin: "0 auto 40px", maxWidth: 560 }}>
            Guildry works the way the trades actually work.
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", textAlign: "left" }}>
            {POINTS.map((p) => (
              <li key={p.label}>
                <Card style={{ height: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "var(--ink)", margin: 0 }}>{p.label}</h3>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>{p.copy}</p>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trades breadth */}
      <section style={{ padding: "0 24px 88px", background: "var(--canvas)" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", margin: "0 0 20px" }}>
            Every trade a property needs
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {FAMILIES.map((key) => (
              <CategoryIcon key={key} category={key} size={48} />
            ))}
          </div>
        </div>
      </section>

      {/* How earning works */}
      <section style={{ padding: "88px 24px", background: "var(--moment)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px, 4vw, 38px)", letterSpacing: "-0.015em", color: "var(--ink)", margin: 0 }}>
              How earning works<span style={{ color: "var(--terracotta)" }}>.</span>
            </h2>
          </header>
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            {STEPS.map((step, i) => (
              <li key={step.label}>
                <Card lift style={{ height: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--terracotta)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "var(--ink)", margin: 0 }}>{step.label}</h3>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", margin: 0 }}>{step.copy}</p>
                </Card>
              </li>
            ))}
          </ol>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <ButtonLink href="/sign-up?redirect_url=/work/start" size="lg">Start earning</ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
