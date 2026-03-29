import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) return null;

        // Rate limit login: maks 10 percobaan per 15 menit per username
        const key = `login:${credentials.username.toLowerCase()}`;
        if (!rateLimit(key, 10, 15 * 60_000)) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi dalam 15 menit.");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role,
          avatarId: user.avatarId,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = (user as any).id;
        token.username = (user as any).username;
        token.role     = (user as any).role;
        token.avatarId = (user as any).avatarId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role     = token.role;

        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { avatarId: true, name: true },
        });
        (session.user as any).avatarId = fresh?.avatarId ?? token.avatarId;
        session.user.name = fresh?.name ?? session.user.name;
      }
      return session;
    },
  },
};
