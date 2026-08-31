# 38 — Technical Debt
**Purpose:** Identify architectural and implementation debt  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Codebase inspection
---
## Architecture Debt
| Debt | Impact | Files |
|------|--------|-------|
| Monolithic round workspace | 1165-line component, hard to maintain | `rounds/[roundId]/page.tsx` |
| Duplicated Judge0 config | JUDGE_BASE/LANG_IDS defined in both judge.ts and run/route.ts | Both files |
| No API client abstraction | Raw fetch() in every component | All frontend components |
| Empty custom hooks | No code reuse for timer/submission/leaderboard | `src/hooks/` |
## Implementation Debt
| Debt | Impact | Fix |
|------|--------|-----|
| In-memory state (compile tracker) | Lost on restart | Move to Redis |
| Client-authoritative break timer | 5-min break is client-only | Server-manage break |
| No test coverage | Can't verify correctness | Add Jest + Playwright tests |
| Hardcoded PIN values | Security concern | Environment variable only |
| No migration history | Using db:push instead of migrations | Switch to migrate:dev |
## Tight Coupling
| Area | Issue |
|------|-------|
| Scoring + AI | applyAIPenalty directly called from AI route |
| Scoring + Redis | Score updates always invalidate cache |
| AntiCheatShield | 465-line component mixing UI, events, and network calls |
