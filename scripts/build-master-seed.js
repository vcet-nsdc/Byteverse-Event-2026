/**
 * Master Seed Data Generator for ByteVerse / ByteClash Platform
 * Conforms to strict schema-safe rules, language parity (C, C++, Java, Python),
 * LeetCode/Udemy style pedagogy, and in-editor Socratic AI tutor specs.
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────────────────────
// 1. EVENTS CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const events = {
  activeEvents: [],
  pastEvents: [
    {
      id: "event_byteverse_2025",
      slug: "byteverse-2025",
      title: "ByteVerse 2025 Annual Coding Fest",
      bannerUrl: "https://assets.byteverse.dev/events/byteverse-2025-banner.png",
      status: "COMPLETED",
      startDate: "2025-03-15T09:00:00Z",
      endDate: "2025-03-15T18:00:00Z",
      description: "The flagship inter-college programming contest featuring 5 progressive rounds: Logical MCQ, AI Code Optimization, Code Debugging, DSA Deep Dive, and the AI vs Human Challenge.",
      stats: {
        registeredTeams: 142,
        collegesParticipated: 18,
        roundsCount: 5,
        totalPoints: 500
      },
      roundsSummary: [
        { round: 1, name: "Logical Thinking", type: "MCQ", points: 100 },
        { round: 2, name: "AI Code Optimization", type: "OPTIMIZE", points: 100 },
        { round: 3, name: "Debugging & Code Analysis", type: "DEBUG", points: 100 },
        { round: 4, name: "Data Structures & Algorithms", type: "DSA", points: 100 },
        { round: 5, name: "AI vs Human Duel", type: "CHALLENGE", points: 100 }
      ]
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONTESTS CONFIGURATION (3 Contests × 3 Problems)
// ─────────────────────────────────────────────────────────────────────────────
const contests = [
  {
    id: "contest_weekly_sprint_01",
    slug: "byteverse-weekly-sprint-01",
    title: "ByteVerse Weekly Sprint #01",
    type: "WEEKLY",
    difficulty: "Mixed",
    status: "SCHEDULED",
    startsAt: "2026-09-12T14:30:00Z",
    endsAt: "2026-09-12T16:00:00Z",
    durationMin: 90,
    bannerUrl: "https://assets.byteverse.dev/contests/sprint-01.png",
    description: "Master foundational competitive patterns in Array prefix math, frequency hashing, and boundary arithmetic.",
    problems: [
      {
        id: "prob_sprint01_p1",
        slug: "even-odd-balance-index",
        title: "Even-Odd Balance Index",
        difficulty: "EASY",
        points: 25,
        sequence: 1,
        statement: "You are given an integer array A of size N. Your task is to find the smallest 0-based index i such that the sum of all elements strictly to the left of i equals the sum of all elements strictly to the right of i. For boundary elements, the sum of non-existent elements is considered 0. Return the smallest index i, or -1 if no such balance index exists.",
        inputFormat: "The first line contains an integer N (1 <= N <= 10^5). The second line contains N space-separated integers A[0], A[1], ..., A[N-1].",
        outputFormat: "Print a single integer representing the smallest equilibrium index, or -1.",
        constraints: "1 <= N <= 10^5\n-10^9 <= A[i] <= 10^9",
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) {\n        scanf(\"%lld\", &a[i]);\n    }\n\n    // WRITE YOUR LOGIC HERE\n\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) {\n        cin >> a[i];\n    }\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null || line.trim().isEmpty()) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) {\n            a[i] = Long.parseLong(st.nextToken());\n        }\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    input_data = sys.stdin.read().split()\n    if not input_data:\n        return\n    n = int(input_data[0])\n    a = [int(x) for x in input_data[1:n+1]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    long long total = 0;\n    for (int i = 0; i < n; i++) {\n        scanf(\"%lld\", &a[i]);\n        total += a[i];\n    }\n    long long left_sum = 0;\n    int ans = -1;\n    for (int i = 0; i < n; i++) {\n        long long right_sum = total - left_sum - a[i];\n        if (left_sum == right_sum) {\n            ans = i;\n            break;\n        }\n        left_sum += a[i];\n    }\n    printf(\"%d\\n\", ans);\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> a(n);\n    long long total = 0;\n    for (int i = 0; i < n; i++) {\n        cin >> a[i];\n        total += a[i];\n    }\n    long long left_sum = 0;\n    int ans = -1;\n    for (int i = 0; i < n; i++) {\n        if (left_sum == total - left_sum - a[i]) {\n            ans = i;\n            break;\n        }\n        left_sum += a[i];\n    }\n    cout << ans << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null || line.trim().isEmpty()) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        long total = 0;\n        for (int i = 0; i < n; i++) {\n            a[i] = Long.parseLong(st.nextToken());\n            total += a[i];\n        }\n        long leftSum = 0;\n        int ans = -1;\n        for (int i = 0; i < n; i++) {\n            if (leftSum == total - leftSum - a[i]) {\n                ans = i;\n                break;\n            }\n            leftSum += a[i];\n        }\n        System.out.println(ans);\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data:\n        return\n    n = int(data[0])\n    a = [int(x) for x in data[1:n+1]]\n    total = sum(a)\n    left_sum = 0\n    for i in range(n):\n        if left_sum == total - left_sum - a[i]:\n            print(i)\n            return\n        left_sum += a[i]\n    print(-1)\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "6\n1 7 3 6 5 6", expected: "3", isHidden: false },
          { input: "3\n1 2 3", expected: "-1", isHidden: false },
          { input: "1\n100", expected: "0", isHidden: true },
          { input: "2\n0 0", expected: "0", isHidden: true },
          { input: "5\n2 -2 2 -2 2", expected: "2", isHidden: true },
          { input: "5\n-1 -1 -1 -1 -1", expected: "2", isHidden: true }
        ]
      },
      {
        id: "prob_sprint01_p2",
        slug: "subarray-sum-divisible-by-k",
        title: "Subarray Sum Divisible by K",
        difficulty: "MEDIUM",
        points: 50,
        sequence: 2,
        statement: "Given an integer array nums and an integer k, return the total number of non-empty subarrays that have a sum divisible by k. A subarray is a contiguous part of an array.",
        inputFormat: "First line contains two space-separated integers N and K (1 <= N <= 10^5, 1 <= K <= 10^4). Second line contains N space-separated integers nums[i].",
        outputFormat: "Output a single integer representing the number of valid subarrays.",
        constraints: "1 <= N <= 10^5\n2 <= K <= 10^4\n-10^4 <= nums[i] <= 10^4",
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    int *a = (int *)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) {\n        scanf(\"%d\", &a[i]);\n    }\n\n    // WRITE YOUR LOGIC HERE\n\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, k;\n    if (!(cin >> n >> k)) return 0;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, k = int(data[0]), int(data[1])\n    a = [int(x) for x in data[2:2+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n, k;\n    if (scanf(\"%d %d\", &n, &k) != 2) return 0;\n    int *count = (int *)calloc(k, sizeof(int));\n    count[0] = 1;\n    long long ans = 0;\n    int prefix = 0;\n    for (int i = 0; i < n; i++) {\n        int val;\n        scanf(\"%d\", &val);\n        prefix = (prefix + val) % k;\n        if (prefix < 0) prefix += k;\n        ans += count[prefix];\n        count[prefix]++;\n    }\n    printf(\"%lld\\n\", ans);\n    free(count);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n, k;\n    if (!(cin >> n >> k)) return 0;\n    vector<int> count(k, 0);\n    count[0] = 1;\n    long long ans = 0;\n    int prefix = 0;\n    for (int i = 0; i < n; i++) {\n        int val;\n        cin >> val;\n        prefix = (prefix + val) % k;\n        if (prefix < 0) prefix += k;\n        ans += count[prefix];\n        count[prefix]++;\n    }\n    cout << ans << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        int k = Integer.parseInt(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        int[] count = new int[k];\n        count[0] = 1;\n        long ans = 0;\n        int prefix = 0;\n        for (int i = 0; i < n; i++) {\n            int val = Integer.parseInt(st.nextToken());\n            prefix = (prefix + val) % k;\n            if (prefix < 0) prefix += k;\n            ans += count[prefix];\n            count[prefix]++;\n        }\n        System.out.println(ans);\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, k = int(data[0]), int(data[1])\n    nums = [int(x) for x in data[2:2+n]]\n    count = [0] * k\n    count[0] = 1\n    ans = 0\n    prefix = 0\n    for x in nums:\n        prefix = (prefix + x) % k\n        ans += count[prefix]\n        count[prefix] += 1\n    print(ans)\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "6 5\n4 5 0 -2 -3 1", expected: "7", isHidden: false },
          { input: "1 5\n5", expected: "1", isHidden: false },
          { input: "3 3\n1 2 3", expected: "3", isHidden: true },
          { input: "4 2\n-1 2 9 4", expected: "4", isHidden: true },
          { input: "5 7\n7 7 7 7 7", expected: "15", isHidden: true },
          { input: "5 4\n-4 -8 -12 -16 -20", expected: "15", isHidden: true }
        ]
      },
      {
        id: "prob_sprint01_p3",
        slug: "frequency-equalization-budget",
        title: "Frequency Equalization Budget",
        difficulty: "MEDIUM",
        points: 100,
        sequence: 3,
        statement: "You are given an integer array A of size N and an integer budget K. In one operation, you can choose any element in the array and increment it by 1. Return the maximum possible frequency of an element after performing at most K operations.",
        inputFormat: "The first line contains two integers N and K (1 <= N <= 10^5, 1 <= K <= 10^14). The second line contains N integers A[0], A[1], ..., A[N-1].",
        outputFormat: "Print the maximum frequency achievable.",
        constraints: "1 <= N <= 10^5\n1 <= K <= 10^14\n1 <= A[i] <= 10^5",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    long long k;\n    if (scanf(\"%d %lld\", &n, &k) != 2) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long k;\n    if (!(cin >> n >> k)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long k = Long.parseLong(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, k = int(data[0]), int(data[1])\n    a = [int(x) for x in data[2:2+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    long long x = *(long long *)a;\n    long long y = *(long long *)b;\n    return (x > y) - (x < y);\n}\n\nint main() {\n    int n;\n    long long k;\n    if (scanf(\"%d %lld\", &n, &k) != 2) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n    qsort(a, n, sizeof(long long), cmp);\n    int left = 0, max_f = 1;\n    long long cur_sum = 0;\n    for (int right = 0; right < n; right++) {\n        cur_sum += a[right];\n        while (a[right] * (right - left + 1) - cur_sum > k) {\n            cur_sum -= a[left];\n            left++;\n        }\n        if (right - left + 1 > max_f) max_f = right - left + 1;\n    }\n    printf(\"%d\\n\", max_f);\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long k;\n    if (!(cin >> n >> k)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    sort(a.begin(), a.end());\n    long long left = 0, cur_sum = 0, max_f = 1;\n    for (long long right = 0; right < n; right++) {\n        cur_sum += a[right];\n        while (a[right] * (right - left + 1) - cur_sum > k) {\n            cur_sum -= a[left++];\n        }\n        max_f = max(max_f, right - left + 1);\n    }\n    cout << max_f << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long k = Long.parseLong(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());\n        Arrays.sort(a);\n        int left = 0, max_f = 1;\n        long cur_sum = 0;\n        for (int right = 0; right < n; right++) {\n            cur_sum += a[right];\n            while (a[right] * (right - left + 1L) - cur_sum > k) {\n                cur_sum -= a[left++];\n            }\n            max_f = Math.max(max_f, right - left + 1);\n        }\n        System.out.println(max_f);\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, k = int(data[0]), int(data[1])\n    a = sorted([int(x) for x in data[2:2+n]])\n    left = 0\n    cur_sum = 0\n    max_f = 1\n    for right in range(n):\n        cur_sum += a[right]\n        while a[right] * (right - left + 1) - cur_sum > k:\n            cur_sum -= a[left]\n            left += 1\n        max_f = max(max_f, right - left + 1)\n    print(max_f)\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "4 5\n1 2 4 8", expected: "3", isHidden: false },
          { input: "4 2\n1 4 8 13", expected: "2", isHidden: false },
          { input: "1 10\n100", expected: "1", isHidden: true },
          { input: "5 0\n3 9 6 3 3", expected: "3", isHidden: true },
          { input: "6 100\n1 1 1 1 1 1", expected: "6", isHidden: true },
          { input: "5 14\n1 2 8 10 12", expected: "3", isHidden: true }
        ]
      }
    ]
  },
  {
    id: "contest_weekly_sprint_02",
    slug: "byteverse-weekly-sprint-02",
    title: "ByteVerse Weekly Sprint #02",
    type: "WEEKLY",
    difficulty: "Mixed",
    status: "SCHEDULED",
    startsAt: "2026-09-19T14:30:00Z",
    endsAt: "2026-09-19T16:00:00Z",
    durationMin: 90,
    bannerUrl: "https://assets.byteverse.dev/contests/sprint-02.png",
    description: "Conquer Two-Pointers, dynamic sliding window contracts, and optimal string parsing under strict execution bounds.",
    problems: [
      {
        id: "prob_sprint02_p1",
        slug: "two-sum-difference-target",
        title: "Two-Sum Difference Target",
        difficulty: "EASY",
        points: 25,
        sequence: 1,
        statement: "Given a sorted integer array A of size N in non-decreasing order and a non-negative integer difference D, determine whether there exists a pair of distinct indices (i, j) with i != j such that A[j] - A[i] = D. Print 1 if such a pair exists, otherwise print 0.",
        inputFormat: "The first line contains two integers N and D (2 <= N <= 10^5, 0 <= D <= 10^9). The second line contains N sorted integers A[i].",
        outputFormat: "Print 1 if a matching pair exists, otherwise 0.",
        constraints: "2 <= N <= 10^5\n0 <= D <= 10^9\n-10^9 <= A[i] <= 10^9\nA is sorted in non-decreasing order",
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    long long d;\n    if (scanf(\"%d %lld\", &n, &d) != 2) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long d;\n    if (!(cin >> n >> d)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long d = Long.parseLong(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, d = int(data[0]), int(data[1])\n    a = [int(x) for x in data[2:2+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    long long d;\n    if (scanf(\"%d %lld\", &n, &d) != 2) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n    int i = 0, j = 1, found = 0;\n    while (i < n && j < n) {\n        if (i != j && a[j] - a[i] == d) {\n            found = 1;\n            break;\n        } else if (a[j] - a[i] < d) {\n            j++;\n        } else {\n            i++;\n            if (i == j) j++;\n        }\n    }\n    printf(\"%d\\n\", found);\n    free(a);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long d;\n    if (!(cin >> n >> d)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int i = 0, j = 1, found = 0;\n    while (i < n && j < n) {\n        if (i != j && a[j] - a[i] == d) {\n            found = 1;\n            break;\n        } else if (a[j] - a[i] < d) {\n            j++;\n        } else {\n            i++;\n            if (i == j) j++;\n        }\n    }\n    cout << found << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long d = Long.parseLong(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());\n        int i = 0, j = 1, found = 0;\n        while (i < n && j < n) {\n            if (i != j && a[j] - a[i] == d) {\n                found = 1;\n                break;\n            } else if (a[j] - a[i] < d) {\n                j++;\n            } else {\n                i++;\n                if (i == j) j++;\n            }\n        }\n        System.out.println(found);\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, d = int(data[0]), int(data[1])\n    a = [int(x) for x in data[2:2+n]]\n    i, j = 0, 1\n    while i < n and j < n:\n        diff = a[j] - a[i]\n        if i != j and diff == d:\n            print(1)\n            return\n        elif diff < d:\n            j += 1\n        else:\n            i += 1\n            if i == j:\n                j += 1\n    print(0)\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "6 78\n5 20 3 2 50 80", expected: "1", isHidden: false },
          { input: "2 0\n1 2", expected: "0", isHidden: false },
          { input: "3 0\n5 5 10", expected: "1", isHidden: true },
          { input: "5 4\n1 2 3 4 5", expected: "1", isHidden: true },
          { input: "4 100\n-50 0 50 100", expected: "1", isHidden: true },
          { input: "5 999999\n1 2 3 4 5", expected: "0", isHidden: true }
        ]
      },
      {
        id: "prob_sprint02_p2",
        slug: "longest-k-distinct-character-window",
        title: "Longest K-Distinct Character Window",
        difficulty: "MEDIUM",
        points: 50,
        sequence: 2,
        statement: "Given a string S consisting of lowercase English letters and an integer K, find the length of the longest substring that contains at most K distinct characters. If K is 0 or string is empty, return 0.",
        inputFormat: "The first line contains an integer K (1 <= K <= 26). The second line contains string S (1 <= |S| <= 10^5).",
        outputFormat: "Print a single integer representing the maximum substring length.",
        constraints: "1 <= K <= 26\n1 <= |S| <= 10^5\nS contains only lowercase English letters",
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    int k;\n    if (scanf(\"%d\", &k) != 1) return 0;\n    char *s = (char *)malloc(100005);\n    scanf(\"%s\", s);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(s);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int k;\n    string s;\n    if (!(cin >> k >> s)) return 0;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int k = Integer.parseInt(line.trim());\n        String s = br.readLine().trim();\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    k = int(data[0])\n    s = data[1]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    int k;\n    if (scanf(\"%d\", &k) != 1) return 0;\n    char *s = (char *)malloc(100005);\n    scanf(\"%s\", s);\n    int n = strlen(s);\n    int freq[26] = {0};\n    int distinct = 0, left = 0, max_len = 0;\n    for (int right = 0; right < n; right++) {\n        if (freq[s[right] - 'a'] == 0) distinct++;\n        freq[s[right] - 'a']++;\n        while (distinct > k) {\n            freq[s[left] - 'a']--;\n            if (freq[s[left] - 'a'] == 0) distinct--;\n            left++;\n        }\n        if (right - left + 1 > max_len) max_len = right - left + 1;\n    }\n    printf(\"%d\\n\", max_len);\n    free(s);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int k;\n    string s;\n    if (!(cin >> k >> s)) return 0;\n    vector<int> freq(26, 0);\n    int distinct = 0, left = 0, max_len = 0;\n    for (int right = 0; right < (int)s.size(); right++) {\n        if (freq[s[right] - 'a']++ == 0) distinct++;\n        while (distinct > k) {\n            if (--freq[s[left++] - 'a'] == 0) distinct--;\n        }\n        max_len = max(max_len, right - left + 1);\n    }\n    cout << max_len << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int k = Integer.parseInt(line.trim());\n        String s = br.readLine().trim();\n        int[] freq = new int[26];\n        int distinct = 0, left = 0, max_len = 0;\n        for (int right = 0; right < s.length(); right++) {\n            if (freq[s.charAt(right) - 'a']++ == 0) distinct++;\n            while (distinct > k) {\n                if (--freq[s.charAt(left++) - 'a'] == 0) distinct--;\n            }\n            max_len = Math.max(max_len, right - left + 1);\n        }\n        System.out.println(max_len);\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    k = int(data[0])\n    s = data[1]\n    freq = {}\n    left = 0\n    max_len = 0\n    for right, ch in enumerate(s):\n        freq[ch] = freq.get(ch, 0) + 1\n        while len(freq) > k:\n            freq[s[left]] -= 1\n            if freq[s[left]] == 0:\n                del freq[s[left]]\n            left += 1\n        max_len = max(max_len, right - left + 1)\n    print(max_len)\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "2\neceba", expected: "3", isHidden: false },
          { input: "1\naa", expected: "2", isHidden: false },
          { input: "3\nabaccc", expected: "6", isHidden: true },
          { input: "1\nabcde", expected: "1", isHidden: true },
          { input: "26\nabcdefghijklmnopqrstuvwxyz", expected: "26", isHidden: true },
          { input: "2\naaaaaabbbbbb", expected: "12", isHidden: true }
        ]
      },
      {
        id: "prob_sprint02_p3",
        slug: "minimum-window-subsequence",
        title: "Minimum Window Subsequence",
        difficulty: "HARD",
        points: 100,
        sequence: 3,
        statement: "Given strings S and T, find the minimum contiguous substring W of S such that T is a subsequence of W. If there is no such window in S that covers all characters in T, print -1. If there are multiple minimum-length windows, print the one that begins at the smallest starting index.",
        inputFormat: "The first line contains string S (1 <= |S| <= 2 * 10^4). The second line contains string T (1 <= |T| <= 100).",
        outputFormat: "Print the minimum window substring, or -1.",
        constraints: "1 <= |S| <= 2 * 10^4\n1 <= |T| <= 100\nS and T consist of lowercase English letters",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    char s[20005], t[105];\n    if (scanf(\"%s %s\", s, t) != 2) return 0;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s, t;\n    if (!(cin >> s >> t)) return 0;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        String t = br.readLine();\n        if (s == null || t == null) return;\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    s, t = data[0], data[1]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    char s[20005], t[105];\n    if (scanf(\"%s %s\", s, t) != 2) return 0;\n    int n = strlen(s), m = strlen(t);\n    int best_len = 1e9, start = -1;\n    int s_idx = 0, t_idx = 0;\n    while (s_idx < n) {\n        if (s[s_idx] == t[t_idx]) {\n            t_idx++;\n            if (t_idx == m) {\n                int right = s_idx;\n                int k = m - 1;\n                while (k >= 0) {\n                    if (s[s_idx] == t[k]) k--;\n                    s_idx--;\n                }\n                s_idx++;\n                if (right - s_idx + 1 < best_len) {\n                    best_len = right - s_idx + 1;\n                    start = s_idx;\n                }\n                t_idx = 0;\n            }\n        }\n        s_idx++;\n    }\n    if (start == -1) {\n        printf(\"-1\\n\");\n    } else {\n        for (int i = 0; i < best_len; i++) putchar(s[start + i]);\n        putchar('\\n');\n    }\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s, t;\n    if (!(cin >> s >> t)) return 0;\n    int n = s.size(), m = t.size();\n    int best_len = 1e9, start = -1;\n    int s_idx = 0, t_idx = 0;\n    while (s_idx < n) {\n        if (s[s_idx] == t[t_idx]) {\n            if (++t_idx == m) {\n                int right = s_idx;\n                int k = m - 1;\n                while (k >= 0) {\n                    if (s[s_idx] == t[k]) k--;\n                    s_idx--;\n                }\n                s_idx++;\n                if (right - s_idx + 1 < best_len) {\n                    best_len = right - s_idx + 1;\n                    start = s_idx;\n                }\n                t_idx = 0;\n            }\n        }\n        s_idx++;\n    }\n    if (start == -1) cout << \"-1\\n\";\n    else cout << s.substr(start, best_len) << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line1 = br.readLine();\n        String line2 = br.readLine();\n        if (line1 == null || line2 == null) return;\n        String s = line1.trim(), t = line2.trim();\n        int n = s.length(), m = t.length();\n        int best_len = Integer.MAX_VALUE, start = -1;\n        int s_idx = 0, t_idx = 0;\n        while (s_idx < n) {\n            if (s.charAt(s_idx) == t.charAt(t_idx)) {\n                if (++t_idx == m) {\n                    int right = s_idx;\n                    int k = m - 1;\n                    while (k >= 0) {\n                        if (s.charAt(s_idx) == t.charAt(k)) k--;\n                        s_idx--;\n                    }\n                    s_idx++;\n                    if (right - s_idx + 1 < best_len) {\n                        best_len = right - s_idx + 1;\n                        start = s_idx;\n                    }\n                    t_idx = 0;\n                }\n            }\n            s_idx++;\n        }\n        if (start == -1) System.out.println(\"-1\");\n        else System.out.println(s.substring(start, start + best_len));\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    s, t = data[0], data[1]\n    n, m = len(s), len(t)\n    best_len = float('inf')\n    start = -1\n    s_idx = 0\n    t_idx = 0\n    while s_idx < n:\n        if s[s_idx] == t[t_idx]:\n            t_idx += 1\n            if t_idx == m:\n                right = s_idx\n                k = m - 1\n                while k >= 0:\n                    if s[s_idx] == t[k]:\n                        k -= 1\n                    s_idx -= 1\n                s_idx += 1\n                if right - s_idx + 1 < best_len:\n                    best_len = right - s_idx + 1\n                    start = s_idx\n                t_idx = 0\n        s_idx += 1\n    if start == -1:\n        print(\"-1\")\n    else:\n        print(s[start:start+best_len])\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "abcdebdde bde", expected: "bcde", isHidden: false },
          { input: "jmeqforej f", expected: "f", isHidden: false },
          { input: "cnhczmccqouqadqtmjjzl z", expected: "z", isHidden: true },
          { input: "abc xyz", expected: "-1", isHidden: true },
          { input: "fgrqsqsnodwmxzkz zkz", expected: "zkz", isHidden: true },
          { input: "aaaaaaaaaa aaa", expected: "aaa", isHidden: true }
        ]
      }
    ]
  },
  {
    id: "contest_weekend_duel_03",
    slug: "algorithm-arena-weekend-duel-03",
    title: "Algorithm Arena: Weekend Duel #03",
    type: "CHALLENGE",
    difficulty: "Hard",
    status: "SCHEDULED",
    startsAt: "2026-09-26T14:00:00Z",
    endsAt: "2026-09-26T16:00:00Z",
    durationMin: 120,
    bannerUrl: "https://assets.byteverse.dev/contests/duel-03.png",
    description: "High-octane collegiate duel testing Monotonic Stacks, custom comparator geometry, and trapped rainwater topology.",
    problems: [
      {
        id: "prob_duel03_p1",
        slug: "stock-span-trading-days",
        title: "Stock Span Trading Days",
        difficulty: "MEDIUM",
        points: 25,
        sequence: 1,
        statement: "Given an array of daily stock prices of size N, calculate the span of stock's price for all N days. The span of the stock's price on a given day i is defined as the maximum number of consecutive days up to day i (including day i itself) where the price was less than or equal to the price on day i.",
        inputFormat: "First line contains an integer N (1 <= N <= 10^5). Second line contains N integers prices[0], ..., prices[N-1].",
        outputFormat: "Print N space-separated integers representing the stock span for each day.",
        constraints: "1 <= N <= 10^5\n1 <= prices[i] <= 10^9",
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *prices = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &prices[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(prices);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> prices(n);\n    for (int i = 0; i < n; i++) cin >> prices[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] prices = new long[n];\n        for (int i = 0; i < n; i++) prices[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    prices = [int(x) for x in data[1:1+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *prices = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &prices[i]);\n    int *stack = (int *)malloc(sizeof(int) * n);\n    int top = -1;\n    for (int i = 0; i < n; i++) {\n        while (top >= 0 && prices[stack[top]] <= prices[i]) top--;\n        int span = (top == -1) ? (i + 1) : (i - stack[top]);\n        printf(\"%d%c\", span, (i == n - 1) ? '\\n' : ' ');\n        stack[++top] = i;\n    }\n    free(prices);\n    free(stack);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\n#include <stack>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> prices(n);\n    for (int i = 0; i < n; i++) cin >> prices[i];\n    stack<int> s;\n    for (int i = 0; i < n; i++) {\n        while (!s.empty() && prices[s.top()] <= prices[i]) s.pop();\n        int span = s.empty() ? (i + 1) : (i - s.top());\n        cout << span << (i == n - 1 ? \"\" : \" \");\n        s.push(i);\n    }\n    cout << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] prices = new long[n];\n        for (int i = 0; i < n; i++) prices[i] = Long.parseLong(st.nextToken());\n        int[] stack = new int[n];\n        int top = -1;\n        StringBuilder sb = new StringBuilder();\n        for (int i = 0; i < n; i++) {\n            while (top >= 0 && prices[stack[top]] <= prices[i]) top--;\n            int span = (top == -1) ? (i + 1) : (i - stack[top]);\n            sb.append(span).append(i == n - 1 ? \"\" : \" \");\n            stack[++top] = i;\n        }\n        System.out.println(sb.toString());\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    prices = [int(x) for x in data[1:1+n]]\n    stack = []\n    spans = []\n    for i, p in enumerate(prices):\n        while stack and prices[stack[-1]] <= p:\n            stack.pop()\n        spans.append(str(i + 1 if not stack else i - stack[-1]))\n        stack.append(i)\n    print(\" \".join(spans))\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "7\n100 80 60 70 60 75 85", expected: "1 1 1 2 1 4 6", isHidden: false },
          { input: "4\n10 10 10 10", expected: "1 2 3 4", isHidden: false },
          { input: "1\n50", expected: "1", isHidden: true },
          { input: "5\n10 20 30 40 50", expected: "1 2 3 4 5", isHidden: true },
          { input: "5\n50 40 30 20 10", expected: "1 1 1 1 1", isHidden: true },
          { input: "6\n31 27 14 21 30 22", expected: "1 1 1 2 4 1", isHidden: true }
        ]
      },
      {
        id: "prob_duel03_p2",
        slug: "largest-number-concatenation",
        title: "Largest Number Concatenation",
        difficulty: "MEDIUM",
        points: 50,
        sequence: 2,
        statement: "Given a list of non-negative integers, arrange them such that they form the largest number possible. Since the result may be very large, you need to output the result as a string. If the result consists of all zeros, return '0'.",
        inputFormat: "First line contains N (1 <= N <= 10^5). Second line contains N non-negative integers A[i].",
        outputFormat: "Print the largest concatenated number string.",
        constraints: "1 <= N <= 10^5\n0 <= A[i] <= 10^9",
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    char **nums = (char **)malloc(sizeof(char *) * n);\n    for (int i = 0; i < n; i++) {\n        nums[i] = (char *)malloc(32);\n        scanf(\"%s\", nums[i]);\n    }\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<string> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        String[] a = new String[n];\n        for (int i = 0; i < n; i++) a[i] = st.nextToken();\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = data[1:1+n]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\nint cmp(const void *a, const void *b) {\n    char *s1 = *(char **)a;\n    char *s2 = *(char **)b;\n    char ab[64], ba[64];\n    sprintf(ab, \"%s%s\", s1, s2);\n    sprintf(ba, \"%s%s\", s2, s1);\n    return strcmp(ba, ab);\n}\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    char **nums = (char **)malloc(sizeof(char *) * n);\n    for (int i = 0; i < n; i++) {\n        nums[i] = (char *)malloc(32);\n        scanf(\"%s\", nums[i]);\n    }\n    qsort(nums, n, sizeof(char *), cmp);\n    if (strcmp(nums[0], \"0\") == 0) {\n        printf(\"0\\n\");\n        return 0;\n    }\n    for (int i = 0; i < n; i++) printf(\"%s\", nums[i]);\n    printf(\"\\n\");\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<string> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    sort(a.begin(), a.end(), [](const string &x, const string &y) {\n        return x + y > y + x;\n    });\n    if (a[0] == \"0\") {\n        cout << \"0\\n\";\n        return 0;\n    }\n    for (const string &s : a) cout << s;\n    cout << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        String[] a = new String[n];\n        for (int i = 0; i < n; i++) a[i] = st.nextToken();\n        Arrays.sort(a, (x, y) -> (y + x).compareTo(x + y));\n        if (a[0].equals(\"0\")) {\n            System.out.println(\"0\");\n            return;\n        }\n        StringBuilder sb = new StringBuilder();\n        for (String s : a) sb.append(s);\n        System.out.println(sb.toString());\n    }\n}",
          python: "import sys\nfrom functools import cmp_to_key\n\ndef cmp(x, y):\n    if x + y > y + x:\n        return -1\n    elif x + y < y + x:\n        return 1\n    return 0\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = data[1:1+n]\n    nums.sort(key=cmp_to_key(cmp))\n    if nums[0] == '0':\n        print('0')\n    else:\n        print(''.join(nums))\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "5\n10 2 9 39 17", expected: "93921710", isHidden: false },
          { input: "2\n3 30", expected: "330", isHidden: false },
          { input: "4\n0 0 0 0", expected: "0", isHidden: true },
          { input: "1\n999", expected: "999", isHidden: true },
          { input: "3\n8308 8308 830", expected: "83088308830", isHidden: true },
          { input: "5\n34 3 30 300 3000", expected: "343303003000", isHidden: true }
        ]
      },
      {
        id: "prob_duel03_p3",
        slug: "trapped-rainwater-matrix-skyline",
        title: "Trapped Rainwater Matrix Skyline",
        difficulty: "HARD",
        points: 100,
        sequence: 3,
        statement: "Given N non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        inputFormat: "First line contains an integer N (1 <= N <= 10^5). Second line contains N non-negative integers height[i].",
        outputFormat: "Print the total volume of trapped rainwater.",
        constraints: "1 <= N <= 10^5\n0 <= height[i] <= 10^5",
        timeLimitMs: 2000,
        memoryLimitMb: 256,
        starterCodes: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *h = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &h[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(h);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> h(n);\n    for (int i = 0; i < n; i++) cin >> h[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] h = new long[n];\n        for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    h = [int(x) for x in data[1:1+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
        },
        referenceSolutions: {
          c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *h = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &h[i]);\n    int left = 0, right = n - 1;\n    long long max_l = 0, max_r = 0, water = 0;\n    while (left <= right) {\n        if (h[left] <= h[right]) {\n            if (h[left] >= max_l) max_l = h[left];\n            else water += (max_l - h[left]);\n            left++;\n        } else {\n            if (h[right] >= max_r) max_r = h[right];\n            else water += (max_r - h[right]);\n            right--;\n        }\n    }\n    printf(\"%lld\\n\", water);\n    free(h);\n    return 0;\n}",
          cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> h(n);\n    for (int i = 0; i < n; i++) cin >> h[i];\n    int left = 0, right = n - 1;\n    long long max_l = 0, max_r = 0, water = 0;\n    while (left <= right) {\n        if (h[left] <= h[right]) {\n            if (h[left] >= max_l) max_l = h[left];\n            else water += max_l - h[left];\n            left++;\n        } else {\n            if (h[right] >= max_r) max_r = h[right];\n            else water += max_r - h[right];\n            right--;\n        }\n    }\n    cout << water << \"\\n\";\n    return 0;\n}",
          java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] h = new long[n];\n        for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());\n        int left = 0, right = n - 1;\n        long max_l = 0, max_r = 0, water = 0;\n        while (left <= right) {\n            if (h[left] <= h[right]) {\n                if (h[left] >= max_l) max_l = h[left];\n                else water += (max_l - h[left]);\n                left++;\n            } else {\n                if (h[right] >= max_r) max_r = h[right];\n                else water += (max_r - h[right]);\n                right--;\n            }\n        }\n        System.out.println(water);\n    }\n}",
          python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    h = [int(x) for x in data[1:1+n]]\n    left, right = 0, n - 1\n    max_l, max_r = 0, 0\n    water = 0\n    while left <= right:\n        if h[left] <= h[right]:\n            if h[left] >= max_l:\n                max_l = h[left]\n            else:\n                water += max_l - h[left]\n            left += 1\n        else:\n            if h[right] >= max_r:\n                max_r = h[right]\n            else:\n                water += max_r - h[right]\n            right -= 1\n    print(water)\n\nif __name__ == '__main__':\n    main()"
        },
        testCases: [
          { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expected: "6", isHidden: false },
          { input: "6\n4 2 0 3 2 5", expected: "9", isHidden: false },
          { input: "1\n5", expected: "0", isHidden: true },
          { input: "2\n2 3", expected: "0", isHidden: true },
          { input: "5\n5 4 3 2 1", expected: "0", isHidden: true },
          { input: "7\n3 0 0 2 0 4 0", expected: "10", isHidden: true }
        ]
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. LEETCODE / UDEMY STYLE PRACTICE REPOSITORY (8 Specific Problems)
// ─────────────────────────────────────────────────────────────────────────────
const practiceProblems = [
  {
    id: "practice_two_sum",
    slug: "two-sum-target-pair-finder",
    title: "Two Sum - Target Pair Finder",
    difficulty: "EASY",
    acceptanceRate: "54.2%",
    category: "Arrays",
    tags: ["Arrays", "Hash Map", "Two Pointers"],
    description: {
      context: "Given an array of integers nums and an integer target, find the two distinct 0-based indices i and j such that nums[i] + nums[j] == target. You may assume that each input has exactly one valid solution, and you may not use the same element twice. Output the indices in ascending order separated by a space.",
      examples: [
        {
          input: "4 9\n2 7 11 15",
          output: "0 1",
          explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return indices 0 and 1."
        },
        {
          input: "3 6\n3 2 4",
          output: "1 2",
          explanation: "Because nums[1] + nums[2] == 2 + 4 == 6, we return indices 1 and 2."
        }
      ],
      constraints: [
        "2 <= nums.length <= 10^5",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Exactly one valid answer exists."
      ],
      hints: [
        "Hint 1: A brute force O(N^2) search tests every pair. Can we do better using auxiliary storage?",
        "Hint 2: For each element x, the required complement is target - x. What data structure gives O(1) average lookup?"
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    long long target;\n    if (scanf(\"%d %lld\", &n, &target) != 2) return 0;\n    long long *nums = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &nums[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(nums);\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    long long target;\n    if (!(cin >> n >> target)) return 0;\n    vector<long long> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int n = Integer.parseInt(st.nextToken());\n        long target = Long.parseLong(st.nextToken());\n        st = new StringTokenizer(br.readLine());\n        long[] nums = new long[n];\n        for (int i = 0; i < n; i++) nums[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n, target = int(data[0]), int(data[1])\n    nums = [int(x) for x in data[2:2+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "4 9\n2 7 11 15", expected: "0 1", isHidden: false },
      { input: "3 6\n3 2 4", expected: "1 2", isHidden: false },
      { input: "2 6\n3 3", expected: "0 1", isHidden: true },
      { input: "5 0\n-3 4 3 90 -90", expected: "0 2", isHidden: true },
      { input: "4 -8\n-1 -7 5 3", expected: "0 1", isHidden: true },
      { input: "5 100\n10 20 30 70 80", expected: "2 3", isHidden: true }
    ]
  },
  {
    id: "practice_valid_palindrome_deletion",
    slug: "valid-palindrome-with-deletion",
    title: "Valid Palindrome with Deletion",
    difficulty: "EASY",
    acceptanceRate: "61.8%",
    category: "Strings",
    tags: ["Strings", "Two Pointers", "Recursion"],
    description: {
      context: "Given a string s of lowercase letters, return 1 if the string can be a palindrome after deleting at most one character from it, otherwise return 0.",
      examples: [
        {
          input: "aba",
          output: "1",
          explanation: "String 'aba' is already a palindrome without removing any characters."
        },
        {
          input: "abca",
          output: "1",
          explanation: "You could delete the character 'c' to get 'aba', which is a valid palindrome."
        },
        {
          input: "abc",
          output: "0",
          explanation: "Deleting any single character leaves a two-letter string that is not a palindrome."
        }
      ],
      constraints: [
        "1 <= s.length <= 10^5",
        "s consists solely of lowercase English letters."
      ],
      hints: [
        "Hint 1: Use two pointers at both ends moving inwards.",
        "Hint 2: When a mismatch occurs (s[left] != s[right]), check if either skipping s[left] or skipping s[right] yields a palindrome."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) return 0;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    if (!(cin >> s)) return 0;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) return;\n        s = s.trim();\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    s = data[0]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "aba", expected: "1", isHidden: false },
      { input: "abca", expected: "1", isHidden: false },
      { input: "abc", expected: "0", isHidden: true },
      { input: "deeee", expected: "1", isHidden: true },
      { input: "raceecar", expected: "1", isHidden: true },
      { input: "abcdefba", expected: "0", isHidden: true }
    ]
  },
  {
    id: "practice_max_subarray_kadane",
    slug: "maximum-subarray-signal-kadane",
    title: "Maximum Subarray Signal (Kadane)",
    difficulty: "MEDIUM",
    acceptanceRate: "48.6%",
    category: "Dynamic Programming",
    tags: ["Dynamic Programming", "Arrays", "Divide and Conquer"],
    description: {
      context: "Given an integer array nums of size N, find the subarray with the largest sum, and print its sum. A subarray is a contiguous non-empty sequence of elements within an array.",
      examples: [
        {
          input: "9\n-2 1 -3 4 -1 2 1 -5 4",
          output: "6",
          explanation: "The contiguous subarray [4, -1, 2, 1] has the largest sum = 6."
        },
        {
          input: "1\n1",
          output: "1",
          explanation: "The only subarray [1] has sum 1."
        }
      ],
      constraints: [
        "1 <= N <= 10^5",
        "-10^4 <= nums[i] <= 10^4"
      ],
      hints: [
        "Hint 1: Kadane's Algorithm maintains current_max = max(nums[i], current_max + nums[i]).",
        "Hint 2: If the running sum falls below the current element itself, reset your starting pointer to current element."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *a = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(a);\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    a = [int(x) for x in data[1:1+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected: "6", isHidden: false },
      { input: "1\n1", expected: "1", isHidden: false },
      { input: "5\n5 4 -1 7 8", expected: "23", isHidden: true },
      { input: "4\n-10 -20 -30 -4", expected: "-4", isHidden: true },
      { input: "6\n-2 -3 4 -1 -2 1", expected: "4", isHidden: true },
      { input: "8\n-1 2 3 -4 5 1 -2 4", expected: "9", isHidden: true }
    ]
  },
  {
    id: "practice_longest_substring_no_repeats",
    slug: "longest-substring-without-repeats",
    title: "Longest Substring Without Repeats",
    difficulty: "MEDIUM",
    acceptanceRate: "34.7%",
    category: "Sliding Window",
    tags: ["Sliding Window", "Hash Set", "Strings"],
    description: {
      context: "Given a string s, find the length of the longest substring without repeating characters.",
      examples: [
        {
          input: "abcabcbb",
          output: "3",
          explanation: "The answer is 'abc', with the length of 3."
        },
        {
          input: "bbbbb",
          output: "1",
          explanation: "The answer is 'b', with the length of 1."
        },
        {
          input: "pwwkew",
          output: "3",
          explanation: "The answer is 'wke', with length 3. Note that 'pwke' is a subsequence and not a substring."
        }
      ],
      constraints: [
        "0 <= s.length <= 10^5",
        "s consists of English letters, digits, symbols and spaces."
      ],
      hints: [
        "Hint 1: Use a sliding window with two pointers [left, right].",
        "Hint 2: Keep track of the last seen index of every character to skip redundant comparisons in O(1) step."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[100005];\n    if (scanf(\"%s\", s) != 1) {\n        printf(\"0\\n\");\n        return 0;\n    }\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    string s;\n    if (!(cin >> s)) {\n        cout << 0 << \"\\n\";\n        return 0;\n    }\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String s = br.readLine();\n        if (s == null) {\n            System.out.println(0);\n            return;\n        }\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    line = sys.stdin.readline()\n    if not line:\n        print(0)\n        return\n    s = line.rstrip('\\r\\n')\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "abcabcbb", expected: "3", isHidden: false },
      { input: "bbbbb", expected: "1", isHidden: false },
      { input: "pwwkew", expected: "3", isHidden: true },
      { input: "abcdefgh", expected: "8", isHidden: true },
      { input: "a", expected: "1", isHidden: true },
      { input: "tmmzuxt", expected: "5", isHidden: true }
    ]
  },
  {
    id: "practice_container_most_water",
    slug: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "MEDIUM",
    acceptanceRate: "55.1%",
    category: "Two Pointers",
    tags: ["Two Pointers", "Greedy", "Arrays"],
    description: {
      context: "You are given an integer array height of length N. There are N vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.",
      examples: [
        {
          input: "9\n1 8 6 2 5 4 8 3 7",
          output: "49",
          explanation: "The vertical lines are [1,8,6,2,5,4,8,3,7]. The max area is between index 1 and 8: min(8, 7) * (8 - 1) = 49."
        },
        {
          input: "2\n1 1",
          output: "1",
          explanation: "Area between index 0 and 1 is min(1, 1) * (1 - 0) = 1."
        }
      ],
      constraints: [
        "2 <= N <= 10^5",
        "0 <= height[i] <= 10^4"
      ],
      hints: [
        "Hint 1: Start with the widest container using pointers at left = 0 and right = N - 1.",
        "Hint 2: Since the width shrinks with each step, the only chance to find a larger area is by moving the pointer with the smaller height."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    long long *h = (long long *)malloc(sizeof(long long) * n);\n    for (int i = 0; i < n; i++) scanf(\"%lld\", &h[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(h);\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<long long> h(n);\n    for (int i = 0; i < n; i++) cin >> h[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        long[] h = new long[n];\n        for (int i = 0; i < n; i++) h[i] = Long.parseLong(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    h = [int(x) for x in data[1:1+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "9\n1 8 6 2 5 4 8 3 7", expected: "49", isHidden: false },
      { input: "2\n1 1", expected: "1", isHidden: false },
      { input: "4\n4 3 2 14", expected: "12", isHidden: true },
      { input: "5\n1 2 1 2 1", expected: "4", isHidden: true },
      { input: "3\n5 5 5", expected: "10", isHidden: true },
      { input: "6\n2 3 10 5 7 8", expected: "24", isHidden: true }
    ]
  },
  {
    id: "practice_next_greater_element",
    slug: "next-greater-element-daily-temps",
    title: "Next Greater Element / Daily Temps",
    difficulty: "MEDIUM",
    acceptanceRate: "67.3%",
    category: "Monotonic Stack",
    tags: ["Monotonic Stack", "Arrays", "Stack"],
    description: {
      context: "Given an array of temperatures of length N, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0.",
      examples: [
        {
          input: "8\n73 74 75 71 69 72 76 73",
          output: "1 1 4 2 1 1 0 0",
          explanation: "Day 0 has temp 73; warmer temp 74 is on day 1 (1 day wait). Day 2 has temp 75; warmer temp 76 is on day 6 (4 days wait)."
        },
        {
          input: "4\n30 40 50 60",
          output: "1 1 1 0",
          explanation: "Each day is strictly warmer than the previous, except the last day which has no future days."
        }
      ],
      constraints: [
        "1 <= N <= 10^5",
        "30 <= temperatures[i] <= 100"
      ],
      hints: [
        "Hint 1: Iterate through the temperatures while keeping a monotonic decreasing stack of indices.",
        "Hint 2: Whenever the current temperature is warmer than the top of the stack, pop the index and record the day difference."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    int *t = (int *)malloc(sizeof(int) * n);\n    for (int i = 0; i < n; i++) scanf(\"%d\", &t[i]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(t);\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> t(n);\n    for (int i = 0; i < n; i++) cin >> t[i];\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        StringTokenizer st = new StringTokenizer(br.readLine());\n        int[] t = new int[n];\n        for (int i = 0; i < n; i++) t[i] = Integer.parseInt(st.nextToken());\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    t = [int(x) for x in data[1:1+n]]\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "8\n73 74 75 71 69 72 76 73", expected: "1 1 4 2 1 1 0 0", isHidden: false },
      { input: "4\n30 40 50 60", expected: "1 1 1 0", isHidden: false },
      { input: "3\n30 60 90", expected: "1 1 0", isHidden: true },
      { input: "5\n90 80 70 60 50", expected: "0 0 0 0 0", isHidden: true },
      { input: "1\n50", expected: "0", isHidden: true },
      { input: "6\n70 70 70 70 70 80", expected: "5 4 3 2 1 0", isHidden: true }
    ]
  },
  {
    id: "practice_merge_intervals",
    slug: "merge-overlapping-intervals",
    title: "Merge Overlapping Intervals",
    difficulty: "MEDIUM",
    acceptanceRate: "47.9%",
    category: "Sorting",
    tags: ["Sorting", "Arrays", "Intervals"],
    description: {
      context: "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return the non-overlapping intervals that cover all the intervals in the input. First print M, the number of merged intervals, followed by M lines containing the merged intervals.",
      examples: [
        {
          input: "4\n1 3\n2 6\n8 10\n15 18",
          output: "3\n1 6\n8 10\n15 18",
          explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
        },
        {
          input: "2\n1 4\n4 5",
          output: "1\n1 5",
          explanation: "Intervals [1,4] and [4,5] are considered overlapping because they share point 4."
        }
      ],
      constraints: [
        "1 <= intervals.length <= 10^5",
        "intervals[i].length == 2",
        "0 <= start_i <= end_i <= 10^5"
      ],
      hints: [
        "Hint 1: Sorting intervals by their start time is the key pre-requisite.",
        "Hint 2: Once sorted, compare current interval's start with previous interval's end."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\n\ntypedef struct { int s, e; } Interval;\n\nint main() {\n    int n;\n    if (scanf(\"%d\", &n) != 1) return 0;\n    Interval *arr = (Interval *)malloc(sizeof(Interval) * n);\n    for (int i = 0; i < n; i++) scanf(\"%d %d\", &arr[i].s, &arr[i].e);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(arr);\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<pair<int, int>> intervals(n);\n    for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        int n = Integer.parseInt(line.trim());\n        int[][] intervals = new int[n][2];\n        for (int i = 0; i < n; i++) {\n            StringTokenizer st = new StringTokenizer(br.readLine());\n            intervals[i][0] = Integer.parseInt(st.nextToken());\n            intervals[i][1] = Integer.parseInt(st.nextToken());\n        }\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    intervals = []\n    for i in range(n):\n        intervals.append([int(data[1 + 2*i]), int(data[2 + 2*i])])\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "4\n1 3\n2 6\n8 10\n15 18", expected: "3\n1 6\n8 10\n15 18", isHidden: false },
      { input: "2\n1 4\n4 5", expected: "1\n1 5", isHidden: false },
      { input: "1\n5 10", expected: "1\n5 10", isHidden: true },
      { input: "3\n1 10\n2 3\n4 8", expected: "1\n1 10", isHidden: true },
      { input: "3\n1 4\n0 4\n2 5", expected: "1\n0 5", isHidden: true },
      { input: "3\n1 2\n3 4\n5 6", expected: "3\n1 2\n3 4\n5 6", isHidden: true }
    ]
  },
  {
    id: "practice_course_prerequisite_scheduler",
    slug: "course-prerequisite-scheduler",
    title: "Course Prerequisite Scheduler",
    difficulty: "HARD",
    acceptanceRate: "32.1%",
    category: "Graphs",
    tags: ["Graphs", "Topological Sort", "DFS/BFS"],
    description: {
      context: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [a_i, b_i] indicates that you must take course b_i first if you want to take course a_i. Return 1 if you can finish all courses, otherwise return 0.",
      examples: [
        {
          input: "2 1\n1 0",
          output: "1",
          explanation: "There are 2 courses to take. To take course 1 you should have finished course 0. So it is possible."
        },
        {
          input: "2 2\n1 0\n0 1",
          output: "0",
          explanation: "There are 2 courses to take. To take course 1 you need 0, and to take 0 you need 1. This creates a circular dependency, so it is impossible."
        }
      ],
      constraints: [
        "1 <= numCourses <= 2000",
        "0 <= prerequisites.length <= 5000",
        "prerequisites[i].length == 2",
        "0 <= a_i, b_i < numCourses",
        "All pairs [a_i, b_i] are distinct."
      ],
      hints: [
        "Hint 1: This problem is equivalent to finding if a cycle exists in a directed graph.",
        "Hint 2: Use Kahn's algorithm (BFS with in-degree tracking) or 3-color DFS to detect directed cycles."
      ]
    },
    starterCodes: {
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int numCourses, m;\n    if (scanf(\"%d %d\", &numCourses, &m) != 2) return 0;\n    // Read m prerequisite edges [a, b] meaning b -> a\n    int (*edges)[2] = malloc(sizeof(int[2]) * m);\n    for (int i = 0; i < m; i++) scanf(\"%d %d\", &edges[i][0], &edges[i][1]);\n\n    // WRITE YOUR LOGIC HERE\n\n    free(edges);\n    return 0;\n}",
      cpp: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    int numCourses, m;\n    if (!(cin >> numCourses >> m)) return 0;\n    vector<pair<int, int>> prereqs(m);\n    for (int i = 0; i < m; i++) cin >> prereqs[i].first >> prereqs[i].second;\n\n    // WRITE YOUR LOGIC HERE\n\n    return 0;\n}",
      java: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line == null) return;\n        StringTokenizer st = new StringTokenizer(line);\n        int numCourses = Integer.parseInt(st.nextToken());\n        int m = Integer.parseInt(st.nextToken());\n        int[][] prereqs = new int[m][2];\n        for (int i = 0; i < m; i++) {\n            st = new StringTokenizer(br.readLine());\n            prereqs[i][0] = Integer.parseInt(st.nextToken());\n            prereqs[i][1] = Integer.parseInt(st.nextToken());\n        }\n\n        // WRITE YOUR LOGIC HERE\n    }\n}",
      python: "import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    numCourses, m = int(data[0]), int(data[1])\n    prereqs = []\n    for i in range(m):\n        prereqs.append([int(data[2 + 2*i]), int(data[3 + 2*i])])\n\n    # WRITE YOUR LOGIC HERE\n\nif __name__ == '__main__':\n    main()"
    },
    testCases: [
      { input: "2 1\n1 0", expected: "1", isHidden: false },
      { input: "2 2\n1 0\n0 1", expected: "0", isHidden: false },
      { input: "3 2\n1 0\n2 1", expected: "1", isHidden: true },
      { input: "4 4\n1 0\n2 1\n3 2\n0 3", expected: "0", isHidden: true },
      { input: "3 0", expected: "1", isHidden: true },
      { input: "5 4\n1 0\n2 0\n3 1\n4 2", expected: "1", isHidden: true }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. IN-EDITOR AI ASSISTANT SPECIFICATION
// ─────────────────────────────────────────────────────────────────────────────
const aiAssistantConfig = {
  assistantConfig: {
    name: "ByteVerse Socratic AI",
    avatar: "https://assets.byteverse.dev/ai/bot-avatar.png",
    systemPrompt: "You are the ByteVerse In-IDE Socratic Mentor. Your job is to guide engineering students to solve algorithmic challenges independently without spoon-feeding solutions.\n\nRULES:\n1. NEVER output complete, copy-pasteable solution code in any language.\n2. If the user shares buggy code, pinpoint the conceptual error (e.g., 'Check index out of bounds on line 12' or 'Notice what happens when the array contains all negative numbers') without rewriting their entire script.\n3. If asked 'How do I solve this?', explain the high-level pattern (e.g., Sliding Window, Prefix Sum, Frequency Map) and provide pseudo-steps.\n4. When analyzing Time/Space complexity, guide them through calculating Big-O from their loop constructs.\n5. Keep all explanations concise, professional, encouraging, and under 150 words.",
    capabilities: [
      { trigger: "EXPLAIN_PROBLEM", label: "Explain Problem in Simple Terms" },
      { trigger: "GET_HINT", label: "Get a Step-by-Step Hint" },
      { trigger: "DEBUG_CODE", label: "Spot Bugs in My Code" },
      { trigger: "ANALYZE_COMPLEXITY", label: "Evaluate My Big-O Complexity" }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Combined Master Output Payload
// ─────────────────────────────────────────────────────────────────────────────
const masterPayload = {
  events,
  contests,
  practiceProblems,
  aiAssistantConfig
};

// Write out to prisma/seed-data.json
const outPath = path.resolve(__dirname, "..", "prisma", "seed-data.json");
fs.writeFileSync(outPath, JSON.stringify(masterPayload, null, 2), "utf-8");

console.log("Master seed payload successfully created at:", outPath);
console.log("Payload Stats:");
console.log("- Active Events:", events.activeEvents.length);
console.log("- Past Events:", events.pastEvents.length);
console.log("- Contests:", contests.length);
console.log("- Total Contest Problems:", contests.reduce((acc, c) => acc + c.problems.length, 0));
console.log("- Practice Problems:", practiceProblems.length);
console.log("- AI Assistant triggers:", aiAssistantConfig.assistantConfig.capabilities.length);
