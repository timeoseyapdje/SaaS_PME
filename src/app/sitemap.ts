import type { MetadataRoute } from "next";
import { getPublishedGuides } from "@/content/guides";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.nkapcontrol.com";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const guides = getPublishedGuides();
  const latestGuide = guides.reduce((max, g) => (g.updatedAt > max ? g.updatedAt : max), guides[0].updatedAt);

  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/guides`, lastModified: new Date(latestGuide), changeFrequency: "weekly", priority: 0.9 },
    ...guides.map((g) => ({
      url: `${APP_URL}/guides/${g.slug}`,
      lastModified: new Date(g.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${APP_URL}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${APP_URL}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
