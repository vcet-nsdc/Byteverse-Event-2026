import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Auto-expire any active rounds whose time has elapsed
  const now = new Date();
  await db.round.updateMany({
    where: {
      status: "ACTIVE",
      endsAt: { lte: now },
    },
    data: {
      status: "ENDED",
    },
  });

  // Find currently active or scheduled round
  let round = await db.round.findFirst({
    where: { status: { in: ["ACTIVE", "SCHEDULED"] } },
    orderBy: { sequence: "asc" },
    select: { id: true, sequence: true, name: true, status: true },
  });

  // If none active, return the first round
  if (!round) {
    round = await db.round.findFirst({
      orderBy: { sequence: "asc" },
      select: { id: true, sequence: true, name: true, status: true },
    });
  }

  // Also fetch all rounds for sequence lookups
  const allRounds = await db.round.findMany({
    orderBy: { sequence: "asc" },
    select: { id: true, sequence: true, name: true, durationMin: true, status: true },
  });

  return NextResponse.json({
    roundId: round?.id ?? null,
    currentRound: round,
    rounds: allRounds,
  });
}
