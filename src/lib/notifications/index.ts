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

export interface NotificationPrefs {
  offers: boolean;
  jobUpdates: boolean;
  payments: boolean;
}

/** The member's notification preferences (defaults all-on when no row). */
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const sb = await createServerSupabaseClient();
  const { data } = await sb
    .from("notification_preferences")
    .select("offers, job_updates, payments")
    .maybeSingle();
  return {
    offers: data?.offers ?? true,
    jobUpdates: data?.job_updates ?? true,
    payments: data?.payments ?? true,
  };
}
