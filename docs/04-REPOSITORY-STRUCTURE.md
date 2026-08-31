# 04 — Repository Structure

**Purpose:** Document the repository layout with explanations  
**Audience:** All Developers / AI Agents  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation

---

## Root Directory

```
byteverse/
├── .env                    # Environment variables (DO NOT commit real secrets)
├── .env.example            # Template for environment variables
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── Dockerfile              # Production container build
├── docker-compose.yml      # Dev infrastructure (Postgres, Redis, Judge0, App)
├── jest.config.js          # Jest test configuration
├── next.config.ts          # Next.js configuration (webpack, image domains)
├── next-env.d.ts           # Next.js TypeScript declarations
├── package.json            # Dependencies and npm scripts
├── postcss.config.js       # PostCSS configuration for Tailwind
├── prisma.config.ts        # Prisma config with driver adapter
├── tailwind.config.ts      # Tailwind CSS theme configuration
├── tsconfig.json           # TypeScript configuration
├── README.md               # Project README
│
├── prisma/                 # Database schema, migrations, and seeds
├── scripts/                # Utility scripts (seeding, testing)
├── src/                    # Application source code
├── tests/                  # Test files
├── docker/                 # Docker-related configuration files
└── docs/                   # This documentation directory
```

## `src/` — Application Source

```
src/
├── middleware.ts            # Next.js middleware (admin route protection)
│
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout (HTML, fonts, metadata)
│   ├── page.tsx             # Landing page (registration + login)
│   ├── error.tsx            # Global error boundary
│   ├── loading.tsx          # Global loading state
│   ├── not-found.tsx        # 404 page
│   │
│   ├── (auth)/              # Authentication route group
│   │   └── login/           # Login page
│   │
│   ├── (admin)/             # Admin dashboard route group
│   │   ├── layout.tsx       # Admin layout with AdminNavbar
│   │   └── admin/
│   │       ├── page.tsx     # Admin dashboard home
│   │       ├── ai/          # AI telemetry dashboard
│   │       ├── announcements/ # Announcement management
│   │       ├── leaderboard/ # Admin leaderboard view
│   │       ├── participants/ # Participant management
│   │       ├── rounds/      # Round management & control
│   │       └── teams/       # Team management
│   │
│   ├── (participant)/       # Participant route group
│   │   ├── layout.tsx       # Participant layout
│   │   ├── leaderboard/     # Public leaderboard page
│   │   ├── rounds/
│   │   │   └── [roundId]/   # Round workspace (MCQ + coding)
│   │   └── team/            # Team management page
│   │
│   └── api/                 # API Route Handlers
│       ├── admin/           # Admin-only API endpoints
│       │   ├── ai/          # AI telemetry API
│       │   ├── announcements/ # CRUD announcements
│       │   ├── events/      # Event management
│       │   ├── participants/ # Participant management
│       │   ├── problems/    # Problem CRUD
│       │   ├── rounds/      # Round CRUD + status control
│       │   ├── stats/       # Dashboard statistics
│       │   └── teams/       # Admin team management
│       ├── ai/              # AI chat endpoint (EXPLAIN/CODE)
│       ├── audit/
│       │   └── violation/   # Anti-cheat violation logging + PIN unlock
│       ├── auth/            # NextAuth handlers + registration
│       ├── health/          # Health check endpoint
│       ├── judge/           # Judge0 proxy endpoints
│       ├── judge0/          # Direct Judge0 API proxy
│       ├── leaderboard/     # Leaderboard data endpoints
│       ├── mcq/
│       │   └── submit/      # MCQ answer submission
│       ├── rounds/
│       │   ├── current/     # Get all rounds for navigation
│       │   └── [roundId]/   # Round state + problems
│       ├── submissions/     # Code submission + run endpoints
│       └── teams/           # Team creation, joining, leaving
│
├── components/              # React Components
│   ├── admin/
│   │   └── AdminNavbar.tsx  # Admin navigation bar
│   ├── layout/              # Layout components (headers, footers)
│   ├── participant/
│   │   ├── AIAssistantDrawer.tsx    # Slide-out AI chat panel
│   │   ├── AntiCheatShield.tsx      # Anti-cheat enforcement overlay
│   │   └── SystemReadinessGate.tsx  # Pre-round readiness checklist
│   ├── shared/              # Shared components
│   └── ui/                  # Radix-based UI primitives
│       └── Button.tsx, Dialog.tsx, etc.
│
├── hooks/                   # Custom React Hooks
│   ├── use-leaderboard.ts   # Leaderboard data fetching (empty)
│   ├── use-round-timer.ts   # Round timer logic (empty)
│   └── use-submission.ts    # Submission state management (empty)
│
├── lib/                     # Core Business Logic
│   ├── ai-gateway.ts        # Groq multi-key pool + Socratic prompts
│   ├── auth.ts              # NextAuth configuration
│   ├── auth/                # Auth utilities directory
│   ├── audit.ts             # Audit logging utilities
│   ├── db.ts                # Prisma client initialization
│   ├── db/                  # Database utilities directory
│   ├── judge.ts             # Judge0 submission/result client
│   ├── judge0/              # Judge0 utilities directory
│   ├── rate-limit.ts        # Redis-based rate limiting
│   ├── rbac.ts              # Role hierarchy checker
│   ├── redis.ts             # Redis client wrapper + cache keys
│   ├── redis/               # Redis utilities directory
│   ├── scoring.ts           # Score calculation engine
│   ├── scoring/             # Scoring utilities directory
│   └── utils/               # General utilities
│
├── store/                   # Zustand state stores
├── styles/                  # Global CSS files
└── types/                   # Shared TypeScript definitions
    ├── index.ts             # Core types (UserRole, RoundType, etc.)
    ├── api.ts               # API-related types
    ├── judge0.ts            # Judge0 response types
    └── next-auth.d.ts       # NextAuth session type augmentation
```

## `prisma/` — Database Layer

```
prisma/
├── schema.prisma            # 12 models, enums, relations, indexes
├── seed.ts                  # Seeds admin user, event, 5 rounds
└── migrations/              # Prisma migration history
```

## `scripts/` — Utility Scripts

```
scripts/
├── seed-round1-questions.ts # Seeds 20 MCQ questions for Round 1
├── seed-round2-questions.ts # Seeds 8 coding problems for Round 2
├── clean-test-data.ts       # Cleans test data from database
├── test-judge-pc2.ts        # Tests Judge0 connectivity to LAN server
└── verify-admin.ts          # Verifies admin account exists
```

## Important Placement Rules

| What | Where | NOT Here |
|------|-------|----------|
| New API endpoint | `src/app/api/{domain}/route.ts` | Never in `src/lib/` |
| New React page | `src/app/(group)/path/page.tsx` | Never in `src/components/` |
| Business logic | `src/lib/{module}.ts` | Never inline in API routes |
| Shared types | `src/types/index.ts` | Never duplicated across files |
| Database changes | `prisma/schema.prisma` → migrate | Never raw SQL |
| UI primitives | `src/components/ui/` | Never in feature components |
| Feature components | `src/components/{domain}/` | Never in `ui/` |
