# 11 — Authentication and Authorization

**Purpose:** Document auth flow, sessions, roles, and permissions  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/lib/auth.ts`, `src/lib/rbac.ts`, `src/middleware.ts`

---

## Authentication Stack

- **Library:** NextAuth.js v5 (beta 25)
- **Strategy:** JWT (JSON Web Tokens stored in HTTP-only cookies)
- **Provider:** Credentials (email + password with bcrypt verification)
- **Adapter:** PrismaAdapter (user data synced with `users` table)

## Login Flow

1. User enters email + password on `/login`
2. `POST /api/auth/callback/credentials` triggers NextAuth
3. `authorize()` in `src/lib/auth.ts`:
   - Finds user by email in PostgreSQL
   - Compares password hash via `bcrypt.compare()`
   - Returns `{ id, email, name, role }` on success
4. NextAuth generates JWT with `id` and `role` in callbacks
5. Cookie set: `authjs.session-token` (dev) or `__Secure-authjs.session-token` (HTTPS)

## Session Structure

```typescript
session.user = {
  id: string;      // User's cuid from database
  email: string;
  name: string;
  role: UserRole;  // "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN"
}
```

## Role Model

```
PARTICIPANT < ORGANIZER < ADMIN < SUPER_ADMIN
```

Defined in `src/lib/rbac.ts`:
```typescript
const HIERARCHY: UserRole[] = ["PARTICIPANT", "ORGANIZER", "ADMIN", "SUPER_ADMIN"];

export function requireRole(required: UserRole, actual: UserRole): boolean {
  return HIERARCHY.indexOf(actual) >= HIERARCHY.indexOf(required);
}
```

## Middleware Protection

`src/middleware.ts` protects `/admin/*` routes:
- Checks for session cookie existence (any of 4 possible cookie names)
- Redirects to `/login?callbackUrl=...` if no cookie
- Does NOT verify JWT content or role — only checks cookie exists

> [!WARNING]
> The middleware only checks cookie existence, not the role. Admin role checks happen in individual API route handlers.

## API Route Auth Pattern

```typescript
// Standard pattern in every protected API route
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Optionally check role:
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
}
```

## Registration Flow

Two paths to registration:
1. **Team creation** (`POST /api/teams`): Creates user + team in one transaction
   - Auto-generates a temporary password if user not logged in
   - Returns `autoAuth` credentials for immediate login
2. **Direct registration** (`POST /api/auth/register`): Standard signup

## Token Lifecycle

- JWT tokens are short-lived (NextAuth default: session expiry)
- No explicit token refresh mechanism
- Session persists via HTTP-only cookie
- Logout via NextAuth `signOut()` clears cookie

## Security Files

| File | Responsibility |
|------|---------------|
| `src/lib/auth.ts` | NextAuth config, providers, callbacks |
| `src/lib/rbac.ts` | Role hierarchy checking |
| `src/middleware.ts` | Admin route cookie guard |
| `src/types/next-auth.d.ts` | Session type augmentation |

## Error Handling

Custom error classes in `src/lib/auth.ts`:
- `DatabaseOfflineError` (code: `DATABASE_OFFLINE`) — Prisma connection failures
- `InvalidCredentialsError` (code: `INVALID_CREDENTIALS`) — Wrong email/password
