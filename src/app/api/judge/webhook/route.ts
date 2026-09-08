import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapJudgeStatus } from "@/lib/judge";
import { updateRoundScore } from "@/lib/scoring";
import { redisClient } from "@/lib/redis";

export async function PUT(req: NextRequest) {
  const secret = process.env.JUDGE0_WEBHOOK_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!secret || !authHeader || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { token, status, time, memory } = body;

  const submission = await db.submission.findFirst({
    where: { judgeToken: token },
    include: { problem: { include: { testCases: true, round: { include: { event: true } } } } },
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

  const mappedStatus = mapJudgeStatus(status.id);
  const accepted = mappedStatus === "ACCEPTED";

  const testCases = submission.problem.testCases;
  const passedCount = accepted ? testCases.length : 0;
  const rawScore = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 0;

  const finalScore = await db.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submission.id },
      data: {
        status: mappedStatus as never,
        rawScore,
        executionTimeMs: time ? Math.round(parseFloat(time) * 1000) : null,
        memoryUsedMb: memory ? memory / 1024 : null,
        judgedAt: new Date(),
      },
    });

    if (submission.roundId) {
      return updateRoundScore(submission.userId, submission.roundId);
    }
    return rawScore;
  });

  const eventId = submission.problem?.round?.eventId || (process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026");
  if (submission.roundId) {
    await redisClient.publish(
      `scores:${eventId}`,
      JSON.stringify({
        type: "SCORE_UPDATE",
        userId: submission.userId,
        roundId: submission.roundId,
        finalScore,
        submissionId: submission.id,
        status: mappedStatus,
      })
    );
  }

  return NextResponse.json({ ok: true });
}
