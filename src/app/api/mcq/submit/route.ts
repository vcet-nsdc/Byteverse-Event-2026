import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateRoundScore } from "@/lib/scoring";

const mcqSchema = z.object({
  problemId: z.string(),
  roundId: z.string(),
  selectedOption: z.enum(["A", "B", "C", "D"]),
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

  const parsed = mcqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { problemId, roundId, selectedOption } = parsed.data;
  const userId = session.user.id;

  const problem = await db.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const isCorrect = problem.correctOption?.toUpperCase() === selectedOption.toUpperCase();
  const rawScore = isCorrect ? 10 : 0;

  // Check if a submission already exists for this problem by this user
  const existingSub = await db.submission.findFirst({
    where: {
      userId,
      problemId,
      roundId,
    },
  });

  if (existingSub) {
    await db.submission.update({
      where: { id: existingSub.id },
      data: {
        sourceCode: `Option Selected: ${selectedOption}`,
        rawScore,
        finalScore: rawScore,
        status: isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
      },
    });
  } else {
    await db.submission.create({
      data: {
        userId,
        problemId,
        roundId,
        language: "mcq",
        sourceCode: `Option Selected: ${selectedOption}`,
        rawScore,
        finalScore: rawScore,
        aiScoreCap: 100,
        status: isCorrect ? "ACCEPTED" : "WRONG_ANSWER",
        idempotencyKey: crypto.randomUUID(),
      },
    });
  }

  // Recalculate total score for this round for the user, respecting question-level AI penalties
  await updateRoundScore(userId, roundId);

  return NextResponse.json({
    success: true,
    saved: true,
    message: "Answer recorded successfully",
  });
}
