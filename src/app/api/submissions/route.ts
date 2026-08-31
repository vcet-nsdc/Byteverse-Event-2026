import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis";
import { submitToJudge } from "@/lib/judge";

const schema = z.object({
  problemId: z.string(),
  roundId: z.string(),
  language: z.string(),
  sourceCode: z.string().min(1).max(65536),
  idempotencyKey: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { problemId, roundId, language, sourceCode, idempotencyKey } = parsed.data;
  const userId = session.user.id;

  const existing = await db.submission.findUnique({ where: { idempotencyKey } });
  if (existing) return NextResponse.json({ submissionId: existing.id, cached: true });

  const problem = await db.problem.findUnique({
    where: { id: problemId },
    include: { testCases: true },
  });
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  if (!problem.allowedLangs.includes(language)) {
    return NextResponse.json({ error: "Language not allowed" }, { status: 400 });
  }

  const round = await db.round.findUnique({ where: { id: roundId }, include: { event: true } });
  if (round?.status !== "ACTIVE" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Round is not active" }, { status: 403 });
  }

  // Submit directly to Judge0 sandbox
  try {
    const judgeToken = await submitToJudge(
      sourceCode,
      language,
      undefined,
      undefined,
      problem.timeLimitMs,
      problem.memoryLimitMb
    );

    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        roundId,
        language,
        sourceCode,
        idempotencyKey,
        judgeToken,
        aiScoreCap: 100,
      },
    });

    try {
      await redisClient.publish("submissions", JSON.stringify({ submissionId: submission.id, judgeToken }));
    } catch {
      // ignore redis publish if local testing
    }

    return NextResponse.json({ submissionId: submission.id, status: "QUEUED" }, { status: 202 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Judge0 Submission Error]:", errMsg);
    return NextResponse.json(
      {
        error: "Judge0 execution engine is unreachable. Please verify JUDGE0_URL and API Key in .env.",
        details: errMsg,
      },
      { status: 503 }
    );
  }
}
