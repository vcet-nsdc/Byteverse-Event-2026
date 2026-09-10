import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import * as discussionStore from "@/lib/discussion-store";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest"; // "newest", "upvotes", "comments"
  const problemId = searchParams.get("problemId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15")));
  const skip = (page - 1) * limit;

  const allTags = ["All", "General", "Algorithms", "Two Sum", "Dynamic Programming", "FastIO", "Judge0", "Tips", "Complexity", "Interviews"];

  try {
    const where: any = {};
    if (tag && tag !== "All") {
      where.tags = { has: tag };
    }
    if (problemId) {
      where.problemId = problemId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "upvotes") {
      orderBy = { upvotes: "desc" };
    } else if (sort === "comments") {
      orderBy = { comments: { _count: "desc" } };
    }

    const [total, discussions] = await Promise.all([
      db.discussion.count({ where }),
      db.discussion.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, email: true, college: true, role: true } },
          problem: { select: { id: true, title: true, difficulty: true } },
          _count: { select: { comments: true, votes: true } },
          votes: userId ? { where: { userId }, select: { value: true } } : false,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // If database is empty or has zero discussions, fall back to discussionStore so demo data is always accessible
    if (total === 0) {
      const fallbackResult = discussionStore.getAllDiscussions({
        tag,
        search,
        sort,
        limit,
        skip,
        userId,
      });
      return NextResponse.json({
        discussions: fallbackResult.discussions,
        total: fallbackResult.total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(fallbackResult.total / limit)),
        tags: allTags.filter((t) => t !== "All"),
      });
    }

    const formatted = discussions.map((d) => ({
      id: d.id,
      title: d.title,
      content: d.content,
      tags: d.tags,
      upvotes: d.upvotes,
      views: d.views,
      createdAt: d.createdAt.toISOString(),
      author: {
        id: d.author.id,
        name: d.author.name || "Anonymous",
        college: d.author.college || "NSDC",
        role: d.author.role,
      },
      problem: d.problem,
      commentCount: d._count.comments,
      userVote: userId && d.votes && d.votes.length > 0 ? d.votes[0].value : 0,
    }));

    return NextResponse.json({
      discussions: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      tags: allTags.filter((t) => t !== "All"),
    });
  } catch (err) {
    console.warn("[DiscussionsAPI] Database unavailable, using fallback store:", err);
    const fallbackResult = discussionStore.getAllDiscussions({
      tag,
      search,
      sort,
      limit,
      skip,
      userId,
    });

    return NextResponse.json({
      discussions: fallbackResult.discussions,
      total: fallbackResult.total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(fallbackResult.total / limit)),
      tags: allTags.filter((t) => t !== "All"),
    });
  }
}

const createSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(5).max(20000),
  tags: z.array(z.string()).default([]),
  problemId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized. You must be logged in to create a discussion." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const discussion = await db.discussion.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        tags: parsed.data.tags,
        problemId: parsed.data.problemId || null,
        authorId: session.user.id,
        upvotes: 1, // author upvotes by default
      },
    });

    // Record author's initial upvote
    await db.discussionVote.create({
      data: {
        discussionId: discussion.id,
        userId: session.user.id,
        value: 1,
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (err) {
    console.warn("[DiscussionsAPI] DB create failed, saving to fallback store:", err);
    const fallbackDiscussion = discussionStore.createDiscussion({
      title: parsed.data.title,
      content: parsed.data.content,
      tags: parsed.data.tags,
      authorId: session.user.id,
      author: {
        id: session.user.id,
        name: session.user.name || "Contestant",
        email: session.user.email || "",
        college: (session.user as any).college || "NSDC",
        role: (session.user as any).role || "PARTICIPANT",
      },
      problemId: parsed.data.problemId,
    });

    return NextResponse.json(fallbackDiscussion, { status: 201 });
  }
}
