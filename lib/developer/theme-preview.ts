import { assertOwnedTheme, getStoreTheme } from "@/lib/developer/theme-service";
import { issueThemePreviewToken } from "@/lib/developer/preview-token";
import { getStoreForContext } from "@/lib/developer/commerce-read";
import { logDeveloperAction } from "@/lib/developer/audit";
import type { DeveloperAuthContext } from "@/lib/developer/auth-context";
import { hasAnyScope } from "@/lib/developer/scopes";
import { DeveloperApiError } from "@/lib/developer/errors";

/** Create a short-lived storefront preview URL for a private theme. */
export async function createThemePreviewAccess(
  ctx: DeveloperAuthContext,
  themeId: string,
) {
  if (!hasAnyScope(ctx.scopes, ["themes:read", "themes:preview"])) {
    throw new DeveloperApiError(
      "FORBIDDEN",
      "Missing scope themes:read or themes:preview.",
    );
  }

  await assertOwnedTheme(ctx.storeId, themeId);
  const store = await getStoreForContext(ctx);
  const issued = issueThemePreviewToken({
    storeId: ctx.storeId,
    themeId,
  });

  const previewUrl = `/store/${store.slug}?preview=true&previewThemeId=${encodeURIComponent(themeId)}&previewToken=${encodeURIComponent(issued.token)}`;

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.previewed",
    resource: "theme",
    resourceId: themeId,
    metadata: { expiresAt: issued.expiresAt.toISOString() },
  });

  const theme = await getStoreTheme(ctx.storeId, themeId);
  return {
    themeId,
    status: theme.status,
    previewUrl,
    expiresAt: issued.expiresAt.toISOString(),
  };
}
