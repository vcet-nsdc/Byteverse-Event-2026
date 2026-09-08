import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany({
    include: {
      rounds: {
        select: {
          id: true,
          name: true,
          type: true,
          sequence: true,
          durationMin: true,
          status: true,
        },
        orderBy: { sequence: "asc" },
      },
      contests: {
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          startsAt: true,
          endsAt: true,
        },
      },
      _count: {
        select: {
          teams: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = events.map((e) => ({
    id: e.id,
    name: e.name,
    description: e.description,
    bannerUrl: e.bannerUrl,
    venue: e.venue || "Campus Auditorium & Labs",
    category: e.category || "Championship",
    startsAt: e.startsAt?.toISOString() || null,
    endsAt: e.endsAt?.toISOString() || null,
    registrationOpen: e.registrationOpen,
    teamRegistrationOpen: e.teamRegistrationOpen,
    isActive: e.isActive,
    rounds: e.rounds,
    contests: e.contests,
    teamCount: e._count.teams,
  }));

  const ongoing = formatted.filter((e) => e.isActive);
  const past = formatted.filter((e) => !e.isActive);

  return NextResponse.json({
    all: formatted,
    ongoing,
    past,
  });
}
