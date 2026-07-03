import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { allRegionsAsClusters, markersInBBox } from "@/lib/geo";

/**
 * GET /api/v1/map?west=&south=&east=&north=&zoom=&locale=
 * Below zoom 8 the client renders region-labeled cluster bubbles ("Samarqand · 3"), covering
 * all 14 regions regardless of whether they have restaurants yet — the whole country is
 * explorable on the map from day one, not just places with existing data.
 * At zoom >= 8 it returns individual restaurant markers.
 */
const Q = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
  zoom: z.coerce.number().min(0).max(22).default(5),
  locale: z.enum(["uz", "ru", "en"]).default("uz"),
});

const CLUSTER_ZOOM_THRESHOLD = 8;

export async function GET(req: NextRequest) {
  const parsed = Q.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { west, south, east, north, zoom, locale } = parsed.data;
  const bbox = { west, south, east, north };

  if (zoom < CLUSTER_ZOOM_THRESHOLD) {
    const items = await allRegionsAsClusters(locale);
    return NextResponse.json(
      { type: "clusters", items },
      { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
    );
  }

  const items = await markersInBBox(bbox, locale);
  return NextResponse.json(
    { type: "markers", items },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
