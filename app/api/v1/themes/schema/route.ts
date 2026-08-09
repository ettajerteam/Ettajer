import { buildCanonicalThemeSchema } from "@/lib/developer/theme-schema";
import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "themes:read",
  handler: async () => jsonData(buildCanonicalThemeSchema()),
});
