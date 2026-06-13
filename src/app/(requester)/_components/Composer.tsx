"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAvailableServices } from "@/lib/requester/services";
import { createRequest, type Urgency } from "@/lib/requester/requests";
import { benchmarkFor, formatUsd } from "@/lib/pricing";
import { ServiceTile } from "./ServiceTile";
import { Button, TextField, TextArea, Segmented, PhotoPicker } from "./controls";

/**
 * Composer — the calm single-scroll request form (/app/new). Reads ?service=<slug>
 * (or ?category=<family>) to pre-select, then posts through the createRequest
 * seam and routes to the request detail. Timing maps to the real `urgency` enum;
 * a scheduled date/time is held client-side (no column for it yet — flagged).
 */
type Timing = "asap" | "scheduled";

export function Composer() {
  const router = useRouter();
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
    const urgency: Urgency = timing === "asap" ? "same_day" : "whenever";
    const request = await createRequest({
      serviceSlug: service.slug,
      category: service.family,
      title: service.label,
      description: description.trim(),
      photos,
      locationLabel: address.trim(),
      urgency,
      scheduledFor: timing === "scheduled" ? scheduledFor : null,
    });
    router.push(`/app/requests/${request.id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Section label="Service">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {services.map((s) => (
            <ServiceTile key={s.slug} service={s} iconSize={48} selected={s.slug === slug} onSelect={() => setSlug(s.slug)} />
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
