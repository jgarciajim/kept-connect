"use client";

import { useMemo, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { submitOnboarding, saveOnboardingDraft, saveProviderName, saveSubjobRates } from "@/lib/provider/actions";
import type { OnboardingDraft } from "@/lib/provider/mock";
import { SubjobPricingEditor, rateDraftOk, type RateMap } from "./_components/SubjobPricingEditor";

/**
 * OnboardingWizard — the self-serve provider funnel (web + app). RESUMABLE: each
 * step persists server-side (a draft + sub-job rates), and documents upload to the
 * private Storage bucket the moment they're picked — so a contractor who drops off
 * mid-signup resumes exactly where they left off. The final submit flips the draft
 * to 'pending' (profile created OFFLINE; live only on admin approval).
 */
const STEPS = ["You", "Identity", "Tax", "Insurance", "License", "Services", "Review"] as const;

export function OnboardingWizard({
  initialName,
  initialDraft,
  initialRates,
}: {
  initialName: string;
  initialDraft: OnboardingDraft | null;
  initialRates: RateMap;
}) {
  const { userId } = useAuth();
  const sb = useSupabaseBrowserClient();
  const [step, setStep] = useState(0);

  const d = initialDraft;
  const [name, setName] = useState(initialName);
  const [legalFirst, setLegalFirst] = useState(d?.legalFirstName ?? "");
  const [legalLast, setLegalLast] = useState(d?.legalLastName ?? "");
  const [dob, setDob] = useState(d?.dob ?? "");
  const [bgConsent, setBgConsent] = useState(d?.bgConsent ?? false);
  const [insuranceCarrier, setInsuranceCarrier] = useState(d?.insuranceCarrier ?? "");
  const [coiExpiry, setCoiExpiry] = useState(d?.coiExpiry ?? "");
  const [licenseType, setLicenseType] = useState(d?.licenseType ?? "");
  const [licenseNumber, setLicenseNumber] = useState(d?.licenseNumber ?? "");
  const [yearsInTrade, setYearsInTrade] = useState(d?.yearsInTrade != null ? String(d.yearsInTrade) : "");
  // Documents are PATHS (uploaded on pick), so they survive a resume.
  const [idDocPath, setIdDocPath] = useState<string | null>(d?.idDocPath ?? null);
  const [w9Path, setW9Path] = useState<string | null>(d?.w9Path ?? null);
  const [coiPath, setCoiPath] = useState<string | null>(d?.coiPath ?? null);
  const [licensePhotoPath, setLicensePhotoPath] = useState<string | null>(d?.licensePhotoPath ?? null);
  const [rates, setRates] = useState<RateMap>(initialRates);
  const [attested, setAttested] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const pricedCount = Object.keys(rates).length;
  const ratesValid = useMemo(() => pricedCount > 0 && Object.values(rates).every(rateDraftOk), [rates, pricedCount]);

  const canContinue = [
    name.trim().length > 0, // You
    Boolean(legalFirst.trim() && legalLast.trim() && bgConsent && idDocPath && !uploading), // Identity
    Boolean(w9Path && !uploading), // Tax
    Boolean(coiPath && !uploading), // Insurance
    Boolean(licenseNumber.trim() && licensePhotoPath && !uploading), // License
    ratesValid, // Services
    attested, // Review
  ][step];

  function draftPayload() {
    return {
      legalFirstName: legalFirst, legalLastName: legalLast, dob: dob || null, bgConsent,
      idDocPath, licenseType, licenseNumber, insuranceCarrier, coiExpiry: coiExpiry || null,
      yearsInTrade: yearsInTrade ? Number(yearsInTrade) : null, w9Path, coiPath, licensePhotoPath,
    };
  }
  function ratesPayload() {
    return Object.values(rates).map((r) => ({
      serviceSlug: r.serviceSlug, optionSlug: r.optionSlug, model: r.model,
      amount: r.model === "flat" || r.model === "per_unit" ? Number(r.amount) : null,
      unit: r.model === "per_unit" ? r.unit : null,
      tiers: r.model === "tiered" ? r.tiers.map((t) => ({ label: t.label, amount: Number(t.amount) })) : undefined,
    }));
  }

  // Upload a picked document immediately; store its path so resume keeps it.
  async function pickDoc(file: File | null, doc: string, setPath: (p: string | null) => void) {
    if (!file || !userId) return;
    setErr(null);
    setUploading(doc);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${userId}/${doc}-${Date.now()}.${ext}`;
      const { error } = await sb.storage.from("verification-docs").upload(path, file, { upsert: true });
      if (error) throw new Error(error.message);
      setPath(path);
    } catch (e) {
      setErr(`Couldn't upload ${doc.toUpperCase()}: ${e instanceof Error ? e.message : "failed"}`);
    } finally {
      setUploading(null);
    }
  }

  function next() {
    if (!canContinue || pending) return;
    if (step === STEPS.length - 1) {
      // final submit — flips the draft to 'pending'; redirects on success.
      start(() =>
        submitOnboarding({ displayName: name, rates: ratesPayload(), ...draftPayload(), attested }),
      );
      return;
    }
    start(async () => {
      if (step === 0) await saveProviderName(name);
      await saveOnboardingDraft(draftPayload());
      if (step === 5) await saveSubjobRates(ratesPayload()); // leaving Services
      setStep((s) => s + 1);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {STEPS.map((label, i) => (
          <div key={label} title={label} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "var(--terracotta-bright)" : "var(--chrome-line)" }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </div>

      {step === 0 && (
        <Step title="Let's get you set up" sub="This is how you'll appear to customers. You can stop and pick up where you left off any time.">
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
          <DocField label="Government ID / driver's license" hint="Photo or PDF" path={idDocPath} busy={uploading === "id"} onPick={(f) => pickDoc(f, "id", setIdDocPath)} />
          <label style={consentRow}>
            <input type="checkbox" checked={bgConsent} onChange={(e) => setBgConsent(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--terracotta-bright)" }} />
            <span style={consentText}>I consent to a background check and ID verification as part of joining Kept Connect.</span>
          </label>
        </Step>
      )}

      {step === 2 && (
        <Step title="Tax form" sub="We need a W-9 on file to pay you. Upload a completed W-9.">
          <DocField label="W-9" hint="PDF or photo" path={w9Path} busy={uploading === "w9"} onPick={(f) => pickDoc(f, "w9", setW9Path)} />
        </Step>
      )}

      {step === 3 && (
        <Step title="Proof of insurance" sub="Upload your current certificate of insurance (COI).">
          <Field label="Insurance carrier"><input value={insuranceCarrier} onChange={(e) => setInsuranceCarrier(e.target.value)} placeholder="e.g. State Farm" style={input} /></Field>
          <Field label="COI expiry"><input type="date" value={coiExpiry} onChange={(e) => setCoiExpiry(e.target.value)} style={input} /></Field>
          <DocField label="Certificate of insurance" hint="PDF or photo" path={coiPath} busy={uploading === "coi"} onPick={(f) => pickDoc(f, "coi", setCoiPath)} />
        </Step>
      )}

      {step === 4 && (
        <Step title="Trade license" sub="Your professional license for the work you do.">
          <Field label="License type"><input value={licenseType} onChange={(e) => setLicenseType(e.target.value)} placeholder="e.g. Master Plumber" style={input} /></Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="License number"><input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="Required" style={input} /></Field>
            <Field label="Years in trade"><input inputMode="numeric" value={yearsInTrade} onChange={(e) => setYearsInTrade(e.target.value)} placeholder="0" style={input} /></Field>
          </div>
          <DocField label="License photo" hint="Photo or PDF" path={licensePhotoPath} busy={uploading === "license"} onPick={(f) => pickDoc(f, "license", setLicensePhotoPath)} />
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
          <ReviewRow label="Documents" value={[idDocPath && "ID", w9Path && "W-9", coiPath && "COI", licensePhotoPath && "License"].filter(Boolean).join(" · ") || "—"} />
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
          {step === STEPS.length - 1 ? (pending ? "Submitting…" : "Submit for review") : pending ? "Saving…" : "Continue"}
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

// Upload-on-pick doc field. Shows uploaded ✓ (with replace) once a path exists, so
// a resumed wizard reflects what's already in Storage.
function DocField({ label, hint, path, busy, onPick }: { label: string; hint: string; path: string | null; busy: boolean; onPick: (f: File | null) => void }) {
  const status = busy ? "Uploading…" : path ? "Uploaded ✓ — choose to replace" : hint;
  return (
    <Field label={label}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--chrome-card)", border: `1px dashed ${path ? "var(--verified-bright)" : "var(--chrome-line)"}`, borderRadius: "var(--r-chip)", padding: "11px 12px", cursor: "pointer" }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)", flex: "0 0 auto" }}>Choose file</span>
        <span style={{ fontSize: 12, color: path ? "var(--verified-bright)" : "var(--chrome-dim)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{status}</span>
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
