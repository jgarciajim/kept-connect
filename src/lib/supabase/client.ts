"use client";

import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { useMemo } from "react";

/**
 * Supabase client for Client Components.
 *
 * Same native Third-Party Auth approach as the server helper, but the Clerk
 * session token comes from `useSession()`. Memoized against the active session
 * so the client is recreated when the session changes.
 */
export function useSupabaseBrowserClient() {
  const { session } = useSession();

  return useMemo(
    () =>
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          accessToken: async () => (await session?.getToken()) ?? null,
        },
      ),
    [session],
  );
}
