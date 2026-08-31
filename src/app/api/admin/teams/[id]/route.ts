import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAction } from "@/lib/audit";
import { redisClient } from "@/lib/redis";


// PATCH /api/admin/teams/[id] — update status (ACTIVE/LOCKED/DISQUALIFIED/PENDING)
// DELETE /api/admin/teams/[id] — soft-delete (set DISQUALIFIED + isLocked)
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

  // If disqualifying, create a Disqualification record
  if (status === "DISQUALIFIED" && reason) {
    await db.disqualification.upsert({
      where: { teamId: id },
      create: {
        teamId: id,
        reason: reason,
        disqualifiedBy: session.user.id!,
      },
      update: {
        reason: reason,
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

  return NextResponse.json({ id: team.id, status: team.status, isLocked: team.isLocked });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.team.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Soft delete: disqualify + lock
  await db.team.update({
    where: { id },
    data: { status: "DISQUALIFIED", isLocked: true, updatedAt: new Date() },
  });

  await db.disqualification.upsert({
    where: { teamId: id },
    create: { teamId: id, reason: "Deleted by admin", disqualifiedBy: session.user.id! },
    update: { reason: "Deleted by admin", disqualifiedBy: session.user.id! },
  });

  await logAction(session.user.id!, "TEAM_DELETED", id, {});

  return NextResponse.json({ success: true });
}
