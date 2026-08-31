import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roundId } = await params;
  const userId = session.user.id;

  const round = await db.round.findUnique({
    where: { id: roundId },
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      sequence: true,
      durationMin: true,
      startsAt: true,
      endsAt: true,
    },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const roundMetadata = {
    id: round.id,
    name: round.name,
    type: round.type,
    sequence: round.sequence,
    durationMin: round.durationMin,
    startsAt: round.startsAt?.toISOString() ?? null,
  };

  const membership = await db.teamMember.findUnique({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          status: true,
          isLocked: true,
          members: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!membership || membership.team.status !== "ACTIVE") {
    if (membership?.team.status === "LOCKED" || membership?.team.isLocked) {
      return NextResponse.json({ phase: "LOCKED", round: roundMetadata });
    }
    if (membership?.team.status === "DISQUALIFIED") {
      return NextResponse.json({ phase: "DISQUALIFIED", round: roundMetadata });
    }
    if (!isAdmin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ phase: "GATE_TEAM", round: roundMetadata });
    }
  }

  if (membership?.team?.isLocked) {
    return NextResponse.json({ phase: "LOCKED", round: roundMetadata });
  }

  const teamInfo = membership ? {
    id: membership.team.id,
    name: membership.team.name,
    status: membership.team.status,
    members: membership.team.members.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      isLeader: m.isLeader,
    })),
  } : {
    id: "admin-preview",
    name: "Admin Preview Team",
    status: "ACTIVE",
    members: [{ name: session.user.name ?? "Admin", email: session.user.email ?? "admin@byteverse.dev", isLeader: true }],
  };

  const now = new Date();

  // Auto transition from ACTIVE to ENDED when timer reaches 0
  if (round.status === "ACTIVE" && round.endsAt && now >= round.endsAt) {
    await db.round.update({
      where: { id: round.id },
      data: { status: "ENDED" },
    });
    return NextResponse.json({
      phase: "ENDED",
      timeLeftSeconds: 0,
      round: roundMetadata,
      team: teamInfo,
    });
  }

  if (round.status === "DRAFT" || round.status === "SCHEDULED") {
    return NextResponse.json({
      phase: "WAITING",
      timeLeftSeconds: null,
      round: roundMetadata,
      team: teamInfo,
    });
  }

  if (round.status === "PAUSED") {
    return NextResponse.json({
      phase: "PAUSED",
      timeLeftSeconds: null,
      round: roundMetadata,
      team: teamInfo,
    });
  }

  if (round.status === "ENDED") {
    return NextResponse.json({
      phase: "ENDED",
      timeLeftSeconds: 0,
      round: roundMetadata,
      team: teamInfo,
    });
  }

  // Active round: Calculate remaining seconds
  const remainingSeconds = round.endsAt
    ? Math.max(0, Math.floor((round.endsAt.getTime() - now.getTime()) / 1000))
    : round.durationMin * 60;

  return NextResponse.json({
    phase: "ACTIVE",
    timeLeftSeconds: remainingSeconds,
    round: roundMetadata,
    team: teamInfo,
  });
}
