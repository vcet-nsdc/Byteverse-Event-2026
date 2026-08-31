# 26 — Error Handling
**Purpose:** Document error patterns across the application  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Backend Error Pattern
```typescript
try {
  // business logic
} catch (err: unknown) {
  const errMsg = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ error: errMsg }, { status: 500 });
}
```
## Standard Error Responses
| Status | Meaning | Used For |
|--------|---------|----------|
| 400 | Bad Request | Invalid JSON, missing fields |
| 401 | Unauthorized | No session token |
| 403 | Forbidden | Wrong role, round not active |
| 404 | Not Found | Problem/Round/Team not found |
| 409 | Conflict | Duplicate team name, already member |
| 422 | Unprocessable | Zod validation failure |
| 429 | Too Many Requests | AI/compile rate limit exceeded |
| 503 | Service Unavailable | Judge0 unreachable |
## Custom Auth Errors
- `DatabaseOfflineError` (code: DATABASE_OFFLINE)
- `InvalidCredentialsError` (code: INVALID_CREDENTIALS)
## Frontend Error Handling
Most API calls use try/catch with inline error state:
```typescript
try {
  const res = await fetch("/api/endpoint", { ... });
  const data = await res.json();
  // handle success
} catch {
  // silently ignore or show fallback
}
```
Many catch blocks are empty (`catch { /* ignore */ }`) for non-critical operations.
## AI Error Handling
- Rate limit → returns 429 with remaining usage counts
- Prompt injection → throws with user-friendly message
- All keys exhausted → returns last error
## Judge0 Error Handling
- Connection failure → returns 503 with connection error details
- Timeout (12s) → returns SYSTEM_ERROR status
