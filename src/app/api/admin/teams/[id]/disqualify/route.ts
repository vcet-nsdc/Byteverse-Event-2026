import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAction } from "@/lib/audit";

const schema = z.object({ reason: z.string().min(5).max(500) });

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
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  await db.$transaction(async (tx) => {
    await tx.team.update({ where: { id }, data: { status: "DISQUALIFIED" } });
    await tx.disqualification.upsert({
      where: { teamId: id },
      update: { reason: parsed.data.reason, disqualifiedBy: session.user!.id, disqualifiedAt: new Date() },
      create: { teamId: id, reason: parsed.data.reason, disqualifiedBy: session.user!.id },
    });
  });

  await logAction(session.user!.id, "TEAM_DISQUALIFY", id, { reason: parsed.data.reason });
  return NextResponse.json({ ok: true });
}
