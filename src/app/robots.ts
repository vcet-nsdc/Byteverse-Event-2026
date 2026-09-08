import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://byteclash.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/contest", "/practice", "/event", "/discussion", "/login"],
        disallow: ["/admin/", "/api/", "/rounds/*"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/contest", "/practice", "/event", "/discussion"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
