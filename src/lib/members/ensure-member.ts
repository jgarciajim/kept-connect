import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Idempotently ensure a `members` row exists for the signed-in Clerk user.
 *
 * Called from the authenticated surface layouts so the first authenticated server
 * request after sign-in provisions the member. Safe to call on every authenticated
 * render: it issues `INSERT ... ON CONFLICT DO NOTHING`, authorized by the
 * `members_insert_self` RLS policy (the row's `clerk_user_id` must equal the JWT
 * `sub`), so no service-role key is ever involved.
 *
 * No-op when there is no authenticated user.
 */
export async function ensureMember(): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("members")
    .upsert(
      { clerk_user_id: userId },
      { onConflict: "clerk_user_id", ignoreDuplicates: true },
    );

  if (error) {
    // Provisioning failure shouldn't blank the page — surface it for diagnosis
    // and let the render continue (RLS will simply show the user no rows).
    console.error("ensureMember: failed to provision member", error);
  }
}
