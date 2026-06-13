"use client";

import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/lib/requester/services";

/**
 * ServiceTile — a discovery/selection tile for one catalog service. Local to the
 * requester surface (not shared ui) because it carries the full-color 3D PNG
 * icon, which the two-tier icon rule keeps off functional UI.
 *
 * Two modes:
 *  - link (default)  → navigates to the composer for this service
 *  - select          → pass `onSelect`; renders a button and shows a terracotta
 *                       ring when `selected` (used inside the /app/new composer)
 *
 * Discipline: the tile stays neutral (paper); the icon is the color "event". The
 * only family color is a faint --cat-* dot. A badge is a campaign pill (terracotta
 * for seasonal, ink for "Popular") — it never tints the tile.
 */
export interface ServiceTileProps {
  service: Service;
  /** Badge text from badgeFor(campaigns, service.family); pill shown only if set. */
  badge?: string | null;
  /** Display size of the icon in px (~60 on the home row). */
  iconSize?: number;
  /** Override the link target (defaults to the composer for this service). */
  href?: string;
  /** Selection mode: render a button that calls this instead of navigating. */
  onSelect?: () => void;
  /** Selected state (selection mode) — draws the terracotta ring. */
  selected?: boolean;
}

export function ServiceTile({ service, badge, iconSize = 60, href, onSelect, selected = false }: ServiceTileProps) {
  const inner = (
    <>
      {badge ? <Badge label={badge} /> : null}
      <span
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1",
          borderRadius: "var(--r-card)",
          background: "var(--paper)",
          border: selected ? "2px solid var(--terracotta)" : "1px solid var(--hairline)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image src={`/icons/services/${service.icon}`} alt={service.label} width={iconSize} height={iconSize} />
        <span
          aria-hidden
          style={{ position: "absolute", top: 8, right: 8, width: 6, height: 6, borderRadius: "var(--r-pill)", background: `var(--cat-${service.family})`, opacity: 0.55 }}
        />
      </span>
      <span style={{ fontSize: 11.5, color: selected ? "var(--ink)" : "var(--ink-2)", fontFamily: "var(--font-ui)", textAlign: "center", lineHeight: 1.2 }}>
        {service.label}
      </span>
    </>
  );

  const frame = { position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, textDecoration: "none" } as const;

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} style={{ ...frame, border: "none", background: "none", padding: 0, cursor: "pointer", font: "inherit" }}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href ?? `/app/new?service=${service.slug}`} style={frame}>
      {inner}
    </Link>
  );
}

function Badge({ label }: { label: string }) {
  const isPromo = label.toLowerCase() === "popular";
  return (
    <span
      style={{
        position: "absolute",
        top: -7,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
        fontSize: 9.5,
        fontWeight: 600,
        color: "var(--paper)",
        background: isPromo ? "var(--ink)" : "var(--terracotta)",
        padding: "2px 8px",
        borderRadius: "var(--r-pill)",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-ui)",
      }}
    >
      {label}
    </span>
  );
}
