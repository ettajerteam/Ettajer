import { buildDeveloperOpenApi } from "@/lib/developer/docs-content";
import { KNOWLEDGE_JSON_HEADERS } from "@/lib/seo/llms-content";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return Response.json(buildDeveloperOpenApi(), {
    headers: { ...KNOWLEDGE_JSON_HEADERS },
  });
}
