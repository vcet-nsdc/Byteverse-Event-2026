import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const testCaseSchema = z.object({
  input: z.string().default(""),
  expected: z.string().default(""),
  isHidden: z.boolean().default(false),
  score: z.number().int().default(10),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  statement: z.string().min(1),
  constraints: z.string().optional().default(""),
  sampleInput: z.string().optional().default(""),
  sampleOutput: z.string().optional().default(""),
  inputFormat: z.string().optional().default(""),
  outputFormat: z.string().optional().default(""),
  timeLimitMs: z.number().int().min(500).max(10000).default(2000),
  memoryLimitMb: z.number().int().min(32).max(512).default(256),
  allowedLangs: z.array(z.string()).default(["cpp", "c", "java", "python"]),
  isPublished: z.boolean().default(true),
  aiBaselineSolution: z.string().optional(),
  set: z.enum(["A", "B"]).default("A"),
  starterCodes: z.any().optional(),
  options: z.any().optional(),
  correctOption: z.string().optional(),
  testCases: z.array(testCaseSchema).optional().default([]),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { id } = await params;
  const problems = await db.problem.findMany({
    where: { roundId: id },
    include: {
      testCases: {
        orderBy: { sequence: "asc" },
      },
      _count: { select: { submissions: true } },
    },
    orderBy: [{ set: "asc" }, { sequence: "asc" }],
  });

  return NextResponse.json(problems);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { testCases, ...problemData } = parsed.data;

  const count = await db.problem.count({
    where: { roundId: id, set: problemData.set },
  });

  const problem = await db.problem.create({
    data: {
      ...problemData,
      roundId: id,
      sequence: count + 1,
      testCases: {
        create: testCases.map((tc, idx) => ({
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          score: tc.score,
          sequence: idx + 1,
        })),
      },
    },
    include: {
      testCases: true,
    },
  });

  return NextResponse.json(problem, { status: 201 });
}
