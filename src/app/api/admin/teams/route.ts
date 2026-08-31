import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

// GET /api/admin/teams — list all teams with exact tournament statistics and cheat flags
export async function GET(req: NextRequest) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const rawTeams = await db.team.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { members: { some: { user: { name: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : undefined,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              roundScores: { select: { finalScore: true } },
              aiUsages: { select: { type: true } },
              auditLogs: {
                where: { action: "INTEGRITY_VIOLATION" },
                select: { id: true, metadata: true, createdAt: true },
              },
              _count: { select: { submissions: true } },
            },
          },
        },
      },
      teamScores: { select: { avgScore: true } },
      disqualification: { select: { reason: true, disqualifiedAt: true } },
    },
    orderBy: { name: "asc" },
  });

  const teams = rawTeams.map((t) => {
    let aiChatCount = 0;
    let aiCodeCount = 0;
    let submissionsCount = 0;
    let memberScoresSum = 0;
    let totalViolations = 0;
    const violationList: { memberName: string; reason: string }[] = [];

    for (const m of t.members) {
      const u = m.user;
      submissionsCount += u._count.submissions;
      for (const ai of u.aiUsages) {
        if (ai.type === "EXPLAIN") aiChatCount++;
        if (ai.type === "CODE") aiCodeCount++;
      }
      for (const rs of u.roundScores) {
        memberScoresSum += rs.finalScore;
      }
      for (const log of u.auditLogs) {
        totalViolations++;
        const meta = (log.metadata as Record<string, unknown>) ?? {};
        violationList.push({
          memberName: u.name || u.email,
          reason: (meta.reason as string) || "Integrity Violation",
        });
      }
    }

    const teamScore =
      t.teamScores.length > 0
        ? t.teamScores.reduce((acc, s) => acc + s.avgScore, 0)
        : t.members.length > 0
        ? memberScoresSum / t.members.length
        : 0;

    const hasCheated = totalViolations > 0;

    return {
      id: t.id,
      name: t.name,
      inviteCode: t.inviteCode,
      status: t.status,
      isLocked: t.isLocked,
      memberCount: t.members.length,
      members: t.members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        isLeader: m.isLeader,
        violationCount: m.user.auditLogs.length,
      })),
      aiChatCount,
      aiCodeCount,
      submissionsCount,
      teamScore: parseFloat(teamScore.toFixed(1)),
      disqualification: t.disqualification,
      hasCheated,
      violationCount: totalViolations,
      violationDetails: violationList,
    };
  });

  return NextResponse.json(teams);
}
