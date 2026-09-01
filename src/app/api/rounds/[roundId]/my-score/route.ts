import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roundId } = await context.params;
  const userId = session.user.id;

  const round = await db.round.findUnique({
    where: { id: roundId },
    select: { id: true, sequence: true, name: true, type: true, maxScore: true },
  });
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  // Fetch round score if already recorded
  const roundScore = await db.roundScore.findUnique({
    where: { userId_roundId: { userId, roundId } },
  });

  // Calculate live submissions status
  const existingSubmissions = await db.submission.findMany({
    where: { userId, roundId },
    select: { problemId: true, status: true, rawScore: true, finalScore: true },
  });

  const totalProblemsCount = await db.problem.count({ where: { roundId } });

  let rawScore = 0;
  let solvedCount = 0;

  if (round.type === "CODE_LOGIC") {
    const acceptedAnswers = existingSubmissions.filter((s) => s.status === "ACCEPTED");
    solvedCount = acceptedAnswers.length;
    rawScore = solvedCount * 10;
  } else {
    const bestProblemScores: Record<string, number> = {};
    for (const s of existingSubmissions) {
      const currentBest = bestProblemScores[s.problemId] ?? 0;
      const subScore = s.finalScore ?? s.rawScore ?? (s.status === "ACCEPTED" ? 100 : 0);
      if (subScore > currentBest) {
        bestProblemScores[s.problemId] = subScore;
      }
    }
    rawScore = Object.values(bestProblemScores).reduce((acc, v) => acc + v, 0);
    solvedCount = Object.values(bestProblemScores).filter((s) => s >= 100).length;
  }

  const aiScoreCap = roundScore?.aiScoreCap ?? 100;
  const finalScore = roundScore?.finalScore ?? Math.min(rawScore, aiScoreCap);
  const durationSeconds = roundScore?.durationSeconds ?? 0;

  return NextResponse.json({
    roundId,
    roundSequence: round.sequence,
    roundName: round.name,
    finalScore,
    rawScore,
    aiScoreCap,
    solvedCount,
    totalProblemsCount,
    durationSeconds,
    completedAt: roundScore?.completedAt ?? null,
  });
}
