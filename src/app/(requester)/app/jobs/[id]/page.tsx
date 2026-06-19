import { notFound, redirect } from "next/navigation";
import { Button, Card, Avatar, StatusRing, VerifiedCheck, type RingState } from "@/components/ui";
import { getJob, getQuotes, type Quote } from "@/lib/requester/mock";
import { payAndAward } from "@/lib/payments/actions";
import { rateCard, activeFeeConfig, dollarsToCents, formatUsd } from "@/lib/pricing";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { AppHeader } from "../../../_components/AppHeader";
import { LinkButton } from "../../../_components/LinkButton";
import { IconStar } from "../../../_components/icons";

export default async function MatchScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, quotes] = await Promise.all([getJob(id), getQuotes(id)]);
  if (!job) notFound();
  // Once a provider is assigned (instant accept or awarded quote), this is a live
  // job — the requester belongs on the tracker, not the match/compare screen.
  if (job.provider) redirect(`/app/jobs/${id}/track`);

  const finding = job.status === "finding";
  const ringStates: RingState[] = finding ? ["responding", "responding", "none"] : ["quoted", "quoted", "quoted"];

  return (
    <>
      <AppHeader title="Live match" backHref="/app" />
      {/* live while waiting on a provider; detaches once awarded */}
      <RealtimeRefresh
        topic={`job:${id}`}
        enabled={finding || job.status === "quoted"}
        watch={[
          { table: "requests", filter: `id=eq.${id}` },
          { table: "offers", filter: `request_id=eq.${id}` },
          { table: "quotes", filter: `request_id=eq.${id}` },
        ]}
      />

      <main style={{ flex: 1, overflowY: "auto", padding: "8px 18px 20px" }}>
        {/* warm moment — the signature live-match status */}
        <div style={{ background: "var(--moment)", borderRadius: "var(--r-lg)", padding: "28px 24px 30px", textAlign: "center", marginBottom: 18 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, lineHeight: 1.12, letterSpacing: "-0.015em", margin: 0, color: "var(--ink)" }}>
            {finding ? <>Finding your<br />provider…</> : <>{quotes.length} quotes in</>}
          </p>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "10px 0 22px", fontFamily: "var(--font-ui)" }}>
            {finding ? `Dispatched to vetted pros near ${job.locationLabel}.` : "Sealed quotes — compare and award."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
            {quotes.map((q, i) => (
              <div key={q.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: ringStates[i] === "none" ? 0.4 : 1 }}>
                <StatusRing state={ringStates[i] ?? "none"} size={46}>
                  <Avatar name={q.provider.name} size={46} />
                </StatusRing>
                <span style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 500, fontFamily: "var(--font-ui)" }}>{q.provider.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {!finding && (
          <>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "2px 4px 10px", fontFamily: "var(--font-ui)" }}>Sealed quotes · pick one</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {quotes.map((q, i) => (
                <QuoteCard key={q.id} quote={q} jobId={job.id} best={i === 0} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function QuoteCard({ quote, jobId, best }: { quote: Quote; jobId: string; best: boolean }) {
  const p = quote.provider;
  // All-in the requester pays = the quote + the service fee (lib/pricing, SEED).
  const rc = rateCard(dollarsToCents(Number(quote.price)), activeFeeConfig);
  const fee = formatUsd(rc.requesterFee);
  const allIn = formatUsd(rc.requesterAllIn);
  return (
    <Card tone="paper" padding={14} lift={best}>
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <Avatar name={p.name} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14.5, color: "var(--ink)" }}>{p.name}</span>
            {p.verified && <VerifiedCheck size={14} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2, color: "var(--ink-2)", fontSize: 12.5, fontFamily: "var(--font-ui)" }}>
            <span style={{ color: "var(--terracotta)", display: "flex" }}><IconStar size={12} /></span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500, color: "var(--ink)" }}>{p.rating}</span>
            <span style={{ color: "var(--ink-3)" }}>· {p.jobsDone} jobs</span>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-ui)", fontSize: 19, fontWeight: 500, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>${quote.price}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1, fontFamily: "var(--font-ui)" }}>
            {quote.eta} · +{fee} service fee → {allIn} all-in
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <LinkButton href={`/app/providers/${p.id}?job=${jobId}`} variant="ghost" size="sm">Profile</LinkButton>
          {/* Pay & confirm: opens escrow held until the job's done */}
          <form action={payAndAward}>
            <input type="hidden" name="quoteId" value={quote.id} />
            <Button type="submit" variant={best ? "primary" : "outline"} size="sm">Pay · {allIn}</Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
