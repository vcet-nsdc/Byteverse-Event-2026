import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice Problems & Algorithmic Library",
  description:
    "Explore curated coding challenges on NSDC ByteClash. Practice data structures, dynamic programming, and logic puzzles in Python, C++, Java, and C.",
  keywords: [
    "NSDC ByteClash practice",
    "coding problems",
    "algorithm practice",
    "data structures",
    "online judge practice",
    "LeetCode alternative practice",
  ],
  alternates: {
    canonical: "/practice",
  },
  openGraph: {
    title: "Practice Problems & Online Judge | NSDC ByteClash",
    description: "Sharpen your algorithmic problem solving with curated problems on NSDC ByteClash.",
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
