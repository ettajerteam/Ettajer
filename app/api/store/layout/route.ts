import { NextResponse } from "next/server";
import { getAuthenticatedStore } from "@/lib/products";
import { prisma } from "@/lib/db";
import {
  parseCollectionLayout,
  parseHomeLayout,
  parseProductLayout,
  serializeCollectionLayout,
  serializeHomeLayout,
  serializeProductLayout,
} from "@/lib/sections/parse";
import type { HomeLayout } from "@/lib/sections/types";
import type { ThemeId } from "@/lib/themes";

export type LayoutField = "home" | "product" | "collection";

function parseLayoutField(field: LayoutField, raw: unknown, theme: ThemeId): HomeLayout {
  switch (field) {
    case "product":
      return parseProductLayout(raw, theme);
    case "collection":
      return parseCollectionLayout(raw, theme);
    default:
      return parseHomeLayout(raw, theme);
  }
}

function serializeLayoutField(field: LayoutField, layout: HomeLayout): HomeLayout {
  switch (field) {
    case "product":
      return serializeProductLayout(layout);
    case "collection":
      return serializeCollectionLayout(layout);
    default:
      return serializeHomeLayout(layout);
  }
}

export async function GET(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const field = (searchParams.get("field") ?? "home") as LayoutField;

    const settings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
    });
    const settingsExt = settings as typeof settings & {
      productLayout?: unknown;
      collectionLayout?: unknown;
    };

    const theme = store.theme as ThemeId;
    const raw =
      field === "product"
        ? settingsExt?.productLayout
        : field === "collection"
          ? settingsExt?.collectionLayout
          : settings?.homeLayout;

    const layout = parseLayoutField(field, raw, theme);

    return NextResponse.json({ layout, field });
  } catch (error) {
    console.error("Layout fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch layout" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const layout = body.layout as HomeLayout | undefined;
    const field = (body.field ?? "home") as LayoutField;

    if (!layout || !Array.isArray(layout.sections)) {
      return NextResponse.json({ message: "Invalid layout" }, { status: 400 });
    }

    const theme = store.theme as ThemeId;
    const serialized = serializeLayoutField(field, parseLayoutField(field, layout, theme));

    const updateData =
      field === "product"
        ? { productLayout: serialized as object }
        : field === "collection"
          ? { collectionLayout: serialized as object }
          : { homeLayout: serialized as object };

    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        ...updateData,
      },
      update: updateData,
    });

    return NextResponse.json({ layout: serialized, field });
  } catch (error) {
    console.error("Layout update error:", error);
    return NextResponse.json({ message: "Failed to update layout" }, { status: 500 });
  }
}
