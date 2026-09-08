import type { Metadata } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: "ByteVerse 2026 | NSDC",
  description:
    "ByteVerse is a competitive coding platform featuring 5 rounds of programming challenges, AI integration, team battles, and live leaderboards.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        <Navbar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
