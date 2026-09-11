import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { ensureInitialized, getFallbackUserByEmail, addFallbackUser } from "./user-store";
import type { UserRole } from "@/types";

export class DatabaseOfflineError extends CredentialsSignin {
  code = "DATABASE_OFFLINE";
}

export class InvalidCredentialsError extends CredentialsSignin {
  code = "INVALID_CREDENTIALS";
}

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const isGoogleConfigured = Boolean(
  googleClientId &&
  googleClientSecret &&
  !googleClientId.includes("your-google-client-id") &&
  googleClientId.trim().length > 5
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "development-byteverse-secret-key-2026-fallback",
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
        if (!token.role) {
          const fallbackUser = getFallbackUserByEmail(token.email);
          if (fallbackUser) {
            token.id = fallbackUser.id;
            token.role = fallbackUser.role;
          }
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
    ...(isGoogleConfigured
      ? [
          Google({
            clientId: googleClientId as string,
            clientSecret: googleClientSecret as string,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      id: "google-dev",
      name: "Google Quick Sign-In",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new InvalidCredentialsError();
        }
        const email = (credentials.email as string).trim().toLowerCase();
        const name = (credentials.name as string) || email.split("@")[0] || "Coder";

        await ensureInitialized();

        let fallbackUser = getFallbackUserByEmail(email);
        if (!fallbackUser) {
          const defaultHash = await bcrypt.hash("byteverse-google-dev", 10);
          fallbackUser = addFallbackUser({
            name,
            email,
            passwordHash: defaultHash,
            college: "VCET",
            role: "PARTICIPANT",
          });
        }

        try {
          const existing = await db.user.findUnique({ where: { email } });
          if (!existing) {
            await db.user.create({
              data: {
                id: fallbackUser.id,
                email,
                name,
                role: "PARTICIPANT",
                college: "VCET",
              },
            });
          }
        } catch {
          // DB offline fallback
        }

        return {
          id: fallbackUser.id,
          email: fallbackUser.email,
          name: fallbackUser.name,
          role: fallbackUser.role,
        };
      },
    }),
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        await ensureInitialized();

        // 1. Try querying PostgreSQL if reachable
        try {
          const user = await db.user.findUnique({
            where: { email },
          });
          if (user?.passwordHash) {
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (valid) {
              return { id: user.id, email: user.email, name: user.name, role: user.role };
            }
          }
        } catch {
          // Database connection offline or failed, gracefully fall through
        }

        // 2. Resilient local fallback store (works offline without Docker)
        const fallbackUser = getFallbackUserByEmail(email);
        if (fallbackUser?.passwordHash) {
          const valid = await bcrypt.compare(password, fallbackUser.passwordHash);
          if (valid) {
            return {
              id: fallbackUser.id,
              email: fallbackUser.email,
              name: fallbackUser.name,
              role: fallbackUser.role,
            };
          }
        }

        throw new InvalidCredentialsError();
      },
    }),
  ],
});

export { requireRole } from "./rbac";
