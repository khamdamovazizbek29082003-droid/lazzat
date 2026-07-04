import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";

/** GET /api/v1/admin/users — all signed-up users. Admin-only (more sensitive than other queues). */
export async function GET() {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "ADMIN")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }

  const items = await db.user.findMany({
    select: { id: true, name: true, email: true, telegramId: true, role: true, isBanned: true, createdAt: true, lastSeenAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items, total: items.length });
}
