"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { GeoSuggestion, GeoValue } from "@/lib/geo/types";

/**
 * AddressField — provider-neutral address entry with type-ahead verification,
 * "use my current location", and a confirm-anyway path for addresses the
 * geocoder doesn't recognize (new construction, rural mountain lots).
 *
 * Controlled: parent holds the GeoValue. Typing clears verification (coords go
 * null, verified=false) until the user either picks a suggestion or uses their
 * location. An unverified-but-non-empty address is still valid to submit — the
 * status line makes clear it'll be saved as typed. Degrades to a plain text
 * field when geocoding isn't configured (the API returns { disabled: true }).
 * Suggestions are driven from the input handler (debounced), not an effect.
 */

export const emptyGeoValue = (address = ""): GeoValue => ({
  address,
  lat: null,
  lng: null,
  formatted: null,
  verified: false,
  ref: null,
});

/** Build a value from a stored property (already geocoded, so trusted-as-saved). */
export function geoValueFromStored(address: string, lat?: number | null, lng?: number | null): GeoValue {
  return { address, lat: lat ?? null, lng: lng ?? null, formatted: address, verified: lat != null && lng != null, ref: null };
}

export interface AddressFieldProps {
  value: GeoValue;
  onChange: (v: GeoValue) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressField({ value, onChange, label = "Address", placeholder = "Start typing an address…", disabled = false }: AddressFieldProps) {
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoDisabled, setGeoDisabled] = useState(false); // provider not configured
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const session = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Init the (billing) session token once and clean up the debounce timer on unmount.
  useEffect(() => {
    if (!session.current) session.current = globalThis.crypto?.randomUUID?.() ?? `s-${Date.now()}`;
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  async function runSuggest(q: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/geo/suggest?q=${encodeURIComponent(q)}&session=${session.current}`);
      const json = await res.json();
      if (json.disabled) { setGeoDisabled(true); setSuggestions([]); setOpen(false); return; }
      const s: GeoSuggestion[] = json.suggestions ?? [];
      setSuggestions(s);
      setOpen(s.length > 0);
    } catch {
      /* keep quiet — plain-text entry still works */
    } finally {
      setLoading(false);
    }
  }

  // Typing: update the value (unverified), then debounce a suggestion fetch.
  function handleText(text: string) {
    onChange(emptyGeoValue(text));
    if (geoDisabled || disabled) return;
    if (timer.current) clearTimeout(timer.current);
    const q = text.trim();
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(() => void runSuggest(q), 300);
  }

  async function pick(s: GeoSuggestion) {
    setOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/geo/retrieve?ref=${encodeURIComponent(s.ref)}&session=${session.current}`);
      const json = await res.json();
      const r = json.result;
      if (r) onChange({ address: r.formatted, lat: r.lat, lng: r.lng, formatted: r.formatted, verified: true, ref: r.ref });
      else onChange({ ...value, address: `${s.primary}, ${s.secondary}`.trim() });
    } catch {
      onChange({ ...value, address: `${s.primary}, ${s.secondary}`.trim() });
    } finally {
      setLoading(false);
    }
  }

  function useCurrentLocation() {
    setLocError(null);
    if (!globalThis.navigator?.geolocation) { setLocError("Location isn't available in this browser."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(`/api/geo/reverse?lat=${lat}&lng=${lng}`);
          const json = await res.json();
          const r = json.result;
          if (r) onChange({ address: r.formatted, lat: r.lat, lng: r.lng, formatted: r.formatted, verified: true, ref: r.ref });
          else onChange({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng, formatted: null, verified: true, ref: null });
        } catch {
          onChange({ address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng, formatted: null, verified: true, ref: null });
        } finally {
          setLocating(false);
          setOpen(false);
        }
      },
      () => { setLocating(false); setLocError("Couldn't get your location — enter the address instead."); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  const showUnverified = value.address.trim().length > 0 && !value.verified && !open && !loading;

  return (
    <div style={{ position: "relative" }}>
      {label && <span style={labelStyle}>{label}</span>}
      <div className="kc-field" style={controlStyle}>
        <input
          value={value.address}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          onChange={(e) => handleText(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={inputStyle}
        />
        {value.verified && <span style={{ color: "var(--verified, #2e7d32)", fontSize: 16, flex: "0 0 auto" }} aria-label="Verified">✓</span>}
      </div>

      {open && suggestions.length > 0 && (
        <ul style={dropdownStyle}>
          {suggestions.map((s) => (
            <li key={s.ref}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => void pick(s)} style={suggItemStyle}>
                <span style={{ fontWeight: 500, color: "var(--ink)" }}>{s.primary}</span>
                {s.secondary && <span style={{ color: "var(--ink-3)", fontSize: 12 }}>{s.secondary}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 7 }}>
        <button type="button" onClick={useCurrentLocation} disabled={disabled || locating} style={locBtnStyle}>
          <span aria-hidden>📍</span> {locating ? "Locating…" : "Use my current location"}
        </button>
        {value.verified ? (
          <span style={{ fontSize: 11.5, color: "var(--verified, #2e7d32)", fontFamily: "var(--font-ui)" }}>Address verified</span>
        ) : showUnverified ? (
          <span style={{ fontSize: 11.5, color: "var(--ink-3)", fontFamily: "var(--font-ui)", textAlign: "right" }}>Not matched — will save as typed</span>
        ) : null}
      </div>
      {locError && <div style={{ fontSize: 11.5, color: "var(--terracotta)", marginTop: 4, fontFamily: "var(--font-ui)" }}>{locError}</div>}
    </div>
  );
}

const labelStyle: CSSProperties = { display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 7 };
const controlStyle: CSSProperties = { display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--hairline)", borderRadius: 12, padding: "0 12px", background: "var(--paper)" };
const inputStyle: CSSProperties = { width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 15, lineHeight: 1.5, color: "var(--ink)", padding: "12px 0" };
const dropdownStyle: CSSProperties = { position: "absolute", zIndex: 20, top: "calc(100% - 46px)", left: 0, right: 0, margin: "4px 0 0", padding: 4, listStyle: "none", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" };
const suggItemStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 1, width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13.5 };
const locBtnStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", border: "none", padding: 0, color: "var(--terracotta)", fontSize: 12.5, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-ui)" };
