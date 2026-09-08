import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campus Events & Coding Championships",
  description:
    "Explore upcoming and ongoing technical championships, hackathons, and collegiate coding events hosted by NSDC.",
  keywords: [
    "NSDC ByteClash events",
    "NSDC college hackathon",
    "collegiate coding events",
    "programming championships 2026",
  ],
  alternates: {
    canonical: "/event",
  },
  openGraph: {
    title: "Campus Events & Championships | NSDC ByteClash",
    description: "Ongoing and past collegiate coding tournaments hosted by NSDC.",
  },
};

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
