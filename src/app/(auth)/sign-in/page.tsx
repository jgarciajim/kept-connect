import { AuthForm } from "@/components/auth/AuthForm";
import { safeNext } from "@/lib/auth/safe-next";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <AuthForm
        mode="sign-in"
        next={safeNext(next, "/app")}
        initialError={error === "link" ? "That link expired or was already used. Sign in again, or request a new one." : null}
      />
    </main>
  );
}
