import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for Server Components / Route Handlers / Server Actions.
 *
 * Authenticates with Supabase via Clerk's NATIVE Third-Party Auth integration:
 * the Clerk session token is passed through Supabase's `accessToken` option, so
 * every request carries `Authorization: Bearer <clerk-token>` and Supabase RLS
 * can read the Clerk user from the verified JWT. No deprecated JWT template.
 *
 * Note: with `accessToken` set, `supabase.auth.*` is intentionally unavailable —
 * auth is owned by Clerk.
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => (await getToken()) ?? null,
    },
  );
}
