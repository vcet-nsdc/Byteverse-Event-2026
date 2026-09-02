import dotenv from "dotenv";
dotenv.config();

const JUDGE_BASE = (process.env.JUDGE0_URL || "http://20.196.205.18:2358").trim().replace(/\/+$/, "");
const JUDGE_KEY = (process.env.JUDGE0_API_KEY || "nsJLGeoqB1du7Yj5CkQpKw6mNtEUW3b8").trim();

const CONCURRENCY = parseInt(process.argv[2] || "25", 10);

console.log(`\n======================================================`);
console.log(`🚀 ByteVerse 2026: Judge0 Concurrency Stress Test`);
console.log(`Target:      ${JUDGE_BASE}`);
console.log(`Concurrency: ${CONCURRENCY} simultaneous submissions arriving at once`);
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

async function sendSingleSubmission(id) {
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
      return { id, success: false, status: `HTTP_${res.status}`, duration, error: errText };
    }

    const data = await res.json();
    const isAccepted = data.status?.id === 3;
    return {
      id,
      success: isAccepted,
      status: data.status?.description || "UNKNOWN",
      time: data.time,
      memory: data.memory,
      duration,
    };
  } catch (err) {
    const duration = Date.now() - start;
    return { id, success: false, status: "NETWORK_ERROR", duration, error: err.message };
  }
}

async function runStressTest() {
  console.log(`⏳ Firing ${CONCURRENCY} simultaneous submissions right now...\n`);
  const overallStart = Date.now();

  const promises = Array.from({ length: CONCURRENCY }, (_, i) => sendSingleSubmission(i + 1));
  const results = await Promise.all(promises);

  const overallDuration = (Date.now() - overallStart) / 1000;

  const passed = results.filter((r) => r.success).length;
  const failed = results.length - passed;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
  const maxDuration = Math.max(...results.map((r) => r.duration));
  const minDuration = Math.min(...results.map((r) => r.duration));

  console.log(`\n================ STRESS TEST SUMMARY ================`);
  console.log(`Total Submissions:  ${results.length}`);
  console.log(`Passed (Accepted):  ✅ ${passed} / ${results.length} (${Math.round((passed / results.length) * 100)}%)`);
  console.log(`Failed / Errors:    ❌ ${failed}`);
  console.log(`Total Wall Time:    ⏱️  ${overallDuration.toFixed(2)}s`);
  console.log(`Average Latency:    ⚡ ${Math.round(avgDuration)}ms`);
  console.log(`Fastest Job:        ⚡ ${minDuration}ms`);
  console.log(`Slowest (in queue): ⏳ ${maxDuration}ms`);
  console.log(`=====================================================\n`);

  if (failed > 0) {
    console.log(`⚠️ Failed details:`);
    for (const r of results.filter((r) => !r.success)) {
      console.log(`  Job #${r.id}: ${r.status} (${r.duration}ms) - ${r.error || "No extra info"}`);
    }
  } else {
    console.log(`🎉 ALL ${CONCURRENCY} CONCURRENT JOBS PROCESSED FLAWLESSLY!`);
    console.log(`Your Judge0 queue absorbed the burst cleanly.\n`);
  }
}

runStressTest().catch(console.error);
