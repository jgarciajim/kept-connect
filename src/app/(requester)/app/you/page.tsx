import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, Card } from "@/components/ui";
import { getCurrentMember, getActiveJobs, getReviewsAboutMe, getMyProperties } from "@/lib/requester/mock";
import { BottomNav } from "../../_components/BottomNav";
import { IconStar } from "../../_components/icons";
import { EditableName } from "./EditableName";
import { PropertiesEditor } from "./PropertiesEditor";
import { SignOutRow } from "./SignOutRow";

// The requester's account page (/app/you). Identity + activity + saved properties
// + a payment stub + reviews received + sign-out. Real data, RLS-scoped.
export default async function YouScreen() {
  const [member, jobs, reviews, properties] = await Promise.all([
    getCurrentMember(),
    getActiveJobs(),
    getReviewsAboutMe(),
    getMyProperties(),
  ]);

  const name = member?.displayName ?? "You";
  const since = member ? new Date(member.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, margin: "10px 2px 16px", color: "var(--ink)", letterSpacing: "-0.015em" }}>
          You<span style={{ color: "var(--terracotta)" }}>.</span>
        </h1>

        {/* identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--moment)", borderRadius: "var(--r-card)", padding: 16 }}>
          <Avatar name={name} size={56} />
          <div style={{ minWidth: 0 }}>
            <EditableName initialName={member?.displayName ?? ""} />
            {since && <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 3, fontFamily: "var(--font-ui)" }}>Member since {since}</div>}
          </div>
        </div>

        {/* activity */}
        <Section label="Your activity">
          <Card tone="paper" padding={14}>
            <div style={{ fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>
              {jobs.length === 0 ? "No jobs in progress." : `${jobs.length} job${jobs.length > 1 ? "s" : ""} in progress`}
            </div>
            {jobs.slice(0, 3).map((j) => (
              <Link key={j.id} href={`/app/jobs/${j.id}`} style={{ display: "flex", justifyContent: "space-between", marginTop: 8, textDecoration: "none", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--ink-2)" }}>
                <span>{j.title}</span>
                <span style={{ color: "var(--terracotta)" }}>View →</span>
              </Link>
            ))}
          </Card>
        </Section>

        {/* saved properties */}
        <Section label="Saved properties">
          <PropertiesEditor properties={properties} />
        </Section>

        {/* payment — stub */}
        <Section label="Payment methods">
          <Card tone="paper" padding={14}>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>No payment method yet.</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3, fontFamily: "var(--font-ui)" }}>Add a card to pay in-app — coming soon.</div>
          </Card>
        </Section>

        {/* reviews about me */}
        {reviews.length > 0 && (
          <Section label="Reviews from pros">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((r) => (
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

        {/* settings + sign out */}
        <Section label="Settings" last>
          <Card tone="paper" padding={4}>
            <SettingRow>Notifications</SettingRow>
            <SettingRow>Help &amp; support</SettingRow>
            <SignOutRow />
          </Card>
        </Section>
      </main>

      <BottomNav active="you" />
    </>
  );
}

function Section({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div style={{ marginTop: 22, marginBottom: last ? 0 : 0 }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", fontWeight: 500, marginBottom: 9, marginLeft: 2 }}>{label}</div>
      {children}
    </div>
  );
}

function SettingRow({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: "12px 14px", fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-ui)", borderBottom: "1px solid var(--hairline)" }}>{children}</div>
  );
}
