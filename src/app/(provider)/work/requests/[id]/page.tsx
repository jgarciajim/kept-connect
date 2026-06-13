import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/ui";
import { getOpenRequest, getProviderRates } from "@/lib/provider/mock";
import { VBottomNav } from "../../../_components/VBottomNav";
import { PIconBack } from "../../../_components/icons";
import { SendOfferControls } from "./SendOfferControls";

/**
 * Provider's view of an open request → send an offer (at their own rate) or a
 * custom sealed quote. Dark chrome; one clear action. The offered price always
 * traces to the provider's rate — never a platform number.
 */
export default async function OpenRequestScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [request, rates] = await Promise.all([getOpenRequest(id), getProviderRates()]);
  if (!request) notFound();

  const ownRate = request.serviceSlug ? rates.find((r) => r.serviceSlug === request.serviceSlug) ?? null : null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px" }}>
        <Link
          href="/work"
          aria-label="Back"
          style={{ width: 30, height: 30, borderRadius: "var(--r-pill)", background: "var(--chrome-card)", color: "var(--chrome-cream)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}
        >
          <PIconBack size={20} />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, color: "var(--chrome-cream)" }}>{request.title}</span>
      </div>

      <main style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ display: "flex", gap: 12, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 14 }}>
          <CategoryIcon category={request.trade} size={44} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{request.title}</div>
            <div style={{ fontSize: 12, color: "var(--chrome-dim)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{request.place} · {request.when}</div>
            {request.description && (
              <p style={{ fontSize: 13, color: "var(--chrome-dim)", margin: "8px 0 0", fontFamily: "var(--font-ui)", lineHeight: 1.4 }}>{request.description}</p>
            )}
          </div>
        </div>

        <SendOfferControls requestId={request.id} ownRate={ownRate?.amount ?? null} rateSource={ownRate?.rateSource ?? null} />
      </main>

      <VBottomNav active="jobs" />
    </>
  );
}
