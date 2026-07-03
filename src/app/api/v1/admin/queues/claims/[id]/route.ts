import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";
import { sendTelegramMessage } from "@/lib/telegram";

const Body = z.object({ action: z.enum(["approve", "reject"]) });

/**
 * POST /api/v1/admin/queues/claims/:id
 * Approving marks the restaurant `verifiedOwner: true` and grants the claimant edit rights
 * on that one listing (checked via canEditRestaurant, not a global role change).
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

  const claim = await db.ownerClaim.findUnique({
    where: { id },
    include: {
      user: { select: { telegramId: true } },
      restaurant: { select: { slug: true, translations: { where: { locale: "uz" }, select: { name: true } } } },
    },
  });
  if (!claim || claim.status !== "PENDING") {
    return NextResponse.json({ error: "Claim not found or already resolved." }, { status: 404 });
  }
  const restaurantName = claim.restaurant.translations[0]?.name ?? "";

  if (parsed.data.action === "reject") {
    const updated = await db.ownerClaim.update({
      where: { id },
      data: { status: "REJECTED", reviewedById: user.id, reviewedAt: new Date() },
    });
    if (claim.user.telegramId) {
      void sendTelegramMessage(claim.user.telegramId, `❌ "${restaurantName}" egaligi haqidagi so'rovingiz rad etildi.`);
    }
    return NextResponse.json({ claim: updated });
  }

  const [updated] = await db.$transaction([
    db.ownerClaim.update({ where: { id }, data: { status: "APPROVED", reviewedById: user.id, reviewedAt: new Date() } }),
    db.restaurant.update({ where: { id: claim.restaurantId }, data: { verifiedOwner: true } }),
  ]);
  if (claim.user.telegramId) {
    void sendTelegramMessage(
      claim.user.telegramId,
      `✅ "${restaurantName}" egaligi tasdiqlandi! Endi uni saytda tahrirlashingiz mumkin: https://lazzat-five.vercel.app/my-restaurants`,
    );
  }
  return NextResponse.json({ claim: updated });
}
