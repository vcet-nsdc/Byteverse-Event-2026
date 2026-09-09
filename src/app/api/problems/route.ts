import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { getPlatformProblems } from "@/lib/platform-data";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));

  const data = await getPlatformProblems({
    difficulty,
    tag,
    search,
    status,
    page,
    limit,
    userId,
  });

  return NextResponse.json(data);
}

const createProblemSchema = z.object({
  title: z.string().min(1),
  statement: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Easy"),
  tags: z.array(z.string()).default([]),
  inputFormat: z.string().optional(),
  outputFormat: z.string().optional(),
  constraints: z.string().optional(),
  sampleInput: z.string().optional(),
  sampleOutput: z.string().optional(),
  starterCodes: z.record(z.string(), z.string()).optional(),
  timeLimitMs: z.number().default(2000),
  memoryLimitMb: z.number().default(256),
  allowedLangs: z.array(z.string()).default(["cpp", "c", "java", "python"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createProblemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const problem = await db.problem.create({
    data: {
      ...parsed.data,
      isPublished: true,
    },
  });

  return NextResponse.json(problem, { status: 201 });
}
