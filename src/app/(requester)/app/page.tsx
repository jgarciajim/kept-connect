import Link from "next/link";
import { Avatar, StatusRing, VerifiedCheck, CategoryIcon } from "@/components/ui";
import { getActiveJobs, getCategoryShortcuts, type Job } from "@/lib/requester/mock";
import { AppHeader } from "../_components/AppHeader";
import { BottomNav } from "../_components/BottomNav";
import { IconArrow, IconGrid } from "../_components/icons";

export default async function HomeScreen() {
  const [jobs, shortcuts] = await Promise.all([getActiveJobs(), getCategoryShortcuts()]);

  return (
    <>
      <AppHeader brand title="Connect" right={<Avatar name="Grace Olin" size={30} />} />

      <main style={{ flex: 1, overflowY: "auto", padding: "4px 18px 18px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
            margin: "12px 2px 14px",
          }}
        >
          What needs doing<span style={{ color: "var(--terracotta)" }}>?</span>
        </h1>

        {/* compose bar → the make-or-break flow */}
        <Link
          href="/app/post"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--neutral)",
            border: "1px solid var(--hairline)",
            borderRadius: "var(--r-card)",
            padding: "12px 14px",
            textDecoration: "none",
          }}
        >
          <span style={{ color: "var(--ink-3)", fontSize: 14, flex: 1, fontFamily: "var(--font-ui)" }}>Describe the job…</span>
          <span style={{ width: 30, height: 30, borderRadius: "var(--r-pill)", background: "var(--terracotta)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconArrow size={16} sw={2.2} />
          </span>
        </Link>

        {/* category shortcuts (CategoryIcon wayfinding) */}
        <div style={{ display: "flex", justifyContent: "space-between", margin: "18px 2px 4px" }}>
          {shortcuts.map((t) => (
            <Link key={t.label} href="/app/post" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 60, textDecoration: "none" }}>
              <CategoryIcon category={t.category} size={48} />
              <span style={{ fontSize: 10.5, color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>{t.label}</span>
            </Link>
          ))}
          <Link href="/app/post" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 60, textDecoration: "none" }}>
            <span style={{ width: 48, height: 48, borderRadius: 15, background: "var(--neutral)", color: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconGrid size={22} />
            </span>
            <span style={{ fontSize: 10.5, color: "var(--ink-2)", fontFamily: "var(--font-ui)" }}>More</span>
          </Link>
        </div>

        {/* in progress */}
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", margin: "20px 4px 9px", fontFamily: "var(--font-ui)" }}>In progress</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </main>

      <BottomNav active="home" />
    </>
  );
}

function JobCard({ job }: { job: Job }) {
  const href = job.status === "enroute" ? `/app/jobs/${job.id}/track` : `/app/jobs/${job.id}`;
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        background: "var(--paper)",
        border: "1px solid var(--hairline)",
        borderRadius: "var(--r-card)",
        padding: 12,
        textDecoration: "none",
      }}
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
