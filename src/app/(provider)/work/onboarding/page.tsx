import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/requester/mock";
import { getMyVerification, getOnboardingDraft, getSubjobRates } from "@/lib/provider/mock";
import { rateKey, type RateMap } from "./_components/SubjobPricingEditor";
import { OnboardingWizard } from "./OnboardingWizard";

/**
 * Provider onboarding (/work/onboarding) — the single self-serve funnel. Already
 * submitted → show status (pending → the in-review screen; verified → the work
 * feed). 'unsubmitted'/'rejected' → (re)start the wizard, RESUMING from any draft.
 */
export default async function OnboardingScreen() {
  const [member, v] = await Promise.all([getCurrentMember(), getMyVerification()]);
  if (v.status === "pending") redirect("/work/onboarding/done");
  if (v.status === "verified") redirect("/work");

  const [draft, rates] = await Promise.all([getOnboardingDraft(), getSubjobRates()]);
  const initialRates: RateMap = {};
  for (const r of rates) {
    initialRates[rateKey(r.serviceSlug, r.optionSlug)] = {
      serviceSlug: r.serviceSlug,
      optionSlug: r.optionSlug,
      model: r.model === "per_unit" ? "per_unit" : r.model === "tiered" ? "tiered" : r.model === "quote" ? "quote" : "flat",
      amount: r.amount ?? "",
      unit: r.unit ?? "sqft",
      tiers: r.tiers.map((t) => ({ label: t.label, amount: t.amount })),
    };
  }

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "16px 16px 28px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 6px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
        Join Kept Connect<span style={{ color: "var(--terracotta-bright)" }}>.</span>
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--chrome-dim)", margin: "0 2px 20px", fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
        Get verified and set your services & prices. You go live once we approve you.
      </p>

      {v.status === "rejected" && (
        <div style={{ background: "var(--chrome-card)", border: "1px solid var(--terracotta-deep)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>Your last application needs changes</div>
          <div style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", marginTop: 3 }}>{v.reason ?? "Please review and resubmit."}</div>
        </div>
      )}

      <OnboardingWizard initialName={member?.displayName ?? ""} initialDraft={draft} initialRates={initialRates} />
    </main>
  );
}
