import NextAuth, { CredentialsSignin } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
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
