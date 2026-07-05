import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

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
      // Bot-deep-link flow: the client only ever has an opaque one-time token; the real
      // Telegram identity was already confirmed server-side by the webhook (see
      // src/app/api/telegram/webhook/route.ts) before this token is marked CONFIRMED.
      credentials: { token: { label: "token", type: "text" } },
      async authorize(creds) {
        const token = creds?.token as string | undefined;
        if (!token) return null;

        const row = await db.telegramLoginToken.findUnique({ where: { token } });
        if (!row || row.status !== "CONFIRMED" || !row.telegramId || row.expiresAt < new Date()) return null;

        const user = await db.user.upsert({
          where: { telegramId: row.telegramId },
          update: { name: row.firstName, image: row.photoUrl, lastSeenAt: new Date() },
          create: { telegramId: row.telegramId, name: row.firstName, image: row.photoUrl },
        });
        await db.telegramLoginToken.delete({ where: { token } });
        if (user.isBanned) return null;
        return { id: user.id, name: user.name };
      },
    }),
    // Email OTP via Resend: add the Resend provider once RESEND_API_KEY is set.
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { role: true } });
        token.role = dbUser?.role ?? "USER";
        token.uid = user.id;
      } else if (trigger === "update" && token.uid) {
        // Client called session.update() right after PATCH /api/v1/me changed the role —
        // re-read it so the JWT (otherwise fixed at sign-in) reflects it immediately.
        const dbUser = await db.user.findUnique({ where: { id: token.uid as string }, select: { role: true } });
        if (dbUser) token.role = dbUser.role;
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
