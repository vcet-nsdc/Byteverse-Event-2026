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
    select: { id: true, name: true, sequence: true, durationMin: true, startsAt: true, eventId: true },
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

  // Upsert RoundScore with completedAt and durationSeconds
  const roundScore = await db.roundScore.upsert({
    where: {
      userId_roundId: { userId, roundId },
    },
    update: {
      completedAt: new Date(),
      durationSeconds: finalDuration,
    },
    create: {
      userId,
      roundId,
      completedAt: new Date(),
      durationSeconds: finalDuration,
    },
  });

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
      timestamp: new Date().toISOString(),
    })
  );

  return NextResponse.json({
    success: true,
    message: `Round ${round.sequence} completed`,
    durationSeconds: finalDuration,
    durationMinutes: parseFloat((finalDuration / 60).toFixed(1)),
    roundScore,
  });
}
