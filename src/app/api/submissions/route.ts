import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateRoundScore, calculateTeamScore } from "@/lib/scoring";
import axios from "axios";

const LANG_IDS: Record<string, number> = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
};

const rawBase = (process.env.JUDGE0_URL || "http://127.0.0.1:2358").trim();
const JUDGE_BASE = rawBase.replace(/\/+$/, "").replace(/\/system_info$/, "").replace(/\/about$/, "");
const JUDGE_KEY = process.env.JUDGE0_API_KEY?.trim() || "";

function getJudgeHeaders(): Record<string, string> {
  if (!JUDGE_KEY) return {};
  if (JUDGE_BASE.includes("rapidapi.com")) {
    try {
      const host = new URL(JUDGE_BASE).host;
      return { "x-rapidapi-key": JUDGE_KEY, "x-rapidapi-host": host };
    } catch {
      return { "x-rapidapi-key": JUDGE_KEY };
    }
  }
  return { "X-Auth-Token": JUDGE_KEY };
}

const schema = z.object({
  problemId: z.string(),
  roundId: z.string(),
  language: z.string(),
  sourceCode: z.string().min(1).max(65536),
  idempotencyKey: z.string().uuid(),
});

// GET /api/submissions?roundId=... -> fetch existing submissions for the participant
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roundId = searchParams.get("roundId");
  if (!roundId) {
    return NextResponse.json({ error: "roundId is required" }, { status: 400 });
  }

  const submissions = await db.submission.findMany({
    where: {
      userId: session.user.id,
      roundId,
    },
    select: {
      id: true,
      problemId: true,
      status: true,
      rawScore: true,
      finalScore: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(submissions);
}

// POST /api/submissions -> Instant synchronous evaluation against test cases + Instant Score Update
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const { problemId, roundId, language, sourceCode, idempotencyKey } = parsed.data;
  const userId = session.user.id;

  // Prevent re-submitting an already submitted problem
  const existingSub = await db.submission.findFirst({
    where: { userId, problemId, roundId },
    orderBy: { submittedAt: "desc" },
  });
  if (existingSub) {
    return NextResponse.json(
      {
        error: "You have already submitted a solution for this problem. You cannot submit again.",
        alreadySubmitted: true,
        submissionId: existingSub.id,
        status: existingSub.status,
        rawScore: existingSub.rawScore,
      },
      { status: 400 }
    );
  }

  const problem = await db.problem.findUnique({
    where: { id: problemId },
    include: { testCases: true },
  });
  if (!problem) return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  if (!problem.allowedLangs.includes(language)) {
    return NextResponse.json({ error: "Language not allowed" }, { status: 400 });
  }

  const round = await db.round.findUnique({ where: { id: roundId }, include: { event: true } });
  if (round?.status !== "ACTIVE" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Round is not active" }, { status: 403 });
  }

  const langId = LANG_IDS[language];
  if (!langId) {
    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
  }

  // Evaluate against all test cases synchronously via Judge0
  const testCases = problem.testCases || [];
  let passedCount = 0;
  let finalStatus = "ACCEPTED";
  let maxTime = 0;
  let maxMemoryKb = 0;
  let lastCompileOutput = "";
  let lastStderr = "";
  let lastStdout = "";
  let lastToken = "";

  try {
    const timeLimitSec = Math.max(1, (problem.timeLimitMs || 2000) / 1000);
    const memoryLimitKb = (problem.memoryLimitMb || 256) * 1024;

    if (testCases.length === 0) {
      // If no test cases defined, run once with blank stdin
      const res = await axios.post(
        `${JUDGE_BASE}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: sourceCode,
          language_id: langId,
          stdin: "",
          cpu_time_limit: timeLimitSec,
          memory_limit: memoryLimitKb,
        },
        { headers: getJudgeHeaders(), timeout: 15000 }
      );
      const data = res.data;
      lastToken = data.token || "";
      if (data.status?.id === 3) {
        passedCount = 1;
        finalStatus = "ACCEPTED";
      } else {
        finalStatus = data.status?.description?.toUpperCase().replace(/\s+/g, "_") || "WRONG_ANSWER";
        lastCompileOutput = data.compile_output || "";
        lastStderr = data.stderr || "";
      }
    } else {
      // Run each testcase sequentially against Judge0
      for (const tc of testCases) {
        const res = await axios.post(
          `${JUDGE_BASE}/submissions?base64_encoded=false&wait=true`,
          {
            source_code: sourceCode,
            language_id: langId,
            stdin: tc.input || "",
            expected_output: tc.expected || "",
            cpu_time_limit: timeLimitSec,
            memory_limit: memoryLimitKb,
          },
          { headers: getJudgeHeaders(), timeout: 15000 }
        );

        const data = res.data;
        lastToken = data.token || lastToken;
        if (data.time) maxTime = Math.max(maxTime, parseFloat(data.time));
        if (data.memory) maxMemoryKb = Math.max(maxMemoryKb, data.memory);

        // Check if output matches
        const actualOutput = (data.stdout || "").trim();
        const expectedOutput = (tc.expected || "").trim();
        const isMatch = (data.status?.id === 3) || (actualOutput === expectedOutput);

        if (isMatch) {
          passedCount++;
          lastStdout = data.stdout || lastStdout;
        } else {
          // Record reason for failure
          if (data.status?.id === 6) {
            finalStatus = "COMPILATION_ERROR";
            lastCompileOutput = data.compile_output || "";
            break; // Stop testing on compile error
          } else if (data.status?.id === 5) {
            if (finalStatus === "ACCEPTED") finalStatus = "TIME_LIMIT_EXCEEDED";
          } else if (data.status?.id >= 7 && data.status?.id <= 12) {
            if (finalStatus === "ACCEPTED") finalStatus = "RUNTIME_ERROR";
            lastStderr = data.stderr || "";
          } else {
            if (finalStatus === "ACCEPTED") finalStatus = "WRONG_ANSWER";
          }
        }
      }
    }

    const totalCases = testCases.length || 1;
    if (passedCount === totalCases) {
      finalStatus = "ACCEPTED";
    }

    // Compute points earned (100 points per problem standard)
    const problemMaxPoints = 100;
    const earnedPoints = totalCases > 0
      ? Math.round((passedCount / totalCases) * problemMaxPoints)
      : (finalStatus === "ACCEPTED" ? problemMaxPoints : 0);

    // Persist submission record
    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        roundId,
        language,
        sourceCode,
        idempotencyKey,
        judgeToken: lastToken || undefined,
        status: finalStatus as any,
        rawScore: earnedPoints,
        finalScore: earnedPoints,
        executionTimeMs: Math.round(maxTime * 1000),
        memoryUsedMb: Math.round((maxMemoryKb / 1024) * 100) / 100,
        aiScoreCap: 100,
        judgedAt: new Date(),
      },
    });

    // Recalculate participant's total round score across all problems
    const allUserSubmissions = await db.submission.findMany({
      where: { userId, roundId },
      select: { problemId: true, finalScore: true },
    });

    const bestScores = new Map<string, number>();
    for (const sub of allUserSubmissions) {
      const cur = bestScores.get(sub.problemId) ?? 0;
      if ((sub.finalScore ?? 0) > cur) {
        bestScores.set(sub.problemId, sub.finalScore ?? 0);
      }
    }
    const totalRoundScore = Array.from(bestScores.values()).reduce((sum, val) => sum + val, 0);

    // Instant update to RoundScore
    await updateRoundScore(userId, roundId, totalRoundScore);

    // Instant update to TeamScore if user is in a team
    try {
      const membership = await db.teamMember.findFirst({ where: { userId } });
      if (membership) {
        await calculateTeamScore(membership.teamId, roundId);
      }
    } catch (teamErr) {
      console.error("[Team Score Update Error]:", teamErr);
    }

    return NextResponse.json({
      submissionId: submission.id,
      status: finalStatus,
      testCasesPassed: passedCount,
      totalTestCases: totalCases,
      rawScore: earnedPoints,
      totalRoundScore,
      compile_output: lastCompileOutput,
      stderr: lastStderr,
      stdout: lastStdout,
      message: finalStatus === "ACCEPTED"
        ? "Solution Accepted! All test cases passed."
        : `${passedCount}/${totalCases} test cases passed (${finalStatus.replace(/_/g, " ")}).`,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Judge0 Submission Error]:", errMsg);
    return NextResponse.json(
      {
        error: "Judge0 execution engine is unreachable. Please verify JUDGE0_URL and API Key.",
        details: errMsg,
        status: "SYSTEM_ERROR",
      },
      { status: 503 }
    );
  }
}
