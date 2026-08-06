import {
  buildKnowledgeJson,
  KNOWLEDGE_JSON_HEADERS,
} from "@/lib/seo/llms-content";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return new Response(JSON.stringify(buildKnowledgeJson(), null, 2), {
    headers: { ...KNOWLEDGE_JSON_HEADERS },
  });
}
