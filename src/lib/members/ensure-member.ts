import "server-only";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Idempotently ensure a `members` row exists for the signed-in Supabase Auth user.
 *
 * Called from the authenticated surface layouts so the first authenticated server
 * request after sign-in provisions the member. Safe to call on every authenticated
 * render: it issues `INSERT ... ON CONFLICT DO NOTHING`, authorized by the
 * `members_insert_self` RLS policy (the row's `auth_user_id` must equal the JWT
 * `sub`), so no service-role key is ever involved.
 *
 * No-op when there is no authenticated user.
 */
export async function ensureMember(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("members")
    .upsert(
      { auth_user_id: user.id },
      { onConflict: "auth_user_id", ignoreDuplicates: true },
    );

  if (error) {
    // Provisioning failure shouldn't blank the page — surface it for diagnosis
    // and let the render continue (RLS will simply show the user no rows).
    console.error("ensureMember: failed to provision member", error);
  }
}
