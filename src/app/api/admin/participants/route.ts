import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const search = req.nextUrl.searchParams.get("q") ?? "";

  const rawUsers = await db.user.findMany({
    where: {
      role: "PARTICIPANT",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { college: { contains: search, mode: "insensitive" } },
              { teamMember: { team: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    include: {
      teamMember: {
        include: {
          team: { select: { id: true, name: true, status: true } },
        },
      },
      roundScores: {
        select: {
          roundId: true,
          finalScore: true,
          durationSeconds: true,
          completedAt: true,
          round: {
            select: {
              sequence: true,
              name: true,
              durationMin: true,
              startsAt: true,
            },
          },
        },
        orderBy: { round: { sequence: "asc" } },
      },
      aiUsages: { select: { type: true } },
      auditLogs: {
        where: { action: "INTEGRITY_VIOLATION" },
        select: { id: true, metadata: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      disqualification: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const participants = rawUsers.map((p) => {
    const totalScore = p.roundScores.reduce((acc, score) => acc + score.finalScore, 0);
    const aiChatCount = p.aiUsages.filter((u) => u.type === "EXPLAIN").length;
    const aiCodeCount = p.aiUsages.filter((u) => u.type === "CODE").length;

    const violations = p.auditLogs.map((log) => {
      const meta = (log.metadata as Record<string, unknown>) ?? {};
      return (meta.reason as string) || "Integrity Violation";
    });

    const violationCount = p.auditLogs.length;
    const hasCheated = violationCount > 0;

    const timeTakenList = p.roundScores.map((rs) => {
      let mins = 0;
      if (rs.durationSeconds) {
        mins = Math.max(1, Math.round(rs.durationSeconds / 60));
      } else if (rs.completedAt && rs.round.startsAt) {
        const diffMs = new Date(rs.completedAt).getTime() - new Date(rs.round.startsAt).getTime();
        mins = Math.max(1, Math.round(diffMs / 60000));
      } else if (rs.completedAt) {
        mins = Math.max(1, Math.round(rs.round.durationMin));
      } else {
        return `R${rs.round.sequence}-In Progress`;
      }
      return `R${rs.round.sequence}-${mins} mins`;
    });

    const timeTaken = timeTakenList.length > 0 ? timeTakenList.join(", ") : "—";
    const totalSecondsTaken = p.roundScores.reduce((acc, rs) => acc + (rs.durationSeconds ?? (rs.round.durationMin * 60)), 0);

    const isDisqualified = !!p.disqualification || p.teamMember?.team.status === "DISQUALIFIED";

    return {
      id: p.id,
      name: p.name ?? "Unnamed Participant",
      email: p.email,
      role: p.role,
      college: p.college ?? "NSDC College",
      department: "Computer Science",
      teamName: p.teamMember ? p.teamMember.team.name : "—",
      teamId: p.teamMember ? p.teamMember.team.id : null,
      aiChatCount,
      aiCodeCount,
      totalSubmissions: p._count.submissions,
      pointsEarned: parseFloat(totalScore.toFixed(1)),
      isDisqualified,
      hasCheated,
      violationCount,
      violationReasons: violations,
      timeTaken,
      totalSecondsTaken,
      completedRoundsCount: p.roundScores.length,
    };
  });

  return NextResponse.json({ participants, total: participants.length });
}
