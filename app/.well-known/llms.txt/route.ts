import {
  buildLlmsTxt,
  LLMS_TEXT_HEADERS,
} from "@/lib/seo/llms-content";

export const dynamic = "force-static";
export const revalidate = 3600;

/** Mirror of /llms.txt for agents that probe /.well-known/ first. */
export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { ...LLMS_TEXT_HEADERS },
  });
}
