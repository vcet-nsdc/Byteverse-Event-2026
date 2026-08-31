# 32 — Coding Conventions
**Purpose:** Document existing code conventions  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Existing codebase patterns
---
## File Naming
- Components: `PascalCase.tsx` (e.g., `AntiCheatShield.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-round-timer.ts`)
- Library modules: `kebab-case.ts` (e.g., `ai-gateway.ts`)
- API routes: `route.ts` (Next.js convention)
- Types: `index.ts` or `descriptive-name.ts`
## Variables & Functions
- `camelCase` for variables and functions
- `PascalCase` for React components and types
- `SCREAMING_SNAKE_CASE` for constants (e.g., `LANG_IDS`, `LIFETIME_LIMITS`)
## TypeScript Usage
- Strict mode enabled
- `unknown` preferred over `any` in catch blocks
- Zod for runtime validation, TypeScript for compile-time
- Type imports: `import type { ... }`
## Async Patterns
- `async/await` exclusively (no raw Promises)
- Empty catch blocks for non-critical operations: `catch { /* ignore */ }`
## Imports
- Path aliases: `@/` maps to `src/`
- Example: `import { auth } from "@/lib/auth"`
## Comments
- JSDoc-style block comments for module headers
- Inline comments for complex logic
- Section dividers: `// ─── Section Name ───`
## Component Patterns
- "use client" directive for interactive components
- Dynamic imports for heavy components (Monaco)
- Radix UI for accessible primitives
- Tailwind utility classes (no CSS modules)
