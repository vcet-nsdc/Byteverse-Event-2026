import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

const MAX_RUNS_PER_PROBLEM = 10;
const rawBase = (process.env.JUDGE0_URL || "http://127.0.0.1:2358").trim();
const JUDGE_BASE = rawBase.replace(/\/+$/, "").replace(/\/system_info$/, "").replace(/\/about$/, "");
const JUDGE_KEY = process.env.JUDGE0_API_KEY?.trim() || "";

const LANG_IDS: Record<string, number> = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
};

const runSchema = z.object({
  problemId: z.string(),
  roundId: z.string(),
  language: z.enum(["cpp", "c", "java", "python"]),
  sourceCode: z.string().max(65536),
  customInput: z.string().max(32768).optional().default(""),
});

// In-memory / cache tracker for compile counts per user per problem
const compileTracker = new Map<string, number>();

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

  const parsed = runSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { problemId, roundId, language, sourceCode, customInput } = parsed.data;
  const userId = session.user.id;

  const round = await db.round.findUnique({ where: { id: roundId } });
  if (round && round.status !== "ACTIVE" && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Round is not active" }, { status: 403 });
  }

  const trackingKey = `${userId}:${problemId}`;
  const currentRuns = compileTracker.get(trackingKey) ?? 0;

  if (currentRuns >= MAX_RUNS_PER_PROBLEM) {
    return NextResponse.json(
      {
        error: `Compile limit reached (${MAX_RUNS_PER_PROBLEM}/${MAX_RUNS_PER_PROBLEM} runs used for this problem). Please submit your final solution.`,
        runsLeft: 0,
      },
      { status: 429 }
    );
  }

  const langId = LANG_IDS[language];
  if (!langId) {
    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
  }

  try {
    const headers: Record<string, string> = {};
    if (JUDGE_KEY) {
      if (JUDGE_BASE.includes("rapidapi.com")) {
        try {
          headers["x-rapidapi-key"] = JUDGE_KEY;
          headers["x-rapidapi-host"] = new URL(JUDGE_BASE).host;
        } catch {
          headers["x-rapidapi-key"] = JUDGE_KEY;
        }
      } else {
        headers["X-Auth-Token"] = JUDGE_KEY;
      }
    }

    const { data } = await axios.post(
      `${JUDGE_BASE}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: sourceCode,
        language_id: langId,
        stdin: customInput,
        cpu_time_limit: 2.0,
        memory_limit: 256 * 1024,
      },
      { headers, timeout: 12000 }
    );

    const newRuns = currentRuns + 1;
    compileTracker.set(trackingKey, newRuns);

    return NextResponse.json({
      stdout: data.stdout ?? "",
      stderr: data.stderr ?? "",
      compile_output: data.compile_output ?? "",
      time: data.time ?? "0.00",
      memory: data.memory ?? 0,
      status: data.status?.description ?? "UNKNOWN",
      runsUsed: newRuns,
      runsLeft: Math.max(0, MAX_RUNS_PER_PROBLEM - newRuns),
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Judge0 Run Error]:", errMsg);

    return NextResponse.json(
      {
        error: "Judge0 execution engine is unreachable. Please verify JUDGE0_URL and API Key.",
        stderr: `Judge0 Connection Error: ${errMsg}`,
        compile_output: "",
        time: "0.00",
        memory: 0,
        status: "SYSTEM_ERROR",
        runsUsed: currentRuns,
        runsLeft: Math.max(0, MAX_RUNS_PER_PROBLEM - currentRuns),
      },
      { status: 503 }
    );
  }
}
