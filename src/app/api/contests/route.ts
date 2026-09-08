import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const now = new Date();

  // Find all contests with relations
  const contests = await db.contest.findMany({
    include: {
      _count: {
        select: {
          problems: true,
          participants: true,
        },
      },
      participants: userId
        ? {
            where: { userId },
            select: { id: true, score: true, rank: true },
          }
        : false,
    },
    orderBy: { startsAt: "desc" },
  });

  const formatted = contests.map((c) => {
    // Dynamic status determination based on current time
    let computedStatus = c.status;
    if (c.status !== "DRAFT") {
      if (now >= c.startsAt && now <= c.endsAt) {
        computedStatus = "ACTIVE";
      } else if (now > c.endsAt) {
        computedStatus = "ENDED";
      } else {
        computedStatus = "SCHEDULED";
      }
    }

    const isRegistered = userId ? c.participants && c.participants.length > 0 : false;
    const userParticipation = isRegistered ? c.participants[0] : null;

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      status: computedStatus,
      difficulty: c.difficulty || "Mixed",
      startsAt: c.startsAt.toISOString(),
      endsAt: c.endsAt.toISOString(),
      bannerUrl: c.bannerUrl,
      problemCount: c._count.problems,
      participantCount: c._count.participants,
      isRegistered,
      userScore: userParticipation?.score ?? null,
      userRank: userParticipation?.rank ?? null,
    };
  });

  const active = formatted.filter((c) => c.status === "ACTIVE");
  const weekly = formatted.filter((c) => c.type === "WEEKLY" || c.type === "BIWEEKLY");
  const past = formatted.filter((c) => c.status === "ENDED");

  return NextResponse.json({
    all: formatted,
    active,
    weekly,
    past,
  });
}
