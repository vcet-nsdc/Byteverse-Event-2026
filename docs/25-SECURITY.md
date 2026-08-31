# 25 — Security
**Purpose:** Security review and recommendations  
**Audience:** All Developers / DevOps  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Current Protections
| Area | Protection | Implementation |
|------|-----------|---------------|
| Authentication | bcrypt password hashing (12 rounds) | `src/lib/auth.ts` |
| Session | JWT in HTTP-only cookies | NextAuth |
| Admin routes | Cookie existence check in middleware | `src/middleware.ts` |
| Input validation | Zod schemas on all API routes | Every route.ts |
| AI injection | Blocked prompt patterns | `src/lib/ai-gateway.ts` |
| AI output | Code block stripping | `src/lib/ai-gateway.ts` |
| Rate limiting | Redis-based request counting | `src/lib/rate-limit.ts` |
| Idempotency | Unique submission keys | `submissions/route.ts` |
| Anti-cheat | Client-side fullscreen/tab enforcement | `AntiCheatShield.tsx` |
| Code execution | Sandboxed Judge0 containers | Judge0 CE |
## Potential Risks
| Risk | Severity | Details |
|------|----------|---------|
| Middleware doesn't verify role | High | Admin cookie check only confirms existence, not role |
| Proctor PIN hardcoded | Medium | `123456` and `2026` in source code |
| Client-side anti-cheat | Medium | Bypassed with DevTools if accessible before lock |
| In-memory run counter | Low | Resets on server restart |
| No CSRF protection | Medium | NextAuth handles some, but custom routes may be vulnerable |
| No rate limit on auth | Medium | Login brute-force possible |
| AI keys in .env | Low | Standard practice, but .env must not be committed |
## Recommended Improvements
1. Add role verification in middleware (not just cookie existence)
2. Move proctor PIN to environment variable only
3. Add server-side violation threshold enforcement
4. Add authentication rate limiting
5. Implement CSRF tokens for sensitive operations
6. Add IP-based session binding
7. Encrypt source code at rest
