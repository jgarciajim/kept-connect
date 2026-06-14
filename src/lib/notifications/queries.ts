import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Notifications data layer — PURE query functions (take a Supabase client). RLS
 * scopes every row to the recipient (member_id = current_member_id()).
 */

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  requestId: string | null;
  read: boolean;
  when: string;
}

function relativeWhen(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export async function qGetNotifications(c: SupabaseClient): Promise<Notification[]> {
  const { data } = await c
    .from("notifications")
    .select("id, type, title, body, request_id, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []).map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body ?? null,
    requestId: n.request_id ?? null,
    read: n.read_at != null,
    when: relativeWhen(n.created_at),
  }));
}

export async function qGetUnreadCount(c: SupabaseClient): Promise<number> {
  const { count } = await c.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
  return count ?? 0;
}
