# 42 — FAQ
**Purpose:** Developer frequently asked questions  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Where are challenges stored?
In the `problems` database table. Seeded via `scripts/seed-round1-questions.ts` (MCQ) and `scripts/seed-round2-questions.ts` (coding).
## How does code execution work?
`POST /api/submissions/run` sends code to Judge0 CE (`JUDGE0_URL` in .env) with `wait=true` for synchronous execution. Judge0 runs code in isolated Docker containers.
## Where is scoring calculated?
`src/lib/scoring.ts` — three functions: `updateRoundScore()`, `applyAIPenalty()`, `calculateTeamScore()`.
## How is AI usage tracked?
Every AI call logs to the `ai_usages` table with userId, roundId, type, prompt, response, tokensUsed. Lifetime counts queried via `getLifetimeUsage()`.
## How do timers work?
Server sets `startsAt`/`endsAt` when admin starts a round. Client polls `/api/rounds/{id}/state` every 6s for `timeLeftSeconds` and counts down locally.
## How do I create an admin?
Run `npm run db:seed` — creates admin@byteverse.dev with password admin2026 and role SUPER_ADMIN.
## Where are environment variables defined?
In `.env` at repository root. See `docs/07-ENVIRONMENT-VARIABLES.md` for complete reference.
## How do I reset competition data?
`npm run db:clean` removes test data. For full reset: drop database → `npm run db:push` → `npm run db:seed`.
## How do I add a new API?
Create `src/app/api/{path}/route.ts` exporting async `GET`/`POST`/etc. functions. See `docs/34-HOW-TO-ADD-A-FEATURE.md`.
## Where is authentication implemented?
`src/lib/auth.ts` (NextAuth config), `src/middleware.ts` (admin guard), `src/lib/rbac.ts` (role hierarchy).
