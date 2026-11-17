import { redirect } from "next/navigation";

// The provider sign-up entry (marketing CTA + sign-up redirect target). The simple
// name+trades form was folded into the full self-serve funnel at /work/onboarding.
export default function StartScreen() {
  redirect("/work/onboarding");
}
