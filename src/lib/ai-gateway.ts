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
import { db } from "./db";

// ─── Key Pool Extraction & State Tracking ────────────────────────────────────
function getRawKeys(): string[] {
  return (process.env.AI_API_KEYS ?? process.env.AI_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter((k) => Boolean(k) && !k.includes("your_groq_api_key"));
}

export interface KeyTelemetry {
  index: number;
  maskedKey: string;
  totalRequests: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  lastUsedAt: string | null;
  status: "HEALTHY" | "COOLDOWN" | "ERROR";
  cooldownUntil: number;
  lastError: string | null;
  lastLatencyMs: number | null;
  dailyLimit: number;
  dailyRemaining: number;
  tpmLimit: number;
  tpmRemaining: number;
}

// In-memory key telemetry tracker (persists across API invocations in server process)
const keyTelemetryMap: Map<number, KeyTelemetry> = new Map();

function maskApiKey(key: string): string {
  if (key.length <= 10) return "gsk_••••••••";
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`;
}

// Initialize telemetry for all keys in pool
function getOrInitKeyTelemetry(index: number): KeyTelemetry {
  const rawKeys = getRawKeys();
  const currentModel = getAIModel();
  const is8b = currentModel.includes("8b");
  const dailyLimit = is8b ? 14400 : 1000;
  const tpmLimit = is8b ? 20000 : 6000;

  let stats = keyTelemetryMap.get(index);
  if (!stats) {
    const raw = rawKeys[index] ?? "";
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
      tpmLimit,
      tpmRemaining: tpmLimit,
    };
    keyTelemetryMap.set(index, stats);
  } else {
    stats.dailyLimit = dailyLimit;
    stats.dailyRemaining = Math.max(0, dailyLimit - stats.totalRequests);
    stats.tpmLimit = tpmLimit;
  }
  return stats;
}

let _keyCursor = 0;

export function getAIModel(): string {
  const model = process.env.AI_MODEL?.trim();
  if (!model || model.includes("qwen") || model.includes("invalid")) {
    return "llama-3.3-70b-versatile";
  }
  return model;
}

/**
 * Finds the next available healthy key that is not in rate-limit cooldown
 */
function getNextHealthyKey(): { client: OpenAI; index: number } {
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
- ALLOWED: Explain the underlying operator or language concept (e.g. post-increment vs pre-increment, short-circuit boolean evaluation, static memory lifetime, pointer dereferencing) and instruct the user to dry-run the numbers on their scratchpad.`,

  AI_REPAIR: `CURRENT ARENA: Round 2 — AI Code Optimization & Bug Repair.
- The participant is given inefficient, unoptimized, or subtly flawed AI-generated code to optimize.
- STRICT RULE: YOU MUST NEVER write the optimized code, provide the fix, or write working functions.
- ALLOWED: Point out the theoretical bottleneck (e.g., "The algorithm uses nested loops yielding O(N^2) complexity; consider a hash-based lookup for O(N)") or describe edge cases without writing code.`,

  TRADITIONAL: `CURRENT ARENA: Round 3 — DSA & Algorithmic Problem Solving.
- The participant is solving Data Structures & Algorithms challenges from scratch.
- STRICT RULE: YOU MUST NEVER write the algorithm, data structures, or code solutions.
- ALLOWED: Recommend algorithmic paradigms (e.g., Two Pointers, Monotonic Stack, Dynamic Programming, BFS/DFS, Binary Search) and explain time/space complexity trade-offs conceptually.`,

  TYPE_TRANSFORM: `CURRENT ARENA: Round 4 — Multi-Language Refactoring & Translation.
- The participant is translating and refactoring logic across C, C++, Java, or Python.
- STRICT RULE: YOU MUST NEVER translate the code snippet or write the equivalent function in the target language.
- ALLOWED: Explain language-specific syntax differences (e.g. how Java collections differ from Python lists, or pass-by-reference vs pass-by-value).`,

  HUMAN_VS_MACHINE: `CURRENT ARENA: Round 5 — Human vs Machine Grand Finale.
- High-difficulty competitive coding championship finale.
- STRICT RULE: YOU MUST NEVER provide code solutions or direct problem steps.
- ALLOWED: Only discuss high-level mathematical invariants, time complexity limits, or general problem categorization.`,
};

// ─── Base Socratic System Prompts ────────────────────────────────────────────
const BASE_SYSTEM_PROMPTS = {
  EXPLAIN: `You are Navigator, the official ByteVerse 2026 AI Socratic Tutor.
Your mission is to guide competitive programmers conceptually through Socratic dialogue, without writing full solutions or calculating raw answers.

RULES OF ENGAGEMENT:
1. Socratic Teaching:
   - When a user asks about a code snippet, loop, or logic problem, explain the underlying principles clearly (e.g., operator precedence, memory references, mutability, caching mechanisms, or asymptotic complexity).
   - Pose 1-2 insightful, thought-provoking questions that guide the user to deduce the result on their own scratchpad.
2. No Direct Execution or Option Reveals:
   - Do NOT say "The output is ...", "It prints ...", or "Option X is correct".
   - Instead, explain how the mechanism functions and prompt the participant to trace the state transitions.
3. No Copy-Pasteable Code:
   - Never generate complete solutions or full functions.
   - You may use short inline syntax hints (e.g. \`id(a) == id(b)\` or \`list.append()\`).
4. Tone & Style:
   - Professional, encouraging, clear, and structured with clean bullet points.
   - Keep answers concise and strictly under 160 words.`,

  CODE: `You are Forge, the official ByteVerse 2026 AI Code Advisor.
Your mission is to assist participants with syntax gotchas, algorithmic patterns, and optimization guidance WITHOUT writing code or computing outputs.

RULES OF ENGAGEMENT — YOU ARE A SOCRATIC ADVISOR, NOT A COMPILER OR CODE GENERATOR:
1. NEVER PROVIDE DIRECT OUTPUTS OR TRACE EXECUTION:
   - If a participant shares code and asks "What is the output?", "What does this print?", or "Trace this", NEVER compute the result.
   - Do NOT say "The output is...", "Prints...", or give the answer.
   - Explain the language behavior (e.g., "Look at how the modulo operator handles negative numbers in C") and instruct them to dry-run it on scratchpad.
2. NEVER WRITE FULL FUNCTIONS OR WORKING SOLUTIONS:
   - You must never write working functions, classes, or solution implementations.
   - At most, provide 1 short line of generic syntax hint (e.g., \`q.popleft()\` in Python).
3. CONCEPTUAL BUG IDENTIFICATION:
   - If user code has a bug, identify the conceptual issue (e.g., "Line 4 does not handle empty inputs, leading to index out of bounds") but NEVER write the corrected code.
4. Tone & Brevity:
   - Practical, concise, strictly under 160 words.`,
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
function sanitizeAIResponse(response: string): string {
  let cleaned = response.trim();

  // Strip code blocks with more than 2 lines (participants must write their own code)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    const lines = match.split("\n").filter((l) => l.trim() !== "" && !l.trim().startsWith("```"));
    if (lines.length > 2) {
      return "\n> [Code block omitted by tournament rules. Please write and test the code in your workspace.]\n";
    }
    return match;
  });

  return cleaned;
}

// ─── Main AI Call Function with Real-Time Telemetry & Failover ───────────────
export async function callAI(
  userId: string,
  roundId: string,
  type: "EXPLAIN" | "CODE",
  userMessage: string
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

    // If initial attempt encounters contention, fail over to ultra-high capacity 8B model (20,000 TPM & 14,400 RPD)
    const targetModel = attempt >= 2 ? "llama-3.1-8b-instant" : getAIModel();

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

      let content = completion.choices[0]?.message?.content ?? "No response generated.";

      // 5. Post-processing: safety net
      content = sanitizeAIResponse(content);

      // 6. Record usage in database
      await db.aIUsage.create({
        data: {
          userId,
          roundId,
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
