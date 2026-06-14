"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAllRead } from "@/lib/notifications/actions";

/**
 * Marks the viewer's notifications read when the list mounts, then refreshes so
 * the bell badge clears. Renders nothing.
 */
export function MarkReadOnView() {
  const router = useRouter();
  useEffect(() => {
    let done = false;
    markAllRead().then(() => {
      if (!done) router.refresh();
    });
    return () => {
      done = true;
    };
  }, [router]);
  return null;
}
