import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { UserRole } from "@/types";

export class DatabaseOfflineError extends CredentialsSignin {
  code = "DATABASE_OFFLINE";
}

export class InvalidCredentialsError extends CredentialsSignin {
  code = "INVALID_CREDENTIALS";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;
        try {
          const existing = await db.user.findUnique({ where: { email: user.email } });
          if (!existing) {
            await db.user.create({
              data: {
                email: user.email,
                name: user.name || "Coder",
                role: "PARTICIPANT",
              },
            });
          }
        } catch (e) {
          console.error("Google sign-in user sync error:", e);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "PARTICIPANT";
        token.id = user.id;
      }
      if (token.email && (!token.role || !token.id)) {
        try {
          const dbUser = await db.user.findUnique({ where: { email: token.email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch {
          // ignore
        }
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });
          if (!user?.passwordHash) {
            throw new InvalidCredentialsError();
          }
          const valid = await bcrypt.compare(credentials.password as string, user.passwordHash);
          if (!valid) {
            throw new InvalidCredentialsError();
          }
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (error: any) {
          if (
            error?.code === "P1001" ||
            error?.message?.includes("Can't reach database") ||
            error?.message?.includes("DatabaseNotReachable") ||
            error?.message?.includes("ECONNREFUSED") ||
            error?.name === "DriverAdapterError"
          ) {
            throw new DatabaseOfflineError();
          }
          if (error instanceof CredentialsSignin) throw error;
          throw new InvalidCredentialsError();
        }
      },
    }),
  ],
});

export { requireRole } from "./rbac";
