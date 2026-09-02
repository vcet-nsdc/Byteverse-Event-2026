import { db } from "../src/lib/db";

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

const SET_A_QUESTIONS = [
  {
    sequence: 1,
    title: "Q1: The Summation AI",
    difficulty: "Easy",
    statement: `**Narrative:** The AI wrote a script to calculate the sum of the first N natural numbers for a math game. It works fine for small N, but for large inputs ($N = 10^9$), it causes a **Time Limit Exceeded (TLE)** error because it loops a billion times!

**Task:** Optimize the $O(N)$ loop into an $O(1)$ mathematical formula:
Formula: Sum = (N * (N + 1)) / 2

(Hint: Use a 64-bit integer / \`long long\` / \`long\` to prevent 32-bit integer overflow!)`,
    inputFormat: "A single integer N (1 <= N <= 10^9)",
    outputFormat: "A single 64-bit integer representing the sum of 1 to N",
    constraints: "1 <= N <= 10^9",
    sampleInput: "5",
    sampleOutput: "15",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N) solution causes TLE for large N
// TODO: Optimize to O(1) using formula: (n * (n + 1)) / 2
long long getSum(long long n) {
    long long sum = 0;
    for (long long i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

int main() {
    long long n;
    if (scanf("%lld", &n) == 1) {
        printf("%lld\\n", getSum(n));
    }
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

// Naive O(N) solution causes TLE for large N
// TODO: Optimize to O(1) using formula: (n * (n + 1)) / 2
long long getSum(long long n) {
    long long sum = 0;
    for (long long i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

int main() {
    long long n;
    if (cin >> n) {
        cout << getSum(n) << "\\n";
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N) solution causes TLE for large N
    // TODO: Optimize to O(1) using formula: (n * (n + 1)) / 2
    public static long getSum(long n) {
        long sum = 0;
        for (long i = 1; i <= n; i++) {
            sum += i;
        }
        return sum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLong()) {
            long n = sc.nextLong();
            System.out.println(getSum(n));
        }
    }
}`,
      python: `# Naive O(N) solution causes TLE for large N
# TODO: Optimize to O(1) using formula: (n * (n + 1)) // 2
def get_sum(n: int) -> int:
    return sum(range(1, n + 1))

if __name__ == "__main__":
    n = int(input().strip())
    print(get_sum(n))`,
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
    statement: `**Narrative:** The AI needs to verify if an array of student scores is **strictly increasing** (\`arr[i] < arr[i+1]\`). Currently, the AI compares *every* element to *all* the elements that come after it using nested loops. This takes $O(N^2)$ time and causes TLE for large arrays.

**Task:** Optimize it to $O(N)$ by only comparing adjacent neighboring elements (\`arr[i]\` and \`arr[i+1]\`).`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "1 (or true) if strictly increasing, 0 (or false) otherwise.",
    constraints: "1 <= N <= 100,000",
    sampleInput: "5\n1 2 3 4 5",
    sampleOutput: "1",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N^2) solution: compares every element with all following elements
// TODO: Optimize to O(N) by checking adjacent elements (arr[i] < arr[i+1])
int isSorted(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] >= arr[j]) return 0;
        }
    }
    return 1;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[n];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", isSorted(arr, n));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

// Naive O(N^2) solution: compares every element with all following elements
// TODO: Optimize to O(N) by checking adjacent elements (arr[i] < arr[i+1])
bool isSorted(vector<int>& arr) {
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            if (arr[i] >= arr[j]) return false;
        }
    }
    return true;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << (isSorted(arr) ? 1 : 0) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N^2) solution: compares every element with all following elements
    // TODO: Optimize to O(N) by checking adjacent elements (arr[i] < arr[i+1])
    public static boolean isSorted(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[i] >= arr[j]) return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(isSorted(arr) ? 1 : 0);
    }
}`,
      python: `# Naive O(N^2) solution: compares every element with all following elements
# TODO: Optimize to O(N) by checking adjacent elements (arr[i] < arr[i+1])
def is_sorted(arr: list[int]) -> bool:
    return all(arr[i] < arr[j] for i in range(len(arr)) for j in range(i + 1, len(arr)))

if __name__ == "__main__":
    import sys
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        arr = [int(x) for x in tokens[1:n+1]]
        print(1 if is_sorted(arr) else 0)`,
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
    statement: `**Narrative:** Find the "spread" (maximum difference: \`max(arr) - min(arr)\`) between the highest score and the lowest score in an array. The AI checks the difference of every possible pair using nested loops ($O(N^2)$).

**Task:** Optimize it to $O(N)$ by tracking the minimum and maximum values in a single pass, then returning \`max_val - min_val\`.`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "A single integer representing max(arr) - min(arr).",
    constraints: "1 <= N <= 100,000",
    sampleInput: "4\n10 2 8 5",
    sampleOutput: "8",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N^2) solution: checks all pairs
// TODO: Optimize to O(N) in a single pass: max(arr) - min(arr)
int getSpread(int arr[], int n) {
    int max_diff = 0;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            int diff = arr[i] - arr[j];
            if (diff > max_diff) max_diff = diff;
        }
    }
    return max_diff;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[n];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", getSpread(arr, n));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Naive O(N^2) solution: checks all pairs
// TODO: Optimize to O(N) in a single pass: max(arr) - min(arr)
int getSpread(vector<int>& arr) {
    int maxDiff = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = 0; j < (int)arr.size(); j++) {
            maxDiff = max(maxDiff, arr[i] - arr[j]);
        }
    }
    return maxDiff;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << getSpread(arr) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N^2) solution: checks all pairs
    // TODO: Optimize to O(N) in a single pass: max(arr) - min(arr)
    public static int getSpread(int[] arr) {
        int maxDiff = 0;
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr.length; j++) {
                maxDiff = Math.max(maxDiff, arr[i] - arr[j]);
            }
        }
        return maxDiff;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(getSpread(arr));
    }
}`,
      python: `# Naive O(N^2) solution: checks all pairs
# TODO: Optimize to O(N) in a single pass: max(arr) - min(arr)
def get_spread(arr: list[int]) -> int:
    return max(abs(arr[i] - arr[j]) for i in range(len(arr)) for j in range(len(arr)))

if __name__ == "__main__":
    import sys
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        arr = [int(x) for x in tokens[1:n+1]]
        print(get_spread(arr))`,
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
    statement: `**Narrative:** Find the maximum sum of Wi-Fi signal strengths over any contiguous window of size $K$. The AI recalculates the sum of the window from scratch every single time, which causes TLE when $N$ and $K$ are large ($O(N * K)$).

**Task:** Optimize this to $O(N)$ using the **Sliding Window** technique (compute the first window of size $K$, then slide the window by adding the new element entering and subtracting the element leaving).`,
    inputFormat: "First line: integers N and K. Second line: N space-separated integers.",
    outputFormat: "A single integer representing the maximum sum over any window of size K.",
    constraints: "1 <= K <= N <= 100,000",
    sampleInput: "4 2\n1 2 3 4",
    sampleOutput: "7",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N*K) solution: recalculates window sum from scratch
// TODO: Optimize to O(N) using sliding window
int maxSignal(int arr[], int n, int k) {
    int max_sum = 0;
    for (int i = 0; i <= n - k; i++) {
        int curr = 0;
        for (int j = i; j < i + k; j++) curr += arr[j];
        if (curr > max_sum) max_sum = curr;
    }
    return max_sum;
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;
    int arr[n];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", maxSignal(arr, n, k));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Naive O(N*K) solution: recalculates window sum from scratch
// TODO: Optimize to O(N) using sliding window
int maxSignal(vector<int>& arr, int k) {
    int maxSum = 0;
    for (int i = 0; i <= (int)arr.size() - k; i++) {
        int currentSum = 0;
        for (int j = i; j < i + k; j++) currentSum += arr[j];
        maxSum = max(maxSum, currentSum);
    }
    return maxSum;
}

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << maxSignal(arr, k) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N*K) solution: recalculates window sum from scratch
    // TODO: Optimize to O(N) using sliding window
    public static int maxSignal(int[] arr, int k) {
        int maxSum = 0;
        for (int i = 0; i <= arr.length - k; i++) {
            int currentSum = 0;
            for (int j = i; j < i + k; j++) currentSum += arr[j];
            maxSum = Math.max(maxSum, currentSum);
        }
        return maxSum;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(maxSignal(arr, k));
    }
}`,
      python: `# Naive O(N*K) solution: recalculates window sum from scratch
# TODO: Optimize to O(N) using sliding window
def max_signal(arr: list[int], k: int) -> int:
    return max(sum(arr[i:i + k]) for i in range(len(arr) - k + 1))

if __name__ == "__main__":
    import sys
    tokens = sys.stdin.read().split()
    if tokens:
        n, k = int(tokens[0]), int(tokens[1])
        arr = [int(x) for x in tokens[2:n+2]]
        print(max_signal(arr, k))`,
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
Formula: Handshakes = (N * (N - 1)) / 2

(Hint: Use a 64-bit integer / \`long long\` / \`long\` to prevent overflow!)`,
    inputFormat: "A single integer N (1 <= N <= 10^9)",
    outputFormat: "A single 64-bit integer representing total handshakes",
    constraints: "1 <= N <= 10^9",
    sampleInput: "4",
    sampleOutput: "6",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N^2) simulation causes TLE for large N
// TODO: Optimize to O(1) using formula: (n * (n - 1)) / 2
long long countHandshakes(long long n) {
    long long count = 0;
    for (long long i = 0; i < n; i++) {
        for (long long j = i + 1; j < n; j++) {
            count++;
        }
    }
    return count;
}

int main() {
    long long n;
    if (scanf("%lld", &n) == 1) {
        printf("%lld\\n", countHandshakes(n));
    }
    return 0;
}`,
      cpp: `#include <iostream>
using namespace std;

// Naive O(N^2) simulation causes TLE for large N
// TODO: Optimize to O(1) using formula: (n * (n - 1)) / 2
long long countHandshakes(long long n) {
    long long count = 0;
    for (long long i = 0; i < n; i++) {
        for (long long j = i + 1; j < n; j++) {
            count++;
        }
    }
    return count;
}

int main() {
    long long n;
    if (cin >> n) {
        cout << countHandshakes(n) << "\\n";
    }
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N^2) simulation causes TLE for large N
    // TODO: Optimize to O(1) using formula: (n * (n - 1)) / 2
    public static long countHandshakes(long n) {
        long count = 0;
        for (long i = 0; i < n; i++) {
            for (long j = i + 1; j < n; j++) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLong()) {
            long n = sc.nextLong();
            System.out.println(countHandshakes(n));
        }
    }
}`,
      python: `# Naive O(N^2) simulation causes TLE for large N
# TODO: Optimize to O(1) using formula: (n * (n - 1)) // 2
def count_handshakes(n: int) -> int:
    return sum(1 for i in range(n) for j in range(i + 1, n))

if __name__ == "__main__":
    n = int(input().strip())
    print(count_handshakes(n))`,
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

**Task:** Optimize to $O(N)$ by just comparing every element to the *first* element (\`arr[0]\`) in the array!`,
    inputFormat: "First line: integer N. Second line: N space-separated integers.",
    outputFormat: "1 (or true) if all elements are identical, 0 (or false) otherwise.",
    constraints: "1 <= N <= 100,000",
    sampleInput: "4\n5 5 5 5",
    sampleOutput: "1",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N^2) solution: compares every pair
// TODO: Optimize to O(N) by checking if every arr[i] == arr[0]
int isUniform(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] != arr[j]) return 0;
        }
    }
    return 1;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[n];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", isUniform(arr, n));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

// Naive O(N^2) solution: compares every pair
// TODO: Optimize to O(N) by checking if every arr[i] == arr[0]
bool isUniform(vector<int>& arr) {
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            if (arr[i] != arr[j]) return false;
        }
    }
    return true;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << (isUniform(arr) ? 1 : 0) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N^2) solution: compares every pair
    // TODO: Optimize to O(N) by checking if every arr[i] == arr[0]
    public static boolean isUniform(int[] arr) {
        for (int i = 0; i < arr.length; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                if (arr[i] != arr[j]) return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(isUniform(arr) ? 1 : 0);
    }
}`,
      python: `# Naive O(N^2) solution: compares every pair
# TODO: Optimize to O(N) by checking if every arr[i] == arr[0]
def is_uniform(arr: list[int]) -> bool:
    return all(arr[i] == arr[j] for i in range(len(arr)) for j in range(i + 1, len(arr)))

if __name__ == "__main__":
    import sys
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        arr = [int(x) for x in tokens[1:n+1]]
        print(1 if is_uniform(arr) else 0)`,
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
      c: `#include <stdio.h>

// Naive O(N^2) solution: multiplies every pair
// TODO: Optimize to O(N) by finding the two largest elements
long long maxProduct(int arr[], int n) {
    long long max_prod = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            long long prod = (long long)arr[i] * arr[j];
            if (prod > max_prod) max_prod = prod;
        }
    }
    return max_prod;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[n];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%lld\\n", maxProduct(arr, n));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Naive O(N^2) solution: multiplies every pair
// TODO: Optimize to O(N) by finding the two largest elements
long long maxProduct(vector<int>& arr) {
    long long maxProd = 0;
    for (int i = 0; i < (int)arr.size(); i++) {
        for (int j = i + 1; j < (int)arr.size(); j++) {
            maxProd = max(maxProd, (long long)arr[i] * arr[j]);
        }
    }
    return maxProd;
}

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << maxProduct(arr) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N^2) solution: multiplies every pair
    // TODO: Optimize to O(N) by finding the two largest elements
    public static long maxProduct(int[] arr) {
        long maxProd = 0;
        for (int i = 0; i < arr.length; i++) {
            for (int j = i + 1; j < arr.length; j++) {
                maxProd = Math.max(maxProd, (long)arr[i] * arr[j]);
            }
        }
        return maxProd;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(maxProduct(arr));
    }
}`,
      python: `# Naive O(N^2) solution: multiplies every pair
# TODO: Optimize to O(N) by finding the two largest elements
def max_product(arr: list[int]) -> int:
    return max((arr[i] * arr[j] for i in range(len(arr)) for j in range(i + 1, len(arr))), default=0)

if __name__ == "__main__":
    import sys
    tokens = sys.stdin.read().split()
    if tokens:
        n = int(tokens[0])
        arr = [int(x) for x in tokens[1:n+1]]
        print(max_product(arr))`,
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
    statement: `**Narrative:** Find the minimum total expense over any consecutive window of $K$ days. The AI recalculates the window sum from scratch every time, taking $O(N * K)$ and causing TLE.

**Task:** Optimize this to $O(N)$ using the **Sliding Window** technique!`,
    inputFormat: "First line: integers N and K. Second line: N space-separated integers.",
    outputFormat: "A single integer representing the minimum sum over any window of size K.",
    constraints: "1 <= K <= N <= 100,000",
    sampleInput: "5 2\n3 8 2 5 1",
    sampleOutput: "6",
    timeLimitMs: 1000,
    starterCodes: {
      c: `#include <stdio.h>

// Naive O(N*K) solution: recalculates window sum from scratch
// TODO: Optimize to O(N) using sliding window
int minExpense(int arr[], int n, int k) {
    int min_val = 2147483647;
    for (int i = 0; i <= n - k; i++) {
        int sum = 0;
        for (int j = i; j < i + k; j++) sum += arr[j];
        if (sum < min_val) min_val = sum;
    }
    return min_val;
}

int main() {
    int n, k;
    if (scanf("%d %d", &n, &k) != 2) return 0;
    int arr[n];
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    printf("%d\\n", minExpense(arr, n, k));
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Naive O(N*K) solution: recalculates window sum from scratch
// TODO: Optimize to O(N) using sliding window
int minExpense(vector<int>& arr, int k) {
    int minVal = 2147483647;
    for (int i = 0; i <= (int)arr.size() - k; i++) {
        int sum = 0;
        for (int j = i; j < i + k; j++) sum += arr[j];
        minVal = min(minVal, sum);
    }
    return minVal;
}

int main() {
    int n, k;
    if (!(cin >> n >> k)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << minExpense(arr, k) << "\\n";
    return 0;
}`,
      java: `import java.util.Scanner;

public class Main {
    // Naive O(N*K) solution: recalculates window sum from scratch
    // TODO: Optimize to O(N) using sliding window
    public static int minExpense(int[] arr, int k) {
        int minVal = Integer.MAX_VALUE;
        for (int i = 0; i <= arr.length - k; i++) {
            int sum = 0;
            for (int j = i; j < i + k; j++) sum += arr[j];
            minVal = Math.min(minVal, sum);
        }
        return minVal;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int k = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = sc.nextInt();
        System.out.println(minExpense(arr, k));
    }
}`,
      python: `# Naive O(N*K) solution: recalculates window sum from scratch
# TODO: Optimize to O(N) using sliding window
def min_expense(arr: list[int], k: int) -> int:
    return min(sum(arr[i:i + k]) for i in range(len(arr) - k + 1))

if __name__ == "__main__":
    import sys
    tokens = sys.stdin.read().split()
    if tokens:
        n, k = int(tokens[0]), int(tokens[1])
        arr = [int(x) for x in tokens[2:n+2]]
        print(min_expense(arr, k))`,
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
  console.log("⚡ Seeding Round 2: Complete Executable Starter Codes for C, C++, Java & Python...");

  const round2 = await db.round.findFirst({
    where: { eventId: EVENT_ID, sequence: 2 },
  });

  if (!round2) {
    console.error("❌ Round 2 not found! Ensure rounds are created first.");
    return;
  }

  // Clear existing submissions, test cases, and problems in Round 2
  await db.submission.deleteMany({
    where: { roundId: round2.id },
  });
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
        memoryLimitMb: 256,
        allowedLangs: ["cpp", "c", "java", "python"],
        isPublished: true,
        set: "A",
        starterCodes: q.starterCodes,
        sequence: q.sequence,
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
        memoryLimitMb: 256,
        allowedLangs: ["cpp", "c", "java", "python"],
        isPublished: true,
        set: "B",
        starterCodes: q.starterCodes,
        sequence: q.sequence,
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
  }

  console.log("✅ Round 2 successfully seeded with 8 questions (Set A & Set B) with complete boilerplates!");
}

seedRound2()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
