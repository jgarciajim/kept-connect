import { Suspense } from "react";
import { AppHeader } from "../../_components/AppHeader";
import { Composer } from "../../_components/Composer";

// The composer (/app/new). Server shell; the form is a client island wrapped in
// Suspense because it reads useSearchParams (?service= / ?category=).
export default function NewRequestPage() {
  return (
    <>
      <AppHeader title="New request" backHref="/app" />
      <main style={{ flex: 1, overflowY: "auto", padding: "6px 16px 16px" }}>
        <Suspense fallback={null}>
          <Composer />
        </Suspense>
      </main>
    </>
  );
}
