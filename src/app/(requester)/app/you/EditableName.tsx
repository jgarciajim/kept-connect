"use client";

import { useState, useTransition } from "react";
import { updateMyName } from "@/lib/requester/actions";
import { Button, TextField } from "../../_components/controls";

/** Inline display-name editor for the requester profile. */
export function EditableName({ initialName }: { initialName: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink)", letterSpacing: "-0.01em" }}>
          {name || "Add your name"}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--terracotta)", fontSize: 12.5, fontWeight: 500, fontFamily: "var(--font-ui)", padding: 0 }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <TextField value={name} onChange={setName} placeholder="Your name" />
      <Button
        variant="primary"
        disabled={pending}
        onClick={() => start(async () => { await updateMyName(name); setEditing(false); })}
      >
        {pending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
