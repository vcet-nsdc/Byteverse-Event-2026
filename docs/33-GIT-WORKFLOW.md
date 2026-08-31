# 33 — Git Workflow
**Purpose:** Recommended git workflow  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository practices
---
## Branch Strategy (Recommended)
```
main          ← Production-ready code
├── develop   ← Integration branch
├── feature/* ← New features
├── fix/*     ← Bug fixes
└── docs/*    ← Documentation updates
```
## Commit Conventions (Recommended)
```
feat: add round 3 problems
fix: correct MCQ scoring calculation
docs: update API reference
refactor: extract scoring logic to service
chore: update dependencies
```
## PR Checklist
- [ ] Code compiles (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] API routes have Zod validation
- [ ] No secrets in code
- [ ] Documentation updated if architecture changed
