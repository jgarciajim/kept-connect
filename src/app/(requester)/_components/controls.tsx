"use client";

import { useRef, type ChangeEvent, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { IconCam } from "./icons";

/**
 * Local requester-surface form primitives for the request slice. Deliberately
 * NOT in components/ui — when we do the shared-component pass we'll promote the
 * good ones. Action color is terracotta (primary Button only); everything else
 * is black/white on paper. No hexes — tokens only.
 */

type ButtonVariant = "primary" | "secondary" | "ghost";

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  full = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  disabled?: boolean;
  full?: boolean;
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    padding: "0 20px",
    borderRadius: "var(--r-pill)",
    fontFamily: "var(--font-ui)",
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : undefined,
    transition: "opacity var(--dur-fast) var(--ease)",
  } as const;

  const skins: Record<ButtonVariant, CSSProperties> = {
    primary: { background: "var(--terracotta)", color: "var(--cream)", border: "none" },
    secondary: { background: "var(--paper)", color: "var(--ink)", border: "1px solid var(--hairline)" },
    ghost: { background: "transparent", color: "var(--ink-2)", border: "none" },
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...skins[variant] }}>
      {children}
    </button>
  );
}

const fieldBase: CSSProperties = {
  width: "100%",
  background: "var(--paper)",
  border: "1px solid var(--hairline)",
  borderRadius: "var(--r-chip)",
  padding: "12px 14px",
  fontFamily: "var(--font-ui)",
  fontSize: 15,
  color: "var(--ink)",
  outline: "none",
};

export function TextField({
  value,
  onChange,
  placeholder,
  right,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  right?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldBase} />
      {right}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{ ...fieldBase, resize: "vertical", lineHeight: 1.45 }}
    />
  );
}

/** Segmented control — a small set of mutually exclusive choices. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, background: "var(--neutral)", borderRadius: "var(--r-chip)", padding: 4 }}>
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1,
              height: 38,
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: 14,
              fontWeight: 500,
              background: on ? "var(--paper)" : "transparent",
              color: on ? "var(--ink)" : "var(--ink-2)",
              boxShadow: on ? "var(--shadow-sm)" : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * PhotoPicker — optional, multi. Holds object URLs only (no upload yet). Real
 * photo storage is a later subsystem.
 */
export function PhotoPicker({ photos, onChange }: { photos: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    onChange([...photos, ...urls]);
    e.target.value = "";
  }

  function remove(url: string) {
    URL.revokeObjectURL(url);
    onChange(photos.filter((u) => u !== url));
  }

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {photos.map((url) => (
        <div key={url} style={{ position: "relative", width: 72, height: 72, borderRadius: "var(--r-chip)", overflow: "hidden", border: "1px solid var(--hairline)" }}>
          <Image src={url} alt="" fill style={{ objectFit: "cover" }} unoptimized />
          <button
            type="button"
            onClick={() => remove(url)}
            aria-label="Remove photo"
            style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "var(--r-pill)", border: "none", background: "rgba(27,28,25,0.62)", color: "#fff", fontSize: 13, lineHeight: 1, cursor: "pointer" }}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ width: 72, height: 72, borderRadius: "var(--r-chip)", border: "1px dashed var(--hairline)", background: "var(--neutral)", color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <IconCam size={22} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={onFiles} style={{ display: "none" }} />
    </div>
  );
}
