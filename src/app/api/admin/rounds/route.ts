import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { logAction } from "@/lib/audit";

const schema = z.object({
  eventId: z.string().optional(),
  name: z.string().min(2).max(100),
  type: z.enum(["CODE_LOGIC", "AI_REPAIR", "TRADITIONAL", "TYPE_TRANSFORM", "HUMAN_VS_MACHINE"]),
  sequence: z.number().int().min(1).max(10),
  durationMin: z.number().int().min(5).max(480),
  aiExplainPenalty: z.number().int().min(0).max(100).default(75),
  aiCodePenalty: z.number().int().min(0).max(100).default(50),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  let eventId = parsed.data.eventId;
  if (!eventId) {
    const activeEvent = await db.event.findFirst({ orderBy: { createdAt: "desc" } });
    if (!activeEvent) return NextResponse.json({ error: "No active event found" }, { status: 400 });
    eventId = activeEvent.id;
  }

  const round = await db.round.create({
    data: {
      ...parsed.data,
      eventId,
    },
  });

  if (session?.user?.id) {
    await logAction(session.user.id, "ROUND_CREATE", round.id, { name: round.name });
  }
  return NextResponse.json(round, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId") || process.env.NEXT_PUBLIC_EVENT_ID || "byteverse-2026";
  
  try {
    // Auto-expire any active rounds whose time has elapsed
    const now = new Date();
    await db.round.updateMany({
      where: {
        status: "ACTIVE",
        endsAt: { lte: now },
      },
      data: {
        status: "ENDED",
      },
    }).catch(() => null);

    const rounds = await db.round.findMany({
      where: { eventId },
      orderBy: { sequence: "asc" },
      include: { _count: { select: { problems: true } } },
    });

    return NextResponse.json(rounds);
  } catch {
    return NextResponse.json([]);
  }
}
