import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { createHash, createHmac } from "node:crypto";
import { db } from "./db";

/**
 * Telegram Login Widget verification.
 * The widget posts { id, first_name, username, photo_url, auth_date, hash }.
 * hash = HMAC_SHA256(data_check_string, SHA256(bot_token)) — verify server-side,
 * reject stale auth_date (> 10 min). https://core.telegram.org/widgets/login
 */
function verifyTelegramPayload(data: Record<string, string>): boolean {
  const { hash, ...fields } = data;
  if (!hash || !process.env.TELEGRAM_BOT_TOKEN) return false;
  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");
  const secretKey = createHash("sha256").update(process.env.TELEGRAM_BOT_TOKEN).digest();
  const hmac = createHmac("sha256", secretKey).update(checkString).digest("hex");
  const fresh = Date.now() / 1000 - Number(fields.auth_date) < 600;
  return hmac === hash && fresh;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: {},
      async authorize(_creds, req) {
        const data = Object.fromEntries(new URL(req.url!).searchParams) as Record<string, string>;
        if (!verifyTelegramPayload(data)) return null;
        const user = await db.user.upsert({
          where: { telegramId: data.id },
          update: { name: data.first_name, avatarUrl: data.photo_url, lastSeenAt: new Date() },
          create: { telegramId: data.id, name: data.first_name, avatarUrl: data.photo_url },
        });
        if (user.isBanned) return null;
        return { id: user.id, name: user.name };
      },
    }),
    // Email OTP via Resend: add the Resend provider once RESEND_API_KEY is set.
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
        token.role = dbUser?.role ?? "USER";
        token.uid = user.id;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id = token.uid;
      (session.user as any).role = token.role;
      return session;
    },
  },
});
