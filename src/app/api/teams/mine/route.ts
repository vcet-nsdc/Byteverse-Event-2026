import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ teamId: null });

  const membership = await db.teamMember.findUnique({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  roundScores: true,
                },
              },
            },
          },
          teamScores: { include: { round: { select: { name: true, sequence: true } } } },
        },
      },
    },
  });

  if (!membership) return NextResponse.json({ team: null });

  const { team } = membership;
  const totalScore = team.teamScores.reduce((s, ts) => s + ts.avgScore, 0);

  return NextResponse.json({
    teamId: team.id,
    teamName: team.name,
    inviteCode: team.inviteCode,
    status: team.status,
    totalScore,
    userIsLeader: membership.isLeader,
    members: team.members.map((m) => ({
      name: m.user.name,
      email: m.user.email,
      isLeader: m.isLeader,
      roundScores: m.user.roundScores.map((rs) => ({
        roundId: rs.roundId,
        finalScore: rs.finalScore,
      })),
    })),
    roundAverages: team.teamScores.map((ts) => ({
      roundId: ts.roundId,
      roundName: ts.round.name,
      sequence: ts.round.sequence,
      avgScore: ts.avgScore,
    })),
  });
}
