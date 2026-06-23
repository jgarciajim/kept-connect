import Link from "next/link";
import { isCurrentMemberAdmin, getPendingVerifications, getDocUrl } from "@/lib/admin";
import { PIconBack } from "../../_components/icons";
import { AdminActions } from "./AdminActions";

// Admin verification review queue (/work/admin) — gated to is_admin. Lists pending
// applications with signed-URL document links; approve flips the verified badge.
export default async function AdminScreen() {
  const admin = await isCurrentMemberAdmin();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px" }}>
        <Link href="/work/you" aria-label="Back" style={{ width: 30, height: 30, borderRadius: "var(--r-pill)", background: "var(--chrome-card)", color: "var(--chrome-cream)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <PIconBack size={20} />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, color: "var(--chrome-cream)" }}>Verification review</span>
      </div>

      <main style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        {!admin ? (
          <p style={{ fontSize: 13.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", padding: "24px 4px", textAlign: "center" }}>Not authorized.</p>
        ) : (
          <AdminQueue />
        )}
      </main>
    </>
  );
}

async function AdminQueue() {
  const pending = await getPendingVerifications();
  const items = await Promise.all(
    pending.map(async (p) => ({
      ...p,
      idUrl: await getDocUrl(p.idDocPath),
      w9Url: await getDocUrl(p.w9Path),
      coiUrl: await getDocUrl(p.coiPath),
      licenseUrl: await getDocUrl(p.licensePhotoPath),
    })),
  );

  if (items.length === 0) {
    return <p style={{ fontSize: 13.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", padding: "16px 4px" }}>No applications waiting for review.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.map((p) => (
        <div key={p.memberId} style={{ background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{p.name}</div>
          <div style={{ fontSize: 12, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", marginTop: 1 }}>{p.trades.join(" · ") || "No trades"}</div>

          <dl style={{ margin: "10px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 10px", fontSize: 12.5, fontFamily: "var(--font-ui)" }}>
            <Row k="Legal name" v={p.legalName || "—"} />
            <Row k="DOB" v={p.dob || "—"} />
            <Row k="Bg check" v={`${p.bgStatus}${p.bgConsent ? " · consented" : " · NO consent"}`} />
            <Row k="ID check" v={p.idStatus} />
            <Row k="License" v={[p.licenseType, p.licenseNumber].filter(Boolean).join(" · ") || "—"} />
            <Row k="Insurance" v={p.insuranceCarrier || "—"} />
            <Row k="COI expiry" v={p.coiExpiry || "—"} />
            <Row k="Years" v={p.yearsInTrade != null ? String(p.yearsInTrade) : "—"} />
          </dl>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
            <DocLink label="ID" url={p.idUrl} />
            <DocLink label="W-9" url={p.w9Url} />
            <DocLink label="COI" url={p.coiUrl} />
            <DocLink label="License" url={p.licenseUrl} />
          </div>

          <AdminActions memberId={p.memberId} />
        </div>
      ))}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt style={{ color: "var(--chrome-dim)" }}>{k}</dt>
      <dd style={{ margin: 0, color: "var(--chrome-cream)" }}>{v}</dd>
    </>
  );
}

function DocLink({ label, url }: { label: string; url: string | null }) {
  if (!url) return <span style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{label}: —</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, fontWeight: 500, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)", textDecoration: "none" }}>
      {label} ↗
    </a>
  );
}
