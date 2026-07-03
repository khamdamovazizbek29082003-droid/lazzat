import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const Body = z.object({
  evidenceType: z.enum(["PHONE_VERIFICATION", "DOCUMENT", "UTILITY_BILL", "OTHER"]),
  evidenceUrl: z.string().url().optional(),
  note: z.string().max(500).optional(),
});

/**
 * POST /api/v1/restaurants/:slug/claim
 * A signed-in user claims ownership of a listing (e.g. the actual restaurant owner wanting
 * to keep their own menu/hours/photos up to date). Lands in the admin claims queue; a
 * moderator verifies before the claim grants edit rights (see canEditRestaurant in policies.ts).
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({ where: { slug }, select: { id: true } });
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await db.ownerClaim.findUnique({
    where: { restaurantId_userId: { restaurantId: restaurant.id, userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "You already have a claim on this place.", claim: existing }, { status: 409 });
  }

  const claim = await db.ownerClaim.create({
    data: { restaurantId: restaurant.id, userId, ...parsed.data },
  });
  return NextResponse.json({ claim }, { status: 201 });
}
