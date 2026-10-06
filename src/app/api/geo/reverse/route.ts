import type { NextRequest } from "next/server";
import { getGeocoder } from "@/lib/geo";

/** Reverse-geocode "use my current location". GET /api/geo/reverse?lat=&lng= */
export async function GET(req: NextRequest) {
  const geo = getGeocoder();
  if (!geo) return Response.json({ disabled: true, result: null }, { status: 200 });

  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return Response.json({ result: null }, { status: 400 });

  try {
    const result = await geo.reverse(lat, lng);
    return Response.json({ result });
  } catch {
    return Response.json({ result: null }, { status: 200 });
  }
}
