import Link from "next/link";
import { KeptConnectLogo, CategoryIcon } from "@/components/ui";
import { getProviderSelf, getCurrentOffer, getScheduledJobs, getOpenRequests } from "@/lib/provider/mock";
import { LiveRefresh } from "@/components/LiveRefresh";
import { VBottomNav } from "../_components/VBottomNav";
import { OfferCard } from "../_components/OfferCard";
import { ProviderEmptyState } from "../_components/ProviderEmptyState";

export default async function FeedScreen() {
  const [self, offer, scheduled, openRequests] = await Promise.all([
    getProviderSelf(),
    getCurrentOffer(),
    getScheduledJobs(),
    getOpenRequests(),
  ]);

  if (!self) return <ProviderEmptyState tab="jobs" />;

  return (
    <>
      {/* new open requests + accepted-offer changes appear without a manual refresh */}
      <LiveRefresh intervalMs={8000} />
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 2px 2px" }}>
          <KeptConnectLogo variant="mark" treatment="app-icon" size={30} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 16, color: "var(--chrome-cream)" }}>
            Morning, {self.name.split(" ")[0]}
          </span>
          {self.online && (
            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--verified-bright)", fontFamily: "var(--font-ui)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "var(--r-pill)", background: "var(--verified-bright)" }} /> Online
            </span>
          )}
        </div>

        {/* fast-pay earn strip — always reachable */}
        <div style={{ display: "flex", alignItems: "center", background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: "13px 15px", marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>Available to cash out</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 21, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums", marginTop: 1 }}>${self.availableToCashOut}</div>
          </div>
          <Link
            href="/work/earnings"
            style={{ marginLeft: "auto", background: "var(--terracotta-bright)", color: "var(--cream)", fontSize: 12.5, fontWeight: 500, borderRadius: "var(--r-pill)", padding: "9px 15px", textDecoration: "none", fontFamily: "var(--font-ui)" }}
          >
            Cash out
          </Link>
        </div>

        {/* live round-robin offer */}
        <SectionHead>New offer</SectionHead>
        {offer ? (
          <OfferCard offer={offer} />
        ) : (
          <div style={{ color: "var(--chrome-dim)", fontSize: 13, padding: "8px 4px", fontFamily: "var(--font-ui)" }}>No offers right now — hang tight.</div>
        )}

        {/* open requests in your trade — browse + send an offer */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "18px 4px 9px" }}>
          <span style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>Open requests near you</span>
          <Link href="/work/rates" style={{ fontSize: 11.5, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)", textDecoration: "none", fontWeight: 500 }}>
            Set your rates
          </Link>
        </div>
        {openRequests.length === 0 ? (
          <div style={{ color: "var(--chrome-dim)", fontSize: 13, padding: "8px 4px", fontFamily: "var(--font-ui)" }}>No open requests in your trade right now.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {openRequests.map((r) => (
              <Link
                key={r.id}
                href={`/work/requests/${r.id}`}
                style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: "11px 12px", textDecoration: "none" }}
              >
                <CategoryIcon category={r.trade} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{r.place} · {r.when}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)", fontWeight: 500, flex: "0 0 auto" }}>Offer →</span>
              </Link>
            ))}
          </div>
        )}

        {/* scheduled */}
        <SectionHead>Scheduled today</SectionHead>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scheduled.map((job) => (
            <Link
              key={job.id}
              href="/work/jobs/active"
              style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: "11px 12px", textDecoration: "none" }}
            >
              <CategoryIcon category={job.trade} size={36} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{job.title}</div>
                <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{job.place}</div>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
                {job.time}
                <br />
                <span style={{ color: "var(--chrome-cream)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>${job.pay}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <VBottomNav active="jobs" />
    </>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", margin: "18px 4px 9px", fontFamily: "var(--font-ui)" }}>{children}</div>;
}
