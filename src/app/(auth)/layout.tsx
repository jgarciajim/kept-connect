// Auth pages (sign-in, sign-up, password reset). Own route group so they get the
// design-system styles without the app shells' member provisioning / gates.
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Surface tone="light" className="flex-1">
      <div style={{ minHeight: "100dvh", background: "var(--canvas)", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </Surface>
  );
}
