import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalize } from "@/lib/search/translit";

const Q = z.object({
  city: z.string().optional(),
  q: z.string().max(80).optional(),
  openNow: z.coerce.boolean().optional(),
  halal: z.coerce.boolean().optional(),
  priceBucket: z.enum(["BUDGET", "MODERATE", "UPSCALE", "PREMIUM"]).optional(),
  locale: z.enum(["uz", "ru", "en"]).default("uz"),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  const parsed = Q.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { city, q, halal, priceBucket, locale, cursor, limit } = parsed.data;

  const items = await db.restaurant.findMany({
    where: {
      status: "APPROVED",
      ...(city && { city: { slug: city } }),
      ...(priceBucket && { priceBucket }),
      ...(halal && { attributes: { halal: true } }),
      ...(q && { searchText: { contains: normalize(q) } }),
    },
    orderBy: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: {
      id: true, slug: true, type: true, lat: true, lng: true,
      priceBucket: true, avgCheckUzs: true, ratingAvg: true, reviewCount: true,
      coverImageUrl: true,
      // All locales, not just the requested one — the UI switches language client-side
      // instantly without refetching, so restaurant name/description need every locale.
      translations: { select: { locale: true, name: true, description: true } },
      attributes: true,
      hours: { orderBy: { dayOfWeek: "asc" } },
      city: { select: { slug: true, translations: { where: { locale }, select: { name: true } } } },
      district: { select: { translations: { where: { locale }, select: { name: true } } } },
    },
  });

  const nextCursor = items.length > limit ? items.pop()!.id : null;
  return NextResponse.json({ items, nextCursor });
}
