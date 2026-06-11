// Warm consumer app for requesters (homeowners / PMs / realtors).
// Nested layout — no <html>/<body> here.
export default function RequesterLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div data-surface="requester" className="flex-1">{children}</div>;
}
