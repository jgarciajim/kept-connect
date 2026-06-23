// Warm consumer app for requesters (homeowners / PMs / realtors). Auth-gated by
// src/proxy.ts. Mobile-first: a centered ~420px app column on warm --canvas.
// Importing the UI library stylesheet loads the tokens + Fraunces/Hanken fonts.
// The first authenticated server request provisions the member (D11).
import { redirect } from "next/navigation";
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";
import { ensureMember } from "@/lib/members/ensure-member";
import { getRequesterOnboarded } from "@/lib/requester/mock";

export default async function RequesterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await ensureMember();
  // Require the basics (name + a property) before the app. /welcome lives outside
  // this layout (the (onboarding) group), so there's no redirect loop.
  if (!(await getRequesterOnboarded())) redirect("/welcome");
  return (
    <Surface tone="light" className="flex-1">
      <div
        data-surface="requester"
        style={{
          maxWidth: "var(--app-width)",
          height: "100dvh", // fixed app-shell height so only <main> scrolls; header stays pinned
          overflow: "hidden",
          position: "relative", // anchor the floating bottom nav (absolute) to this column
          margin: "0 auto",
          background: "var(--canvas)",
          borderInline: "1px solid var(--hairline)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </Surface>
  );
}
