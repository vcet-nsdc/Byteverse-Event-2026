# 31 — Development Guidelines
**Purpose:** Project-specific development guidelines  
**Audience:** All Developers / AI Agents  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository conventions
---
## Where New Code Goes
| What | Location |
|------|----------|
| New API endpoint | `src/app/api/{domain}/route.ts` |
| New page | `src/app/({group})/{path}/page.tsx` |
| Business logic | `src/lib/{module}.ts` |
| Shared types | `src/types/index.ts` |
| React components | `src/components/{domain}/{Name}.tsx` |
| UI primitives | `src/components/ui/{Name}.tsx` |
| Custom hooks | `src/hooks/use-{name}.ts` |
| Database changes | `prisma/schema.prisma` → `npm run db:migrate:dev` |
| Seed data | `scripts/seed-{name}.ts` |
## API Route Checklist
1. Import `auth` from `@/lib/auth`
2. Verify session: `const session = await auth()`
3. Define Zod schema for request body
4. Validate: `schema.safeParse(body)`
5. Implement business logic
6. Return `NextResponse.json()`
7. Handle errors with try/catch
## Validation Practices
- Always use Zod for input validation
- Validate at API boundary, not in business logic
- Use `.min()/.max()` for string lengths
- Use `.enum()` for known value sets
## Security Practices
- Never trust client-side data
- Always verify session in API routes
- Never expose secrets in NEXT_PUBLIC_ variables
- Use parameterized queries (Prisma handles this)
## Error Practices
- Return descriptive error messages
- Use appropriate HTTP status codes
- Log errors with `console.error()`
- Never expose stack traces to clients
