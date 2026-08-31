# 07 — Environment Variables

**Purpose:** Document every environment variable used by the application  
**Audience:** All Developers / DevOps  
**Last Generated:** 2026-08-31  
**Source of Truth:** `.env`, `.env.example`, codebase references

---

## Authentication

| Variable | Required | Used By | Purpose | Example |
|----------|----------|---------|---------|---------|
| `NEXTAUTH_URL` | Yes | NextAuth | Base URL for auth callbacks | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | NextAuth | JWT signing secret | `<random-32-char-hex>` |
| `GOOGLE_CLIENT_ID` | No | NextAuth | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | No | NextAuth | Google OAuth secret | `GOCSPX-xxx` |
| `GITHUB_CLIENT_ID` | No | NextAuth | GitHub OAuth client ID | `Iv1.xxx` |
| `GITHUB_CLIENT_SECRET` | No | NextAuth | GitHub OAuth secret | `xxx` |
| `ADMIN_EMAIL` | No | Seed script | Default admin email | `admin@byteverse.dev` |
| `ADMIN_PIN` | No | Violation API | Custom proctor PIN (supplements hardcoded ones) | `654321` |

## Database

| Variable | Required | Used By | Purpose | Example |
|----------|----------|---------|---------|---------|
| `DATABASE_URL` | Yes | Prisma, pg Pool | PostgreSQL connection string | `postgresql://user:pass@host:5433/db` |
| `POSTGRES_PASSWORD` | Yes | Docker Compose | PostgreSQL password | `changeme` |

## Redis

| Variable | Required | Used By | Purpose | Example |
|----------|----------|---------|---------|---------|
| `REDIS_URL` | No* | ioredis | Redis connection string | `redis://:password@localhost:6379` |
| `REDIS_PASSWORD` | No* | Docker Compose | Redis auth password | `changeme` |

> *Redis is optional. If unavailable, the app falls back gracefully (no caching, rate limiting returns Infinity = deny).

## Code Execution (Judge0)

| Variable | Required | Used By | Purpose | Example |
|----------|----------|---------|---------|---------|
| `JUDGE0_URL` | Yes | Judge client, submission API | Judge0 CE base URL | `http://192.168.6.4:2358` |
| `JUDGE0_API_KEY` | No | Judge client | API key (RapidAPI or self-hosted auth) | `your-api-key` |
| `JUDGE0_WEBHOOK_SECRET` | No | Judge webhook | Webhook verification secret | `<base64-secret>` |

> **Note:** The code auto-strips trailing `/`, `/system_info`, and `/about` from `JUDGE0_URL`.

## AI System (Groq)

| Variable | Required | Used By | Purpose | Example |
|----------|----------|---------|---------|---------|
| `AI_PROVIDER` | No | AI gateway | AI provider identifier | `groq` |
| `AI_BASE_URL` | No | OpenAI SDK | API base URL | `https://api.groq.com/openai/v1` |
| `AI_API_KEYS` | Yes* | AI gateway | Comma-separated Groq API keys (up to 15) | `gsk_key1,gsk_key2` |
| `AI_API_KEY` | No | AI gateway | Single key fallback (if AI_API_KEYS empty) | `gsk_xxx` |
| `AI_MODEL` | No | AI gateway | Default LLM model | `qwen/qwen3.8-27b` |
| `AI_EXPLAIN_MODEL` | No | AI gateway | Model for EXPLAIN prompts | `qwen/qwen3.8-27b` |
| `AI_CODE_MODEL` | No | AI gateway | Model for CODE prompts | `qwen/qwen3.8-27b` |
| `AI_MAX_TOKENS` | No | AI gateway | Max response tokens | `800` |
| `AI_RATE_LIMIT_PER_MINUTE` | No | Rate limiter | AI requests per minute | `10` |

> *At least one of `AI_API_KEYS` or `AI_API_KEY` is needed for AI features.

## Application

| Variable | Required | Used By | Purpose | Example |
|----------|----------|---------|---------|---------|
| `NEXT_PUBLIC_EVENT_ID` | No | Frontend, seed | Default event identifier | `byteverse-2025` |
| `LOG_LEVEL` | No | Application | Logging verbosity | `info` |
| `NODE_ENV` | Auto | Next.js | Environment mode | `development` / `production` |

## Missing / Undocumented Variables

| Variable | Found In | Notes |
|----------|----------|-------|
| `ADMIN_PIN` | `src/app/api/audit/violation/route.ts` | Optional custom PIN; code also accepts hardcoded `123456`, `2026`, `admin2026` |

## Security Notes

> [!CAUTION]
> - **Never commit `.env` to version control.** The `.gitignore` should exclude it.
> - **Never expose API keys** in `NEXT_PUBLIC_*` prefixed variables.
> - **Rotate `NEXTAUTH_SECRET`** before production deployment.
> - **Use unique passwords** for `POSTGRES_PASSWORD` and `REDIS_PASSWORD` in production.
