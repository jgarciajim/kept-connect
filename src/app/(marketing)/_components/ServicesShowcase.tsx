import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/lib/requester/services";

/**
 * ServicesShowcase — the glossy 3D service icons on the marketing landing (a
 * discovery surface, where the PNGs belong). Reuses the same SERVICES catalog as
 * the requester app, so there's one source of truth. Each tile is a soft CTA into
 * sign-up.
 */
export function ServicesShowcase() {
  return (
    <section style={{ padding: "80px 24px", background: "var(--canvas)" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", textAlign: "center" }}>
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
          Everything your property needs<span style={{ color: "var(--terracotta)" }}>.</span>
        </h2>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)", margin: "0 auto 40px", maxWidth: 520 }}>
          From a leaky faucet to a full repaint — one tap to a vetted local pro.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 14,
          }}
        >
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href="/sign-up"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 12px 16px",
                background: "var(--paper)",
                border: "1px solid var(--hairline)",
                borderRadius: "var(--r-card)",
                textDecoration: "none",
              }}
            >
              <Image
                src={`/icons/services/${s.icon}`}
                alt={s.label}
                width={72}
                height={72}
                style={{ width: 72, height: 72, objectFit: "contain" }}
              />
              <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink)", textAlign: "center" }}>
                {s.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
