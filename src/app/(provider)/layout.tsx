// Cool, dark-chrome work tool for the trades (providers). Auth-gated by
// src/proxy.ts. Mobile-first: a centered ~420px column on dark --chrome.
// <Surface tone="dark"> remaps the design tokens so every shared primitive
// renders chrome/bright automatically. The first authenticated server request
// provisions the member (D11).
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";
import { ensureMember } from "@/lib/members/ensure-member";

export default async function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await ensureMember();
  return (
    <Surface tone="dark" className="flex-1">
      <div
        data-surface="provider"
        style={{
          maxWidth: "var(--app-width)",
          height: "100dvh", // fixed app-shell height so only <main> scrolls; header + bottom nav stay pinned
          overflow: "hidden",
          margin: "0 auto",
          background: "var(--chrome)",
          borderInline: "1px solid var(--chrome-line)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </Surface>
  );
}
