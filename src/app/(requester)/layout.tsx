// Warm consumer app for requesters (homeowners / PMs / realtors). Auth-gated by
// src/proxy.ts. Mobile-first: a centered ~420px app column on warm --canvas.
// Importing the UI library stylesheet loads the tokens + Fraunces/Hanken fonts
// (consuming the lib, not editing it).
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";

export default function RequesterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Surface tone="light" className="flex-1">
      <div
        data-surface="requester"
        style={{
          maxWidth: "var(--app-width)",
          minHeight: "100dvh",
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
