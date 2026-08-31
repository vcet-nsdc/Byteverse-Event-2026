# 39 — Future Improvements
**Purpose:** Recommended improvements based on architecture analysis  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Codebase analysis
---
## Immediate
- [ ] Fix empty hooks (`use-round-timer`, `use-submission`, `use-leaderboard`)
- [ ] Move compile counter to Redis
- [ ] Move proctor PIN to env-only
- [ ] Add role check in middleware (not just cookie)
- [ ] Implement SSE stream endpoint or remove EventSource client code
## Short-term
- [ ] Split 1165-line round workspace into subcomponents
- [ ] Centralize Judge0 config (remove duplication)
- [ ] Add comprehensive Jest tests for scoring logic
- [ ] Implement submission result polling mechanism
- [ ] Add admin UI for problem creation/editing
- [ ] Wire Google/GitHub OAuth providers
## Long-term
- [ ] WebSocket real-time updates (replace polling)
- [ ] Server-side rendering for leaderboard (SEO)
- [ ] Multi-event support (currently single-event)
- [ ] Mobile-responsive competition view
- [ ] Automated deployment pipeline (CI/CD)
- [ ] Performance monitoring (APM)
- [ ] Code plagiarism detection between submissions
