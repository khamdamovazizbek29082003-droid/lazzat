import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { haversineKm } from "@/lib/data/utils";

const VERIFIED_VISIT_RADIUS_KM = 0.3; // 300m — the reviewer's browser geolocation vs the restaurant's location

const Body = z.object({
  restaurantId: z.string().uuid(),
  ratingOverall: z.number().int().min(1).max(5),
  ratingFood: z.number().int().min(1).max(5).optional(),
  ratingService: z.number().int().min(1).max(5).optional(),
  ratingAtmosphere: z.number().int().min(1).max(5).optional(),
  ratingPrice: z.number().int().min(1).max(5).optional(),
  text: z.string().max(3000).optional(),
  visitDate: z.coerce.date().optional(),
  photoUrls: z.array(z.string().url()).max(6).optional(),
  videoUrls: z.array(z.string().url()).max(2).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

/** POST /api/v1/reviews — creates a PENDING review; moderation publishes it. */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { photoUrls, videoUrls, lat, lng, ...data } = parsed.data;

  // One review per user per restaurant per 30 days
  const monthAgo = new Date(Date.now() - 30 * 86400_000);
  const recent = await db.review.findFirst({
    where: { userId, restaurantId: data.restaurantId, createdAt: { gte: monthAgo } },
    select: { id: true },
  });
  if (recent) {
    return NextResponse.json({ error: "You already reviewed this place recently." }, { status: 429 });
  }

  const media = [
    ...(photoUrls ?? []).map((url) => ({ url, type: "PHOTO" as const })),
    ...(videoUrls ?? []).map((url) => ({ url, type: "VIDEO" as const })),
  ];

  // "Verified visit" — the reviewer's own device location was within ~300m of the restaurant
  // at submit time. Optional and privacy-respecting: no location means no badge, not a rejection.
  let isVerifiedVisit = false;
  if (lat != null && lng != null) {
    const restaurant = await db.restaurant.findUnique({ where: { id: data.restaurantId }, select: { lat: true, lng: true } });
    if (restaurant) isVerifiedVisit = haversineKm({ lat, lng }, restaurant) <= VERIFIED_VISIT_RADIUS_KM;
  }

  const review = await db.review.create({
    data: { ...data, userId, status: "PENDING", isVerifiedVisit, media: { create: media } },
    include: { media: true },
  });
  // Rating aggregates recompute when the review is APPROVED (see admin review queue route).
  return NextResponse.json({ review }, { status: 201 });
}
