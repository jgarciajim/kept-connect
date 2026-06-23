"use client";

import { useMemo, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { submitOnboarding } from "@/lib/provider/actions";
import { SubjobPricingEditor, OTHER_SLUG, type RateMap } from "./_components/SubjobPricingEditor";

/**
 * OnboardingWizard — the self-serve provider funnel (web + app). One guided flow:
 * name → identity + background-check consent → tax (W-9) → insurance (COI) →
 * license → trade & sub-job selection + pricing → review → submit. Documents
 * upload to the private Storage bucket (browser client, Clerk-authed); everything
 * commits via submitOnboarding (profile created OFFLINE; live only on approval).
 */
const STEPS = ["You", "Identity", "Tax", "Insurance", "License", "Services", "Review"] as const;

export function OnboardingWizard({ initialName }: { initialName: string }) {
  const { userId } = useAuth();
  const sb = useSupabaseBrowserClient();
  const [step, setStep] = useState(0);

  const [name, setName] = useState(initialName);
  const [legalFirst, setLegalFirst] = useState("");
  const [legalLast, setLegalLast] = useState("");
  const [dob, setDob] = useState("");
  const [bgConsent, setBgConsent] = useState(false);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [w9, setW9] = useState<File | null>(null);
  const [coi, setCoi] = useState<File | null>(null);
  const [coiExpiry, setCoiExpiry] = useState("");
  const [insuranceCarrier, setInsuranceCarrier] = useState("");
  const [licenseType, setLicenseType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsInTrade, setYearsInTrade] = useState("");
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const [rates, setRates] = useState<RateMap>({});
  const [attested, setAttested] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const pricedCount = Object.keys(rates).length;
  const ratesValid = useMemo(
    () =>
      pricedCount > 0 &&
      Object.values(rates).every(
        (r) => r.optionSlug === OTHER_SLUG || r.model === "quote" || Number(r.amount) > 0,
      ),
    [rates, pricedCount],
  );

  const canContinue = [
    name.trim().length > 0, // You
    legalFirst.trim() && legalLast.trim() && bgConsent && idDoc, // Identity
    Boolean(w9), // Tax
    Boolean(coi), // Insurance
    licenseNumber.trim() && licensePhoto, // License
    ratesValid, // Services
    attested, // Review
  ][step];

  async function uploadOne(file: File | null, doc: string): Promise<string | null> {
    if (!file || !userId) return null;
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${userId}/${doc}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("verification-docs").upload(path, file, { upsert: true });
    if (error) throw new Error(`Couldn't upload ${doc.toUpperCase()}: ${error.message}`);
    return path;
  }

  function submit() {
    if (!canContinue || pending) return;
    setErr(null);
    start(async () => {
      let paths: [string | null, string | null, string | null, string | null];
      try {
        paths = await Promise.all([
          uploadOne(idDoc, "id"),
          uploadOne(w9, "w9"),
          uploadOne(coi, "coi"),
          uploadOne(licensePhoto, "license"),
        ]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
        return;
      }
      // submitOnboarding redirects on success — let NEXT_REDIRECT propagate.
      await submitOnboarding({
        displayName: name,
        rates: Object.values(rates).map((r) => ({
          serviceSlug: r.serviceSlug,
          optionSlug: r.optionSlug,
          model: r.model,
          amount: r.model === "quote" ? null : Number(r.amount),
          unit: r.model === "per_unit" ? r.unit : null,
        })),
        legalFirstName: legalFirst,
        legalLastName: legalLast,
        dob: dob || null,
        bgConsent,
        idDocPath: paths[0],
        licenseType,
        licenseNumber,
        insuranceCarrier,
        coiExpiry: coiExpiry || null,
        yearsInTrade: yearsInTrade ? Number(yearsInTrade) : null,
        w9Path: paths[1],
        coiPath: paths[2],
        licensePhotoPath: paths[3],
        attested,
      });
    });
  }

  const next = () => (step === STEPS.length - 1 ? submit() : setStep((s) => s + 1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {STEPS.map((label, i) => (
          <div key={label} title={label} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "var(--terracotta-bright)" : "var(--chrome-line)" }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </div>

      {step === 0 && (
        <Step title="Let's get you set up" sub="This is how you'll appear to customers.">
          <Field label="Your name or business name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Casey Rivera" style={input} /></Field>
        </Step>
      )}

      {step === 1 && (
        <Step title="Identity & background check" sub="We verify every pro before they go live. A stranger is going into someone's home.">
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Legal first name"><input value={legalFirst} onChange={(e) => setLegalFirst(e.target.value)} style={input} /></Field>
            <Field label="Legal last name"><input value={legalLast} onChange={(e) => setLegalLast(e.target.value)} style={input} /></Field>
          </div>
          <Field label="Date of birth"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={input} /></Field>
          <FileField label="Government ID / driver's license" hint="Photo or PDF" file={idDoc} onPick={setIdDoc} />
          <label style={consentRow}>
            <input type="checkbox" checked={bgConsent} onChange={(e) => setBgConsent(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--terracotta-bright)" }} />
            <span style={consentText}>I consent to a background check and ID verification as part of joining Kept Connect.</span>
          </label>
        </Step>
      )}

      {step === 2 && (
        <Step title="Tax form" sub="We need a W-9 on file to pay you. Upload a completed W-9.">
          <FileField label="W-9" hint="PDF or photo" file={w9} onPick={setW9} />
        </Step>
      )}

      {step === 3 && (
        <Step title="Proof of insurance" sub="Upload your current certificate of insurance (COI).">
          <Field label="Insurance carrier"><input value={insuranceCarrier} onChange={(e) => setInsuranceCarrier(e.target.value)} placeholder="e.g. State Farm" style={input} /></Field>
          <Field label="COI expiry"><input type="date" value={coiExpiry} onChange={(e) => setCoiExpiry(e.target.value)} style={input} /></Field>
          <FileField label="Certificate of insurance" hint="PDF or photo" file={coi} onPick={setCoi} />
        </Step>
      )}

      {step === 4 && (
        <Step title="Trade license" sub="Your professional license for the work you do.">
          <Field label="License type"><input value={licenseType} onChange={(e) => setLicenseType(e.target.value)} placeholder="e.g. Master Plumber" style={input} /></Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="License number"><input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Required" style={input} /></Field>
            <Field label="Years in trade"><input inputMode="numeric" value={yearsInTrade} onChange={(e) => setYearsInTrade(e.target.value)} placeholder="0" style={input} /></Field>
          </div>
          <FileField label="License photo" hint="Photo or PDF" file={licensePhoto} onPick={setLicensePhoto} />
        </Step>
      )}

      {step === 5 && (
        <Step title="What do you do?" sub="Pick your trades, then the exact jobs you take — and set your price for each. You'll only get requests for what you choose.">
          <SubjobPricingEditor rates={rates} onChange={setRates} />
        </Step>
      )}

      {step === 6 && (
        <Step title="Review & submit" sub="We'll review your application and let you know when you're approved to go live.">
          <ReviewRow label="Name" value={name} />
          <ReviewRow label="Legal name" value={`${legalFirst} ${legalLast}`.trim()} />
          <ReviewRow label="Documents" value={[idDoc && "ID", w9 && "W-9", coi && "COI", licensePhoto && "License"].filter(Boolean).join(" · ") || "—"} />
          <ReviewRow label="Priced jobs" value={`${pricedCount} across ${new Set(Object.values(rates).map((r) => r.serviceSlug)).size} trades`} />
          <label style={consentRow}>
            <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--terracotta-bright)" }} />
            <span style={consentText}>I attest that everything above is accurate and mine to submit.</span>
          </label>
        </Step>
      )}

      {err && <div style={{ fontSize: 12.5, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)" }}>{err}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} disabled={pending}
            style={{ flex: "0 0 auto", borderRadius: 14, padding: "14px 20px", fontSize: 14.5, fontWeight: 500, background: "transparent", color: "var(--chrome-dim)", border: "1px solid var(--chrome-line)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
            Back
          </button>
        )}
        <button type="button" onClick={next} disabled={!canContinue || pending}
          style={{ flex: 1, borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: !canContinue || pending ? "not-allowed" : "pointer", opacity: !canContinue || pending ? 0.5 : 1, fontFamily: "var(--font-ui)" }}>
          {step === STEPS.length - 1 ? (pending ? "Submitting…" : "Submit for review") : "Continue"}
        </button>
      </div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 21, color: "var(--chrome-cream)", margin: "0 0 4px", letterSpacing: "-0.01em" }}>{title}</h2>
        <p style={{ fontSize: 13, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", margin: 0, lineHeight: 1.5 }}>{sub}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--chrome-dim)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function FileField({ label, hint, file, onPick }: { label: string; hint: string; file: File | null; onPick: (f: File | null) => void }) {
  return (
    <Field label={label}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--chrome-card)", border: "1px dashed var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "11px 12px", cursor: "pointer" }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)", flex: "0 0 auto" }}>Choose file</span>
        <span style={{ fontSize: 12, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file ? file.name : hint}</span>
        <input type="file" accept="image/*,application/pdf" onChange={(e) => onPick(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
      </label>
    </Field>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--chrome-line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

const input: CSSProperties = { width: "100%", background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "11px 12px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 14, outline: "none" };
const consentRow: CSSProperties = { display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" };
const consentText: CSSProperties = { fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", lineHeight: 1.45 };
