/**
 * Groq Multi-Key Round-Robin Pool with Real-Time Token & Multi-Account Tracking,
 * Automatic Rate-Limit Failover, Round-Aware Socratic Prompts, and Admin Health Telemetry.
 *
 * Multi-Key Rotation Architecture:
 *   - Parses up to 15 comma-separated Groq API keys from AI_API_KEYS
 *   - Tracks per-key token metrics, request counters, and error states
 *   - Automatically detects 429 / TPM / RPM rate limits and puts key on 60s cooldown
 *   - Automatically fails over to the next healthy key in the pool
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { db } from "./db";

// ─── Key Pool Extraction & State Tracking ────────────────────────────────────
function getRawKeys(): string[] {
  let raw = process.env.AI_API_KEYS ?? process.env.AI_API_KEY ?? "";
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^AI_API_KEYS\s*=\s*(.+)$/m);
      if (match && match[1]) {
        raw = match[1].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // ignore
  }

  return raw
    .split(",")
    .map((k) => k.trim())
    .filter((k) => Boolean(k) && !k.includes("your_groq_api_key"));
}

export interface KeyTelemetry {
  index: number;
  maskedKey: string;
  totalRequests: number;
  dailyLimit: number; // 14,400 Requests per day
  dailyRemaining: number;
  rpmLimit: number; // 30 Requests per minute
  currentRpm: number;
  peakRpm: number;
  tpmLimit: number; // 18,000 Tokens per minute
  currentTpm: number;
  peakTpm: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  lastUsedAt: string | null;
  status: "HEALTHY" | "COOLDOWN" | "ERROR";
  cooldownUntil: number;
  lastError: string | null;
  lastLatencyMs: number | null;
}

// In-memory key telemetry tracker (persists across API invocations in server process)
const keyTelemetryMap: Map<number, KeyTelemetry> = new Map();
const keyMinuteWindows: Map<number, Array<{ timestamp: number; tokens: number }>> = new Map();

function maskApiKey(key: string): string {
  if (key.length <= 10) return "gsk_••••••••";
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`;
}

// Initialize telemetry for all keys in pool
function getOrInitKeyTelemetry(index: number): KeyTelemetry {
  const rawKeys = getRawKeys();
  const dailyLimit = 14400; // Groq Daily Exhaustion Point
  const rpmLimit = 30;     // Groq Minute Exhaustion Point
  const tpmLimit = 18000;  // Groq Token Trap (18,000 TPM)
  const raw = rawKeys[index] ?? "";

  // Prune 60-second sliding window
  const now = Date.now();
  const window = (keyMinuteWindows.get(index) ?? []).filter((item) => item.timestamp > now - 60000);
  keyMinuteWindows.set(index, window);
  const currentRpm = window.length;
  const currentTpm = window.reduce((sum, item) => sum + item.tokens, 0);

  let stats = keyTelemetryMap.get(index);
  if (!stats) {
    stats = {
      index,
      maskedKey: maskApiKey(raw),
      totalRequests: 0,
      totalTokens: 0,
      promptTokens: 0,
      completionTokens: 0,
      lastUsedAt: null,
      status: "HEALTHY",
      cooldownUntil: 0,
      lastError: null,
      lastLatencyMs: null,
      dailyLimit,
      dailyRemaining: dailyLimit,
      rpmLimit,
      currentRpm,
      peakRpm: currentRpm,
      tpmLimit,
      currentTpm,
      peakTpm: currentTpm,
    };
    keyTelemetryMap.set(index, stats);
  } else {
    stats.maskedKey = maskApiKey(raw);
    stats.dailyLimit = dailyLimit;
    stats.dailyRemaining = Math.max(0, dailyLimit - stats.totalRequests);
    stats.rpmLimit = rpmLimit;
    stats.currentRpm = currentRpm;
    stats.peakRpm = Math.max(stats.peakRpm || 0, currentRpm);
    stats.tpmLimit = tpmLimit;
    stats.currentTpm = currentTpm;
    stats.peakTpm = Math.max(stats.peakTpm || 0, currentTpm);
  }
  return stats;
}

let _keyCursor = 0;

export function getAIModel(): string {
  const model = process.env.AI_MODEL?.trim();
  if (!model || model.includes("invalid")) {
    return "qwen/qwen3.8-27b";
  }
  return model;
}

export function getFailoverAIModel(): string {
  const failover = process.env.AI_FAILOVER_MODEL?.trim();
  if (failover) return failover;
  const primary = getAIModel();
  if (primary.includes("qwen")) {
    return "qwen/qwen3.6-27b";
  }
  return "llama-3.3-70b-versatile";
}

/**
 * Finds the next available healthy key that is not in rate-limit cooldown
 */
export function getNextHealthyKey(): { client: OpenAI; index: number } {
  const rawKeys = getRawKeys();
  if (rawKeys.length === 0) {
    throw new Error(
      "No valid Groq AI API keys configured. Please add a valid Groq key to AI_API_KEYS in your .env file."
    );
  }

  const now = Date.now();
  const poolSize = rawKeys.length;

  // Search for the first healthy key starting from current cursor
  for (let i = 0; i < poolSize; i++) {
    const candidateIdx = (_keyCursor + i) % poolSize;
    const stats = getOrInitKeyTelemetry(candidateIdx);

    // If cooldown has expired, restore to HEALTHY
    if (stats.status === "COOLDOWN" && now >= stats.cooldownUntil) {
      stats.status = "HEALTHY";
      stats.lastError = null;
    }

    if (stats.status === "HEALTHY") {
      _keyCursor = (candidateIdx + 1) % poolSize;
      const key = rawKeys[candidateIdx];
      const client = new OpenAI({
        apiKey: key,
        baseURL: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
      });
      return { client, index: candidateIdx };
    }
  }

  // If all keys are in cooldown, take the key with the earliest cooldown expiry
  let earliestIdx = 0;
  let earliestCooldown = Infinity;
  for (let i = 0; i < poolSize; i++) {
    const stats = getOrInitKeyTelemetry(i);
    if (stats.cooldownUntil < earliestCooldown) {
      earliestCooldown = stats.cooldownUntil;
      earliestIdx = i;
    }
  }

  const client = new OpenAI({
    apiKey: rawKeys[earliestIdx],
    baseURL: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
  });
  return { client, index: earliestIdx };
}

// ─── Tournament Lifetime Limits ──────────────────────────────────────────────
const LIFETIME_LIMITS = {
  EXPLAIN: 15, // 15 Chat prompts across entire tournament
  CODE: 25,    // 25 Code prompts across entire tournament
} as const;

export async function getLifetimeUsage(
  userId: string
): Promise<{ explainUsed: number; codeUsed: number; explainLeft: number; codeLeft: number }> {
  const [explainCount, codeCount] = await Promise.all([
    db.aIUsage.count({ where: { userId, type: "EXPLAIN" } }),
    db.aIUsage.count({ where: { userId, type: "CODE" } }),
  ]);

  return {
    explainUsed: explainCount,
    codeUsed: codeCount,
    explainLeft: Math.max(0, LIFETIME_LIMITS.EXPLAIN - explainCount),
    codeLeft: Math.max(0, LIFETIME_LIMITS.CODE - codeCount),
  };
}

// ─── Round-Specific Integrity Instructions ──────────────────────────────────
const ROUND_SPECIFIC_GUIDELINES: Record<string, string> = {
  CODE_LOGIC: `CURRENT ARENA: Round 1 — Logic Tracing & Multiple-Choice Questions.
- The participant is analyzing a short code snippet to determine output or pick an MCQ option.
- STRICT RULE: YOU MUST NEVER compute loop outputs, print outputs, trace iterations to the end, or reveal whether option A/B/C/D is correct.
- ALLOWED: Explain the underlying operator or language concept (e.g. post-increment vs pre-increment, short-circuit boolean evaluation, static memory lifetime, pointer dereferencing) directly and clearly.`,

  AI_REPAIR: `CURRENT ARENA: Round 2 — AI Code Optimization & Bug Repair.
- The participant is optimizing inefficient or subtly flawed code.
- RULE: You may provide at most ONE generic code snippet of MAXIMUM 5 LINES illustrating an efficient data structure or pattern (e.g. hash map lookup or priority queue), but NEVER provide the full bug fix or write complete functions.`,

  TRADITIONAL: `CURRENT ARENA: Round 3 — DSA & Algorithmic Problem Solving.
- The participant is solving Data Structures & Algorithms challenges.
- RULE: You may provide at most ONE generic code snippet of MAXIMUM 5 LINES illustrating a core algorithmic construct (e.g. two-pointer while loop or binary search skeleton), but NEVER write complete functions or full solutions.`,

  TYPE_TRANSFORM: `CURRENT ARENA: Round 4 — Multi-Language Refactoring & Translation.
- The participant is translating and refactoring logic across languages.
- RULE: You may provide at most ONE generic code snippet of MAXIMUM 5 LINES illustrating target language syntax (e.g. vector iteration in C++ or ArrayList usage in Java), but NEVER translate the entire program.`,

  HUMAN_VS_MACHINE: `CURRENT ARENA: Round 5 — Human vs Machine Grand Finale.
- High-difficulty competitive coding championship finale.
- RULE: You may provide at most ONE generic code snippet of MAXIMUM 5 LINES showing a mathematical invariant or recurrence skeleton, but NEVER provide the complete solution.`,
};

// ─── Base Socratic System Prompts ────────────────────────────────────────────
const BASE_SYSTEM_PROMPTS = {
  EXPLAIN: `You are Navigator, a helpful, friendly AI programming mentor for competitive coding.
Your mission is to guide participants through logic, concepts, and algorithmic thinking in a natural, warm, and approachable way.

RULES OF ENGAGEMENT:
1. Friendly, User-Centric Tone:
   - Speak naturally and encouragingly, like a supportive senior teammate or coding mentor.
   - NEVER use robotic meta-language or disclaimers like "I have been configured by the admin...", "According to tournament rules, I cannot...", "As an AI model set by the organizers...", or "Platform restrictions prevent me...".
   - Simply explain and guide them warmly without breaking character.
2. Conceptual & Structural Guidance:
   - When asked about a code snippet, loop, or logic problem, explain the underlying principles clearly (e.g. operator precedence, pointer references, mutability, caching mechanisms, or asymptotic complexity).
   - Explain the mechanism or principle directly and concisely so the participant understands how the code operates.
3. No Direct Execution or Option Reveals:
   - Do NOT say "The output is ...", "It prints ...", or "Option B is correct".
   - Instead, explain how the mechanism functions so the participant can determine the right answer themselves.
4. Strictly Prohibited Phrases:
   - NEVER say "Grab your scratchpad", "dry-run on paper", "trace on your notepad", or similar patronizing phrases.
   - Avoid cliché teacher phrases. Explain concepts cleanly and directly.
5. Brevity:
   - Keep answers clear, supportive, and strictly under 160 words.`,

  CODE: `You are Forge, the official AI Code Advisor for competitive coding.
Your mission is to assist participants with syntax gotchas, algorithmic patterns, and optimization guidance.

CRITICAL CODE RULES:
1. AT MOST 5 LINES OF CODE PER RESPONSE:
   - You ARE ALLOWED to provide at most ONE short code snippet of MAXIMUM 5 LINES to demonstrate a core logic pattern, loop construct, standard library syntax, or data structure usage.
   - Example allowed: a 3-line two-pointer iteration skeleton, a 4-line priority queue comparator, or a 2-line recursion base case.
2. NEVER PROVIDE FULL SOLUTIONS OR COMPLETE FUNCTIONS:
   - You MUST NEVER write full programs, complete functions, solve the whole problem, or write ready-to-submit code.
   - You must leave the implementation, variable definitions, and orchestration to the participant.
3. NEVER REVEAL OR FIX HIDDEN TEST CASES OR EDGE CASES:
   - DO NOT reveal or write code tailored to hidden test cases or extreme edge cases (such as integer overflow boundaries, empty input handling, negative number modulo quirks, null edge cases, or large scale limits).
   - Only provide the generic core logic pattern (e.g. binary search template or frequency map lookup). The participant must independently reason about and handle edge cases and constraints.
4. Tone & Brevity:
   - Practical, concise, encouraging, and under 160 words. Speak naturally as a helpful competitive programming mentor without robotic disclaimers.`,
};

// ─── Input Sanitizer (Anti-Injection) ────────────────────────────────────────
const BLOCKED_PATTERNS = [
  /ignore.{0,20}(previous|prior|above|system)/gi,
  /pretend.{0,15}(you|ur|u).{0,10}(are|r)/gi,
  /roleplay/gi,
  /bypass/gi,
  /jailbreak/gi,
  /DAN\b/gi,
];

function sanitizeInput(prompt: string): string {
  const trimmed = prompt.slice(0, 1000);
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new Error(
        "Your prompt was flagged by our integrity filter. Please rephrase your question to focus on the problem at hand."
      );
    }
  }
  return trimmed;
}

// ─── Response Code & Output Stripping Safety Net ─────────────────────────────
function sanitizeAIResponse(response: string, type?: "EXPLAIN" | "CODE"): string {
  let cleaned = response.trim();

  // For EXPLAIN (chat), ensure no multiline code blocks are outputted
  if (type === "EXPLAIN") {
    cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
      const lines = match.split("\n").filter((l) => l.trim() !== "" && !l.trim().startsWith("```"));
      if (lines.length > 2) {
        return "\n> [Code block omitted. Focus on the core algorithmic concept.]\n";
      }
      return match;
    });
  } else {
    // For CODE, allow up to 5 lines of core logic snippet. Truncate if more than 5 lines.
    cleaned = cleaned.replace(/```(?:[a-zA-Z]*)\n([\s\S]*?)```/g, (match, codeBlock) => {
      const lines = codeBlock.split("\n");
      if (lines.length > 5) {
        const allowedSnippet = lines.slice(0, 5).join("\n");
        return `\`\`\`\n${allowedSnippet}\n// ... [Remainder truncated to 5 lines maximum. Complete the implementation in your workspace.]\n\`\`\``;
      }
      return match;
    });
  }

  return cleaned;
}

// ─── Main AI Call Function with Real-Time Telemetry & Failover ───────────────
export async function callAI(
  userId: string,
  roundId: string,
  type: "EXPLAIN" | "CODE",
  userMessage: string,
  problemId?: string | null
): Promise<{ response: string; usage: { explainLeft: number; codeLeft: number } }> {
  // 1. Check lifetime tournament limits
  const currentUsage = await getLifetimeUsage(userId);
  const limit = LIFETIME_LIMITS[type];
  const used = type === "EXPLAIN" ? currentUsage.explainUsed : currentUsage.codeUsed;

  if (used >= limit) {
    const label = type === "EXPLAIN" ? "AI Chat" : "AI Code";
    throw new Error(
      `Tournament ${label} limit reached (${limit}/${limit} used). Complete remaining problems using your own knowledge and logic.`
    );
  }

  // 2. Fetch Round details for round-specific Socratic conditioning
  const round = await db.round.findUnique({
    where: { id: roundId },
    select: { sequence: true, name: true, type: true },
  });

  const roundGuideline = round?.type && ROUND_SPECIFIC_GUIDELINES[round.type]
    ? ROUND_SPECIFIC_GUIDELINES[round.type]
    : `CURRENT ARENA: Round ${round?.sequence ?? 1} (${round?.name ?? "ByteVerse 2026"}).`;

  const fullSystemPrompt = `${BASE_SYSTEM_PROMPTS[type]}\n\n${roundGuideline}`;

  // 3. Sanitize input against prompt injection
  const sanitized = sanitizeInput(userMessage);

  // 4. Call Groq with multi-key rotation and automatic failover
  let lastError: Error | null = null;
  const rawKeys = getRawKeys();
  const maxAttempts = Math.max(rawKeys.length * 2, 6);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { client, index: keyIndex } = getNextHealthyKey();
    const stats = getOrInitKeyTelemetry(keyIndex);
    const startTime = Date.now();

    // If initial attempt encounters contention, fail over to failover model
    const targetModel = attempt >= 2 ? getFailoverAIModel() : getAIModel();

    try {
      const completion = await client.chat.completions.create({
        model: targetModel,
        max_tokens: parseInt(process.env.AI_MAX_TOKENS ?? "350"),
        temperature: 0.2,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: sanitized },
        ],
      });

      const latency = Date.now() - startTime;
      const totalTokens = completion.usage?.total_tokens ?? 0;
      const promptTokens = completion.usage?.prompt_tokens ?? 0;
      const completionTokens = completion.usage?.completion_tokens ?? 0;

      // Update in-memory telemetry for this key
      stats.totalRequests += 1;
      stats.totalTokens += totalTokens;
      stats.promptTokens += promptTokens;
      stats.completionTokens += completionTokens;
      stats.lastUsedAt = new Date().toISOString();
      stats.lastLatencyMs = latency;
      stats.status = "HEALTHY";
      stats.lastError = null;
      stats.dailyRemaining = Math.max(0, stats.dailyLimit - stats.totalRequests);

      // Record in key's 60-second sliding window
      const win = keyMinuteWindows.get(keyIndex) ?? [];
      win.push({ timestamp: Date.now(), tokens: totalTokens });
      keyMinuteWindows.set(keyIndex, win);

      let content = completion.choices[0]?.message?.content ?? "No response generated.";

      // 5. Post-processing: safety net
      content = sanitizeAIResponse(content, type);

      // 6. Record usage in database
      await db.aIUsage.create({
        data: {
          userId,
          roundId,
          problemId: problemId || null,
          type,
          prompt: sanitized,
          response: content.slice(0, 2000),
          tokensUsed: totalTokens || null,
        },
      });

      const updatedUsage = await getLifetimeUsage(userId);

      return {
        response: content,
        usage: {
          explainLeft: updatedUsage.explainLeft,
          codeLeft: updatedUsage.codeLeft,
        },
      };
    } catch (err: unknown) {
      const latency = Date.now() - startTime;
      const errMessage = err instanceof Error ? err.message : String(err);
      stats.lastError = errMessage;
      stats.lastLatencyMs = latency;

      // Check if Rate Limited (429 or TPM/RPM limit)
      if (errMessage.includes("429") || errMessage.toLowerCase().includes("rate limit") || errMessage.toLowerCase().includes("tokens per minute")) {
        stats.status = "COOLDOWN";
        stats.cooldownUntil = Date.now() + 60000; // 60s cooldown
        console.warn(`[AI Key Pool] Key #${keyIndex + 1} (${stats.maskedKey}) rate limited. Jitter backoff & trying next key...`);
        // Jittered backoff to absorb concurrent burst spikes without dropping requests
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1) + Math.floor(Math.random() * 200)));
      } else {
        stats.status = "ERROR";
        console.warn(`[AI Key Pool] Key #${keyIndex + 1} (${stats.maskedKey}) failed:`, errMessage);
      }

      lastError = err instanceof Error ? err : new Error(errMessage);
    }
  }

  throw lastError ?? new Error("All AI API keys exhausted or unavailable.");
}

// ─── Key Pool Telemetry Retrieval ───────────────────────────────────────────
export async function getAllKeysTelemetry(): Promise<{
  totalKeys: number;
  healthyCount: number;
  cooldownCount: number;
  errorCount: number;
  totalTokensConsumed: number;
  totalRequestsServed: number;
  poolCurrentRpm: number;
  poolPeakRpm: number;
  poolCurrentTpm: number;
  poolPeakTpm: number;
  keys: KeyTelemetry[];
  dbTotalTokens: number;
  dbTotalPrompts: number;
}> {
  const currentKeys = getRawKeys();
  // Sync all keys
  const keys: KeyTelemetry[] = currentKeys.map((_, idx: number) => {
    const stats = getOrInitKeyTelemetry(idx);
    // Refresh status if cooldown ended
    if (stats.status === "COOLDOWN" && Date.now() >= stats.cooldownUntil) {
      stats.status = "HEALTHY";
      stats.lastError = null;
    }
    return { ...stats };
  });

  const healthyCount = keys.filter((k) => k.status === "HEALTHY").length;
  const cooldownCount = keys.filter((k) => k.status === "COOLDOWN").length;
  const errorCount = keys.filter((k) => k.status === "ERROR").length;
  const totalTokensConsumed = keys.reduce((acc, k) => acc + k.totalTokens, 0);
  const totalRequestsServed = keys.reduce((acc, k) => acc + k.totalRequests, 0);
  const poolCurrentRpm = keys.reduce((acc, k) => acc + (k.currentRpm || 0), 0);
  const poolPeakRpm = keys.reduce((acc, k) => acc + (k.peakRpm || 0), 0);
  const poolCurrentTpm = keys.reduce((acc, k) => acc + (k.currentTpm || 0), 0);
  const poolPeakTpm = keys.reduce((acc, k) => acc + (k.peakTpm || 0), 0);

  // Query database aggregate for historical tournament totals
  const dbAggregate = await db.aIUsage.aggregate({
    _sum: { tokensUsed: true },
    _count: { id: true },
  });

  return {
    totalKeys: currentKeys.length,
    healthyCount,
    cooldownCount,
    errorCount,
    totalTokensConsumed,
    totalRequestsServed,
    poolCurrentRpm,
    poolPeakRpm,
    poolCurrentTpm,
    poolPeakTpm,
    keys,
    dbTotalTokens: dbAggregate._sum.tokensUsed ?? 0,
    dbTotalPrompts: dbAggregate._count.id ?? 0,
  };
}

// ─── Test Single Key / All Keys Live Ping ───────────────────────────────────
export async function testKeyHealth(keyIndex: number): Promise<{
  index: number;
  maskedKey: string;
  status: "HEALTHY" | "ERROR";
  latencyMs: number;
  model: string;
  error?: string;
}> {
  const currentKeys = getRawKeys();
  if (keyIndex < 0 || keyIndex >= currentKeys.length) {
    throw new Error(`Invalid key index ${keyIndex}`);
  }

  const key = currentKeys[keyIndex];
  const stats = getOrInitKeyTelemetry(keyIndex);
  const client = new OpenAI({
    apiKey: key,
    baseURL: process.env.AI_BASE_URL ?? "https://api.groq.com/openai/v1",
  });

  const startTime = Date.now();
  const targetModel = getAIModel();

  try {
    const res = await client.chat.completions.create({
      model: targetModel,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 2,
    });

    const latency = Date.now() - startTime;
    stats.lastLatencyMs = latency;
    stats.status = "HEALTHY";
    stats.lastError = null;

    return {
      index: keyIndex,
      maskedKey: stats.maskedKey,
      status: "HEALTHY",
      latencyMs: latency,
      model: res.model ?? targetModel,
    };
  } catch (e: unknown) {
    const latency = Date.now() - startTime;
    const msg = e instanceof Error ? e.message : String(e);
    stats.lastLatencyMs = latency;
    stats.status = "ERROR";
    stats.lastError = msg;

    return {
      index: keyIndex,
      maskedKey: stats.maskedKey,
      status: "ERROR",
      latencyMs: latency,
      model: targetModel,
      error: msg,
    };
  }
}
