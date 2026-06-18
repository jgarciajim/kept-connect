import { CategoryIcon, CATEGORIES, type CategoryKey } from "@/components/ui";
import { getInstantServices, getMyProperties, type InstantService } from "@/lib/requester/mock";
import { postInstantJob } from "@/lib/requester/actions";
import { AppHeader } from "../../_components/AppHeader";
import { BottomNav } from "../../_components/BottomNav";

/**
 * Book now — the instant, fixed-price catalog. One tap posts an 'instant' request;
 * the round-robin dispatch engine offers it to the nearest eligible pro at the set
 * price (first to accept wins). No quotes, no bidding — set rate, paid on completion.
 */
export default async function BookScreen() {
  const [services, properties] = await Promise.all([getInstantServices(), getMyProperties()]);
  const defaultAddress = properties.find((p) => p.isDefault)?.addressLine ?? properties[0]?.addressLine ?? "";

  // Group by category so the --cat-* colors cluster, like the Services screen.
  const families = Array.from(new Set(services.map((s) => s.category)));
  const groups = families.map((family) => ({
    family,
    label: CATEGORIES[family].label,
    items: services.filter((s) => s.category === family),
  }));

  return (
    <>
      <AppHeader title="Book now" backHref="/app" />

      <main style={{ flex: 1, overflowY: "auto", padding: "4px 16px 92px" }}>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontFamily: "var(--font-ui)", margin: "2px 2px 18px" }}>
          Fixed-price jobs, matched in minutes. Tap to book — we offer it to the nearest available pro at the set
          rate. You pay on completion.
        </p>

        {services.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-3)", fontFamily: "var(--font-ui)", margin: "0 2px" }}>
            No instant jobs available in your area yet.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.family} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 2px 11px" }}>
                <span aria-hidden style={{ width: 8, height: 8, borderRadius: "var(--r-pill)", background: `var(--cat-${group.family})` }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, color: "var(--ink)", margin: 0 }}>{group.label}</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {group.items.map((service) => (
                  <ServiceRow key={service.id} service={service} address={defaultAddress} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <BottomNav active="home" />
    </>
  );
}

// One bookable fixed-price job. The "Book now" submit posts the instant request
// (server action); category/title/price all come from the catalog, never the client.
function ServiceRow({ service, address }: { service: InstantService; address: string }) {
  return (
    <form
      action={postInstantJob}
      style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: 16, padding: 12 }}
    >
      <input type="hidden" name="serviceId" value={service.id} />
      <input type="hidden" name="locationLabel" value={address} />
      <CategoryIcon category={service.category as CategoryKey} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>{service.name}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-ui)", marginTop: 1 }}>
          <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-2)" }}>${service.price}</span> · set rate
        </div>
      </div>
      <button
        type="submit"
        style={{ flex: "0 0 auto", background: "var(--terracotta)", color: "var(--cream)", fontSize: 13, fontWeight: 600, borderRadius: "var(--r-pill)", padding: "9px 16px", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)" }}
      >
        Book now
      </button>
    </form>
  );
}
