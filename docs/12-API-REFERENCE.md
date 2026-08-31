# 12 — API Reference

**Purpose:** Document every backend endpoint  
**Audience:** All Developers / AI Agents  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/app/api/` directory

---

## Authentication

### `POST /api/auth/callback/credentials`
- **Purpose:** Login via email/password
- **Auth:** None
- **Body:** `{ email, password }`
- **Response:** Set-Cookie with session token
- **Source:** Handled by NextAuth

### `POST /api/auth/register`
- **Purpose:** Register new user
- **Auth:** None
- **Body:** `{ email, password, name }`
- **Source:** `src/app/api/auth/register/route.ts`

---

## Teams

### `POST /api/teams`
- **Purpose:** Create a new team (and optionally register the captain)
- **Auth:** Optional (creates user if not logged in)
- **Body:** `{ name, eventId?, leaderFirstName?, leaderLastName?, leaderEmail? }`
- **Response:** `{ teamId, inviteCode, status, autoAuth? }`
- **Status Codes:** 201, 400, 403, 409, 422
- **Source:** `src/app/api/teams/route.ts`

### `DELETE /api/teams`
- **Purpose:** Leave team (member) or disband team (leader)
- **Auth:** Required
- **Source:** `src/app/api/teams/route.ts`

### `POST /api/teams/join`
- **Purpose:** Join team via invite code
- **Auth:** Required
- **Body:** `{ inviteCode }`
- **Source:** `src/app/api/teams/join/route.ts`

---

## Rounds

### `GET /api/rounds/current`
- **Purpose:** List all rounds for round navigation
- **Auth:** Required
- **Response:** `{ rounds: RoundInfo[] }`
- **Source:** `src/app/api/rounds/current/route.ts`

### `GET /api/rounds/[roundId]/state`
- **Purpose:** Get current round phase, timer, team info
- **Auth:** Required
- **Response:** `{ phase, timeLeftSeconds, round, team }`
- **Phases:** `GATE_TEAM`, `WAITING`, `ACTIVE`, `PAUSED`, `ENDED`, `LOCKED`, `DISQUALIFIED`
- **Source:** `src/app/api/rounds/[roundId]/state/route.ts`

### `GET /api/rounds/[roundId]/problem`
- **Purpose:** Get problems for a round (filtered by Set A/B based on leader status)
- **Auth:** Required
- **Response:** `{ isLeader, targetSet, problems[], answers }`
- **Source:** `src/app/api/rounds/[roundId]/problem/route.ts`

---

## Submissions

### `POST /api/submissions/run`
- **Purpose:** Run code with custom input (synchronous, returns output immediately)
- **Auth:** Required
- **Body:** `{ problemId, roundId, language, sourceCode, customInput? }`
- **Validation:** Zod — language must be cpp/c/java/python, sourceCode max 65536 chars
- **Rate Limit:** 10 runs per user per problem (in-memory tracker)
- **Response:** `{ stdout, stderr, compile_output, time, memory, status, runsUsed, runsLeft }`
- **Source:** `src/app/api/submissions/run/route.ts`

### `POST /api/submissions`
- **Purpose:** Submit code for judging (asynchronous)
- **Auth:** Required
- **Body:** `{ problemId, roundId, language, sourceCode, idempotencyKey }`
- **Idempotency:** Duplicate `idempotencyKey` returns cached result
- **Response:** `{ submissionId, status: "QUEUED" }`
- **Source:** `src/app/api/submissions/route.ts`

### `GET /api/submissions/[id]`
- **Purpose:** Get submission result
- **Auth:** Required
- **Source:** `src/app/api/submissions/[id]/route.ts`

---

## MCQ

### `POST /api/mcq/submit`
- **Purpose:** Submit MCQ answer (auto-scored: 10 points if correct)
- **Auth:** Required
- **Body:** `{ problemId, roundId, selectedOption: "A"|"B"|"C"|"D" }`
- **Logic:** Creates/updates submission, recalculates round score sum
- **Response:** `{ success, saved, message }`
- **Source:** `src/app/api/mcq/submit/route.ts`

---

## AI Assistant

### `POST /api/ai`
- **Purpose:** Send message to AI (Socratic tutor)
- **Auth:** Required
- **Body:** `{ roundId, type: "EXPLAIN"|"CODE", message }`
- **Side Effects:** Applies AI penalty to score cap, records usage in DB
- **Limits:** 15 EXPLAIN / 25 CODE prompts per user across entire tournament
- **Response:** `{ response, newScoreCap, explainLeft, codeLeft }`
- **Source:** `src/app/api/ai/route.ts`

### `GET /api/ai`
- **Purpose:** Get current AI usage counters
- **Auth:** Required
- **Response:** `{ explainUsed, codeUsed, explainLeft, codeLeft }`
- **Source:** `src/app/api/ai/route.ts`

---

## Audit / Anti-Cheat

### `POST /api/audit/violation`
- **Purpose:** Log anti-cheat violation
- **Auth:** Required
- **Body:** `{ roundId?, reason?, count? }`
- **Side Effects:** Creates AuditLog entry, publishes to Redis admin alerts
- **Source:** `src/app/api/audit/violation/route.ts`

### `PUT /api/audit/violation`
- **Purpose:** Verify proctor PIN to unlock workstation
- **Auth:** None (but requires valid PIN)
- **Body:** `{ pin }`
- **Valid PINs:** `ADMIN_PIN` env var, `"123456"`, `"2026"`, `"admin2026"`
- **Response:** `{ success, message }`
- **Source:** `src/app/api/audit/violation/route.ts`

---

## Leaderboard

### `GET /api/leaderboard`
- **Purpose:** Redirect to individual leaderboard
- **Auth:** None
- **Source:** `src/app/api/leaderboard/route.ts`

---

## Admin API

### Rounds Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/rounds` | GET | List all rounds |
| `/api/admin/rounds` | POST | Create round |
| `/api/admin/rounds/[id]` | GET | Get round details |
| `/api/admin/rounds/[id]` | PUT | Update round |
| `/api/admin/rounds/[id]` | DELETE | Delete round |
| `/api/admin/rounds/[id]/status` | PUT | Start/pause/end round |

### Other Admin Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/problems` | GET, POST | List/create problems |
| `/api/admin/teams` | GET | List all teams |
| `/api/admin/participants` | GET | List all participants |
| `/api/admin/events` | GET, PUT | Manage event |
| `/api/admin/announcements` | GET, POST | Manage announcements |
| `/api/admin/ai` | GET | AI key pool telemetry |
| `/api/admin/stats` | GET | Dashboard statistics |

---

## Health

### `GET /api/health`
- **Purpose:** Application health check
- **Auth:** None
- **Source:** `src/app/api/health/route.ts`
