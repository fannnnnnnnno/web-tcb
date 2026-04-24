import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const key = `login:${(credentials.username as string).toLowerCase()}`;
        if (!rateLimit(key, 10, 15 * 60_000)) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          select: { id: true, name: true, username: true, role: true, avatarId: true, password: true },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return {
          id:       user.id,
          name:     user.name,
          username: user.username,
          role:     user.role,
          avatarId: user.avatarId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id        = (user as any).id;
        token.username  = (user as any).username;
        token.role      = (user as any).role;
        token.avatarId  = (user as any).avatarId;
        token.name      = user.name;
        token.fetchedAt = Date.now();
      }

      if (trigger === "update" && session) {
        if (session.avatarId !== undefined) token.avatarId = session.avatarId;
        if (session.name     !== undefined) token.name     = session.name;
        return token;
      }

      const REFRESH_INTERVAL = 5 * 60 * 1000;
      const now       = Date.now();
      const lastFetch = (token.fetchedAt as number) ?? 0;

      if (now - lastFetch > REFRESH_INTERVAL) {
        try {
          const fresh = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { avatarId: true, name: true, role: true },
          });
          if (fresh) {
            token.avatarId  = fresh.avatarId;
            token.name      = fresh.name;
            token.role      = fresh.role;
            token.fetchedAt = now;
          }
        } catch {
          // pakai data lama
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role     = token.role;
        (session.user as any).avatarId = token.avatarId;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});