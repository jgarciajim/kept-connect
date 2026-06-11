// Warm consumer app for requesters (homeowners / PMs / realtors).
// Nested layout — no <html>/<body> here.
import { ensureMember } from "@/lib/members/ensure-member";

export default async function RequesterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // First authenticated server request into this surface provisions the member.
  await ensureMember();
  return <div data-surface="requester" className="flex-1">{children}</div>;
}
