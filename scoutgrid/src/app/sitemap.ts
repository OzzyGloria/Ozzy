import { createAdminClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scoutgrid.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const supabase = await createAdminClient();
    const [playersResult, coachesResult] = await Promise.all([
      supabase.from("player_profiles").select("id, updated_at").eq("is_visible", true).limit(1000),
      supabase.from("coach_profiles").select("id, updated_at").eq("is_visible", true).limit(500),
    ]);

    const playerRoutes: MetadataRoute.Sitemap = (playersResult.data ?? []).map((p) => ({
      url: `${baseUrl}/players/${p.id}`,
      lastModified: new Date(p.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const coachRoutes: MetadataRoute.Sitemap = (coachesResult.data ?? []).map((c) => ({
      url: `${baseUrl}/coaches/${c.id}`,
      lastModified: new Date(c.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...playerRoutes, ...coachRoutes];
  } catch {
    return staticRoutes;
  }
}
