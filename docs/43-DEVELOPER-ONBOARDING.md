# 43 — Developer Onboarding
**Purpose:** Structured onboarding paths for new developers  
**Audience:** New Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## First 30 Minutes
- [ ] Read `docs/00-START-HERE.md` (this doc)
- [ ] Read `docs/01-PROJECT-OVERVIEW.md`
- [ ] Skim `docs/04-REPOSITORY-STRUCTURE.md`
- [ ] Clone repo, run `npm install`
- [ ] Copy `.env.example` to `.env`
## First 2 Hours
- [ ] Start Docker: `docker compose up -d postgres redis`
- [ ] Run: `npm run db:generate && npm run db:push && npm run db:seed`
- [ ] Start dev server: `npm run dev`
- [ ] Login as admin (admin@byteverse.dev / admin2026)
- [ ] Explore admin dashboard at /admin
- [ ] Open Prisma Studio: `npm run db:studio`
- [ ] Read `docs/03-ARCHITECTURE.md`
- [ ] Read `docs/10-DATABASE.md`
## First Day
- [ ] Read `docs/08-FRONTEND-ARCHITECTURE.md`
- [ ] Read `docs/09-BACKEND-ARCHITECTURE.md`
- [ ] Read `docs/12-API-REFERENCE.md`
- [ ] Trace a full MCQ submission flow (frontend → API → DB)
- [ ] Trace the AI assistance flow
- [ ] Understand the anti-cheat system
## First Contribution
**Suggested safe first task:** Add a health check that includes database connectivity status.
1. Modify `src/app/api/health/route.ts`
2. Add Prisma connectivity check
3. Return `{ status: "ok", database: "connected" }`
4. Test manually via curl
## Checklist
- [ ] Can run the dev server
- [ ] Can login as admin
- [ ] Understand the 5 round types
- [ ] Know where API routes live
- [ ] Know where scoring logic lives
- [ ] Understand AI penalty system
- [ ] Reviewed anti-cheat mechanism
