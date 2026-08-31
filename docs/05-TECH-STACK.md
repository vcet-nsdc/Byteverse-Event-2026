# 05 — Tech Stack

**Purpose:** Document all technologies and their usage  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `package.json`, repository implementation

---

## Core Technologies

| Technology | Version | Purpose | Config File |
|------------|---------|---------|-------------|
| **TypeScript** | 5.7 | Primary language | `tsconfig.json` |
| **Next.js** | 15.5 | Full-stack React framework | `next.config.ts` |
| **React** | 19.0 | UI library | — |
| **Node.js** | 18+ | Runtime | — |

## Frontend

| Technology | Version | Purpose | Where Used |
|------------|---------|---------|------------|
| **Tailwind CSS** | 3.4 | Utility-first CSS | `tailwind.config.ts`, all components |
| **Radix UI** | Various | Accessible UI primitives | `src/components/ui/` |
| **Framer Motion** | 11.13 | Animations | Landing page, transitions |
| **Lucide React** | 0.468 | Icon library | All components |
| **Monaco Editor** | 4.7 | Code editor (VS Code engine) | Round workspace |
| **Recharts** | 2.15 | Charts/graphs | Admin dashboard |
| **Zustand** | 5.0 | State management | `src/store/` |
| **class-variance-authority** | 0.7 | Component variant system | `src/components/ui/` |
| **clsx** + **tailwind-merge** | — | Class name utilities | Across components |

## Backend

| Technology | Version | Purpose | Where Used |
|------------|---------|---------|------------|
| **NextAuth.js** | 5.0 beta | Authentication | `src/lib/auth.ts` |
| **Prisma** | 7.9 | ORM + migrations | `prisma/schema.prisma`, `src/lib/db.ts` |
| **@prisma/adapter-pg** | 7.9 | Native PostgreSQL driver | `src/lib/db.ts` |
| **pg** (node-postgres) | 8.23 | PostgreSQL connection pool | `src/lib/db.ts` |
| **Zod** | 3.24 | Request validation | All API routes |
| **bcryptjs** | 2.4 | Password hashing | Auth, team creation |
| **jose** | 5.10 | JWT utilities | Token management |
| **axios** | 1.7 | HTTP client for Judge0 | `src/lib/judge.ts`, submissions API |
| **ioredis** | 5.4 | Redis client | `src/lib/redis.ts` |
| **OpenAI SDK** | 4.77 | AI API client (Groq-compatible) | `src/lib/ai-gateway.ts` |
| **dotenv** | 17.4 | Environment variable loading | Scripts, seed files |

## Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16 Alpine | Primary database |
| **Redis** | 7 Alpine | Cache, rate limiting, pub/sub |

## External Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Judge0 CE** | Code execution sandbox | `JUDGE0_URL` env var (LAN or RapidAPI) |
| **Groq AI** | LLM inference (Socratic tutoring) | `AI_API_KEYS`, `AI_BASE_URL` env vars |

## Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **Jest** | 29.7 | Unit testing | 
| **Playwright** | 1.49 | E2E testing |
| **k6** | — | Load testing |

## DevOps

| Technology | Purpose | Config File |
|------------|---------|-------------|
| **Docker** | Containerization | `Dockerfile`, `docker-compose.yml` |
| **ESLint** | Linting | `.eslintrc.json` |
| **PostCSS** | CSS processing | `postcss.config.js` |

## Key Architectural Choices

- **Why Prisma with native PG adapter?** — Eliminates Prisma's query engine binary, using node-postgres directly for better performance and smaller Docker images.
- **Why OpenAI SDK for Groq?** — Groq exposes an OpenAI-compatible API; the SDK handles streaming, retries, and token counting.
- **Why Monaco Editor?** — Provides VS Code-level editing with syntax highlighting, autocompletion, and multi-language support without external dependencies.
- **Why Redis for rate limiting?** — Atomic `INCR` + `EXPIRE` provides distributed rate limiting that survives server restarts (unlike in-memory counters).
- **Why ioredis over redis?** — ioredis supports clustering, Lua scripting, and has better reconnection logic.
