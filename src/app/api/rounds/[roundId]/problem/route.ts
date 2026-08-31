import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roundId } = await params;

  const round = await db.round.findUnique({ where: { id: roundId } });
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const membership = await db.teamMember.findUnique({
    where: { userId: session.user.id },
  });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  if (!membership && !isAdmin && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  // Determine whether this participant is Leader (Set A) or Member (Set B)
  const isLeader = membership ? membership.isLeader : true;
  const targetSet = isLeader ? "A" : "B";

  // Fetch all problems in this round for the participant's assigned set
  let problems = await db.problem.findMany({
    where: { roundId, set: targetSet, isPublished: true },
    orderBy: { sequence: "asc" },
  });

  // Fallback to any published problems if set is empty
  if (problems.length === 0) {
    problems = await db.problem.findMany({
      where: { roundId, set: targetSet },
      orderBy: { sequence: "asc" },
    });
  }

  // Fallback to all problems in this round if still empty
  if (problems.length === 0) {
    problems = await db.problem.findMany({
      where: { roundId },
      orderBy: { sequence: "asc" },
    });
  }

  // Fetch participant's existing submissions for this round
  const existingSubmissions = await db.submission.findMany({
    where: { userId: session.user.id, roundId },
    select: { problemId: true, sourceCode: true, status: true },
  });

  const answersMap: Record<string, string> = {};
  for (const s of existingSubmissions) {
    const match = s.sourceCode.match(/Option Selected:\s*([A-D])/i);
    if (match) {
      answersMap[s.problemId] = match[1].toUpperCase();
    }
  }

  return NextResponse.json({
    isLeader,
    targetSet,
    problems: problems.map((p) => ({
      id: p.id,
      sequence: p.sequence,
      title: p.title,
      statement: p.statement,
      difficulty: p.difficulty,
      constraints: p.constraints,
      sampleInput: p.sampleInput,
      sampleOutput: p.sampleOutput,
      inputFormat: p.inputFormat,
      outputFormat: p.outputFormat,
      timeLimitMs: p.timeLimitMs,
      memoryLimitMb: p.memoryLimitMb,
      allowedLangs: p.allowedLangs,
      set: p.set,
      starterCodes: p.starterCodes,
      options: p.options,
    })),
    answers: answersMap,
  });
}
