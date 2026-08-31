# 30 — Performance and Scalability
**Purpose:** Document performance characteristics and bottlenecks  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository implementation
---
## Expected Load
For a college competition: ~100-200 concurrent participants, 50-100 teams.
## Known Bottlenecks
| Area | Risk | Mitigation |
|------|------|-----------|
| Judge0 | Single instance, sequential execution | LAN server with multi-core |
| Groq API | Rate limits per key | Multi-key pool (up to 15 keys) |
| Database queries | N+1 queries in scoring | Redis caching for leaderboards |
| Round state polling | 200 users × every 6s = 33 req/s | Lightweight query, indexed |
| Monaco Editor | Large JS bundle | Dynamic import with ssr:false |
## Current Optimizations
- **Redis caching** for leaderboard data (invalidated on score changes)
- **Prisma connection pooling** via node-postgres Pool
- **AI key pool** distributes load across 15 keys
- **In-memory compile tracking** avoids DB writes for run counts
- **Idempotent submissions** prevent duplicate judge executions
## Recommendations
1. Add database query caching for problem loading
2. Implement connection pooling for Judge0 requests
3. Add CDN for static assets
4. Consider server-side pagination for admin lists
5. Implement WebSocket for real-time updates (replace polling)
