import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { callAI, getLifetimeUsage } from "@/lib/ai-gateway";
import { applyAIPenalty } from "@/lib/scoring";
import { redisClient } from "@/lib/redis";

const schema = z.object({
  roundId: z.string(),
  type: z.enum(["EXPLAIN", "CODE"]),
  message: z.string().min(1).max(1000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { roundId, type, message } = parsed.data;
  const userId = session.user.id;

  const round = await db.round.findUnique({ where: { id: roundId } });
  if (round?.status !== "ACTIVE" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Round is not active" }, { status: 403 });
  }

  let result: { response: string; usage: { explainLeft: number; codeLeft: number } };
  try {
    result = await callAI(userId, roundId, type, message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI unavailable";
    const usage = await getLifetimeUsage(userId);
    return NextResponse.json(
      {
        error: msg,
        explainLeft: usage.explainLeft,
        codeLeft: usage.codeLeft,
      },
      { status: 429 }
    );
  }

  // Apply the AI penalty to the user's score cap for this round
  const newScore = await applyAIPenalty(userId, roundId, type);

  // Broadcast score change
  const eventId = round!.eventId;
  await redisClient.publish(
    `scores:${eventId}`,
    JSON.stringify({
      type: "AI_PENALTY",
      userId,
      roundId,
      newScore,
    })
  );

  return NextResponse.json({
    response: result.response,
    newScoreCap: newScore,
    explainLeft: result.usage.explainLeft,
    codeLeft: result.usage.codeLeft,
  });
}

// GET endpoint: fetch current AI usage counters for the user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usage = await getLifetimeUsage(session.user.id);
  return NextResponse.json(usage);
}
