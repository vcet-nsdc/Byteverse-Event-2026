import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const ROUND_QUESTION_POINTS: Record<number, number> = {
  1: 10,
  2: 25,
  3: 50,
  4: 100,
  5: 100,
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function backup() {
  console.log("📦 Creating ByteVerse 2026 Standings Backup...");

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

  participants.sort((a, b) => b.finalPoints - a.finalPoints);

  const backupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const jsonPath = path.join(backupsDir, `standings-${timestamp}.json`);
  const csvPath = path.join(backupsDir, `standings-${timestamp}.csv`);

  // Write JSON
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        totalParticipants: participants.length,
        participants,
      },
      null,
      2
    )
  );

  // Write CSV
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
  fs.writeFileSync(csvPath, csvContent, "utf-8");

  console.log(`✅ Backup successfully saved!`);
  console.log(`📄 JSON: ${jsonPath}`);
  console.log(`📊 CSV:  ${csvPath}`);
  console.log(`👥 Total Participants: ${participants.length}`);

  await db.$disconnect();
  await pool.end();
}

backup().catch((err) => {
  console.error("❌ Backup failed:", err);
  process.exit(1);
});
