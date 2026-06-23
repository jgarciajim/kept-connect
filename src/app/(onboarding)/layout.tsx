// Customer onboarding shell (/welcome). Its OWN route group — outside the
// (requester) layout that gates on onboarding — so the gate's redirect here can't
// loop. Warm app column, no bottom nav (a focused funnel).
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";
import { ensureMember } from "@/lib/members/ensure-member";

export default async function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await ensureMember();
  return (
    <Surface tone="light" className="flex-1">
      <div
        data-surface="requester"
        style={{
          maxWidth: "var(--app-width)",
          height: "100dvh",
          overflow: "hidden",
          position: "relative",
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
