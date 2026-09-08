import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 1. Fetch user data
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      college: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // 2. Fetch all problems in DB categorized by difficulty
  const [totalEasy, totalMedium, totalHard, allProblemsCount] = await Promise.all([
    db.problem.count({ where: { difficulty: { equals: "Easy", mode: "insensitive" } } }),
    db.problem.count({ where: { difficulty: { equals: "Medium", mode: "insensitive" } } }),
    db.problem.count({ where: { difficulty: { equals: "Hard", mode: "insensitive" } } }),
    db.problem.count(),
  ]);

  // 3. Fetch user's submissions
  const userSubmissions = await db.submission.findMany({
    where: { userId },
    include: {
      problem: {
        select: {
          id: true,
          title: true,
          difficulty: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const totalSubs = userSubmissions.length;
  const acceptedSubs = userSubmissions.filter((s) => s.status === "ACCEPTED");
  const totalAccepted = acceptedSubs.length;
  const acceptanceRate = totalSubs > 0 ? `${((totalAccepted / totalSubs) * 100).toFixed(1)}%` : "N/A";

  // Solved distinct problems
  const solvedProblemMap = new Map<string, string>(); // problemId -> difficulty
  for (const s of acceptedSubs) {
    if (s.problem) {
      solvedProblemMap.set(s.problemId, (s.problem.difficulty || "Easy").toLowerCase());
    }
  }

  let easySolved = 0;
  let medSolved = 0;
  let hardSolved = 0;
  for (const diff of solvedProblemMap.values()) {
    if (diff === "easy") easySolved++;
    else if (diff === "medium") medSolved++;
    else if (diff === "hard") hardSolved++;
    else easySolved++;
  }
  const totalSolved = solvedProblemMap.size;

  // User language distribution
  const langCounts: Record<string, number> = { python: 0, cpp: 0, c: 0, java: 0 };
  let totalCodingSubs = 0;
  for (const s of userSubmissions) {
    const l = s.language.toLowerCase();
    if (langCounts[l] !== undefined) {
      langCounts[l]++;
      totalCodingSubs++;
    }
  }

  const languages = [
    { name: "Python", count: langCounts.python, percentage: totalCodingSubs > 0 ? Math.round((langCounts.python / totalCodingSubs) * 100) : 0 },
    { name: "C++", count: langCounts.cpp, percentage: totalCodingSubs > 0 ? Math.round((langCounts.cpp / totalCodingSubs) * 100) : 0 },
    { name: "C", count: langCounts.c, percentage: totalCodingSubs > 0 ? Math.round((langCounts.c / totalCodingSubs) * 100) : 0 },
    { name: "Java", count: langCounts.java, percentage: totalCodingSubs > 0 ? Math.round((langCounts.java / totalCodingSubs) * 100) : 0 },
  ];

  // 4. Calculate Global Platform Rank deterministically
  // Formula: (Easy Solved * 10) + (Med Solved * 25) + (Hard Solved * 50) + (Accepted Submissions * 2)
  const myPlatformScore = (easySolved * 10) + (medSolved * 25) + (hardSolved * 50) + (totalAccepted * 2);

  // Approximate rank among all active participants
  const allUsersCount = await db.user.count();
  // Count users with higher score (calculated efficiently via accepted submissions)
  const usersWithMoreAccepted = await db.submission.groupBy({
    by: ["userId"],
    where: { status: "ACCEPTED" },
    _count: { id: true },
    having: {
      id: {
        _count: { gt: totalAccepted },
      },
    },
  });
  const platformRank = Math.max(1, usersWithMoreAccepted.length + 1);

  // 5. Contest Rank from RoundScores
  const roundScores = await db.roundScore.findMany({
    where: { userId },
    select: { finalScore: true },
  });
  const contestScore = roundScores.reduce((sum, r) => sum + r.finalScore, 0);

  // 6. Discussions activity
  const [discussionsCreated, commentsPosted] = await Promise.all([
    db.discussion.count({ where: { authorId: userId } }),
    db.discussionComment.count({ where: { authorId: userId } }),
  ]);

  const userDiscussions = await db.discussion.findMany({
    where: { authorId: userId },
    select: { upvotes: true },
  });
  const totalUpvotesReceived = userDiscussions.reduce((sum, d) => sum + d.upvotes, 0);

  // Recent 10 submissions
  const recentSubmissions = userSubmissions.slice(0, 10).map((s) => ({
    id: s.id,
    problemId: s.problemId,
    problemTitle: s.problem?.title || "Unknown Problem",
    difficulty: s.problem?.difficulty || "Easy",
    status: s.status,
    language: s.language,
    executionTimeMs: s.executionTimeMs,
    memoryUsedMb: s.memoryUsedMb,
    submittedAt: s.submittedAt.toISOString(),
  }));

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name || "Anonymous",
      email: user.email,
      college: user.college || "NSDC",
      role: user.role,
      joinedAt: user.createdAt.toISOString(),
    },
    ranks: {
      platformRank,
      totalUsers: allUsersCount,
      platformScore: myPlatformScore,
      contestScore,
    },
    solved: {
      total: totalSolved,
      totalAvailable: allProblemsCount,
      easy: { solved: easySolved, total: totalEasy },
      medium: { solved: medSolved, total: totalMedium },
      hard: { solved: hardSolved, total: totalHard },
    },
    submissions: {
      total: totalSubs,
      accepted: totalAccepted,
      acceptanceRate,
      languages,
      recent: recentSubmissions,
    },
    community: {
      discussionsCreated,
      commentsPosted,
      upvotesReceived: totalUpvotesReceived,
    },
  });
}
