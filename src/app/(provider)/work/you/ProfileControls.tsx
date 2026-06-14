"use client";

import { useState, useTransition } from "react";
import { Avatar, VerifiedCheck, type CategoryKey } from "@/components/ui";
import { setOnline, updateProviderProfile } from "@/lib/provider/actions";
import type { ProviderSelf } from "@/lib/provider/mock";
import { PIconStar } from "../../_components/icons";

// Provider-facing label per trade category (the 8 families).
export const TRADE_LABELS: Record<CategoryKey, string> = {
  water: "Plumbing",
  power: "Electrical",
  climate: "Heating & Cooling",
  structure: "Carpentry & Roofing",
  surfaces: "Painting & Floors",
  grounds: "Yard & Snow",
  care: "Home Care",
  fixtures: "Appliances",
};
const ALL_TRADES = Object.keys(TRADE_LABELS) as CategoryKey[];

/**
 * ProfileControls — the editable identity + availability block on /work/you.
 * Online toggle, name, trades, and credentials all write through the safe
 * update_provider_profile RPC (trust columns stay read-only).
 */
export function ProfileControls({ self }: { self: ProviderSelf }) {
  const [pending, start] = useTransition();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 16 }}>
        <Avatar name={self.name || "You"} size={56} />
        <div style={{ minWidth: 0 }}>
          <NameEditor initialName={self.name} pending={pending} start={start} verified={self.verified} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 13, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
            <span style={{ color: "var(--terracotta-bright)", display: "flex" }}><PIconStar size={13} /></span>
            <span style={{ fontWeight: 500, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>{self.rating}</span>
            <span>· {self.jobsDone} jobs · {self.yearsOnKept} yr on Kept</span>
          </div>
        </div>
      </div>

      {/* availability */}
      <OnlineToggle initialOnline={self.online} pending={pending} start={start} />

      {/* trades */}
      <TradesEditor initialTrades={self.tradeKeys} pending={pending} start={start} />

      {/* credentials */}
      <CredentialsEditor initialCredentials={self.credentials} pending={pending} start={start} />
    </div>
  );
}

type StartFn = (fn: () => Promise<void> | void) => void;

function NameEditor({ initialName, pending, start, verified }: { initialName: string; pending: boolean; start: StartFn; verified: boolean }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "var(--chrome-cream)", letterSpacing: "-0.01em" }}>{name || "Add your name"}</span>
        {verified && <VerifiedCheck size={16} />}
        <button type="button" onClick={() => setEditing(true)} style={linkBtn}>Edit</button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input value={name} onChange={(e) => setName(e.target.value)} style={darkInput} />
      <button type="button" disabled={pending} onClick={() => start(async () => { await updateProviderProfile({ displayName: name }); setEditing(false); })} style={pillBtn}>Save</button>
    </div>
  );
}

function OnlineToggle({ initialOnline, pending, start }: { initialOnline: boolean; pending: boolean; start: StartFn }) {
  const [online, setOnlineState] = useState(initialOnline);
  const toggle = () => {
    const next = !online;
    setOnlineState(next);
    start(() => setOnline(next));
  };
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: "14px 16px", cursor: pending ? "not-allowed" : "pointer", textAlign: "left" }}
    >
      <span style={{ width: 9, height: 9, borderRadius: "var(--r-pill)", background: online ? "var(--verified-bright)" : "var(--chrome-dim)" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{online ? "Online · taking offers" : "Offline"}</div>
        <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{online ? "You appear in dispatch and open-request feeds" : "You won't receive offers or see open requests"}</div>
      </div>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)" }}>{online ? "Go offline" : "Go online"}</span>
    </button>
  );
}

function TradesEditor({ initialTrades, pending, start }: { initialTrades: CategoryKey[]; pending: boolean; start: StartFn }) {
  const [selected, setSelected] = useState<CategoryKey[]>(initialTrades);
  const dirty = selected.slice().sort().join() !== initialTrades.slice().sort().join();
  const toggle = (k: CategoryKey) => setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <Section label="Trades">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ALL_TRADES.map((k) => {
          const on = selected.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(k)}
              style={{ padding: "8px 13px", borderRadius: "var(--r-pill)", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 500, background: on ? "var(--terracotta-bright)" : "var(--chrome-card)", color: on ? "var(--cream)" : "var(--chrome-dim)", border: on ? "1px solid var(--terracotta-bright)" : "1px solid var(--chrome-line)" }}
            >
              {TRADE_LABELS[k]}
            </button>
          );
        })}
      </div>
      {dirty && (
        <button type="button" disabled={pending} onClick={() => start(() => updateProviderProfile({ trades: selected }))} style={{ ...pillBtn, marginTop: 10 }}>
          Save trades
        </button>
      )}
    </Section>
  );
}

function CredentialsEditor({ initialCredentials, pending, start }: { initialCredentials: string[]; pending: boolean; start: StartFn }) {
  const [creds, setCreds] = useState<string[]>(initialCredentials);
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (!v || creds.includes(v)) return;
    const next = [...creds, v];
    setCreds(next); setInput("");
    start(() => updateProviderProfile({ credentials: next }));
  };
  const remove = (c: string) => {
    const next = creds.filter((x) => x !== c);
    setCreds(next);
    start(() => updateProviderProfile({ credentials: next }));
  };

  return (
    <Section label="Verified credentials">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 9 }}>
        {creds.length === 0 && <span style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>None yet.</span>}
        {creds.map((c) => (
          <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: "var(--r-pill)", background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", fontSize: 12.5, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>
            {c}
            <button type="button" onClick={() => remove(c)} disabled={pending} style={{ background: "none", border: "none", color: "var(--chrome-dim)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a credential (e.g. Licensed plumber)" style={{ ...darkInput, flex: 1 }} />
        <button type="button" onClick={add} disabled={pending} style={pillBtn}>Add</button>
      </div>
    </Section>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: "14px 15px" }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chrome-dim)", fontWeight: 500, marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}

const linkBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "var(--terracotta-bright)", fontSize: 12, fontWeight: 500, fontFamily: "var(--font-ui)", padding: 0 };
const pillBtn: React.CSSProperties = { borderRadius: "var(--r-pill)", padding: "9px 15px", fontSize: 13, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", flex: "0 0 auto" };
const darkInput: React.CSSProperties = { background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "9px 12px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 14, outline: "none", minWidth: 0 };
