import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/layout/navbar";
import JsonLd from "@/components/seo/JsonLd";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://byteverse.dev";

export const viewport: Viewport = {
  themeColor: "#7F45DB",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "NSDC ByteVerse 2026 — Premier Collegiate Competitive Programming Platform",
    template: "%s | NSDC ByteVerse",
  },
  description:
    "NSDC ByteVerse (formerly ByteVerse) is the premier collegiate competitive programming platform and tournament arena. Compete in weekly coding contests, practice algorithms in C++, Python, Java, and C, climb live leaderboards, and battle in real-time speed duels.",
  applicationName: "NSDC ByteVerse",
  authors: [
    { name: "NSDC Technical Committee", url: baseUrl },
    { name: "NSDC ByteVerse Board" },
  ],
  generator: "Next.js",
  keywords: [
    "NSDC ByteVerse",
    "ByteVerse",
    "ByteVerse 2026",
    "nsdc byteverse",
    "byteverse nsdc",
    "NSDC coding contest",
    "NSDC competitive programming",
    "NSDC College",
    "algorithm challenges",
    "collegiate coding tournament",
    "online judge",
    "LeetCode college alternative",
    "competitive programming India",
    "ByteVerse",
    "college hackathon 2026",
    "data structures and algorithms practice",
  ],
  referrer: "origin-when-cross-origin",
  creator: "NSDC Committee",
  publisher: "NSDC ByteVerse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NSDC ByteVerse 2026 — Premier Collegiate Competitive Programming Platform",
    description:
      "Join NSDC ByteVerse, the flagship collegiate coding arena. Compete in algorithmic challenges, weekly contests, AI code optimization, and live speed duels.",
    url: baseUrl,
    siteName: "NSDC ByteVerse",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/assets/byteverse-logo.png",
        width: 1200,
        height: 630,
        alt: "NSDC ByteVerse 2026 Championship Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NSDC ByteVerse 2026 — Premier Collegiate Coding Arena",
    description:
      "Compete in weekly algorithmic contests, practice problems, and live tournament battles on NSDC ByteVerse.",
    images: ["/assets/byteverse-logo.png"],
    creator: "@NSDC_Official",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon.png?v=3", type: "image/png" },
      { url: "/favicon.ico?v=3" },
      { url: "/assets/byteverse-logo.png?v=3", type: "image/png" },
    ],
    shortcut: "/favicon.png?v=3",
    apple: "/assets/byteverse-logo.png?v=3",
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import StarrySkyBackground from "@/components/theme/StarrySkyBackground";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://cdn.fontshare.com/wf/2D4THMSKJGRDCBT6A6VWG4SNWKTAS3I2/KYTPQO6L7FPQHAZ4NUY6LX3ZE4BITSGS/2QZ2ZOKTT7SJC5TJNAK23KA3JCADVWDL.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://cdn.fontshare.com/wf/RZYHTNGMAM277HHQBAANMAMZAK2RASOJ/ZMFNEW255W5MH35ANX3VS4OA2VGPLJ6V/MRUFJCB2XBGJKEWAZRVXWUXXFT2Z7TDZ.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=technor@400,500,600,700,800,900&display=swap" />
        <meta
          name="description"
          content="NSDC ByteVerse (formerly ByteVerse) is the premier collegiate competitive programming platform and tournament arena. Compete in weekly coding contests, practice algorithms in C++, Python, Java, and C, climb live leaderboards, and battle in real-time speed duels."
        />
        <link rel="icon" type="image/png" href="/favicon.png?v=3" />
        <link rel="shortcut icon" href="/favicon.ico?v=3" />
        <link rel="apple-touch-icon" href="/assets/byteverse-logo.png?v=3" />
        <JsonLd />
      </head>
      <body className="min-h-screen antialiased relative">
        <ThemeProvider>
          <StarrySkyBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">{children}</div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
