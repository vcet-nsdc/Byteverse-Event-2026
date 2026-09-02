import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/announcements — Returns latest announcements for participants
export async function GET(req: NextRequest) {
  try {
    let eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      const activeEvent = await db.event.findFirst({ orderBy: { createdAt: "desc" } });
      eventId = activeEvent?.id ?? null;
    }

    if (!eventId) {
      return NextResponse.json({ announcements: [] });
    }

    const announcements = await db.announcement.findMany({
      where: { eventId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        title: true,
        body: true,
        isPinned: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ announcements });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch announcements", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
