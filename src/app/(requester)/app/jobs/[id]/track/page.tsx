import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, StatusRing, VerifiedCheck } from "@/components/ui";
import { getJob } from "@/lib/requester/mock";
import { getPayment } from "@/lib/payments";
import { LiveRefresh } from "@/components/LiveRefresh";
import { AppHeader } from "../../../../_components/AppHeader";
import { BottomNav } from "../../../../_components/BottomNav";
import { LinkButton } from "../../../../_components/LinkButton";
import { IconPhone, IconChat } from "../../../../_components/icons";

const STEPS: [string, boolean][] = [
  ["Requested", true],
  ["Matched with Marco", true],
  ["On the way", true],
  ["Job complete", false],
];

export default async function TrackScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job || !job.provider) notFound();
  const provider = job.provider;
  const payment = await getPayment(id);
  const escrowLabel =
    payment?.status === "held"
      ? "Payment held · releases when the job's done"
      : payment?.status === "released"
        ? "Payment released to your pro"
        : null;

  return (
    <>
      <AppHeader title="Your plumber" backHref="/app" />
      {/* reflect awarded → enroute → complete as the provider works it */}
      <LiveRefresh enabled={job.status !== "complete"} />

      <main style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
        {/* stylized map — colors tokenized (no hardcoded hex) */}
        <div style={{ height: 160, borderRadius: 18, overflow: "hidden", border: "1px solid var(--hairline)", margin: "0 0 6px" }}>
          <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice" style={{ display: "block", width: "100%", height: "100%" }}>
            <rect width="280" height="160" fill="var(--neutral)" />
            <g stroke="var(--hairline)" strokeWidth="6" strokeLinecap="round">
              <path d="M-10 44 H290" /><path d="M-10 112 H290" /><path d="M70 -10 V170" /><path d="M200 -10 V170" />
            </g>
            <path d="M70 112 L70 64 L200 64 L200 44" fill="none" stroke="var(--terracotta)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="112" r="7" fill="var(--terracotta)" stroke="var(--paper)" strokeWidth="3" />
            <g transform="translate(200 44)">
              <path d="M0 6 C0 6 8 0 8 -6 A8 8 0 1 0 -8 -6 C-8 0 0 6 0 6 z" fill="var(--ink)" />
              <circle cx="0" cy="-6" r="3" fill="var(--paper)" />
            </g>
          </svg>
        </div>

        <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24, margin: "10px 2px 2px", letterSpacing: "-0.01em", color: "var(--ink)" }}>
          On the way<span style={{ color: "var(--terracotta)" }}>.</span>
        </p>
        <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 2px 10px", fontFamily: "var(--font-ui)" }}>
          Arriving in about {job.etaMinutes} minutes
        </p>
        {escrowLabel && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-2)", fontFamily: "var(--font-ui)", background: "var(--moment)", borderRadius: "var(--r-pill)", padding: "5px 12px", margin: "0 2px 14px" }}>
            <span style={{ width: 7, height: 7, borderRadius: "var(--r-pill)", background: payment?.status === "released" ? "var(--verified)" : "var(--terracotta)" }} />
            {escrowLabel}
          </div>
        )}

        {/* masked contact — no raw phone/email; call/message route to the thread */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 12 }}>
          <StatusRing state="quoted" size={42}>
            <Avatar name={provider.name} size={42} />
          </StatusRing>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>
              {provider.name} {provider.verified && <VerifiedCheck size={14} />}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1, fontFamily: "var(--font-ui)" }}>Plumbing · Licensed · Insured</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/app/messages/${job.id}`} aria-label="Call" style={iconBtn}><IconPhone size={18} /></Link>
            <Link href={`/app/messages/${job.id}`} aria-label="Message" style={iconBtn}><IconChat size={18} /></Link>
          </div>
        </div>

        {/* step tracker */}
        <div style={{ display: "flex", flexDirection: "column", margin: "16px 4px 0" }}>
          {STEPS.map(([label, done]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, padding: "5px 0", color: done ? "var(--ink)" : "var(--ink-3)", fontFamily: "var(--font-ui)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "var(--r-pill)", flex: "0 0 auto", background: done ? "var(--terracotta)" : "transparent", border: `2px solid ${done ? "var(--terracotta)" : "var(--ink-3)"}` }} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <LinkButton href={`/app/jobs/${job.id}/rate`} variant="outline" size="md" fullWidth>
            Job done? Rate Marco
          </LinkButton>
        </div>
      </main>

      <BottomNav active="jobs" />
    </>
  );
}

const iconBtn = {
  width: 38,
  height: 38,
  borderRadius: "var(--r-pill)",
  background: "var(--neutral)",
  color: "var(--ink)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
