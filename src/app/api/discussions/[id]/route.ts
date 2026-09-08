import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  // Increment view counter asynchronously
  db.discussion.update({
    where: { id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  const discussion = await db.discussion.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true, college: true, role: true } },
      problem: { select: { id: true, title: true, difficulty: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, college: true, role: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      votes: userId ? { where: { userId }, select: { value: true } } : false,
    },
  });

  if (!discussion) {
    return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: discussion.id,
    title: discussion.title,
    content: discussion.content,
    tags: discussion.tags,
    upvotes: discussion.upvotes,
    views: discussion.views + 1,
    createdAt: discussion.createdAt.toISOString(),
    updatedAt: discussion.updatedAt.toISOString(),
    author: discussion.author,
    problem: discussion.problem,
    comments: discussion.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
      isOwner: userId === c.authorId,
    })),
    userVote: userId && discussion.votes && discussion.votes.length > 0 ? discussion.votes[0].value : 0,
    isOwner: userId === discussion.authorId,
  });
}

const updateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(5).max(20000).optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discussion = await db.discussion.findUnique({ where: { id } });
  if (!discussion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Server-side ownership check
  if (discussion.authorId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const updated = await db.discussion.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const discussion = await db.discussion.findUnique({ where: { id } });
  if (!discussion) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Server-side authorization: only author or admin can delete
  if (discussion.authorId !== session.user.id && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.discussion.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
