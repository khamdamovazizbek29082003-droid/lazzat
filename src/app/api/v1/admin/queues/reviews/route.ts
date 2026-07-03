import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";

/** GET /api/v1/admin/queues/reviews — pending reviews awaiting moderation, oldest first. */
export async function GET() {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "MODERATOR")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }

  const items = await db.review.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true } },
      restaurant: { select: { slug: true, translations: { where: { locale: "uz" }, select: { name: true } } } },
      media: true,
    },
  });
  return NextResponse.json({ items });
}
