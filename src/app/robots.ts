import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/register", "/login", "/terms", "/privacy"],
        disallow: ["/dashboard", "/admin", "/api/", "/onboarding"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
