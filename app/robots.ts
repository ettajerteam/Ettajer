import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site-config";

/** AI search / training crawlers — allow public marketing + help corpus. */
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "GoogleOther",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "DeepSeekBot",
  "meta-externalagent",
  "FacebookBot",
] as const;

const PUBLIC_ALLOW = [
  "/",
  "/help",
  "/help/",
  "/ai",
  "/ai/",
  "/developers",
  "/developers/",
  "/llms.txt",
  "/llms-full.txt",
  "/knowledge.json",
  "/.well-known/llms.txt",
  "/api/public/knowledge/",
  "/store/",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/data-deletion",
  "/founder-card",
  "/signup",
  "/login",
] as const;

const PRIVATE_DISALLOW = [
  "/dashboard/",
  "/api/",
  "/settings/",
  "/themes/",
  "/onboarding",
  "/welcome",
  "/early-access",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [...PUBLIC_ALLOW],
        disallow: [...PRIVATE_DISALLOW],
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: [...PUBLIC_ALLOW],
        disallow: [...PRIVATE_DISALLOW],
      })),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
