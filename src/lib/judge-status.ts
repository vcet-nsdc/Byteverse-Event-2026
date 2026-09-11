import axios from "axios";

// Default to Azure VPS if env is not set or empty
const DEFAULT_JUDGE0 = "http://20.196.205.18:2358";
const DEFAULT_KEY = "nsJLGeoqB1du7Yj5CkQpKw6mNtEUW3b8";

export function getJudgeBase(): string {
  const raw = (process.env.JUDGE0_URL || DEFAULT_JUDGE0).trim();
  return raw.replace(/\/+$/, "").replace(/\/system_info$/, "").replace(/\/about$/, "");
}

export const JUDGE_BASE = getJudgeBase();
export const JUDGE_KEY = (process.env.JUDGE0_API_KEY || DEFAULT_KEY).trim();

interface JudgeCache {
  isOnline: boolean;
  lastChecked: number;
}

const cache: JudgeCache = ((globalThis as any).__bv_judge_cache =
  (globalThis as any).__bv_judge_cache || {
    isOnline: true,
    lastChecked: 0,
  });

const SUCCESS_CACHE_MS = 30000;
const FAILURE_CACHE_MS = 5000;

export function getJudgeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const key = process.env.JUDGE0_API_KEY?.trim() || JUDGE_KEY;
  const base = getJudgeBase();

  if (key) {
    if (base.includes("rapidapi.com")) {
      try {
        headers["x-rapidapi-key"] = key;
        headers["x-rapidapi-host"] = new URL(base).host;
      } catch {
        headers["x-rapidapi-key"] = key;
      }
    } else {
      headers["X-Auth-Token"] = key;
    }
  }
  return headers;
}

/**
 * Probe whether Judge0 service is reachable.
 * Uses a generous 2500ms timeout suited for cloud/VPS network latencies.
 */
export async function isJudge0Available(): Promise<boolean> {
  const now = Date.now();
  const cacheTtl = cache.isOnline ? SUCCESS_CACHE_MS : FAILURE_CACHE_MS;
  if (now - cache.lastChecked < cacheTtl && cache.lastChecked > 0) {
    return cache.isOnline;
  }

  const base = getJudgeBase();
  try {
    const res = await axios.get(`${base}/about`, {
      headers: getJudgeHeaders(),
      timeout: 2500, // Accommodate cross-network cloud VPS roundtrips
      validateStatus: () => true, // Any HTTP response means the container is listening
    });

    cache.isOnline = res.status < 500;
    cache.lastChecked = now;
    return cache.isOnline;
  } catch (err: any) {
    console.warn(`[Judge0 Status] Probe to ${base}/about failed (${err.message}).`);
    cache.isOnline = false;
    cache.lastChecked = now;
    return false;
  }
}
