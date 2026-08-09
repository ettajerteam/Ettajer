import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import {
  applyThemeBatch,
  type ThemeBatchOp,
} from "@/lib/developer/theme-service";
import { DeveloperApiError } from "@/lib/developer/errors";
import { requireScopes } from "@/lib/developer/auth-context";

export const dynamic = "force-dynamic";

export const POST = withDeveloperApi({
  idempotent: true,
  scopes: "themes:write",
  handler: async (req, ctx, params) => {
    const body = (await req.json()) as { ops?: ThemeBatchOp[] };
    if (!Array.isArray(body.ops)) {
      throw new DeveloperApiError("VALIDATION_ERROR", "ops array is required.", {
        hint: "POST { ops: [{ op: 'create_section', sectionType: 'hero', ... }] }",
      });
    }
    const needsPages = body.ops.some((o) =>
      ["upsert_page", "update_page", "delete_page"].includes(o.op),
    );
    const needsNav = body.ops.some((o) => o.op === "set_navigation");
    if (needsPages) requireScopes(ctx, "pages:write");
    if (needsNav) requireScopes(ctx, "navigation:write");

    const result = await applyThemeBatch(ctx, params.id, body.ops);
    return jsonData(result);
  },
});
