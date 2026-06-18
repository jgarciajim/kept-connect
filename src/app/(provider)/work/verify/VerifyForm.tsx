"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";
import { submitVerification } from "@/lib/provider/actions";

export interface VerifyInitial {
  licenseType: string;
  licenseNumber: string;
  insuranceCarrier: string;
  coiExpiry: string;
  yearsInTrade: string;
}

/**
 * Verification application. Uploads documents to the private Storage bucket
 * (browser client, Clerk-authed; path = "<sub>/<doc>-<ts>") then records the
 * paths + fields via submitVerification → status pending.
 */
export function VerifyForm({ initial }: { initial: VerifyInitial }) {
  const { userId } = useAuth();
  const sb = useSupabaseBrowserClient();
  const [f, setF] = useState(initial);
  const [w9, setW9] = useState<File | null>(null);
  const [coi, setCoi] = useState<File | null>(null);
  const [dl, setDl] = useState<File | null>(null);
  const [attested, setAttested] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = (k: keyof VerifyInitial) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function uploadOne(file: File | null, doc: string): Promise<string | null> {
    if (!file || !userId) return null;
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${userId}/${doc}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("verification-docs").upload(path, file, { upsert: true });
    if (error) throw new Error(`Couldn't upload ${doc.toUpperCase()}: ${error.message}`);
    return path;
  }

  const valid = f.licenseNumber.trim().length > 0 && attested && !pending;

  function submit() {
    if (!valid) return;
    setErr(null);
    start(async () => {
      let paths: [string | null, string | null, string | null];
      try {
        paths = await Promise.all([uploadOne(w9, "w9"), uploadOne(coi, "coi"), uploadOne(dl, "license")]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
        return;
      }
      // submitVerification redirects on success — let it propagate (don't catch).
      await submitVerification({
        licenseType: f.licenseType,
        licenseNumber: f.licenseNumber,
        insuranceCarrier: f.insuranceCarrier,
        coiExpiry: f.coiExpiry || null,
        yearsInTrade: f.yearsInTrade ? Number(f.yearsInTrade) : null,
        w9Path: paths[0],
        coiPath: paths[1],
        licensePhotoPath: paths[2],
        attested,
      });
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Field label="License type"><input value={f.licenseType} onChange={set("licenseType")} placeholder="e.g. Master Plumber" style={input} /></Field>
      <Field label="License number"><input value={f.licenseNumber} onChange={set("licenseNumber")} placeholder="Required" style={input} /></Field>
      <Field label="Insurance carrier"><input value={f.insuranceCarrier} onChange={set("insuranceCarrier")} placeholder="e.g. State Farm" style={input} /></Field>
      <div style={{ display: "flex", gap: 12 }}>
        <Field label="COI expiry"><input type="date" value={f.coiExpiry} onChange={set("coiExpiry")} style={input} /></Field>
        <Field label="Years in trade"><input inputMode="numeric" value={f.yearsInTrade} onChange={set("yearsInTrade")} placeholder="0" style={input} /></Field>
      </div>

      <FileField label="W-9" hint="PDF or photo" onPick={setW9} file={w9} />
      <FileField label="Certificate of insurance (COI)" hint="PDF or photo" onPick={setCoi} file={coi} />
      <FileField label="Driver's license photo" hint="For identity verification" onPick={setDl} file={dl} />

      <label style={{ display: "flex", alignItems: "flex-start", gap: 9, cursor: "pointer" }}>
        <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--terracotta-bright)" }} />
        <span style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
          I attest the information and documents above are accurate and mine to submit.
        </span>
      </label>

      {err && <div style={{ fontSize: 12.5, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)" }}>{err}</div>}

      <button
        type="button"
        onClick={submit}
        disabled={!valid}
        style={{ width: "100%", borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: valid ? "pointer" : "not-allowed", opacity: valid ? 1 : 0.5, fontFamily: "var(--font-ui)" }}
      >
        {pending ? "Submitting…" : "Submit for review"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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

const input: CSSProperties = { width: "100%", background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "11px 12px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 14, outline: "none" };
