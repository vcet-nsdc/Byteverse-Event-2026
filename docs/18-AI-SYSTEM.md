# 18 — AI System

**Purpose:** Document all AI-related features and architecture  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/lib/ai-gateway.ts`, `src/app/api/ai/route.ts`  
**Visibility:** INTERNAL

---

## Architecture

- **Provider:** Groq (OpenAI-compatible API at `https://api.groq.com/openai/v1`)
- **SDK:** OpenAI Node SDK pointed at Groq's base URL
- **Model:** `qwen/qwen3.8-27b` (configurable via `AI_MODEL` env var)
- **Max Tokens:** 350 (configurable via `AI_MAX_TOKENS`)
- **Temperature:** 0.2 (low randomness for consistent Socratic responses)

## Multi-Key Pool Architecture

- Parses up to **15 comma-separated Groq API keys** from `AI_API_KEYS`
- **Round-robin rotation** — cursor advances after each successful call
- **Per-key telemetry:** requests, tokens, latency, status, errors
- **429 detection:** If rate limited, key enters 60-second cooldown
- **Auto-failover:** Automatically switches to next healthy key
- **Max attempts:** min(poolSize, 3) per AI call

## Lifetime Tournament Limits

| Type | Limit | Description |
|------|-------|-------------|
| EXPLAIN | 15 prompts | Chat/conceptual guidance |
| CODE | 25 prompts | Syntax/pattern advice |

Limits are per-user across the **entire tournament** (all rounds combined).

## Socratic System Prompts

Two base personas:

### Navigator (EXPLAIN)
> Guides conceptually through Socratic dialogue. Never computes outputs or reveals MCQ answers. Asks guiding questions. Max 160 words.

### Forge (CODE)
> Assists with syntax and patterns. Never writes full functions. At most 1 short syntax hint line. Max 160 words.

## Round-Specific Guidelines

Each round type appends strict rules to the system prompt:

| Round | Key Rule |
|-------|----------|
| CODE_LOGIC | Never compute outputs, never reveal correct option |
| AI_REPAIR | Never write optimized code or fixes |
| TRADITIONAL | Never write algorithms or data structures |
| TYPE_TRANSFORM | Never translate code between languages |
| HUMAN_VS_MACHINE | Never provide code solutions or steps |

## Input Sanitization (Anti-Injection)

Blocked patterns in user prompts:
- `ignore previous/prior/above/system`
- `pretend you are`
- `roleplay`, `bypass`, `jailbreak`, `DAN`

Prompts truncated to 1000 characters.

## Output Sanitization

- Code blocks with > 2 lines are replaced with tournament rule notice
- Response text trimmed

## AI Call Flow

```
User sends message
→ Check lifetime limits (15 EXPLAIN / 25 CODE)
→ Fetch Round details for round-specific prompt
→ Sanitize input against injection patterns
→ Select healthy key from pool (round-robin)
→ Call Groq API with full system prompt
→ Update key telemetry (tokens, latency, status)
→ Sanitize response (strip long code blocks)
→ Record usage in ai_usages table
→ Apply AI penalty to score cap
→ Return response + updated usage counters
```

## Telemetry Dashboard

`GET /api/admin/ai` returns:
- Total keys, healthy/cooldown/error counts
- Per-key: masked key, requests, tokens, latency, status, last error
- Database totals: all-time tokens consumed, all-time prompts count

## Failure Behavior

| Failure | Behavior |
|---------|----------|
| All keys rate-limited | Uses key with earliest cooldown expiry |
| Groq API down | Returns error to user; usage NOT counted |
| Prompt injection detected | Throws error; usage NOT counted |
| Lifetime limit reached | Returns specific limit message |

## Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/ai-gateway.ts` | Core: multi-key pool, prompts, telemetry, callAI() |
| `src/app/api/ai/route.ts` | API endpoint: validation, penalty, response |
| `src/components/participant/AIAssistantDrawer.tsx` | Frontend: chat UI, EXPLAIN/CODE tabs |
