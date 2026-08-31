# 40 — Decisions and Tradeoffs
**Purpose:** Document architectural decisions (ADR-style)  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Codebase evidence
---
## Decision: Next.js Monolith
- **Context:** Need full-stack with minimal infrastructure
- **Choice:** Single Next.js app (API Routes + React pages)
- **Advantages:** Simple deployment, shared types, no CORS issues
- **Disadvantages:** API routes limited vs Express, can't scale independently
- **Status:** Active
## Decision: Prisma with Native PG Adapter
- **Context:** Need ORM but want performance
- **Choice:** Prisma 7 with `@prisma/adapter-pg` (bypasses query engine binary)
- **Advantages:** Smaller Docker image, faster queries, native pg pooling
- **Disadvantages:** Newer API, less community examples
- **Status:** Active
## Decision: AI Score Cap (Not Subtraction)
- **Context:** How to penalize AI usage
- **Choice:** Cap-based system (`finalScore = min(rawScore, cap)`)
- **Advantages:** Prevents score going negative, configurable per round
- **Disadvantages:** Multiple AI uses don't stack proportionally
- **Status:** Active
## Decision: Client-Side Anti-Cheat
- **Context:** Prevent cheating during competition
- **Choice:** Browser-based enforcement (fullscreen, tab, blur detection)
- **Advantages:** No additional software required, works on any browser
- **Disadvantages:** Bypassable with technical knowledge
- **Status:** Active — supplemented by on-site proctoring
## Decision: Redis as Optional
- **Context:** Not all development environments have Redis
- **Choice:** Graceful degradation — all Redis operations wrapped in try/catch
- **Advantages:** App works without Redis
- **Disadvantages:** No caching or real-time features when Redis is down
- **Status:** Active
## Decision: Multi-Key AI Pool
- **Context:** Groq API has aggressive rate limits per key
- **Choice:** Up to 15 keys with round-robin rotation and 60s cooldown failover
- **Advantages:** Supports 100+ concurrent AI users
- **Disadvantages:** Complex pool management, telemetry overhead
- **Status:** Active
