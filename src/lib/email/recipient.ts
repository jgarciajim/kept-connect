import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve a member's email + display name for a transactional send.
 *
 * Email lives in Supabase Auth (auth.users). The `member_contact` RPC returns it
 * ONLY when the caller is authorized (admin / self / shares a request), so this
 * never leaks a stranger's identity.
 *
 * Returns null (caller skips the send) when unauthorized, unknown, or email-less.
 */
export async function emailForMember(
  sb: SupabaseClient,
  memberId: string,
): Promise<{ email: string; name: string | null } | null> {
  const { data, error } = await sb.rpc("member_contact", { p_member_id: memberId });
  if (error) {
    console.error("emailForMember: member_contact failed", error);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.email !== "string" || !row.email) return null;
  return { email: row.email, name: typeof row.name === "string" && row.name ? row.name : null };
}
