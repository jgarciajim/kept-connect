import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components / Route Handlers / Server Actions.
 *
 * Auth is Supabase Auth: the session lives in cookies (refreshed by src/proxy.ts),
 * and every request carries the user's Supabase JWT, so RLS reads the user from
 * `auth.jwt() ->> 'sub'` (= auth.users.id) — matched to members.auth_user_id.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component, where cookies are read-only. Safe to
            // ignore: the proxy refreshes the session on every request.
          }
        },
      },
    },
  );
}

/** The signed-in Supabase user (verified with the Auth server), or null. */
export async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
