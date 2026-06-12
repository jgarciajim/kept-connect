// Warm public marketing site — the warmest expression of the brand (brief §7).
// Nested layout: it must NOT render <html>/<body> (root layout owns those).
// Importing the UI library stylesheet here loads the design tokens + Fraunces/
// Hanken fonts for the whole marketing subtree (consuming the lib, not editing it).
import "@/components/ui/styles/ui.css";
import { Surface } from "@/components/ui";
import { MarketingHeader } from "./_components/MarketingHeader";
import { MarketingFooter } from "./_components/MarketingFooter";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Surface tone="light" className="flex-1">
      <div data-surface="marketing">
        <MarketingHeader />
        {children}
        <MarketingFooter />
      </div>
    </Surface>
  );
}
