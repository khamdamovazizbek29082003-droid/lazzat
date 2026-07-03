import { db } from "./db";
import type { Role } from "@prisma/client";

export type SessionUser = { id: string; role: Role };

const ROLE_RANK: Record<Role, number> = { USER: 0, OWNER: 1, MODERATOR: 2, ADMIN: 3 };

export function requireRole(user: SessionUser | null, min: Role): asserts user is SessionUser {
  if (!user || ROLE_RANK[user.role] < ROLE_RANK[min]) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
}

/** If-narrowable variant of requireRole for route handlers (avoids TS narrowing pitfalls with try/catch). */
export function hasRole(user: SessionUser | null, min: Role): user is SessionUser {
  return !!user && ROLE_RANK[user.role] >= ROLE_RANK[min];
}

/** Owner scope is per-restaurant via an APPROVED claim; moderators+ bypass. */
export async function requireRestaurantOwner(user: SessionUser | null, restaurantId: string) {
  if (!user) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  if (ROLE_RANK[user.role] >= ROLE_RANK.MODERATOR) return;
  const claim = await db.ownerClaim.findFirst({
    where: { restaurantId, userId: user.id, status: "APPROVED" },
    select: { id: true },
  });
  if (!claim) throw Object.assign(new Error("Forbidden"), { status: 403 });
}
