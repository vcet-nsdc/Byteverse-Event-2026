import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Contests & Competitive Arena",
  description:
    "Participate in live weekly coding contests and algorithmic challenges on NSDC ByteClash. Compete for rating points and real-time leaderboard standings.",
  keywords: [
    "NSDC ByteClash contests",
    "weekly coding contest",
    "algorithmic competition",
    "ByteClash leaderboard",
    "college programming duel",
  ],
  alternates: {
    canonical: "/contest",
  },
  openGraph: {
    title: "Programming Contests | NSDC ByteClash",
    description: "Weekly algorithmic challenges and live competitive duels on NSDC ByteClash.",
  },
};

export default function ContestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
