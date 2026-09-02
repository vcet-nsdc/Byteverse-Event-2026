import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { redisClient } from "@/lib/redis";


// PATCH /api/admin/teams/[id] — update status (ACTIVE/LOCKED/DISQUALIFIED/PENDING)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status, isLocked, reason } = body as {
    status?: string;
    isLocked?: boolean;
    reason?: string;
  };

  const existing = await db.team.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (status !== undefined) updateData.status = status;
  if (isLocked !== undefined) updateData.isLocked = isLocked;

  // If re-qualifying (setting to ACTIVE), remove disqualification record
  if (status === "ACTIVE") {
    await db.disqualification.deleteMany({ where: { teamId: id } });
  }

  // If disqualifying, create/update a Disqualification record
  if (status === "DISQUALIFIED") {
    await db.disqualification.upsert({
      where: { teamId: id },
      create: {
        teamId: id,
        reason: reason || "Disqualified by tournament administrator",
        disqualifiedBy: session.user.id!,
      },
      update: {
        reason: reason || "Disqualified by tournament administrator",
        disqualifiedBy: session.user.id!,
      },
    });
  }

  const team = await db.team.update({
    where: { id },
    data: updateData,
  });

  await logAction(session.user.id!, "TEAM_STATUS_CHANGE", id, { status, isLocked, reason });
  await redisClient.publish("admin", JSON.stringify({ type: "TEAM_STATUS", teamId: id, status, isLocked }));
  await redisClient.publish("round", JSON.stringify({ type: "TEAM_STATUS", teamId: id, status, isLocked }));

  return NextResponse.json({ id: team.id, status: team.status, isLocked: team.isLocked });
}

// DELETE /api/admin/teams/[id] — COMPLETE WIPE of team & its participant data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const team = await db.team.findUnique({
    where: { id },
    include: { members: { select: { userId: true } } },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const userIds = team.members.map((m) => m.userId);

  // Complete transactional wipe
  await db.$transaction(async (tx) => {
    if (userIds.length > 0) {
      await tx.submission.deleteMany({ where: { userId: { in: userIds } } });
      await tx.roundScore.deleteMany({ where: { userId: { in: userIds } } });
      await tx.aIUsage.deleteMany({ where: { userId: { in: userIds } } });
      await tx.auditLog.deleteMany({ where: { userId: { in: userIds } } });
      await tx.disqualification.deleteMany({ where: { userId: { in: userIds } } });
    }

    await tx.disqualification.deleteMany({ where: { teamId: id } });
    await tx.teamScore.deleteMany({ where: { teamId: id } });
    await tx.teamMember.deleteMany({ where: { teamId: id } });

    if (userIds.length > 0) {
      await tx.user.deleteMany({
        where: { id: { in: userIds }, role: "PARTICIPANT" },
      });
    }

    await tx.team.delete({ where: { id } });
  });

  await logAction(session.user.id!, "TEAM_WIPED_DELETED", id, { teamName: team.name });
  await redisClient.publish("admin", JSON.stringify({ type: "TEAM_DELETED", teamId: id }));
  await redisClient.publish("round", JSON.stringify({ type: "TEAM_DELETED", teamId: id }));

  return NextResponse.json({ success: true, message: "Team and all participant data wiped successfully." });
}
