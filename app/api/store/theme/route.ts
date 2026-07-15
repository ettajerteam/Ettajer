import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import { isValidThemeId } from "@/lib/themes";
import { STORE_FONTS } from "@/lib/themes";

const HEX_COLOR = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { theme, primaryColor, secondaryColor, font, logo } = body;

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

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data,
    });

    return NextResponse.json({
      store: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        logo: updated.logo,
        theme: updated.theme,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        font: updated.font,
        currency: updated.currency,
      },
    });
  } catch (error) {
    console.error("Theme update error:", error);
    return NextResponse.json({ message: "Failed to update theme" }, { status: 500 });
  }
}
