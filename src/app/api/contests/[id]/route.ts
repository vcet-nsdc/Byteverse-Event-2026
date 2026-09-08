import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const contest = await db.contest.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, name: true } },
      problems: {
        select: {
          id: true,
          title: true,
          difficulty: true,
          tags: true,
          timeLimitMs: true,
          memoryLimitMb: true,
        },
        orderBy: { sequence: "asc" },
      },
      participants: {
        include: {
          user: { select: { id: true, name: true, college: true } },
        },
        orderBy: [{ score: "desc" }, { registeredAt: "asc" }],
        take: 100,
      },
      _count: {
        select: {
          problems: true,
          participants: true,
        },
      },
    },
  });

  if (!contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  // Check user registration
  const userRegistration = userId
    ? contest.participants.find((p) => p.userId === userId)
    : null;

  // Format leaderboard
  const leaderboard = contest.participants.map((p, idx) => ({
    rank: idx + 1,
    participantId: p.userId,
    name: p.user.name || "Anonymous",
    college: p.user.college || "NSDC",
    score: p.score,
    registeredAt: p.registeredAt,
  }));

  return NextResponse.json({
    id: contest.id,
    title: contest.title,
    description: contest.description,
    type: contest.type,
    status: contest.status,
    difficulty: contest.difficulty,
    startsAt: contest.startsAt.toISOString(),
    endsAt: contest.endsAt.toISOString(),
    event: contest.event,
    problems: contest.problems,
    leaderboard,
    problemCount: contest._count.problems,
    participantCount: contest._count.participants,
    isRegistered: !!userRegistration,
    userScore: userRegistration?.score ?? null,
    userRank: userRegistration?.rank ?? null,
  });
}
