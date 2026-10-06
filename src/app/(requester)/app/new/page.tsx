import { Suspense } from "react";
import { getSubjobEstimates, getMyProperties } from "@/lib/requester/mock";
import { AppHeader } from "../../_components/AppHeader";
import { Composer } from "../../_components/Composer";

// The composer (/app/new). Server shell; the form is a client island wrapped in
// Suspense because it reads useSearchParams (?service= / ?category=). Real "near
// you" estimates (median of verified pros' flat sub-job prices) are fetched here
// and passed in — the composer prefers them over the static benchmark.
export default async function NewRequestPage() {
  const [estimates, properties] = await Promise.all([getSubjobEstimates(), getMyProperties()]);
  const def = properties.find((p) => p.isDefault) ?? properties[0];
  const defaultProperty = def ? { addressLine: def.addressLine, lat: def.lat, lng: def.lng } : undefined;
  return (
    <>
      <AppHeader title="New request" backHref="/app" />
      <main style={{ flex: 1, overflowY: "auto", padding: "6px 16px 16px" }}>
        <Suspense fallback={null}>
          <Composer estimates={estimates} defaultProperty={defaultProperty} />
        </Suspense>
      </main>
    </>
  );
}
