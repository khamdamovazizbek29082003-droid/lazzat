import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole, type SessionUser } from "@/lib/policies";
import { normalize } from "@/lib/search/translit";

/** GET /api/v1/admin/restaurants?q= — search restaurants by name, for the admin edit/delete UI. */
export async function GET(req: NextRequest) {
  const session = await auth();
  const user = session?.user as SessionUser | null;
  if (!hasRole(user, "MODERATOR")) {
    return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  const items = await db.restaurant.findMany({
    where: q ? { searchText: { contains: normalize(q) } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      translations: true,
      city: { include: { translations: { where: { locale: "uz" } } } },
      attributes: true,
    },
  });
  return NextResponse.json({ items });
}
