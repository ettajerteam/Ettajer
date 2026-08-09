import type { DeveloperAuthContext } from "@/lib/developer/auth-context";

export type WorkflowNextStep = {
  action: string;
  reason: string;
  /** Matching REST path when applicable */
  rest?: string;
  /** Matching MCP tool when applicable */
  mcp?: string;
};

export type WorkflowNextInput = {
  scopes: Set<string>;
  productCount: number;
  collectionCount: number;
  draftThemeIds: string[];
  activeThemeId: string | null;
  hasThemeSchemaAccess: boolean;
};

/**
 * State-aware next steps for AI agents after get_context.
 * Prefer few high-signal actions over a static laundry list.
 */
export function buildWorkflowNext(input: WorkflowNextInput): {
  next: WorkflowNextStep[];
  note: string;
  recommendedPath: string;
} {
  const next: WorkflowNextStep[] = [];
  const canThemesRead = input.scopes.has("themes:read");
  const canThemesCreate = input.scopes.has("themes:create");
  const canThemesWrite = input.scopes.has("themes:write");
  const canPreview =
    input.scopes.has("themes:preview") || input.scopes.has("themes:read");
  const canPublish = input.scopes.has("themes:publish");
  const canProducts = input.scopes.has("products:read");

  if (canThemesRead && input.hasThemeSchemaAccess) {
    next.push({
      action: "get_theme_schema",
      reason: "Required before creating or editing sections — lists valid section types.",
      rest: "GET /api/v1/themes/schema",
      mcp: "get_theme_schema",
    });
  }

  if (canProducts && input.productCount > 0) {
    next.push({
      action: "get_products",
      reason:
        "Use real product IDs from this store when building product grids — never invent IDs.",
      rest: "GET /api/v1/products",
      mcp: "get_products",
    });
  } else if (canProducts && input.productCount === 0) {
    next.push({
      action: "get_products",
      reason:
        "Catalog is empty. Confirm with get_products, then build editorial/collection sections without fake product refs.",
      rest: "GET /api/v1/products",
      mcp: "get_products",
    });
  }

  if (canThemesRead && input.collectionCount > 0 && input.scopes.has("collections:read")) {
    next.push({
      action: "get_collections",
      reason: "Reference real collection IDs for featured collection sections.",
      rest: "GET /api/v1/collections",
      mcp: "get_collections",
    });
  }

  const latestDraftId = input.draftThemeIds[0] ?? null;

  if (latestDraftId && canThemesWrite) {
    next.push({
      action: "apply_theme_batch",
      reason: `Draft theme ${latestDraftId} already exists — extend it with apply_theme_batch instead of create_theme.`,
      rest: `POST /api/v1/themes/${latestDraftId}/batch`,
      mcp: "apply_theme_batch",
    });
    if (canPreview) {
      next.push({
        action: "preview_theme",
        reason: "Generate a signed preview URL for the existing draft before publishing.",
        rest: `POST /api/v1/themes/${latestDraftId}/preview-token`,
        mcp: "preview_theme",
      });
    }
  } else if (canThemesCreate) {
    next.push({
      action: "create_theme",
      reason: "No draft theme yet — create a private draft, then apply_theme_batch.",
      rest: "POST /api/v1/themes",
      mcp: "create_theme",
    });
    if (canThemesWrite) {
      next.push({
        action: "apply_theme_batch",
        reason:
          "After create_theme, build homepage sections in one fail-closed batch (prefer over many create_section calls).",
        rest: "POST /api/v1/themes/:id/batch",
        mcp: "apply_theme_batch",
      });
    }
    if (canPreview) {
      next.push({
        action: "preview_theme",
        reason: "Issue a short-lived preview URL after the draft is ready. Do not publish yet.",
        rest: "POST /api/v1/themes/:id/preview-token",
        mcp: "preview_theme",
      });
    }
  }

  if (canPublish) {
    next.push({
      action: "publish_theme",
      reason:
        "Only after merchant approval. Prefer merchant dashboard publish when themes:publish is not intended for the agent.",
      rest: "POST /api/v1/themes/:id/publish",
      mcp: "publish_theme",
    });
  }

  const recommendedPath = latestDraftId
    ? "get_theme_schema → apply_theme_batch → preview_theme"
    : "get_theme_schema → create_theme → apply_theme_batch → preview_theme";

  return {
    next: next.slice(0, 6),
    note:
      "Follow workflow.next in order. Prefer apply_theme_batch over repeated create_section. Never invent product/collection IDs. Do not publish unless the merchant asked.",
    recommendedPath,
  };
}

/** Helper for tests / MCP — scopes from auth context. */
export function scopesSetFromCtx(ctx: DeveloperAuthContext): Set<string> {
  return new Set(ctx.scopes);
}
