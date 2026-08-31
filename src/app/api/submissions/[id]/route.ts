import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const submission = await db.submission.findUnique({
    where: { id },
  });

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: submission.id,
    status: submission.status,
    rawScore: submission.rawScore,
    finalScore: submission.finalScore,
    aiScoreCap: submission.aiScoreCap,
    executionTimeMs: submission.executionTimeMs,
    memoryUsedMb: submission.memoryUsedMb,
    submittedAt: submission.submittedAt,
    judgedAt: submission.judgedAt,
  });
}
