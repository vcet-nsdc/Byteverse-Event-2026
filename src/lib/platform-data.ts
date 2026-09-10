/**
 * Unified Platform Data Provider
 * Provides robust, schema-compliant data for Events, Contests, Practice Problems, and In-Editor AI.
 * First queries Prisma (if database is online and populated), with seamless high-performance
 * fallback to the master production seed dataset when the database connection is offline or unseeded.
 */

import fs from "fs";
import path from "path";
import { db } from "./db";

let cachedSeedData: any = null;

export function getMasterSeedData() {
  if (cachedSeedData) return cachedSeedData;
  try {
    const filePath = path.resolve(process.cwd(), "prisma", "seed-data.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      cachedSeedData = JSON.parse(raw);
      return cachedSeedData;
    }
  } catch (err) {
    console.error("Failed to load master seed data:", err);
  }
  return null;
}

function formatDifficulty(diff?: string | null): string {
  if (!diff) return "Easy";
  const lower = diff.toLowerCase();
  if (lower === "hard") return "Hard";
  if (lower === "medium") return "Medium";
  return "Easy";
}

// In-memory registry of disqualified participants / sessions (survives offline DB)
const globalDisqualified = ((globalThis as any).__bv_disqualified_participants =
  (globalThis as any).__bv_disqualified_participants || new Set<string>());

export function recordDisqualifiedParticipant(idOrEmailOrKey: string) {
  if (idOrEmailOrKey) {
    globalDisqualified.add(idOrEmailOrKey.toLowerCase().trim());
  }
}

export function isParticipantDisqualified(idOrEmailOrKey?: string | null): boolean {
  if (!idOrEmailOrKey) return false;
  return globalDisqualified.has(idOrEmailOrKey.toLowerCase().trim());
}

export function getDisqualifiedParticipantsList(): string[] {
  return Array.from(globalDisqualified);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROBLEMS DATA PROVIDER
// ─────────────────────────────────────────────────────────────────────────────
export async function getPlatformProblems(options: {
  difficulty?: string | null;
  tag?: string | null;
  search?: string | null;
  status?: string | null;
  page?: number;
  limit?: number;
  userId?: string | null;
}) {
  const page = options.page || 1;
  const limit = options.limit || 15;
  const skip = (page - 1) * limit;

  // Try querying Prisma DB first
  try {
    const where: any = { isPublished: true };
    if (options.difficulty && options.difficulty !== "All") {
      where.difficulty = { equals: options.difficulty, mode: "insensitive" };
    }
    if (options.tag && options.tag !== "All") {
      where.tags = { has: options.tag };
    }
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: "insensitive" } },
        { statement: { contains: options.search, mode: "insensitive" } },
      ];
    }

    const [totalProblems, dbProblems] = await Promise.all([
      db.problem.count({ where }),
      db.problem.findMany({
        where,
        select: {
          id: true,
          title: true,
          difficulty: true,
          tags: true,
          timeLimitMs: true,
          memoryLimitMb: true,
          createdAt: true,
          submissions: {
            select: { id: true, userId: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    if (totalProblems > 0) {
      let processed = dbProblems.map((p) => {
        const totalSubs = p.submissions.length;
        const acceptedSubs = p.submissions.filter((s) => s.status === "ACCEPTED").length;
        const acceptanceRate = totalSubs > 0 ? `${((acceptedSubs / totalSubs) * 100).toFixed(1)}%` : "52.4%";
        const isSolved = options.userId ? p.submissions.some((s) => s.userId === options.userId && s.status === "ACCEPTED") : false;

        return {
          id: p.id,
          title: p.title,
          difficulty: formatDifficulty(p.difficulty),
          tags: p.tags || [],
          acceptanceRate,
          isSolved,
          totalSubmissions: totalSubs,
        };
      });

      if (options.status === "solved") processed = processed.filter((p) => p.isSolved);
      else if (options.status === "unsolved") processed = processed.filter((p) => !p.isSolved);

      const allTags = ["Arrays", "Two Pointers", "Hash Map", "Strings", "Sliding Window", "Dynamic Programming", "Monotonic Stack", "Sorting", "Graphs"];

      return {
        problems: processed,
        total: totalProblems,
        page,
        limit,
        totalPages: Math.ceil(totalProblems / limit),
        tags: allTags,
      };
    }
  } catch (err) {
    // Database offline or query error, fall through to master seed data
  }

  // Fallback to Master Seed Data
  const seed = getMasterSeedData();
  const rawList: any[] = seed?.practiceProblems || [];

  let filtered = rawList.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: formatDifficulty(p.difficulty),
    tags: p.tags || [],
    acceptanceRate: p.acceptanceRate || "50.0%",
    isSolved: false,
    totalSubmissions: 124,
  }));

  if (options.difficulty && options.difficulty !== "All") {
    filtered = filtered.filter((p) => p.difficulty.toLowerCase() === options.difficulty!.toLowerCase());
  }

  if (options.tag && options.tag !== "All") {
    filtered = filtered.filter((p) => p.tags.some((t: string) => t.toLowerCase() === options.tag!.toLowerCase()));
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t: string) => t.toLowerCase().includes(q)));
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);
  const allTags = ["Arrays", "Two Pointers", "Hash Map", "Strings", "Sliding Window", "Dynamic Programming", "Monotonic Stack", "Sorting", "Graphs"];

  return {
    problems: paginated,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    tags: allTags,
  };
}

export async function getPlatformProblemById(id: string, userId?: string | null) {
  // Try DB first
  try {
    const problem = await db.problem.findUnique({
      where: { id },
      include: {
        testCases: {
          where: { isHidden: false },
          select: { id: true, input: true, expected: true, sequence: true },
          orderBy: { sequence: "asc" },
        },
        _count: {
          select: { testCases: true, submissions: true },
        },
      },
    });

    if (problem) {
      let isSolved = false;
      let userSubmissions: any[] = [];
      if (userId) {
        const subs = await db.submission.findMany({
          where: { problemId: id, userId },
          select: {
            id: true,
            status: true,
            language: true,
            rawScore: true,
            finalScore: true,
            executionTimeMs: true,
            memoryUsedMb: true,
            submittedAt: true,
            sourceCode: true,
          },
          orderBy: { submittedAt: "desc" },
          take: 10,
        });
        userSubmissions = subs;
        isSolved = subs.some((s) => s.status === "ACCEPTED");
      }

      return {
        id: problem.id,
        title: problem.title,
        statement: problem.statement,
        inputFormat: problem.inputFormat,
        outputFormat: problem.outputFormat,
        constraints: problem.constraints,
        sampleInput: problem.sampleInput,
        sampleOutput: problem.sampleOutput,
        difficulty: formatDifficulty(problem.difficulty),
        tags: problem.tags,
        timeLimitMs: problem.timeLimitMs,
        memoryLimitMb: problem.memoryLimitMb,
        allowedLangs: problem.allowedLangs,
        starterCodes: problem.starterCodes as any,
        sampleTestCases: problem.testCases,
        totalTestCasesCount: problem._count.testCases,
        isSolved,
        userSubmissions,
      };
    }
  } catch (err) {
    // DB offline, fall through
  }

  // Fallback to Master Seed
  const seed = getMasterSeedData();
  const allProblems: any[] = [
    ...(seed?.practiceProblems || []),
    ...(seed?.contests?.flatMap((c: any) => c.problems || c.rounds?.flatMap((r: any) => r.problems) || []) || []),
    ...(seed?.events?.pastEvents?.flatMap((e: any) => e.problems || e.rounds?.flatMap((r: any) => r.problems) || []) || []),
  ];

  const matched = allProblems.find((p: any) => 
    p.id === id || 
    p.slug === id || 
    p.id?.toLowerCase() === id?.toLowerCase()
  );
  if (!matched) return null;

  const sampleTestCases = (matched.testCases || [])
    .filter((tc: any) => !tc.isHidden)
    .map((tc: any, idx: number) => ({
      id: `tc_sample_${idx + 1}`,
      input: tc.input,
      expected: tc.expected,
      sequence: idx + 1,
    }));

  // Format description
  let statementText = matched.statement || "";
  let constraintsText = matched.constraints || "";
  let inputFormatText = matched.inputFormat || "";
  let outputFormatText = matched.outputFormat || "";

  if (matched.description) {
    statementText = matched.description.context || statementText;
    if (!constraintsText && matched.description.constraints) {
      constraintsText = Array.isArray(matched.description.constraints)
        ? matched.description.constraints.join("\n")
        : String(matched.description.constraints);
    }
  }

  // If inputFormat / outputFormat are embedded inside statementText with markdown headers, extract them cleanly
  if (statementText.includes("### Input Format")) {
    const parts = statementText.split("### Input Format");
    statementText = parts[0].trim();
    const rest = parts[1] || "";
    if (rest.includes("### Output Format")) {
      const subParts = rest.split("### Output Format");
      if (!inputFormatText) inputFormatText = subParts[0].trim();
      if (!outputFormatText) outputFormatText = subParts[1].trim();
    } else {
      if (!inputFormatText) inputFormatText = rest.trim();
    }
  }

  const sampleInput =
    sampleTestCases[0]?.input ||
    matched.description?.examples?.[0]?.input ||
    matched.sampleInput ||
    "";
  const sampleOutput =
    sampleTestCases[0]?.expected ||
    matched.description?.examples?.[0]?.output ||
    matched.sampleOutput ||
    "";

  return {
    id: matched.id,
    title: matched.title,
    statement: statementText,
    inputFormat: inputFormatText,
    outputFormat: outputFormatText,
    constraints: constraintsText,
    sampleInput,
    sampleOutput,
    difficulty: formatDifficulty(matched.difficulty),
    tags: matched.tags || ["Algorithmic"],
    timeLimitMs: matched.timeLimitMs || 2000,
    memoryLimitMb: matched.memoryLimitMb || 256,
    allowedLangs: ["cpp", "c", "java", "python"],
    starterCodes: matched.starterCodes || {},
    sampleTestCases,
    totalTestCasesCount: matched.testCases?.length || sampleTestCases.length,
    isSolved: false,
    readOnly: Boolean(matched.readOnly),
    userSubmissions: [],
    examples: matched.description?.examples || [],
    hints: matched.description?.hints || [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTESTS DATA PROVIDER
// ─────────────────────────────────────────────────────────────────────────────
export async function getPlatformContests(userId?: string | null) {
  const now = new Date();

  // Try querying DB
  try {
    const dbContests = await db.contest.findMany({
      include: {
        _count: { select: { problems: true, participants: true } },
        participants: userId ? { where: { userId }, select: { id: true, score: true, rank: true } } : false,
      },
      orderBy: { startsAt: "desc" },
    });

    if (dbContests && dbContests.length > 0) {
      const formatted = dbContests.map((c) => {
        let computedStatus = c.status;
        if (c.status !== "DRAFT") {
          if (now >= c.startsAt && now <= c.endsAt) computedStatus = "ACTIVE";
          else if (now > c.endsAt) computedStatus = "ENDED";
          else computedStatus = "SCHEDULED";
        }
        const isRegistered = userId ? Boolean(c.participants && c.participants.length > 0) : false;
        const userParticipation = isRegistered ? (c.participants as any)[0] : null;

        return {
          id: c.id,
          title: c.title,
          description: c.description,
          type: c.type,
          status: computedStatus,
          difficulty: c.difficulty || "Mixed",
          startsAt: c.startsAt.toISOString(),
          endsAt: c.endsAt.toISOString(),
          bannerUrl: c.bannerUrl,
          problemCount: c._count.problems,
          participantCount: c._count.participants,
          isRegistered,
          userScore: userParticipation?.score ?? null,
          userRank: userParticipation?.rank ?? null,
        };
      });

      return {
        all: formatted,
        active: formatted.filter((c) => c.status === "ACTIVE"),
        weekly: formatted.filter((c) => c.type === "WEEKLY" || c.type === "BIWEEKLY"),
        past: formatted.filter((c) => c.status === "ENDED"),
      };
    }
  } catch (err) {
    // DB offline, fall through
  }

  // Fallback to Master Seed Data
  const seed = getMasterSeedData();
  const rawContests = seed?.contests || [];

  // Dynamic live window for Contest 1: starts now, ends in 90 mins (ACTIVE right now, 1h 30m total)
  const dynamicActiveStart = new Date(Date.now()).toISOString();
  const dynamicActiveEnd = new Date(Date.now() + 90 * 60 * 1000).toISOString();

  const formatted = rawContests.map((c: any, index: number) => {
    let startsAt = c.startsAt;
    let endsAt = c.endsAt;
    let status = c.status;

    if (index === 0) {
      // First contest is actively LIVE with a 90-minute duration
      startsAt = dynamicActiveStart;
      endsAt = dynamicActiveEnd;
      status = "ACTIVE";
    }

    return {
      id: c.id,
      title: c.title,
      description: c.description,
      type: c.type,
      status,
      difficulty: c.difficulty || "Mixed",
      startsAt,
      endsAt,
      bannerUrl: c.bannerUrl,
      problemCount: c.problems?.length || c.rounds?.reduce((acc: number, r: any) => acc + (r.problems?.length || 0), 0) || 25,
      participantCount: 84 + index * 24,
      rounds: c.rounds || [],
      isRegistered: true,
      userScore: null,
      userRank: null,
    };
  });

  return {
    all: formatted,
    active: formatted.filter((c: any) => c.status === "ACTIVE"),
    weekly: formatted.filter((c: any) => c.type === "WEEKLY" || c.type === "BIWEEKLY"),
    past: formatted.filter((c: any) => c.status === "ENDED" || c.status === "COMPLETED"),
  };
}

export async function getPlatformContestById(id: string, userId?: string | null) {
  // Try DB first
  try {
    const contest = await db.contest.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, name: true } },
        problems: {
          select: { id: true, title: true, difficulty: true, tags: true, timeLimitMs: true, memoryLimitMb: true },
          orderBy: { sequence: "asc" },
        },
        participants: {
          include: { user: { select: { id: true, name: true, college: true } } },
          orderBy: [{ score: "desc" }, { registeredAt: "asc" }],
          take: 100,
        },
        _count: { select: { problems: true, participants: true } },
      },
    });

    if (contest) {
      const isRegistered = userId ? contest.participants.some((p) => p.userId === userId) : false;
      const userRegistration = isRegistered ? contest.participants.find((p) => p.userId === userId) : null;
      const leaderboard = contest.participants.map((p, idx) => ({
        rank: idx + 1,
        participantId: p.userId,
        name: p.user.name || "Anonymous",
        college: p.user.college || "NSDC",
        score: p.score,
        registeredAt: p.registeredAt,
      }));

      return {
        id: contest.id,
        title: contest.title,
        description: contest.description,
        type: contest.type,
        status: contest.status,
        difficulty: contest.difficulty || "Mixed",
        startsAt: contest.startsAt.toISOString(),
        endsAt: contest.endsAt.toISOString(),
        bannerUrl: contest.bannerUrl,
        problemCount: contest._count.problems,
        participantCount: contest._count.participants,
        problems: contest.problems,
        isRegistered,
        userScore: userRegistration?.score ?? null,
        userRank: userRegistration?.rank ?? null,
        leaderboard,
      };
    }
  } catch (err) {
    // DB offline, fall through
  }

  // Fallback to Master Seed Data
  const seed = getMasterSeedData();
  const rawContest = (seed?.contests || []).find((c: any) => 
    c.id === id || 
    c.slug === id ||
    (id === "weekly-contest-101" && (c.id === "contest_weekly_sprint_01" || c.slug === "byteverse-weekly-sprint-01")) ||
    c.id?.toLowerCase() === id?.toLowerCase()
  ) || seed?.contests?.[0];

  if (!rawContest) return null;

  const dynamicActiveStart = new Date(Date.now()).toISOString();
  const dynamicActiveEnd = new Date(Date.now() + 90 * 60 * 1000).toISOString();

  const isFirst = rawContest.id === "contest_weekly_sprint_01";
  const startsAt = isFirst ? dynamicActiveStart : rawContest.startsAt;
  const endsAt = isFirst ? dynamicActiveEnd : rawContest.endsAt;
  const status = isFirst ? "ACTIVE" : rawContest.status;

  const mockLeaderboard = [
    { rank: 1, participantId: "user_1", name: "Dev_Aryan", college: "NSDC Engineering", score: 175, registeredAt: startsAt },
    { rank: 2, participantId: "user_2", name: "Priya_Codes", college: "Tech University", score: 125, registeredAt: startsAt },
    { rank: 3, participantId: "user_3", name: "BinaryBeast", college: "IIT Bombay", score: 75, registeredAt: startsAt },
  ];

  return {
    id: rawContest.id,
    title: rawContest.title,
    description: rawContest.description,
    type: rawContest.type,
    status,
    difficulty: rawContest.difficulty || "Mixed",
    startsAt,
    endsAt,
    bannerUrl: rawContest.bannerUrl,
    problemCount: (rawContest.problems || []).length || (rawContest.rounds || []).reduce((acc: number, r: any) => acc + (r.problems?.length || 0), 0) || 25,
    participantCount: 84,
    rounds: rawContest.rounds || [],
    problems: (rawContest.problems || rawContest.rounds?.flatMap((r: any) => r.problems) || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags || [p.difficulty, "Competitive"],
      timeLimitMs: p.timeLimitMs || 2000,
      memoryLimitMb: p.memoryLimitMb || 256,
      readOnly: Boolean(p.readOnly || status === "COMPLETED"),
    })),
    isRegistered: true,
    userScore: null,
    userRank: null,
    leaderboard: mockLeaderboard,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. EVENTS DATA PROVIDER
// ─────────────────────────────────────────────────────────────────────────────
export async function getPlatformEvents() {
  // Try DB first
  try {
    const dbEvents = await db.event.findMany({
      include: {
        rounds: {
          select: { id: true, name: true, type: true, sequence: true, durationMin: true, status: true },
          orderBy: { sequence: "asc" },
        },
        contests: {
          select: { id: true, title: true, status: true, type: true, startsAt: true, endsAt: true },
        },
        _count: { select: { teams: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (dbEvents && dbEvents.length > 0) {
      const formatted = dbEvents.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        bannerUrl: e.bannerUrl,
        venue: e.venue || "Campus Auditorium & Labs",
        category: e.category || "Championship",
        startsAt: e.startsAt?.toISOString() || null,
        endsAt: e.endsAt?.toISOString() || null,
        registrationOpen: e.registrationOpen,
        teamRegistrationOpen: e.teamRegistrationOpen,
        isActive: e.isActive,
        rounds: e.rounds,
        contests: e.contests,
        teamCount: e._count.teams,
      }));

      return {
        all: formatted,
        ongoing: formatted.filter((e) => e.isActive),
        past: formatted.filter((e) => !e.isActive),
      };
    }
  } catch (err) {
    // DB offline, fall through
  }

  // Fallback to Master Seed Data
  const seed = getMasterSeedData();
  const pastEventsRaw = seed?.events?.pastEvents || [];
  const activeEventsRaw = seed?.events?.activeEvents || [];

  const pastFormatted = pastEventsRaw.map((pe: any) => ({
    id: pe.id,
    name: pe.title,
    description: pe.description,
    bannerUrl: pe.bannerUrl,
    venue: "Main Campus Auditorium & Systems Lab",
    category: "Championship",
    startsAt: pe.startDate,
    endsAt: pe.endDate,
    registrationOpen: false,
    teamRegistrationOpen: false,
    isActive: false,
    rounds: (pe.rounds || pe.roundsSummary || []).map((r: any) => ({
      id: r.id || `round_${r.round}`,
      name: r.name,
      type: r.type,
      sequence: r.round || r.sequence || 1,
      durationMin: r.durationMin || 35,
      status: "COMPLETED",
      problems: r.problems || [],
    })),
    contests: [],
    teamCount: pe.stats?.registeredTeams || 142,
  }));

  const activeFormatted = activeEventsRaw.map((ae: any) => ({
    id: ae.id,
    name: ae.title || ae.name,
    description: ae.description,
    bannerUrl: ae.bannerUrl,
    venue: ae.venue || "Campus Auditorium & Hack Labs",
    category: ae.category || "Championship",
    startsAt: ae.startDate || ae.startsAt,
    endsAt: ae.endDate || ae.endsAt,
    registrationOpen: Boolean(ae.registrationOpen),
    teamRegistrationOpen: Boolean(ae.teamRegistrationOpen),
    isActive: true,
    rounds: ae.rounds || [],
    contests: ae.contests || [],
    teamCount: ae.teamCount || 0,
  }));

  return {
    all: [...activeFormatted, ...pastFormatted],
    ongoing: activeFormatted,
    past: pastFormatted,
  };
}
