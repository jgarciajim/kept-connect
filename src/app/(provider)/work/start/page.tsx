import { getCurrentMember } from "@/lib/requester/mock";
import { VBottomNav } from "../../_components/VBottomNav";
import { OnboardingForm } from "./OnboardingForm";

// Provider onboarding (/work/start). Creates the provider profile for the current
// member — no SQL seeding. Does not require an existing profile (it makes one).
export default async function StartScreen() {
  const member = await getCurrentMember();

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "14px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "8px 2px 6px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          Become a provider<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--chrome-dim)", margin: "0 2px 22px", fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
          Set up your profile and start taking jobs near you. You can change any of this later.
        </p>

        <OnboardingForm initialName={member?.displayName ?? ""} />
      </main>

      <VBottomNav active="you" />
    </>
  );
}
