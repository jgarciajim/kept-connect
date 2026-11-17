import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import { getCurrentMember, getRequesterOnboarded } from "@/lib/requester/mock";
import { CustomerOnboarding } from "./CustomerOnboarding";

/**
 * Customer onboarding (/welcome). Already set up → straight to the app. Otherwise
 * run the short funnel (intro → name → primary property). Name is prefilled from
 * the sign-up form / social profile so it's one tap to confirm.
 */
export default async function WelcomePage() {
  if (await getRequesterOnboarded()) redirect("/app");
  const [member, user] = await Promise.all([getCurrentMember(), getAuthUser()]);
  const initialName =
    member?.displayName ||
    (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : "") ||
    "";

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "20px 18px 28px" }}>
      <CustomerOnboarding initialName={initialName} />
    </main>
  );
}
