import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Q = z.object({ locale: z.enum(["uz", "ru", "en", "kaa"]).default("uz") });

/** GET /api/v1/regions?locale= — all 14 regions with their cities, for region/city pickers. */
export async function GET(req: NextRequest) {
  const parsed = Q.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { locale } = parsed.data;

  const regions = await db.region.findMany({
    include: {
      translations: { where: { locale } },
      cities: { select: { slug: true, translations: { where: { locale }, select: { name: true } } } },
    },
  });

  const items = regions
    .map((r) => ({
      id: r.id,
      name: r.translations[0]?.name ?? r.code,
      cities: r.cities.map((c) => ({ slug: c.slug, name: c.translations[0]?.name ?? c.slug })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
