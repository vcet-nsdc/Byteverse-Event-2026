# PROJECT CONTEXT — ByteVerse

**Single-File Machine-Readable System Digest for AI Agents & Developers**  
**Version:** 2.0.0 (Production)  
**Last Updated:** 2026-08-31

---

## Quick Metadata
- **Project Name:** ByteVerse 2026
- **Event Organizer:** NSDC @ VCET, Vasai
- **Type:** Duo-based Competitive Programming Platform (Next.js 15 Monolith)
- **Primary Stack:** Next.js 15, React 19, TypeScript 5.7, Prisma 7, PostgreSQL 16, Redis 7, Tailwind CSS, Monaco Editor
- **Execution Sandbox:** Judge0 CE (Self-Hosted LAN / Docker on port 2358)
- **AI Infrastructure:** Groq Multi-Key Pool (Up to 15 API keys rotated round-robin)

---

## Core Operational Invariants
1. **Teams:** Max 2 participants per team. Leader gets Set A problems; Member gets Set B.
2. **Rounds (5 Sequential):**
   - Round 1: `CODE_LOGIC` (20m, MCQ format, 10 pts/question, auto-scored)
   - Round 2: `AI_REPAIR` (25m, Optimizing/debugging AI-generated code)
   - Round 3: `TRADITIONAL` (35m, Standard DSA challenges)
   - Round 4: `TYPE_TRANSFORM` (45m, Multi-language refactoring)
   - Round 5: `HUMAN_VS_MACHINE` (35m, Competitive finale)
3. **Scoring Formula:** `finalScore = min(rawScore, aiScoreCap)`. 
   - Using AI EXPLAIN sets cap to 75%.
   - Using AI CODE sets cap to 50%.
   - Team Score = `(Member1_Score + Member2_Score) / 2` (Default policy: `TREAT_AS_ZERO` for missing member).
4. **Anti-Cheat:** High-frequency DOM monitoring (tab switch, blur, fullscreen exit, trapped keyboard shortcuts). Locked state requires Proctor PIN (`123456` or `2026`) to unlock.
5. **AI Lifetime Limits:** 15 EXPLAIN prompts, 25 CODE prompts per user across entire tournament.

---

## Key File Index

```
src/
├── app/
│   ├── (auth)/login/page.tsx             # Login page
│   ├── (admin)/admin/                    # Admin control dashboard
│   ├── (participant)/rounds/[roundId]/   # Arena workspace (MCQ + Monaco Editor)
│   └── api/                              # Backend endpoints (auth, rounds, submissions, ai, audit)
├── components/
│   ├── participant/AntiCheatShield.tsx   # Anti-cheat DOM & keyboard lock overlay
│   ├── participant/AIAssistantDrawer.tsx # Groq AI Socratic tutor panel
│   └── participant/SystemReadinessGate.tsx # Pre-round system checklist
├── lib/
│   ├── ai-gateway.ts                     # Multi-key Groq pool & prompt manager
│   ├── auth.ts                           # NextAuth credentials & JWT config
│   ├── db.ts                             # Prisma Client with @prisma/adapter-pg
│   ├── judge.ts                          # Judge0 API client
│   ├── redis.ts                          # ioredis client & cache helper
│   └── scoring.ts                        # Score calculation & AI penalty engine
prisma/
└── schema.prisma                         # 12 PostgreSQL models & 6 enums
```
