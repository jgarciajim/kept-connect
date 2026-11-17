"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Sign out of Supabase Auth → back to the marketing home. */
export function SignOutRow() {
  const router = useRouter();
  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
      style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "var(--terracotta)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-ui)", padding: "12px 14px" }}
    >
      Sign out
    </button>
  );
}
