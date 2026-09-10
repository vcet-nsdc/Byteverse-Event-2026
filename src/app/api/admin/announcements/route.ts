import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { redisClient } from "@/lib/redis";

const schema = z.object({
  eventId: z.string().optional(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  isPinned: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  let eventId = parsed.data.eventId;
  if (!eventId) {
    const activeEvent = await db.event.findFirst({ orderBy: { createdAt: "desc" } });
    if (!activeEvent) {
      return NextResponse.json({ error: "No active event found" }, { status: 400 });
    }
    eventId = activeEvent.id;
  }

  const announcement = await db.announcement.create({
    data: {
      eventId,
      title: parsed.data.title,
      body: parsed.data.body,
      isPinned: parsed.data.isPinned,
    },
  });

  await redisClient.publish("admin", JSON.stringify({ type: "ANNOUNCEMENT", announcement }));
  await redisClient.publish("round", JSON.stringify({ type: "ANNOUNCEMENT", announcement }));
  await redisClient.publish("announcements", JSON.stringify({ type: "ANNOUNCEMENT", announcement }));

  return NextResponse.json({ announcement }, { status: 201 });
}

export async function GET(req: NextRequest) {
  try {
    let eventId = req.nextUrl.searchParams.get("eventId");
    if (!eventId) {
      const activeEvent = await db.event.findFirst({ orderBy: { createdAt: "desc" } }).catch(() => null);
      eventId = activeEvent?.id ?? null;
    }

    const announcements = eventId
      ? await db.announcement.findMany({
          where: { eventId },
          orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
          take: 50,
        }).catch(() => [])
      : [];

    return NextResponse.json({ announcements });
  } catch {
    return NextResponse.json({ announcements: [] });
  }
}
