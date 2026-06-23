import { redirect } from "next/navigation";

// Verification was folded into the full self-serve funnel. Resubmits land there.
export default function VerifyScreen() {
  redirect("/work/onboarding");
}
