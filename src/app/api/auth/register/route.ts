import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
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

  const existing = await db.user.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 },
    );

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      college: college ?? "NSDC College",
      role: "PARTICIPANT",
    },
  });

  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    { status: 201 },
  );
}
