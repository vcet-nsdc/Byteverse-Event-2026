# 15 — Rounds and Challenges

**Purpose:** Document round types, problem structure, and progression  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `prisma/schema.prisma`, `prisma/seed.ts`, `scripts/seed-round*`

---

## Round Types

| Seq | Type | Seeded Name | Duration | Format |
|-----|------|-------------|----------|--------|
| 1 | CODE_LOGIC | Logical Thinking | 20 min | MCQ (options + correctOption fields) |
| 2 | AI_REPAIR | AI Code Optimization | 25 min | Coding (starterCodes with naive AI-generated code) |
| 3 | TRADITIONAL | Debugging & Code Analysis | 35 min | Coding (standard DSA problems) |
| 4 | TYPE_TRANSFORM | Data Structures & Algorithms | 45 min | Coding (multi-language translation) |
| 5 | HUMAN_VS_MACHINE | AI vs Human | 35 min | Coding (grand finale) |

## Problem Structure

Each problem has:
- `set`: "A" (leader) or "B" (member) — determines which team member sees it
- `options`: JSON with MCQ choices per language: `{ "c": { "A": "...", "B": "..." } }`
- `correctOption`: String "A"/"B"/"C"/"D" for MCQ auto-scoring
- `starterCodes`: JSON with starter code per language: `{ "c": "...", "cpp": "..." }`
- `testCases`: Array of { input, expected, isHidden, score }

## Problem Sets

Problems are divided into Set A and Set B:
- **Leaders** (isLeader=true) get Set A problems
- **Members** (isLeader=false) get Set B problems
- Fallback: If set is empty, all problems in the round are shown

## Round Configuration

From the Round model:
- `durationMin`: Timer length in minutes
- `maxScore`: Maximum possible score (default: 100)
- `aiExplainPenalty`: Score cap when EXPLAIN used (default: 75)
- `aiCodePenalty`: Score cap when CODE used (default: 50)

## Round Progression

Rounds are sequential (sequence 1→5). The UI shows the next round after the current one ends. There is no automatic advancement — admin must start each round manually.

## MCQ Scoring (Round 1)

- Each correct answer = 10 points
- Answers can be changed (updates existing submission)
- Total round score = sum of all MCQ finalScores
- No partial credit

## Coding Problems (Rounds 2-5)

- Starter code loaded from `problem.starterCodes[language]`
- Run limit: 10 runs per user per problem
- Submission via Judge0 with test case evaluation
- Languages: C, C++, Java, Python

- **Round 1:** 20 MCQ logic tracing questions (seeded via `scripts/seed-round1-questions.ts`)
- **Round 2:** 8 AI code optimization challenges (seeded via `scripts/seed-round2-questions.ts`)
- **Round 3:** 4 Debugging & Code Analysis challenges with Set A & Set B 50-pt problems (seeded via `scripts/seed-round3-questions.ts`)
- **Round 4:** 6 Data Structures & Algorithms challenges (Choose 1 of 3 for 100 Pts: Custom Sorting, Sliding Window, Monotonic Stack) (seeded via `scripts/seed-round4-questions.ts`)
- **Round 5:** Problems need to be seeded/created via admin interface / seed scripts
