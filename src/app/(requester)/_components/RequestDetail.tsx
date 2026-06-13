"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, VerifiedCheck, CategoryIcon } from "@/components/ui";
import { awardQuote, type ServiceRequest, type Quote } from "@/lib/requester/requests";
import { useRequest, useQuotes } from "./useRequests";
import { Button } from "./controls";
import { StatusPill } from "./StatusPill";
import { IconStar, IconPin, IconClock } from "./icons";

/**
 * RequestDetail — one screen that renders by lifecycle status: the finding wait,
 * the offer (quote) card, then the tracking view once a quote is awarded. Reads
 * live from the store so the mock timers (finding→quoted, awarded→enroute) move
 * the UI on their own. Stops at tracking — no payment/messaging this slice.
 */
export function RequestDetail({ id }: { id: string }) {
  const request = useRequest(id);
  const quotes = useQuotes(id);
  const [declined, setDeclined] = useState(false);
  const [accepting, setAccepting] = useState(false);

  if (!request) return <NotAvailable />;

  const quote = quotes[0];
  const awardedQuote = quotes.find((q) => q.id === request.awardedQuoteId) ?? quote;
  const tracking = request.status === "awarded" || request.status === "enroute";

  async function accept(q: Quote) {
    setAccepting(true);
    await awardQuote(id, q.id); // store emits → this screen re-renders into tracking
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Summary request={request} />

      {request.status === "finding" && <FindingState />}

      {request.status === "quoted" && quote && !declined && (
        <OfferCard quote={quote} accepting={accepting} onAccept={() => accept(quote)} onDecline={() => setDeclined(true)} />
      )}
      {request.status === "quoted" && declined && <DeclinedNote />}

      {tracking && awardedQuote && <Tracking request={request} quote={awardedQuote} />}
    </div>
  );
}

// --- request summary -------------------------------------------------------
function Summary({ request }: { request: ServiceRequest }) {
  const timing = request.scheduledFor
    ? new Date(request.scheduledFor).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : request.urgency === "whenever"
      ? "Flexible timing"
      : "As soon as possible";
  return (
    <div style={{ display: "flex", gap: 12, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 14 }}>
      <CategoryIcon category={request.category} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>{request.title ?? "Request"}</span>
          <StatusPill status={request.status} />
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "4px 0 8px", fontFamily: "var(--font-ui)", lineHeight: 1.4 }}>{request.description}</p>
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconPin size={13} /> {request.locationLabel}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><IconClock size={13} /> {timing}</span>
        </div>
      </div>
    </div>
  );
}

// --- finding (warm human moment) -------------------------------------------
function FindingState() {
  return (
    <div style={{ background: "var(--moment)", borderRadius: "var(--r-lg)", padding: "28px 24px", textAlign: "center" }}>
      <style>{"@keyframes kc-pulse{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}"}</style>
      <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 14 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 9, height: 9, borderRadius: "var(--r-pill)", background: "var(--terracotta)", animation: "kc-pulse 1.1s var(--ease) infinite", animationDelay: `${i * 0.18}s` }} />
        ))}
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, lineHeight: 1.15, margin: 0, color: "var(--ink)" }}>
        Finding pros near<br />Breckenridge…
      </p>
      <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "8px 0 0", fontFamily: "var(--font-ui)" }}>We’ll ping you the moment a quote comes in.</p>
    </div>
  );
}

// --- offer (quote) card ----------------------------------------------------
function OfferCard({ quote, accepting, onAccept, onDecline }: { quote: Quote; accepting: boolean; onAccept: () => void; onDecline: () => void }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 16, boxShadow: "var(--shadow-card)" }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 12 }}>Quote in</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={quote.providerName} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>
            {quote.providerName}
            {quote.verified && <VerifiedCheck size={15} />}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "var(--ink-2)", fontFamily: "var(--font-ui)", marginTop: 1 }}>
            <IconStar size={13} /> {quote.rating.toFixed(1)}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>${quote.price}</div>
          {quote.etaLabel && <div style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>{quote.etaLabel}</div>}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <Button variant="secondary" full onClick={onDecline} disabled={accepting}>Decline</Button>
        </div>
        <div style={{ flex: 2 }}>
          <Button variant="primary" full onClick={onAccept} disabled={accepting}>{accepting ? "Accepting…" : "Accept quote"}</Button>
        </div>
      </div>
    </div>
  );
}

function DeclinedNote() {
  return (
    <div style={{ background: "var(--neutral)", borderRadius: "var(--r-card)", padding: "18px 16px", textAlign: "center" }}>
      <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, fontFamily: "var(--font-ui)" }}>You declined this quote. We’ll keep looking for more pros.</p>
    </div>
  );
}

// --- tracking (awarded / enroute) ------------------------------------------
function Tracking({ request, quote }: { request: ServiceRequest; quote: Quote }) {
  const live = request.status === "enroute";
  const statusLine = live
    ? `On the way${request.etaMinutes ? ` · ${request.etaMinutes} min` : ""}`
    : request.scheduledFor
      ? "Booked · scheduled"
      : "Booked · heading out shortly";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 14 }}>
        <span style={{ padding: 2, borderRadius: "var(--r-pill)", background: live ? "var(--terracotta)" : "var(--hairline)" }}>
          <Avatar name={quote.providerName} size={44} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>
            {quote.providerName}
            {quote.verified && <VerifiedCheck size={15} />}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6, marginTop: 2, fontFamily: "var(--font-ui)" }}>
            {live && <span style={{ width: 6, height: 6, borderRadius: "var(--r-pill)", background: "var(--terracotta)" }} />}
            {statusLine}
          </div>
        </div>
        {request.agreedPrice != null && (
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>${request.agreedPrice}</div>
        )}
      </div>

      <div style={{ background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 16 }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>Job</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>{request.title ?? "Request"}</div>
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "4px 0 0", fontFamily: "var(--font-ui)", lineHeight: 1.4 }}>{request.description}</p>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--font-ui)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IconPin size={13} /> {request.locationLabel}
        </div>
      </div>
    </div>
  );
}

function NotAvailable() {
  return (
    <div style={{ textAlign: "center", padding: "48px 16px" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)", margin: "0 0 6px" }}>Request not available</p>
      <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "0 0 18px", fontFamily: "var(--font-ui)" }}>The demo store resets on a full reload. Post a new request to see the loop.</p>
      <Link href="/app/new" style={{ display: "inline-flex", height: 46, alignItems: "center", padding: "0 22px", borderRadius: "var(--r-pill)", background: "var(--terracotta)", color: "var(--cream)", fontWeight: 600, fontSize: 15, fontFamily: "var(--font-ui)", textDecoration: "none" }}>
        Post a request
      </Link>
    </div>
  );
}
