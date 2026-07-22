import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/store/"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/settings/",
          "/themes/",
          "/onboarding",
          "/welcome",
          "/early-access",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
