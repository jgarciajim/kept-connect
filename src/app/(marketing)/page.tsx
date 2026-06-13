import type { Metadata } from "next";
import { Hero } from "./_components/Hero";
import { HowItWorks } from "./_components/HowItWorks";
import { ServicesShowcase } from "./_components/ServicesShowcase";
import { TrustStrip } from "./_components/TrustStrip";
import { ForProviders } from "./_components/ForProviders";

export const metadata: Metadata = {
  title: "Kept Connect — the Uber for getting things done at a property",
  description:
    "Post a job, get matched with a vetted local pro, and watch it get done. Payment held safe until the work is finished.",
};

// Public landing page → "/" (static; no auth, no data).
export default function MarketingHome() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <ServicesShowcase />
      <TrustStrip />
      <ForProviders />
    </main>
  );
}
