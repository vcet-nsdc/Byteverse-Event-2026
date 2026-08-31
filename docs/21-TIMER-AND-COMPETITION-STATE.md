# 21 — Timer and Competition State
**Purpose:** Document timers and state synchronization  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Server-Side State
Round status (DRAFT/SCHEDULED/ACTIVE/PAUSED/ENDED) stored in `rounds` table. When admin starts a round:
- `startsAt` = current timestamp
- `endsAt` = startsAt + durationMin minutes
- `status` = ACTIVE
## Client-Side Timer
- `timeLeftSeconds` sent by server in `/api/rounds/{id}/state`
- Client `setInterval(1000)` decrements locally
- Re-synced every 6 seconds via polling
- Timer turns red when < 300 seconds (5 minutes)
## Auto-End Detection
In state API: if `round.status === "ACTIVE" && now >= round.endsAt`, auto-updates status to ENDED.
## Break Timer
Client-only 5-minute countdown (300 seconds) shown after round ends. Not server-controlled.
## Source of Truth
**Server** is authoritative for competition state. Client timers are display-only approximations. The 6-second polling ensures drift stays under 6 seconds.
## State Transitions
| Action | Transition | Who |
|--------|-----------|-----|
| Create round | → DRAFT | Seed/Admin |
| Schedule round | DRAFT → SCHEDULED | Admin |
| Start round | SCHEDULED/DRAFT → ACTIVE | Admin |
| Pause round | ACTIVE → PAUSED | Admin |
| Resume round | PAUSED → ACTIVE | Admin |
| End round | ACTIVE → ENDED | Admin/Auto (timer) |
## Files
- `src/app/api/rounds/[roundId]/state/route.ts` — State API with auto-end
- `src/app/api/admin/rounds/[id]/status/route.ts` — Admin status control
- `src/app/(participant)/rounds/[roundId]/page.tsx` — Client timer logic
