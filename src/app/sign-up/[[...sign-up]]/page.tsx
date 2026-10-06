import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      {/* New accounts go through the gated /welcome onboarding funnel. */}
      <SignUp fallbackRedirectUrl="/welcome" />
    </main>
  );
}
