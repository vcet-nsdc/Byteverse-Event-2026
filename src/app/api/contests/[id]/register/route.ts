import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contest = await db.contest.findUnique({ where: { id } });
  if (!contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  const existing = await db.contestParticipant.findUnique({
    where: { contestId_userId: { contestId: id, userId: session.user.id } },
  });

  if (existing) {
    return NextResponse.json({ message: "Already registered", participant: existing });
  }

  const participant = await db.contestParticipant.create({
    data: {
      contestId: id,
      userId: session.user.id,
      score: 0,
    },
  });

  return NextResponse.json({ message: "Successfully registered", participant }, { status: 201 });
}
