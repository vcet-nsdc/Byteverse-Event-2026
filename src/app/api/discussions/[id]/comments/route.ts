import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discussion = await db.discussion.findUnique({ where: { id } });
  if (!discussion) return NextResponse.json({ error: "Discussion not found" }, { status: 404 });

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

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

  const comment = await db.discussionComment.findUnique({ where: { id: commentId } });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  if (comment.authorId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.discussionComment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
