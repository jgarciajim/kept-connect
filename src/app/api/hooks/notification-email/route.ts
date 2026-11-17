import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { sendEmail } from "@/lib/email/send";
import { jobOffer, newQuoteJob } from "@/lib/email/templates";

/**
 * DB → email bridge. The database (pg_net, see migration 20261117120000) POSTs
 * here when it creates a Pro alert that is born inside Postgres — an instant
 * offer made by the pg_cron dispatcher, or a new quote job fanned out to
 * matching Pros — so the app never saw the event happen.
 *
 * Authenticated by a shared secret header (NOTIFY_HOOK_SECRET here, the
 * `notify_hook_secret` Vault secret in the DB). Public in proxy.ts.
 */
export const runtime = "nodejs";

type Payload = {
  type: "job_offer" | "new_job";
  to: string;
  name: string | null;
  job_title: string;
  pay: number | null;
  respond_seconds: number | null;
  place: string | null;
  request_id: string;
};

function authorized(req: NextRequest): boolean {
  const expected = process.env.NOTIFY_HOOK_SECRET;
  const got = req.headers.get("x-guildry-hook-secret");
  if (!expected || !got) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body?.to || typeof body.to !== "string" || !body.to.includes("@") || !UUID.test(body.request_id ?? "")) {
    return NextResponse.json({ error: "bad payload" }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const title = (body.job_title || "A new job").slice(0, 140);
  const pay = typeof body.pay === "number" && body.pay > 0 ? body.pay.toFixed(0) : "";

  const email =
    body.type === "job_offer"
      ? jobOffer(body.name, title, pay, body.respond_seconds ?? 300, `${origin}/work`)
      : body.type === "new_job"
        ? newQuoteJob(body.name, title, (body.place ?? "").slice(0, 200), `${origin}/work/requests/${body.request_id}`)
        : null;
  if (!email) return NextResponse.json({ error: "unknown type" }, { status: 400 });

  await sendEmail({ to: body.to, ...email });
  return NextResponse.json({ ok: true });
}
