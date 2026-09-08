import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden: Organizer or Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const roleFilter = searchParams.get("role")?.trim();

  const whereClause: any = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { college: { contains: q, mode: "insensitive" } },
      { teamMember: { team: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  if (roleFilter && roleFilter !== "ALL" && Object.values(Role).includes(roleFilter as Role)) {
    whereClause.role = roleFilter as Role;
  }

  const [totalCount, users, roleStats] = await Promise.all([
    db.user.count({ where: whereClause }),
    db.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        college: true,
        role: true,
        createdAt: true,
        teamMember: {
          select: {
            isLeader: true,
            team: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
          },
        },
        contestParticipants: {
          select: {
            contestId: true,
            score: true,
            rank: true,
            contest: {
              select: {
                title: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
            discussions: true,
            discussionComments: true,
          },
        },
        submissions: {
          where: { status: "ACCEPTED" },
          select: { problemId: true },
          distinct: ["problemId"],
        },
      },
    }),
    db.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
  ]);

  const roleCounts: Record<string, number> = {
    TOTAL: totalCount,
    PARTICIPANT: 0,
    ORGANIZER: 0,
    ADMIN: 0,
    SUPER_ADMIN: 0,
  };

  for (const r of roleStats) {
    roleCounts[r.role] = r._count.id;
  }

  const formattedUsers = users.map((u) => ({
    id: u.id,
    name: u.name || "Anonymous Coder",
    email: u.email,
    college: u.college || "NSDC College",
    role: u.role,
    createdAt: u.createdAt,
    team: u.teamMember
      ? {
          name: u.teamMember.team.name,
          status: u.teamMember.team.status,
          isLeader: u.teamMember.isLeader,
        }
      : null,
    contestsCount: u.contestParticipants.length,
    contests: u.contestParticipants.map((cp) => ({
      title: cp.contest.title,
      status: cp.contest.status,
      score: cp.score,
      rank: cp.rank,
    })),
    submissionsCount: u._count.submissions,
    solvedCount: u.submissions.length,
    discussionsCount: u._count.discussions + u._count.discussionComments,
  }));

  return NextResponse.json({
    total: totalCount,
    roleCounts,
    users: formattedUsers,
  });
}
