import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    redis.on("error", (err) => {
      console.error("[Redis] connection error:", err.message);
    });
  }
  return redis;
}

export const redisClient = {
  get: async (key: string) => {
    try { return await getRedis().get(key); } catch { return null; }
  },
  set: async (key: string, value: string, ttlSeconds?: number) => {
    try {
      if (ttlSeconds) await getRedis().setex(key, ttlSeconds, value);
      else await getRedis().set(key, value);
    } catch { /* redis optional — DB is source of truth */ }
  },
  del: async (key: string) => {
    try { await getRedis().del(key); } catch {}
  },
  publish: async (channel: string, message: string) => {
    try { await getRedis().publish(channel, message); } catch {}
  },
  subscribe: (channel: string, handler: (msg: string) => void) => {
    const sub = new Redis(process.env.REDIS_URL!);
    sub.subscribe(channel);
    sub.on("message", (_, msg) => handler(msg));
    return () => sub.disconnect();
  },
  incr: async (key: string) => {
    // Return Infinity on Redis failure so callers treat it as "limit exceeded" (deny)
    try { return await getRedis().incr(key); } catch { return Infinity; }
  },
  expire: async (key: string, ttl: number) => {
    try { await getRedis().expire(key, ttl); } catch {}
  },
};

export const CACHE_KEYS = {
  leaderboardIndividual: (eventId: string) => `lb:individual:${eventId}`,
  leaderboardTeam: (eventId: string) => `lb:team:${eventId}`,
  roundScore: (participantId: string, roundId: string) => `score:${participantId}:${roundId}`,
  aiScoreCap: (participantId: string, roundId: string) => `aicap:${participantId}:${roundId}`,
  rateLimit: (key: string) => `rl:${key}`,
  eventConfig: (eventId: string) => `event:${eventId}`,
};
