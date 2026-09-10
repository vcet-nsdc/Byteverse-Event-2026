import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const events = await db.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          teams: true,
          rounds: true,
          contests: true,
        },
      },
    },
  }).catch(() => []);

  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden: Admin or SuperAdmin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      description,
      venue,
      category,
      bannerUrl,
      startsAt,
      endsAt,
      isActive,
      registrationOpen,
      teamRegistrationOpen,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Event name is required" }, { status: 400 });
    }

    const eventSlug = id && id.trim() !== ""
      ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const newEvent = await db.event.create({
      data: {
        id: eventSlug,
        name: name.trim(),
        description: description?.trim() || null,
        venue: venue?.trim() || "Main Auditorium & Lab Complex",
        category: category?.trim() || "Championship",
        bannerUrl: bannerUrl?.trim() || null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: Boolean(isActive),
        registrationOpen: registrationOpen !== undefined ? Boolean(registrationOpen) : true,
        teamRegistrationOpen: teamRegistrationOpen !== undefined ? Boolean(teamRegistrationOpen) : true,
      },
      include: {
        _count: {
          select: {
            teams: true,
            rounds: true,
            contests: true,
          },
        },
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create event" },
      { status: 500 }
    );
  }
}
