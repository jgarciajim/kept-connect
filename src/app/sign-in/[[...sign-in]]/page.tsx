import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      {/* Land in the app after sign-in. fallback (not force) so a redirect_url
          from a protected-route bounce is still honored. */}
      <SignIn fallbackRedirectUrl="/app" />
    </main>
  );
}
