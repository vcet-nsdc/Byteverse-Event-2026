# 27 — Logging and Monitoring
**Purpose:** Document logging and observability  
**Audience:** DevOps / All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Console Logging
- Prisma: `log: ["error", "warn"]` (query logging disabled)
- AI Gateway: `console.warn()` for rate limits and key failures
- Judge0: `console.error()` for execution failures
- Redis: `console.error()` for connection errors
## Structured Audit Trail
`audit_logs` table records:
- **INTEGRITY_VIOLATION:** Anti-cheat violations with full metadata
- Includes: userId, participantName, teamName, roundId, reason, violationCount, timestamp
## AI Usage Logs
`ai_usages` table records every AI interaction:
- userId, roundId, type (EXPLAIN/CODE), prompt, response (truncated), tokensUsed
## In-Memory Telemetry
AI key pool maintains per-key metrics:
- totalRequests, totalTokens, promptTokens, completionTokens
- lastUsedAt, status, cooldownUntil, lastError, lastLatencyMs
## Redis Pub/Sub Alerts
Real-time channels for admin monitoring:
- `admin:alerts:{eventId}` — violation notifications
- `leaderboard` — score changes
## Missing Observability
| What's Missing | Impact |
|---------------|--------|
| Application-level structured logging | Difficult to debug in production |
| Request/response logging | No audit trail for API calls |
| Performance metrics (p99 latencies) | Can't identify bottlenecks |
| Error tracking service (Sentry, etc.) | No automated error alerts |
| Health check monitoring | No uptime tracking |
