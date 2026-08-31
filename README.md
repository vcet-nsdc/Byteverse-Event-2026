# ByteVerse

**Production-grade college coding competition platform** — five pirate-themed rounds, real-time leaderboard, AI-assisted problem solving with score penalties, and sandboxed code execution.

Built with Next.js 15 App Router · TypeScript · PostgreSQL · Redis · Judge0 · Groq AI

---

## Features

- **5 competition rounds** — Logic Voyage, Code Forge, The Kraken, Cipher Tide, Ghost Ship
- **Real-time leaderboard** — Server-Sent Events, per-event Redis pub/sub
- **Sandboxed code execution** — Self-hosted Judge0, webhook-based result delivery
- **AI assistant** — Navigator (explain, −25 pts) and Forge (code help, −50 pts) with server-enforced score caps
- **Team scoring** — 2-member teams, configurable missing-member policy
- **RBAC** — `PARTICIPANT → ORGANIZER → ADMIN → SUPER_ADMIN` hierarchy, server-authoritative
- **Race-condition-safe** — Serializable transactions on team join/create and score writes
- **Redis-resilient** — Full graceful degradation; PostgreSQL is always the source of truth

---

## Quick Start

```bash
git clone https://github.com/your-org/byteverse.git
cd byteverse
cp .env.example .env          # fill in required vars (see below)
docker-compose up -d postgres redis judge0
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in:

| Email | Password |
|---|---|
| `admin@byteverse.dev` | `Admin@ByteVerse1` |

> **Change the admin password immediately** before any non-local deployment.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in these required values:

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>

DATABASE_URL=postgresql://byteverse:password@localhost:5432/byteverse
REDIS_URL=redis://localhost:6379

JUDGE0_URL=http://localhost:2358
JUDGE0_WEBHOOK_SECRET=<random-min-32-chars>

AI_API_KEYS=gsk_key1,gsk_key2,gsk_key3   # Groq API keys, comma-separated
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-8b-instant
```

See [`.env.example`](.env.example) for the full list including optional OAuth and observability variables.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5.7 |
| Database | PostgreSQL 16 (Prisma ORM 5.22) |
| Cache / pub-sub | Redis 7 (ioredis) |
| Code execution | Judge0 (self-hosted) |
| AI gateway | Groq — `llama-3.1-8b-instant`, multi-key pool |
| Auth | NextAuth.js v5 beta (JWT + Prisma adapter) |
| UI | Tailwind CSS 3.4, shadcn/ui (Radix primitives) |
| Testing | Jest (unit), Playwright (e2e), k6 (load) |

---

## Scripts

```bash
npm run dev           # start development server
npm run build         # production build
npm run start         # start production server
npm run type-check    # tsc --noEmit
npm run test          # jest --runInBand
npm run test:e2e      # playwright test
npm run lint          # next lint
npm run db:migrate    # prisma migrate deploy
npm run db:seed       # seed admin + event + rounds
npm run db:studio     # open Prisma Studio
```

---

## Documentation

Complete developer and operational documentation is available in the [`docs/`](./docs) directory:

- 📖 [**Documentation Suite Index**](./docs/README.md) — Complete 50+ document catalog
- 🚀 [**Start Here (10-Minute Onboarding)**](./docs/00-START-HERE.md) — Overview for developers & AI agents
- 🏗️ [**System Architecture**](./docs/03-ARCHITECTURE.md) — Complete architecture diagrams and subsystem flows
- 🗄️ [**Database & Schema**](./docs/10-DATABASE.md) — Full Prisma schema reference & ER diagrams
- 🔌 [**API Reference**](./docs/12-API-REFERENCE.md) — Comprehensive API endpoint documentation
- 🤖 [**AI System Architecture**](./docs/18-AI-SYSTEM.md) — Groq multi-key rotation and Socratic prompts
- 🛡️ [**Anti-Cheat System**](./docs/20-ANTI-CHEAT-SYSTEM.md) — Station locking and proctor protocols
- 📋 [**Event Day Runbook**](./docs/EVENT_DAY_RUNBOOK.md) — Step-by-step tournament operations manual
- ⚖️ [**Competition Rules (Internal)**](./docs/INTERNAL-COMPETITION-RULES.md) — Scoring formulas and penalty specs

---

## Project Structure

```
src/
  app/
    (auth)/           # login, register
    (participant)/    # workspace, dashboard, team, leaderboard
    (admin)/          # admin control center
    (organizer)/      # organizer views
    api/              # all API routes
  lib/
    auth.ts           # NextAuth config
    db.ts             # Prisma client singleton
    rbac.ts           # requireRole() — PARTICIPANT < ORGANIZER < ADMIN < SUPER_ADMIN
    redis.ts          # ioredis client with graceful failure wrappers
    scoring.ts        # server-authoritative score computation
    ai-gateway.ts     # Groq client with key-pool rotation
    rate-limit.ts     # per-participant request throttling
  types/              # shared TypeScript types
prisma/
  schema.prisma       # 17-model database schema
  seed.ts             # initial data seeder
tests/
  unit/               # Jest unit tests
  e2e/                # Playwright end-to-end tests
  load/               # k6 load tests
```

---

## Security

ByteVerse enforces these invariants server-side — the client is never trusted to supply or influence them:

- Scores and score caps computed exclusively in the webhook handler and `scoring.ts`
- AI usage state (`explainUsed`/`codeUsed`) read from database, never from request body
- Round timer: server computes `timeLeftSeconds = round.endsAt - now()` on every poll
- Hidden test cases never included in any client-facing response
- AI API keys exist only in server-side environment; never bundled with the client
- Code execution routed through Judge0 only; no `eval` or `vm` usage in Next.js
- Team membership enforced with serializable transactions to prevent race conditions

See [docs/security.md](docs/security.md) and [PRODUCTION_AUDIT.md](PRODUCTION_AUDIT.md) for full details.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow and coding standards.

---

## License

MIT — see [LICENSE](LICENSE).
