import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/** GET /api/v1/my/restaurants — restaurants the current user has an APPROVED ownership claim on. */
export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claims = await db.ownerClaim.findMany({
    where: { userId, status: "APPROVED" },
    select: { restaurantId: true },
  });
  const items = await db.restaurant.findMany({
    where: { id: { in: claims.map((c) => c.restaurantId) } },
    include: {
      translations: true,
      city: { include: { translations: { where: { locale: "uz" } } } },
      attributes: true,
      hours: { orderBy: { dayOfWeek: "asc" } },
    },
  });
  return NextResponse.json({ items });
}
