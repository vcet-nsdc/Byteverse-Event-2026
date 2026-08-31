import axios from "axios";

const rawBase = (process.env.JUDGE0_URL || "http://localhost:2358").trim();
const JUDGE_BASE = rawBase.replace(/\/+$/, "").replace(/\/system_info$/, "").replace(/\/about$/, "");
const JUDGE_KEY = process.env.JUDGE0_API_KEY?.trim() || "";

const LANG_IDS: Record<string, number> = {
  cpp: 54,
  c: 50,
  java: 62,
  python: 71,
  javascript: 63,
  typescript: 74,
};

interface JudgeSubmission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface JudgeResult {
  token: string;
  status: { id: number; description: string };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
}

function getJudgeHeaders(): Record<string, string> {
  if (!JUDGE_KEY) return {};
  if (JUDGE_BASE.includes("rapidapi.com")) {
    try {
      const host = new URL(JUDGE_BASE).host;
      return {
        "x-rapidapi-key": JUDGE_KEY,
        "x-rapidapi-host": host,
      };
    } catch {
      return { "x-rapidapi-key": JUDGE_KEY };
    }
  }
  return { "X-Auth-Token": JUDGE_KEY };
}

export async function submitToJudge(
  sourceCode: string,
  language: string,
  stdin?: string,
  expectedOutput?: string,
  timeLimitMs = 2000,
  memoryLimitMb = 256
): Promise<string> {
  const langId = LANG_IDS[language];
  if (!langId) throw new Error(`Unsupported language: ${language}`);

  const payload: JudgeSubmission = {
    source_code: sourceCode,
    language_id: langId,
    stdin,
    expected_output: expectedOutput,
    cpu_time_limit: timeLimitMs / 1000,
    memory_limit: memoryLimitMb * 1024,
  };

  const { data } = await axios.post<{ token: string }>(
    `${JUDGE_BASE}/submissions?base64_encoded=false&wait=false`,
    payload,
    { headers: getJudgeHeaders(), timeout: 10000 }
  );

  return data.token;
}

export async function getJudgeResult(token: string): Promise<JudgeResult> {
  const { data } = await axios.get<JudgeResult>(
    `${JUDGE_BASE}/submissions/${token}?base64_encoded=false`,
    { headers: getJudgeHeaders(), timeout: 10000 }
  );
  return data;
}

export function mapJudgeStatus(statusId: number): string {
  const map: Record<number, string> = {
    1: "QUEUED", 2: "RUNNING", 3: "ACCEPTED",
    4: "WRONG_ANSWER", 5: "TIME_LIMIT_EXCEEDED",
    6: "COMPILATION_ERROR", 7: "RUNTIME_ERROR",
    8: "RUNTIME_ERROR", 9: "RUNTIME_ERROR",
    10: "RUNTIME_ERROR", 11: "RUNTIME_ERROR",
    12: "MEMORY_LIMIT_EXCEEDED", 13: "RUNTIME_ERROR",
    14: "RUNTIME_ERROR",
  };
  return map[statusId] ?? "SYSTEM_ERROR";
}
