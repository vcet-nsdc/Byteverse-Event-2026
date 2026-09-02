import { db } from "./db";
import { MissingMemberPolicy } from "@prisma/client";
import { redisClient, CACHE_KEYS } from "./redis";

export async function calculateTeamScore(
  teamId: string,
  roundId: string,
  policy: MissingMemberPolicy = "TREAT_AS_ZERO"
): Promise<number> {
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            include: {
              roundScores: { where: { roundId } },
            },
          },
        },
      },
    },
  });

  if (!team) return 0;

  const members = team.members;
  const scores = members.map((m) => m.user.roundScores[0]?.finalScore ?? null);

  let member1Score: number | null = null;
  let member2Score: number | null = null;

  const leader = members.find((m) => m.isLeader);
  const nonLeader = members.find((m) => !m.isLeader);

  if (leader) {
    member1Score = leader.user.roundScores[0]?.finalScore ?? null;
  }
  if (nonLeader) {
    member2Score = nonLeader.user.roundScores[0]?.finalScore ?? null;
  }

  const s1 = member1Score ?? 0;
  const s2 = member2Score ?? 0;

  let avgScore = 0;

  switch (policy) {
    case "TREAT_AS_ZERO":
      avgScore = (s1 + s2) / 2;
      break;
    case "MARK_INCOMPLETE":
      if (member1Score === null || member2Score === null) {
        avgScore = 0;
      } else {
        avgScore = (s1 + s2) / 2;
      }
      break;
    case "TEAM_INELIGIBLE":
      if (member1Score === null || member2Score === null) {
        avgScore = 0;
      } else {
        avgScore = (s1 + s2) / 2;
      }
      break;
    case "REQUIRE_BOTH":
      if (member1Score !== null && member2Score !== null) {
        avgScore = (s1 + s2) / 2;
      } else {
        avgScore = 0;
      }
      break;
  }

  await db.teamScore.upsert({
    where: { teamId_roundId: { teamId, roundId } },
    update: {
      member1Score: s1,
      member2Score: member2Score !== null ? s2 : null,
      avgScore,
    },
    create: {
      teamId,
      roundId,
      member1Score: s1,
      member2Score: member2Score !== null ? s2 : null,
      avgScore,
    },
  });

  const event = await db.round.findUnique({
    where: { id: roundId },
    select: { eventId: true },
  });

  if (event) {
    await redisClient.del(CACHE_KEYS.leaderboardTeam(event.eventId));
    await redisClient.del(CACHE_KEYS.leaderboardIndividual(event.eventId));
    await redisClient.publish(
      "leaderboard",
      JSON.stringify({ type: "SCORE_UPDATE", eventId: event.eventId, teamId, roundId })
    );
  }

  return avgScore;
}

export async function updateRoundScore(
  userId: string,
  roundId: string,
  rawScore: number
): Promise<number> {
  const round = await db.round.findUnique({ where: { id: roundId } });
  if (!round) throw new Error("Round not found");

  const existing = await db.roundScore.findUnique({
    where: { userId_roundId: { userId, roundId } },
  });

  const aiScoreCap = existing?.aiScoreCap ?? 100;
  const finalScore = Math.min(rawScore, aiScoreCap);

  const durationSeconds = round.startsAt
    ? Math.max(1, Math.round((Date.now() - new Date(round.startsAt).getTime()) / 1000))
    : null;

  await db.roundScore.upsert({
    where: { userId_roundId: { userId, roundId } },
    update: {
      rawScore,
      finalScore,
      durationSeconds: durationSeconds ?? existing?.durationSeconds ?? null,
      completedAt: new Date(),
    },
    create: {
      userId,
      roundId,
      rawScore,
      finalScore,
      durationSeconds,
      aiScoreCap,
      completedAt: new Date(),
    },
  });

  const event = await db.round.findUnique({
    where: { id: roundId },
    select: { eventId: true },
  });

  if (event) {
    await redisClient.del(CACHE_KEYS.leaderboardIndividual(event.eventId));
    await redisClient.publish(
      "leaderboard",
      JSON.stringify({ type: "SCORE_UPDATE", eventId: event.eventId, userId, roundId })
    );
  }

  return finalScore;
}

export async function applyAIPenalty(
  userId: string,
  roundId: string,
  type: "EXPLAIN" | "CODE"
): Promise<number> {
  const round = await db.round.findUnique({ where: { id: roundId } });
  if (!round) throw new Error("Round not found");

  const penaltyCap = type === "EXPLAIN" ? round.aiExplainPenalty : round.aiCodePenalty;

  const existing = await db.roundScore.findUnique({
    where: { userId_roundId: { userId, roundId } },
  });

  const currentCap = existing?.aiScoreCap ?? 100;
  const newCap = Math.min(currentCap, penaltyCap);
  const currentRaw = existing?.rawScore ?? 0;
  const newFinal = Math.min(currentRaw, newCap);

  await db.roundScore.upsert({
    where: { userId_roundId: { userId, roundId } },
    update: {
      aiScoreCap: newCap,
      finalScore: newFinal,
      explainUsed: type === "EXPLAIN" ? true : existing?.explainUsed ?? false,
      codeUsed: type === "CODE" ? true : existing?.codeUsed ?? false,
    },
    create: {
      userId,
      roundId,
      rawScore: 0,
      finalScore: 0,
      aiScoreCap: newCap,
      explainUsed: type === "EXPLAIN",
      codeUsed: type === "CODE",
    },
  });

  return newCap;
}
