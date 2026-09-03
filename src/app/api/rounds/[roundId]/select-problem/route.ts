import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  problemId: z.string().min(1, "Problem ID is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roundId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 422 });
  }

  const { problemId } = parsed.data;

  // Verify round is Round 4 or Round 5
  const round = await db.round.findUnique({ where: { id: roundId } });
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  if (round.sequence !== 4 && round.sequence !== 5) {
    return NextResponse.json({ error: "Problem selection is only applicable to Round 4 and Round 5" }, { status: 400 });
  }

  // Verify problem exists and belongs to this round
  const problem = await db.problem.findFirst({
    where: { id: problemId, roundId },
  });
  if (!problem) {
    return NextResponse.json({ error: "Selected problem does not exist in this round" }, { status: 404 });
  }

  // Find membership
  const membership = await db.teamMember.findUnique({
    where: { userId: session.user.id },
  });

  if (round.sequence === 4) {
    await db.user.update({
      where: { id: session.user.id },
      data: { round4ProblemId: problemId },
    });
  } else {
    // Persist on User for Round 5
    await db.user.update({
      where: { id: session.user.id },
      data: { round5ProblemId: problemId },
    });

    // If in a team, also store on Team so teammates share the chosen challenge in Round 5
    if (membership?.teamId) {
      await db.team.update({
        where: { id: membership.teamId },
        data: { round5ProblemId: problemId },
      });
    }
  }

  return NextResponse.json({
    success: true,
    selectedProblemId: problemId,
    problemTitle: problem.title,
  });
}
