import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";
import { sendTelegramMessage } from "@/lib/telegram";

const Body = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

/**
 * POST /api/v1/admin/queues/reviews/:id
 * Approve publishes the review (and its attached media) and recomputes the restaurant's
 * ratingAvg/reviewCount from all currently-approved reviews. Reject just marks it rejected.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "MODERATOR")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }
  const { id } = await params;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { action, reason } = parsed.data;

  const review = await db.review.findUnique({
    where: { id },
    include: {
      user: { select: { telegramId: true } },
      restaurant: { select: { slug: true, translations: { where: { locale: "uz" }, select: { name: true } } } },
    },
  });
  if (!review || review.status !== "PENDING") {
    return NextResponse.json({ error: "Review not found or already resolved." }, { status: 404 });
  }
  const restaurantName = review.restaurant.translations[0]?.name ?? "";

  if (action === "reject") {
    const updated = await db.review.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    await db.reviewMedia.updateMany({ where: { reviewId: id }, data: { status: "REJECTED" } });
    if (review.user.telegramId) {
      void sendTelegramMessage(
        review.user.telegramId,
        `❌ "${restaurantName}" uchun sharhingiz rad etildi.${reason ? ` Sabab: ${reason}` : ""}`,
      );
    }
    return NextResponse.json({ review: updated });
  }

  const updated = await db.$transaction(async (tx) => {
    const r = await tx.review.update({ where: { id }, data: { status: "APPROVED" } });
    await tx.reviewMedia.updateMany({ where: { reviewId: id }, data: { status: "APPROVED" } });

    const agg = await tx.review.aggregate({
      where: { restaurantId: review.restaurantId, status: "APPROVED" },
      _avg: { ratingOverall: true },
      _count: true,
    });
    await tx.restaurant.update({
      where: { id: review.restaurantId },
      data: {
        ratingAvg: Math.round((agg._avg.ratingOverall ?? 0) * 10) / 10,
        reviewCount: agg._count,
      },
    });
    return r;
  });

  if (review.user.telegramId) {
    void sendTelegramMessage(
      review.user.telegramId,
      `✅ "${restaurantName}" uchun sharhingiz tasdiqlandi va ko'rinmoqda!`,
    );
  }
  return NextResponse.json({ review: updated });
}
