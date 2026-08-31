# 28 — Testing
**Purpose:** Document test infrastructure and coverage  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** `jest.config.js`, `package.json`
---
## Test Frameworks
| Framework | Type | Command |
|-----------|------|---------|
| Jest | Unit/Integration | `npm test` |
| Playwright | End-to-End | `npm run test:e2e` |
| k6 | Load Testing | `npm run test:load` |
## Jest Configuration
```javascript
// jest.config.js
testEnvironment: 'jest-environment-node'
```
## Current Test Coverage
> **Status:** Tests directory exists (`tests/`) but coverage is minimal. Most critical flows lack automated tests.
## Critical Test Scenarios
| Scenario | Priority | Status |
|----------|----------|--------|
| User registration + login | High | Needs Verification |
| Team creation + join | High | Needs Verification |
| MCQ submission + scoring | High | Needs Verification |
| Code submission to Judge0 | High | Needs Verification |
| AI call with penalty | High | Needs Verification |
| AI lifetime limit enforcement | Critical | Needs Verification |
| Round state transitions | Critical | Needs Verification |
| Admin round start/end | High | Needs Verification |
| Anti-cheat violation logging | Medium | Needs Verification |
| Team score calculation | High | Needs Verification |
| Rate limiting | Medium | Needs Verification |
| Idempotent submissions | Medium | Needs Verification |
## Utility Scripts
- `scripts/clean-test-data.ts` — Cleans test data from database
- `scripts/test-judge-pc2.ts` — Tests Judge0 connectivity
- `scripts/verify-admin.ts` — Verifies admin account exists
