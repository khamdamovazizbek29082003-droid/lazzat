import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number };
    from: { id: number; first_name: string; username?: string };
  };
};

/**
 * POST /api/telegram/webhook — Telegram pushes bot updates here.
 * Verified via the secret_token set on setWebhook (not a user-facing secret).
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const update = (await req.json()) as TelegramUpdate;
  const message = update.message;
  const text = message?.text ?? "";

  if (message && text.startsWith("/start")) {
    const token = text.slice("/start".length).trim();
    const row = token ? await db.telegramLoginToken.findUnique({ where: { token } }) : null;

    if (row && row.status === "PENDING" && row.expiresAt > new Date()) {
      await db.telegramLoginToken.update({
        where: { token },
        data: {
          status: "CONFIRMED",
          telegramId: String(message.from.id),
          firstName: message.from.first_name,
          username: message.from.username ?? null,
        },
      });
      await sendTelegramMessage(message.chat.id, "✅ Siz Lazzat saytiga kirdingiz — saytga qaytishingiz mumkin.");
    } else {
      await sendTelegramMessage(message.chat.id, "Havola eskirgan. Saytda qaytadan urinib ko'ring.");
    }
  }

  return NextResponse.json({ ok: true });
}
