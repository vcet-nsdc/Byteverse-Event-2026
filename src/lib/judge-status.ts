import axios from "axios";

const rawBase = (process.env.JUDGE0_URL || "http://127.0.0.1:2358").trim();
export const JUDGE_BASE = rawBase.replace(/\/+$/, "").replace(/\/system_info$/, "").replace(/\/about$/, "");
export const JUDGE_KEY = process.env.JUDGE0_API_KEY?.trim() || "";

interface JudgeCache {
  isOnline: boolean;
  lastChecked: number;
}

const cache: JudgeCache = ((globalThis as any).__bv_judge_cache =
  (globalThis as any).__bv_judge_cache || {
    isOnline: false,
    lastChecked: 0,
  });

const CHECK_INTERVAL_MS = 10000; // Check every 10s

export function getJudgeHeaders(): Record<string, string> {
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
  return headers;
}

/**
 * Fast-probe whether Judge0 service is reachable.
 * Uses a 350ms timeout so code execution is never delayed when Judge0 is offline.
 */
export async function isJudge0Available(): Promise<boolean> {
  const now = Date.now();
  if (now - cache.lastChecked < CHECK_INTERVAL_MS && cache.lastChecked > 0) {
    return cache.isOnline;
  }

  try {
    const res = await axios.get(`${JUDGE_BASE}/about`, {
      headers: getJudgeHeaders(),
      timeout: 350,
      validateStatus: () => true, // Any HTTP response means the container is listening
    });

    cache.isOnline = res.status < 500;
    cache.lastChecked = now;
    return cache.isOnline;
  } catch {
    cache.isOnline = false;
    cache.lastChecked = now;
    return false;
  }
}
