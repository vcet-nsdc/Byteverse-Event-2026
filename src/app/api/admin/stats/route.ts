import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalParticipants,
    totalTeams,
    activeTeams,
    totalSubmissions,
    totalAiChat,
    totalAiCode,
    activeRound,
  ] = await Promise.all([
    db.user.count({ where: { role: "PARTICIPANT" } }),
    db.team.count(),
    db.team.count({ where: { status: "ACTIVE" } }),
    db.submission.count(),
    db.aIUsage.count({ where: { type: "EXPLAIN" } }),
    db.aIUsage.count({ where: { type: "CODE" } }),
    db.round.findFirst({
      where: { status: { in: ["ACTIVE", "PAUSED", "SCHEDULED"] } },
      orderBy: { sequence: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        sequence: true,
        status: true,
        startsAt: true,
        endsAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    totalParticipants,
    totalTeamsRegistered: totalTeams,
    totalTeamsVerified: activeTeams,
    totalSubmissions,
    totalAiChat,
    totalAiCode,
    activeRound: activeRound
      ? {
          id: activeRound.id,
          name: activeRound.name,
          type: activeRound.type,
          sequence: activeRound.sequence,
          status: activeRound.status,
          startsAt: activeRound.startsAt?.toISOString() ?? null,
          endsAt: activeRound.endsAt?.toISOString() ?? null,
        }
      : null,
  });
}
