import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
      roundScores: { select: { finalScore: true } },
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
      isDisqualified: !!p.disqualification,
      hasCheated,
      violationCount,
      violationReasons: violations,
    };
  });

  return NextResponse.json({ participants, total: participants.length });
}
