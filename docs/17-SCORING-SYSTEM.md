# 17 — Scoring System

**Purpose:** Document exact scoring algorithms and formulas  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/lib/scoring.ts`, `src/app/api/mcq/submit/route.ts`  
**Visibility:** INTERNAL (contains scoring formulas)

---

## Individual Scoring

### Formula

```
finalScore = min(rawScore, aiScoreCap)
```

- `rawScore`: Points earned from correct submissions
- `aiScoreCap`: Maximum allowed score (starts at 100, reduced by AI usage)
- `finalScore`: Actual score recorded

### AI Penalty System

Using AI assistance permanently reduces your score cap for that round:

| AI Type | Penalty (Default) | Effect |
|---------|-------------------|--------|
| EXPLAIN | `aiExplainPenalty = 75` | Score capped at 75% of max |
| CODE | `aiCodePenalty = 50` | Score capped at 50% of max |

The cap takes the **minimum** of the current cap and the penalty:

```typescript
// From src/lib/scoring.ts:applyAIPenalty()
const newCap = Math.min(currentCap, penaltyCap);
const newFinal = Math.min(currentRaw, newCap);
```

**Example:** If a participant scores 90 raw but used EXPLAIN:
- `aiScoreCap` drops to 75
- `finalScore = min(90, 75) = 75`

If they then also use CODE:
- `aiScoreCap = min(75, 50) = 50`
- `finalScore = min(90, 50) = 50`

### MCQ Scoring (Round 1)

- Each correct MCQ = **10 points**
- Each incorrect MCQ = **0 points** (no negative marking)
- Total round score = sum of all MCQ finalScores
- Implementation: `src/app/api/mcq/submit/route.ts`

## Team Scoring

### Formula

```
teamAvgScore = (member1FinalScore + member2FinalScore) / 2
```

### Missing Member Policies

| Policy | Behavior |
|--------|----------|
| `TREAT_AS_ZERO` (default) | Missing member counts as 0 |
| `MARK_INCOMPLETE` | Team score = 0 if either member missing |
| `TEAM_INELIGIBLE` | Same as MARK_INCOMPLETE |
| `REQUIRE_BOTH` | Both must have scores for team to score |

### Team Score Update Flow

1. Individual submits → `updateRoundScore()` saves to `round_scores`
2. `calculateTeamScore()` called → queries both members' scores
3. Leader = member1, non-leader = member2
4. Average calculated per policy
5. Upserted to `team_scores` table
6. Redis cache invalidated (`lb:team:{eventId}`, `lb:individual:{eventId}`)
7. Score change published to Redis `leaderboard` channel

## Score Persistence

| Table | What It Stores |
|-------|---------------|
| `submissions` | Per-submission rawScore, finalScore, aiScoreCap |
| `round_scores` | Per-user-per-round aggregated score |
| `team_scores` | Per-team-per-round averaged score |

## Implementation Files

| File | Functions |
|------|-----------|
| `src/lib/scoring.ts` | `updateRoundScore()`, `applyAIPenalty()`, `calculateTeamScore()` |
| `src/app/api/mcq/submit/route.ts` | MCQ auto-scoring + round score recalculation |
| `src/app/api/ai/route.ts` | AI penalty application after each AI call |
