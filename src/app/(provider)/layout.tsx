// Cool, dark-chrome work tool for the trades (providers).
// Nested layout — no <html>/<body> here. Dark chrome is scoped to this surface
// via a wrapper rather than a global theme, so it never leaks into the warm surfaces.
import { ensureMember } from "@/lib/members/ensure-member";

export default async function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // First authenticated server request into this surface provisions the member.
  await ensureMember();
  return (
    <div data-surface="provider" className="flex-1 bg-neutral-950 text-neutral-100">
      {children}
    </div>
  );
}
