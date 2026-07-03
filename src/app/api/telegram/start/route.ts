import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/** POST /api/telegram/start — creates a pending login token and the t.me deep link to open. */
export async function POST() {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60_000);
  await db.telegramLoginToken.create({ data: { token, expiresAt } });

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  return NextResponse.json({ token, deepLink: `https://t.me/${botUsername}?start=${token}` });
}
