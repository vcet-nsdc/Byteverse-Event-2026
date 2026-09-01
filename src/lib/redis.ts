import Redis from "ioredis";

let redis: Redis | null = null;
let subscriber: Redis | null = null;

const channelHandlers = new Map<string, Set<(msg: string) => void>>();

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

function getSubscriber(): Redis {
  if (!subscriber) {
    subscriber = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
    subscriber.on("error", (err) => {
      console.error("[Redis subscriber] error:", err.message);
    });
    subscriber.on("message", (channel, msg) => {
      channelHandlers.get(channel)?.forEach((h) => h(msg));
    });
  }
  return subscriber;
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
  subscribe: (channel: string, handler: (msg: string) => void): (() => void) => {
    if (!channelHandlers.has(channel)) {
      channelHandlers.set(channel, new Set());
      getSubscriber().subscribe(channel).catch(() => {});
    }
    channelHandlers.get(channel)!.add(handler);
    return () => {
      const handlers = channelHandlers.get(channel);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          channelHandlers.delete(channel);
          getSubscriber().unsubscribe(channel).catch(() => {});
        }
      }
    };
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
