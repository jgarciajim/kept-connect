import type { NextRequest } from "next/server";
import { getGeocoder } from "@/lib/geo";

/** Address type-ahead. GET /api/geo/suggest?q=&session=&lat=&lng= (lat/lng = proximity bias). */
export async function GET(req: NextRequest) {
  const geo = getGeocoder();
  if (!geo) return Response.json({ disabled: true, suggestions: [] }, { status: 200 });

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim();
  const session = sp.get("session") ?? "";
  if (q.length < 3 || !session) return Response.json({ suggestions: [] });

  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  const proximity = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : undefined;

  try {
    const suggestions = await geo.suggest(q, { session, proximity });
    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] }, { status: 200 });
  }
}
