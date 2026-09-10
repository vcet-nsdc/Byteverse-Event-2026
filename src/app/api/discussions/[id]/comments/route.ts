import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import * as discussionStore from "@/lib/discussion-store";

const commentSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized. You must be logged in to comment." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const discussion = await db.discussion.findUnique({ where: { id } });
    if (discussion) {
      const comment = await db.discussionComment.create({
        data: {
          discussionId: id,
          authorId: session.user.id,
          content: parsed.data.content,
        },
        include: {
          author: { select: { id: true, name: true, college: true, role: true } },
        },
      });

      return NextResponse.json(comment, { status: 201 });
    }
  } catch (err) {
    console.warn("[DiscussionsCommentsAPI] DB comment failed, using fallback store:", err);
  }

  // Fallback store comment
  const comment = discussionStore.addComment(id, {
    authorId: session.user.id,
    author: {
      id: session.user.id,
      name: session.user.name || "Contestant",
      college: (session.user as any).college || "NSDC",
      role: (session.user as any).role || "PARTICIPANT",
    },
    content: parsed.data.content,
  });

  if (comment) {
    return NextResponse.json(comment, { status: 201 });
  }

  return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("commentId");
  if (!commentId) return NextResponse.json({ error: "commentId is required" }, { status: 400 });

  try {
    const comment = await db.discussionComment.findUnique({ where: { id: commentId } });
    if (comment) {
      if (comment.authorId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await db.discussionComment.delete({ where: { id: commentId } });
      return NextResponse.json({ success: true });
    }
  } catch (err) {
    console.warn("[DiscussionsCommentsAPI] DB comment delete failed:", err);
  }

  return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
}
