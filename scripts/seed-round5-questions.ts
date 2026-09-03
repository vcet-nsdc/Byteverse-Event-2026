import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function seedRound5() {
  console.log("⚡ Seeding Round 5: Human vs Machine Grand Finale...");

  // Find Round 5
  let round5 = await db.round.findFirst({
    where: { sequence: 5 },
  });

  if (!round5) {
    const event = await db.event.findFirst();
    if (!event) throw new Error("No event found. Please run seed.ts first.");
    round5 = await db.round.create({
      data: {
        eventId: event.id,
        sequence: 5,
        name: "AI vs Human",
        type: "HUMAN_VS_MACHINE",
        durationMin: 35,
        status: "SCHEDULED",
      },
    });
  }

  // Clear existing problems for round 5 to ensure clean seeding
  await db.problem.deleteMany({
    where: { roundId: round5.id },
  });

  // ─── Problem 1: The Neural Pipeline Bottleneck ─────────────────────────────
  const p1 = await db.problem.create({
    data: {
      roundId: round5.id,
      sequence: 1,
      title: "The Neural Pipeline Bottleneck",
      statement: `An autonomous AI training cluster consists of $N$ tensor computing nodes (labeled $1$ to $N$) and $M$ directed dependency pipelines. Each pipeline directs data from node $u$ to node $v$ with a processing latency of $w$ microseconds.

A neural model forward-pass can only complete when all sequential dependencies have been resolved.

Your task is to:
1. Detect if the dependency graph contains a cyclic deadlock. If a cycle exists, the pipeline can never finish; output \`-1\`.
2. Otherwise, find the length of the critical path (the maximum total latency along any valid directed path in the network).

### Input Format
- First line contains two space-separated integers $N$ and $M$ — the number of nodes and pipelines.
- The next $M$ lines each contain three space-separated integers $u$, $v$, and $w$ — indicating a directed pipeline from node $u$ to node $v$ with latency $w$.

### Output Format
- Print a single integer: the maximum latency of any valid directed path, or \`-1\` if a cyclic deadlock exists.`,
      constraints: `1 <= N <= 10^5\n0 <= M <= 2 * 10^5\n1 <= u, v <= N (u != v)\n1 <= w <= 10^4`,
      sampleInput: `4 4\n1 2 5\n1 3 3\n2 4 6\n3 4 4`,
      sampleOutput: `11`,
      difficulty: "HARD",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      allowedLangs: ["cpp", "c", "java", "python"],
      isPublished: true,
      set: "A",
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\n#include <queue>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Read input and compute critical path latency\n    return 0;\n}`,
        c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Read input and compute critical path latency\n    return 0;\n}`,
        java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Read input and compute critical path latency\n    }\n}`,
        python: `import sys\nfrom collections import deque\n\ndef main():\n    input = sys.stdin.read\n    # Read input and compute critical path latency\n    pass\n\nif __name__ == "__main__":\n    main()`,
      },
      aiAnalysisReport: {
        model: "DeepByte Machine v2.6",
        cleanCodeNames: { score: 9, feedback: "Standard graph identifier structures (`adjList`, `inDegree`)." },
        hiddenCasesPass: { passed: 4, total: 4, ratio: "4/4", allPassed: true },
        edgeCasesPass: { passed: 2, total: 3, ratio: "2/3", allPassed: false },
        commentFormat: { score: 7, feedback: "Algorithmic docstring provided without human edge-case intuition." },
        syntaxFormat: { score: 10, feedback: "Flawless idiomatic Kahn's algorithm syntax." },
        timeComplexity: { estimate: "O(N + M)", optimal: "O(N + M)", feedback: "Machine achieved optimal linear topological sorting." },
        spaceComplexity: { estimate: "O(N + M)", optimal: "O(N + M)", feedback: "Standard adjacency list memory footprint." },
      },
    },
  });

  // Test cases for Problem 1 (3 Sample, 4 Hidden, 3 Edge)
  const p1TestCases = [
    // 3 Sample Cases
    { input: "4 4\n1 2 5\n1 3 3\n2 4 6\n3 4 4\n", expected: "11\n", isHidden: false, isEdgeCase: false },
    { input: "3 3\n1 2 2\n2 3 3\n3 1 4\n", expected: "-1\n", isHidden: false, isEdgeCase: false },
    { input: "5 4\n1 2 10\n2 3 20\n3 4 30\n4 5 40\n", expected: "100\n", isHidden: false, isEdgeCase: false },
    // 4 Hidden Cases
    { input: "4 3\n1 2 7\n1 3 14\n1 4 21\n", expected: "21\n", isHidden: true, isEdgeCase: false },
    { input: "6 6\n1 2 4\n2 3 6\n1 4 8\n4 5 10\n3 6 5\n5 6 3\n", expected: "21\n", isHidden: true, isEdgeCase: false },
    { input: "5 5\n1 2 1\n2 3 2\n3 4 3\n4 2 4\n4 5 5\n", expected: "-1\n", isHidden: true, isEdgeCase: false },
    { input: "6 7\n1 2 12\n1 3 15\n2 4 10\n3 4 8\n4 5 20\n3 6 25\n5 6 5\n", expected: "47\n", isHidden: true, isEdgeCase: false },
    // 3 Adversarial Edge Cases
    { input: "1 0\n", expected: "0\n", isHidden: true, isEdgeCase: true },
    { input: "4 0\n", expected: "0\n", isHidden: true, isEdgeCase: true },
    { input: "2 2\n1 2 10\n2 1 20\n", expected: "-1\n", isHidden: true, isEdgeCase: true },
  ];

  for (let i = 0; i < p1TestCases.length; i++) {
    const tc = p1TestCases[i];
    await db.testCase.create({
      data: {
        problemId: p1.id,
        sequence: i + 1,
        input: tc.input,
        expected: tc.expected.trim(),
        isHidden: tc.isHidden,
        isEdgeCase: tc.isEdgeCase,
        score: 10,
      },
    });
  }

  // ─── Problem 2: Adversarial Stream Defense ──────────────────────────────────
  const p2 = await db.problem.create({
    data: {
      roundId: round5.id,
      sequence: 2,
      title: "Adversarial Stream Defense",
      statement: `An autonomous cybersecurity firewall monitors an incoming network stream of $N$ packet threat scores: $A_1, A_2, \\dots, A_N$.

The security inspection system uses a sliding inspection window of size $K$. For each window of $K$ consecutive packets from index $i$ to $i + K - 1$ (for all $1 \\le i \\le N - K + 1$):
1. Compute the maximum threat score in the window: $M_i = \\max(A_i, A_{i+1}, \\dots, A_{i+K-1})$.
2. If $M_i > T$ (where $T$ is the alert threshold), an alert trigger is raised.

Your task is to:
1. Count the number of inspection windows where an alert is triggered ($M_i > T$).
2. Calculate the sum of all window maximums: $\\sum_{i=1}^{N - K + 1} M_i$.

### Input Format
- First line contains three space-separated integers: $N$, $K$, and $T$ — the stream size, window size, and threat alert threshold.
- Second line contains $N$ space-separated integers $A_1, A_2, \\dots, A_N$ — the threat scores.

### Output Format
- Print two space-separated integers: the count of triggered windows, followed by the sum of all window maximums.`,
      constraints: `1 <= K <= N <= 10^5\n-10^9 <= T <= 10^9\n-10^9 <= A_i <= 10^9`,
      sampleInput: `8 3 5\n1 3 -1 -3 5 3 6 7`,
      sampleOutput: `3 27`,
      difficulty: "HARD",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      allowedLangs: ["cpp", "c", "java", "python"],
      isPublished: true,
      set: "A",
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\n#include <deque>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Read input and compute sliding window threat metrics\n    return 0;\n}`,
        c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Read input and compute sliding window threat metrics\n    return 0;\n}`,
        java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Read input and compute sliding window threat metrics\n    }\n}`,
        python: `import sys\nfrom collections import deque\n\ndef main():\n    input = sys.stdin.read\n    # Read input and compute sliding window threat metrics\n    pass\n\nif __name__ == "__main__":\n    main()`,
      },
      aiAnalysisReport: {
        model: "DeepByte Machine v2.6",
        cleanCodeNames: { score: 9, feedback: "Clean monotonic deque pointers and accumulator naming." },
        hiddenCasesPass: { passed: 4, total: 4, ratio: "4/4", allPassed: true },
        edgeCasesPass: { passed: 2, total: 3, ratio: "2/3", allPassed: false },
        commentFormat: { score: 8, feedback: "Standard comments describing double-ended queue mechanics." },
        syntaxFormat: { score: 10, feedback: "Well-structured linear sliding window algorithm." },
        timeComplexity: { estimate: "O(N)", optimal: "O(N)", feedback: "Machine achieved optimal linear amortized time." },
        spaceComplexity: { estimate: "O(K)", optimal: "O(K)", feedback: "Auxiliary deque memory bounded by window length K." },
      },
    },
  });

  const p2TestCases = [
    // 3 Sample Cases
    { input: "8 3 5\n1 3 -1 -3 5 3 6 7\n", expected: "3 27\n", isHidden: false, isEdgeCase: false },
    { input: "5 2 10\n10 10 10 10 10\n", expected: "0 40\n", isHidden: false, isEdgeCase: false },
    { input: "6 3 0\n-5 -2 -1 -4 -6 -3\n", expected: "0 -8\n", isHidden: false, isEdgeCase: false },
    // 4 Hidden Cases
    { input: "7 4 8\n2 9 4 1 8 12 5\n", expected: "4 42\n", isHidden: true, isEdgeCase: false },
    { input: "5 1 4\n1 2 3 4 5\n", expected: "1 15\n", isHidden: true, isEdgeCase: false },
    { input: "8 4 -5\n-8 -3 -10 -1 -4 -2 -6 -9\n", expected: "5 -9\n", isHidden: true, isEdgeCase: false },
    { input: "10 5 15\n12 18 24 6 9 30 15 21 8 14\n", expected: "6 147\n", isHidden: true, isEdgeCase: false },
    // 3 Adversarial Edge Cases
    { input: "1 1 0\n5\n", expected: "1 5\n", isHidden: true, isEdgeCase: true },
    { input: "5 5 100\n1 2 3 4 5\n", expected: "0 5\n", isHidden: true, isEdgeCase: true },
    { input: "4 2 -100\n-500000000 -500000000 -500000000 -500000000\n", expected: "0 -1500000000\n", isHidden: true, isEdgeCase: true },
  ];

  for (let i = 0; i < p2TestCases.length; i++) {
    const tc = p2TestCases[i];
    await db.testCase.create({
      data: {
        problemId: p2.id,
        sequence: i + 1,
        input: tc.input,
        expected: tc.expected.trim(),
        isHidden: tc.isHidden,
        isEdgeCase: tc.isEdgeCase,
        score: 10,
      },
    });
  }

  // ─── Problem 3: Quantum Matrix Subgrid Optimization ─────────────────────────
  const p3 = await db.problem.create({
    data: {
      roundId: round5.id,
      sequence: 3,
      title: "Quantum Matrix Subgrid Optimization",
      statement: `A quantum processor register is arranged as an $N \\times M$ grid of superconducting qubits. Each qubit cell $(i, j)$ has an interference resonance value $V_{i,j}$ (which may be positive, negative, or zero).

To activate a quantum gate, you must choose a non-empty contiguous rectangular subgrid (from row $r_1$ to $r_2$ and column $c_1$ to $c_2$, where $1 \\le r_1 \\le r_2 \\le N$ and $1 \\le c_1 \\le c_2 \\le M$) such that the total resonance sum of the selected subgrid is maximized:
$$\\sum_{r=r_1}^{r_2} \\sum_{c=c_1}^{c_2} V_{r,c}$$

Find the maximum possible sum across all non-empty contiguous subgrids.

### Input Format
- First line contains two space-separated integers $N$ and $M$ — the number of rows and columns.
- The next $N$ lines each contain $M$ space-separated integers representing the matrix elements.

### Output Format
- Print a single integer representing the maximum contiguous subgrid sum.`,
      constraints: `1 <= N, M <= 300\n-10^5 <= V_{i,j} <= 10^5\nGrid contains at least one cell.`,
      sampleInput: `4 4\n0 -2 -7 0\n9 2 -6 2\n-4 1 -4 1\n-1 8 0 -2`,
      sampleOutput: `15`,
      difficulty: "HARD",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      allowedLangs: ["cpp", "c", "java", "python"],
      isPublished: true,
      set: "A",
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Read input and compute maximum subgrid sum\n    return 0;\n}`,
        c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Read input and compute maximum subgrid sum\n    return 0;\n}`,
        java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Read input and compute maximum subgrid sum\n    }\n}`,
        python: `import sys\n\ndef main():\n    input = sys.stdin.read\n    # Read input and compute maximum subgrid sum\n    pass\n\nif __name__ == "__main__":\n    main()`,
      },
      aiAnalysisReport: {
        model: "DeepByte Machine v2.6",
        cleanCodeNames: { score: 9, feedback: "Clean Kadane 2D accumulation variables (`currentSum`, `maxSubgrid`)." },
        hiddenCasesPass: { passed: 4, total: 4, ratio: "4/4", allPassed: true },
        edgeCasesPass: { passed: 2, total: 3, ratio: "2/3", allPassed: false },
        commentFormat: { score: 8, feedback: "Standard explanation of 2D prefix compression." },
        syntaxFormat: { score: 10, feedback: "Consistent nested loops with optimal row compression." },
        timeComplexity: { estimate: "O(N^2 * M)", optimal: "O(N^2 * M)", feedback: "Machine achieved optimal 2D Kadane complexity." },
        spaceComplexity: { estimate: "O(M)", optimal: "O(M)", feedback: "Minimal linear auxiliary column buffer." },
      },
    },
  });

  const p3TestCases = [
    // 3 Sample Cases
    { input: "4 4\n0 -2 -7 0\n9 2 -6 2\n-4 1 -4 1\n-1 8 0 -2\n", expected: "15\n", isHidden: false, isEdgeCase: false },
    { input: "3 3\n1 2 3\n4 5 6\n7 8 9\n", expected: "45\n", isHidden: false, isEdgeCase: false },
    { input: "2 2\n-5 -2\n-8 -1\n", expected: "-1\n", isHidden: false, isEdgeCase: false },
    // 4 Hidden Cases
    { input: "3 4\n2 1 -3 -4\n0 6 3 -1\n2 -2 -1 4\n", expected: "12\n", isHidden: true, isEdgeCase: false },
    { input: "4 2\n5 -3\n2 4\n-1 8\n3 2\n", expected: "20\n", isHidden: true, isEdgeCase: false },
    { input: "5 5\n1 -2 3 -4 5\n-6 7 -8 9 -10\n11 -12 13 -14 15\n-16 17 -18 19 -20\n21 -22 23 -24 25\n", expected: "39\n", isHidden: true, isEdgeCase: false },
    { input: "3 3\n-100 20 -100\n20 50 20\n-100 20 -100\n", expected: "90\n", isHidden: true, isEdgeCase: false },
    // 3 Adversarial Edge Cases
    { input: "1 1\n-42\n", expected: "-42\n", isHidden: true, isEdgeCase: true },
    { input: "1 5\n-3 4 -1 6 -2\n", expected: "9\n", isHidden: true, isEdgeCase: true },
    { input: "4 1\n-10\n25\n-5\n30\n", expected: "50\n", isHidden: true, isEdgeCase: true },
  ];

  for (let i = 0; i < p3TestCases.length; i++) {
    const tc = p3TestCases[i];
    await db.testCase.create({
      data: {
        problemId: p3.id,
        sequence: i + 1,
        input: tc.input,
        expected: tc.expected.trim(),
        isHidden: tc.isHidden,
        isEdgeCase: tc.isEdgeCase,
        score: 10,
      },
    });
  }

  console.log("✅ Successfully seeded 3 Grand Finale Problems for Round 5!");
  console.log(`1. ${p1.title} (10 Test Cases)`);
  console.log(`2. ${p2.title} (10 Test Cases)`);
  console.log(`3. ${p3.title} (10 Test Cases)`);

  await db.$disconnect();
  await pool.end();
}

seedRound5().catch((err) => {
  console.error("❌ Failed seeding Round 5:", err);
  process.exit(1);
});
