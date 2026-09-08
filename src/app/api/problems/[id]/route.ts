import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  const problem = await db.problem.findUnique({
    where: { id },
    include: {
      testCases: {
        where: { isHidden: false },
        select: {
          id: true,
          input: true,
          expected: true,
          sequence: true,
        },
        orderBy: { sequence: "asc" },
      },
      _count: {
        select: {
          testCases: true,
          submissions: true,
        },
      },
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  // Check if user solved this problem
  let isSolved = false;
  let userSubmissions: any[] = [];
  if (session?.user?.id) {
    const subs = await db.submission.findMany({
      where: { problemId: id, userId: session.user.id },
      select: {
        id: true,
        status: true,
        language: true,
        rawScore: true,
        finalScore: true,
        executionTimeMs: true,
        memoryUsedMb: true,
        submittedAt: true,
        sourceCode: true,
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    });
    userSubmissions = subs;
    isSolved = subs.some((s) => s.status === "ACCEPTED");
  }

  return NextResponse.json({
    id: problem.id,
    title: problem.title,
    statement: problem.statement,
    inputFormat: problem.inputFormat,
    outputFormat: problem.outputFormat,
    constraints: problem.constraints,
    sampleInput: problem.sampleInput,
    sampleOutput: problem.sampleOutput,
    difficulty: problem.difficulty || "Easy",
    tags: problem.tags || [],
    timeLimitMs: problem.timeLimitMs,
    memoryLimitMb: problem.memoryLimitMb,
    allowedLangs: problem.allowedLangs,
    starterCodes: problem.starterCodes,
    sampleTestCases: problem.testCases,
    totalTestCasesCount: problem._count.testCases,
    isSolved,
    userSubmissions,
  });
}
