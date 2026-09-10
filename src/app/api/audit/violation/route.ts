import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis";
import { recordDisqualifiedParticipant } from "@/lib/platform-data";

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { roundId, reason, count, action, status } = body as {
    roundId?: string;
    reason?: string;
    count?: number;
    action?: string;
    status?: string;
  };

  const isDisqual = count !== undefined && count >= 3 || action === "DISQUALIFIED" || status === "DISQUALIFIED";

  if (isDisqual) {
    if (roundId) recordDisqualifiedParticipant(roundId);
    recordDisqualifiedParticipant("contestant");
  }

  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (userId) {
      if (isDisqual) {
        recordDisqualifiedParticipant(userId);
      }

      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          teamMember: {
            include: { team: true },
          },
        },
      });

      if (user) {
        if (isDisqual && user.email) {
          recordDisqualifiedParticipant(user.email);
        }

        // If disqualified and user has a team, mark team DISQUALIFIED in DB
        if (isDisqual && user.teamMember?.teamId) {
          await db.team.update({
            where: { id: user.teamMember.teamId },
            data: { status: "DISQUALIFIED" },
          }).catch(() => {});
        }

        // Record into AuditLog
        const auditLog = await db.auditLog.create({
          data: {
            userId,
            action: isDisqual ? "DISQUALIFIED" : "INTEGRITY_VIOLATION",
            target: user.teamMember?.teamId ?? userId,
            metadata: {
              userId,
              participantName: user.name,
              participantEmail: user.email,
              teamName: user.teamMember?.team?.name,
              roundId: roundId ?? "UNKNOWN",
              reason: reason ?? (isDisqual ? "All 3 hearts depleted" : "TAB_BLUR_OR_EXIT_FULLSCREEN"),
              violationCount: count ?? 1,
              isDisqualified: isDisqual,
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
    }
  } catch (err) {
    // Database or Redis offline - fall through gracefully
  }

  return NextResponse.json({ success: true, localOnly: true });
}

// Admin & SuperAdmin Disqualification Reinstatement / Action Endpoint
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json(
      { error: "Forbidden: Administrative authority required to manage disqualification states." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, teamId, action } = (body || {}) as {
    userId?: string;
    teamId?: string;
    action?: "REINSTATE" | "DISQUALIFY";
  };

  if (!userId && !teamId) {
    return NextResponse.json({ error: "userId or teamId is required" }, { status: 400 });
  }

  try {
    if (action === "REINSTATE") {
      if (teamId) {
        await db.team.update({
          where: { id: teamId },
          data: { status: "ACTIVE" },
        }).catch(() => {});
      }
      return NextResponse.json({ success: true, message: "Participant reinstated by administrator" });
    } else {
      if (userId) recordDisqualifiedParticipant(userId);
      if (teamId) {
        recordDisqualifiedParticipant(teamId);
        await db.team.update({
          where: { id: teamId },
          data: { status: "DISQUALIFIED" },
        }).catch(() => {});
      }
      return NextResponse.json({ success: true, message: "Participant marked disqualified by administrator" });
    }
  } catch (err) {
    return NextResponse.json({ error: "Failed to update participant status" }, { status: 500 });
  }
}
