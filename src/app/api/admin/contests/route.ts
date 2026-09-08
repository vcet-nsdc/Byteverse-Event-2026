import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contests = await db.contest.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      event: { select: { id: true, name: true } },
      problems: {
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
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

  return NextResponse.json(contests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden: Super Admin or Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      title,
      description,
      type = "WEEKLY",
      status = "SCHEDULED",
      startsAt,
      endsAt,
      difficulty = "Mixed",
      bannerUrl,
      eventId,
      problemIds = [],
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Contest title is required" }, { status: 400 });
    }
    if (!startsAt || !endsAt) {
      return NextResponse.json({ error: "Start time and end time are required" }, { status: 400 });
    }

    const contestSlug = id && id.trim() !== ""
      ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newContest = await db.contest.create({
      data: {
        id: contestSlug,
        title: title.trim(),
        description: description?.trim() || null,
        type: type || "WEEKLY",
        status: status || "SCHEDULED",
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        difficulty: difficulty || "Mixed",
        bannerUrl: bannerUrl?.trim() || null,
        eventId: eventId || null,
        ...(Array.isArray(problemIds) && problemIds.length > 0 && {
          problems: {
            connect: problemIds.map((pId: string) => ({ id: pId })),
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

    return NextResponse.json(newContest, { status: 201 });
  } catch (error: any) {
    console.error("Error creating contest:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create contest" },
      { status: 500 }
    );
  }
}
