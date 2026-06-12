import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveJob } from "@/lib/provider/mock";
import { VBottomNav } from "../../../_components/VBottomNav";
import { ActiveJobFlow } from "../../../_components/ActiveJobFlow";
import { PIconBack } from "../../../_components/icons";

export default async function ActiveJobScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getActiveJob(id);
  if (!job) notFound();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px" }}>
        <Link
          href="/work"
          aria-label="Back"
          style={{ width: 30, height: 30, borderRadius: "var(--r-pill)", background: "var(--chrome-card)", color: "var(--chrome-cream)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}
        >
          <PIconBack size={20} />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, color: "var(--chrome-cream)" }}>{job.title}</span>
      </div>

      <ActiveJobFlow job={job} />

      <VBottomNav active="active" />
    </>
  );
}
