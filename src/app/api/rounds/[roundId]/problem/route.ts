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

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  // Strict Protection: No participant can fetch problems before the round is officially ACTIVE or PAUSED
  if (!isAdmin && round.status !== "ACTIVE" && round.status !== "PAUSED") {
    return NextResponse.json(
      { error: "This round has not started yet. Please wait in the holding area." },
      { status: 403 }
    );
  }

  const membership = await db.teamMember.findUnique({
    where: { userId: session.user.id },
  });

  if (!membership && !isAdmin && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not a team member" }, { status: 403 });
  }

  // Determine whether this participant is Leader (Set A) or Member (Set B)
  const isLeader = membership ? membership.isLeader : true;
  const targetSet = isLeader ? "A" : "B";

  // ─── ROUND 5 SPECIAL HANDLING (HUMAN VS MACHINE) ──────────────────────────
  if (round.sequence === 5 || round.type === "HUMAN_VS_MACHINE") {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { round5ProblemId: true },
    });
    const team = membership?.teamId
      ? await db.team.findUnique({
          where: { id: membership.teamId },
          select: { round5ProblemId: true },
        })
      : null;

    const selectedProblemId = user?.round5ProblemId || team?.round5ProblemId;

    if (!selectedProblemId) {
      // Participant has not picked their question yet: return 3 choices
      const problems = await db.problem.findMany({
        where: { roundId, isPublished: true },
        include: {
          testCases: { select: { isHidden: true, isEdgeCase: true } },
        },
        orderBy: { sequence: "asc" },
        take: 3,
      });

      return NextResponse.json({
        isRound5: true,
        hasSelected: false,
        isLeader,
        problems: problems.map((p) => {
          const sampleCount = p.testCases.filter((tc) => !tc.isHidden && !tc.isEdgeCase).length;
          const hiddenCount = p.testCases.filter((tc) => tc.isHidden && !tc.isEdgeCase).length;
          const edgeCount = p.testCases.filter((tc) => tc.isEdgeCase).length;
          return {
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
            starterCodes: p.starterCodes,
            sampleCount,
            hiddenCount,
            edgeCount,
            aiAnalysisReport: p.aiAnalysisReport,
          };
        }),
      });
    }

    // Participant has already selected their problem
    const problem = await db.problem.findFirst({
      where: { id: selectedProblemId, roundId },
      include: {
        testCases: { select: { isHidden: true, isEdgeCase: true } },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Selected problem could not be found" }, { status: 404 });
    }

    const sampleCount = problem.testCases.filter((tc) => !tc.isHidden && !tc.isEdgeCase).length;
    const hiddenCount = problem.testCases.filter((tc) => tc.isHidden && !tc.isEdgeCase).length;
    const edgeCount = problem.testCases.filter((tc) => tc.isEdgeCase).length;

    // Fetch submissions for this problem to determine remaining runs and lock status
    const submissions = await db.submission.findMany({
      where: { userId: session.user.id, problemId: selectedProblemId },
      orderBy: { submittedAt: "desc" },
    });

    const analysisRunsUsed = submissions.length;
    const analysisRunsRemaining = Math.max(0, 10 - analysisRunsUsed);
    const isLocked = submissions.some((s) => s.isFinal);
    const latestReport = submissions[0]?.analysisReport ?? null;

    return NextResponse.json({
      isRound5: true,
      hasSelected: true,
      selectedProblemId,
      analysisRunsUsed,
      analysisRunsRemaining,
      isLocked,
      latestReport,
      isLeader,
      problems: [
        {
          id: problem.id,
          sequence: problem.sequence,
          title: problem.title,
          statement: problem.statement,
          difficulty: problem.difficulty,
          constraints: problem.constraints,
          sampleInput: problem.sampleInput,
          sampleOutput: problem.sampleOutput,
          inputFormat: problem.inputFormat,
          outputFormat: problem.outputFormat,
          timeLimitMs: problem.timeLimitMs,
          memoryLimitMb: problem.memoryLimitMb,
          allowedLangs: problem.allowedLangs,
          starterCodes: problem.starterCodes,
          sampleCount,
          hiddenCount,
          edgeCount,
          aiAnalysisReport: problem.aiAnalysisReport,
        },
      ],
    });
  }

  // ─── ROUNDS 1 - 4 STANDARD HANDLING ──────────────────────────────────────
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
    isRound5: false,
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
