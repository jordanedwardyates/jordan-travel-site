import type { MetadataRoute } from "next";

const BASE = "https://www.bonvtravelcompany.com";

/**
 * Crawl rules. Everything public is fair game; the internal, token-gated
 * data preview is kept out of the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/internal/",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
