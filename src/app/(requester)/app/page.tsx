import Link from "next/link";
import type { CSSProperties } from "react";
import { Avatar, StatusRing, VerifiedCheck, CategoryIcon } from "@/components/ui";
import { getActiveJobs, getCurrentMember, type Job } from "@/lib/requester/mock";
import {
  getActiveCampaigns,
  getAreaInsight,
  pickHero,
  pickRail,
  badgeFor,
  type Campaign,
  type AreaInsight,
} from "@/lib/requester/campaigns";
import { CAMPAIGN_THEMES } from "@/lib/requester/campaignThemes";
import { getFeaturedServices } from "@/lib/requester/services";
import { getUnreadCount } from "@/lib/notifications";
import { NotificationBell } from "@/components/NotificationBell";
import { BottomNav } from "../_components/BottomNav";
import { ServiceTile } from "../_components/ServiceTile";
import { IconArrow, IconPin, IconChevron } from "../_components/icons";

// The viewer's region. Static for now; later it comes from the member profile —
// every seam already takes it as a parameter.
const REGION = "summit-co";

export default async function HomeScreen() {
  const now = new Date();
  const campaigns = await getActiveCampaigns({ region: REGION, now });
  const [featured, insight, jobs, member, unread] = await Promise.all([
    getFeaturedServices({ now }),
    getAreaInsight({ region: REGION }),
    getActiveJobs(),
    getCurrentMember(),
    getUnreadCount(),
  ]);

  const hero = pickHero(campaigns);
  const rail = pickRail(campaigns);

  return (
    <>
      {/* location + avatar header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px 10px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 15, color: "var(--ink)" }}>
          <IconPin size={16} />
          Breckenridge
          <IconChevron size={14} sw={2.4} style={{ transform: "rotate(90deg)" }} />
        </span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 16, color: "var(--ink)" }}>
          <NotificationBell href="/app/notifications" count={unread} />
          <Link href="/app/you" aria-label="Your account" style={{ display: "inline-flex" }}>
            <Avatar name={member?.displayName ?? "You"} size={32} />
          </Link>
        </span>
      </div>

      <main style={{ flex: 1, overflowY: "auto", padding: "0 16px 18px" }}>
        {/* seasonal hero — whatever campaign is live today */}
        {hero && <SeasonalHero campaign={hero} />}

        {/* post bar — the make-or-break flow (sits below the seasonal/regional banner) */}
        <Link
          href="/app/new"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--paper)",
            border: "1px solid var(--hairline)",
            borderRadius: 16,
            padding: "13px 15px",
            marginTop: 16,
            boxShadow: "var(--shadow-card)",
            textDecoration: "none",
          }}
        >
          <span style={{ flex: 1, fontFamily: "var(--font-display)", fontSize: 16, color: "var(--ink)" }}>What needs doing?</span>
          <span style={{ width: 32, height: 32, borderRadius: "var(--r-pill)", background: "var(--terracotta)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconArrow size={16} sw={2.2} />
          </span>
        </Link>

        {/* popular this season — featured services */}
        <SectionHeader title="Popular this season" action={{ label: "See all", href: "/app/services" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {featured.map((service) => (
            <ServiceTile key={service.slug} service={service} badge={badgeFor(campaigns, service.family)} />
          ))}
        </div>

        {/* get ahead of the season — editorial rail */}
        {rail.length > 0 && (
          <>
            <SectionHeader title="Get ahead of the season" />
            <div
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                margin: "0 -16px",
                padding: "2px 16px 4px",
                scrollbarWidth: "none",
              }}
            >
              {rail.map((campaign) => (
                <RailCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </>
        )}

        {/* in your area — local insight (human moment, --moment surface) */}
        <SectionHeader title="In your area" />
        <AreaInsightCard insight={insight} />

        {/* in progress — the requester's live jobs (real, RLS-scoped). No seasonal tint. */}
        <SectionHeader title="In progress" />
        {jobs.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--ink-3)", fontFamily: "var(--font-ui)", margin: "0 2px" }}>
            Nothing in progress yet — post a job to get started.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </main>

      <BottomNav active="home" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Section header — Fraunces title + optional terracotta action link.
// ---------------------------------------------------------------------------
function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "24px 2px 12px" }}>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 18, color: "var(--ink)", margin: 0 }}>{title}</h3>
      {action && (
        <Link href={action.href} style={{ fontSize: 12.5, color: "var(--terracotta)", fontWeight: 500, fontFamily: "var(--font-ui)", textDecoration: "none" }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Seasonal hero. Background/art tint come from the campaign theme; the CTA is
// always terracotta — the action color never changes with the season.
// ---------------------------------------------------------------------------
function SeasonalHero({ campaign }: { campaign: Campaign }) {
  const t = CAMPAIGN_THEMES[campaign.theme];
  const href = `/app/new?category=${campaign.targetCategory}&campaign=${campaign.slug}`;
  return (
    <div style={{ position: "relative", overflow: "hidden", marginTop: 16, borderRadius: 22, background: t.heroBg, padding: "20px 18px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: t.kicker }}>{campaign.kicker}</div>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 25, lineHeight: 1.05, margin: "7px 0 6px", maxWidth: "78%", color: "var(--ink)" }}>
        {campaign.title}
        <span style={{ color: "var(--terracotta)" }}>.</span>
      </h2>
      <p style={{ fontSize: 13.5, color: t.subtitle, margin: "0 0 15px", maxWidth: "74%" }}>{campaign.subtitle}</p>
      <Link
        href={href}
        style={{ display: "inline-flex", background: "var(--terracotta)", color: "var(--cream)", fontSize: 13.5, fontWeight: 600, borderRadius: "var(--r-pill)", padding: "10px 18px", textDecoration: "none" }}
      >
        {campaign.ctaLabel}
      </Link>
      <HeroArt theme={campaign.theme} color={t.art} />
    </div>
  );
}

// Editorial rail card — themed image block + Fraunces title + subtitle.
function RailCard({ campaign }: { campaign: Campaign }) {
  const t = CAMPAIGN_THEMES[campaign.theme];
  const href = `/app/new?category=${campaign.targetCategory}&campaign=${campaign.slug}`;
  return (
    <Link
      href={href}
      style={{ flex: "0 0 188px", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: 18, overflow: "hidden", textDecoration: "none" }}
    >
      <div style={{ height: 108, background: t.railBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <HeroArt theme={campaign.theme} color={t.railArt} inline />
      </div>
      <div style={{ padding: "11px 13px 14px" }}>
        <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 15, lineHeight: 1.1, margin: "0 0 3px", color: "var(--ink)" }}>{campaign.title}</h4>
        <p style={{ fontSize: 12, color: "var(--ink-2)", margin: 0, fontFamily: "var(--font-ui)" }}>{campaign.subtitle}</p>
      </div>
    </Link>
  );
}

// In-your-area insight — sits on --moment (a human-moment surface, never behind
// real data). Numbers are static mock today.
function AreaInsightCard({ insight }: { insight: AreaInsight }) {
  return (
    <div style={{ background: "var(--moment)", borderRadius: 18, padding: "16px 18px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--terracotta-deep)" }}>
        {insight.regionLabel} · right now
      </div>
      <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, margin: "5px 0 10px", color: "var(--ink)" }}>{insight.headline}</h4>
      <div style={{ display: "flex", gap: 18 }}>
        <Stat value={insight.avgQuote} label="avg quote" />
        <Stat value={insight.avgResponse} label="avg response" />
        <Stat value={String(insight.prosNearby)} label="pros nearby" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <b style={{ fontSize: 17, fontWeight: 600, fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-display)", color: "var(--ink)" }}>{value}</b>
      <span style={{ fontSize: 11, color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>{label}</span>
    </div>
  );
}

// In-progress job row — reuses requester mock job data. Cool/data side: no
// seasonal tint, terracotta only for the live ring/indicator.
function JobCard({ job }: { job: Job }) {
  const href = job.status === "enroute" ? `/app/jobs/${job.id}/track` : `/app/jobs/${job.id}`;
  return (
    <Link
      href={href}
      style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: 16, padding: 12, textDecoration: "none" }}
    >
      {job.provider ? (
        <StatusRing state="quoted" size={36}>
          <Avatar name={job.provider.name} size={36} />
        </StatusRing>
      ) : (
        <CategoryIcon category={job.request.trade} size={44} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 14, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>
          {job.provider ? job.provider.name : job.title}
          {job.provider?.verified && <VerifiedCheck size={14} />}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", display: "flex", alignItems: "center", gap: 6, marginTop: 1, fontFamily: "var(--font-ui)" }}>
          {job.status === "enroute" ? (
            <>
              <span style={{ width: 6, height: 6, borderRadius: "var(--r-pill)", background: "var(--terracotta)" }} /> Plumbing · On the way
            </>
          ) : (
            "3 quotes in"
          )}
        </div>
      </div>
      {job.status === "enroute" && (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontFamily: "var(--font-ui)" }}>${job.price}</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>{job.etaMinutes} min</div>
        </div>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Hero art — decorative seasonal motif, tinted by the theme's art color. Purely
// editorial; carries no meaning and never an action. `inline` centers it for the
// rail card; otherwise it floats in the hero's bottom-right.
// ---------------------------------------------------------------------------
function HeroArt({ theme, color, inline = false }: { theme: Campaign["theme"]; color: string; inline?: boolean }) {
  const floatStyle: CSSProperties = inline
    ? { width: 44, height: 44, opacity: 0.95 }
    : { position: "absolute", right: -6, bottom: -10, width: 132, height: 132, opacity: 0.9 };
  return (
    <svg viewBox="0 0 120 120" fill="none" style={floatStyle} aria-hidden>
      {theme === "winter" && (
        <g stroke={color} strokeWidth={3} strokeLinecap="round">
          <path d="M60 26 V94 M60 26 l-8 8 M60 26 l8 8 M60 94 l-8 -8 M60 94 l8 -8" />
          <path d="M30 60 H90 M30 60 l8 -8 M30 60 l8 8 M90 60 l-8 -8 M90 60 l8 8" />
          <path d="M39 39 L81 81 M81 39 L39 81" />
        </g>
      )}
      {theme === "summer" && (
        <g stroke={color} strokeWidth={3.4} strokeLinecap="round">
          <circle cx="60" cy="60" r="18" fill={color} stroke="none" />
          <path d="M60 22V34 M60 86V98 M22 60H34 M86 60H98 M34 34l8 8 M78 78l8 8 M86 34l-8 8 M42 78l-8 8" />
        </g>
      )}
      {theme === "fall" && (
        <g stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 30c-16 0-28 12-28 28 0 16 12 28 28 28s28-12 28-28" fill="none" />
          <path d="M60 86V46 M60 58l-12-10 M60 70l12-10" />
        </g>
      )}
      {theme === "spring" && (
        <g stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 92V52" />
          <path d="M60 64c-10 0-18-6-20-18 12 0 20 6 20 18z" fill={color} stroke="none" />
          <path d="M60 56c10 0 18-6 20-18-12 0-20 6-20 18z" fill={color} stroke="none" />
        </g>
      )}
      {theme === "neutral" && (
        <g stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 60 60 36l26 24v26a2 2 0 0 1-2 2H36a2 2 0 0 1-2-2z" fill="none" />
          <path d="M52 88V70h16v18" />
        </g>
      )}
    </svg>
  );
}
