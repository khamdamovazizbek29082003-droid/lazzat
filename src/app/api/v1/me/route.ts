import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/** GET /api/v1/me — the current user's onboarding state (for the customer/owner prompt). */
export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, name: true, role: true, onboarded: true },
  });
  return NextResponse.json({ user });
}

const Body = z.object({ accountType: z.enum(["CUSTOMER", "OWNER"]) });

/**
 * PATCH /api/v1/me — records the onboarding choice. "OWNER" sets role: OWNER (unlocks
 * adding places on the map); "CUSTOMER" leaves role at USER. Either way, onboarded flips
 * true so the prompt doesn't show again. Users can switch later (e.g. a customer who
 * decides to list their own place) by calling this again.
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const current = await db.user.findUniqueOrThrow({ where: { id: userId }, select: { role: true } });
  // Never touch MODERATOR/ADMIN — this toggle only moves between USER and OWNER.
  let nextRole = current.role;
  if (current.role === "USER" || current.role === "OWNER") {
    nextRole = parsed.data.accountType === "OWNER" ? "OWNER" : "USER";
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { role: nextRole, onboarded: true },
    select: { id: true, name: true, role: true, onboarded: true },
  });
  return NextResponse.json({ user });
}
