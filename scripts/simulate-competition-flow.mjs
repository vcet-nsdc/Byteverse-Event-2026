import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Initialize PostgreSQL client
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const BASE_URL = (process.argv[3] || process.env.BASE_URL || "https://platform-26.vercel.app").trim().replace(/\/+$/, "");
const CONCURRENCY = parseInt(process.argv[2] || "15", 10);
const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

console.log(`\n======================================================`);
console.log(`🏆 ByteVerse 2026: Mass Competition Flow Simulation`);
console.log(`Target:      ${BASE_URL}`);
console.log(`Simulated:   ${CONCURRENCY} concurrent participants`);
console.log(`======================================================\n`);

// Optimized O(1) Solution for Q1 in C++
const OPTIMIZED_CODE_CPP = `#include <iostream>
using namespace std;
int main() {
    long long n;
    if (cin >> n) {
        cout << (n * (n + 1)) / 2 << endl;
    }
    return 0;
}
`;

// Helper to authenticate a user via NextAuth HTTP credentials flow
async function loginUser(email, password) {
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.get("set-cookie") || "";

    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookies,
      },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        json: "true",
      }),
      redirect: "manual",
    });

    const sessionCookie = loginRes.headers.get("set-cookie");
    if (!sessionCookie) return null;

    // Combine cookies
    const authCookie = sessionCookie.split(";")[0];
    return authCookie;
  } catch {
    return null;
  }
}

async function prepareTestParticipants(roundId) {
  console.log(`🔧 Preparing ${CONCURRENCY} test teams and participants in database...`);

  const passwordHash = await bcrypt.hash("testpass2026", 10);
  const participants = [];

  for (let i = 1; i <= CONCURRENCY; i++) {
    const email = `sim-user-${i}@byteverse.dev`;
    const teamName = `Sim Team ${i}`;

    // 1. Upsert User
    const user = await db.user.upsert({
      where: { email },
      update: { passwordHash },
      create: {
        email,
        name: `Sim User ${i}`,
        passwordHash,
        role: "PARTICIPANT",
      },
    });

    // 2. Upsert Team
    let team = await db.team.findFirst({
      where: { name: teamName, eventId: EVENT_ID },
    });

    if (!team) {
      team = await db.team.create({
        data: {
          name: teamName,
          eventId: EVENT_ID,
          inviteCode: `SIM${i.toString().padStart(5, "0")}`,
          status: "APPROVED",
        },
      });
    }

    // 3. Upsert Team Member
    await db.teamMember.upsert({
      where: { userId: user.id },
      update: { teamId: team.id },
      create: {
        userId: user.id,
        teamId: team.id,
        isLeader: true,
      },
    });

    participants.push({ id: user.id, email, password: "testpass2026", teamId: team.id, teamName });
  }

  // Ensure Round 2 is ACTIVE for testing
  await db.round.update({
    where: { id: roundId },
    data: { status: "ACTIVE" },
  });

  console.log(`✅ ${CONCURRENCY} test participants ready and Round 2 activated.\n`);
  return participants;
}

async function simulateParticipantFlow(participant, problem, roundId, index) {
  const result = {
    index,
    email: participant.email,
    teamName: participant.teamName,
    loginSuccess: false,
    runSuccess: false,
    runDuration: 0,
    submitSuccess: false,
    submitStatus: "FAILED",
    submitDuration: 0,
    earnedScore: 0,
    verifiedScore: 0,
    error: null,
  };

  try {
    // 1. Authenticate
    const authCookie = await loginUser(participant.email, participant.password);
    if (!authCookie) {
      result.error = "Authentication failed (no session cookie)";
      return result;
    }
    result.loginSuccess = true;

    const headers = {
      "Content-Type": "application/json",
      "Cookie": authCookie,
    };

    // 2. Test "Run Code" (POST /api/submissions/run)
    const runStart = Date.now();
    const runRes = await fetch(`${BASE_URL}/api/submissions/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        problemId: problem.id,
        roundId,
        language: "cpp",
        sourceCode: OPTIMIZED_CODE_CPP,
        customInput: problem.sampleInput || "5",
      }),
    });

    result.runDuration = Date.now() - runStart;
    if (runRes.ok) {
      const runData = await runRes.json();
      result.runSuccess = !!runData.stdout;
    }

    // 3. Test "Submit Solution" (POST /api/submissions)
    const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "11111111-1111-4111-a111-111111111111";
    const subStart = Date.now();
    const subRes = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        problemId: problem.id,
        roundId,
        language: "cpp",
        sourceCode: OPTIMIZED_CODE_CPP,
        idempotencyKey,
      }),
    });

    result.submitDuration = Date.now() - subStart;
    if (subRes.ok) {
      const subData = await subRes.json();
      result.submitSuccess = subData.status === "ACCEPTED";
      result.submitStatus = subData.status || "UNKNOWN";
      result.earnedScore = subData.rawScore || 0;
    } else {
      const errText = await subRes.text();
      result.submitStatus = `HTTP_${subRes.status}`;
      result.error = errText;
    }

    // 4. Verify Score in DB / API (GET /api/rounds/[roundId]/my-score)
    const scoreRes = await fetch(`${BASE_URL}/api/rounds/${roundId}/my-score`, {
      headers,
    });
    if (scoreRes.ok) {
      const scoreData = await scoreRes.json();
      result.verifiedScore = scoreData.rawScore ?? result.earnedScore;
    }

    return result;
  } catch (err) {
    result.error = err.message;
    return result;
  }
}

async function main() {
  // Find Round 2
  const round2 = await db.round.findFirst({
    where: { eventId: EVENT_ID, sequence: 2 },
    include: { problems: { include: { testCases: true }, orderBy: { sequence: "asc" } } },
  });

  if (!round2 || round2.problems.length === 0) {
    console.error("❌ Round 2 or problems not found. Please run seed script first.");
    process.exit(1);
  }

  const problem = round2.problems[0]; // Test with Q1
  console.log(`🎯 Testing Challenge: "${problem.title}" (${problem.testCases.length} test cases)`);

  const participants = await prepareTestParticipants(round2.id);

  console.log(`🚀 Triggering mass participant workflow for ${CONCURRENCY} concurrent users...\n`);
  const overallStart = Date.now();

  const promises = participants.map((p, idx) =>
    simulateParticipantFlow(p, problem, round2.id, idx + 1)
  );

  const results = await Promise.all(promises);
  const totalElapsed = (Date.now() - overallStart) / 1000;

  console.log(`\n======================================================`);
  console.log(`📊 SIMULATION COMPLETE (${totalElapsed.toFixed(2)}s elapsed)`);
  console.log(`======================================================\n`);

  console.table(
    results.map((r) => ({
      User: r.email,
      Login: r.loginSuccess ? "✅ OK" : "❌ FAIL",
      "Run Code": r.runSuccess ? `✅ ${r.runDuration}ms` : "❌ FAIL",
      Submit: r.submitSuccess ? `✅ ACCEPTED (${r.submitDuration}ms)` : `❌ ${r.submitStatus}`,
      "Score Registered": `${r.verifiedScore} pts`,
    }))
  );

  const passedLogins = results.filter((r) => r.loginSuccess).length;
  const passedRuns = results.filter((r) => r.runSuccess).length;
  const passedSubmits = results.filter((r) => r.submitSuccess).length;
  const avgRunTime = Math.round(results.reduce((acc, r) => acc + r.runDuration, 0) / results.length);
  const avgSubmitTime = Math.round(results.reduce((acc, r) => acc + r.submitDuration, 0) / results.length);

  console.log(`\n📈 Aggregate Metrics:`);
  console.log(`- Logins:      ${passedLogins} / ${results.length} (${Math.round((passedLogins / results.length) * 100)}%)`);
  console.log(`- Runs:        ${passedRuns} / ${results.length} (Avg latency: ${avgRunTime}ms)`);
  console.log(`- Submissions: ${passedSubmits} / ${results.length} Accepted (Avg latency: ${avgSubmitTime}ms)`);

  if (passedSubmits === results.length) {
    console.log(`\n🏆 Full competition end-to-end flow passed with 100% SUCCESS under mass concurrent load!`);
  } else {
    console.log(`\n⚠️ Some steps did not pass. Check errors above.`);
  }

  await db.$disconnect();
  await pool.end();
}

main().catch(async (e) => {
  console.error("Simulation error:", e);
  await db.$disconnect();
  await pool.end();
  process.exit(1);
});
