import Link from "next/link";
import { CategoryIcon } from "@/components/ui";
import { getAllJobs, type Job } from "@/lib/requester/mock";
import { AppHeader } from "../../_components/AppHeader";
import { BottomNav } from "../../_components/BottomNav";

const STATUS_LABEL: Record<string, string> = {
  finding: "Finding a pro",
  quoted: "Quotes in",
  awarded: "Matched",
  enroute: "On the way",
  complete: "Complete",
  paid: "Paid",
  rated: "Rated",
};

// The requester's activity list (/app/jobs) — every request, any status.
export default async function JobsScreen() {
  const jobs = await getAllJobs();

  return (
    <>
      <AppHeader title="Your jobs" backHref="/app" />
      <main style={{ flex: 1, overflowY: "auto", padding: "4px 16px 92px" }}>
        {jobs.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", fontFamily: "var(--font-ui)", padding: "24px 4px", textAlign: "center" }}>
            No jobs yet — post one from Home.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map((j) => (
              <JobRow key={j.id} job={j} />
            ))}
          </div>
        )}
      </main>
      <BottomNav active="jobs" />
    </>
  );
}

function JobRow({ job }: { job: Job }) {
  const href =
    job.status === "enroute"
      ? `/app/jobs/${job.id}/track`
      : job.status === "complete"
        ? `/app/jobs/${job.id}/rate`
        : `/app/jobs/${job.id}`;
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 12, textDecoration: "none" }}>
      <CategoryIcon category={job.request.trade} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>{job.title || "Request"}</div>
        <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 1, fontFamily: "var(--font-ui)" }}>
          {STATUS_LABEL[job.dbStatus] ?? job.dbStatus}
          {job.provider ? ` · ${job.provider.name}` : ""}
        </div>
      </div>
      {job.price && (
        <div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontFamily: "var(--font-ui)" }}>${job.price}</div>
      )}
    </Link>
  );
}
