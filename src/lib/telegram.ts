/** Fire-and-forget notification to a user's Telegram chat (their telegramId doubles as chat id for DMs). */
export async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {
    // Best-effort notification — never block the caller's main flow on Telegram being down.
  }
}
