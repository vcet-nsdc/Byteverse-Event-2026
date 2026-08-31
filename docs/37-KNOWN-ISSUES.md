# 37 — Known Issues
**Purpose:** Document known bugs, TODOs, and incomplete features  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Codebase inspection
---
## High Priority
| Issue | Location | Details |
|-------|----------|---------|
| Empty hook files | `src/hooks/use-*.ts` | `use-round-timer.ts`, `use-submission.ts`, `use-leaderboard.ts` are empty (0 bytes) |
| In-memory compile counter | `submissions/run/route.ts` | Resets on server restart; should use Redis |
| SSE stream may not exist | Round workspace page | Frontend connects to `/api/rounds/{id}/stream` but handler may not exist |
| Middleware role check | `src/middleware.ts` | Only checks cookie existence, not admin role |
## Medium Priority
| Issue | Location | Details |
|-------|----------|---------|
| Hardcoded proctor PINs | `audit/violation/route.ts` | `123456`, `2026`, `admin2026` in source code |
| No submission result polling | `submissions/route.ts` | Async submit returns token but no polling mechanism |
| OAuth providers not wired | `src/lib/auth.ts` | Only Credentials provider active; Google/GitHub env vars exist |
| No pagination on admin lists | Admin API routes | All entities fetched without limits |
## Low Priority
| Issue | Location | Details |
|-------|----------|---------|
| Event ID mismatch | `.env` vs `seed.ts` | `.env` has `byteverse-2025`, seed has `byteverse-2026` |
| Core binary in repo | `core` file (9.8MB) | Large binary file in repository root |
| Git commit script | `git_commits.py` | Python script in root — may be development artifact |
