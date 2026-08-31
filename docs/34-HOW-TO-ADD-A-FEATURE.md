# 34 — How to Add a Feature
**Purpose:** Step-by-step guide for adding features  
**Audience:** All Developers  
**Last Generated:** 2026-08-31  
**Source of Truth:** Repository patterns
---
## Steps
1. **Identify domain** — Which subsystem? (teams, rounds, scoring, AI, etc.)
2. **Update model** — Add/modify fields in `prisma/schema.prisma`
3. **Run migration** — `npm run db:migrate:dev -- --name describe_change`
4. **Generate client** — `npm run db:generate`
5. **Add types** — Update `src/types/index.ts` if needed
6. **Add business logic** — Create/modify `src/lib/{module}.ts`
7. **Add API endpoint** — Create `src/app/api/{path}/route.ts`
8. **Add validation** — Define Zod schema in route
9. **Add frontend** — Create page/component
10. **Test** — Manual testing + update tests
11. **Update docs** — Modify relevant documentation files
## Example: Adding a New API Endpoint
```typescript
// src/app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  field: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  // Business logic here
  return NextResponse.json({ success: true });
}
```
