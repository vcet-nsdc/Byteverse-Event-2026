import { db } from "../src/lib/db";

async function cleanProblemStatements() {
  console.log("=== CLEANING PROBLEM STATEMENTS & STARTER CODES ===");

  // 1. Fetch all problems in Round 2, 3, 4
  const problems = await db.problem.findMany({
    include: { round: true },
    where: {
      round: {
        sequence: { in: [2, 3, 4] },
      },
    },
  });

  for (const p of problems) {
    const roundSeq = p.round.sequence;
    let newStatement = p.statement;
    let newStarterCodes: any = p.starterCodes;

    // --- ROUND 2 ---
    if (roundSeq === 2) {
      if (p.title.includes("Summation")) {
        newStatement = `Given a positive integer $N$, calculate and return the sum of the first $N$ natural numbers: $1 + 2 + 3 + \\dots + N$.\n\nYour solution must execute within the time limit for all test cases up to $N = 10^9$.`;
      } else if (p.title.includes("Sorted Checker")) {
        newStatement = `Given an array of $N$ integers, determine whether the array is strictly increasing (i.e. every element is strictly smaller than the element that immediately follows it: $arr[i] < arr[i+1]$).\n\nOutput \`1\` if strictly increasing, or \`0\` otherwise. Your solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("Score Spread")) {
        newStatement = `Given an array of $N$ integers, find and output the maximum difference between any two elements in the array: $\\max(arr) - \\min(arr)$.\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("Max Subarray Signal")) {
        newStatement = `Given an array of $N$ integers and a positive integer $K$, find and output the maximum sum of any contiguous subarray of size $K$.\n\nYour solution must execute within the time limit for all inputs up to $N = 100,000$.`;
      } else if (p.title.includes("Handshake")) {
        newStatement = `Given an integer $N$ representing the number of attendees at an event where every pair of attendees shakes hands with each other exactly once, calculate and output the total number of handshakes that occur.\n\nYour solution must execute within the time limit for all inputs up to $N = 10^9$.`;
      } else if (p.title.includes("Uniform Array")) {
        newStatement = `Given an array of $N$ integers, determine whether all elements in the array are identical.\n\nOutput \`1\` if all elements are identical, or \`0\` otherwise. Your solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("Largest Product")) {
        newStatement = `Given an array of $N$ integers, find and output the maximum product of any two distinct elements in the array.\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("Min Subarray Expense")) {
        newStatement = `Given an array of $N$ integers and a positive integer $K$, find and output the minimum sum of any contiguous subarray of size $K$.\n\nYour solution must execute within the time limit for all inputs up to $N = 100,000$.`;
      }

      // Clean starter codes in Round 2: strip out spoiler comments
      if (newStarterCodes && typeof newStarterCodes === "object") {
        for (const [lang, codeStr] of Object.entries(newStarterCodes)) {
          if (typeof codeStr === "string") {
            newStarterCodes[lang] = codeStr
              .replace(/\/\/ Naive O\(.*?\)[^\n]*\n?/gi, "")
              .replace(/\/\/ TODO: Optimize[^\n]*\n?/gi, "")
              .replace(/# Naive O\(.*?\)[^\n]*\n?/gi, "")
              .replace(/# TODO: Optimize[^\n]*\n?/gi, "")
              .trim();
          }
        }
      }
    }

    // --- ROUND 3 ---
    if (roundSeq === 3) {
      if (p.title.includes("Last Occurrence")) {
        newStatement = `Given an array of $N$ integers and an integer \`target\`, find and return the last 0-based index where \`target\` appears in the array. If \`target\` is not found, return \`-1\`.\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("Sales Streak")) {
        newStatement = `Given an array of $N$ integers representing daily numbers, find and return the maximum length of any contiguous sequence of strictly positive elements ($> 0$). If no positive numbers exist, return \`0\`.\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("First Vowel")) {
        newStatement = `Given a string $S$ consisting of lowercase English letters, find and return the 0-based index of the first vowel (\`a\`, \`e\`, \`i\`, \`o\`, \`u\`). If the string contains no vowels, return \`-1\`.\n\nYour solution must execute within the time limit for strings up to length $100,000$.`;
      } else if (p.title.includes("Adjacent Duplicates")) {
        newStatement = `Given an array of $N$ integers, count and output the number of positions $i$ where the element is equal to the element immediately following it ($arr[i] == arr[i+1]$).\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      }

      // Clean starter codes in Round 3: strip out spoiler comments
      if (newStarterCodes && typeof newStarterCodes === "object") {
        for (const [lang, codeStr] of Object.entries(newStarterCodes)) {
          if (typeof codeStr === "string") {
            newStarterCodes[lang] = codeStr
              .replace(/\/\/ Task: Locate and fix[^\n]*\n?/gi, "")
              .replace(/# Task: Locate and fix[^\n]*\n?/gi, "")
              .trim();
          }
        }
      }
    }

    // --- ROUND 4 ---
    if (roundSeq === 4) {
      if (p.title.includes("Bug Queue") || p.title.includes("Triage Queue")) {
        newStatement = `You are given $N$ tasks. Each task has a \`priority_score\` (1 to 100) and an \`arrival_time\`.\n\nTasks must be processed according to the following rules:\n1. Tasks with higher \`priority_score\` are processed first.\n2. If two tasks have the same \`priority_score\`, the task with the earlier (smaller) \`arrival_time\` is processed first.\n\nOutput the space-separated \`arrival_time\` of each task in the exact order they should be processed.`;
      } else if (p.title.includes("Art Gallery") || p.title.includes("Unique Playlist")) {
        newStatement = `Given an array of $N$ integers, find and output the length of the longest contiguous subarray that contains no duplicate values.\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      } else if (p.title.includes("Warmer Day") || p.title.includes("Highest Stock Price")) {
        newStatement = `Given an array of $N$ integers representing daily measurements, for each day output how many days you must wait until a strictly higher measurement occurs. If no future day has a higher value, output \`0\` for that day.\n\nYour solution must execute within the time limit for arrays up to $N = 100,000$.`;
      }

      // Clean starter codes in Round 4
      if (newStarterCodes && typeof newStarterCodes === "object") {
        for (const [lang, codeStr] of Object.entries(newStarterCodes)) {
          if (typeof codeStr === "string") {
            newStarterCodes[lang] = codeStr
              .replace(/\/\*\(Hint:[^\n]*\n?/gi, "")
              .replace(/\/\/ TODO: Implement[^\n]*\n?/gi, "")
              .trim();
          }
        }
      }
    }

    await db.problem.update({
      where: { id: p.id },
      data: {
        statement: newStatement,
        starterCodes: newStarterCodes,
      },
    });

    console.log(`Updated R${roundSeq} problem: ${p.title}`);
  }

  console.log("=== ALL PROBLEMS UPDATED SUCCESSFULLY ===");
  process.exit(0);
}

cleanProblemStatements().catch((err) => {
  console.error("Error cleaning problems:", err);
  process.exit(1);
});
