import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { redisClient } from "@/lib/redis";

const extendSchema = z.object({
  extensionMinutes: z.number().int().min(1).max(180),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = extendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { extensionMinutes } = parsed.data;
  const round = await db.round.findUnique({ where: { id } });
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const now = new Date();
  const currentEndsAt = round.endsAt && round.endsAt > now ? round.endsAt : now;
  const newEndsAt = new Date(currentEndsAt.getTime() + extensionMinutes * 60 * 1000);
  const newDuration = round.durationMin + extensionMinutes;

  const updatedRound = await db.round.update({
    where: { id },
    data: {
      endsAt: newEndsAt,
      durationMin: newDuration,
      updatedAt: now,
    },
  });

  await logAction(session.user.id!, "ROUND_TIME_EXTENDED", id, {
    extensionMinutes,
    newEndsAt: newEndsAt.toISOString(),
    newDuration,
  });

  // Broadcast to Redis channel so all live participant SSE streams receive the extended timer instantly
  await redisClient.publish(
    "admin",
    JSON.stringify({
      type: "ROUND_STATUS",
      roundId: id,
      status: updatedRound.status,
      endsAt: newEndsAt.toISOString(),
    })
  );

  return NextResponse.json({
    message: `Round extended by ${extensionMinutes} minutes successfully`,
    round: updatedRound,
  });
}
