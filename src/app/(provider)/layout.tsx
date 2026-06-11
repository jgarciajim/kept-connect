// Cool, dark-chrome work tool for the trades (providers).
// Nested layout — no <html>/<body> here. Dark chrome is scoped to this surface
// via a wrapper rather than a global theme, so it never leaks into the warm surfaces.
export default function ProviderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div data-surface="provider" className="flex-1 bg-neutral-950 text-neutral-100">
      {children}
    </div>
  );
}
