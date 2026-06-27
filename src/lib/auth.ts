import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        // Update streak
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        let newStreak = user.streak;
        if (user.lastLoginDate === today) {
          // Already logged in today
        } else if (user.lastLoginDate === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            lastLoginDate: today,
            streak: newStreak,
            lastActiveAt: new Date(),
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { id: true, name: true, email: true, avatar: true, xp: true, coins: true, streak: true, role: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.name = dbUser.name;
          session.user.email = dbUser.email;
          session.user.image = dbUser.avatar;
          (session.user as Record<string, unknown>).xp = dbUser.xp;
          (session.user as Record<string, unknown>).coins = dbUser.coins;
          (session.user as Record<string, unknown>).streak = dbUser.streak;
          (session.user as Record<string, unknown>).role = dbUser.role;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET || "js-hero-academy-secret-key-change-in-production",
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
    } & Record<string, unknown>;
  }

  interface User {
    id: string;
  }
}