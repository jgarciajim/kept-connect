import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { emailForMember } from "./recipient";
import { sendEmail } from "./send";
import type { BuiltEmail } from "./templates";

/**
 * Resolve a member's email (authorization-gated) and send them one transactional
 * message. Never throws — a failed lookup or send is logged and swallowed, so the
 * caller's primary action is never broken by email. The builder receives the
 * recipient's display name so templates can greet them.
 */
export async function notifyMember(
  sb: SupabaseClient,
  memberId: string,
  build: (name: string | null) => BuiltEmail,
): Promise<void> {
  try {
    const recipient = await emailForMember(sb, memberId);
    if (!recipient) return;
    await sendEmail({ to: recipient.email, ...build(recipient.name) });
  } catch (err) {
    console.error("notifyMember: unexpected failure", err);
  }
}
