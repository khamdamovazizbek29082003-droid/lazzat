import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const Body = z.object({
  restaurantId: z.string().uuid(),
  ratingOverall: z.number().int().min(1).max(5),
  ratingFood: z.number().int().min(1).max(5).optional(),
  ratingService: z.number().int().min(1).max(5).optional(),
  ratingAtmosphere: z.number().int().min(1).max(5).optional(),
  ratingPrice: z.number().int().min(1).max(5).optional(),
  text: z.string().max(3000).optional(),
  visitDate: z.coerce.date().optional(),
});

/** POST /api/v1/reviews — creates a PENDING review; moderation publishes it. */
export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  // One review per user per restaurant per 30 days
  const monthAgo = new Date(Date.now() - 30 * 86400_000);
  const recent = await db.review.findFirst({
    where: { userId, restaurantId: data.restaurantId, createdAt: { gte: monthAgo } },
    select: { id: true },
  });
  if (recent) {
    return NextResponse.json({ error: "You already reviewed this place recently." }, { status: 429 });
  }

  const review = await db.review.create({ data: { ...data, userId, status: "PENDING" } });
  // Rating aggregates recompute in a background job when the review is APPROVED.
  return NextResponse.json({ review }, { status: 201 });
}
