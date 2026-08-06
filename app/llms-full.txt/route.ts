import {
  buildLlmsFullTxt,
  LLMS_TEXT_HEADERS,
} from "@/lib/seo/llms-content";

export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: { ...LLMS_TEXT_HEADERS },
  });
}
