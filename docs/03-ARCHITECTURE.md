# 03 — Architecture

**Purpose:** Detailed system architecture with diagrams  
**Audience:** All Developers / AI Agents  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation

---

## System Architecture

ByteVerse is a **Next.js 15 monolithic full-stack application**. The frontend (React 19) and backend (API Routes) coexist in a single codebase. External services include PostgreSQL, Redis, Judge0, and Groq AI.

```mermaid
flowchart TB
    subgraph Client["Browser (Participant/Admin)"]
        UI["React 19 + Tailwind CSS"]
        Monaco["Monaco Editor"]
        AntiCheat["AntiCheatShield Component"]
    end

    subgraph NextJS["Next.js 15 Server"]
        Pages["App Router Pages"]
        API["API Route Handlers"]
        MW["Middleware (Admin Auth)"]
        Auth["NextAuth.js v5"]
        AIGateway["AI Gateway (Multi-Key Pool)"]
        Scoring["Scoring Engine"]
        JudgeClient["Judge0 Client"]
        RateLimiter["Rate Limiter"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma ORM v7"]
        PG["PostgreSQL 16"]
        Redis["Redis 7"]
    end

    subgraph External["External Services"]
        Judge0["Judge0 CE (Self-hosted/LAN)"]
        Groq["Groq AI API"]
    end

    UI --> Pages
    UI --> API
    Monaco --> API
    AntiCheat -->|Violation Log| API
    MW --> API
    API --> Auth
    API --> AIGateway
    API --> Scoring
    API --> JudgeClient
    API --> RateLimiter
    Auth --> Prisma
    AIGateway --> Groq
    AIGateway --> Prisma
    Scoring --> Prisma
    Scoring --> Redis
    JudgeClient --> Judge0
    Prisma --> PG
    RateLimiter --> Redis
    API --> Redis
```

## Frontend Architecture

- **Framework:** Next.js 15 App Router with React 19
- **Styling:** Tailwind CSS 3.4 + Radix UI primitives
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Animations:** Framer Motion
- **State:** Zustand (store directory) + React `useState`/`useCallback`
- **Icons:** Lucide React
- **Route Groups:**
  - `(auth)` → Login page
  - `(admin)` → Admin dashboard (protected by middleware)
  - `(participant)` → Round workspace, leaderboard, team management

## Backend Architecture

- **Runtime:** Next.js API Routes (Node.js)
- **Authentication:** NextAuth.js v5 with JWT strategy + Credentials provider
- **ORM:** Prisma 7 with native `pg` driver adapter (`@prisma/adapter-pg`)
- **Validation:** Zod schemas on every API endpoint
- **Database:** PostgreSQL 16 (Docker, port 5433)
- **Cache/Pub-Sub:** Redis 7 via ioredis (leaderboard cache, rate limiting, admin alerts)
- **Code Execution:** Judge0 CE via HTTP (axios)
- **AI:** OpenAI SDK pointed at Groq API base URL

## Database

- **12 models** defined in `prisma/schema.prisma`
- Native PG driver via `@prisma/adapter-pg` (not Prisma's query engine)
- Connection pooling via `node-postgres` `Pool`
- See [10-DATABASE.md](./10-DATABASE.md) for full schema

## Code Execution

- **Judge0 CE v1.13.1** — runs participant code in isolated Docker containers
- Supports: C (50), C++ (54), Java (62), Python (71)
- Two modes:
  - **Run** (`/api/submissions/run`): Synchronous `wait=true`, returns stdout/stderr immediately
  - **Submit** (`/api/submissions`): Asynchronous `wait=false`, stores token for polling
- Configurable via `JUDGE0_URL` env var (LAN or RapidAPI)
- See [19-CODE-EXECUTION-SYSTEM.md](./19-CODE-EXECUTION-SYSTEM.md) for details

## AI Services

- **Provider:** Groq (OpenAI-compatible API)
- **Model:** `qwen/qwen3.8-27b` (configurable)
- **Architecture:** Multi-key round-robin pool (up to 15 keys)
- **Failover:** 429 detection → 60s cooldown → auto-switch to next key
- **Prompts:** Round-specific Socratic system prompts (never give answers)
- **Safety:** Input sanitization (anti-injection patterns), output stripping (code blocks > 2 lines)
- See [18-AI-SYSTEM.md](./18-AI-SYSTEM.md) for details

## Realtime Communication

- **Redis Pub/Sub channels:**
  - `leaderboard` — score update notifications
  - `submissions` — new submission alerts
  - `scores:{eventId}` — AI penalty broadcasts
  - `admin:alerts:{eventId}` — violation alerts for proctors
- **SSE:** `EventSource` attempted in round workspace (connecting to `/api/rounds/{id}/stream`)
- **Polling:** 6-second fallback polling for round state

## Authentication Flow

```mermaid
sequenceDiagram
    participant P as Participant
    participant FE as Frontend
    participant API as NextAuth API
    participant DB as PostgreSQL

    P->>FE: Enter email + password
    FE->>API: POST /api/auth/callback/credentials
    API->>DB: SELECT user WHERE email = ?
    DB-->>API: User record
    API->>API: bcrypt.compare(password, hash)
    API->>API: Generate JWT { id, role, email }
    API-->>FE: Set-Cookie: session-token
    FE-->>P: Redirect to dashboard
```

## Submission Lifecycle

```mermaid
sequenceDiagram
    participant P as Participant
    participant FE as Frontend
    participant API as API Route
    participant J0 as Judge0
    participant DB as PostgreSQL
    participant R as Redis

    P->>FE: Click "Run Code"
    FE->>API: POST /api/submissions/run
    API->>API: Validate session + Zod schema
    API->>API: Check compile limit (10/problem)
    API->>J0: POST /submissions?wait=true
    J0-->>API: { stdout, stderr, status }
    API-->>FE: Display result

    P->>FE: Click "Submit"
    FE->>API: POST /api/submissions
    API->>API: Check idempotency key
    API->>J0: POST /submissions?wait=false
    J0-->>API: { token }
    API->>DB: INSERT submission
    API->>R: PUBLISH submissions channel
    API-->>FE: { submissionId, status: QUEUED }
```

## Competition State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Round Created
    DRAFT --> SCHEDULED: Admin Schedules
    SCHEDULED --> ACTIVE: Admin Starts
    ACTIVE --> PAUSED: Admin Pauses
    PAUSED --> ACTIVE: Admin Resumes
    ACTIVE --> ENDED: Timer Expires / Admin Ends
    ENDED --> [*]
```

## Request Lifecycle

1. Browser makes `fetch()` to `/api/*` endpoint
2. Next.js middleware checks admin routes for session cookie
3. API route handler calls `auth()` to verify JWT session
4. Zod validates request body
5. Business logic executed (scoring, Judge0, AI, etc.)
6. Prisma queries PostgreSQL
7. Redis updated (cache invalidation, pub/sub)
8. JSON response returned

## Important Module Boundaries

| Module | Responsibility | Files |
|--------|---------------|-------|
| **Auth** | Session management, role checking | `src/lib/auth.ts`, `src/lib/rbac.ts`, `src/middleware.ts` |
| **AI Gateway** | Multi-key rotation, Socratic prompts, usage tracking | `src/lib/ai-gateway.ts` |
| **Judge** | Code execution via Judge0 | `src/lib/judge.ts`, `src/app/api/submissions/run/route.ts` |
| **Scoring** | Score calculation, AI penalties, team aggregation | `src/lib/scoring.ts` |
| **Anti-Cheat** | Client-side enforcement, violation logging | `src/components/participant/AntiCheatShield.tsx`, `src/app/api/audit/violation/route.ts` |
| **Data** | Prisma client, Redis wrapper | `src/lib/db.ts`, `src/lib/redis.ts` |
