import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scoutgrid.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/players/", "/coaches/", "/pricing", "/about", "/blog"],
        disallow: ["/dashboard", "/admin", "/onboarding", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
