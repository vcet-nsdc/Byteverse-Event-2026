import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redisClient, CACHE_KEYS } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const cacheKey = CACHE_KEYS.leaderboardTeam(eventId);
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached), {
      headers: { "Cache-Control": "public, max-age=5" },
    });
  }

  const teams = await db.team.findMany({
    where: { eventId, status: "ACTIVE", disqualification: null },
    include: {
      members: {
        include: {
          user: {
            select: {
              name: true,
              roundScores: {
                include: { round: { select: { sequence: true } } },
              },
            },
          },
        },
      },
      teamScores: { include: { round: { select: { sequence: true } } } },
    },
  });

  const leaderboard = teams
    .map((t) => {
      const [m1, m2] = t.members;
      const totalScore = t.teamScores.reduce((s, ts) => s + ts.avgScore, 0);
      const roundScores: Record<string, number> = {};
      for (const ts of t.teamScores) roundScores[ts.round.sequence] = ts.avgScore;
      return {
        teamId: t.id,
        teamName: t.name,
        member1Name: m1?.user.name ?? "—",
        member2Name: m2?.user.name ?? "—",
        roundScores,
        totalScore,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((t, i) => ({ rank: i + 1, ...t }));

  await redisClient.set(cacheKey, JSON.stringify(leaderboard), 10);
  return NextResponse.json(leaderboard);
}
