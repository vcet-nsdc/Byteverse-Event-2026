import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redisClient } from "@/lib/redis";
import axios from "axios";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

import { isJudge0Available, getJudgeHeaders, JUDGE_BASE } from "@/lib/judge-status";

const MAX_RUNS_PER_PROBLEM = 15;

const LANG_IDS: Record<string, number> = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
};

const runSchema = z.object({
  problemId: z.string(),
  roundId: z.string().optional().nullable(),
  language: z.enum(["cpp", "c", "java", "python"]),
  sourceCode: z.string().max(65536),
  customInput: z.string().max(32768).optional().default(""),
});

import { runLocally } from "@/lib/local-runner";


export async function POST(req: NextRequest) {
  const session = await auth();
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

  // If inside an official tournament round, require active authenticated session
  if (roundId) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required for official rounds." }, { status: 401 });
    }
    try {
      const round = await db.round.findUnique({ where: { id: roundId } });
      if (round && round.status !== "ACTIVE" && process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Round is not active" }, { status: 403 });
      }
    } catch {
      // Database offline
    }
  }

  const userId = session?.user?.id || "practice_guest";
  let currentRuns = 1;

  // Rate tracking with graceful offline fallback
  try {
    const trackingKey = `compile:${userId}:${problemId}`;
    currentRuns = await redisClient.incr(trackingKey);
    if (currentRuns === 1) await redisClient.expire(trackingKey, 6 * 60 * 60);
  } catch {
    // Redis offline, proceed smoothly
  }

  const langId = LANG_IDS[language];
  if (!langId) {
    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
  }

  const judgeAvailable = await isJudge0Available();
  if (judgeAvailable) {
    try {
      const { data } = await axios.post(
        `${JUDGE_BASE}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: sourceCode,
          language_id: langId,
          stdin: customInput,
          cpu_time_limit: 3.0,
          memory_limit: 256 * 1024,
        },
        { headers: getJudgeHeaders(), timeout: 15000 }
      );

      return NextResponse.json({
        stdout: data.stdout ?? "",
        stderr: data.stderr ?? "",
        compile_output: data.compile_output ?? "",
        time: data.time ?? "0.00",
        memory: data.memory ?? 0,
        status: data.status?.description ?? "ACCEPTED",
        runsUsed: currentRuns,
        runsLeft: Math.max(0, MAX_RUNS_PER_PROBLEM - currentRuns),
      });
    } catch (judgeErr: any) {
      console.warn("[Submissions/Run] Judge0 execution error, attempting local fallback:", judgeErr.message);
      // Judge0 execution failed mid-flight, immediately fallback to local execution
    }
  }

  // High-Speed Local Execution Engine (sub-second MinGW GCC / Python)
  try {
    const localResult = await runLocally(language, sourceCode, customInput);
    return NextResponse.json({
      ...localResult,
      runsUsed: currentRuns,
      runsLeft: Math.max(0, MAX_RUNS_PER_PROBLEM - currentRuns),
    });
  } catch (fallbackErr: any) {
    return NextResponse.json({
      stdout: "",
      stderr: fallbackErr.message || "Execution error",
      compile_output: fallbackErr.message || "",
      time: "0.00",
      memory: 0,
      status: "ERROR",
      runsUsed: currentRuns,
      runsLeft: Math.max(0, MAX_RUNS_PER_PROBLEM - currentRuns),
    });
  }
}
