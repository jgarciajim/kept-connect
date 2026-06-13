import { AppHeader } from "../../../_components/AppHeader";
import { RequestDetail } from "../../../_components/RequestDetail";

// Request detail (/app/requests/[id]) — one stateful screen (finding → quote →
// tracking). Server shell awaits params; RequestDetail is the live client view.
export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <AppHeader title="Request" backHref="/app/requests" />
      <main style={{ flex: 1, overflowY: "auto", padding: "8px 16px 20px" }}>
        <RequestDetail id={id} />
      </main>
    </>
  );
}
