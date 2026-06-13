import { CATEGORIES, type CategoryKey } from "@/components/ui";
import { getAvailableServices, type ServiceFamily } from "@/lib/requester/services";
import { getActiveCampaigns, badgeFor } from "@/lib/requester/campaigns";
import { AppHeader } from "../../_components/AppHeader";
import { BottomNav } from "../../_components/BottomNav";
import { ServiceTile } from "../../_components/ServiceTile";

const REGION = "summit-co";

// Family display order — groups the catalog so the --cat-* colors cluster
// (two greens = grounds, two slates = structure, three purples = surfaces).
const FAMILY_ORDER: ServiceFamily[] = [
  "water", "power", "climate", "structure", "surfaces", "grounds", "care", "fixtures",
];

export default async function ServicesScreen() {
  const now = new Date();
  const [services, campaigns] = await Promise.all([
    getAvailableServices({ now }),
    getActiveCampaigns({ region: REGION, now }),
  ]);

  // Bucket available services by family, preserving FAMILY_ORDER and catalog order.
  const groups = FAMILY_ORDER.map((family) => ({
    family,
    label: CATEGORIES[family as CategoryKey].label,
    items: services.filter((s) => s.family === family),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <AppHeader title="Services" backHref="/app" />

      <main style={{ flex: 1, overflowY: "auto", padding: "4px 16px 18px" }}>
        <p style={{ fontSize: 13, color: "var(--ink-2)", fontFamily: "var(--font-ui)", margin: "2px 2px 18px" }}>
          Everything available in Summit County right now. Seasonal services appear when they’re in season.
        </p>

        {groups.map((group) => (
          <section key={group.family} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "0 2px 11px" }}>
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: "var(--r-pill)", background: `var(--cat-${group.family})` }} />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, color: "var(--ink)", margin: 0 }}>{group.label}</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {group.items.map((service) => (
                <ServiceTile key={service.slug} service={service} badge={badgeFor(campaigns, service.family)} iconSize={56} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <BottomNav active="home" />
    </>
  );
}
