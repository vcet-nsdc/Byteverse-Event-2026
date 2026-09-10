import fs from "fs";
import path from "path";
import type { UserRole } from "@/types";

export interface FallbackAuthor {
  id: string;
  name: string;
  email?: string;
  college: string;
  role: UserRole;
}

export interface FallbackComment {
  id: string;
  discussionId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: FallbackAuthor;
}

export interface FallbackDiscussion {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: FallbackAuthor;
  problem?: {
    id: string;
    title: string;
    difficulty?: string;
  } | null;
  comments: FallbackComment[];
  upvoterUserIds: string[];
}

const STORE_PATH = path.resolve(process.cwd(), "prisma", "fallback-discussions.json");

// In-memory global store to survive Next.js HMR
const globalStore: Map<string, FallbackDiscussion> =
  (globalThis as any).__bv_fallback_discussions ||
  ((globalThis as any).__bv_fallback_discussions = new Map<string, FallbackDiscussion>());

let isInitialized = false;

function loadFromDisk() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const list: FallbackDiscussion[] = JSON.parse(raw);
      for (const d of list) {
        if (d.id) globalStore.set(d.id, d);
      }
    }
  } catch (err) {
    console.error("[DiscussionStore] Error loading discussions from disk:", err);
  }
}

function saveToDisk() {
  try {
    const list = Array.from(globalStore.values());
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[DiscussionStore] Error persisting discussions to disk:", err);
  }
}

export function ensureInitialized() {
  if (isInitialized && globalStore.size > 0) return;
  loadFromDisk();

  if (globalStore.size === 0) {
    // Seed the 3 demo discussions
    const demoDiscussions: FallbackDiscussion[] = [
      {
        id: "disc_algo_twopointer",
        title: "[Algorithms] Optimal approaches for Two-Pointer vs Sliding Window in high-volume test cases (10^5)",
        content: `When tackling array and string problems under strict 1.0s time limits, choosing between **Two-Pointer** and **Sliding Window** techniques is critical.

### 1. The Two-Pointer Paradigm
Two-pointer approaches typically start from opposite ends of a sorted array and converge inwards:
\`\`\`cpp
int left = 0, right = n - 1;
while (left < right) {
    long long sum = (long long)arr[left] + arr[right];
    if (sum == target) return {left, right};
    if (sum < target) left++;
    else right--;
}
\`\`\`
- **Time Complexity:** O(N) (or O(N log N) if sorting is required).
- **Space Complexity:** O(1) auxiliary memory.

### 2. The Sliding Window Paradigm
Sliding window maintains a dynamic range \`[left, right]\` over contiguous elements where all values satisfy a monotonic invariant (e.g., sum <= K with non-negative numbers).

\`\`\`python
left = 0
current_sum = 0
max_len = 0
for right in range(len(nums)):
    current_sum += nums[right]
    while current_sum > k and left <= right:
        current_sum -= nums[left]
        left += 1
    max_len = max(max_len, right - left + 1)
\`\`\`

### Common Pitfalls
1. **Negative numbers:** If arrays contain negative values, the monotonic property breaks down. You must switch to Prefix Sums with a Hash Map.
2. **Integer Overflow:** Always cast intermediate sums to \`long long\` or 64-bit integers when \`N = 10^5\` and \`arr[i] = 10^9\`.`,
        tags: ["Algorithms", "Complexity", "Two Sum"],
        upvotes: 42,
        views: 318,
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        authorId: "user_participant_coder",
        author: {
          id: "user_participant_coder",
          name: "Aryan Sharma",
          email: "coder@byteverse.dev",
          college: "NSDC Engineering Institute",
          role: "PARTICIPANT",
        },
        problem: {
          id: "prob-1",
          title: "Two Sum Target Convergence",
          difficulty: "EASY",
        },
        upvoterUserIds: ["user_participant_coder"],
        comments: [
          {
            id: "comm_1_1",
            discussionId: "disc_algo_twopointer",
            authorId: "user_admin_primary",
            content: "Great breakdown Aryan! Remember that when elements can be negative, the standard sliding window breaks down—you'll need prefix sums with a hash map to maintain O(N) runtime.",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            author: {
              id: "user_admin_primary",
              name: "ByteVerse Admin",
              college: "NSDC Technical University",
              role: "ADMIN",
            },
          },
          {
            id: "comm_1_2",
            discussionId: "disc_algo_twopointer",
            authorId: "user_superadmin_root",
            content: "Pinned for the upcoming NSDC Collegiate Round 1. Make sure to watch out for 1-based indexing test case offsets in the problem statement!",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            author: {
              id: "user_superadmin_root",
              name: "ByteVerse Super Admin",
              college: "NSDC ByteVerse Board",
              role: "SUPER_ADMIN",
            },
          },
        ],
      },
      {
        id: "disc_fastio_templates",
        title: "[Fast I/O] Essential Fast I/O templates for C++, Java, and Python 3 on ByteVerse Judge0",
        content: `Standard console I/O can consume up to 70% of execution time on large test inputs (N = 500,000). Use these benchmarked templates to avoid Time Limit Exceeded (TLE) verdicts.

### C++ Fast I/O
\`\`\`cpp
#include <iostream>
using namespace std;

int main() {
    // Untie C++ streams from standard C streams
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    
    // Use '\\n' instead of endl to avoid unnecessary buffer flushes
    return 0;
}
\`\`\`

### Java Fast Reader (BufferedReader + StringTokenizer)
\`\`\`java
import java.io.*;
import java.util.*;

public class FastScanner {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    StringTokenizer st = new StringTokenizer("");

    String next() throws IOException {
        while (!st.hasMoreTokens()) st = new StringTokenizer(br.readLine());
        return st.nextToken();
    }
    int nextInt() throws IOException { return Integer.parseInt(next()); }
    long nextLong() throws IOException { return Long.parseLong(next()); }
}
\`\`\`

### Python 3 Fast Input
\`\`\`python
import sys

def solve():
    # Read entire standard input into token list at once
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    # Fast indexed access
    n = int(input_data[0])
    # ... logic here
\`\`\`
Tested and verified on Judge0 container cluster with sub-50ms overhead.`,
        tags: ["FastIO", "Judge0", "Tips"],
        upvotes: 89,
        views: 742,
        createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        authorId: "user_admin_primary",
        author: {
          id: "user_admin_primary",
          name: "ByteVerse Admin",
          email: "admin@byteverse.dev",
          college: "NSDC Technical University",
          role: "ADMIN",
        },
        problem: null,
        upvoterUserIds: ["user_admin_primary"],
        comments: [
          {
            id: "comm_2_1",
            discussionId: "disc_fastio_templates",
            authorId: "user_participant_coder",
            content: "Tested the Java FastScanner template on the Hard problem in Practice Arena and runtime dropped from 1.4s to 0.18s! Lifesaver.",
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
            author: {
              id: "user_participant_coder",
              name: "Aryan Sharma",
              college: "NSDC Engineering Institute",
              role: "PARTICIPANT",
            },
          },
          {
            id: "comm_2_2",
            discussionId: "disc_fastio_templates",
            authorId: "user_superadmin_root",
            content: "Note for Python users: avoid calling input() inside a loop; sys.stdin.read().split() reads all tokens into memory in a single syscall.",
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            author: {
              id: "user_superadmin_root",
              name: "ByteVerse Super Admin",
              college: "NSDC ByteVerse Board",
              role: "SUPER_ADMIN",
            },
          },
        ],
      },
      {
        id: "disc_ai_hallucinations",
        title: "[AI vs Human] Tips for Round 2: Spotting common LLM hallucinations in algorithmic logic",
        content: `In the Round 2 AI Code Debugging challenges, participants will be provided with pre-generated AI solutions that contain deceptive bugs. Here is our recommended audit checklist:

### 1. Off-By-One Boundary Conditions
LLMs frequently hallucinate loop end bounds:
- In binary search: \`while (left <= right)\` vs \`while (left < right)\`.
- Midpoint calculation: Always verify \`mid = left + (right - left) / 2\` rather than \`(left + right) / 2\` to prevent 32-bit integer overflow.

### 2. Dynamic Programming State Initialization
- AI models frequently miss base cases for \`dp[0]\` or assume \`dp[i] = 0\` when the state must be initialized to \`-1\` or \`Infinity\`.

### 3. Edge-Case Verification Matrix
Before submitting, manually run the code on:
1. Empty input / \`N = 0\`
2. Single-element input / \`N = 1\`
3. All identical elements / \`[5, 5, 5, 5]\`
4. Strict monotone strictly increasing vs strictly decreasing inputs.
5. Extreme values: \`2^31 - 1\` and \`-2^31\`.`,
        tags: ["General", "Algorithms", "Tips"],
        upvotes: 67,
        views: 512,
        createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        authorId: "user_superadmin_root",
        author: {
          id: "user_superadmin_root",
          name: "ByteVerse Super Admin",
          email: "superadmin@byteverse.dev",
          college: "NSDC ByteVerse Board",
          role: "SUPER_ADMIN",
        },
        problem: null,
        upvoterUserIds: ["user_superadmin_root"],
        comments: [
          {
            id: "comm_3_1",
            discussionId: "disc_ai_hallucinations",
            authorId: "user_admin_primary",
            content: "In Round 2's AI Code Debugging track, 40% of the buggy code snippets will contain subtle operator precedence and integer overflow traps.",
            createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
            author: {
              id: "user_admin_primary",
              name: "ByteVerse Admin",
              college: "NSDC Technical University",
              role: "ADMIN",
            },
          },
          {
            id: "comm_3_2",
            discussionId: "disc_ai_hallucinations",
            authorId: "user_participant_coder",
            content: "The edge-case checklist here is super handy. Always check integer overflow when multiplying two 10^5 numbers—use long long in C++!",
            createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
            author: {
              id: "user_participant_coder",
              name: "Aryan Sharma",
              college: "NSDC Engineering Institute",
              role: "PARTICIPANT",
            },
          },
        ],
      },
    ];

    for (const d of demoDiscussions) {
      globalStore.set(d.id, d);
    }
    saveToDisk();
  }

  isInitialized = true;
}

export function getAllDiscussions(options?: {
  tag?: string | null;
  search?: string | null;
  sort?: string | null;
  limit?: number;
  skip?: number;
  userId?: string | null;
}): {
  discussions: any[];
  total: number;
} {
  ensureInitialized();

  let list = Array.from(globalStore.values());

  if (options?.tag && options.tag !== "All") {
    const targetTag = options.tag.toLowerCase();
    list = list.filter((d) => d.tags.some((t) => t.toLowerCase() === targetTag));
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    );
  }

  if (options?.sort === "upvotes") {
    list.sort((a, b) => b.upvotes - a.upvotes);
  } else if (options?.sort === "comments") {
    list.sort((a, b) => b.comments.length - a.comments.length);
  } else {
    // Newest default
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const total = list.length;
  const skip = options?.skip || 0;
  const limit = options?.limit || 20;
  const paged = list.slice(skip, skip + limit);

  const formatted = paged.map((d) => ({
    id: d.id,
    title: d.title,
    content: d.content,
    tags: d.tags,
    upvotes: d.upvotes,
    views: d.views,
    createdAt: d.createdAt,
    author: {
      id: d.author.id,
      name: d.author.name,
      college: d.author.college,
      role: d.author.role,
    },
    problem: d.problem || null,
    commentCount: d.comments.length,
    userVote: options?.userId && d.upvoterUserIds?.includes(options.userId) ? 1 : 0,
  }));

  return { discussions: formatted, total };
}

export function getDiscussionById(id: string, userId?: string | null): any | null {
  ensureInitialized();
  const discussion = globalStore.get(id);
  if (!discussion) return null;

  // Increment view counter
  discussion.views += 1;
  saveToDisk();

  return {
    id: discussion.id,
    title: discussion.title,
    content: discussion.content,
    tags: discussion.tags,
    upvotes: discussion.upvotes,
    views: discussion.views,
    createdAt: discussion.createdAt,
    updatedAt: discussion.updatedAt,
    author: discussion.author,
    problem: discussion.problem || null,
    comments: discussion.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.author,
      isOwner: userId === c.authorId,
    })),
    userVote: userId && discussion.upvoterUserIds?.includes(userId) ? 1 : 0,
    isOwner: userId === discussion.authorId,
  };
}

export function createDiscussion(data: {
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  author: FallbackAuthor;
  problemId?: string | null;
}): FallbackDiscussion {
  ensureInitialized();

  const id = `disc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const newDiscussion: FallbackDiscussion = {
    id,
    title: data.title.trim(),
    content: data.content.trim(),
    tags: data.tags.length > 0 ? data.tags : ["General"],
    upvotes: 1, // Author upvotes their own post
    views: 1,
    createdAt: now,
    updatedAt: now,
    authorId: data.authorId,
    author: data.author,
    problem: null,
    comments: [],
    upvoterUserIds: [data.authorId],
  };

  globalStore.set(id, newDiscussion);
  saveToDisk();
  return newDiscussion;
}

export function addComment(
  discussionId: string,
  data: {
    authorId: string;
    author: FallbackAuthor;
    content: string;
  }
): FallbackComment | null {
  ensureInitialized();
  const discussion = globalStore.get(discussionId);
  if (!discussion) return null;

  const newComment: FallbackComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    discussionId,
    authorId: data.authorId,
    content: data.content.trim(),
    createdAt: new Date().toISOString(),
    author: data.author,
  };

  discussion.comments.push(newComment);
  discussion.updatedAt = new Date().toISOString();
  saveToDisk();

  return newComment;
}

export function toggleUpvote(discussionId: string, userId: string): { upvotes: number; userVote: number } | null {
  ensureInitialized();
  const discussion = globalStore.get(discussionId);
  if (!discussion) return null;

  if (!discussion.upvoterUserIds) {
    discussion.upvoterUserIds = [];
  }

  const hasUpvoted = discussion.upvoterUserIds.includes(userId);
  let userVote = 0;

  if (hasUpvoted) {
    // Untoggle
    discussion.upvoterUserIds = discussion.upvoterUserIds.filter((id: string) => id !== userId);
    discussion.upvotes = Math.max(0, discussion.upvotes - 1);
    userVote = 0;
  } else {
    // Upvote
    discussion.upvoterUserIds.push(userId);
    discussion.upvotes += 1;
    userVote = 1;
  }

  saveToDisk();
  return { upvotes: discussion.upvotes, userVote };
}

export function deleteDiscussion(discussionId: string, userId: string, userRole?: string): boolean {
  ensureInitialized();
  const discussion = globalStore.get(discussionId);
  if (!discussion) return false;

  if (discussion.authorId !== userId && !["ADMIN", "SUPER_ADMIN"].includes(userRole || "")) {
    return false;
  }

  globalStore.delete(discussionId);
  saveToDisk();
  return true;
}
