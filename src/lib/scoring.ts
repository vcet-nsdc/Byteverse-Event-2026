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

export const ROUND_QUESTION_POINTS: Record<number, number> = {
  1: 10,   // Round 1: 10 MCQs, 10 pts each
  2: 25,   // Round 2: 4 problems, 25 pts each
  3: 50,   // Round 3: 2 problems, 50 pts each
  4: 100,  // Round 4: 1 problem, 100 pts
  5: 100,  // Round 5: 1 problem, 100 pts
};

export async function calculateRoundScoreForUser(userId: string, roundId: string): Promise<{
  rawScore: number;
  finalScore: number;
  aiDeductions: number;
}> {
  const round = await db.round.findUnique({ where: { id: roundId } });
  if (!round) return { rawScore: 0, finalScore: 0, aiDeductions: 0 };

  const membership = await db.teamMember.findUnique({ where: { userId } });
  const isLeader = membership?.isLeader ?? true;
  const targetSet = isLeader ? "A" : "B";

  let problems = await db.problem.findMany({
    where: { roundId, set: targetSet },
    select: { id: true, sequence: true },
    orderBy: { sequence: "asc" },
  });
  if (problems.length === 0) {
    problems = await db.problem.findMany({
      where: { roundId },
      select: { id: true, sequence: true },
      orderBy: { sequence: "asc" },
    });
  }

  const isMCQ = round.type === "CODE_LOGIC";
  const maxProblemPoints = ROUND_QUESTION_POINTS[round.sequence] ?? (isMCQ ? 10 : Math.round(100 / Math.max(1, problems.length)));

  const submissions = await db.submission.findMany({
    where: { userId, roundId },
    select: { problemId: true, status: true, rawScore: true, finalScore: true },
  });

  const aiUsages = await db.aIUsage.findMany({
    where: { userId, roundId },
    select: { problemId: true, type: true },
  });

  let totalRawScore = 0;
  let totalFinalScore = 0;
  let totalAIDeductions = 0;

  for (const p of problems) {
    const probSubs = submissions.filter((s) => s.problemId === p.id);
    let problemRaw = 0;
    if (isMCQ) {
      const isAccepted = probSubs.some((s) => s.status === "ACCEPTED");
      problemRaw = isAccepted ? maxProblemPoints : 0;
    } else {
      const maxEarned = probSubs.reduce((acc, s) => Math.max(acc, s.rawScore ?? 0), 0);
      problemRaw = (maxEarned / 100) * maxProblemPoints;
    }

    const probAI = aiUsages.filter(
      (u) => u.problemId === p.id || (problems.length === 1 && !u.problemId)
    );
    const chatCalls = probAI.filter((u) => u.type === "EXPLAIN").length;
    const codeCalls = probAI.filter((u) => u.type === "CODE").length;

    // Chat: 0.25 penalty factor on question points; Code: 0.50 penalty factor on question points
    const penaltyRate = Math.min(1.0, (chatCalls * 0.25) + (codeCalls * 0.50));
    const problemDeduction = maxProblemPoints * penaltyRate;
    const problemFinal = Math.max(0, problemRaw - problemDeduction);

    totalRawScore += problemRaw;
    totalFinalScore += problemFinal;
    totalAIDeductions += problemDeduction;
  }

  return {
    rawScore: Math.round(totalRawScore * 100) / 100,
    finalScore: Math.round(totalFinalScore * 100) / 100,
    aiDeductions: Math.round(totalAIDeductions * 100) / 100,
  };
}

export async function updateRoundScore(
  userId: string,
  roundId: string,
  _rawScoreOverride?: number
): Promise<number> {
  const round = await db.round.findUnique({ where: { id: roundId } });
  if (!round) throw new Error("Round not found");

  const scoreData = await calculateRoundScoreForUser(userId, roundId);

  const durationSeconds = round.startsAt
    ? Math.max(1, Math.round((Date.now() - new Date(round.startsAt).getTime()) / 1000))
    : null;

  const existing = await db.roundScore.findUnique({
    where: { userId_roundId: { userId, roundId } },
  });

  await db.roundScore.upsert({
    where: { userId_roundId: { userId, roundId } },
    update: {
      rawScore: scoreData.rawScore,
      finalScore: scoreData.finalScore,
      durationSeconds: durationSeconds ?? existing?.durationSeconds ?? null,
      completedAt: new Date(),
    },
    create: {
      userId,
      roundId,
      rawScore: scoreData.rawScore,
      finalScore: scoreData.finalScore,
      durationSeconds,
      completedAt: new Date(),
    },
  });

  const event = await db.round.findUnique({
    where: { id: roundId },
    select: { eventId: true },
  });

  if (event) {
    await redisClient.del(CACHE_KEYS.leaderboardIndividual(event.eventId));
    await redisClient.del(CACHE_KEYS.leaderboardTeam(event.eventId));
    await redisClient.publish(
      "leaderboard",
      JSON.stringify({ type: "SCORE_UPDATE", eventId: event.eventId, userId, roundId })
    );
  }

  try {
    const membership = await db.teamMember.findFirst({ where: { userId } });
    if (membership) {
      await calculateTeamScore(membership.teamId, roundId);
    }
  } catch {
    // ignore
  }

  return scoreData.finalScore;
}

export async function applyAIPenalty(
  userId: string,
  roundId: string,
  _type: "EXPLAIN" | "CODE",
  _problemId?: string
): Promise<number> {
  return updateRoundScore(userId, roundId);
}
