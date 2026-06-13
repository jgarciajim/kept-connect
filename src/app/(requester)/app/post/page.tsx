import { getServices } from "@/lib/requester/mock";
import { Composer } from "../../_components/Composer";

// Server component: fetch the fixed-price quick-job catalog, hand it to the
// client Composer (Quick job → instant dispatch, Custom project → quote).
export default async function PostPage() {
  const services = await getServices();
  return <Composer services={services} />;
}
