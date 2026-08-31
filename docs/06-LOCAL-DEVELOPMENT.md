# 06 — Local Development

**Purpose:** Exact setup instructions for running the project locally  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `package.json`, `docker-compose.yml`

---

## Prerequisites

- **Node.js** ≥ 18 (recommended: 20 LTS)
- **npm** ≥ 9
- **Docker** + **Docker Compose** (for PostgreSQL, Redis)
- **Git**

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd byteverse

# Install Node.js dependencies
npm install
```

## Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values (see 07-ENVIRONMENT-VARIABLES.md)
```

## Database Setup

```bash
# 1. Start PostgreSQL and Redis via Docker
docker compose up -d postgres redis

# 2. Generate Prisma client
npm run db:generate

# 3. Push schema to database (creates tables)
npm run db:push

# 4. Seed initial data (admin user + event + rounds + problems)
npm run db:seed
```

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@byteverse.dev` |
| Password | `admin2026` |

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server (port 3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Deploy pending migrations |
| `npm run db:migrate:dev` | Create and apply a new migration |
| `npm run db:studio` | Open Prisma Studio (GUI database browser) |
| `npm run db:seed` | Seed admin + event + all round questions |
| `npm run db:clean` | Clean test data from database |
| `npm run db:reset` | Re-run full seed (same as db:seed) |
| `npm test` | Run Jest tests |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:load` | Run k6 load tests |

## Starting the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Judge0 Setup (Code Execution)

### Option A: LAN Judge0 Server (Recommended for event day)

Set in `.env`:
```
JUDGE0_URL=http://<LAN_IP>:2358
JUDGE0_API_KEY=
```

### Option B: Docker Compose (Local)

```bash
docker compose up -d judge0
```

> **Note:** Judge0 requires `privileged: true` for Docker-in-Docker execution.

### Option C: RapidAPI (Cloud)

```
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key
```

## Prisma Studio

To browse the database visually:

```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555).

## Full Docker Stack

To run the entire application stack:

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5433
- **Redis** on port 6379
- **Judge0** on port 2358
- **App** on port 3000

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Can't reach database` | Check Docker is running: `docker ps` |
| `ECONNREFUSED 5433` | Ensure postgres container is healthy |
| `Prisma client not generated` | Run `npm run db:generate` |
| `Judge0 403` | Check `JUDGE0_URL` doesn't have trailing `/system_info` |
| `AI returns 429` | All Groq keys exhausted — wait 60s or add more keys |
| `Redis connection error` | Redis is optional; app works without it (cache disabled) |
