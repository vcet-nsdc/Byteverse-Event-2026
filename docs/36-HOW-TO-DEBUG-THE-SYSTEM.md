# 36 — How to Debug the System
**Purpose:** Troubleshooting playbook  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Common Issues
### Frontend cannot connect to API
- **Likely Cause:** Dev server not running or wrong port
- **Files:** Check terminal for `npm run dev` output
- **Fix:** Restart dev server, check NEXTAUTH_URL in .env
### Participant cannot login
- **Likely Cause:** Database offline or wrong credentials
- **Files:** `src/lib/auth.ts`, `prisma/seed.ts`
- **Logs:** Check for DatabaseOfflineError in terminal
- **Fix:** `docker compose up -d postgres`, verify admin seeded: `npm run db:seed`
### Challenge not loading
- **Likely Cause:** Problems not seeded or `isPublished=false`
- **Files:** `src/app/api/rounds/[roundId]/problem/route.ts`
- **Fix:** Run `npm run db:seed`, check Prisma Studio for problem records
### Timer incorrect
- **Likely Cause:** `startsAt`/`endsAt` not set on round
- **Files:** `src/app/api/rounds/[roundId]/state/route.ts`
- **Fix:** Ensure admin started the round (sets startsAt/endsAt)
### Code execution fails
- **Likely Cause:** Judge0 unreachable or wrong URL
- **Files:** `src/lib/judge.ts`, `.env` (JUDGE0_URL)
- **Fix:** Verify: `curl http://JUDGE0_URL/system_info`
### AI does not respond
- **Likely Cause:** All Groq keys exhausted or invalid
- **Files:** `src/lib/ai-gateway.ts`, `.env` (AI_API_KEYS)
- **Logs:** Check for "[AI Key Pool]" warnings in terminal
### Score incorrect
- **Likely Cause:** AI penalty applied or MCQ not auto-saved
- **Files:** `src/lib/scoring.ts`
- **Check:** Query `round_scores` table for aiScoreCap value
### Admin state not reflected
- **Likely Cause:** Client polling delay (up to 6 seconds)
- **Fix:** Wait 6 seconds or manually refresh
## Debugging Tools
- **Prisma Studio:** `npm run db:studio` — browse database
- **Redis CLI:** `docker exec -it byteverse-redis-1 redis-cli`
- **Judge0 API:** `curl http://JUDGE0_URL/system_info`
- **Browser DevTools:** Network tab to inspect API calls (when not locked)
