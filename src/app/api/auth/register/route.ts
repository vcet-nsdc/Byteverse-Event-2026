import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureInitialized, getFallbackUserByEmail, addFallbackUser } from "@/lib/user-store";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  college: z.string().min(2).max(200).optional(),
  department: z.string().min(2).max(100).optional(),
  year: z.number().int().min(1).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit({
    key: getRateLimitKey(req, "register"),
    limit: 10,
    windowSeconds: 3600,
  });
  if (!allowed)
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid registration data",
        details: parsed.error.flatten(),
      },
      { status: 422 },
    );
  }

  const { name, email, password, college } = parsed.data;
  const normEmail = email.trim().toLowerCase();

  await ensureInitialized();

  // 1. Check for existing account in PostgreSQL or local fallback store
  try {
    const existing = await db.user.findUnique({ where: { email: normEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
  } catch {
    // Database offline, check local fallback store
  }

  const existingFallback = getFallbackUserByEmail(normEmail);
  if (existingFallback) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // 2. Persist to local fallback store first (guarantees offline availability)
  const fallbackUser = addFallbackUser({
    name,
    email: normEmail,
    passwordHash,
    college: college ?? "NSDC Technical Institute",
    role: "PARTICIPANT",
  });

  // 3. Also sync to PostgreSQL if database is reachable
  try {
    await db.user.create({
      data: {
        id: fallbackUser.id,
        name,
        email: normEmail,
        passwordHash,
        college: college ?? "NSDC Technical Institute",
        role: "PARTICIPANT",
      },
    });
  } catch {
    // Gracefully ignore database connection errors when running in offline/Docker-less mode
  }

  return NextResponse.json(
    {
      id: fallbackUser.id,
      name: fallbackUser.name,
      email: fallbackUser.email,
    },
    { status: 201 },
  );
}
