import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redisClient, CACHE_KEYS } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const cacheKey = CACHE_KEYS.leaderboardIndividual(eventId);
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": "public, max-age=5" },
    });
  }

  // Filter users by role and event round scores
  const participants = await db.user.findMany({
    where: {
      role: "PARTICIPANT",
      disqualification: null,
      roundScores: { some: { round: { eventId } } },
    },
    take: 500,
    include: {
      roundScores: {
        where: { round: { eventId } },
        include: { round: { select: { id: true, sequence: true, name: true } } },
        orderBy: { round: { sequence: "asc" } },
      },
    },
  });

  const leaderboard = participants
    .map((p) => {
      const totalScore = p.roundScores.reduce((s, r) => s + r.finalScore, 0);
      const roundScores: Record<number, number> = {};
      for (const rs of p.roundScores) roundScores[rs.round.sequence] = rs.finalScore;
      return {
        participantId: p.id,
        name: p.name ?? "Anonymous",
        college: p.college ?? "NSDC College",
        roundScores,
        totalScore,
        explainUsed: p.roundScores.some((r) => r.explainUsed),
        codeUsed: p.roundScores.some((r) => r.codeUsed),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || (a.name ?? "").localeCompare(b.name ?? ""))
    .map((p, i) => ({ rank: i + 1, ...p }));

  await redisClient.set(cacheKey, JSON.stringify(leaderboard), 10);
  return NextResponse.json(leaderboard);
}
