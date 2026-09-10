import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();

  // Strict Security Gate: Only SuperAdmin can inspect live surveillance
  if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Access Denied: SuperAdmin surveillance privileges required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));

  try {
    // 1. Fetch recent user submissions across all problems and contests
    const recentSubmissions = await db.submission.findMany({
      select: {
        id: true,
        userId: true,
        problemId: true,
        roundId: true,
        contestId: true,
        language: true,
        status: true,
        rawScore: true,
        finalScore: true,
        executionTimeMs: true,
        memoryUsedMb: true,
        submittedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            college: true,
            role: true,
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
        contest: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: limit,
    });

    // 2. Fetch recent audit logs
    const auditLogs = await db.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });

    // 3. Fetch recent contest registrations
    const recentRegistrations = await db.contestParticipant.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, college: true } },
        contest: { select: { id: true, title: true } },
      },
      orderBy: { registeredAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      submissions: recentSubmissions,
      auditLogs,
      registrations: recentRegistrations,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[SuperAdmin Activity API Error]:", err);
    // Graceful fallback if database is offline or unseeded
    return NextResponse.json({
      submissions: [],
      auditLogs: [],
      registrations: [],
      error: "Database offline or surveillance log empty",
      timestamp: new Date().toISOString(),
    });
  }
}
