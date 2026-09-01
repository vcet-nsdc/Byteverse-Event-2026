import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roundId } = await context.params;
  const userId = session.user.id;

  let body: { timeSpentSeconds?: number } = {};
  try {
    body = await req.json();
  } catch {
    // optional body
  }

  const round = await db.round.findUnique({
    where: { id: roundId },
    select: { id: true, name: true, type: true, sequence: true, durationMin: true, startsAt: true, eventId: true },
  });

  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  // Calculate actual duration in seconds
  let durationSeconds = body.timeSpentSeconds;
  if (durationSeconds === undefined || durationSeconds === null) {
    if (round.startsAt) {
      durationSeconds = Math.max(0, Math.round((Date.now() - new Date(round.startsAt).getTime()) / 1000));
    } else {
      durationSeconds = 0;
    }
  }

  // Cap at round duration + 60s buffer
  const maxDurationSeconds = round.durationMin * 60;
  const finalDuration = Math.min(Math.max(0, Math.round(durationSeconds)), maxDurationSeconds);

  // Calculate participant's score for this round
  const existingSubmissions = await db.submission.findMany({
    where: { userId, roundId },
    select: { problemId: true, status: true, rawScore: true, finalScore: true },
  });

  const totalProblemsCount = await db.problem.count({ where: { roundId } });

  let rawScore = 0;
  let solvedCount = 0;

  if (round.type === "CODE_LOGIC") {
    // MCQ round: 10 points per accepted answer
    const acceptedAnswers = existingSubmissions.filter((s) => s.status === "ACCEPTED");
    solvedCount = acceptedAnswers.length;
    rawScore = solvedCount * 10;
  } else {
    // Coding rounds: Best score per unique problem
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

  const existingScoreRecord = await db.roundScore.findUnique({
    where: { userId_roundId: { userId, roundId } },
  });
  const aiScoreCap = existingScoreRecord?.aiScoreCap ?? 100;
  const finalScore = Math.min(rawScore, aiScoreCap);

  // Upsert RoundScore with calculated score and durationSeconds
  const roundScore = await db.roundScore.upsert({
    where: {
      userId_roundId: { userId, roundId },
    },
    update: {
      rawScore,
      finalScore,
      completedAt: new Date(),
      durationSeconds: finalDuration,
    },
    create: {
      userId,
      roundId,
      rawScore,
      finalScore,
      aiScoreCap,
      completedAt: new Date(),
      durationSeconds: finalDuration,
    },
  });

  // Recalculate team score if user belongs to a team
  const member = await db.teamMember.findUnique({
    where: { userId },
    select: { teamId: true },
  });
  if (member?.teamId) {
    try {
      const event = await db.event.findFirst({ select: { missingMemberPolicy: true } });
      const { calculateTeamScore } = await import("@/lib/scoring");
      await calculateTeamScore(member.teamId, roundId, event?.missingMemberPolicy);
    } catch {
      // ignore
    }
  }

  // Also publish live audit log
  await db.auditLog.create({
    data: {
      userId,
      action: "ROUND_FINALIZED_EARLY",
      target: roundId,
      metadata: {
        userId,
        roundId,
        roundSequence: round.sequence,
        roundName: round.name,
        timeTakenSeconds: finalDuration,
        timeTakenMinutes: parseFloat((finalDuration / 60).toFixed(1)),
        finalScore,
        solvedCount,
        totalProblemsCount,
        timestamp: new Date().toISOString(),
      },
    },
  });

  // Notify redis
  await redisClient.publish(
    `admin:alerts:${round.eventId}`,
    JSON.stringify({
      type: "ROUND_COMPLETED",
      userId,
      roundId,
      roundSequence: round.sequence,
      durationSeconds: finalDuration,
      finalScore,
      timestamp: new Date().toISOString(),
    })
  );

  return NextResponse.json({
    success: true,
    message: `Round ${round.sequence} completed`,
    durationSeconds: finalDuration,
    durationMinutes: parseFloat((finalDuration / 60).toFixed(1)),
    finalScore,
    rawScore,
    solvedCount,
    totalProblemsCount,
    roundScore,
  });
}
