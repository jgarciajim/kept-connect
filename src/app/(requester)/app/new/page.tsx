import { Suspense } from "react";
import { getSubjobEstimates } from "@/lib/requester/mock";
import { AppHeader } from "../../_components/AppHeader";
import { Composer } from "../../_components/Composer";

// The composer (/app/new). Server shell; the form is a client island wrapped in
// Suspense because it reads useSearchParams (?service= / ?category=). Real "near
// you" estimates (median of verified pros' flat sub-job prices) are fetched here
// and passed in — the composer prefers them over the static benchmark.
export default async function NewRequestPage() {
  const estimates = await getSubjobEstimates();
  return (
    <>
      <AppHeader title="New request" backHref="/app" />
      <main style={{ flex: 1, overflowY: "auto", padding: "6px 16px 16px" }}>
        <Suspense fallback={null}>
          <Composer estimates={estimates} />
        </Suspense>
      </main>
    </>
  );
}
