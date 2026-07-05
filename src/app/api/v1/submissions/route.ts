import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { findLikelyDuplicates } from "@/lib/geo";
import { hasRole, type SessionUser } from "@/lib/policies";

/**
 * POST /api/v1/submissions
 * A signed-in user found a café/restaurant "on their way": they drop a pin,
 * enter the name, category and the owner's phone number. The submission lands
 * in the admin verification queue; a moderator calls the owner to verify
 * before it becomes a live Restaurant.
 */
const Body = z.object({
  name: z.string().min(2).max(120),
  type: z.enum([
    "RESTAURANT", "CAFE", "FAST_FOOD", "BAKERY", "COFFEE_SHOP", "TEA_HOUSE",
    "STREET_FOOD", "CANTEEN", "DESSERT_SHOP", "BAR", "OTHER",
  ]).default("CAFE"),
  ownerPhone: z.string().regex(/^\+998\d{9}$/, "Owner phone must be +998XXXXXXXXX"),
  lat: z.number().min(37).max(46),   // Uzbekistan bounds
  lng: z.number().min(55).max(74),
  note: z.string().max(500).optional(),
  photoUrls: z.array(z.string().url()).max(6).optional(),
  videoUrls: z.array(z.string().url()).max(2).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | null;
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // The role in the session JWT is only set at sign-in and doesn't reflect a role change made
  // seconds ago via PATCH /api/v1/me, so re-read it from the DB rather than trusting the token.
  const user = await db.user.findUnique({ where: { id: sessionUser.id }, select: { id: true, role: true } });
  // Only self-identified restaurant owners (or staff) can add new places — regular
  // customers browse/review but don't submit listings. See the onboarding modal / POST
  // /api/v1/me for how a user becomes an OWNER.
  if (!hasRole(user, "OWNER")) {
    return NextResponse.json({ error: "Only restaurant owners can add new places." }, { status: 403 });
  }
  const userId = user.id;

  // Contribution rate limit: 5 submissions/day/user
  const dayAgo = new Date(Date.now() - 86400_000);
  const todayCount = await db.placeSubmission.count({ where: { userId, createdAt: { gte: dayAgo } } });
  if (todayCount >= 5) {
    return NextResponse.json({ error: "Daily submission limit reached." }, { status: 429 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  // Surface likely duplicates to the moderator (and softly to the user)
  const duplicates = await findLikelyDuplicates(data.lat, data.lng, data.name);

  const submission = await db.placeSubmission.create({
    data: { ...data, userId },
  });

  return NextResponse.json(
    { submission, possibleDuplicates: duplicates, message: "Sent for verification. A moderator will call the owner." },
    { status: 201 },
  );
}

/** GET /api/v1/submissions — the current user's own submissions with statuses. */
export async function GET() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.placeSubmission.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ items });
}
