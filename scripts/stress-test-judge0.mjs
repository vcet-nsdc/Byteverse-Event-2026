import dotenv from "dotenv";
dotenv.config();

const JUDGE_BASE = (process.env.JUDGE0_URL || "http://20.196.205.18:2358").trim().replace(/\/+$/, "");
const JUDGE_KEY = (process.env.JUDGE0_API_KEY || "nsJLGeoqB1du7Yj5CkQpKw6mNtEUW3b8").trim();

const CONCURRENCY = parseInt(process.argv[2] || "35", 10);
const WAVES = parseInt(process.argv[3] || "1", 10);
const INTERVAL_SEC = parseInt(process.argv[4] || "10", 10);

console.log(`\n======================================================`);
console.log(`🚀 ByteVerse 2026: Judge0 Concurrency & Repeat Burst Test`);
console.log(`Target:       ${JUDGE_BASE}`);
console.log(`Concurrency:  ${CONCURRENCY} simultaneous submissions per wave`);
console.log(`Waves:        ${WAVES} wave(s) ${WAVES > 1 ? `(with ${INTERVAL_SEC}s cooldown between waves)` : ""}`);
console.log(`======================================================\n`);

const testCode = `#include <iostream>
using namespace std;
int main() {
    long long n;
    if (cin >> n) {
        cout << (n * (n + 1)) / 2 << endl;
    }
    return 0;
}
`;

async function sendSingleSubmission(id, waveNum) {
  const start = Date.now();
  try {
    const res = await fetch(`${JUDGE_BASE}/submissions?base64_encoded=false&wait=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": JUDGE_KEY,
      },
      body: JSON.stringify({
        source_code: testCode,
        language_id: 54, // C++ (GCC 9.2)
        stdin: "100\n",
        expected_output: "5050\n",
        cpu_time_limit: 2.0,
        memory_limit: 256 * 1024,
      }),
    });

    const duration = Date.now() - start;
    if (!res.ok) {
      const errText = await res.text();
      return { id, waveNum, success: false, status: `HTTP_${res.status}`, duration, error: errText };
    }

    const data = await res.json();
    const isAccepted = data.status?.id === 3;
    return {
      id,
      waveNum,
      success: isAccepted,
      status: data.status?.description || "UNKNOWN",
      time: data.time,
      memory: data.memory,
      duration,
    };
  } catch (err) {
    const duration = Date.now() - start;
    return { id, waveNum, success: false, status: "NETWORK_ERROR", duration, error: err.message };
  }
}

async function runSingleWave(waveNum) {
  console.log(`🌊 [Wave ${waveNum}/${WAVES}] Firing ${CONCURRENCY} simultaneous submissions right now...`);
  const overallStart = Date.now();

  const promises = Array.from({ length: CONCURRENCY }, (_, i) => sendSingleSubmission(i + 1, waveNum));
  const results = await Promise.all(promises);

  const overallDuration = (Date.now() - overallStart) / 1000;
  const passed = results.filter((r) => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const maxDuration = Math.max(...results.map((r) => r.duration));
  const minDuration = Math.min(...results.map((r) => r.duration));

  console.log(`   ✅ Wave ${waveNum} Completed in ${overallDuration.toFixed(2)}s | Passed: ${passed}/${results.length} | Avg: ${Math.round(avgDuration)}ms | Slowest: ${maxDuration}ms\n`);
  return { results, overallDuration };
}

async function run() {
  const allResults = [];
  const start = Date.now();

  for (let w = 1; w <= WAVES; w++) {
    const { results } = await runSingleWave(w);
    allResults.push(...results);

    if (w < WAVES) {
      console.log(`⏳ Pausing ${INTERVAL_SEC} seconds before next wave (watch htop/docker stats drop to idle)...\n`);
      await new Promise((resolve) => setTimeout(resolve, INTERVAL_SEC * 1000));
    }
  }

  const totalTime = (Date.now() - start) / 1000;
  const totalPassed = allResults.filter((r) => r.success).length;
  const totalFailed = allResults.length - totalPassed;
  const overallAvg = allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length;
  const overallMax = Math.max(...allResults.map((r) => r.duration));
  const overallMin = Math.min(...allResults.map((r) => r.duration));

  console.log(`================ FINAL COMBINED SUMMARY ================`);
  console.log(`Total Requests Sent:   ${allResults.length}`);
  console.log(`Total Passed:          ✅ ${totalPassed} / ${allResults.length} (${Math.round((totalPassed / allResults.length) * 100)}%)`);
  console.log(`Total Failed / Errors: ❌ ${totalFailed}`);
  console.log(`Total Elapsed Time:    ⏱️  ${totalTime.toFixed(2)}s`);
  console.log(`Average Response Time: ⚡ ${Math.round(overallAvg)}ms`);
  console.log(`Fastest Job:           ⚡ ${overallMin}ms`);
  console.log(`Slowest Job in Queue:  ⏳ ${overallMax}ms`);
  console.log(`========================================================\n`);

  if (totalFailed > 0) {
    console.log(`⚠️ Failed details:`);
    for (const r of allResults.filter((r) => !r.success)) {
      console.log(`  Wave ${r.waveNum} Job #${r.id}: ${r.status} (${r.duration}ms) - ${r.error || "No details"}`);
    }
  } else {
    console.log(`🎉 ALL ${allResults.length} SUBMISSIONS ACROSS ${WAVES} WAVE(S) SUCCEEDED WITH 100% RELIABILITY!`);
  }
}

run().catch(console.error);
