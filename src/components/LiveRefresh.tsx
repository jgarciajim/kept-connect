"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * LiveRefresh — polls the server component back to life. Calls router.refresh()
 * on an interval (re-running the page's RLS-scoped fetch without a full reload or
 * losing client state), so screens that wait on the OTHER party update on their
 * own. Pauses while the tab is hidden; pass enabled=false at terminal states to
 * stop. Renders nothing.
 *
 * A pragmatic stand-in for Supabase Realtime — same screens can swap to a
 * postgres_changes subscription later behind this same seam.
 */
export function LiveRefresh({ intervalMs = 5000, enabled = true }: { intervalMs?: number; enabled?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs, enabled]);

  return null;
}
