# 24 — Realtime System
**Purpose:** Document real-time communication mechanisms  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/lib/redis.ts`, API routes
---
## Architecture
The app uses **Redis Pub/Sub** for real-time event broadcasting, with HTTP polling as fallback.
## Redis Channels
| Channel | Publisher | Purpose |
|---------|----------|---------|
| `leaderboard` | `scoring.ts` | Score update notifications |
| `submissions` | `submissions/route.ts` | New submission alerts |
| `scores:{eventId}` | `ai/route.ts` | AI penalty broadcasts |
| `admin:alerts:{eventId}` | `audit/violation/route.ts` | Violation alerts for proctors |
## Polling
- **Round state:** Every 6 seconds via `/api/rounds/{id}/state`
- **EventSource:** Attempted SSE connection to `/api/rounds/{id}/stream` (may not be fully implemented)
## Redis Client API
`src/lib/redis.ts` exposes:
- `publish(channel, message)` — fire-and-forget
- `subscribe(channel, handler)` — creates dedicated subscriber connection
- `get/set/del` — cache operations
- `incr/expire` — rate limiting
## Graceful Degradation
All Redis operations are wrapped in try/catch with empty catch blocks. If Redis is unavailable:
- Caching disabled (DB queries run every time)
- Rate limiting returns Infinity (denies by default)
- Pub/sub silently fails (no real-time updates)
- Application continues functioning
## Status: Partial Implementation
> **Needs Verification:** The SSE endpoint `/api/rounds/{id}/stream` is referenced by the frontend but may not have a corresponding route handler. The primary real-time mechanism is polling.
