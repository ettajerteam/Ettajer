import {
  buildAiOpenApi,
  KNOWLEDGE_JSON_HEADERS,
} from "@/lib/seo/llms-content";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return Response.json(buildAiOpenApi(), {
    headers: { ...KNOWLEDGE_JSON_HEADERS },
  });
}
