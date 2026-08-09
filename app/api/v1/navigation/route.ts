import { withDeveloperApi, jsonData } from "@/app/api/v1/_lib/handler";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { parseNavigation } from "@/lib/navigation";
import { asThemeDocument } from "@/lib/developer/theme-document";
import { logDeveloperAction } from "@/lib/developer/audit";
import { DeveloperApiError } from "@/lib/developer/errors";
import {
  validateNavigation,
  validateThemeDocument,
} from "@/lib/developer/theme-validate";

export const dynamic = "force-dynamic";

export const GET = withDeveloperApi({
  scopes: "navigation:read",
  handler: async (req, ctx) => {
    const themeId = new URL(req.url).searchParams.get("themeId");
    if (themeId) {
      const theme = await prisma.storeTheme.findFirst({
        where: { id: themeId, storeId: ctx.storeId },
      });
      if (!theme) throw new DeveloperApiError("NOT_FOUND", "Theme not found.");
      return jsonData({ navigation: asThemeDocument(theme.document).navigation });
    }
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: ctx.storeId },
      select: { navigation: true },
    });
    return jsonData({ navigation: parseNavigation(settings?.navigation) });
  },
});

export const PATCH = withDeveloperApi({
  idempotent: true,
  scopes: "navigation:write",
  handler: async (req, ctx) => {
    const body = (await req.json()) as {
      themeId?: string;
      navigation?: unknown;
    };
    const navigation = validateNavigation(body.navigation);

    if (body.themeId) {
      const theme = await prisma.storeTheme.findFirst({
        where: { id: body.themeId, storeId: ctx.storeId },
      });
      if (!theme) throw new DeveloperApiError("NOT_FOUND", "Theme not found.");
      const doc = asThemeDocument(theme.document);
      doc.navigation = navigation;
      const validated = await validateThemeDocument(ctx.storeId, doc);
      await prisma.storeTheme.update({
        where: { id: theme.id },
        data: {
          document: validated as unknown as Prisma.InputJsonValue,
          status: "draft",
        },
      });
      await logDeveloperAction({
        applicationId: ctx.applicationId,
        userId: ctx.userId,
        storeId: ctx.storeId,
        actorType: ctx.actor,
        action: "navigation.updated",
        resource: "theme",
        resourceId: theme.id,
      });
      return jsonData({ navigation: validated.navigation, themeId: theme.id });
    }

    // Live store navigation (requires navigation:write — still presentation)
    await prisma.storeSettings.update({
      where: { storeId: ctx.storeId },
      data: { navigation: navigation as unknown as Prisma.InputJsonValue },
    });
    await logDeveloperAction({
      applicationId: ctx.applicationId,
      userId: ctx.userId,
      storeId: ctx.storeId,
      actorType: ctx.actor,
      action: "navigation.updated",
      resource: "store",
      resourceId: ctx.storeId,
    });
    return jsonData({ navigation });
  },
});
