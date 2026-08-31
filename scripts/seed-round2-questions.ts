import { db } from "../src/lib/db";

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

const SET_A_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The Summation AI",
    difficulty: "Easy",
    statement: `**Narrative:** The AI wrote a script to calculate the sum of the first N natural numbers for a math game. It works fine for small N, but for large inputs ($N = 10^9$), it causes a **Time Limit Exceeded (TLE)** error because it loops a billion times!

**Task:** Optimize the $O(N)$ loop into an $O(1)$ mathematical formula:
$$\\text{Sum} = \\frac{N \\times (N + 1)}{2}$$

*(Hint: Use a 64-bit integer / \`long long\` / \`long\` to prevent 32-bit integer overflow!)*`,
    inputFormat: "A single integer N (1 <= N <= 10^9)",
    outputFormat: "A single 64-bit integer representing the sum of 1 to N",
    constraints: "1 <= N <= 10^9",
    sampleInput: "5",
    sampleOutput: "15",
    timeLimitMs: 1000,
    starterCodes: {
      c: `long long getSum(long long n) {
    long long sum = 0;
    for(long long i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}`,
      cpp: `long long getSum(long long n) {
    long long sum = 0;
    for(long long i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}`,
      java: `public long getSum(long n) {
    long sum = 0;
    for(long i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}`,
      python: `def get_sum(n: int) -> int:
    return sum(range(1, n + 1))`,
    },
    testCases: [
      { input: "5", expected: "15", isHidden: false },
      { input: "100", expected: "5050", isHidden: false },
      { input: "1000", expected: "500500", isHidden: true },
      { input: "1000000000", expected: "500000000500000000", isHidden: true },
    ],
  },
  {
    sequence: 2,
    title: "Q2: The Sorted Checker",
    difficulty: "Easy",
    statement: `**Narrative:** The AI needs to verify if an array of student scores is **strictly increasing** ($arr[i] < arr[i+1]$). Currently, the AI compares *every* element to *all* the elements that come after it using nested loops. This takes $O(N^2)$ time and causes TLE for large arrays.

**Task:** Optimize it to $O(N)$ by only comparing adjacent neighboring elements ($arr[i]$ and $arr[i+1]$).`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "1 (or true) if strictly increasing, 0 (or false) otherwise.",
    constraints: "1 <= N <= 100,000",
    sampleInput: "5\n1 2 3 4 5",
    sampleOutput: "1",
    timeLimitMs: 1000,
    starterCodes: {
      c: `int isSorted(int arr[], int n) {
    for(int i = 0; i < n; i++) {
        for(int j = i + 1; j < n; j++) {
            if(arr[i] >= arr[j]) return 0;
        }
    }
    return 1;
}`,
      cpp: `bool isSorted(vector<int>& arr) {
    for(int i = 0; i < arr.size(); i++) {
        for(int j = i + 1; j < arr.size(); j++) {
            if(arr[i] >= arr[j]) return false;
        }
    }
    return true;
}`,
      java: `public boolean isSorted(int[] arr) {
    for(int i = 0; i < arr.length; i++) {
        for(int j = i + 1; j < arr.length; j++) {
            if(arr[i] >= arr[j]) return false;
        }
    }
    return true;
}`,
      python: `def is_sorted(arr: list[int]) -> bool:
    return all(arr[i] < arr[j] for i in range(len(arr)) for j in range(i + 1, len(arr)))`,
    },
    testCases: [
      { input: "5\n1 2 3 4 5", expected: "1", isHidden: false },
      { input: "4\n1 3 2 4", expected: "0", isHidden: false },
      { input: "5\n2 2 3 4 5", expected: "0", isHidden: true },
      { input: "1\n42", expected: "1", isHidden: true },
    ],
  },
  {
    sequence: 3,
    title: "Q3: The Score Spread",
    difficulty: "Easy",
    statement: `**Narrative:** Find the "spread" (maximum difference: $\\max(arr) - \\min(arr)$) between the highest score and the lowest score in an array. The AI checks the difference of every possible pair using nested loops ($O(N^2)$).

**Task:** Optimize it to $O(N)$ by tracking the minimum and maximum values in a single pass, then returning $\\text{max\\_val} - \\text{min\\_val}$.`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "A single integer representing max(arr) - min(arr).",
    constraints: "1 <= N <= 100,000",
    sampleInput: "4\n10 2 8 5",
    sampleOutput: "8",
    timeLimitMs: 1000,
    starterCodes: {
      c: `int getSpread(int arr[], int n) {
    int max_diff = 0;
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            int diff = arr[i] - arr[j];
            if(diff > max_diff) max_diff = diff;
        }
    }
    return max_diff;
}`,
      cpp: `int getSpread(vector<int>& arr) {
    int maxDiff = 0;
    for(int i = 0; i < arr.size(); i++) {
        for(int j = 0; j < arr.size(); j++) {
            maxDiff = max(maxDiff, arr[i] - arr[j]);
        }
    }
    return maxDiff;
}`,
      java: `public int getSpread(int[] arr) {
    int maxDiff = 0;
    for(int i = 0; i < arr.length; i++) {
        for(int j = 0; j < arr.length; j++) {
            maxDiff = Math.max(maxDiff, arr[i] - arr[j]);
        }
    }
    return maxDiff;
}`,
      python: `def get_spread(arr: list[int]) -> int:
    return max(abs(arr[i] - arr[j]) for i in range(len(arr)) for j in range(len(arr)))`,
    },
    testCases: [
      { input: "4\n10 2 8 5", expected: "8", isHidden: false },
      { input: "5\n5 5 5 5 5", expected: "0", isHidden: false },
      { input: "3\n100 1 50", expected: "99", isHidden: true },
      { input: "2\n1 1000000", expected: "999999", isHidden: true },
    ],
  },
  {
    sequence: 4,
    title: "Q4: Max Subarray Signal (Sliding Window)",
    difficulty: "Hard",
    statement: `**Narrative:** Find the maximum sum of Wi-Fi signal strengths over any contiguous window of size $K$. The AI recalculates the sum of the window from scratch every single time, which causes TLE when $N$ and $K$ are large ($O(N \\times K)$).

**Task:** Optimize this to $O(N)$ using the **Sliding Window** technique (compute the first window of size $K$, then slide the window by adding the new element entering and subtracting the element leaving).`,
    inputFormat: "First line: integers N and K. Second line: N space-separated integers.",
    outputFormat: "A single integer representing the maximum sum over any window of size K.",
    constraints: "1 <= K <= N <= 100,000",
    sampleInput: "4 2\n1 2 3 4",
    sampleOutput: "7",
    timeLimitMs: 1000,
    starterCodes: {
      c: `int maxSignal(int arr[], int n, int k) {
    int max_sum = 0;
    for(int i = 0; i <= n - k; i++) {
        int curr = 0;
        for(int j = i; j < i + k; j++) curr += arr[j];
        if(curr > max_sum) max_sum = curr;
    }
    return max_sum;
}`,
      cpp: `int maxSignal(vector<int>& arr, int k) {
    int maxSum = 0;
    for(int i = 0; i <= (int)arr.size() - k; i++) {
        int currentSum = 0;
        for(int j = i; j < i + k; j++) currentSum += arr[j];
        maxSum = max(maxSum, currentSum);
    }
    return maxSum;
}`,
      java: `public int maxSignal(int[] arr, int k) {
    int maxSum = 0;
    for(int i = 0; i <= arr.length - k; i++) {
        int currentSum = 0;
        for(int j = i; j < i + k; j++) currentSum += arr[j];
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
      python: `def max_signal(arr: list[int], k: int) -> int:
    return max(sum(arr[i:i + k]) for i in range(len(arr) - k + 1))`,
    },
    testCases: [
      { input: "4 2\n1 2 3 4", expected: "7", isHidden: false },
      { input: "6 3\n2 1 5 1 3 2", expected: "9", isHidden: false },
      { input: "5 1\n4 8 2 1 9", expected: "9", isHidden: true },
      { input: "5 5\n1 2 3 4 5", expected: "15", isHidden: true },
    ],
  },
];

const SET_B_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The Handshake AI",
    difficulty: "Easy",
    statement: `**Narrative:** If there are $N$ students at the ByteVerse opening ceremony, and everyone shakes hands with everyone else exactly once, how many handshakes happen? The AI simulates this with nested loops $O(N^2)$. This TLEs when $N = 10^9$.

**Task:** Optimize the $O(N^2)$ simulation into an $O(1)$ mathematical formula:
$$\\text{Handshakes} = \\frac{N \\times (N - 1)}{2}$$

*(Hint: Use a 64-bit integer / \`long long\` / \`long\` to prevent overflow!)*`,
    inputFormat: "A single integer N (1 <= N <= 10^9)",
    outputFormat: "A single 64-bit integer representing total handshakes",
    constraints: "1 <= N <= 10^9",
    sampleInput: "4",
    sampleOutput: "6",
    timeLimitMs: 1000,
    starterCodes: {
      c: `long long countHandshakes(long long n) {
    long long count = 0;
    for(long long i = 0; i < n; i++) {
        for(long long j = i + 1; j < n; j++) {
            count++;
        }
    }
    return count;
}`,
      cpp: `long long countHandshakes(long long n) {
    long long count = 0;
    for(long long i = 0; i < n; i++) {
        for(long long j = i + 1; j < n; j++) {
            count++;
        }
    }
    return count;
}`,
      java: `public long countHandshakes(long n) {
    long count = 0;
    for(long i = 0; i < n; i++) {
        for(long j = i + 1; j < n; j++) {
            count++;
        }
    }
    return count;
}`,
      python: `def count_handshakes(n: int) -> int:
    return sum(1 for i in range(n) for j in range(i + 1, n))`,
    },
    testCases: [
      { input: "4", expected: "6", isHidden: false },
      { input: "1", expected: "0", isHidden: false },
      { input: "100", expected: "4950", isHidden: true },
      { input: "1000000000", expected: "499999999500000000", isHidden: true },
    ],
  },
  {
    sequence: 2,
    title: "Q2: The Uniform Array Checker",
    difficulty: "Easy",
    statement: `**Narrative:** Check if all items in a given array are completely identical (e.g., all 5s). The AI compares every element with every other element, taking $O(N^2)$ time.

**Task:** Optimize to $O(N)$ by just comparing every element to the *first* element ($arr[0]$) in the array!`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "1 (or true) if all elements are identical, 0 (or false) otherwise.",
    constraints: "1 <= N <= 100,000",
    sampleInput: "4\n5 5 5 5",
    sampleOutput: "1",
    timeLimitMs: 1000,
    starterCodes: {
      c: `int isUniform(int arr[], int n) {
    for(int i = 0; i < n; i++) {
        for(int j = i + 1; j < n; j++) {
            if(arr[i] != arr[j]) return 0;
        }
    }
    return 1;
}`,
      cpp: `bool isUniform(vector<int>& arr) {
    for(int i = 0; i < arr.size(); i++) {
        for(int j = i + 1; j < arr.size(); j++) {
            if(arr[i] != arr[j]) return false;
        }
    }
    return true;
}`,
      java: `public boolean isUniform(int[] arr) {
    for(int i = 0; i < arr.length; i++) {
        for(int j = i + 1; j < arr.length; j++) {
            if(arr[i] != arr[j]) return false;
        }
    }
    return true;
}`,
      python: `def is_uniform(arr: list[int]) -> bool:
    return all(arr[i] == arr[j] for i in range(len(arr)) for j in range(i + 1, len(arr)))`,
    },
    testCases: [
      { input: "4\n5 5 5 5", expected: "1", isHidden: false },
      { input: "4\n5 5 2 5", expected: "0", isHidden: false },
      { input: "1\n42", expected: "1", isHidden: true },
      { input: "6\n9 9 9 9 9 8", expected: "0", isHidden: true },
    ],
  },
  {
    sequence: 3,
    title: "Q3: The Largest Product",
    difficulty: "Easy",
    statement: `**Narrative:** Find the maximum possible product of any two distinct positive numbers in an array. The AI tries multiplying every pair using nested loops $O(N^2)$.

**Task:** Optimize this by finding the two largest numbers in the array. You can do this in $O(N)$ with a single loop, or $O(N \\log N)$ by sorting the array!`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "A single 64-bit integer representing the maximum product of any two numbers.",
    constraints: "2 <= N <= 100,000",
    sampleInput: "4\n1 4 3 2",
    sampleOutput: "12",
    timeLimitMs: 1000,
    starterCodes: {
      c: `long long maxProduct(int arr[], int n) {
    long long max_prod = 0;
    for(int i = 0; i < n; i++) {
        for(int j = i + 1; j < n; j++) {
            long long prod = (long long)arr[i] * arr[j];
            if(prod > max_prod) max_prod = prod;
        }
    }
    return max_prod;
}`,
      cpp: `long long maxProduct(vector<int>& arr) {
    long long maxProd = 0;
    for(int i = 0; i < arr.size(); i++) {
        for(int j = i + 1; j < arr.size(); j++) {
            maxProd = max(maxProd, (long long)arr[i] * arr[j]);
        }
    }
    return maxProd;
}`,
      java: `public long maxProduct(int[] arr) {
    long maxProd = 0;
    for(int i = 0; i < arr.length; i++) {
        for(int j = i + 1; j < arr.length; j++) {
            maxProd = Math.max(maxProd, (long)arr[i] * arr[j]);
        }
    }
    return maxProd;
}`,
      python: `def max_product(arr: list[int]) -> int:
    return max((arr[i] * arr[j] for i in range(len(arr)) for j in range(i + 1, len(arr))), default=0)`,
    },
    testCases: [
      { input: "4\n1 4 3 2", expected: "12", isHidden: false },
      { input: "5\n10 10 5 2 1", expected: "100", isHidden: false },
      { input: "2\n6 7", expected: "42", isHidden: true },
      { input: "5\n100000 100000 1 2 3", expected: "10000000000", isHidden: true },
    ],
  },
  {
    sequence: 4,
    title: "Q4: Min Subarray Expense (Sliding Window)",
    difficulty: "Hard",
    statement: `**Narrative:** Find the minimum total expense over any consecutive window of $K$ days. The AI recalculates the window sum from scratch every time, taking $O(N \\times K)$ and causing TLE.

**Task:** Optimize this to $O(N)$ using the **Sliding Window** technique!`,
    inputFormat: "First line: integers N and K. Second line: N space-separated integers.",
    outputFormat: "A single integer representing the minimum sum over any window of size K.",
    constraints: "1 <= K <= N <= 100,000",
    sampleInput: "5 2\n3 8 2 5 1",
    sampleOutput: "6",
    timeLimitMs: 1000,
    starterCodes: {
      c: `int minExpense(int arr[], int n, int k) {
    int min_val = 2147483647;
    for(int i = 0; i <= n - k; i++) {
        int sum = 0;
        for(int j = i; j < i + k; j++) sum += arr[j];
        if(sum < min_val) min_val = sum;
    }
    return min_val;
}`,
      cpp: `int minExpense(vector<int>& arr, int k) {
    int minVal = 2147483647;
    for(int i = 0; i <= (int)arr.size() - k; i++) {
        int sum = 0;
        for(int j = i; j < i + k; j++) sum += arr[j];
        minVal = min(minVal, sum);
    }
    return minVal;
}`,
      java: `public int minExpense(int[] arr, int k) {
    int minVal = Integer.MAX_VALUE;
    for(int i = 0; i <= arr.length - k; i++) {
        int sum = 0;
        for(int j = i; j < i + k; j++) sum += arr[j];
        minVal = Math.min(minVal, sum);
    }
    return minVal;
}`,
      python: `def min_expense(arr: list[int], k: int) -> int:
    return min(sum(arr[i:i + k]) for i in range(len(arr) - k + 1))`,
    },
    testCases: [
      { input: "5 2\n3 8 2 5 1", expected: "6", isHidden: false },
      { input: "4 3\n10 20 30 40", expected: "60", isHidden: false },
      { input: "3 1\n5 1 9", expected: "1", isHidden: true },
      { input: "4 4\n1 2 3 4", expected: "10", isHidden: true },
    ],
  },
];

async function seedRound2() {
  console.log("⚡ Seeding Round 2: AI Code Optimization Problems & Starter Codes...");

  const round2 = await db.round.findFirst({
    where: { eventId: EVENT_ID, sequence: 2 },
  });

  if (!round2) {
    console.error("❌ Round 2 not found! Ensure rounds are created first.");
    return;
  }

  // Clear existing problems in Round 2
  await db.testCase.deleteMany({
    where: { problem: { roundId: round2.id } },
  });
  await db.problem.deleteMany({
    where: { roundId: round2.id },
  });

  // Seed Set A Questions
  for (const q of SET_A_QUESTIONS) {
    const problem = await db.problem.create({
      data: {
        roundId: round2.id,
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        constraints: q.constraints,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        difficulty: q.difficulty,
        timeLimitMs: q.timeLimitMs,
        set: "A",
        sequence: q.sequence,
        starterCodes: q.starterCodes,
        isPublished: true,
        allowedLangs: ["c", "cpp", "java", "python"],
      },
    });

    for (let i = 0; i < q.testCases.length; i++) {
      const tc = q.testCases[i];
      await db.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          score: 25,
          sequence: i + 1,
        },
      });
    }

    console.log(`✅ Seeded Set A: ${q.title} (${q.difficulty}) with ${q.testCases.length} test cases`);
  }

  // Seed Set B Questions
  for (const q of SET_B_QUESTIONS) {
    const problem = await db.problem.create({
      data: {
        roundId: round2.id,
        title: q.title,
        statement: q.statement,
        inputFormat: q.inputFormat,
        outputFormat: q.outputFormat,
        constraints: q.constraints,
        sampleInput: q.sampleInput,
        sampleOutput: q.sampleOutput,
        difficulty: q.difficulty,
        timeLimitMs: q.timeLimitMs,
        set: "B",
        sequence: q.sequence,
        starterCodes: q.starterCodes,
        isPublished: true,
        allowedLangs: ["c", "cpp", "java", "python"],
      },
    });

    for (let i = 0; i < q.testCases.length; i++) {
      const tc = q.testCases[i];
      await db.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          score: 25,
          sequence: i + 1,
        },
      });
    }

    console.log(`✅ Seeded Set B: ${q.title} (${q.difficulty}) with ${q.testCases.length} test cases`);
  }

  console.log("🎉 Round 2 AI Code Optimization Question Bank Successfully Seeded!");
}

seedRound2()
  .catch(console.error)
  .finally(() => db.$disconnect());
