import { NextRequest, NextResponse } from "next/server";
import { auth, requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROUND_QUESTION_POINTS } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const format = req.nextUrl.searchParams.get("format") || "csv";

  // Fetch all participant users with scores, teams, and AI usages
  const rawUsers = await db.user.findMany({
    where: {
      role: { notIn: ["ADMIN", "SUPER_ADMIN"] },
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
            },
          },
        },
        orderBy: { round: { sequence: "asc" } },
      },
      aiUsages: {
        select: {
          type: true,
          roundId: true,
        },
      },
      disqualification: true,
    },
    orderBy: { name: "asc" },
  });

  const participants = rawUsers.map((p) => {
    const totalRawScore = p.roundScores.reduce((acc, rs) => acc + rs.rawScore, 0);
    const totalFinalScore = p.roundScores.reduce((acc, rs) => acc + rs.finalScore, 0);

    const roundScoreMap: Record<number, number> = {};
    for (const rs of p.roundScores) {
      roundScoreMap[rs.round.sequence] = rs.finalScore;
    }

    const roundSeqMap = new Map<string, number>();
    for (const rs of p.roundScores) {
      roundSeqMap.set(rs.roundId, rs.round.sequence);
    }

    let aiChatCalls = 0;
    let aiCodeCalls = 0;
    let aiChatPenalty = 0;
    let aiCodePenalty = 0;

    for (const u of p.aiUsages) {
      const seq = roundSeqMap.get(u.roundId) ?? 1;
      const qPoints = ROUND_QUESTION_POINTS[seq] ?? 25;
      if (u.type === "EXPLAIN") {
        aiChatCalls += 1;
        aiChatPenalty += qPoints * 0.25;
      } else if (u.type === "CODE") {
        aiCodeCalls += 1;
        aiCodePenalty += qPoints * 0.50;
      }
    }

    const totalAIPenalty = aiChatPenalty + aiCodePenalty;
    const isDisqualified = !!p.disqualification || p.teamMember?.team.status === "DISQUALIFIED";

    return {
      id: p.id,
      name: p.name ?? "Unnamed Participant",
      email: p.email,
      college: p.college ?? "NSDC College",
      teamName: p.teamMember ? p.teamMember.team.name : "Individual",
      teamStatus: p.teamMember ? p.teamMember.team.status : "ACTIVE",
      r1Score: roundScoreMap[1] ?? 0,
      r2Score: roundScoreMap[2] ?? 0,
      r3Score: roundScoreMap[3] ?? 0,
      r4Score: roundScoreMap[4] ?? 0,
      r5Score: roundScoreMap[5] ?? 0,
      totalRawScore: parseFloat(totalRawScore.toFixed(2)),
      aiChatCalls,
      aiCodeCalls,
      totalAIPenalty: parseFloat(totalAIPenalty.toFixed(2)),
      finalPoints: parseFloat(totalFinalScore.toFixed(2)),
      isDisqualified: isDisqualified ? "YES" : "NO",
    };
  });

  // Sort descending by points earned
  participants.sort((a, b) => b.finalPoints - a.finalPoints);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (format === "json") {
    return new NextResponse(
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalParticipants: participants.length,
          standings: participants,
        },
        null,
        2
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="byteverse-backup-${timestamp}.json"`,
        },
      }
    );
  }

  // Format as CSV
  const headers = [
    "Rank",
    "Participant Name",
    "Email",
    "College",
    "Team Name",
    "R1 Score",
    "R2 Score",
    "R3 Score",
    "R4 Score",
    "R5 Score",
    "Total Raw Score",
    "AI Chat Calls",
    "AI Code Calls",
    "AI Penalty (pts)",
    "Final Points Earned",
    "Disqualified",
  ];

  const rows = participants.map((p, idx) => [
    idx + 1,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.email.replace(/"/g, '""')}"`,
    `"${p.college.replace(/"/g, '""')}"`,
    `"${p.teamName.replace(/"/g, '""')}"`,
    p.r1Score,
    p.r2Score,
    p.r3Score,
    p.r4Score,
    p.r5Score,
    p.totalRawScore,
    p.aiChatCalls,
    p.aiCodeCalls,
    p.totalAIPenalty,
    p.finalPoints,
    p.isDisqualified,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="byteverse-standings-backup-${timestamp}.csv"`,
    },
  });
}
