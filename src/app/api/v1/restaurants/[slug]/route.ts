import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/v1/restaurants/:slug
 * Full detail for one restaurant: translations (all locales — the client switches language
 * instantly without refetching), menu, working hours, attributes, and approved reviews.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const restaurant = await db.restaurant.findFirst({
    where: { slug, status: "APPROVED" },
    include: {
      translations: true,
      city: { include: { translations: true } },
      district: { include: { translations: true } },
      attributes: true,
      hours: { orderBy: { dayOfWeek: "asc" } },
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          translations: true,
          items: {
            where: { isAvailable: true },
            orderBy: { sortOrder: "asc" },
            include: { translations: true },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { name: true } }, media: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ restaurant });
}
