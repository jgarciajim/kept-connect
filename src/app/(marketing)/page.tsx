import { KeptConnectLogo } from "@/components/KeptConnectLogo";

// Public landing page → "/"
export default function MarketingHome() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <KeptConnectLogo className="h-12 w-auto" />
      <h1 className="text-4xl font-semibold tracking-tight">Kept Connect</h1>
      <p className="text-lg text-foreground/70">
        Connecting homeowners, property managers, and realtors with trusted trades.
      </p>
      <p className="text-sm text-foreground/50">Marketing surface — placeholder.</p>
    </main>
  );
}
