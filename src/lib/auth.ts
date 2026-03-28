import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
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

        // Selalu ambil avatarId terbaru dari DB agar avatar selalu sinkron
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
