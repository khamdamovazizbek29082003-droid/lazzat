import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";
import { syncLocation } from "@/lib/geo";
import { buildSearchText } from "@/lib/search/translit";

/**
 * POST /api/v1/admin/queues/submissions/:id
 * body: { action: "approve" | "reject" | "duplicate", reason?, cityId? }
 *
 * The moderator workflow: open the item → call the ownerPhone to verify the
 * place exists and get consent → approve. Approval materializes a Restaurant
 * (PENDING content completion, but live on the map), links it back to the
 * submission, and writes an AuditLog entry.
 */
const Body = z.object({
  action: z.enum(["approve", "reject", "duplicate"]),
  reason: z.string().max(500).optional(),
  cityId: z.string().uuid().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "MODERATOR")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }
  const { id } = await params;

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { action, reason, cityId } = parsed.data;

  const sub = await db.placeSubmission.findUnique({ where: { id } });
  if (!sub || !["PENDING", "IN_REVIEW"].includes(sub.status)) {
    return NextResponse.json({ error: "Submission not found or already resolved." }, { status: 404 });
  }

  if (action !== "approve") {
    const updated = await db.placeSubmission.update({
      where: { id },
      data: {
        status: action === "reject" ? "REJECTED" : "DUPLICATE",
        rejectionReason: reason,
        reviewedById: user.id,
        reviewedAt: new Date(),
      },
    });
    return NextResponse.json({ submission: updated });
  }

  const city =
    (cityId ? await db.city.findUnique({ where: { id: cityId } }) : null) ??
    (await db.city.findUniqueOrThrow({ where: { slug: "tashkent" } }));

  const slugBase = sub.name.toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
  const slug = `${slugBase}-${sub.id.slice(0, 6)}`;

  const restaurant = await db.$transaction(async (tx) => {
    const r = await tx.restaurant.create({
      data: {
        slug,
        type: sub.type,
        cityId: city.id,
        address: sub.note ?? "",
        lat: sub.lat,
        lng: sub.lng,
        phone: sub.ownerPhone,
        status: "APPROVED",
        searchText: buildSearchText([sub.name]),
        translations: {
          create: [
            { locale: "uz", name: sub.name },
            { locale: "ru", name: sub.name },
            { locale: "en", name: sub.name },
          ],
        },
        attributes: { create: {} },
      },
    });
    await tx.placeSubmission.update({
      where: { id },
      data: { status: "APPROVED", reviewedById: user.id, reviewedAt: new Date(), createdRestaurantId: r.id },
    });
    await tx.auditLog.create({
      data: {
        actorId: user.id, entityType: "Restaurant", entityId: r.id, action: "create",
        diff: { fromSubmission: id, verifiedOwnerPhone: sub.ownerPhone },
      },
    });
    return r;
  });

  await syncLocation(restaurant.id, sub.lat, sub.lng);
  // TODO: SMS/Telegram the submitter "your place is live"; invite owner to claim it.
  return NextResponse.json({ restaurant }, { status: 201 });
}
