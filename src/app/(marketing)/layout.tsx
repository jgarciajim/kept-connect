// Warm public marketing site.
// Note: this is a NESTED layout — it must NOT render <html>/<body>
// (the root layout in src/app/layout.tsx owns those).
export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div data-surface="marketing" className="flex-1">{children}</div>;
}
