# 19 — Code Execution System

**Purpose:** Document how participant code is executed  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `src/lib/judge.ts`, `src/app/api/submissions/run/route.ts`

---

## Execution Provider

**Judge0 CE v1.13.1** — an open-source online code execution system that runs submitted code in isolated Docker containers.

## Deployment Options

| Option | URL Format | Auth Header |
|--------|-----------|-------------|
| Self-hosted (LAN) | `http://192.168.x.x:2358` | `X-Auth-Token` |
| Docker Compose | `http://localhost:2358` | `X-Auth-Token` |
| RapidAPI | `https://judge0-ce.p.rapidapi.com` | `x-rapidapi-key` + `x-rapidapi-host` |

The code auto-detects RapidAPI URLs and adjusts headers accordingly.

## Supported Languages

| Language | Judge0 ID | File Extension |
|----------|-----------|----------------|
| C | 50 | .c |
| C++ | 54 | .cpp |
| Java | 62 | .java |
| Python | 71 | .py |
| JavaScript | 63 | .js (in judge.ts only, not in run route) |
| TypeScript | 74 | .ts (in judge.ts only, not in run route) |

## Execution Limits

| Parameter | Value |
|-----------|-------|
| CPU Time | 2.0 seconds |
| Memory | 256 MB (256 * 1024 KB) |
| Source Code | Max 65,536 characters |
| Custom Input | Max 32,768 characters |
| HTTP Timeout | 12 seconds (run), 10 seconds (submit) |
| Runs per Problem | 10 (per user, in-memory) |

## URL Sanitization

The base URL is sanitized to remove:
- Trailing slashes
- `/system_info` suffix
- `/about` suffix

```typescript
const JUDGE_BASE = rawBase.replace(/\/+$/, "").replace(/\/system_info$/, "").replace(/\/about$/, "");
```

## Result Status Mapping

| Judge0 Status ID | ByteVerse Status |
|-----------------|------------------|
| 1 | QUEUED |
| 2 | RUNNING |
| 3 | ACCEPTED |
| 4 | WRONG_ANSWER |
| 5 | TIME_LIMIT_EXCEEDED |
| 6 | COMPILATION_ERROR |
| 7-11, 13-14 | RUNTIME_ERROR |
| 12 | MEMORY_LIMIT_EXCEEDED |
| Other | SYSTEM_ERROR |

## Security Boundaries

- Judge0 runs in `privileged: true` Docker mode (required for Docker-in-Docker)
- Code executes in isolated containers with resource limits
- No network access from within executing code (Judge0 default)
- Source code is not base64-encoded (`base64_encoded=false`)

## Implementation Files

| File | Purpose |
|------|---------|
| `src/lib/judge.ts` | `submitToJudge()`, `getJudgeResult()`, `mapJudgeStatus()` |
| `src/app/api/submissions/run/route.ts` | Synchronous run endpoint |
| `src/app/api/submissions/route.ts` | Asynchronous submit endpoint |
