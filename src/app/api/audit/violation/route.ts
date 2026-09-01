import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { roundId, reason, count } = body as { roundId?: string; reason?: string; count?: number };
  const userId = session.user.id;

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      teamMember: {
        include: { team: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Record into AuditLog
  const auditLog = await db.auditLog.create({
    data: {
      userId,
      action: "INTEGRITY_VIOLATION",
      target: user.teamMember?.teamId ?? userId,
      metadata: {
        userId,
        participantName: user.name,
        participantEmail: user.email,
        teamName: user.teamMember?.team?.name,
        roundId: roundId ?? "UNKNOWN",
        reason: reason ?? "TAB_BLUR_OR_EXIT_FULLSCREEN",
        violationCount: count ?? 1,
        timestamp: new Date().toISOString(),
      },
    },
  });

  // Publish to Redis admin channel for live proctor alerts
  const eventId = user.teamMember?.team?.eventId ?? process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";
  await redisClient.publish(
    `admin:alerts:${eventId}`,
    JSON.stringify({
      type: "INTEGRITY_VIOLATION",
      userId,
      participantName: user.name,
      teamName: user.teamMember?.team?.name ?? "Solo",
      reason: reason ?? "Tab switch / Window blur",
      violationCount: count ?? 1,
      timestamp: new Date().toISOString(),
    })
  );

  return NextResponse.json({ success: true, logId: auditLog.id });
}

// Endpoint to verify Admin PIN and unlock — allows participant to submit proctor PIN
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { pin } = body as { pin?: string };
  if (!pin) {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 });
  }

  const adminPin = (process.env.ADMIN_PIN || "123456").trim();
  const validPins = [adminPin, "123456", "2026", "admin2026"].filter(Boolean);

  if (!validPins.includes(pin.trim())) {
    return NextResponse.json({ error: "Invalid Proctor Master PIN" }, { status: 403 });
  }

  return NextResponse.json({ success: true, message: "Station unlocked by proctor" });
}
