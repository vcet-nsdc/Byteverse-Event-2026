import { db } from "../src/lib/db";

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

const SET_A_QUESTIONS = [
  {
    sequence: 1,
    title: "Option 1: The Hackathon Bug Queue",
    difficulty: "Medium",
    statement: `**Narrative:** You are managing the ByteVerse hackathon support system. Teams submit bugs with a \`priority_score\` (1 to 100) and an \`arrival_time\` (timestamp). You must output the \`arrival_time\` of the bugs in the exact order they should be fixed.

**Rule:** Fix the highest \`priority_score\` first. If two bugs have the exact same priority, fix the one with the earliest (smaller) \`arrival_time\` first.

**Task:** Read the input and output the space-separated \`arrival_time\` integers in the correct processing order.
*(Hint: Use a custom comparator with \`sort\` / \`qsort\` for $O(N \\log N)$ efficiency).*`,
    inputFormat: "First line contains integer N (number of bugs). The next N lines (or space-separated tokens) each contain two integers: priority_score arrival_time.",
    outputFormat: "Space-separated arrival_time values in the order they should be resolved.",
    constraints: "1 <= N <= 100,000, 1 <= priority_score <= 100, 0 <= arrival_time <= 10^9",
    sampleInput: "4\n90 10\n50 12\n90 8\n40 15",
    sampleOutput: "8 10 12 15",
    timeLimitMs: 1500,
    starterCodes: {
      c: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int priority;
    int time;
} Bug;

// TODO: Implement custom comparator (Priority DESC, Time ASC)
int comp(const void* a, const void* b) {
    Bug* b1 = (Bug*)a;
    Bug* b2 = (Bug*)b;
    if (b1->priority == b2->priority) {
        return b1->time - b2->time;
    }
    return b2->priority - b1->priority;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    Bug* arr = malloc(n * sizeof(Bug));
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &arr[i].priority, &arr[i].time);
    }
    
    qsort(arr, n, sizeof(Bug), comp);
    
    for (int i = 0; i < n; i++) {
        printf("%d%c", arr[i].time, (i == n - 1) ? '\\n' : ' ');
    }
    free(arr);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Bug {
    int priority;
    int time;
};

// TODO: Implement custom sorting comparator (Priority DESC, Time ASC)
bool comp(const Bug& a, const Bug& b) {
    if (a.priority == b.priority) return a.time < b.time;
    return a.priority > b.priority;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<Bug> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i].priority >> arr[i].time;
    }
    
    sort(arr.begin(), arr.end(), comp);
    
    for (int i = 0; i < n; i++) {
        cout << arr[i].time << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        
        int[][] bugs = new int[n][2];
        for (int i = 0; i < n; i++) {
            while (!st.hasMoreTokens()) {
                String nextLine = br.readLine();
                if (nextLine == null) break;
                st = new StringTokenizer(nextLine);
            }
            bugs[i][0] = Integer.parseInt(st.nextToken()); // priority
            bugs[i][1] = Integer.parseInt(st.nextToken()); // time
        }
        
        // TODO: Sort bugs by Priority DESC, Time ASC
        Arrays.sort(bugs, (a, b) -> {
            if (a[0] == b[0]) return Integer.compare(a[1], b[1]);
            return Integer.compare(b[0], a[0]);
        });
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(bugs[i][1]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`,
      python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    bugs = []
    idx = 1
    for _ in range(n):
        priority = int(input_data[idx])
        time = int(input_data[idx+1])
        bugs.append((priority, time))
        idx += 2
        
    # TODO: Sort by priority DESC (-x[0]), time ASC (x[1])
    bugs.sort(key=lambda x: (-x[0], x[1]))
    print(" ".join(str(b[1]) for b in bugs))

if __name__ == "__main__":
    solve()`,
    },
    testCases: [
      { input: "4\n90 10\n50 12\n90 8\n40 15", expected: "8 10 12 15", isHidden: false },
      { input: "3\n100 5\n100 2\n100 9", expected: "2 5 9", isHidden: false },
      { input: "5\n10 1\n20 2\n30 3\n40 4\n50 5", expected: "5 4 3 2 1", isHidden: true },
      { input: "4\n75 100\n75 50\n80 200\n80 150", expected: "150 200 50 100", isHidden: true },
      { input: "1\n50 42", expected: "42", isHidden: true },
    ],
  },
  {
    sequence: 2,
    title: "Option 2: The Unique Playlist",
    difficulty: "Medium",
    statement: `**Narrative:** The ByteVerse DJ wants to play a continuous segment of songs from their playlist, but refuses to play the exact same \`song_id\` twice in that segment.
Given an array of $N$ integers representing \`song_id\`s, output the length of the **longest contiguous segment** that contains NO duplicate songs.

**Task:** Find the maximum length of a subarray where all elements are distinct.
*(Hint: Use the Sliding Window / Two-Pointer pattern for an optimal $O(N)$ solution).*`,
    inputFormat: "First line: integer N. Second line: N space-separated integers representing song IDs.",
    outputFormat: "A single integer representing the maximum length of a contiguous unique subarray.",
    constraints: "1 <= N <= 100,000, 0 <= song_id <= 10^5",
    sampleInput: "5\n1 2 1 3 4",
    sampleOutput: "4",
    timeLimitMs: 1500,
    starterCodes: {
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* arr = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    
    // Static frequency map for values up to 100,000
    static int seen[100005] = {0};
    int max_len = 0, left = 0;
    
    for (int right = 0; right < n; right++) {
        seen[arr[right]]++;
        while (seen[arr[right]] > 1) {
            seen[arr[left]]--;
            left++;
        }
        int curr_len = right - left + 1;
        if (curr_len > max_len) max_len = curr_len;
    }
    
    printf("%d\\n", max_len);
    free(arr);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    unordered_set<int> window;
    int maxLen = 0, left = 0;
    
    for (int right = 0; right < n; right++) {
        while (window.count(arr[right])) {
            window.erase(arr[left]);
            left++;
        }
        window.insert(arr[right]);
        maxLen = max(maxLen, right - left + 1);
    }
    
    cout << maxLen << "\\n";
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());
        
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(st.nextToken());
        
        HashSet<Integer> window = new HashSet<>();
        int maxLen = 0, left = 0;
        
        for (int right = 0; right < n; right++) {
            while (window.contains(arr[right])) {
                window.remove(arr[left]);
                left++;
            }
            window.add(arr[right]);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        
        System.out.println(maxLen);
    }
}`,
      python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:1+n]]
    
    window = set()
    left = 0
    max_len = 0
    
    for right in range(n):
        while arr[right] in window:
            window.remove(arr[left])
            left += 1
        window.add(arr[right])
        max_len = max(max_len, right - left + 1)
        
    print(max_len)

if __name__ == "__main__":
    solve()`,
    },
    testCases: [
      { input: "5\n1 2 1 3 4", expected: "4", isHidden: false },
      { input: "6\n1 2 3 4 5 6", expected: "6", isHidden: false },
      { input: "5\n7 7 7 7 7", expected: "1", isHidden: true },
      { input: "8\n1 2 3 1 4 5 2 6", expected: "6", isHidden: true },
      { input: "1\n99", expected: "1", isHidden: true },
    ],
  },
  {
    sequence: 3,
    title: "Option 3: Next Highest Stock Price",
    difficulty: "Medium",
    statement: `**Narrative:** You are analyzing a stock's daily prices over $N$ trading days. For each day, output **how many days you have to wait** until a future day has a strictly *higher* price. If a higher price never occurs in the future, output \`0\` for that day.

**Task:** For each index $i$, find the smallest $j > i$ such that $price[j] > price[i]$, and output $j - i$. If no such $j$ exists, output $0$.
*(Hint: Use a Monotonic Decreasing Stack of indices for an optimal $O(N)$ solution).*`,
    inputFormat: "First line: integer N. Second line: N space-separated integers representing stock prices.",
    outputFormat: "N space-separated integers representing the days to wait for a higher price.",
    constraints: "1 <= N <= 100,000, 1 <= prices[i] <= 10^9",
    sampleInput: "5\n30 40 50 60 70",
    sampleOutput: "1 1 1 1 0",
    timeLimitMs: 1500,
    starterCodes: {
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* prices = malloc(n * sizeof(int));
    int* ans = calloc(n, sizeof(int));
    int* stack = malloc(n * sizeof(int));
    int top = -1;
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &prices[i]);
        while (top >= 0 && prices[i] > prices[stack[top]]) {
            int idx = stack[top--];
            ans[idx] = i - idx;
        }
        stack[++top] = i;
    }
    
    for (int i = 0; i < n; i++) {
        printf("%d%c", ans[i], (i == n - 1) ? '\\n' : ' ');
    }
    
    free(prices);
    free(ans);
    free(stack);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<int> prices(n), ans(n, 0);
    for (int i = 0; i < n; i++) cin >> prices[i];
    
    stack<int> s; // Stores indices
    for (int i = 0; i < n; i++) {
        while (!s.empty() && prices[i] > prices[s.top()]) {
            int idx = s.top();
            s.pop();
            ans[idx] = i - idx;
        }
        s.push(i);
    }
    
    for (int i = 0; i < n; i++) {
        cout << ans[i] << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());
        
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] prices = new int[n];
        int[] ans = new int[n];
        for (int i = 0; i < n; i++) prices[i] = Integer.parseInt(st.nextToken());
        
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && prices[i] > prices[stack.peek()]) {
                int idx = stack.pop();
                ans[idx] = i - idx;
            }
            stack.push(i);
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(ans[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`,
      python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    prices = [int(x) for x in input_data[1:1+n]]
    
    ans = [0] * n
    stack = []  # Stores indices
    
    for i in range(n):
        while stack and prices[i] > prices[stack[-1]]:
            idx = stack.pop()
            ans[idx] = i - idx
        stack.append(i)
        
    print(" ".join(map(str, ans)))

if __name__ == "__main__":
    solve()`,
    },
    testCases: [
      { input: "5\n30 40 50 60 70", expected: "1 1 1 1 0", isHidden: false },
      { input: "4\n73 74 75 71", expected: "1 1 0 0", isHidden: false },
      { input: "6\n80 70 60 50 40 30", expected: "0 0 0 0 0 0", isHidden: true },
      { input: "6\n50 50 50 60 50 70", expected: "3 2 1 2 1 0", isHidden: true },
      { input: "1\n100", expected: "0", isHidden: true },
    ],
  },
];

const SET_B_QUESTIONS = [
  {
    sequence: 1,
    title: "Option 1: The ER Triage Queue",
    difficulty: "Medium",
    statement: `**Narrative:** A hospital emergency room must process patients. Each patient arrives with a \`severity_level\` (1 to 100) and an \`arrival_time\`.
You must output the \`arrival_time\` of the patients in the exact order they should be treated.

**Rule:** Treat the highest \`severity_level\` first. If two patients have the exact same severity, treat the one with the earliest (smaller) \`arrival_time\` first.

**Task:** Read the input and output the space-separated \`arrival_time\` integers in the correct triage treatment order.
*(Hint: Use a custom comparator with \`sort\` / \`qsort\` for $O(N \\log N)$ efficiency).*`,
    inputFormat: "First line contains integer N (number of patients). The next N lines (or space-separated tokens) each contain two integers: severity_level arrival_time.",
    outputFormat: "Space-separated arrival_time values in the order they should be treated.",
    constraints: "1 <= N <= 100,000, 1 <= severity_level <= 100, 0 <= arrival_time <= 10^9",
    sampleInput: "4\n85 10\n60 12\n85 8\n40 15",
    sampleOutput: "8 10 12 15",
    timeLimitMs: 1500,
    starterCodes: {
      c: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int severity;
    int time;
} Patient;

// TODO: Custom comparator: Severity DESC, Time ASC
int comp(const void* a, const void* b) {
    Patient* p1 = (Patient*)a;
    Patient* p2 = (Patient*)b;
    if (p1->severity == p2->severity) {
        return p1->time - p2->time;
    }
    return p2->severity - p1->severity;
}

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    Patient* arr = malloc(n * sizeof(Patient));
    for (int i = 0; i < n; i++) {
        scanf("%d %d", &arr[i].severity, &arr[i].time);
    }
    
    qsort(arr, n, sizeof(Patient), comp);
    
    for (int i = 0; i < n; i++) {
        printf("%d%c", arr[i].time, (i == n - 1) ? '\\n' : ' ');
    }
    free(arr);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Patient {
    int severity;
    int time;
};

// TODO: Custom comparator: Severity DESC, Time ASC
bool comp(const Patient& a, const Patient& b) {
    if (a.severity == b.severity) return a.time < b.time;
    return a.severity > b.severity;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<Patient> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i].severity >> arr[i].time;
    }
    
    sort(arr.begin(), arr.end(), comp);
    
    for (int i = 0; i < n; i++) {
        cout << arr[i].time << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        StringTokenizer st = new StringTokenizer(line);
        int n = Integer.parseInt(st.nextToken());
        
        int[][] patients = new int[n][2];
        for (int i = 0; i < n; i++) {
            while (!st.hasMoreTokens()) {
                String nextLine = br.readLine();
                if (nextLine == null) break;
                st = new StringTokenizer(nextLine);
            }
            patients[i][0] = Integer.parseInt(st.nextToken()); // severity
            patients[i][1] = Integer.parseInt(st.nextToken()); // time
        }
        
        // TODO: Sort patients by Severity DESC, Time ASC
        Arrays.sort(patients, (a, b) -> {
            if (a[0] == b[0]) return Integer.compare(a[1], b[1]);
            return Integer.compare(b[0], a[0]);
        });
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(patients[i][1]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`,
      python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    patients = []
    idx = 1
    for _ in range(n):
        severity = int(input_data[idx])
        time = int(input_data[idx+1])
        patients.append((severity, time))
        idx += 2
        
    # TODO: Sort by severity DESC (-x[0]), time ASC (x[1])
    patients.sort(key=lambda x: (-x[0], x[1]))
    print(" ".join(str(p[1]) for p in patients))

if __name__ == "__main__":
    solve()`,
    },
    testCases: [
      { input: "4\n85 10\n60 12\n85 8\n40 15", expected: "8 10 12 15", isHidden: false },
      { input: "3\n99 50\n99 10\n99 30", expected: "10 30 50", isHidden: false },
      { input: "5\n10 1\n20 2\n30 3\n40 4\n50 5", expected: "5 4 3 2 1", isHidden: true },
      { input: "4\n70 80\n70 40\n80 120\n80 60", expected: "60 120 40 80", isHidden: true },
      { input: "1\n50 1", expected: "1", isHidden: true },
    ],
  },
  {
    sequence: 2,
    title: "Option 2: The Distinct Art Gallery",
    difficulty: "Medium",
    statement: `**Narrative:** An art critic is walking through a gallery of $N$ paintings. Each painting belongs to a specific \`style_id\`. The critic wants to view a continuous row of paintings, but will get bored if they see the same \`style_id\` twice in that row.
Output the length of the **longest contiguous segment** of paintings with absolutely NO duplicate styles.

**Task:** Find the maximum length of a subarray where all elements are distinct.
*(Hint: Use the Sliding Window / Two-Pointer pattern for an optimal $O(N)$ solution).*`,
    inputFormat: "First line: integer N. Second line: N space-separated integers representing style IDs.",
    outputFormat: "A single integer representing the maximum length of a contiguous unique subarray.",
    constraints: "1 <= N <= 100,000, 0 <= style_id <= 10^5",
    sampleInput: "6\n1 2 3 1 2 3",
    sampleOutput: "3",
    timeLimitMs: 1500,
    starterCodes: {
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* arr = malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    
    static int seen[100005] = {0};
    int max_len = 0, left = 0;
    
    for (int right = 0; right < n; right++) {
        seen[arr[right]]++;
        while (seen[arr[right]] > 1) {
            seen[arr[left]]--;
            left++;
        }
        int curr_len = right - left + 1;
        if (curr_len > max_len) max_len = curr_len;
    }
    
    printf("%d\\n", max_len);
    free(arr);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    unordered_set<int> window;
    int maxLen = 0, left = 0;
    
    for (int right = 0; right < n; right++) {
        while (window.count(arr[right])) {
            window.erase(arr[left]);
            left++;
        }
        window.insert(arr[right]);
        maxLen = max(maxLen, right - left + 1);
    }
    
    cout << maxLen << "\\n";
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());
        
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) arr[i] = Integer.parseInt(st.nextToken());
        
        HashSet<Integer> window = new HashSet<>();
        int maxLen = 0, left = 0;
        
        for (int right = 0; right < n; right++) {
            while (window.contains(arr[right])) {
                window.remove(arr[left]);
                left++;
            }
            window.add(arr[right]);
            maxLen = Math.max(maxLen, right - left + 1);
        }
        
        System.out.println(maxLen);
    }
}`,
      python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    arr = [int(x) for x in input_data[1:1+n]]
    
    window = set()
    left = 0
    max_len = 0
    
    for right in range(n):
        while arr[right] in window:
            window.remove(arr[left])
            left += 1
        window.add(arr[right])
        max_len = max(max_len, right - left + 1)
        
    print(max_len)

if __name__ == "__main__":
    solve()`,
    },
    testCases: [
      { input: "6\n1 2 3 1 2 3", expected: "3", isHidden: false },
      { input: "5\n5 5 5 5 5", expected: "1", isHidden: false },
      { input: "7\n1 2 3 4 5 6 7", expected: "7", isHidden: true },
      { input: "7\n2 1 2 4 5 2 1", expected: "4", isHidden: true },
      { input: "1\n100", expected: "1", isHidden: true },
    ],
  },
  {
    sequence: 3,
    title: "Option 3: Next Warmer Day",
    difficulty: "Medium",
    statement: `**Narrative:** You are given an array of $N$ daily temperature forecasts. For each day, output **how many days you have to wait** until a future day is strictly *warmer*. If a warmer day never arrives in the future, output \`0\` for that day.

**Task:** For each index $i$, find the smallest $j > i$ such that $temp[j] > temp[i]$, and output $j - i$. If no such $j$ exists, output $0$.
*(Hint: Use a Monotonic Decreasing Stack of indices for an optimal $O(N)$ solution).*`,
    inputFormat: "First line: integer N. Second line: N space-separated integers representing daily temperatures.",
    outputFormat: "N space-separated integers representing the days to wait for a warmer day.",
    constraints: "1 <= N <= 100,000, -100 <= temps[i] <= 100",
    sampleInput: "6\n13 12 15 11 9 12",
    sampleOutput: "2 1 0 2 1 0",
    timeLimitMs: 1500,
    starterCodes: {
      c: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int* temps = malloc(n * sizeof(int));
    int* ans = calloc(n, sizeof(int));
    int* stack = malloc(n * sizeof(int));
    int top = -1;
    
    for (int i = 0; i < n; i++) {
        scanf("%d", &temps[i]);
        while (top >= 0 && temps[i] > temps[stack[top]]) {
            int idx = stack[top--];
            ans[idx] = i - idx;
        }
        stack[++top] = i;
    }
    
    for (int i = 0; i < n; i++) {
        printf("%d%c", ans[i], (i == n - 1) ? '\\n' : ' ');
    }
    
    free(temps);
    free(ans);
    free(stack);
    return 0;
}`,
      cpp: `#include <iostream>
#include <vector>
#include <stack>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (!(cin >> n)) return 0;
    vector<int> temps(n), ans(n, 0);
    for (int i = 0; i < n; i++) cin >> temps[i];
    
    stack<int> s; // Stores indices
    for (int i = 0; i < n; i++) {
        while (!s.empty() && temps[i] > temps[s.top()]) {
            int idx = s.top();
            s.pop();
            ans[idx] = i - idx;
        }
        s.push(i);
    }
    
    for (int i = 0; i < n; i++) {
        cout << ans[i] << (i == n - 1 ? "" : " ");
    }
    cout << "\\n";
    return 0;
}`,
      java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        int n = Integer.parseInt(line.trim());
        
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] temps = new int[n];
        int[] ans = new int[n];
        for (int i = 0; i < n; i++) temps[i] = Integer.parseInt(st.nextToken());
        
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temps[i] > temps[stack.peek()]) {
                int idx = stack.pop();
                ans[idx] = i - idx;
            }
            stack.push(i);
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(ans[i]).append(i == n - 1 ? "" : " ");
        }
        System.out.println(sb.toString());
    }
}`,
      python: `import sys

def solve():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    n = int(input_data[0])
    temps = [int(x) for x in input_data[1:1+n]]
    
    ans = [0] * n
    stack = []  # Stores indices
    
    for i in range(n):
        while stack and temps[i] > temps[stack[-1]]:
            idx = stack.pop()
            ans[idx] = i - idx
        stack.append(i)
        
    print(" ".join(map(str, ans)))

if __name__ == "__main__":
    solve()`,
    },
    testCases: [
      { input: "6\n13 12 15 11 9 12", expected: "2 1 0 2 1 0", isHidden: false },
      { input: "4\n30 40 50 60", expected: "1 1 1 0", isHidden: false },
      { input: "5\n40 30 20 10 0", expected: "0 0 0 0 0", isHidden: true },
      { input: "5\n25 25 25 26 25", expected: "3 2 1 0 0", isHidden: true },
      { input: "1\n32", expected: "0", isHidden: true },
    ],
  },
];

async function seedRound4() {
  console.log("🌱 Seeding Round 4: Data Structures & Algorithms (TYPE_TRANSFORM)...");

  // 1. Fetch or create Round 4
  const event = await db.event.findFirst({
    where: { id: EVENT_ID },
  });

  if (!event) {
    throw new Error(`Event '${EVENT_ID}' not found! Please run 'npm run db:seed' first.`);
  }

  const round4 = await db.round.upsert({
    where: {
      eventId_sequence: {
        eventId: event.id,
        sequence: 4,
      },
    },
    update: {
      name: "Data Structures & Algorithms",
      type: "TYPE_TRANSFORM",
      durationMin: 45,
      maxScore: 100,
    },
    create: {
      eventId: event.id,
      name: "Data Structures & Algorithms",
      type: "TYPE_TRANSFORM",
      sequence: 4,
      durationMin: 45,
      maxScore: 100,
      status: "DRAFT",
    },
  });

  console.log(`📍 Found/Created Round 4: ${round4.name} (${round4.id})`);

  // 2. Clean existing submissions, questions, and test cases for Round 4
  await db.submission.deleteMany({
    where: { roundId: round4.id },
  });
  await db.testCase.deleteMany({
    where: { problem: { roundId: round4.id } },
  });
  await db.problem.deleteMany({
    where: { roundId: round4.id },
  });

  console.log("🧹 Cleaned old Round 4 questions and test cases.");

  // 3. Seed Set A Questions (3 options)
  for (const q of SET_A_QUESTIONS) {
    const problem = await db.problem.create({
      data: {
        roundId: round4.id,
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

    const scorePerTest = Math.floor(100 / q.testCases.length);
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

    console.log(`✅ Seeded Set A: ${q.title} (${q.difficulty}) with ${q.testCases.length} test cases (100 Points)`);
  }

  // 4. Seed Set B Questions (3 options)
  for (const q of SET_B_QUESTIONS) {
    const problem = await db.problem.create({
      data: {
        roundId: round4.id,
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

    const scorePerTest = Math.floor(100 / q.testCases.length);
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

    console.log(`✅ Seeded Set B: ${q.title} (${q.difficulty}) with ${q.testCases.length} test cases (100 Points)`);
  }

  console.log("🎉 Round 4 Data Structures & Algorithms Successfully Seeded!");
}

seedRound4()
  .catch(console.error)
  .finally(() => db.$disconnect());
