import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve a member's email + display name for a transactional send.
 *
 * Email lives in Clerk, not our DB. We first ask the `member_clerk_id` RPC for
 * the member's Clerk id — it returns one ONLY when the caller is authorized
 * (admin / self / shares a request), so this never leaks a stranger's identity —
 * then look the email up in Clerk with the backend SDK.
 *
 * Returns null (caller skips the send) when unauthorized, unknown, or email-less.
 */
export async function emailForMember(
  sb: SupabaseClient,
  memberId: string,
): Promise<{ email: string; name: string | null } | null> {
  const { data: clerkId, error } = await sb.rpc("member_clerk_id", { p_member_id: memberId });
  if (error) {
    console.error("emailForMember: member_clerk_id failed", error);
    return null;
  }
  if (!clerkId || typeof clerkId !== "string") return null;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkId);
    const email =
      user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null;
    if (!email) return null;
    const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || null;
    return { email, name };
  } catch (err) {
    console.error("emailForMember: Clerk lookup failed", err);
    return null;
  }
}
