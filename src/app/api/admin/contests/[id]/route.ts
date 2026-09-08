import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const contest = await db.contest.findUnique({
    where: { id },
    include: {
      event: { select: { id: true, name: true } },
      problems: {
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true, college: true },
          },
        },
        orderBy: { score: "desc" },
      },
      _count: {
        select: {
          participants: true,
          submissions: true,
          problems: true,
        },
      },
    },
  });

  if (!contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  return NextResponse.json(contest);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      title,
      description,
      type,
      status,
      startsAt,
      endsAt,
      difficulty,
      bannerUrl,
      eventId,
      problemIds,
    } = body;

    const updatedContest = await db.contest.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(startsAt !== undefined && { startsAt: new Date(startsAt) }),
        ...(endsAt !== undefined && { endsAt: new Date(endsAt) }),
        ...(difficulty !== undefined && { difficulty }),
        ...(bannerUrl !== undefined && { bannerUrl: bannerUrl?.trim() || null }),
        ...(eventId !== undefined && { eventId: eventId || null }),
        ...(Array.isArray(problemIds) && {
          problems: {
            set: problemIds.map((pId: string) => ({ id: pId })),
          },
        }),
      },
      include: {
        problems: { select: { id: true, title: true, difficulty: true } },
        _count: {
          select: {
            participants: true,
            submissions: true,
            problems: true,
          },
        },
      },
    });

    return NextResponse.json(updatedContest);
  } catch (error: any) {
    console.error("Error updating contest:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update contest" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const contest = await db.contest.findUnique({
      where: { id },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    if (contest._count.submissions > 0) {
      return NextResponse.json(
        { error: "Cannot delete contest with existing submissions. End or archive it instead." },
        { status: 400 }
      );
    }

    await db.contest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting contest:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete contest" },
      { status: 500 }
    );
  }
}
