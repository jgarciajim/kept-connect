import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Button, Card, Avatar, StatusRing, VerifiedCheck, Tag } from "@/components/ui";
import { getProvider, getQuotes } from "@/lib/requester/mock";
import { awardQuote } from "@/lib/requester/actions";
import { AppHeader } from "../../../_components/AppHeader";
import { IconStar, IconCheck, IconChat } from "../../../_components/icons";

export default async function ProfileScreen({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ job?: string }>;
}) {
  const { id } = await params;
  const { job } = await searchParams;
  const provider = await getProvider(id);
  if (!provider) notFound();

  // The sealed quote (if any) this provider gave on the linked job → Award footer.
  const quote = job ? (await getQuotes(job)).find((q) => q.provider.id === id) : undefined;

  return (
    <>
      <AppHeader
        title="Provider"
        backHref={job ? `/app/jobs/${job}` : "/app"}
        right={<span style={{ color: "var(--ink-3)", display: "flex" }}><IconChat /></span>}
      />

      <main style={{ flex: 1, overflowY: "auto" }}>
        {/* warm header band */}
        <div style={{ background: "var(--moment)", padding: "8px 22px 22px", display: "flex", alignItems: "center", gap: 16 }}>
          <StatusRing state="quoted" size={66}>
            <Avatar name={provider.name} size={66} />
          </StatusRing>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink)", letterSpacing: "-0.01em" }}>{provider.name}</span>
              {provider.verified && <VerifiedCheck size={18} />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 14, color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>
              <span style={{ color: "var(--terracotta)", display: "flex" }}><IconStar size={14} /></span>
              <span style={{ fontWeight: 500, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{provider.rating}</span>
              <span style={{ color: "var(--ink-3)" }}>· {provider.jobsDone} jobs</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 18 }}>
          {/* stats — clean paper data */}
          <Card tone="paper" padding={4} style={{ display: "flex", marginBottom: 16 }}>
            <Stat value={String(provider.jobsDone)} label="Jobs done" />
            <Divider />
            <Stat value={provider.rating.toFixed(1)} label="Rating" />
            <Divider />
            <Stat value={`${provider.yearsOnKept} yr`} label="On Kept" />
          </Card>

          <Section label="Verified credentials">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {provider.credentials.map((c) => (
                <Tag key={c} icon={<IconCheck size={12} />}>{c}</Tag>
              ))}
            </div>
          </Section>

          <Section label="Trades">
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {provider.trades.map((t) => (
                <Tag key={t} variant="trade">{t}</Tag>
              ))}
            </div>
          </Section>

          {provider.reviews.length > 0 && (
            <Section label="Reviews" last>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {provider.reviews.map((r) => (
                  <Card key={r.id} tone="paper" padding={14}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                      <Avatar name={r.author} size={28} />
                      <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{r.author}</span>
                      <span style={{ marginLeft: "auto", display: "flex", gap: 1, color: "var(--terracotta)" }}>
                        {Array.from({ length: r.stars }).map((_, i) => (
                          <IconStar key={i} size={12} />
                        ))}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{r.text}</p>
                    <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>{r.when}</p>
                  </Card>
                ))}
              </div>
            </Section>
          )}
        </div>
      </main>

      {quote && (
        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--hairline)", background: "var(--canvas)", display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>Sealed quote</div>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 20, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>${quote.price}</div>
          </div>
          <form action={awardQuote} style={{ flex: 1 }}>
            <input type="hidden" name="quoteId" value={quote.id} />
            <input type="hidden" name="requestId" value={job} />
            <Button type="submit" size="lg" fullWidth>Award</Button>
          </form>
        </div>
      )}
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "4px 0" }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 19, fontWeight: 500, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, background: "var(--hairline)", margin: "10px 0" }} />;
}

function Section({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 18 }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 500, marginBottom: 9 }}>{label}</div>
      {children}
    </div>
  );
}
