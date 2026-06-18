import Link from "next/link";
import { getMyVerification } from "@/lib/provider/mock";
import { PIconBack } from "../../_components/icons";
import { VerifyForm } from "./VerifyForm";

// Provider verification application (/work/verify). Prefills from any prior
// submission (e.g. resubmitting after a rejection).
export default async function VerifyScreen() {
  const v = await getMyVerification();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px" }}>
        <Link href="/work/you" aria-label="Back" style={{ width: 30, height: 30, borderRadius: "var(--r-pill)", background: "var(--chrome-card)", color: "var(--chrome-cream)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <PIconBack size={20} />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, color: "var(--chrome-cream)" }}>Get verified</span>
      </div>

      <main style={{ flex: 1, overflowY: "auto", padding: "0 16px 24px" }}>
        <p style={{ fontSize: 13, color: "var(--chrome-dim)", margin: "0 2px 18px", fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
          Add your license details and documents. Our team reviews them and turns on your verified badge —
          requesters trust verified pros more.
        </p>
        <VerifyForm
          initial={{
            licenseType: v.licenseType ?? "",
            licenseNumber: v.licenseNumber ?? "",
            insuranceCarrier: v.insuranceCarrier ?? "",
            coiExpiry: v.coiExpiry ?? "",
            yearsInTrade: v.yearsInTrade != null ? String(v.yearsInTrade) : "",
          }}
        />
      </main>
    </>
  );
}
