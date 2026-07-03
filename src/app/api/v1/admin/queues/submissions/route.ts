import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";

/** GET /api/v1/admin/queues/submissions — pending community submissions, oldest first. */
export async function GET() {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "MODERATOR")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }

  const items = await db.placeSubmission.findMany({
    where: { status: { in: ["PENDING", "IN_REVIEW"] } },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: { user: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ items });
}
