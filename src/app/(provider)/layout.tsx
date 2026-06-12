// Cool, dark-chrome work tool for the trades (providers). Auth-gated by
// src/proxy.ts. Mobile-first: a centered ~420px column on dark --chrome.
// <Surface tone="dark"> remaps the design tokens so every shared primitive
// renders chrome/bright automatically — no per-component dark code.
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";

export default function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Surface tone="dark" className="flex-1">
      <div
        data-surface="provider"
        style={{
          maxWidth: "var(--app-width)",
          minHeight: "100dvh",
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
