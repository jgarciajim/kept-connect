import { AuthForm } from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/auth/safe-next";

// New accounts go through the gated /welcome onboarding funnel
// (which forwards already-onboarded members straight to /app).
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <AuthForm mode="sign-up" next={safeNext(next, "/welcome")} />
    </main>
  );
}
