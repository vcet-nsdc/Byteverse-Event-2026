import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty");
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const status = searchParams.get("status"); // "all", "solved", "unsolved"
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));
  const skip = (page - 1) * limit;

  const where: any = {
    isPublished: true,
  };

  if (difficulty && difficulty !== "All") {
    where.difficulty = { equals: difficulty, mode: "insensitive" };
  }

  if (tag && tag !== "All") {
    where.tags = { has: tag };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { statement: { contains: search, mode: "insensitive" } },
    ];
  }

  // Fetch candidate problems
  const [totalProblems, problems] = await Promise.all([
    db.problem.count({ where }),
    db.problem.findMany({
      where,
      select: {
        id: true,
        title: true,
        difficulty: true,
        tags: true,
        timeLimitMs: true,
        memoryLimitMb: true,
        createdAt: true,
        submissions: {
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  // Compute acceptance rates and user solved status
  let processed = problems.map((p) => {
    const totalSubs = p.submissions.length;
    const acceptedSubs = p.submissions.filter((s) => s.status === "ACCEPTED").length;
    const acceptanceRate =
      totalSubs > 0 ? `${((acceptedSubs / totalSubs) * 100).toFixed(1)}%` : "N/A";
    const isSolved = userId ? p.submissions.some((s) => s.userId === userId && s.status === "ACCEPTED") : false;

    return {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty || "Easy",
      tags: p.tags || [],
      acceptanceRate,
      isSolved,
      totalSubmissions: totalSubs,
    };
  });

  if (status === "solved") {
    processed = processed.filter((p) => p.isSolved);
  } else if (status === "unsolved") {
    processed = processed.filter((p) => !p.isSolved);
  }

  // Also collect available distinct tags
  const allTags = ["Arrays", "Two Pointers", "Hash Table", "Binary Search", "Sliding Window", "Dynamic Programming", "Stack", "String", "Math"];

  return NextResponse.json({
    problems: processed,
    total: totalProblems,
    page,
    limit,
    totalPages: Math.ceil(totalProblems / limit),
    tags: allTags,
  });
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
