"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { getAvailableServices, optionSlug, getServiceOptionLabel } from "@/lib/requester/services";
import { postRequest } from "@/lib/requester/actions";
import { benchmarkFor, formatUsd } from "@/lib/pricing";
import { ServiceTile } from "./ServiceTile";
import { Button, TextField, TextArea, Segmented, PhotoPicker } from "./controls";

/**
 * Composer — the calm single-scroll request form (/app/new). Reads ?service=<slug>
 * (or ?category=<family>) to pre-select, then posts the real request through the
 * postRequest server action, which redirects to /app/jobs/[id]. Timing maps to the
 * real `urgency` enum; photos + a scheduled date/time are collected but have no
 * columns yet (flagged for later).
 */
type Timing = "asap" | "scheduled";

// Sentinel for the "Something else" chip: an explicit choice to lean on free text
// (distinct from null = nothing picked yet). Never persisted — maps to no option.
const SOMETHING_ELSE = "__else__";

export function Composer() {
  const params = useSearchParams();

  // Availability is month-stable, so computing once is safe (no hydration drift).
  const services = useMemo(() => getAvailableServices({ now: new Date() }), []);

  const initialSlug = useMemo(() => {
    const s = params.get("service");
    if (s && services.some((x) => x.slug === s)) return s;
    const cat = params.get("category");
    if (cat) {
      const byFamily = services.find((x) => x.family === cat);
      if (byFamily) return byFamily.slug;
    }
    return services[0]?.slug ?? "";
  }, [params, services]);

  const [slug, setSlug] = useState(initialSlug);
  // The chosen quick-pick: an option slug, the SOMETHING_ELSE sentinel, or null
  // (nothing picked). Resets whenever the service changes.
  const [picked, setPicked] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [timing, setTiming] = useState<Timing>("asap");
  const [scheduledFor, setScheduledFor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const service = services.find((s) => s.slug === slug);
  // Soft, informational benchmark for the selected tile — a mountain-adjusted
  // typical range from the seed catalog. null = a gap (no seed match), shown as a
  // quote prompt instead of an invented price. Display-only; never posted.
  const benchmark = useMemo(() => benchmarkFor(slug), [slug]);
  const valid = Boolean(service && description.trim() && address.trim() && (timing === "asap" || scheduledFor));

  async function submit() {
    if (!service || !valid || submitting) return;
    setSubmitting(true);
    const urgency = timing === "asap" ? "same_day" : "whenever";
    const optionPicked = picked && picked !== SOMETHING_ELSE ? picked : null;
    const optionLabel = optionPicked ? getServiceOptionLabel(service.slug, optionPicked) : null;
    const title = optionLabel ? `${service.label} · ${optionLabel}` : service.label;

    // Post the real request (RLS-scoped); the action redirects to /app/jobs/[id].
    // photos + scheduledFor have no columns yet — collected but not persisted (flagged).
    const fd = new FormData();
    fd.set("serviceSlug", service.slug);
    fd.set("category", service.family);
    fd.set("title", title);
    if (optionPicked) fd.set("option", optionPicked);
    fd.set("description", description.trim());
    fd.set("urgency", urgency);
    fd.set("locationLabel", address.trim());
    await postRequest(fd);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Section label="Service">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {services.map((s) => (
            <ServiceTile
              key={s.slug}
              service={s}
              iconSize={48}
              selected={s.slug === slug}
              onSelect={() => {
                setSlug(s.slug);
                setPicked(null); // a new service clears the previous job pick
              }}
            />
          ))}
        </div>
        {service && (
          <div style={{ marginTop: 12 }}>
            {benchmark ? (
              <>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 15, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>
                  ~{formatUsd(benchmark.low)}–{formatUsd(benchmark.high)} near you
                </div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                  benchmark · not a quote
                </div>
              </>
            ) : (
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, color: "var(--ink-3)" }}>Get a quote →</div>
            )}
          </div>
        )}
      </Section>

      {service && service.options.length > 0 && (
        <Section label="Common jobs" hint="Optional">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {service.options.map((label) => {
              const value = optionSlug(label);
              return <OptionChip key={value} label={label} selected={picked === value} onSelect={() => setPicked(value)} />;
            })}
            <OptionChip label="Something else" selected={picked === SOMETHING_ELSE} onSelect={() => setPicked(SOMETHING_ELSE)} />
          </div>
        </Section>
      )}

      <Section label="What needs doing?">
        <TextArea value={description} onChange={setDescription} placeholder="What needs doing? Where in the home?" rows={4} />
      </Section>

      <Section label="Photos" hint="Optional">
        <PhotoPicker photos={photos} onChange={setPhotos} />
      </Section>

      <Section label="Address">
        <TextField value={address} onChange={setAddress} placeholder="Street address" />
        <div style={{ marginTop: 8 }}>
          <Button variant="ghost" onClick={() => setAddress("14 Birch Lane, Breckenridge")}>
            Use my property
          </Button>
        </div>
      </Section>

      <Section label="When">
        <Segmented<Timing>
          options={[
            { value: "asap", label: "ASAP" },
            { value: "scheduled", label: "Schedule" },
          ]}
          value={timing}
          onChange={setTiming}
        />
        {timing === "scheduled" && (
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            style={{ marginTop: 10, width: "100%", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-chip)", padding: "12px 14px", fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--ink)" }}
          />
        )}
      </Section>

      <div style={{ position: "sticky", bottom: 0, paddingTop: 4, paddingBottom: 8, background: "linear-gradient(to top, var(--canvas) 70%, transparent)" }}>
        <Button type="submit" variant="primary" full disabled={!valid || submitting} onClick={submit}>
          {submitting ? "Posting…" : "Post request"}
        </Button>
      </div>
    </div>
  );
}

// A single quick-pick job chip. Selected = terracotta (the action color);
// unselected stays neutral on paper. Tokens only, no hexes.
function OptionChip({ label, selected, onSelect }: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        padding: "8px 14px",
        borderRadius: "var(--r-pill)",
        cursor: "pointer",
        fontFamily: "var(--font-ui)",
        fontSize: 13.5,
        fontWeight: 500,
        background: selected ? "var(--terracotta)" : "var(--paper)",
        color: selected ? "var(--cream)" : "var(--ink)",
        border: selected ? "1px solid var(--terracotta)" : "1px solid var(--hairline)",
        transition: "background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease)",
      }}
    >
      {label}
    </button>
  );
}

function Section({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 2px 9px" }}>
        <h2 style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 12.5, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-3)", margin: 0 }}>{label}</h2>
        {hint && <span style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>{hint}</span>}
      </div>
      {children}
    </section>
  );
}
