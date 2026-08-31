import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { redisClient } from "@/lib/redis";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { roundId } = await params;
  const userId = session.user.id;

  const encoder = new TextEncoder();
  let closed = false;

  async function buildStatePayload(): Promise<string> {
    const round = await db.round.findUnique({
      where: { id: roundId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        sequence: true,
        durationMin: true,
        startsAt: true,
        endsAt: true,
      },
    });
    if (!round) return JSON.stringify({ phase: "ENDED" });

    const now = new Date();
    const BREAK_MINUTES = 5;

    const membership = await db.teamMember.findUnique({
      where: { userId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            status: true,
            isLocked: true,
            members: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!membership || membership.team.status !== "ACTIVE") {
      if (membership?.team.status === "LOCKED" || membership?.team.isLocked) {
        return JSON.stringify({ phase: "LOCKED" });
      }
      if (membership?.team.status === "DISQUALIFIED") {
        return JSON.stringify({ phase: "DISQUALIFIED" });
      }
      return JSON.stringify({ phase: "GATE_TEAM" });
    }

    if (membership.team.isLocked) {
      return JSON.stringify({ phase: "LOCKED" });
    }

    const teamInfo = {
      id: membership.team.id,
      name: membership.team.name,
      status: membership.team.status,
      members: membership.team.members.map((m) => ({
        name: m.user.name,
        email: m.user.email,
        isLeader: m.isLeader,
      })),
    };

    if (round.status === "DRAFT" || round.status === "SCHEDULED") {
      return JSON.stringify({
        phase: "WAITING",
        timeLeftSeconds: null,
        round: {
          id: round.id,
          name: round.name,
          type: round.type,
          sequence: round.sequence,
          durationMin: round.durationMin,
          startsAt: round.startsAt?.toISOString() ?? null,
        },
        team: teamInfo,
      });
    }

    if (round.status === "PAUSED") {
      return JSON.stringify({
        phase: "PAUSED",
        timeLeftSeconds: null,
        round: {
          id: round.id,
          name: round.name,
          sequence: round.sequence,
        },
        team: teamInfo,
      });
    }

    const effectiveStartsAt = round.startsAt;
    const effectiveEndsAt = round.endsAt ?? (effectiveStartsAt ? new Date(effectiveStartsAt.getTime() + round.durationMin * 60000) : null);

    if (round.status === "ENDED") {
      const breakEndsAt = effectiveEndsAt
        ? new Date(effectiveEndsAt.getTime() + BREAK_MINUTES * 60000)
        : null;
      if (breakEndsAt && now < breakEndsAt) {
        return JSON.stringify({
          phase: "BREAK",
          timeLeftSeconds: Math.ceil((breakEndsAt.getTime() - now.getTime()) / 1000),
          round: {
            id: round.id,
            name: round.name,
            sequence: round.sequence,
          },
          team: teamInfo,
        });
      }
      return JSON.stringify({
        phase: "ENDED",
        timeLeftSeconds: 0,
        round: {
          id: round.id,
          name: round.name,
          sequence: round.sequence,
        },
        team: teamInfo,
      });
    }

    if (!effectiveStartsAt || !effectiveEndsAt) {
      return JSON.stringify({
        phase: "WAITING",
        timeLeftSeconds: null,
        round: {
          id: round.id,
          name: round.name,
          sequence: round.sequence,
        },
        team: teamInfo,
      });
    }

    const isTeamActive = now >= effectiveStartsAt && now < effectiveEndsAt;
    const timeLeftSeconds = isTeamActive
      ? Math.max(0, Math.ceil((effectiveEndsAt.getTime() - now.getTime()) / 1000))
      : 0;

    return JSON.stringify({
      phase: timeLeftSeconds > 0 ? "ACTIVE" : "ENDED",
      timeLeftSeconds,
      endsAt: effectiveEndsAt.toISOString(),
      startsAt: effectiveStartsAt.toISOString(),
      durationMin: round.durationMin,
      round: {
        id: round.id,
        name: round.name,
        type: round.type,
        sequence: round.sequence,
        durationMin: round.durationMin,
      },
      team: teamInfo,
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const payload = await buildStatePayload();
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      } catch {
        /* ignore */
      }

      const unsubscribe = redisClient.subscribe("admin", async (message: string) => {
        if (closed) return;
        try {
          const parsed = JSON.parse(message) as {
            type: string;
            roundId?: string;
            teamId?: string;
          };
          if (
            (parsed.type === "ROUND_STATUS" && parsed.roundId === roundId) ||
            parsed.type === "TEAM_STATUS"
          ) {
            const payload = await buildStatePayload();
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch {
          /* ignore */
        }
      });

      const heartbeat = setInterval(() => {
        if (closed) {
          clearInterval(heartbeat);
          return;
        }
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
