import { notFound } from "next/navigation";
import { getJob } from "@/lib/requester/mock";
import { AppHeader } from "../../../../_components/AppHeader";
import { RatingForm } from "../../../../_components/RatingForm";

export default async function RateScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job || !job.provider) notFound();

  return (
    <>
      <AppHeader title="Rate" backHref={`/app/jobs/${job.id}/track`} />
      <RatingForm providerName={job.provider.name} jobSummary={`${job.title} · done in 38 min`} />
    </>
  );
}
