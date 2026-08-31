import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.teamMember.findUnique({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!membership) {
    return NextResponse.json({ error: "You are not in a team" }, { status: 404 });
  }

  if (!membership.isLeader) {
    return NextResponse.json(
      { error: "Only the team captain can verify the team" },
      { status: 403 }
    );
  }

  const { team } = membership;

  if (team.members.length < 2) {
    return NextResponse.json(
      { error: "Team must have 2 members before verification" },
      { status: 400 }
    );
  }

  if (team.status === "ACTIVE") {
    return NextResponse.json({ success: true, status: "ACTIVE", teamId: team.id });
  }

  const updated = await db.team.update({
    where: { id: team.id },
    data: { status: "ACTIVE" },
  });

  await redisClient.publish(
    "admin",
    JSON.stringify({ type: "TEAM_STATUS", teamId: team.id, status: "ACTIVE" })
  );

  return NextResponse.json({
    success: true,
    status: updated.status,
    teamId: updated.id,
  });
}
