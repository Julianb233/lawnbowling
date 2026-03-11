import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://lawnbowl.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/", "/kiosk/", "/settings/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
