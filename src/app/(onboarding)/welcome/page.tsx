import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentMember, getRequesterOnboarded } from "@/lib/requester/mock";
import { CustomerOnboarding } from "./CustomerOnboarding";

/**
 * Customer onboarding (/welcome). Already set up → straight to the app. Otherwise
 * run the short funnel (intro → name → primary property). Name is prefilled from
 * Clerk so it's one tap to confirm.
 */
export default async function WelcomePage() {
  if (await getRequesterOnboarded()) redirect("/app");
  const [member, user] = await Promise.all([getCurrentMember(), currentUser()]);
  const initialName =
    member?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    user?.fullName ||
    "";

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "20px 18px 28px" }}>
      <CustomerOnboarding initialName={initialName} />
    </main>
  );
}
