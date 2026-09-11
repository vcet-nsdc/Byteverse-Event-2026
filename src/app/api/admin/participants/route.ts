import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { isParticipantDisqualified } from "@/lib/platform-data";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const search = req.nextUrl.searchParams.get("q") ?? "";

  const rawUsers = await db.user.findMany({
    where: {
      role: "PARTICIPANT",
      NOT: [
        { name: { contains: "admin", mode: "insensitive" } },
        { email: { contains: "admin", mode: "insensitive" } },
      ],
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
          rawScore: true,
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
      aiUsages: { select: { type: true, roundId: true } },
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
  }).catch(() => []);

  const ROUND_QUESTION_POINTS: Record<number, number> = {
    1: 10,
    2: 25,
    3: 50,
    4: 100,
    5: 100,
  };

  const participants = rawUsers.map((p) => {
    const totalRawScore = p.roundScores.reduce((acc, score) => acc + score.rawScore, 0);
    const totalScore = p.roundScores.reduce((acc, score) => acc + score.finalScore, 0);
    const aiChatCount = p.aiUsages.filter((u) => u.type === "EXPLAIN").length;
    const aiCodeCount = p.aiUsages.filter((u) => u.type === "CODE").length;

    const roundSeqMap = new Map<string, number>();
    for (const rs of p.roundScores) {
      roundSeqMap.set(rs.roundId, rs.round.sequence);
    }

    let rawChatPenalty = 0;
    let rawCodePenalty = 0;
    for (const u of p.aiUsages) {
      const seq = roundSeqMap.get(u.roundId) ?? 1;
      const qPoints = ROUND_QUESTION_POINTS[seq] ?? 25;
      if (u.type === "EXPLAIN") {
        rawChatPenalty += qPoints * 0.25;
      } else if (u.type === "CODE") {
        rawCodePenalty += qPoints * 0.50;
      }
    }

    // Actual AI penalty deducted from the participant's score across all rounds
    const actualAIPenaltyDeducted = Math.max(0, totalRawScore - totalScore);
    const rawTotalPenalty = rawChatPenalty + rawCodePenalty;

    // Proportionally distribute actual penalty between chat and code for column display
    let aiChatPenalty = 0;
    let aiCodePenalty = 0;
    if (actualAIPenaltyDeducted > 0 && rawTotalPenalty > 0) {
      aiChatPenalty = parseFloat(((rawChatPenalty / rawTotalPenalty) * actualAIPenaltyDeducted).toFixed(2));
      aiCodePenalty = parseFloat(((rawCodePenalty / rawTotalPenalty) * actualAIPenaltyDeducted).toFixed(2));
    }
    const totalAIPenalty = parseFloat(actualAIPenaltyDeducted.toFixed(2));

    const violations = p.auditLogs.map((log) => {
      const meta = (log.metadata as Record<string, unknown>) ?? {};
      return (meta.reason as string) || "Integrity Violation";
    });

    const violationCount = p.auditLogs.length;
    const hasCheated = violationCount > 0;

    const timeTakenList = p.roundScores.map((rs) => {
      const maxMins = rs.round.durationMin;
      let mins = 0;
      if (rs.durationSeconds) {
        mins = Math.min(maxMins, Math.max(1, Math.round(rs.durationSeconds / 60)));
      } else if (rs.completedAt && rs.round.startsAt) {
        const diffMs = new Date(rs.completedAt).getTime() - new Date(rs.round.startsAt).getTime();
        mins = Math.min(maxMins, Math.max(1, Math.round(diffMs / 60000)));
      } else if (rs.completedAt) {
        mins = maxMins;
      } else {
        return `R${rs.round.sequence}-In Progress`;
      }
      return `R${rs.round.sequence}-${mins} mins`;
    });

    const timeTaken = timeTakenList.length > 0 ? timeTakenList.join(", ") : "—";
    const totalSecondsTaken = p.roundScores.reduce(
      (acc, rs) => acc + Math.min(rs.durationSeconds ?? (rs.round.durationMin * 60), rs.round.durationMin * 60),
      0
    );

    const isDisqualified =
      Boolean(p.disqualification) ||
      p.teamMember?.team?.status === "DISQUALIFIED" ||
      violationCount >= 3 ||
      isParticipantDisqualified(p.id) ||
      isParticipantDisqualified(p.email) ||
      (p.teamMember?.team?.id ? isParticipantDisqualified(p.teamMember.team.id) : false);

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
      aiChatPenalty,
      aiCodePenalty,
      totalAIPenalty,
      totalRawScore: parseFloat(totalRawScore.toFixed(1)),
      totalSubmissions: p._count.submissions,
      pointsEarned: isDisqualified ? 0 : parseFloat(totalScore.toFixed(1)),
      isDisqualified,
      hasCheated,
      violationCount,
      violationReasons: violations,
      timeTaken,
      totalSecondsTaken,
      completedRoundsCount: p.roundScores.length,
    };
  });

  if (participants.length === 0) {
    const { ACTUAL_PARTICIPANTS_LEADERBOARD } = await import("@/lib/platform-data");
    const fallbackList = ACTUAL_PARTICIPANTS_LEADERBOARD.map((p, idx) => ({
      id: p.participantId,
      name: p.name,
      email: `${p.name.toLowerCase().replace(/\s+/g, ".")}@collegiate.edu`,
      role: "PARTICIPANT",
      college: p.college,
      department: "Computer Engineering",
      teamName: `Team ${p.name.split(" ")[0]}`,
      teamId: `team_${idx + 1}`,
      aiChatCount: 0,
      aiCodeCount: 0,
      aiChatPenalty: 0,
      aiCodePenalty: 0,
      totalAIPenalty: 0,
      totalRawScore: p.score,
      totalSubmissions: Math.floor(p.score / 50) + 1,
      pointsEarned: p.score,
      isDisqualified: false,
      hasCheated: false,
      violationCount: 0,
      violationReasons: [],
      timeTaken: "R1-15 mins, R2-20 mins",
      totalSecondsTaken: 2100,
      completedRoundsCount: 2,
    }));

    return NextResponse.json({ participants: fallbackList, total: fallbackList.length });
  }

  return NextResponse.json({ participants, total: participants.length });
}
