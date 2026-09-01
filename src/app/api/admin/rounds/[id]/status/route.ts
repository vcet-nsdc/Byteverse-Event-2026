import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAction } from "@/lib/audit";
import { redisClient } from "@/lib/redis";

export const dynamic = "force-dynamic";

const schema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "ACTIVE", "PAUSED", "ENDED"]),
  durationMin: z.number().int().min(1).max(480).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { status, durationMin } = parsed.data;
  const now = new Date();

  const existing = await db.round.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const dur = durationMin ?? existing.durationMin;
  const startsAt = status === "ACTIVE"
    ? now
    : (status === "DRAFT" || status === "SCHEDULED")
    ? null
    : existing.startsAt;

  const endsAt = status === "ACTIVE"
    ? new Date(now.getTime() + dur * 60 * 1000)
    : status === "ENDED"
    ? now
    : (status === "DRAFT" || status === "SCHEDULED")
    ? null
    : existing.endsAt;

  const round = await db.round.update({
    where: { id },
    data: {
      status,
      durationMin: dur,
      startsAt,
      endsAt,
      updatedAt: now,
    },
  });

  if (session?.user?.id) {
    try {
      await logAction(session.user.id, "ROUND_STATUS_CHANGE", id, { status, durationMin: dur });
    } catch {
      // ignore
    }
  }

  try {
    await redisClient.publish(
      "admin",
      JSON.stringify({ type: "ROUND_STATUS", roundId: id, status, endsAt: endsAt?.toISOString() })
    );
  } catch {
    // ignore
  }

  return NextResponse.json(round);
}
