# 35 — How to Add a Challenge
**Purpose:** Guide for adding competition problems  
**Audience:** All Developers / Organizers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `scripts/seed-round*`, `prisma/schema.prisma`
---
## MCQ Problem (Round 1 Style)
1. Create a seed script or use admin API
2. Required fields:
   - `title`: Question title
   - `statement`: Question text (the code to trace)
   - `set`: "A" or "B"
   - `options`: `{ "c": { "A": "output1", "B": "output2", ... } }`
   - `correctOption`: "A", "B", "C", or "D"
   - `starterCodes`: Code snippet per language for display
   - `isPublished`: true
3. Reference: `scripts/seed-round1-questions.ts`
## Coding Problem (Rounds 2-5)
1. Required fields:
   - `title`, `statement`: Problem description
   - `set`: "A" or "B"
   - `starterCodes`: `{ "c": "starter_code", "cpp": "...", ... }`
   - `sampleInput`, `sampleOutput`: Examples
   - `timeLimitMs`, `memoryLimitMb`: Execution limits
   - `isPublished`: true
2. Add test cases:
   - `input`, `expected`: Test data
   - `isHidden`: true for hidden tests
   - `score`: Points per test case
3. Reference: `scripts/seed-round2-questions.ts`
## Where Challenges Are Stored
- Database: `problems` table
- Seed scripts: `scripts/seed-round{N}-questions.ts`
- Currently **hardcoded in seed scripts** — no admin UI for problem creation at this time
## Admin API Alternative
`POST /api/admin/problems` can create problems programmatically if the admin UI is implemented.
