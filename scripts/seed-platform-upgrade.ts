import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function seedPlatformUpgrade() {
  console.log("Seeding Platform Upgrade data...");

  // 1. Seed the Two Admin Accounts requested by the user
  const adminHash = await bcrypt.hash("admin2026", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@byteverse.dev" },
    update: { passwordHash: adminHash, role: "ADMIN" },
    create: {
      email: "admin@byteverse.dev",
      name: "ByteVerse Admin",
      college: "NSDC Technical University",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log("Seeded Admin:", admin.email);

  const superAdminHash = await bcrypt.hash("superadmin2026", 12);
  const superAdmin = await db.user.upsert({
    where: { email: "superadmin@byteverse.dev" },
    update: { passwordHash: superAdminHash, role: "SUPER_ADMIN" },
    create: {
      email: "superadmin@byteverse.dev",
      name: "Chief Administrator",
      college: "NSDC ByteVerse Board",
      passwordHash: superAdminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Seeded Main Super Admin:", superAdmin.email);

  // 2. Seed Events (Ongoing and Past)
  const eventId = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";
  const mainEvent = await db.event.upsert({
    where: { id: eventId },
    update: {
      venue: "Main Auditorium & Lab Complex",
      category: "College Championship",
      isActive: true,
      startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // started 2 hrs ago
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),  // ends tomorrow
    },
    create: {
      id: eventId,
      name: "ByteVerse 2026",
      description: "The Flagship Collegiate Technical Championship featuring 5 rounds of competitive coding, AI optimization, and live speed battles.",
      venue: "Main Auditorium & Lab Complex",
      category: "College Championship",
      isActive: true,
      registrationOpen: true,
      teamRegistrationOpen: true,
      startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const hackathonEvent = await db.event.upsert({
    where: { id: "future-forge-2026" },
    update: {
      venue: "Innovation Wing · Labs 4 & 5",
      category: "Hackathon",
      isActive: true,
    },
    create: {
      id: "future-forge-2026",
      name: "Future Forge: AI Hackathon 2026",
      description: "A 36-hour rapid prototyping sprint where student developers build next-gen AI applications, agents, and real-time utilities.",
      venue: "Innovation Wing · Labs 4 & 5",
      category: "Hackathon",
      isActive: true,
      registrationOpen: true,
      teamRegistrationOpen: true,
      startsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const pastEvent = await db.event.upsert({
    where: { id: "winter-prelude-2025" },
    update: {
      venue: "Virtual Arena",
      category: "Showcase",
      isActive: false,
    },
    create: {
      id: "winter-prelude-2025",
      name: "ByteVerse Winter Prelude 2025",
      description: "Pre-season exhibition tournament introducing participants to algorithmic efficiency and time-pressured debugging.",
      venue: "Virtual Arena",
      category: "Showcase",
      isActive: false,
      registrationOpen: false,
      teamRegistrationOpen: false,
      startsAt: new Date("2025-12-15T10:00:00Z"),
      endsAt: new Date("2025-12-15T16:00:00Z"),
    },
  });
  console.log("Seeded Events.");

  // 3. Seed Contests (Active, Weekly, Past)
  const activeContest = await db.contest.upsert({
    where: { id: "weekly-contest-101" },
    update: {
      status: "ACTIVE",
      startsAt: new Date(Date.now()),
      endsAt: new Date(Date.now() + 90 * 60 * 1000), // 90 mins remaining
    },
    create: {
      id: "weekly-contest-101",
      title: "Weekly Contest 101: Algorithmic Ascent",
      description: "Four challenging competitive programming problems covering arrays, two-pointers, binary search, and dynamic programming.",
      type: "WEEKLY",
      status: "ACTIVE",
      difficulty: "Medium",
      startsAt: new Date(Date.now()),
      endsAt: new Date(Date.now() + 90 * 60 * 1000),
      eventId: mainEvent.id,
    },
  });

  const upcomingContest = await db.contest.upsert({
    where: { id: "biweekly-contest-45" },
    update: {
      status: "SCHEDULED",
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    },
    create: {
      id: "biweekly-contest-45",
      title: "Biweekly Contest 45: Speed & Strategy",
      description: "A fast-paced 90-minute competition focused on mathematical logic and graph theory.",
      type: "BIWEEKLY",
      status: "SCHEDULED",
      difficulty: "Hard",
      startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      eventId: mainEvent.id,
    },
  });

  const pastContest = await db.contest.upsert({
    where: { id: "weekly-contest-100" },
    update: {
      status: "ENDED",
    },
    create: {
      id: "weekly-contest-100",
      title: "Centennial Cup: Weekly Contest 100",
      description: "Our historic 100th community contest with 500+ participants competing for leaderboard dominance.",
      type: "WEEKLY",
      status: "ENDED",
      difficulty: "Medium",
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      eventId: mainEvent.id,
    },
  });
  console.log("Seeded Contests.");

  // 4. Seed Contest Participants for Active & Past Contests
  const users = await db.user.findMany({ take: 10, select: { id: true, name: true } });
  if (users.length > 0) {
    for (let i = 0; i < Math.min(users.length, 5); i++) {
      await db.contestParticipant.upsert({
        where: { contestId_userId: { contestId: activeContest.id, userId: users[i].id } },
        update: { score: (5 - i) * 100 + 50, rank: i + 1 },
        create: {
          contestId: activeContest.id,
          userId: users[i].id,
          score: (5 - i) * 100 + 50,
          rank: i + 1,
        },
      });
      await db.contestParticipant.upsert({
        where: { contestId_userId: { contestId: pastContest.id, userId: users[i].id } },
        update: { score: (5 - i) * 100, rank: i + 1 },
        create: {
          contestId: pastContest.id,
          userId: users[i].id,
          score: (5 - i) * 100,
          rank: i + 1,
        },
      });
    }
  }

  // 5. Seed Classical Practice Problems
  const practiceProblems = [
    {
      id: "practice-two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      tags: ["Arrays", "Hash Table"],
      statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
      inputFormat: "First line contains integer N (size of array). Second line contains N space-separated integers. Third line contains integer target.",
      outputFormat: "Print the two 0-based indices separated by a space.",
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
      sampleInput: "4\n2 7 11 15\n9",
      sampleOutput: "0 1",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target;\n    cin >> target;\n    \n    unordered_map<int, int> seen;\n    for (int i = 0; i < n; i++) {\n        int complement = target - nums[i];\n        if (seen.find(complement) != seen.end()) {\n            cout << seen[complement] << " " << i << endl;\n            return 0;\n        }\n        seen[nums[i]] = i;\n    }\n    return 0;\n}`,
        c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != 1) return 0;\n    int nums[10005];\n    for (int i = 0; i < n; i++) scanf("%d", &nums[i]);\n    int target;\n    scanf("%d", &target);\n    \n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) {\n                printf("%d %d\\n", i, j);\n                return 0;\n            }\n        }\n    }\n    return 0;\n}`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        \n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < n; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) {\n                System.out.println(map.get(comp) + " " + i);\n                return;\n            }\n            map.put(nums[i], i);\n        }\n    }\n}`,
        python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    \n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            print(f"{seen[comp]} {i}")\n            return\n        seen[num] = i\n\nif __name__ == "__main__":\n    main()`,
      },
      testCases: [
        { input: "4\n2 7 11 15\n9", expected: "0 1", isHidden: false },
        { input: "3\n3 2 4\n6", expected: "1 2", isHidden: false },
        { input: "2\n3 3\n6", expected: "0 1", isHidden: true },
        { input: "5\n-1 -2 -3 -4 -5\n-8", expected: "2 4", isHidden: true },
      ],
    },
    {
      id: "practice-valid-palindrome",
      title: "Valid Palindrome",
      difficulty: "Easy",
      tags: ["Two Pointers", "String"],
      statement: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
      inputFormat: "A single line containing string s.",
      outputFormat: "Print 'true' if palindrome, else 'false'.",
      constraints: "1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
      sampleInput: "A man, a plan, a canal: Panama",
      sampleOutput: "true",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterCodes: {
        cpp: `#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    string filtered = "";\n    for (char c : s) {\n        if (isalnum(c)) filtered += tolower(c);\n    }\n    int l = 0, r = filtered.length() - 1;\n    while (l < r) {\n        if (filtered[l] != filtered[r]) {\n            cout << "false" << endl;\n            return 0;\n        }\n        l++; r--;\n    }\n    cout << "true" << endl;\n    return 0;\n}`,
        c: `#include <stdio.h>\n#include <ctype.h>\n#include <string.h>\n\nint main() {\n    char s[200005];\n    if (!fgets(s, sizeof(s), stdin)) return 0;\n    int l = 0, r = strlen(s) - 1;\n    while (l < r) {\n        while (l < r && !isalnum(s[l])) l++;\n        while (l < r && !isalnum(s[r])) r--;\n        if (tolower(s[l]) != tolower(s[r])) {\n            printf("false\\n");\n            return 0;\n        }\n        l++; r--;\n    }\n    printf("true\\n");\n    return 0;\n}`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String s = sc.nextLine();\n        StringBuilder sb = new StringBuilder();\n        for (char c : s.toCharArray()) {\n            if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));\n        }\n        String filtered = sb.toString();\n        String rev = sb.reverse().toString();\n        System.out.println(filtered.equals(rev) ? "true" : "false");\n    }\n}`,
        python: `import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    filtered = [c.lower() for c in s if c.isalnum()]\n    print("true" if filtered == filtered[::-1] else "false")\n\nif __name__ == "__main__":\n    main()`,
      },
      testCases: [
        { input: "A man, a plan, a canal: Panama", expected: "true", isHidden: false },
        { input: "race a car", expected: "false", isHidden: false },
        { input: " ", expected: "true", isHidden: true },
        { input: "0P", expected: "false", isHidden: true },
      ],
    },
    {
      id: "practice-binary-search",
      title: "Binary Search",
      difficulty: "Easy",
      tags: ["Binary Search", "Arrays"],
      statement: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
      inputFormat: "First line integer N. Second line N space-separated sorted integers. Third line integer target.",
      outputFormat: "Print the 0-based index of target, or -1 if not found.",
      constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll integers in nums are unique.\nnums is sorted in ascending order.",
      sampleInput: "6\n-1 0 3 5 9 12\n9",
      sampleOutput: "4",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int target;\n    cin >> target;\n    int l = 0, r = n - 1, ans = -1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (a[mid] == target) { ans = mid; break; }\n        else if (a[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    cout << ans << endl;\n    return 0;\n}`,
        c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != 1) return 0;\n    int a[10005];\n    for (int i = 0; i < n; i++) scanf("%d", &a[i]);\n    int target;\n    scanf("%d", &target);\n    int l = 0, r = n - 1, ans = -1;\n    while (l <= r) {\n        int mid = l + (r - l) / 2;\n        if (a[mid] == target) { ans = mid; break; }\n        else if (a[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    printf("%d\\n", ans);\n    return 0;\n}`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int l = 0, r = n - 1, ans = -1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (a[mid] == target) { ans = mid; break; }\n            else if (a[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        System.out.println(ans);\n    }\n}`,
        python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    target = int(lines[n+1])\n    l, r, ans = 0, n - 1, -1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            ans = mid\n            break\n        elif nums[mid] < target:\n            l = mid + 1\n        else:\n            r = mid - 1\n    print(ans)\n\nif __name__ == "__main__":\n    main()`,
      },
      testCases: [
        { input: "6\n-1 0 3 5 9 12\n9", expected: "4", isHidden: false },
        { input: "6\n-1 0 3 5 9 12\n2", expected: "-1", isHidden: false },
        { input: "1\n5\n5", expected: "0", isHidden: true },
      ],
    },
    {
      id: "practice-maximum-subarray",
      title: "Maximum Subarray (Kadane's)",
      difficulty: "Medium",
      tags: ["Arrays", "Dynamic Programming"],
      statement: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
      inputFormat: "First line integer N. Second line N space-separated integers.",
      outputFormat: "Print the maximum subarray sum.",
      constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
      sampleInput: "9\n-2 1 -3 4 -1 2 1 -5 4",
      sampleOutput: "6",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    long long maxSoFar = -1e18, currMax = 0;\n    for (int i = 0; i < n; i++) {\n        long long x; cin >> x;\n        currMax = max(x, currMax + x);\n        maxSoFar = max(maxSoFar, currMax);\n    }\n    cout << maxSoFar << endl;\n    return 0;\n}`,
        c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != 1) return 0;\n    long long maxSoFar = -1000000000000LL, currMax = 0;\n    for (int i = 0; i < n; i++) {\n        long long x;\n        scanf("%lld", &x);\n        currMax = (x > currMax + x) ? x : currMax + x;\n        if (currMax > maxSoFar) maxSoFar = currMax;\n    }\n    printf("%lld\\n", maxSoFar);\n    return 0;\n}`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long maxSoFar = Long.MIN_VALUE, currMax = 0;\n        for (int i = 0; i < n; i++) {\n            long x = sc.nextLong();\n            currMax = Math.max(x, currMax + x);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        System.out.println(maxSoFar);\n    }\n}`,
        python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    nums = [int(x) for x in lines[1:]]\n    max_so_far = -float('inf')\n    curr = 0\n    for x in nums:\n        curr = max(x, curr + x)\n        max_so_far = max(max_so_far, curr)\n    print(max_so_far)\n\nif __name__ == "__main__":\n    main()`,
      },
      testCases: [
        { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expected: "6", isHidden: false },
        { input: "1\n1", expected: "1", isHidden: false },
        { input: "5\n5 4 -1 7 8", expected: "23", isHidden: true },
        { input: "3\n-3 -2 -1", expected: "-1", isHidden: true },
      ],
    },
    {
      id: "practice-longest-substring",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      tags: ["Sliding Window", "Hash Table"],
      statement: "Given a string `s`, find the length of the longest substring without repeating characters.",
      inputFormat: "A single line containing string s.",
      outputFormat: "Print the integer length of the longest substring.",
      constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
      sampleInput: "abcabcbb",
      sampleOutput: "3",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterCodes: {
        cpp: `#include <iostream>\n#include <string>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    getline(cin, s);\n    vector<int> last(256, -1);\n    int maxLen = 0, start = 0;\n    for (int i = 0; i < (int)s.length(); i++) {\n        unsigned char c = s[i];\n        if (last[c] >= start) start = last[c] + 1;\n        last[c] = i;\n        maxLen = max(maxLen, i - start + 1);\n    }\n    cout << maxLen << endl;\n    return 0;\n}`,
        c: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[50005];\n    if (!fgets(s, sizeof(s), stdin)) { printf("0\\n"); return 0; }\n    int len = strlen(s);\n    if (len > 0 && s[len-1] == '\\n') s[--len] = '\\0';\n    int last[256];\n    for (int i = 0; i < 256; i++) last[i] = -1;\n    int maxLen = 0, start = 0;\n    for (int i = 0; i < len; i++) {\n        unsigned char c = (unsigned char)s[i];\n        if (last[c] >= start) start = last[c] + 1;\n        last[c] = i;\n        int cur = i - start + 1;\n        if (cur > maxLen) maxLen = cur;\n    }\n    printf("%d\\n", maxLen);\n    return 0;\n}`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : "";\n        int[] last = new int[256];\n        Arrays.fill(last, -1);\n        int maxLen = 0, start = 0;\n        for (int i = 0; i < s.length(); i++) {\n            int c = s.charAt(i);\n            if (last[c] >= start) start = last[c] + 1;\n            last[c] = i;\n            maxLen = Math.max(maxLen, i - start + 1);\n        }\n        System.out.println(maxLen);\n    }\n}`,
        python: `import sys\n\ndef main():\n    s = sys.stdin.readline().rstrip('\\r\\n')\n    last = {}\n    max_len = 0\n    start = 0\n    for i, c in enumerate(s):\n        if c in last and last[c] >= start:\n            start = last[c] + 1\n        last[c] = i\n        max_len = max(max_len, i - start + 1)\n    print(max_len)\n\nif __name__ == "__main__":\n    main()`,
      },
      testCases: [
        { input: "abcabcbb", expected: "3", isHidden: false },
        { input: "bbbbb", expected: "1", isHidden: false },
        { input: "pwwkew", expected: "3", isHidden: true },
      ],
    },
    {
      id: "practice-trapping-rain-water",
      title: "Trapping Rain Water",
      difficulty: "Hard",
      tags: ["Two Pointers", "Dynamic Programming", "Stack"],
      statement: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      inputFormat: "First line integer N. Second line N space-separated integers.",
      outputFormat: "Print the total trapped water units.",
      constraints: "n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5",
      sampleInput: "12\n0 1 0 2 1 0 1 3 2 1 2 1",
      sampleOutput: "6",
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      starterCodes: {
        cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n) || n <= 2) { cout << 0 << endl; return 0; }\n    vector<int> h(n);\n    for (int i = 0; i < n; i++) cin >> h[i];\n    int l = 0, r = n - 1;\n    int leftMax = 0, rightMax = 0;\n    long long water = 0;\n    while (l < r) {\n        if (h[l] < h[r]) {\n            if (h[l] >= leftMax) leftMax = h[l];\n            else water += leftMax - h[l];\n            l++;\n        } else {\n            if (h[r] >= rightMax) rightMax = h[r];\n            else water += rightMax - h[r];\n            r--;\n        }\n    }\n    cout << water << endl;\n    return 0;\n}`,
        c: `#include <stdio.h>\n\nint main() {\n    int n;\n    if (scanf("%d", &n) != 1 || n <= 2) { printf("0\\n"); return 0; }\n    int h[20005];\n    for (int i = 0; i < n; i++) scanf("%d", &h[i]);\n    int l = 0, r = n - 1, leftMax = 0, rightMax = 0;\n    long long water = 0;\n    while (l < r) {\n        if (h[l] < h[r]) {\n            if (h[l] >= leftMax) leftMax = h[l];\n            else water += leftMax - h[l];\n            l++;\n        } else {\n            if (h[r] >= rightMax) rightMax = h[r];\n            else water += rightMax - h[r];\n            r--;\n        }\n    }\n    printf("%lld\\n", water);\n    return 0;\n}`,
        java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) { System.out.println(0); return; }\n        int n = sc.nextInt();\n        int[] h = new int[n];\n        for (int i = 0; i < n; i++) h[i] = sc.nextInt();\n        int l = 0, r = n - 1, leftMax = 0, rightMax = 0;\n        long water = 0;\n        while (l < r) {\n            if (h[l] < h[r]) {\n                if (h[l] >= leftMax) leftMax = h[l];\n                else water += leftMax - h[l];\n                l++;\n            } else {\n                if (h[r] >= rightMax) rightMax = h[r];\n                else water += rightMax - h[r];\n                r--;\n            }\n        }\n        System.out.println(water);\n    }\n}`,
        python: `import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines or int(lines[0]) <= 2:\n        print(0)\n        return\n    n = int(lines[0])\n    h = [int(x) for x in lines[1:n+1]]\n    l, r = 0, n - 1\n    left_max = right_max = 0\n    water = 0\n    while l < r:\n        if h[l] < h[r]:\n            if h[l] >= left_max:\n                left_max = h[l]\n            else:\n                water += left_max - h[l]\n            l += 1\n        else:\n            if h[r] >= right_max:\n                right_max = h[r]\n            else:\n                water += right_max - h[r]\n            r -= 1\n    print(water)\n\nif __name__ == "__main__":\n    main()`,
      },
      testCases: [
        { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expected: "6", isHidden: false },
        { input: "6\n4 2 0 3 2 5", expected: "9", isHidden: false },
        { input: "3\n2 0 2", expected: "2", isHidden: true },
      ],
    },
  ];

  for (const prob of practiceProblems) {
    const { testCases, ...probData } = prob;
    const created = await db.problem.upsert({
      where: { id: prob.id },
      update: {
        title: probData.title,
        difficulty: probData.difficulty,
        tags: probData.tags,
        statement: probData.statement,
        inputFormat: probData.inputFormat,
        outputFormat: probData.outputFormat,
        constraints: probData.constraints,
        sampleInput: probData.sampleInput,
        sampleOutput: probData.sampleOutput,
        starterCodes: probData.starterCodes as any,
        isPublished: true,
      },
      create: {
        id: prob.id,
        title: probData.title,
        difficulty: probData.difficulty,
        tags: probData.tags,
        statement: probData.statement,
        inputFormat: probData.inputFormat,
        outputFormat: probData.outputFormat,
        constraints: probData.constraints,
        sampleInput: probData.sampleInput,
        sampleOutput: probData.sampleOutput,
        starterCodes: probData.starterCodes as any,
        isPublished: true,
      },
    });

    // Seed test cases
    await db.testCase.deleteMany({ where: { problemId: created.id } });
    for (let i = 0; i < testCases.length; i++) {
      await db.testCase.create({
        data: {
          problemId: created.id,
          input: testCases[i].input,
          expected: testCases[i].expected,
          isHidden: testCases[i].isHidden,
          sequence: i + 1,
          score: 25,
        },
      });
    }
  }
  console.log(`Seeded ${practiceProblems.length} Classical Practice Problems.`);

  // 6. Link 2 practice problems to the active contest
  await db.problem.updateMany({
    where: { id: { in: ["practice-two-sum", "practice-binary-search"] } },
    data: { contestId: activeContest.id },
  });

  // 7. Seed Discussions
  const disc1 = await db.discussion.upsert({
    where: { id: "disc-two-sum-optimality" },
    update: {},
    create: {
      id: "disc-two-sum-optimality",
      title: "Why Hash Map O(N) is strictly superior to Two-Pointers O(N log N) for Two Sum",
      content: "When analyzing Two Sum, many beginners immediately sort the array and run two pointers. While this achieves O(1) auxiliary space in place, sorting takes O(N log N) time and destroys the original index positions, forcing you to carry an index pair array.\n\nWith a single-pass hash map:\n```python\nseen = {}\nfor i, x in enumerate(nums):\n    if target - x in seen:\n        return [seen[target - x], i]\n    seen[x] = i\n```\nYou achieve **O(N) linear time** with O(N) space, preserving 0-based original indices naturally. What are your thoughts on space vs time trade-offs in modern memory architectures?",
      authorId: superAdmin.id,
      problemId: "practice-two-sum",
      tags: ["Algorithms", "Complexity", "Two Sum"],
      upvotes: 24,
      views: 142,
    },
  });

  await db.discussionComment.createMany({
    data: [
      {
        discussionId: disc1.id,
        authorId: admin.id,
        content: "Great breakdown! In competitive environments with 10^5 elements, the hash map constant factor in C++ (unordered_map) can sometimes be targeted by anti-hash collision tests. Reserving buckets or using gp_hash_table is recommended for C++.",
      },
    ],
    skipDuplicates: true,
  });

  const disc2 = await db.discussion.upsert({
    where: { id: "disc-judge0-fast-io" },
    update: {},
    create: {
      id: "disc-judge0-fast-io",
      title: "Essential Fast I/O snippets for C++, Java, and Python on ByteVerse Judge0",
      content: "Judge0 enforces strict 2.0-second CPU limits. Here are recommended templates:\n\n**C++**:\n```cpp\nios_base::sync_with_stdio(false);\ncin.tie(NULL);\n```\n\n**Java**:\nUse `BufferedReader` and `StringTokenizer` instead of `java.util.Scanner`.\n\n**Python**:\nUse `sys.stdin.read().split()` to read all tokens at once.",
      authorId: admin.id,
      tags: ["Tips", "FastIO", "Judge0"],
      upvotes: 38,
      views: 290,
    },
  });

  console.log("Seeded Discussions & Comments.");
  console.log("Platform upgrade seed completed successfully!");
}

seedPlatformUpgrade()
  .catch(console.error)
  .finally(() => process.exit(0));
