import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import * as discussionStore from "@/lib/discussion-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized. You must be logged in to upvote." }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const discussion = await db.discussion.findUnique({ where: { id } });
    if (discussion) {
      const existingVote = await db.discussionVote.findUnique({
        where: { discussionId_userId: { discussionId: id, userId } },
      });

      let delta = 0;
      let newVoteValue = 1;

      if (!existingVote) {
        // First upvote
        delta = 1;
        await db.discussionVote.create({
          data: { discussionId: id, userId, value: 1 },
        });
      } else if (existingVote.value === 1) {
        // Toggle off upvote
        delta = -1;
        newVoteValue = 0;
        await db.discussionVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Convert any legacy downvote to an upvote
        delta = 2;
        await db.discussionVote.update({
          where: { id: existingVote.id },
          data: { value: 1 },
        });
      }

      const updated = await db.discussion.update({
        where: { id },
        data: { upvotes: { increment: delta } },
        select: { id: true, upvotes: true },
      });

      return NextResponse.json({
        upvotes: Math.max(0, updated.upvotes),
        userVote: newVoteValue,
      });
    }
  } catch (err) {
    console.warn("[DiscussionsVoteAPI] DB vote failed, using fallback store:", err);
  }

  // Fallback store upvote toggle
  const result = discussionStore.toggleUpvote(id, userId);
  if (result) {
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
}
