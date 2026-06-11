// =============================================================================
// TEMPORARY — auth plumbing proof. DELETE after verifying Clerk + Supabase wiring.
// Route: /app/whoami  (under (requester); protected by src/proxy.ts)
// =============================================================================
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function WhoAmIPage() {
  const { userId, getToken } = await auth();

  // Confirm we can mint a Clerk session token (the one Supabase will use).
  const token = await getToken();

  // Confirm the server Supabase client initializes with the Clerk token wired in.
  let supabaseInitialized = false;
  let supabaseError: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    supabaseInitialized = typeof supabase.from === "function";
  } catch (err) {
    supabaseError = err instanceof Error ? err.message : String(err);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">Auth plumbing — proof</h1>
      <p className="text-sm text-foreground/50">
        Temporary page. Delete once verified.
      </p>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 font-mono text-sm">
        <dt className="text-foreground/60">Clerk user id</dt>
        <dd>{userId ?? "(none — not signed in)"}</dd>

        <dt className="text-foreground/60">Clerk token present</dt>
        <dd>{token ? `yes (len ${token.length})` : "no"}</dd>

        <dt className="text-foreground/60">Supabase client init</dt>
        <dd>
          {supabaseInitialized
            ? "ok — created with Clerk accessToken"
            : `failed${supabaseError ? `: ${supabaseError}` : ""}`}
        </dd>
      </dl>
    </main>
  );
}
