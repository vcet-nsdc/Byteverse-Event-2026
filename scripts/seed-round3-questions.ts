import { db } from "../src/lib/db";

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

const SET_A_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The Last Occurrence Search",
    difficulty: "Easy",
    statement: `**Narrative:** The ByteVerse library system needs a function to find the *very last* 0-based index where a specific \`target\` book ID appears on the shelf. If the book is not found, it must return \`-1\`.
The AI wrote a script, but it is returning the *first* occurrence instead of the last, and it crashes on certain small arrays!

**Task:** Locate and fix the **2 bugs** in the AI's code (Loop start boundary bug skipping index 0, and premature \`break\` statement).`,
    inputFormat: "First line: two space-separated integers N and target. Second line: N space-separated integers representing the array.",
    outputFormat: "A single integer representing the last 0-based index of target, or -1 if not found.",
    constraints: "1 <= N <= 100,000, -10^9 <= arr[i], target <= 10^9",
    sampleInput: "5 3\n1 3 5 3 2",
    sampleOutput: "3",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

int findLast(int arr[], int n, int target) {
    int idx = -1;
    for(int i = 1; i < n; i++) {
        if(arr[i] == target) {
            idx = i;
            break;
        }
    }
    return idx;
}

int main() {
    int n, target;
    if (scanf("%d %d", &n, &target) != 2) return 0;
    int arr[n];
    for(int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", findLast(arr, n, target));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int findLast(vector<int>& arr, int target) {
    int idx = -1;
    for(int i = 1; i < arr.size(); i++) {
        if(arr[i] == target) {
            idx = i;
            break;
        }
    }
    return idx;
}

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << findLast(arr, target) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int findLast(int[] arr, int target) {
        int idx = -1;
        for(int i = 1; i < arr.length; i++) {
            if(arr[i] == target) {
                idx = i;
                break;
            }
        }
        return idx;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int target = sc.nextInt();
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(findLast(arr, target));
    }
}`,
      python: `import sys

def find_last(arr, target):
    idx = -1
    for i in range(1, len(arr)):
        if arr[i] == target:
            idx = i
            break
    return idx

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    target = int(input_data[1])
    arr = [int(x) for x in input_data[2:2+n]]
    print(find_last(arr, target))

if __name__ == "__main__":
    main()`,
    },
    testCases: [
      { input: "5 3\n1 3 5 3 2", expected: "3", isHidden: false },
      { input: "4 7\n7 2 3 4", expected: "0", isHidden: false },
      { input: "4 9\n1 2 3 4", expected: "-1", isHidden: true },
      { input: "6 4\n4 4 4 4 4 4", expected: "5", isHidden: true },
      { input: "1 10\n10", expected: "0", isHidden: true },
    ],
  },
  {
    sequence: 2,
    title: "Q2: Max Sales Streak",
    difficulty: "Medium",
    statement: `**Narrative:** An employee's "sales streak" is the maximum number of *consecutive* days they made a positive number of sales (\`> 0\`).
The AI wrote code to calculate the longest streak. However, it crashes on the last day due to array out-of-bounds indexing, and for arrays like \`[1, 2, -1, 4]\`, it incorrectly returns \`3\` instead of \`2\` because it never resets the counter on zero or negative sales!

**Task:** Locate and fix the **2 bugs** in the AI's code (Fix loop bounds to stay within range, and add state reset \`else\` block when \`arr[i] <= 0\`).`,
    inputFormat: "First line: integer N representing number of days. Second line: N space-separated integers representing daily sales.",
    outputFormat: "A single integer representing the maximum consecutive days with positive sales (> 0).",
    constraints: "1 <= N <= 100,000, -10^6 <= arr[i] <= 10^6",
    sampleInput: "6\n1 2 -1 4 5 6",
    sampleOutput: "3",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

int maxStreak(int arr[], int n) {
    int max_str = 0, curr = 0;
    for(int i = 0; i <= n; i++) {
        if(arr[i] > 0) {
            curr++;
        }
        if(curr > max_str) max_str = curr;
    }
    return max_str;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[n + 1];
    for(int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", maxStreak(arr, n));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int maxStreak(vector<int>& arr) {
    int maxStr = 0, curr = 0;
    for(int i = 0; i <= arr.size(); i++) {
        if(arr[i] > 0) {
            curr++;
        }
        maxStr = max(maxStr, curr);
    }
    return maxStr;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << maxStreak(arr) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int maxStreak(int[] arr) {
        int maxStr = 0, curr = 0;
        for(int i = 0; i <= arr.length; i++) {
            if(arr[i] > 0) {
                curr++;
            }
            maxStr = Math.max(maxStr, curr);
        }
        return maxStr;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(maxStreak(arr));
    }
}`,
      python: `import sys

def max_streak(arr):
    max_str = 0
    curr = 0
    for i in range(len(arr) + 1):
        if arr[i] > 0:
            curr += 1
        max_str = max(max_str, curr)
    return max_str

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:1+n]]
    print(max_streak(arr))

if __name__ == "__main__":
    main()`,
    },
    testCases: [
      { input: "6\n1 2 -1 4 5 6", expected: "3", isHidden: false },
      { input: "4\n1 2 -1 4", expected: "2", isHidden: false },
      { input: "5\n-1 -2 0 -4 -5", expected: "0", isHidden: true },
      { input: "5\n1 2 3 4 5", expected: "5", isHidden: true },
      { input: "7\n1 0 2 3 0 4 5", expected: "2", isHidden: true },
    ],
  },
];

const SET_B_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The First Vowel Index",
    difficulty: "Easy",
    statement: `**Narrative:** Find the 0-based index of the *first* lowercase vowel (\`a, e, i, o, u\`) in a given string. If there are no vowels, return \`-1\`.
The AI wrote code, but it always returns \`0\` when there are no vowels, and it seems impossible for it to detect any vowel due to impossible logical condition combining (\`&&\`)!

**Task:** Locate and fix the **2 bugs** (Change \`&&\` to \`||\` in vowel checks, and return \`-1\` when no vowel is found).`,
    inputFormat: "A single string S consisting of lowercase English letters.",
    outputFormat: "A single integer representing the 0-based index of the first vowel, or -1 if no vowels exist.",
    constraints: "1 <= |S| <= 100,000",
    sampleInput: "rhythm",
    sampleOutput: "-1",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>
#include <string.h>

int firstVowel(char str[], int n) {
    for(int i = 0; i < n; i++) {
        if(str[i] == 'a' && str[i] == 'e' && str[i] == 'i' && str[i] == 'o' && str[i] == 'u') {
            return i;
        }
    }
    return 0;
}

int main() {
    char str[100005];
    if (scanf("%100000s", str) != 1) return 0;
    printf("%d\\n", firstVowel(str, strlen(str)));
    return 0;
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

int firstVowel(string str) {
    for(int i = 0; i < str.length(); i++) {
        if(str[i] == 'a' && str[i] == 'e' && str[i] == 'i' && str[i] == 'o' && str[i] == 'u') {
            return i;
        }
    }
    return 0;
}

int main() {
    string str;
    if (!(cin >> str)) return 0;
    cout << firstVowel(str) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int firstVowel(String str) {
        for(int i = 0; i < str.length(); i++) {
            char c = str.charAt(i);
            if(c == 'a' && c == 'e' && c == 'i' && c == 'o' && c == 'u') {
                return i;
            }
        }
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNext()) return;
        String str = sc.next();
        System.out.println(firstVowel(str));
    }
}`,
      python: `import sys

def first_vowel(s):
    for i in range(len(s)):
        if s[i] == 'a' and s[i] == 'e' and s[i] == 'i' and s[i] == 'o' and s[i] == 'u':
            return i
    return 0

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    print(first_vowel(s))

if __name__ == "__main__":
    main()`,
    },
    testCases: [
      { input: "rhythm", expected: "-1", isHidden: false },
      { input: "byteverse", expected: "1", isHidden: false },
      { input: "apple", expected: "0", isHidden: true },
      { input: "xyz", expected: "-1", isHidden: true },
      { input: "cryptology", expected: "5", isHidden: true },
    ],
  },
  {
    sequence: 2,
    title: "Q2: Adjacent Duplicates Counter",
    difficulty: "Medium",
    statement: `**Narrative:** Count how many times an element in an array is strictly identical to the element *immediately following it* (\`arr[i] == arr[i+1]\`).
The AI wrote a script, but it is crashing on arrays because the loop index exceeds the valid array bounds, and it prematurely exits after finding the very first duplicate!

**Task:** Locate and fix the **2 bugs** (Change loop bound to \`< n - 1\` to prevent out-of-bounds reads, and increment count instead of immediately returning).`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "A single integer representing the count of adjacent duplicates.",
    constraints: "1 <= N <= 100,000, -10^9 <= arr[i] <= 10^9",
    sampleInput: "6\n1 2 2 3 4 4",
    sampleOutput: "2",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

int countAdjacentDuplicates(int arr[], int n) {
    int count = 0;
    for (int i = 0; i <= n; i++) {
        if (arr[i] == arr[i+1]) {
            return count++;
        }
    }
    return count;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[n + 2];
    for(int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", countAdjacentDuplicates(arr, n));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int countAdjacentDuplicates(vector<int>& arr) {
    int count = 0;
    for (int i = 0; i <= arr.size(); i++) {
        if (arr[i] == arr[i+1]) {
            return count++;
        }
    }
    return count;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) cin >> arr[i];
    cout << countAdjacentDuplicates(arr) << endl;
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    public static int countAdjacentDuplicates(int[] arr) {
        int count = 0;
        for (int i = 0; i <= arr.length; i++) {
            if (arr[i] == arr[i+1]) {
                return count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(countAdjacentDuplicates(arr));
    }
}`,
      python: `import sys

def count_adjacent_duplicates(arr):
    count = 0
    for i in range(len(arr) + 1):
        if arr[i] == arr[i+1]:
            count += 1
            return count
    return count

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:1+n]]
    print(count_adjacent_duplicates(arr))

if __name__ == "__main__":
    main()`,
    },
    testCases: [
      { input: "6\n1 2 2 3 4 4", expected: "2", isHidden: false },
      { input: "5\n5 5 5 5 5", expected: "4", isHidden: false },
      { input: "5\n1 2 3 4 5", expected: "0", isHidden: true },
      { input: "1\n42", expected: "0", isHidden: true },
      { input: "7\n10 10 20 20 20 30 10", expected: "3", isHidden: true },
    ],
  },
];

async function seedRound3() {
  console.log("🌱 Seeding Round 3: Debugging & Code Analysis (TRADITIONAL)...");

  // 1. Fetch or create Round 3
  const event = await db.event.findFirst({
    where: { id: EVENT_ID },
  });

  if (!event) {
    throw new Error(`Event '${EVENT_ID}' not found! Please run 'npm run db:seed' first.`);
  }

  let round3 = await db.round.findFirst({
    where: {
      eventId: event.id,
      sequence: 3,
    },
  });

  if (round3) {
    round3 = await db.round.update({
      where: { id: round3.id },
      data: {
        name: "Debugging & Code Analysis",
        type: "TRADITIONAL",
        durationMin: 35,
        maxScore: 100,
      },
    });
  } else {
    round3 = await db.round.create({
      data: {
        eventId: event.id,
        name: "Debugging & Code Analysis",
        type: "TRADITIONAL",
        sequence: 3,
        durationMin: 35,
        maxScore: 100,
        status: "DRAFT",
      },
    });
  }

  console.log(`📍 Found/Created Round 3: ${round3.name} (${round3.id})`);

  // 2. Clean existing submissions, questions, and test cases for Round 3
  await db.submission.deleteMany({
    where: { roundId: round3.id },
  });
  await db.testCase.deleteMany({
    where: { problem: { roundId: round3.id } },
  });
  await db.problem.deleteMany({
    where: { roundId: round3.id },
  });

  console.log("🧹 Cleaned old Round 3 questions and test cases.");

  // 3. Seed Set A Questions
  for (const q of SET_A_QUESTIONS) {
    const problem = await db.problem.create({
      data: {
        roundId: round3.id,
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

    const scorePerTest = Math.floor(50 / q.testCases.length);
    for (let i = 0; i < q.testCases.length; i++) {
      const tc = q.testCases[i];
      await db.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          score: scorePerTest,
          sequence: i + 1,
        },
      });
    }

    console.log(`✅ Seeded Set A: ${q.title} (${q.difficulty}) with ${q.testCases.length} test cases (50 Points)`);
  }

  // 4. Seed Set B Questions
  for (const q of SET_B_QUESTIONS) {
    const problem = await db.problem.create({
      data: {
        roundId: round3.id,
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

    const scorePerTest = Math.floor(50 / q.testCases.length);
    for (let i = 0; i < q.testCases.length; i++) {
      const tc = q.testCases[i];
      await db.testCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          score: scorePerTest,
          sequence: i + 1,
        },
      });
    }

    console.log(`✅ Seeded Set B: ${q.title} (${q.difficulty}) with ${q.testCases.length} test cases (50 Points)`);
  }

  console.log("🎉 Round 3 Debugging & Code Analysis Successfully Seeded!");
}

seedRound3()
  .catch(console.error)
  .finally(() => db.$disconnect());
