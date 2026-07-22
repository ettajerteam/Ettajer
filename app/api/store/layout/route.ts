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
import {
  mergeSeoWithLayoutRevision,
  parseLayoutRevision,
} from "@/lib/builder/layout-revision";
import { validateLayoutForPublish } from "@/lib/builder/layout-validate";
import { revalidateStorefront } from "@/lib/builder/storefront-revalidate";
import type { Prisma } from "@prisma/client";

export type LayoutField = "home" | "product" | "collection" | "blog-post";

function parseLayoutField(field: LayoutField, raw: unknown, theme: ThemeId): HomeLayout {
  switch (field) {
    case "product":
      return parseProductLayout(raw, theme);
    case "collection":
      return parseCollectionLayout(raw, theme);
    case "blog-post":
      return parseHomeLayout(raw, theme);
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
    case "blog-post":
      return serializeHomeLayout(layout);
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
      blogPostLayout?: unknown;
    };

    const theme = store.theme as ThemeId;
    const raw =
      field === "product"
        ? settingsExt?.productLayout
        : field === "collection"
          ? settingsExt?.collectionLayout
          : field === "blog-post"
            ? settingsExt?.blogPostLayout
            : settings?.homeLayout;

    const layout = parseLayoutField(field, raw, theme);
    const revision = parseLayoutRevision(settings?.seo);

    return NextResponse.json({ layout, field, revision });
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
    const expectedRevision =
      typeof body.expectedRevision === "number"
        ? body.expectedRevision
        : typeof body.expectedRevision === "string" && /^\d+$/.test(body.expectedRevision)
          ? Number.parseInt(body.expectedRevision, 10)
          : null;

    if (!layout || !Array.isArray(layout.sections)) {
      return NextResponse.json({ message: "Invalid layout" }, { status: 400 });
    }

    const validationIssues = validateLayoutForPublish(layout);
    const blocking = validationIssues.filter(
      (i) =>
        i.code === "TOO_MANY_SECTIONS" ||
        i.code === "PAYLOAD_TOO_LARGE" ||
        i.code === "UNIMPLEMENTED_BLOCK" ||
        i.code === "INVALID_LAYOUT" ||
        i.code === "INVALID_SECTIONS" ||
        i.code === "DUPLICATE_SECTION_ID"
    );
    if (blocking.length > 0) {
      return NextResponse.json(
        {
          message: blocking[0]!.message,
          code: "LAYOUT_VALIDATION",
          issues: validationIssues,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.storeSettings.findUnique({
      where: { storeId: store.id },
      select: { seo: true },
    });
    const currentRevision = parseLayoutRevision(existing?.seo);

    if (expectedRevision != null && expectedRevision !== currentRevision) {
      return NextResponse.json(
        {
          message: "Layout was updated elsewhere. Reload before going live.",
          code: "LAYOUT_REVISION_CONFLICT",
          revision: currentRevision,
        },
        { status: 409 }
      );
    }

    const theme = store.theme as ThemeId;
    const serialized = serializeLayoutField(field, parseLayoutField(field, layout, theme));
    const shouldBump = body.bumpRevision !== false;
    const nextRevision = shouldBump ? currentRevision + 1 : currentRevision;
    const seo = mergeSeoWithLayoutRevision(existing?.seo, nextRevision);

    const updateData =
      field === "product"
        ? {
            productLayout: serialized as object,
            ...(shouldBump ? { seo: seo as Prisma.InputJsonValue } : {}),
          }
        : field === "collection"
          ? {
              collectionLayout: serialized as object,
              ...(shouldBump ? { seo: seo as Prisma.InputJsonValue } : {}),
            }
          : field === "blog-post"
            ? {
                blogPostLayout: serialized as object,
                ...(shouldBump ? { seo: seo as Prisma.InputJsonValue } : {}),
              }
            : {
                homeLayout: serialized as object,
                ...(shouldBump ? { seo: seo as Prisma.InputJsonValue } : {}),
              };

    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        ...updateData,
      },
      update: updateData,
    });

    revalidateStorefront(store.slug);

    return NextResponse.json({ layout: serialized, field, revision: nextRevision });
  } catch (error) {
    console.error("Layout update error:", error);
    return NextResponse.json({ message: "Failed to update layout" }, { status: 500 });
  }
}
