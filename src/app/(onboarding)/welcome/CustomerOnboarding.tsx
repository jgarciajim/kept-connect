"use client";

import { useState, useTransition, type CSSProperties, type ReactNode } from "react";
import { KeptConnectLogo } from "@/components/ui";
import { completeCustomerOnboarding } from "@/lib/requester/actions";

/**
 * CustomerOnboarding — the short, gated customer funnel. Intro (how Kept works) →
 * name (prefilled from Clerk) → primary property (address + label + type + access
 * notes). Required basics are name + address; the rest is optional. On submit it
 * syncs the name + saves a default property and drops them into the app.
 */
const STEPS = ["Welcome", "You", "Property"] as const;
const TYPES = ["House", "Condo / townhome", "Apartment", "Rental property", "Other"];

export function CustomerOnboarding({ initialName }: { initialName: string }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(initialName);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [accessNotes, setAccessNotes] = useState("");
  const [pending, start] = useTransition();

  const canContinue = [true, name.trim().length > 0, address.trim().length > 0][step];

  function next() {
    if (!canContinue || pending) return;
    if (step === STEPS.length - 1) {
      start(() => completeCustomerOnboarding({ name, label, address, propertyType, accessNotes }));
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <KeptConnectLogo variant="mark" treatment="app-icon" size={28} />
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? "var(--terracotta)" : "var(--hairline)" }} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <Step title="Welcome to Kept" sub="The easiest way to get things done at your property.">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <How n="1" title="Post what you need" body="Tell us the job — plumbing, handyman, snow, cleaning, anything." />
            <How n="2" title="Get matched with a vetted pro" body="We send it to verified local pros. No bidding wars." />
            <How n="3" title="Track it to done" body="Watch your pro arrive and finish, and message them in-app." />
            <How n="4" title="Pay when it's complete" body="Your payment is held safely and only released once the work is done." />
          </div>
        </Step>
      )}

      {step === 1 && (
        <Step title="What should we call you?" sub="This is how your pros will see you.">
          <Field label="Your name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Lee" style={input} /></Field>
        </Step>
      )}

      {step === 2 && (
        <Step title="Your property" sub="We'll use this as your default address when you post a job. You can add more later.">
          <Field label="Label"><input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home" style={input} /></Field>
          <Field label="Address"><input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city" style={input} /></Field>
          <Field label="Property type" hint="Optional">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TYPES.map((t) => (
                <button key={t} type="button" onClick={() => setPropertyType(propertyType === t ? "" : t)} aria-pressed={propertyType === t}
                  style={chip(propertyType === t)}>{t}</button>
              ))}
            </div>
          </Field>
          <Field label="Access notes" hint="Optional">
            <textarea value={accessNotes} onChange={(e) => setAccessNotes(e.target.value)} rows={3} placeholder="Gate code, where to park, dog in the yard…"
              style={{ ...input, resize: "vertical", lineHeight: 1.45 }} />
          </Field>
        </Step>
      )}

      <div style={{ display: "flex", gap: 10, position: "sticky", bottom: 0, paddingBottom: 8, background: "linear-gradient(to top, var(--canvas) 72%, transparent)" }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} disabled={pending}
            style={{ flex: "0 0 auto", borderRadius: 14, padding: "14px 20px", fontSize: 14.5, fontWeight: 500, background: "transparent", color: "var(--ink-2)", border: "1px solid var(--hairline)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
            Back
          </button>
        )}
        <button type="button" onClick={next} disabled={!canContinue || pending}
          style={{ flex: 1, borderRadius: 14, padding: 15, fontSize: 15, fontWeight: 600, background: "var(--terracotta)", color: "var(--cream)", border: "none", cursor: !canContinue || pending ? "not-allowed" : "pointer", opacity: !canContinue || pending ? 0.5 : 1, fontFamily: "var(--font-ui)" }}>
          {step === STEPS.length - 1 ? (pending ? "Setting up…" : "Start using Kept") : step === 0 ? "Get started" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function Step({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, color: "var(--ink)", margin: "0 0 5px", letterSpacing: "-0.015em" }}>
          {title}<span style={{ color: "var(--terracotta)" }}>.</span>
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", fontFamily: "var(--font-ui)", margin: 0, lineHeight: 1.5 }}>{sub}</p>
      </div>
      {children}
    </div>
  );
}

function How({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: 14, padding: 13 }}>
      <span style={{ flex: "0 0 auto", width: 26, height: 26, borderRadius: "var(--r-pill)", background: "var(--moment)", color: "var(--terracotta-deep)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 13 }}>{n}</span>
      <div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-3)" }}>{label}</span>
        {hint && <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const input: CSSProperties = { width: "100%", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-chip)", padding: "12px 14px", color: "var(--ink)", fontFamily: "var(--font-ui)", fontSize: 15, outline: "none" };
function chip(active: boolean): CSSProperties {
  return { padding: "8px 14px", borderRadius: "var(--r-pill)", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 500, background: active ? "var(--terracotta)" : "var(--paper)", color: active ? "var(--cream)" : "var(--ink)", border: active ? "1px solid var(--terracotta)" : "1px solid var(--hairline)" };
}
