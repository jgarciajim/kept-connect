"use client";

import { useState, useTransition } from "react";
import { addProperty, updateProperty, deleteProperty, setDefaultProperty } from "@/lib/requester/actions";
import type { Property } from "@/lib/requester/mock";
import { Button, TextField } from "../../_components/controls";

/**
 * PropertiesEditor — manage the requester's saved addresses: add, rename, set the
 * default, remove. Default first; the default feeds the composer's "Use my property".
 */
export function PropertiesEditor({ properties }: { properties: Property[] }) {
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [pending, start] = useTransition();

  const submitNew = () =>
    start(async () => {
      await addProperty(label, address);
      setLabel(""); setAddress(""); setAdding(false);
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {properties.map((p) => (
        <PropertyRow key={p.id} property={p} pending={pending} start={start} />
      ))}

      {adding ? (
        <div style={{ background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <TextField value={label} onChange={setLabel} placeholder="Label (e.g. Home, Cabin)" />
          <TextField value={address} onChange={setAddress} placeholder="Street address" />
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" disabled={pending} onClick={submitNew}>{pending ? "Saving…" : "Save property"}</Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" full onClick={() => setAdding(true)}>+ Add a property</Button>
      )}
    </div>
  );
}

function PropertyRow({
  property,
  pending,
  start,
}: {
  property: Property;
  pending: boolean;
  start: (fn: () => Promise<void>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(property.label);
  const [address, setAddress] = useState(property.addressLine);

  if (editing) {
    return (
      <div style={{ background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <TextField value={label} onChange={setLabel} placeholder="Label" />
        <TextField value={address} onChange={setAddress} placeholder="Street address" />
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" disabled={pending} onClick={() => start(async () => { await updateProperty(property.id, label, address); setEditing(false); })}>Save</Button>
          <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 14, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{property.label}</span>
          {property.isDefault && (
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--terracotta-deep)", background: "var(--terracotta-tint)", borderRadius: "var(--r-pill)", padding: "1px 8px", fontFamily: "var(--font-ui)" }}>Default</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{property.addressLine}</div>
      </div>
      <div style={{ display: "flex", gap: 6, flex: "0 0 auto" }}>
        {!property.isDefault && (
          <RowAction label="Default" onClick={() => start(() => setDefaultProperty(property.id))} pending={pending} />
        )}
        <RowAction label="Edit" onClick={() => setEditing(true)} pending={pending} />
        <RowAction label="Remove" onClick={() => start(() => deleteProperty(property.id))} pending={pending} />
      </div>
    </div>
  );
}

function RowAction({ label, onClick, pending }: { label: string; onClick: () => void; pending: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      style={{ background: "none", border: "none", cursor: pending ? "not-allowed" : "pointer", color: "var(--ink-3)", fontSize: 12, fontWeight: 500, fontFamily: "var(--font-ui)", padding: 0 }}
    >
      {label}
    </button>
  );
}
