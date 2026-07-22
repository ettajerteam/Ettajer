import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import { isValidThemeId } from "@/lib/themes";
import { STORE_FONTS } from "@/lib/themes";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";
import {
  mergeSeoWithDesignTokens,
  parseDesignTokens,
  type StoreDesignTokens,
} from "@/lib/design-tokens";
import { revalidateStorefront } from "@/lib/builder/storefront-revalidate";

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      theme,
      primaryColor,
      secondaryColor,
      font,
      logo,
      websiteTemplateId,
      textColor,
      mutedColor,
      borderColor,
      buttonRadius,
    } = body;

    const data: Record<string, string | null> = {};

    if (theme !== undefined) {
      if (!isValidThemeId(theme)) {
        return NextResponse.json({ message: "Invalid theme" }, { status: 400 });
      }
      data.theme = theme;
    }

    if (primaryColor !== undefined) {
      if (!HEX_COLOR.test(primaryColor)) {
        return NextResponse.json({ message: "Invalid primary color" }, { status: 400 });
      }
      data.primaryColor = primaryColor;
    }

    if (secondaryColor !== undefined) {
      if (!HEX_COLOR.test(secondaryColor)) {
        return NextResponse.json({ message: "Invalid secondary color" }, { status: 400 });
      }
      data.secondaryColor = secondaryColor;
    }

    if (font !== undefined) {
      const validFont = STORE_FONTS.some((f) => f.value === font);
      if (!validFont) {
        return NextResponse.json({ message: "Invalid font" }, { status: 400 });
      }
      data.font = font;
    }

    if (logo !== undefined) {
      data.logo = logo;
    }

    if (websiteTemplateId !== undefined) {
      if (websiteTemplateId === null || websiteTemplateId === "") {
        data.websiteTemplateId = null;
      } else if (typeof websiteTemplateId === "string" && isWebsiteTemplateId(websiteTemplateId)) {
        data.websiteTemplateId = websiteTemplateId;
      } else {
        return NextResponse.json({ message: "Invalid website template" }, { status: 400 });
      }
    }

    const tokenPatch: StoreDesignTokens = {};
    let hasTokenPatch = false;
    if (textColor !== undefined) {
      if (textColor && !HEX_COLOR.test(textColor)) {
        return NextResponse.json({ message: "Invalid text color" }, { status: 400 });
      }
      tokenPatch.textColor = textColor || undefined;
      hasTokenPatch = true;
    }
    if (mutedColor !== undefined) {
      if (mutedColor && !HEX_COLOR.test(mutedColor)) {
        return NextResponse.json({ message: "Invalid muted color" }, { status: 400 });
      }
      tokenPatch.mutedColor = mutedColor || undefined;
      hasTokenPatch = true;
    }
    if (borderColor !== undefined) {
      if (borderColor && !HEX_COLOR.test(borderColor)) {
        return NextResponse.json({ message: "Invalid border color" }, { status: 400 });
      }
      tokenPatch.borderColor = borderColor || undefined;
      hasTokenPatch = true;
    }
    if (buttonRadius !== undefined) {
      tokenPatch.buttonRadius =
        typeof buttonRadius === "string" && buttonRadius.trim()
          ? buttonRadius.trim()
          : undefined;
      hasTokenPatch = true;
    }

    if (Object.keys(data).length === 0 && !hasTokenPatch) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const storeRow =
        Object.keys(data).length > 0
          ? await tx.store.update({ where: { id: store.id }, data })
          : await tx.store.findUniqueOrThrow({ where: { id: store.id } });

      let designTokens = parseDesignTokens(null);
      if (hasTokenPatch) {
        const settings = await tx.storeSettings.findUnique({
          where: { storeId: store.id },
          select: { seo: true },
        });
        const existing = parseDesignTokens(settings?.seo);
        const merged: StoreDesignTokens = { ...existing, ...tokenPatch };
        const seo = mergeSeoWithDesignTokens(settings?.seo, merged);
        await tx.storeSettings.upsert({
          where: { storeId: store.id },
          create: {
            storeId: store.id,
            seo: seo as Prisma.InputJsonValue,
          },
          update: { seo: seo as Prisma.InputJsonValue },
        });
        designTokens = merged;
      } else {
        const settings = await tx.storeSettings.findUnique({
          where: { storeId: store.id },
          select: { seo: true },
        });
        designTokens = parseDesignTokens(settings?.seo);
      }

      return { storeRow, designTokens };
    });

    revalidateStorefront(updated.storeRow.slug);

    return NextResponse.json({
      store: {
        id: updated.storeRow.id,
        name: updated.storeRow.name,
        slug: updated.storeRow.slug,
        logo: updated.storeRow.logo,
        theme: updated.storeRow.theme,
        primaryColor: updated.storeRow.primaryColor,
        secondaryColor: updated.storeRow.secondaryColor,
        font: updated.storeRow.font,
        websiteTemplateId: updated.storeRow.websiteTemplateId,
        currency: updated.storeRow.currency,
        textColor: updated.designTokens.textColor ?? null,
        mutedColor: updated.designTokens.mutedColor ?? null,
        borderColor: updated.designTokens.borderColor ?? null,
        buttonRadius: updated.designTokens.buttonRadius ?? null,
      },
    });
  } catch (error) {
    console.error("Theme update error:", error);
    return NextResponse.json({ message: "Failed to update theme" }, { status: 500 });
  }
}
