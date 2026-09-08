import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  // Aggregate real submissions for coding languages: python, cpp, c, java
  const targetLangs = ["python", "cpp", "c", "java"];

  const counts = await db.submission.groupBy({
    by: ["language"],
    where: {
      language: { in: targetLangs },
    },
    _count: { id: true },
  });

  const langMap: Record<string, number> = {
    python: 0,
    cpp: 0,
    c: 0,
    java: 0,
  };

  let totalCodingSubmissions = 0;
  for (const item of counts) {
    const l = item.language.toLowerCase();
    if (langMap[l] !== undefined) {
      langMap[l] = item._count.id;
      totalCodingSubmissions += item._count.id;
    }
  }

  const languages = [
    {
      name: "Python",
      key: "python",
      count: langMap.python,
      percentage: totalCodingSubmissions > 0
        ? Math.round((langMap.python / totalCodingSubmissions) * 100)
        : 0,
      color: "#3B82F6", // Python Blue
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      name: "C++",
      key: "cpp",
      count: langMap.cpp,
      percentage: totalCodingSubmissions > 0
        ? Math.round((langMap.cpp / totalCodingSubmissions) * 100)
        : 0,
      color: "#7F45DB", // ByteVerse Primary Purple
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      name: "C",
      key: "c",
      count: langMap.c,
      percentage: totalCodingSubmissions > 0
        ? Math.round((langMap.c / totalCodingSubmissions) * 100)
        : 0,
      color: "#4A2293", // ByteVerse Deep Teal/Purple
      badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    {
      name: "Java",
      key: "java",
      count: langMap.java,
      percentage: totalCodingSubmissions > 0
        ? Math.round((langMap.java / totalCodingSubmissions) * 100)
        : 0,
      color: "#F59E0B", // Java Amber
      badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ];

  return NextResponse.json({
    totalSubmissions: totalCodingSubmissions,
    languages,
  });
}
