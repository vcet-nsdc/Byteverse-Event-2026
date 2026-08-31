# 22 — Team and Participant System
**Purpose:** Document team creation, membership, and participant management  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/app/api/teams/route.ts`, `prisma/schema.prisma`
---
## Team Creation Flow
1. Captain fills registration form on landing page
2. `POST /api/teams` with team name + captain details
3. If not logged in: user auto-created with random password
4. Team created in serializable transaction
5. Returns `inviteCode` for second member
## Team Join Flow
1. Second member receives invite code
2. `POST /api/teams/join` with `inviteCode`
3. Added as non-leader TeamMember
4. Team status changes to ACTIVE (if 2 members)
## Team Constraints
- One user per team (`TeamMember.userId` is unique)
- Team name must be unique
- Max 2 members (leader + member)
- Cannot join if already in active team
- Cannot create team if registration closed
## Team Statuses
| Status | Meaning |
|--------|---------|
| PENDING | Created, waiting for second member |
| ACTIVE | Both members joined |
| LOCKED | Anti-cheat lock (isLocked flag) |
| DISQUALIFIED | Removed from competition |
## Problem Set Assignment
- `isLeader = true` → Set A problems
- `isLeader = false` → Set B problems
## Score Ownership
- Submissions owned by individual users
- RoundScores per user per round
- TeamScores aggregate both members' scores
## Leaving/Disbanding
- Non-leader: `DELETE /api/teams` removes their TeamMember
- Leader: `DELETE /api/teams` deletes entire team (cascade deletes members)
## Files
- `src/app/api/teams/route.ts` — Team CRUD
- `src/app/api/teams/join/route.ts` — Join via invite code
- `src/app/page.tsx` — Registration form
- `src/app/(participant)/team/page.tsx` — Team management page
