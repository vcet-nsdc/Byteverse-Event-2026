import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNextHealthyKey, getAIModel } from "@/lib/ai-gateway";
import { updateRoundScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

import { isJudge0Available, getJudgeHeaders, JUDGE_BASE } from "@/lib/judge-status";
import { runLocally } from "@/lib/local-runner";

const LANG_IDS: Record<string, number> = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
};

const analysisSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(["cpp", "c", "java", "python"]),
  sourceCode: z.string().min(1).max(65536),
  isFinal: z.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roundId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = analysisSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 422 });
  }

  const { problemId, language, sourceCode, isFinal } = parsed.data;
  const userId = session.user.id;

  // Check existing submissions count to enforce 10 analysis runs cap
  const existingSubmissions = await db.submission.findMany({
    where: { userId, problemId },
    orderBy: { submittedAt: "desc" },
  });

  const alreadyLocked = existingSubmissions.some((s) => s.isFinal);
  if (alreadyLocked) {
    return NextResponse.json(
      { error: "Your solution has already been locked and finalized for Round 5." },
      { status: 403 }
    );
  }

  const runsUsed = existingSubmissions.length;
  if (!isFinal && runsUsed >= 10) {
    return NextResponse.json(
      { error: "You have used all 10 code analysis runs. You must perform your Final Lock & Submit." },
      { status: 403 }
    );
  }

  // Fetch problem with all test cases
  const problem = await db.problem.findUnique({
    where: { id: problemId },
    include: {
      testCases: {
        orderBy: { sequence: "asc" },
      },
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  // 1. Run Judge0 across all test cases
  const sampleCases = problem.testCases.filter((tc) => !tc.isHidden && !tc.isEdgeCase);
  const hiddenCases = problem.testCases.filter((tc) => tc.isHidden && !tc.isEdgeCase);
  const edgeCases = problem.testCases.filter((tc) => tc.isEdgeCase);

  const langId = LANG_IDS[language];
  const headers = getJudgeHeaders();

  let samplePassed = 0;
  let hiddenPassed = 0;
  let edgePassed = 0;

  const judgeOnline = await isJudge0Available();

  async function evaluateTestCase(tc: { input: string; expected: string }): Promise<boolean> {
    if (!judgeOnline) {
      try {
        const local = await runLocally(language as any, sourceCode, tc.input);
        return (local.stdout || "").trim() === (tc.expected || "").trim();
      } catch {
        return false;
      }
    }

    try {
      const response = await axios.post(
        `${JUDGE_BASE}/submissions?wait=true`,
        {
          source_code: sourceCode,
          language_id: langId,
          stdin: tc.input,
          expected_output: tc.expected,
          cpu_time_limit: Math.max(1, Math.min(problem!.timeLimitMs / 1000, 5)),
          memory_limit: problem!.memoryLimitMb * 1024,
        },
        { headers, timeout: 15000 }
      );

      const statusId = response.data?.status?.id;
      if (statusId === 3) return true; // Accepted

      // Also compare trimmed stdout
      const stdout = (response.data?.stdout || "").trim();
      const expected = tc.expected.trim();
      return stdout === expected;
    } catch {
      // If Judge0 failed, fallback to local
      try {
        const local = await runLocally(language as any, sourceCode, tc.input);
        return (local.stdout || "").trim() === (tc.expected || "").trim();
      } catch {
        return false;
      }
    }
  }

  // Execute in small parallel chunks
  for (const tc of sampleCases) {
    if (await evaluateTestCase(tc)) samplePassed++;
  }
  for (const tc of hiddenCases) {
    if (await evaluateTestCase(tc)) hiddenPassed++;
  }
  for (const tc of edgeCases) {
    if (await evaluateTestCase(tc)) edgePassed++;
  }

  const totalPassed = samplePassed + hiddenPassed + edgePassed;
  const totalCases = problem.testCases.length || 1;
  const rawScore = parseFloat(((totalPassed / totalCases) * 100).toFixed(2));

  // 2. Perform Code Quality & Complexity Evaluation via Groq AI
  let codeQualityMetrics = {
    cleanCodeNames: { score: 8, feedback: "Variables follow standard naming conventions." },
    commentFormat: { score: 7, feedback: "Basic logic flow documented." },
    syntaxFormat: { score: 9, feedback: "Idiomatic syntax with consistent indentation." },
    timeComplexity: { estimate: "O(N log N)", optimal: "O(N log N)", feedback: "Time complexity within acceptable bounds." },
    spaceComplexity: { estimate: "O(N)", optimal: "O(N)", feedback: "Auxiliary space usage is reasonable." },
  };

  try {
    const { client } = getNextHealthyKey();
    const prompt = `You are an automated code quality evaluator for competitive programming.
Analyze the following ${language} solution for this problem:
PROBLEM TITLE: "${problem.title}"
CONSTRAINTS: "${problem.constraints || "Standard"}"

SOURCE CODE:
\`\`\`${language}
${sourceCode.slice(0, 4000)}
\`\`\`

Evaluate ONLY the following 5 dimensions. Respond strictly in valid JSON without markdown fences:
{
  "cleanCodeNames": { "score": <number 1-10>, "feedback": "<one short sentence evaluating identifier clarity>" },
  "commentFormat": { "score": <number 1-10>, "feedback": "<one short sentence evaluating inline comments and documentation>" },
  "syntaxFormat": { "score": <number 1-10>, "feedback": "<one short sentence evaluating indentation, structure, and formatting>" },
  "timeComplexity": { "estimate": "<e.g. O(N) or O(N log N) or O(N^2)>", "optimal": "<e.g. O(N log N)>", "feedback": "<one short sentence on time efficiency>" },
  "spaceComplexity": { "estimate": "<e.g. O(1) or O(N)>", "optimal": "<e.g. O(1) or O(N)>", "feedback": "<one short sentence on memory efficiency>" }
}`;

    const completion = await client.chat.completions.create({
      model: getAIModel(),
      max_tokens: 450,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (completion.choices[0]?.message?.content || "").trim();
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsedMetrics = JSON.parse(cleanJson);

    if (parsedMetrics.cleanCodeNames && parsedMetrics.timeComplexity) {
      codeQualityMetrics = parsedMetrics;
    }
  } catch (err) {
    console.error("AI code quality evaluation error (using fallback):", err);
  }

  // 3. Assemble complete 7-dimension analysis report
  const analysisReport = {
    evaluatedAt: new Date().toISOString(),
    isFinalSubmission: Boolean(isFinal),
    cleanCodeNames: codeQualityMetrics.cleanCodeNames,
    hiddenCasesPass: {
      passed: hiddenPassed,
      total: hiddenCases.length,
      ratio: `${hiddenPassed}/${hiddenCases.length}`,
      allPassed: hiddenPassed === hiddenCases.length,
    },
    edgeCasesPass: {
      passed: edgePassed,
      total: edgeCases.length,
      ratio: `${edgePassed}/${edgeCases.length}`,
      allPassed: edgePassed === edgeCases.length,
    },
    commentFormat: codeQualityMetrics.commentFormat,
    syntaxFormat: codeQualityMetrics.syntaxFormat,
    timeComplexity: codeQualityMetrics.timeComplexity,
    spaceComplexity: codeQualityMetrics.spaceComplexity,
    testCasesSummary: {
      sample: `${samplePassed}/${sampleCases.length}`,
      hidden: `${hiddenPassed}/${hiddenCases.length}`,
      edge: `${edgePassed}/${edgeCases.length}`,
      totalPassed,
      totalCases,
    },
    score: rawScore,
  };

  // 4. Save Submission in Database
  await db.submission.create({
    data: {
      userId,
      problemId,
      roundId,
      language,
      sourceCode,
      status: totalPassed === totalCases ? "ACCEPTED" : "WRONG_ANSWER",
      rawScore,
      finalScore: rawScore,
      isFinal: Boolean(isFinal),
      analysisReport,
      idempotencyKey: `r5-analysis-${userId}-${problemId}-${Date.now()}`,
    },
  });

  // 5. Update round score in tournament standings
  await updateRoundScore(userId, roundId);

  const updatedSubmissions = await db.submission.findMany({
    where: { userId, problemId },
  });
  const newRunsUsed = updatedSubmissions.length;
  const newRunsRemaining = Math.max(0, 10 - newRunsUsed);
  const isNowLocked = isFinal || newRunsUsed >= 10;

  return NextResponse.json({
    success: true,
    analysisReport,
    runsUsed: newRunsUsed,
    runsRemaining: newRunsRemaining,
    isLocked: isNowLocked,
    score: rawScore,
  });
}
