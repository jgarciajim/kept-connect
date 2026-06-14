import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as q from "./queries";

export type { Notification } from "./queries";

/** Accessors — create the RLS-scoped client and delegate to ./queries.ts. */
export async function getNotifications() {
  return q.qGetNotifications(await createServerSupabaseClient());
}

export async function getUnreadCount() {
  return q.qGetUnreadCount(await createServerSupabaseClient());
}
