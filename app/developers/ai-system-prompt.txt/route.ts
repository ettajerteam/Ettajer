import { buildAiSystemPrompt } from "@/lib/developer/ai-system-prompt";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildAiSystemPrompt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
