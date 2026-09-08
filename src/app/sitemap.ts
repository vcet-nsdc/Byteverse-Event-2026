import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://byteclash.dev";

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/contest`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/event`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/discussion`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    // Dynamic Contests
    const contests = await db.contest.findMany({
      select: { id: true, updatedAt: true },
      take: 100,
    });
    const contestRoutes: MetadataRoute.Sitemap = contests.map((c) => ({
      url: `${baseUrl}/contest/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Dynamic Practice Problems
    const problems = await db.problem.findMany({
      where: { isPublished: true },
      select: { id: true, updatedAt: true },
      take: 200,
    });
    const problemRoutes: MetadataRoute.Sitemap = problems.map((p) => ({
      url: `${baseUrl}/practice/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Dynamic Discussions
    const discussions = await db.discussion.findMany({
      select: { id: true, updatedAt: true },
      take: 100,
    });
    const discussionRoutes: MetadataRoute.Sitemap = discussions.map((d) => ({
      url: `${baseUrl}/discussion/${d.id}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...contestRoutes, ...problemRoutes, ...discussionRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
