import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, CategoryIcon } from "@/components/ui";
import { getProviderSelf, getMyReviews, getJobHistory } from "@/lib/provider/mock";
import { getNotificationPrefs } from "@/lib/notifications";
import { NotificationPrefs } from "@/components/NotificationPrefs";
import { VBottomNav } from "../../_components/VBottomNav";
import { ProviderEmptyState } from "../../_components/ProviderEmptyState";
import { PIconStar, PIconWallet } from "../../_components/icons";
import { ProfileControls } from "./ProfileControls";

export default async function ProfileScreen() {
  const [self, reviews, history, prefs] = await Promise.all([
    getProviderSelf(),
    getMyReviews(),
    getJobHistory(),
    getNotificationPrefs(),
  ]);
  if (!self) return <ProviderEmptyState tab="you" />;

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 16px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          You<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>

        {/* editable identity + availability + trades + credentials */}
        <ProfileControls self={self} />

        {/* fast pay + rates */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          <Link href="/work/earnings" style={rowLink}>
            <span style={iconBubble}><PIconWallet size={18} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>Available to cash out</div>
              <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>Instant payout, any time</div>
            </div>
            <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 16, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>${self.availableToCashOut}</span>
          </Link>
          <Link href="/work/rates" style={rowLink}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>Your rates</div>
              <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>Set what you charge per service</div>
            </div>
            <span style={{ color: "var(--terracotta-bright)", fontSize: 13, fontWeight: 500, fontFamily: "var(--font-ui)" }}>Manage →</span>
          </Link>
        </div>

        {/* notification preferences */}
        <Section label="Notifications">
          <NotificationPrefs tone="dark" prefs={prefs} />
        </Section>

        {/* reviews */}
        {reviews.length > 0 && (
          <Section label="Reviews">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                    <Avatar name={r.author} size={28} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, color: "var(--chrome-cream)" }}>{r.author}</span>
                    <span style={{ marginLeft: "auto", display: "flex", gap: 1, color: "var(--terracotta-bright)" }}>
                      {Array.from({ length: r.stars }).map((_, i) => (<PIconStar key={i} size={12} />))}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--chrome-dim)", lineHeight: 1.5 }}>{r.text}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", opacity: 0.7 }}>{r.when}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* job history */}
        <Section label="Job history" last>
          {history.length === 0 ? (
            <div style={{ color: "var(--chrome-dim)", fontSize: 13, fontFamily: "var(--font-ui)", padding: "2px 2px" }}>No completed jobs yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {history.map((j) => (
                <div key={j.id} style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: "11px 12px" }}>
                  <CategoryIcon category={j.trade} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{j.title}</div>
                    <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{j.when} · {j.status}</div>
                  </div>
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>${j.payout}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </main>

      <VBottomNav active="you" />
    </>
  );
}

function Section({ label, children, last = false }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div style={{ marginTop: 20, marginBottom: last ? 0 : 0 }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chrome-dim)", fontWeight: 500, marginBottom: 10, marginLeft: 2 }}>{label}</div>
      {children}
    </div>
  );
}

const rowLink: React.CSSProperties = { display: "flex", alignItems: "center", gap: 12, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 16, textDecoration: "none" };
const iconBubble: React.CSSProperties = { width: 38, height: 38, borderRadius: "var(--r-pill)", background: "var(--chrome-card-2)", color: "var(--terracotta-bright)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" };
