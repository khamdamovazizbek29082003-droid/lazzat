import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/telegram/poll?token=… — the site polls this while the t.me tab is open. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const row = await db.telegramLoginToken.findUnique({ where: { token } });
  if (!row || row.expiresAt < new Date()) return NextResponse.json({ status: "expired" });

  return NextResponse.json({ status: row.status === "CONFIRMED" ? "confirmed" : "pending" });
}
