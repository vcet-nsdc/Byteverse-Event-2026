import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const voteSchema = z.object({
  value: z.number().int().min(-1).max(1), // 1 or -1
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { value } = parsed.data;
  const userId = session.user.id;

  const discussion = await db.discussion.findUnique({ where: { id } });
  if (!discussion) return NextResponse.json({ error: "Discussion not found" }, { status: 404 });

  const existingVote = await db.discussionVote.findUnique({
    where: { discussionId_userId: { discussionId: id, userId } },
  });

  let delta = 0;
  let newVoteValue = value;

  if (!existingVote) {
    // New vote
    delta = value;
    await db.discussionVote.create({
      data: { discussionId: id, userId, value },
    });
  } else if (existingVote.value === value) {
    // Same vote clicked again: remove vote (toggle off)
    delta = -value;
    newVoteValue = 0;
    await db.discussionVote.delete({
      where: { id: existingVote.id },
    });
  } else {
    // Changed vote from -1 to 1 or 1 to -1
    delta = value * 2;
    await db.discussionVote.update({
      where: { id: existingVote.id },
      data: { value },
    });
  }

  const updated = await db.discussion.update({
    where: { id },
    data: { upvotes: { increment: delta } },
    select: { id: true, upvotes: true },
  });

  return NextResponse.json({
    upvotes: updated.upvotes,
    userVote: newVoteValue,
  });
}
