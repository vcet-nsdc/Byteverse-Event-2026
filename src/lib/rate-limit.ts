import { redisClient } from "./redis";
import { NextRequest } from "next/server";

interface RateLimitConfig {
  key: string;
  limit: number;
  windowSeconds: number;
}

export async function checkRateLimit(
  config: RateLimitConfig,
): Promise<boolean> {
  const { key, limit, windowSeconds } = config;
  const count = await redisClient.incr(`rl:${key}`);

  if (!Number.isFinite(count)) {
    return true;
  }

  if (count === 1) await redisClient.expire(`rl:${key}`, windowSeconds);
  return count <= limit;
}

export function getRateLimitKey(req: NextRequest, suffix: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  return `${ip}:${suffix}`;
}
