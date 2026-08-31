import { NextResponse } from "next/server";
import { auth, requireRole } from "@/lib/auth";
import { getAllKeysTelemetry } from "@/lib/ai-gateway";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // 1. Get Live Key Pool Telemetry
  const telemetry = await getAllKeysTelemetry();

  // 2. Get Top Participant Consumers with token breakdown
  const topParticipants = await db.aIUsage.groupBy({
    by: ["userId"],
    _count: { id: true },
    _sum: { tokensUsed: true },
    orderBy: {
      _sum: { tokensUsed: "desc" },
    },
    take: 10,
  });

  const userIds = topParticipants.map((p) => p.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      email: true,
      teamMember: {
        select: {
          team: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Also count EXPLAIN vs CODE per top user
  const participantBreakdown = await Promise.all(
    topParticipants.map(async (tp) => {
      const u = userMap.get(tp.userId);
      const [explainCount, codeCount] = await Promise.all([
        db.aIUsage.count({ where: { userId: tp.userId, type: "EXPLAIN" } }),
        db.aIUsage.count({ where: { userId: tp.userId, type: "CODE" } }),
      ]);

      return {
        userId: tp.userId,
        name: u?.name ?? "Participant",
        email: u?.email ?? "—",
        teamName: u?.teamMember?.team?.name ?? "Individual",
        totalPrompts: tp._count.id,
        explainPrompts: explainCount,
        codePrompts: codeCount,
        totalTokensUsed: tp._sum.tokensUsed ?? 0,
      };
    })
  );

  return NextResponse.json({
    ...telemetry,
    topParticipants: participantBreakdown,
  });
}
