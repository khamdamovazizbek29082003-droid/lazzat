import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Supercluster from "supercluster";
import { markersInBBox } from "@/lib/geo";

/**
 * GET /api/v1/map?west=&south=&east=&north=&zoom=
 * Powers the 3D map. Below zoom 13 we return clusters (region/city bubbles);
 * at street zoom we return individual markers. The client (MapLibre GL, pitch 55°)
 * renders clusters as count bubbles and markers as billboarded pins.
 */
const Q = z.object({
  west: z.coerce.number().min(-180).max(180),
  south: z.coerce.number().min(-90).max(90),
  east: z.coerce.number().min(-180).max(180),
  north: z.coerce.number().min(-90).max(90),
  zoom: z.coerce.number().min(0).max(22).default(5),
});

export async function GET(req: NextRequest) {
  const parsed = Q.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { west, south, east, north, zoom } = parsed.data;

  const markers = await markersInBBox({ west, south, east, north });

  if (zoom >= 13) {
    return NextResponse.json(
      { type: "markers", items: markers },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
    );
  }

  const index = new Supercluster({ radius: 64, maxZoom: 13 });
  index.load(
    markers.map((m) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
      properties: { id: m.id, rating: m.rating },
    })),
  );
  const clusters = index.getClusters([west, south, east, north], Math.round(zoom));

  return NextResponse.json(
    { type: "clusters", items: clusters },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" } },
  );
}
