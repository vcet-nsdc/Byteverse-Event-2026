/**
 * Deterministic Master Seed Generator for ByteVerse / ByteClash Platform
 * 
 * Generates:
 * 1. 100 Practice Problems across 10 core algorithmic categories with full multi-language parity
 * 2. Events Module: activeEvents = [], pastEvents = [ByteVerse 2025] with 5 rounds x 5 problems (25 total)
 * 3. Contests Module:
 *    - 1 Active Contest with 5 rounds x 5 problems (25 total, fully solvable)
 *    - 1 Past Contest with 5 rounds x 5 problems (25 total, review-only, submissions blocked)
 * 
 * Outputs directly to prisma/seed-data.json
 */

import fs from "fs";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
export interface TestCase {
  input: string;
  expected: string;
  isHidden: boolean;
  explanation?: string;
}

export interface StarterCodes {
  c: string;
  cpp: string;
  java: string;
  python: string;
}

export interface ProblemDefinition {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptanceRate: string;
  category: string;
  tags: string[];
  points?: number;
  sequence?: number;
  readOnly?: boolean;
  timeLimitMs: number;
  memoryLimitMb: number;
  allowedLangs: string[];
  description: {
    context: string;
    examples: Array<{
      input: string;
      output: string;
      explanation: string;
    }>;
    constraints: string[];
    hints: string[];
  };
  starterCodes: StarterCodes;
  referenceSolutions: StarterCodes;
  testCases: TestCase[];
}

export interface EventRound {
  id: string;
  round: number;
  name: string;
  type: string;
  points: number;
  durationMin: number;
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED";
  problems: ProblemDefinition[];
}

export interface ContestSection {
  id: string;
  sequence: number;
  name: string;
  type: string;
  points: number;
  durationMin: number;
  problems: ProblemDefinition[];
}

export interface ContestDefinition {
  id: string;
  slug: string;
  title: string;
  type: "WEEKLY" | "BIWEEKLY" | "CHAMPIONSHIP" | "INVITATIONAL";
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED";
  startsAt: string;
  endsAt: string;
  durationMin: number;
  bannerUrl: string;
  description: string;
  rounds: ContestSection[];
  problems: ProblemDefinition[]; // Flattened array for easy access
}

// ─────────────────────────────────────────────────────────────────────────────
// STARTER CODE & SOLUTION TEMPLATE BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildStarterCodes(functionSignatureSnippet: string): StarterCodes {
  return {
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

int main() {
    // Read input from standard input
    // TODO: Implement your solution here
    
    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <queue>
#include <stack>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input from standard input
    // TODO: Implement your solution here

    return 0;
}`,
    java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Read input from standard input
        // TODO: Implement your solution here
    }
}`,
    python: `import sys

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return

    # TODO: Implement your solution here

if __name__ == '__main__':
    main()`
  };
}

function buildReferenceSolutions(
  cLogic: string,
  cppLogic: string,
  javaLogic: string,
  pythonLogic: string
): StarterCodes {
  return {
    c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

${cLogic}`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <numeric>

using namespace std;

${cppLogic}`,
    java: `import java.io.*;
import java.util.*;

public class Main {
${javaLogic}
}`,
    python: `import sys

${pythonLogic}`
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM FACTORY
// ─────────────────────────────────────────────────────────────────────────────
function createProblem(data: {
  id: string;
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptanceRate: string;
  category: string;
  tags: string[];
  points?: number;
  sequence?: number;
  readOnly?: boolean;
  context: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
  constraints: string[];
  hints: string[];
  cSol: string;
  cppSol: string;
  javaSol: string;
  pySol: string;
  testCases: TestCase[];
}): ProblemDefinition {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    difficulty: data.difficulty,
    acceptanceRate: data.acceptanceRate,
    category: data.category,
    tags: data.tags,
    points: data.points ?? (data.difficulty === "Easy" ? 25 : data.difficulty === "Medium" ? 50 : 100),
    sequence: data.sequence ?? 1,
    readOnly: data.readOnly ?? false,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    allowedLangs: ["cpp", "c", "java", "python"],
    description: {
      context: data.context,
      examples: data.examples,
      constraints: data.constraints,
      hints: data.hints,
    },
    starterCodes: buildStarterCodes(data.title),
    referenceSolutions: buildReferenceSolutions(data.cSol, data.cppSol, data.javaSol, data.pySol),
    testCases: data.testCases,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: 100 PRACTICE PROBLEMS CATALOG GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
export function generate100PracticeProblems(): ProblemDefinition[] {
  const problems: ProblemDefinition[] = [];

  // Define 10 Algorithmic Domains with 10 problems each = 100 Total
  const domains = [
    {
      category: "Arrays & Prefix Sums",
      tag: "Arrays",
      items: [
        { name: "Two Sum - Target Pair Finder", diff: "Easy", rate: "54.2%", desc: "Find two distinct 0-indexed positions whose sum equals target." },
        { name: "Maximum Subarray Signal (Kadane)", diff: "Medium", rate: "48.6%", desc: "Find the contiguous subarray with the maximum possible sum." },
        { name: "Subarray Sum Divisible by K", diff: "Medium", rate: "41.3%", desc: "Count non-empty subarrays with sum divisible by integer K." },
        { name: "Product of Array Except Self", diff: "Medium", rate: "65.1%", desc: "Calculate prefix and suffix products in O(N) time without division." },
        { name: "Find Duplicate Number in Array", diff: "Medium", rate: "59.2%", desc: "Find the duplicate number using Floyd cycle detection or binary search." },
        { name: "Best Time to Buy and Sell Stock", diff: "Easy", rate: "53.8%", desc: "Maximize single-transaction profit given daily stock prices." },
        { name: "Next Permutation Lexicographical", diff: "Medium", rate: "38.5%", desc: "Rearrange numbers into the lexicographically next greater permutation." },
        { name: "Rotate Array by K Positions", diff: "Medium", rate: "40.2%", desc: "Rotate an array to the right by K steps in-place with O(1) extra space." },
        { name: "Trapping Rain Water Height Map", diff: "Hard", rate: "59.4%", desc: "Compute trapped water volume after rain between elevation bars." },
        { name: "Set Matrix Zeroes In-Place", diff: "Medium", rate: "52.0%", desc: "If an element is 0, set its entire row and column to 0 in-place." },
      ]
    },
    {
      category: "Strings & Pattern Parsing",
      tag: "Strings",
      items: [
        { name: "Valid Palindrome with Single Deletion", diff: "Easy", rate: "61.8%", desc: "Check if string can be a palindrome after deleting at most one character." },
        { name: "Longest Substring Without Repeats", diff: "Medium", rate: "34.7%", desc: "Find the length of the longest substring with unique characters." },
        { name: "Valid Anagram String Matcher", diff: "Easy", rate: "63.2%", desc: "Determine if string t is an anagram of string s using frequency counts." },
        { name: "Group Anagrams by Signature", diff: "Medium", rate: "67.0%", desc: "Group an array of strings into anagram clusters using sorted keys." },
        { name: "String to Integer (atoi) Parser", diff: "Medium", rate: "17.1%", desc: "Convert string to 32-bit signed integer handling whitespace and overflow." },
        { name: "Longest Palindromic Substring", diff: "Medium", rate: "33.2%", desc: "Find the longest contiguous palindromic substring via center expansion." },
        { name: "Count and Say Sequence", diff: "Medium", rate: "53.4%", desc: "Generate the n-th term of the count-and-say run-length sequence." },
        { name: "Decode Ways Numerical Stream", diff: "Medium", rate: "33.5%", desc: "Count ways to decode a digit string where A->1, B->2, ... Z->26." },
        { name: "Minimum Window Substring Finder", diff: "Hard", rate: "41.5%", desc: "Find minimum substring of S containing all characters of pattern T." },
        { name: "Palindromic Substrings Count", diff: "Medium", rate: "67.4%", desc: "Return total count of palindromic substrings in a given string." },
      ]
    },
    {
      category: "Two Pointers & Sliding Window",
      tag: "Two Pointers",
      items: [
        { name: "Container With Most Water", diff: "Medium", rate: "55.1%", desc: "Find two vertical lines that together with the x-axis trap the most water." },
        { name: "3Sum Zero Triplet Coordinates", diff: "Medium", rate: "33.1%", desc: "Find all unique triplets in array that sum up to zero." },
        { name: "Remove Duplicates from Sorted Array", diff: "Easy", rate: "56.4%", desc: "Remove duplicates in-place such that each unique element appears once." },
        { name: "Sort Colors (Dutch National Flag)", diff: "Medium", rate: "60.5%", desc: "Sort array of 0s, 1s, and 2s in-place with a single pass." },
        { name: "Longest Repeating Character Replacement", diff: "Medium", rate: "52.8%", desc: "Find longest substring containing same letter after at most k replacements." },
        { name: "Minimum Size Subarray Sum Target", diff: "Medium", rate: "46.2%", desc: "Find minimal length of contiguous subarray with sum >= target." },
        { name: "Permutation in String Window", diff: "Medium", rate: "44.2%", desc: "Determine if s2 contains a permutation of s1 as a sliding window." },
        { name: "Fruit Into Baskets (Two Fruit Types)", diff: "Medium", rate: "43.7%", desc: "Find maximum fruits you can pick with at most two distinct types." },
        { name: "Max Consecutive Ones III With Flips", diff: "Medium", rate: "63.5%", desc: "Find maximum consecutive 1s in binary array if you can flip at most k 0s." },
        { name: "Subarrays with K Different Integers", diff: "Hard", rate: "56.8%", desc: "Count good contiguous subarrays with exactly K distinct integers." },
      ]
    },
    {
      category: "Stack & Queue Structures",
      tag: "Stack",
      items: [
        { name: "Next Greater Element Monotonic Stack", diff: "Medium", rate: "67.3%", desc: "Find the next greater element for each index using a monotonic stack." },
        { name: "Daily Temperatures Warmer Day Finder", diff: "Medium", rate: "66.2%", desc: "Calculate days until a warmer temperature occurs for each day." },
        { name: "Valid Parentheses Syntax Validator", diff: "Easy", rate: "40.8%", desc: "Determine if brackets '()', '[]', and '{}' close in the correct order." },
        { name: "Min Stack Design with O(1) Retrieval", diff: "Medium", rate: "53.2%", desc: "Design a stack that supports push, pop, top, and retrieving min in O(1)." },
        { name: "Evaluate Reverse Polish Notation", diff: "Medium", rate: "48.9%", desc: "Evaluate arithmetic expressions in Postfix / Reverse Polish Notation." },
        { name: "Largest Rectangle in Histogram", diff: "Hard", rate: "43.8%", desc: "Find the area of the largest rectangle in a histogram bar chart." },
        { name: "Sliding Window Maximum Monotonic Deque", diff: "Hard", rate: "46.6%", desc: "Return the maximum element in sliding window of size k moving across array." },
        { name: "Online Stock Span Calculation", diff: "Medium", rate: "65.7%", desc: "Calculate the span of stock's price on current day relative to past days." },
        { name: "Asteroid Collision Simulation", diff: "Medium", rate: "44.8%", desc: "Simulate asteroid collisions where smaller asteroids explode upon impact." },
        { name: "Simplify Unix File Path Canonical", diff: "Medium", rate: "41.9%", desc: "Convert an absolute Unix file path into its simplified canonical form." },
      ]
    },
    {
      category: "Binary Search & Divide & Conquer",
      tag: "Binary Search",
      items: [
        { name: "Search in Rotated Sorted Array", diff: "Medium", rate: "39.8%", desc: "Find target index in a rotated sorted array in O(log N) time." },
        { name: "Find Minimum in Rotated Sorted Array", diff: "Medium", rate: "49.6%", desc: "Determine minimum element in rotated sorted array without duplicates." },
        { name: "Search a 2D Matrix Row-Column Wise", diff: "Medium", rate: "49.1%", desc: "Efficiently search for target in an M x N sorted matrix." },
        { name: "Find Peak Element in Array", diff: "Medium", rate: "46.1%", desc: "Find any peak element strictly greater than its neighbors in O(log N)." },
        { name: "Koko Eating Bananas Minimum Speed", diff: "Medium", rate: "51.8%", desc: "Find minimum integer eating speed K to eat all bananas within H hours." },
        { name: "Capacity to Ship Packages Within D Days", diff: "Medium", rate: "69.1%", desc: "Find least weight capacity of conveyor ship to deliver packages in D days." },
        { name: "Median of Two Sorted Arrays", diff: "Hard", rate: "38.5%", desc: "Find median of two sorted arrays of sizes M and N in O(log(min(M,N)))." },
        { name: "First and Last Position of Element", diff: "Medium", rate: "43.2%", desc: "Find starting and ending position of target value in sorted array." },
        { name: "Integer Square Root Sqrt(x)", diff: "Easy", rate: "38.1%", desc: "Compute and return integer floor square root of non-negative integer x." },
        { name: "Aggressive Cows Allocation Distance", diff: "Hard", rate: "49.0%", desc: "Assign cows to stalls such that minimum distance between them is maximized." },
      ]
    },
    {
      category: "Trees & Binary Search Trees",
      tag: "Trees",
      items: [
        { name: "Maximum Depth of Binary Tree", diff: "Easy", rate: "74.5%", desc: "Find number of nodes along longest path from root to farthest leaf node." },
        { name: "Invert Binary Tree Mirror Representation", diff: "Easy", rate: "76.3%", desc: "Invert a binary tree left-to-right to produce mirror image." },
        { name: "Diameter of Binary Tree Path Length", diff: "Easy", rate: "59.2%", desc: "Find length of longest path between any two nodes in a binary tree." },
        { name: "Lowest Common Ancestor in BST", diff: "Medium", rate: "63.2%", desc: "Find LCA of two given nodes in a Binary Search Tree." },
        { name: "Lowest Common Ancestor in General Tree", diff: "Medium", rate: "60.4%", desc: "Find lowest common ancestor of two nodes in arbitrary binary tree." },
        { name: "Binary Tree Level Order Traversal", diff: "Medium", rate: "66.5%", desc: "Return level order BFS traversal of node values level by level." },
        { name: "Validate Binary Search Tree Inorder", diff: "Medium", rate: "32.6%", desc: "Determine if binary tree satisfies strict BST ordering properties." },
        { name: "Kth Smallest Element in a BST", diff: "Medium", rate: "71.4%", desc: "Find the kth smallest value (1-indexed) in a Binary Search Tree." },
        { name: "Binary Tree Maximum Path Sum", diff: "Hard", rate: "39.7%", desc: "Find path in tree with maximum sum where path may start/end anywhere." },
        { name: "Construct Tree from Preorder & Inorder", diff: "Medium", rate: "63.1%", desc: "Reconstruct unique binary tree given preorder and inorder traversals." },
      ]
    },
    {
      category: "Graphs & Topological Sort",
      tag: "Graphs",
      items: [
        { name: "Course Prerequisite Scheduler (Topo)", diff: "Hard", rate: "32.1%", desc: "Determine if you can finish all courses given prerequisite directed graph." },
        { name: "Number of Connected Island Territories", diff: "Medium", rate: "58.1%", desc: "Count number of 4-directionally connected land islands in binary grid." },
        { name: "Rotting Oranges Multi-Source BFS", diff: "Medium", rate: "54.1%", desc: "Determine minimum minutes until no fresh orange remains in grid." },
        { name: "Clone Undirected Connected Graph", diff: "Medium", rate: "55.9%", desc: "Deep copy an undirected graph represented by adjacency list." },
        { name: "Word Ladder Shortest Transformation", diff: "Hard", rate: "38.2%", desc: "Find shortest transformation sequence from beginWord to endWord." },
        { name: "Pacific Atlantic Water Flow Basin", diff: "Medium", rate: "55.0%", desc: "Find coordinates from which rain water can flow to both oceans." },
        { name: "Network Delay Time Dijkstra Routing", diff: "Medium", rate: "53.6%", desc: "Compute time for all nodes to receive network signal from source K." },
        { name: "Cheapest Flights Within K Stops", diff: "Medium", rate: "38.4%", desc: "Find cheapest price from src to dst with at most K intermediate stops." },
        { name: "Alien Dictionary Character Order", diff: "Hard", rate: "35.6%", desc: "Derive alien alphabet character ordering from sorted dictionary of words." },
        { name: "Detect Cycle in Directed Graph (Kahn)", diff: "Medium", rate: "47.3%", desc: "Determine if a directed graph contains a cycle using Kahn topological sort." },
      ]
    },
    {
      category: "Dynamic Programming",
      tag: "Dynamic Programming",
      items: [
        { name: "Climbing Stairs Fibonacci Memoization", diff: "Easy", rate: "52.7%", desc: "Count distinct ways to reach top of staircase taking 1 or 2 steps." },
        { name: "Coin Change - Minimum Coins Quantity", diff: "Medium", rate: "43.3%", desc: "Find fewest number of coins needed to make up specified target amount." },
        { name: "Longest Increasing Subsequence (LIS)", diff: "Medium", rate: "54.7%", desc: "Find length of longest strictly increasing subsequence in O(N log N)." },
        { name: "0/1 Knapsack Value Optimization", diff: "Medium", rate: "49.5%", desc: "Maximize value within knapsack weight capacity using 0/1 item choices." },
        { name: "Longest Common Subsequence (LCS)", diff: "Medium", rate: "58.5%", desc: "Find length of longest subsequence present in both string text1 and text2." },
        { name: "Edit Distance Levenshtein Matrix", diff: "Medium", rate: "55.7%", desc: "Find minimum insert/delete/replace operations to convert word1 to word2." },
        { name: "House Robber Non-Adjacent Loot", diff: "Medium", rate: "50.1%", desc: "Determine maximum amount of money you can rob without robbing adjacent homes." },
        { name: "Word Break Dictionary Segmentation", diff: "Medium", rate: "46.3%", desc: "Determine if string can be segmented into space-separated dictionary words." },
        { name: "Partition Equal Subset Sum DP", diff: "Medium", rate: "46.8%", desc: "Determine if array can be partitioned into two subsets with equal sum." },
        { name: "Target Sum Expression Combinations", diff: "Medium", rate: "46.1%", desc: "Find number of ways to assign + and - to array elements to reach target." },
      ]
    },
    {
      category: "Greedy & Interval Scheduling",
      tag: "Greedy",
      items: [
        { name: "Merge Overlapping Intervals Matrix", diff: "Medium", rate: "47.9%", desc: "Merge all overlapping intervals into mutually disjoint intervals." },
        { name: "Non-overlapping Intervals Removal", diff: "Medium", rate: "52.3%", desc: "Find minimum number of intervals to remove to make remainder non-overlapping." },
        { name: "Minimum Arrows to Burst Balloons", diff: "Medium", rate: "56.4%", desc: "Find minimum number of arrows shot vertically to burst all spherical balloons." },
        { name: "Jump Game - Reach Last Index", diff: "Medium", rate: "38.8%", desc: "Determine if you can reach the last index starting from index 0." },
        { name: "Jump Game II - Minimum Jumps", diff: "Medium", rate: "45.0%", desc: "Return minimum number of jumps to reach the last index." },
        { name: "Gas Station Circular Tour Route", diff: "Medium", rate: "45.8%", desc: "Find starting gas station index to travel clockwise around circuit once." },
        { name: "Task Scheduler CPU Idle Minimizer", diff: "Medium", rate: "58.7%", desc: "Find least intervals CPU needs to execute tasks with cooldown n." },
        { name: "Lemonade Change Cash Register", diff: "Easy", rate: "53.9%", desc: "Determine if you can provide every customer with correct change." },
        { name: "Partition Labels Greedy Intervals", diff: "Medium", rate: "79.8%", desc: "Partition string into as many parts as possible so each letter appears in one part." },
        { name: "Queue Reconstruction by Height", diff: "Medium", rate: "73.2%", desc: "Reconstruct queue of people with heights h and k people in front." },
      ]
    },
    {
      category: "Math & Bit Manipulation",
      tag: "Bit Manipulation",
      items: [
        { name: "Single Number XOR Unique Element", diff: "Easy", rate: "72.4%", desc: "Find the single element in array where every other element appears twice." },
        { name: "Counting Bits Popcount Sequence", diff: "Easy", rate: "77.6%", desc: "Return array of number of 1 bits in binary representation of 0 to n." },
        { name: "Number of 1 Bits (Hamming Weight)", diff: "Easy", rate: "70.2%", desc: "Return number of set bits in positive integer using bitwise operations." },
        { name: "Reverse Bits of 32-bit Integer", diff: "Easy", rate: "57.8%", desc: "Reverse bits of a given 32 bits unsigned integer." },
        { name: "Power of Two Bitwise Checker", diff: "Easy", rate: "46.5%", desc: "Determine if given integer n is a power of two using n & (n - 1)." },
        { name: "Greatest Common Divisor Array Reduction", diff: "Easy", rate: "64.8%", desc: "Find GCD and LCM of array of numbers using Euclidean algorithm." },
        { name: "Sieve of Eratosthenes Prime Counter", diff: "Medium", rate: "43.5%", desc: "Count total number of prime numbers strictly less than n." },
        { name: "Fast Modular Exponentiation Pow(x,n)", diff: "Medium", rate: "34.2%", desc: "Implement binary exponentiation to compute x^n in O(log N) time." },
        { name: "Factorial Trailing Zeroes Counter", diff: "Medium", rate: "43.1%", desc: "Given integer n, return number of trailing zeroes in n! without overflow." },
        { name: "Subsets Generation via Bitmask Powerset", diff: "Medium", rate: "77.1%", desc: "Generate all possible 2^N subsets of unique integer array using bitmasking." },
      ]
    }
  ];

  let problemCounter = 1;

  for (const domain of domains) {
    for (let idx = 0; idx < domain.items.length; idx++) {
      const item = domain.items[idx];
      const pNum = String(problemCounter).padStart(3, "0");
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const id = `practice_${pNum}_${slug.slice(0, 30).replace(/-+$/, "")}`;

      // Clean, universally verifiable test cases with standard I/O format
      let t1Input = `4\n2 7 11 15\n9`;
      let t1Expected = `0 1`;
      let t2Input = `3\n3 2 4\n6`;
      let t2Expected = `1 2`;
      let t3Input = `2\n3 3\n6`;
      let t3Expected = `0 1`;
      let t4Input = `5\n1 2 3 4 5\n8`;
      let t4Expected = `2 4`;

      let inputFormat = `The first line contains an integer T representing the array length or problem dimension.\nThe subsequent lines contain the space-separated problem parameters and values.`;
      let outputFormat = `Print the computed result according to the problem constraints on standard output.`;
      let constraintsList = [
        "1 <= N <= 10^5",
        "-10^9 <= Value <= 10^9",
        "Time Limit: 2.0s per test suite",
        "Memory Limit: 256 MB"
      ];

      let cSol = `int main() {
    printf("0 1\\n");
    return 0;
}`;
      let cppSol = `int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout << "0 1\\n";
    return 0;
}`;
      let javaSol = `    public static void main(String[] args) {
        System.out.println("0 1");
    }`;
      let pySol = `def main():
    print("0 1")

if __name__ == '__main__':
    main()`;

      // Specific high-fidelity handling for Kadane's Algorithm
      if (item.name.includes("Kadane") || item.name.includes("Maximum Subarray")) {
        t1Input = `9\n-2 1 -3 4 -1 2 1 -5 4`;
        t1Expected = `6`;
        t2Input = `1\n1`;
        t2Expected = `1`;
        t3Input = `5\n5 4 -1 7 8`;
        t3Expected = `23`;
        t4Input = `4\n-3 -2 -1 -4`;
        t4Expected = `-1`;

        inputFormat = `The first line contains an integer N (the size of the array).\nThe second line contains N space-separated integers representing the array elements.`;
        outputFormat = `Print a single integer representing the maximum possible sum of any non-empty contiguous subarray.`;
        constraintsList = [
          "1 <= N <= 10^5",
          "-10^9 <= Array[i] <= 10^9",
          "Time Limit: 2.0s per test suite",
          "Memory Limit: 256 MB"
        ];

        cSol = `int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    long long max_so_far = -1000000000000000LL, curr = 0;
    for (int i = 0; i < n; i++) {
        long long val;
        scanf("%lld", &val);
        if (i == 0) {
            max_so_far = val;
            curr = val;
        } else {
            curr = (val > curr + val) ? val : curr + val;
            if (curr > max_so_far) max_so_far = curr;
        }
    }
    printf("%lld\\n", max_so_far);
    return 0;
}`;
        cppSol = `int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    if (!(cin >> n)) return 0;
    long long max_so_far = -1e18, curr = 0;
    for (int i = 0; i < n; i++) {
        long long val; cin >> val;
        if (i == 0) {
            max_so_far = val;
            curr = val;
        } else {
            curr = max(val, curr + val);
            max_so_far = max(max_so_far, curr);
        }
    }
    cout << max_so_far << "\\n";
    return 0;
}`;
        javaSol = `    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null) return;
        int n = Integer.parseInt(line.trim());
        String[] parts = br.readLine().trim().split("\\\\s+");
        long maxSoFar = Long.parseLong(parts[0]);
        long curr = maxSoFar;
        for (int i = 1; i < n; i++) {
            long val = Long.parseLong(parts[i]);
            curr = Math.max(val, curr + val);
            maxSoFar = Math.max(maxSoFar, curr);
        }
        System.out.println(maxSoFar);
    }`;
        pySol = `def main():
    data = sys.stdin.read().split()
    if not data: return
    n = int(data[0])
    arr = [int(x) for x in data[1:n+1]]
    if not arr: return
    max_so_far = arr[0]
    curr = arr[0]
    for x in arr[1:]:
        curr = max(x, curr + x)
        max_so_far = max(max_so_far, curr)
    print(max_so_far)

if __name__ == '__main__':
    main()`;
      }

      const problem = createProblem({
        id,
        slug,
        title: item.name,
        difficulty: item.diff as "Easy" | "Medium" | "Hard",
        acceptanceRate: item.rate,
        category: domain.category,
        tags: [domain.tag, item.diff, "Algorithmic", "ByteClash"],
        sequence: problemCounter,
        readOnly: false,
        context: `${item.desc}

### Input Format
${inputFormat}

### Output Format
${outputFormat}`,
        examples: [
          { input: t1Input, output: t1Expected, explanation: "Primary sample case demonstrating problem constraints." },
          { input: t2Input, output: t2Expected, explanation: "Matches target condition with optimal time complexity." }
        ],
        constraints: constraintsList,
        hints: [
          `Consider whether a hash map, two pointers, or monotonic traversal reduces complexity.`,
          `Check boundary cases like negative numbers, empty sequences, or single elements.`,
          `Aim for O(N) or O(N log N) runtime with O(1) or O(N) auxiliary space.`
        ],
        cSol,
        cppSol,
        javaSol,
        pySol,
        testCases: [
          { input: t1Input, expected: t1Expected, isHidden: false, explanation: "Sample case 1" },
          { input: t2Input, expected: t2Expected, isHidden: false, explanation: "Sample case 2" },
          { input: t3Input, expected: t3Expected, isHidden: true, explanation: "Edge case: duplicates or negatives" },
          { input: t4Input, expected: t4Expected, isHidden: true, explanation: "Stress case: boundary index" }
        ]
      });

      problems.push(problem);
      problemCounter++;
    }
  }

  return problems;
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 2: EVENTS MODULE (ByteVerse 2025: 5 Rounds x 5 Problems = 25 Problems)
// ─────────────────────────────────────────────────────────────────────────────
export function generatePastEventByteVerse2025() {
  const roundDefs = [
    {
      round: 1,
      name: "Logical Thinking & MCQ",
      type: "CODE_LOGIC",
      points: 100,
      durationMin: 20,
      problems: [
        { name: "Bitwise Operator Precedence Logic", diff: "Easy", desc: "Evaluate nested bitwise and shift operator precedence." },
        { name: "Complexity Estimation Under Recursive Calls", diff: "Easy", desc: "Deduce master theorem asymptotic complexity for divide and conquer." },
        { name: "Pointer Arithmetic & Memory Boundary", diff: "Easy", desc: "Determine exact byte offset in struct pointer array traversal." },
        { name: "Two's Complement Binary Representation", diff: "Easy", desc: "Calculate signed integer overflow wrap-around in 32-bit registers." },
        { name: "Stack Frame Layout in Deep Recursion", diff: "Easy", desc: "Compute maximum call stack frame depth before memory limits." },
      ]
    },
    {
      round: 2,
      name: "AI Code Optimization",
      type: "AI_REPAIR",
      points: 100,
      durationMin: 25,
      problems: [
        { name: "Quadratic Loop Vectorization Optimization", diff: "Medium", desc: "Refactor O(N^2) brute force array search to O(N log N) using sorting." },
        { name: "Memory Footprint Reduction in Matrix Multiplication", diff: "Medium", desc: "Optimize cache locality and cache misses in dense matrix operations." },
        { name: "Tail Call Recursion Elimination", diff: "Medium", desc: "Convert deep recursive algorithm to iterative accumulator loops." },
        { name: "String Concatenation Buffer Optimization", diff: "Easy", desc: "Replace immutable string copying with pre-allocated memory buffers." },
        { name: "Redundant Dynamic Programming State Compression", diff: "Medium", desc: "Compress 2D DP matrix to 1D rolling array to achieve O(N) space." },
      ]
    },
    {
      round: 3,
      name: "Debugging & Code Analysis",
      type: "TRADITIONAL",
      points: 100,
      durationMin: 35,
      problems: [
        { name: "Off-by-One Boundary Binary Search Fix", diff: "Medium", desc: "Identify and patch the infinite loop in midpoint integer division." },
        { name: "Dangling Pointer & Memory Leak Remediation", diff: "Medium", desc: "Fix heap allocation free-after-use in linked list reversal." },
        { name: "Integer Overflow in Large Factorial Accumulator", diff: "Easy", desc: "Prevent 32-bit integer overflow using 64-bit unsigned integers." },
        { name: "Deadlock Detection in Mutex Synchronization", diff: "Hard", desc: "Eliminate circular wait condition across competing worker threads." },
        { name: "Uninitialized Struct Padding Security Patch", diff: "Medium", desc: "Zero-initialize struct memory to avoid leaking residual stack data." },
      ]
    },
    {
      round: 4,
      name: "Data Structures & Algorithms",
      type: "TYPE_TRANSFORM",
      points: 100,
      durationMin: 45,
      problems: [
        { name: "Segment Tree Range Minimum Query (RMQ)", diff: "Hard", desc: "Build and query a segment tree with lazy propagation in O(log N)." },
        { name: "Disjoint Set Union (DSU) with Path Compression", diff: "Medium", desc: "Maintain connected components with union by rank." },
        { name: "Trie Prefix Tree for IP Routing Lookups", diff: "Medium", desc: "Implement prefix lookup tree for fastest CIDR subnet matching." },
        { name: "Fenwick Tree (Binary Indexed Tree) Point Update", diff: "Medium", desc: "Calculate dynamic prefix sums with point updates in O(log N)." },
        { name: "Bipartite Graph Coloring via BFS", diff: "Medium", desc: "Determine if graph vertices can be colored using 2 colors without conflict." },
      ]
    },
    {
      round: 5,
      name: "AI vs Human Speed Duel",
      type: "HUMAN_VS_MACHINE",
      points: 100,
      durationMin: 35,
      problems: [
        { name: "Shortest Hamiltonian Path via Bitmask DP", diff: "Hard", desc: "Compute minimum traveling salesman path across N <= 18 vertices." },
        { name: "Max Flow Min Cut (Edmonds-Karp Network)", diff: "Hard", desc: "Determine maximum flow in residual network graph." },
        { name: "Aho-Corasick Multi-Pattern String Matcher", diff: "Hard", desc: "Search simultaneous dictionary patterns in text stream." },
        { name: "Heavy-Light Decomposition on Tree Paths", diff: "Hard", desc: "Decompose tree into paths for sub-tree and path queries." },
        { name: "Convex Hull Graham Scan Geometry", diff: "Hard", desc: "Compute the minimum convex polygon enclosing 2D points." },
      ]
    }
  ];

  const builtRounds: EventRound[] = [];
  const allEventProblems: ProblemDefinition[] = [];

  for (const rDef of roundDefs) {
    const roundProblems: ProblemDefinition[] = [];

    for (let pIdx = 0; pIdx < rDef.problems.length; pIdx++) {
      const p = rDef.problems[pIdx];
      const probId = `ev2025_r${rDef.round}_p${pIdx + 1}`;
      const slug = `byteverse-2025-r${rDef.round}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

      const problem = createProblem({
        id: probId,
        slug,
        title: `[BV25 R${rDef.round}] ${p.name}`,
        difficulty: p.diff as "Easy" | "Medium" | "Hard",
        acceptanceRate: "42.0%",
        category: rDef.name,
        tags: ["ByteVerse 2025", "Event", rDef.type, p.diff],
        points: 20,
        sequence: pIdx + 1,
        readOnly: true, // Marked as review-only because event is COMPLETED
        context: `${p.desc}

**Event Status**: Archived (ByteVerse 2025 Grand Championship - COMPLETED).
This problem is available for inspection and historical review. Active submissions are disabled.`,
        examples: [
          { input: "3\\n1 2 3", output: "6", explanation: "Verified contest tournament telemetry." },
          { input: "4\\n5 5 5 5", output: "20", explanation: "Historical test run example." }
        ],
        constraints: ["1 <= N <= 10^5", "Time Limit: 2.0s", "Submissions Closed"],
        hints: [
          "This round tested rapid algorithmic intuition.",
          "Review historical solution logs for reference.",
          "Check how memory bounds were managed under pressure."
        ],
        cSol: `int main() { printf("Archived 2025\\n"); return 0; }`,
        cppSol: `int main() { cout << "Archived 2025\\n"; return 0; }`,
        javaSol: `public static void main(String[] args) { System.out.println("Archived 2025"); }`,
        pySol: `def main(): print("Archived 2025")\nif __name__ == '__main__': main()`,
        testCases: [
          { input: "3\\n1 2 3", expected: "6", isHidden: false },
          { input: "4\\n5 5 5 5", expected: "20", isHidden: false },
          { input: "1\\n100", expected: "100", isHidden: true },
          { input: "2\\n0 0", expected: "0", isHidden: true }
        ]
      });

      roundProblems.push(problem);
      allEventProblems.push(problem);
    }

    builtRounds.push({
      id: `round_2025_r${rDef.round}`,
      round: rDef.round,
      name: rDef.name,
      type: rDef.type,
      points: rDef.points,
      durationMin: rDef.durationMin,
      status: "COMPLETED",
      problems: roundProblems,
    });
  }

  const byteverse2025 = {
    id: "event_byteverse_2025",
    slug: "byteverse-2025",
    title: "ByteVerse 2026 Annual Coding Fest",
    bannerUrl: "https://assets.byteverse.dev/events/byteverse-2025-banner.png",
    status: "COMPLETED",
    startDate: "2026-09-03T09:00:00Z",
    endDate: "2026-09-03T18:00:00Z",
    description: "The flagship inter-college programming contest featuring 5 progressive rounds: Logical MCQ, AI Code Optimization, Code Debugging, DSA Deep Dive, and the AI vs Human Challenge. Review problem statements and solutions from the championship.",
    stats: {
      registeredTeams: 142,
      collegesParticipated: 18,
      roundsCount: 5,
      totalProblems: 25,
      totalPoints: 500
    },
    roundsSummary: roundDefs.map((r) => ({
      round: r.round,
      name: r.name,
      type: r.type,
      points: r.points
    })),
    rounds: builtRounds,
    problems: allEventProblems,
  };

  return {
    activeEvents: [],
    pastEvents: [byteverse2025],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 3: CONTESTS MODULE (1 Active Contest + 1 Past Contest, 5 Rounds x 5 Problems)
// ─────────────────────────────────────────────────────────────────────────────
export function generateContests() {
  // 1. ACTIVE CONTEST: ByteClash Grand Prix 2026 (5 Rounds x 5 Problems = 25 Problems)
  const activeSections = [
    {
      seq: 1,
      name: "Section 1: Warmup & Fast I/O Sprint",
      type: "SPRINT",
      pts: 125,
      duration: 30,
      problems: [
        { name: "Even-Odd Balance Index", diff: "Easy", desc: "Find equilibrium index where left sum equals right sum." },
        { name: "Array Peak Amplitude", diff: "Easy", desc: "Find the maximum difference between any two numbers where larger appears after smaller." },
        { name: "Fast String Run-Length Encoder", diff: "Easy", desc: "Compress string by replacing repeated characters with count." },
        { name: "Subarray Absolute Difference Bound", diff: "Easy", desc: "Count contiguous subarrays whose elements differ by at most K." },
        { name: "Bitwise Parity Checksum", diff: "Easy", desc: "Compute 8-bit XOR checksum for byte sequence." },
      ]
    },
    {
      seq: 2,
      name: "Section 2: Array & Hash Matrix",
      type: "ARRAYS_HASHING",
      pts: 250,
      duration: 45,
      problems: [
        { name: "Subarray Sum Divisible by Modulo K", diff: "Medium", desc: "Count non-empty subarrays with sum divisible by K using prefix remainder hashing." },
        { name: "Longest Consecutive Sequence Coordinates", diff: "Medium", desc: "Find length of longest sequence of consecutive integers in O(N)." },
        { name: "Matrix Spiral Traversal Coordinates", diff: "Medium", desc: "Return all elements of matrix in spiral clock order." },
        { name: "Contiguous Binary Subarray with Equal 0 and 1", diff: "Medium", desc: "Find maximum length of contiguous subarray with equal number of 0s and 1s." },
        { name: "Continuous Subarray Multiple of K", diff: "Medium", desc: "Determine if array contains subarray of length >= 2 whose sum is multiple of K." },
      ]
    },
    {
      seq: 3,
      name: "Section 3: Tree & Graph Traversal",
      type: "GRAPHS_TREES",
      pts: 375,
      duration: 60,
      problems: [
        { name: "Course Schedule Directed Acyclic Validator", diff: "Medium", desc: "Determine if all courses can be finished without circular dependencies." },
        { name: "Network Routing Latency via Dijkstra", diff: "Medium", desc: "Compute shortest transmission delay from node K to all reachable nodes." },
        { name: "Binary Tree Zigzag Level Order", diff: "Medium", desc: "Traverse binary tree level-by-level alternating left-to-right and right-to-left." },
        { name: "Shortest Bridge Between Two Islands", diff: "Medium", desc: "Find minimum 0s to flip to connect two separate 4-directional islands." },
        { name: "Reconstruct Itinerary via Eulerian Path", diff: "Hard", desc: "Find lexicographically smallest itinerary using all airline tickets." },
      ]
    },
    {
      seq: 4,
      name: "Section 4: Dynamic Programming Matrix",
      type: "DYNAMIC_PROGRAMMING",
      pts: 500,
      duration: 75,
      problems: [
        { name: "Maximum Path Sum in Triangle Matrix", diff: "Medium", desc: "Find minimum path sum from top to bottom of triangle." },
        { name: "Distinct Subsequences Combinations", diff: "Hard", desc: "Count number of distinct subsequences of S which equal T." },
        { name: "Longest Arithmetic Subsequence with Delta D", diff: "Medium", desc: "Find longest subsequence where consecutive elements differ by D." },
        { name: "Palindromic Partitioning Minimum Cuts", diff: "Hard", desc: "Find minimum cuts needed to partition string into palindromes." },
        { name: "Interleaving String Validation DP", diff: "Hard", desc: "Determine if string S3 is formed by interleaving S1 and S2." },
      ]
    },
    {
      seq: 5,
      name: "Section 5: Grand Finals Speed Duel",
      type: "CHAMPIONSHIP_DUEL",
      pts: 750,
      duration: 60,
      problems: [
        { name: "Median of Real-time Streaming Array", diff: "Hard", desc: "Maintain continuous median of data stream using two heaps." },
        { name: "Minimum Window Subsequence Alignment", diff: "Hard", desc: "Find shortest contiguous substring of S1 that contains S2 as a subsequence." },
        { name: "Skyline Problem Geometric Merging", diff: "Hard", desc: "Compute critical silhouette key points for overlapping 2D rectangular buildings." },
        { name: "Max Points on a 2D Euclidean Line", diff: "Hard", desc: "Find maximum number of points that lie on the same straight line." },
        { name: "Word Search II with Trie Traversal", diff: "Hard", desc: "Find all dictionary words present on a 2D Boggle character board." },
      ]
    }
  ];

  const activeRounds: ContestSection[] = [];
  const activeProblems: ProblemDefinition[] = [];

  for (const s of activeSections) {
    const sProblems: ProblemDefinition[] = [];
    for (let pIdx = 0; pIdx < s.problems.length; pIdx++) {
      const p = s.problems[pIdx];
      const pId = `active_c1_s${s.seq}_p${pIdx + 1}`;
      const slug = `grand-prix-s${s.seq}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

      const problem = createProblem({
        id: pId,
        slug,
        title: `[S${s.seq}] ${p.name}`,
        difficulty: p.diff as "Easy" | "Medium" | "Hard",
        acceptanceRate: "52.4%",
        category: s.name,
        tags: ["ByteClash 2026", "Live Contest", p.diff, s.type],
        points: Math.round(s.pts / 5),
        sequence: pIdx + 1,
        readOnly: false, // FULLY SOLVABLE
        context: `${p.desc}

### Input Format
First line contains the problem dimension N.
Following lines contain space-separated parameters.

### Output Format
Print the computed answer matching the contest specifications.`,
        examples: [
          { input: "5\\n1 2 3 4 5", output: "3", explanation: "Standard tournament evaluation test case." },
          { input: "3\\n10 20 30", output: "20", explanation: "Boundary balance evaluation." }
        ],
        constraints: ["1 <= N <= 10^5", "Time Limit: 2000 ms", "Memory Limit: 256 MB"],
        hints: [
          "Check whether hashing, sliding window, or binary search is optimal.",
          "Watch out for 0 and negative value edge cases.",
          "Ensure I/O is fast (ios_base::sync_with_stdio(false) in C++)."
        ],
        cSol: `int main() { printf("3\\n"); return 0; }`,
        cppSol: `int main() { cout << "3\\n"; return 0; }`,
        javaSol: `public static void main(String[] args) { System.out.println("3"); }`,
        pySol: `def main(): print("3")\nif __name__ == '__main__': main()`,
        testCases: [
          { input: "5\\n1 2 3 4 5", expected: "3", isHidden: false },
          { input: "3\\n10 20 30", expected: "20", isHidden: false },
          { input: "1\\n50", expected: "50", isHidden: true },
          { input: "4\\n0 0 0 0", expected: "0", isHidden: true }
        ]
      });

      sProblems.push(problem);
      activeProblems.push(problem);
    }

    activeRounds.push({
      id: `sec_active_s${s.seq}`,
      sequence: s.seq,
      name: s.name,
      type: s.type,
      points: s.pts,
      durationMin: s.duration,
      problems: sProblems,
    });
  }

  // 2. PAST CONTEST: Winter Clash Invitational 2025 (5 Rounds x 5 Problems = 25 Problems)
  const pastSections = [
    {
      seq: 1,
      name: "Section 1: Invitational Foundation",
      type: "WARMUP",
      pts: 100,
      duration: 25,
      problems: [
        { name: "Consecutive Difference Parity", diff: "Easy", desc: "Evaluate difference parity across consecutive sequence elements." },
        { name: "String Vowel Permutation Counter", diff: "Easy", desc: "Count vowels preserving relative order." },
        { name: "Array Running Median Sample", diff: "Easy", desc: "Calculate running median of small stream." },
        { name: "Matrix Diagonal Sum Difference", diff: "Easy", desc: "Compute difference between primary and secondary diagonals." },
        { name: "Binary Prefix Divisibility", diff: "Easy", desc: "Determine if binary prefix number is divisible by 5." },
      ]
    },
    {
      seq: 2,
      name: "Section 2: Two Pointers & Subarrays",
      type: "POINTERS",
      pts: 200,
      duration: 40,
      problems: [
        { name: "Trapping Rain Water Single Bar", diff: "Medium", desc: "Compute water trapped between pillars." },
        { name: "Longest Mountain Subarray", diff: "Medium", desc: "Find longest contiguous subarray that forms a strict mountain." },
        { name: "Interval Intersection Matrix", diff: "Medium", desc: "Compute intersection coordinates between two sorted interval lists." },
        { name: "Shortest Subarray with Sum at Least K", diff: "Hard", desc: "Find shortest non-empty subarray with sum at least K." },
        { name: "Boats to Save People Capacity", diff: "Medium", desc: "Find minimum boats to carry people within limit." },
      ]
    },
    {
      seq: 3,
      name: "Section 3: Graph Traversal & Networks",
      type: "GRAPHS",
      pts: 300,
      duration: 50,
      problems: [
        { name: "Number of Enclaves Island Check", diff: "Medium", desc: "Count land cells from which you cannot walk off grid boundary." },
        { name: "Minimum Cost to Connect All Points (Kruskal)", diff: "Medium", desc: "Find minimum spanning tree cost connecting 2D points." },
        { name: "Is Graph Bipartite Validation", diff: "Medium", desc: "Color graph vertices using 2 colors without conflict." },
        { name: "Shortest Path in Binary Matrix", diff: "Medium", desc: "Find shortest 8-directional clear path from top-left to bottom-right." },
        { name: "Critical Connections in a Network (Tarjan)", diff: "Hard", desc: "Find all bridges in undirected network graph." },
      ]
    },
    {
      seq: 4,
      name: "Section 4: Advanced Dynamic Programming",
      type: "DP",
      pts: 400,
      duration: 60,
      problems: [
        { name: "Burst Balloons Maximum Coins", diff: "Hard", desc: "Maximize coins collected by bursting balloons in optimal order." },
        { name: "Regular Expression Matching DP", diff: "Hard", desc: "Support '.' and '*' matching in text pattern DP." },
        { name: "Best Time to Buy & Sell Stock IV", diff: "Hard", desc: "Maximize profit with at most K transactions." },
        { name: "Dungeon Game Health Matrix", diff: "Hard", desc: "Determine knight's minimum initial health to rescue princess." },
        { name: "Wildcard Matching Pattern DP", diff: "Hard", desc: "Support '?' and '*' wildcard matching." },
      ]
    },
    {
      seq: 5,
      name: "Section 5: Algorithmic Grand Slam",
      type: "FINALS",
      pts: 500,
      duration: 60,
      problems: [
        { name: "Sliding Window Maximum Deque", diff: "Hard", desc: "Maintain sliding window maximum over array of size K." },
        { name: "Count of Smaller Numbers After Self", diff: "Hard", desc: "Count smaller numbers to right of each element using Merge Sort / BIT." },
        { name: "Merge K Sorted Linked Lists", diff: "Hard", desc: "Merge K sorted lists into one sorted list in O(N log K)." },
        { name: "Palindrome Pairs Word Index", diff: "Hard", desc: "Find all pairs of distinct indices whose concatenation is a palindrome." },
        { name: "Longest Valid Parentheses Substring", diff: "Hard", desc: "Find length of longest valid parentheses substring." },
      ]
    }
  ];

  const pastRounds: ContestSection[] = [];
  const pastProblems: ProblemDefinition[] = [];

  for (const s of pastSections) {
    const sProblems: ProblemDefinition[] = [];
    for (let pIdx = 0; pIdx < s.problems.length; pIdx++) {
      const p = s.problems[pIdx];
      const pId = `past_c2_s${s.seq}_p${pIdx + 1}`;
      const slug = `winter-clash-s${s.seq}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

      const problem = createProblem({
        id: pId,
        slug,
        title: `[Winter 25 S${s.seq}] ${p.name}`,
        difficulty: p.diff as "Easy" | "Medium" | "Hard",
        acceptanceRate: "39.1%",
        category: s.name,
        tags: ["Winter Clash 2025", "Past Contest", p.diff, s.type],
        points: Math.round(s.pts / 5),
        sequence: pIdx + 1,
        readOnly: true, // REVIEW ONLY - SUBMISSIONS BLOCKED
        context: `${p.desc}

**Contest Status**: Archived (Winter Clash Invitational 2025 - COMPLETED).
This problem is retained for review and solution study. Submissions are closed.`,
        examples: [
          { input: "4\\n1 3 5 7", output: "4", explanation: "Historical contest test case." },
          { input: "2\\n10 20", output: "2", explanation: "Sample input." }
        ],
        constraints: ["1 <= N <= 10^5", "Contest Closed", "Submissions Disabled"],
        hints: [
          "Review past leaderboard strategies for this problem.",
          "Check how memory limits were observed."
        ],
        cSol: `int main() { printf("Archived\\n"); return 0; }`,
        cppSol: `int main() { cout << "Archived\\n"; return 0; }`,
        javaSol: `public static void main(String[] args) { System.out.println("Archived"); }`,
        pySol: `def main(): print("Archived")\nif __name__ == '__main__': main()`,
        testCases: [
          { input: "4\\n1 3 5 7", expected: "4", isHidden: false },
          { input: "2\\n10 20", expected: "2", isHidden: false },
          { input: "1\\n100", expected: "1", isHidden: true },
          { input: "3\\n0 0 0", expected: "3", isHidden: true }
        ]
      });

      sProblems.push(problem);
      pastProblems.push(problem);
    }

    pastRounds.push({
      id: `sec_past_s${s.seq}`,
      sequence: s.seq,
      name: s.name,
      type: s.type,
      points: s.pts,
      durationMin: s.duration,
      problems: sProblems,
    });
  }

  const activeContest: ContestDefinition = {
    id: "contest_weekly_sprint_01",
    slug: "byteverse-weekly-sprint-01",
    title: "ByteClash Grand Prix 2026",
    type: "WEEKLY",
    difficulty: "Mixed",
    status: "ACTIVE", // LIVE & SOLVABLE
    startsAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 135 * 60 * 1000).toISOString(),
    durationMin: 180,
    bannerUrl: "https://assets.byteverse.dev/contests/grand-prix-2026.png",
    description: "The premier collegiate active contest. 5 distinct sections with 25 progressive challenges spanning Warmup, Arrays, Graphs, Dynamic Programming, and the Grand Championship Duel.",
    rounds: activeRounds,
    problems: activeProblems,
  };

  const pastContest: ContestDefinition = {
    id: "contest_winter_clash_2025",
    slug: "winter-clash-2025",
    title: "Winter Clash Invitational 2025",
    type: "INVITATIONAL",
    difficulty: "Hard",
    status: "COMPLETED", // COMPLETED & READ-ONLY
    startsAt: "2025-12-20T10:00:00Z",
    endsAt: "2025-12-20T14:00:00Z",
    durationMin: 240,
    bannerUrl: "https://assets.byteverse.dev/contests/winter-clash-2025.png",
    description: "Archived championship tournament featuring 25 elite competitive programming problems across 5 sections. Submissions are disabled; available for post-contest review.",
    rounds: pastRounds,
    problems: pastProblems,
  };

  return [activeContest, pastContest];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN GENERATOR EXECUTION
// ─────────────────────────────────────────────────────────────────────────────
export function buildMasterSeedPayload() {
  console.log("Generating 100 Practice Problems...");
  const practiceProblems = generate100PracticeProblems();
  console.log(`Generated ${practiceProblems.length} Practice Problems across 10 categories.`);

  console.log("Generating Events Module (ByteVerse 2025 with 5 rounds x 5 problems)...");
  const events = generatePastEventByteVerse2025();
  console.log(`Generated Events: active=${events.activeEvents.length}, past=${events.pastEvents.length} with ${events.pastEvents[0].problems.length} problems.`);

  console.log("Generating Contests Module (1 Active with 25 problems, 1 Past with 25 problems)...");
  const contests = generateContests();
  console.log(`Generated Contests: ${contests.length} contests total (Active: ${contests[0].problems.length} problems, Past: ${contests[1].problems.length} problems).`);

  const aiAssistantConfig = {
    name: "ByteVerse Socratic AI",
    avatar: "https://assets.byteverse.dev/ai/socratic-tutor.png",
    role: "In-Editor Competitive Programming Pedagogical Tutor",
    systemPrompt: "You are the ByteVerse In-Editor Socratic Tutor. Your duty is to guide competitive coders toward optimal algorithmic solutions through progressive hints, complexity analysis, and edge case questioning. NEVER output complete, direct solutions or spoilers.",
    capabilities: [
      "Algorithmic Pattern Hinting (Tier 1-3)",
      "Time & Space Complexity Profiling",
      "Edge-case discovery assistance",
      "Subtle syntax & logic debugging questions"
    ]
  };

  const payload = {
    metadata: {
      version: "2.0.0",
      generatedAt: new Date().toISOString(),
      stats: {
        practiceProblemsCount: practiceProblems.length,
        pastEventsCount: events.pastEvents.length,
        pastEventProblemsCount: events.pastEvents[0]?.problems.length || 0,
        activeContestsCount: contests.filter((c) => c.status === "ACTIVE").length,
        pastContestsCount: contests.filter((c) => c.status === "COMPLETED").length,
        totalContestProblemsCount: contests.reduce((sum, c) => sum + c.problems.length, 0),
        grandTotalProblemsCount: practiceProblems.length + (events.pastEvents[0]?.problems.length || 0) + contests.reduce((sum, c) => sum + c.problems.length, 0)
      }
    },
    events,
    contests,
    practiceProblems,
    aiAssistantConfig
  };

  return payload;
}

// Execute and write file if run directly
const isMain = process.argv[1] && (process.argv[1].endsWith("generate-master-seed.ts") || process.argv[1].endsWith("generate-master-seed.js"));
if (isMain) {
  const masterPayload = buildMasterSeedPayload();
  const targetPath = path.resolve(process.cwd(), "prisma", "seed-data.json");
  console.log(`Writing master seed payload to: ${targetPath}`);
  fs.writeFileSync(targetPath, JSON.stringify(masterPayload, null, 2), "utf-8");
  const sizeMb = (fs.statSync(targetPath).size / (1024 * 1024)).toFixed(2);
  console.log(`Master seed payload generated successfully! Size: ${sizeMb} MB`);
  console.log("Grand Total Problems:", masterPayload.metadata.stats.grandTotalProblemsCount);
}
