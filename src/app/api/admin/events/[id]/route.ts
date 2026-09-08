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
  const event = await db.event.findUnique({
    where: { id },
    include: {
      rounds: {
        orderBy: { sequence: "asc" },
      },
      contests: {
        orderBy: { startsAt: "desc" },
      },
      _count: {
        select: {
          teams: true,
          rounds: true,
          contests: true,
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
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

    const updatedEvent = await db.event.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(venue !== undefined && { venue: venue?.trim() || null }),
        ...(category !== undefined && { category: category?.trim() || null }),
        ...(bannerUrl !== undefined && { bannerUrl: bannerUrl?.trim() || null }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(registrationOpen !== undefined && { registrationOpen: Boolean(registrationOpen) }),
        ...(teamRegistrationOpen !== undefined && { teamRegistrationOpen: Boolean(teamRegistrationOpen) }),
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

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update event" },
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
    const event = await db.event.findUnique({
      where: { id },
      include: {
        _count: { select: { teams: true, rounds: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event._count.teams > 0 || event._count.rounds > 0) {
      return NextResponse.json(
        { error: "Cannot delete event with existing teams or rounds. Deactivate it instead." },
        { status: 400 }
      );
    }

    await db.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
