import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/lp/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://stevensonsystems.com/sitemap.xml",
  };
}
