"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";

/**
 * Supabase client for Client Components. Reads the same cookie session the
 * server and proxy use (createBrowserClient is a singleton in the browser).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function useSupabaseBrowserClient() {
  return useMemo(() => createSupabaseBrowserClient(), []);
}
