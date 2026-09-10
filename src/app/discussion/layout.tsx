import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Community & Solution Walkthroughs",
  description:
    "Join the NSDC ByteVerse developer community. Discuss algorithm approaches, share optimal code implementations, and learn from peers.",
  keywords: [
    "NSDC ByteVerse discussion",
    "coding forum",
    "algorithm discussion",
    "interview questions discussion",
    "coding problem solutions",
  ],
  alternates: {
    canonical: "/discussion",
  },
  openGraph: {
    title: "Community Discussions | NSDC ByteVerse",
    description: "Discuss solutions, algorithmic strategies, and contest debriefs on NSDC ByteVerse.",
  },
};

export default function DiscussionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
