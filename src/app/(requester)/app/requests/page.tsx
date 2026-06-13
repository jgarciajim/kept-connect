import { AppHeader } from "../../_components/AppHeader";
import { BottomNav } from "../../_components/BottomNav";
import { RequestsList } from "../../_components/RequestsList";

// Activity list (/app/requests) of the requester's jobs.
export default function RequestsPage() {
  return (
    <>
      <AppHeader title="Your requests" backHref="/app" />
      <main style={{ flex: 1, overflowY: "auto", padding: "8px 16px 18px" }}>
        <RequestsList />
      </main>
      <BottomNav active="jobs" />
    </>
  );
}
