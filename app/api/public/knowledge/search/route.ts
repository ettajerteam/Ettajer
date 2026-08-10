import {
  KNOWLEDGE_JSON_HEADERS,
  searchPublicKnowledge,
} from "@/lib/seo/llms-content";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS } });
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 8;
  const hits = searchPublicKnowledge(q, limit);

  return Response.json(
    {
      q,
      count: hits.length,
      hits,
      sources: {
        knowledge: "/knowledge.json",
        llmsFull: "/llms-full.txt",
        hub: "/ai",
      },
    },
    {
      headers: {
        ...KNOWLEDGE_JSON_HEADERS,
        ...CORS,
      },
    },
  );
}
