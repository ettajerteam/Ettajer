import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedStore } from "@/lib/products";
import {
  createEmailTemplate,
  createEmailTemplateFromGallery,
  deleteEmailTemplate,
  listEmailGallery,
  listEmailTemplates,
  serializeEmailTemplate,
  updateEmailTemplate,
} from "@/lib/email-marketing/templates";
import { isNewsletterTemplateId } from "@/lib/email/newsletter-templates";
import { isNewsletterThemeId } from "@/lib/email/newsletter-themes";
import { prisma } from "@/lib/db";
import { parseEmailBlocks } from "@/lib/email-marketing/email-blocks";

export const dynamic = "force-dynamic";

const emailBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("product"),
  productId: z.string().min(1),
  selectedOptions: z.record(z.string()).optional(),
  buttonLabel: z.string().trim().max(80).optional(),
  showComparePrice: z.boolean().optional(),
  showDiscountBadge: z.boolean().optional(),
  showVariant: z.boolean().optional(),
});

export async function GET() {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const templates = await listEmailTemplates(store.id);
    return NextResponse.json({
      templates: templates.map(serializeEmailTemplate),
      gallery: listEmailGallery(),
    });
  } catch (error) {
    console.error("[email/templates GET]", error);
    return NextResponse.json(
      { message: "Failed to load templates" },
      { status: 500 }
    );
  }
}

const createSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("gallery"),
    galleryId: z.string().min(1),
    name: z.string().trim().max(120).optional(),
  }),
  z.object({
    mode: z.literal("custom"),
    name: z.string().trim().min(1).max(120),
    themeId: z.string().min(1),
    subject: z.string().trim().min(1).max(200),
    title: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(5000),
    ctaLabel: z.string().trim().max(80).optional().default(""),
    ctaUrl: z.string().trim().max(500).optional().default(""),
    galleryId: z.string().optional().nullable(),
    blocks: z.array(emailBlockSchema).max(20).optional().default([]),
  }),
]);

export async function POST(request: Request) {
  try {
    const authStore = await getAuthenticatedStore();
    if (!authStore) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: authStore.id },
      select: { id: true, name: true },
    });
    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    const parsed = createSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    if (parsed.data.mode === "gallery") {
      if (!isNewsletterTemplateId(parsed.data.galleryId)) {
        return NextResponse.json(
          { message: "Unknown gallery template" },
          { status: 400 }
        );
      }
      const row = await createEmailTemplateFromGallery({
        storeId: store.id,
        galleryId: parsed.data.galleryId,
        storeName: store.name,
        name: parsed.data.name,
      });
      return NextResponse.json(
        { template: serializeEmailTemplate(row) },
        { status: 201 }
      );
    }

    if (!isNewsletterThemeId(parsed.data.themeId)) {
      return NextResponse.json({ message: "Unknown theme" }, { status: 400 });
    }

    const row = await createEmailTemplate({
      storeId: store.id,
      name: parsed.data.name,
      themeId: parsed.data.themeId,
      subject: parsed.data.subject,
      title: parsed.data.title,
      body: parsed.data.body,
      ctaLabel: parsed.data.ctaLabel,
      ctaUrl: parsed.data.ctaUrl,
      galleryId: parsed.data.galleryId ?? null,
      blocks: parseEmailBlocks(parsed.data.blocks),
    });
    return NextResponse.json(
      { template: serializeEmailTemplate(row) },
      { status: 201 }
    );
  } catch (error) {
    console.error("[email/templates POST]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create template",
      },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(120),
  themeId: z.string().min(1),
  subject: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
  ctaLabel: z.string().trim().max(80).optional().default(""),
  ctaUrl: z.string().trim().max(500).optional().default(""),
  blocks: z.array(emailBlockSchema).max(20).optional().default([]),
});

export async function PATCH(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const parsed = patchSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }
    if (!isNewsletterThemeId(parsed.data.themeId)) {
      return NextResponse.json({ message: "Unknown theme" }, { status: 400 });
    }

    const row = await updateEmailTemplate(parsed.data.id, store.id, {
      ...parsed.data,
      blocks: parseEmailBlocks(parsed.data.blocks),
    });
    return NextResponse.json({ template: serializeEmailTemplate(row) });
  } catch (error) {
    console.error("[email/templates PATCH]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to update template",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const store = await getAuthenticatedStore();
    if (!store) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    await deleteEmailTemplate(id, store.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[email/templates DELETE]", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to delete template",
      },
      { status: 400 }
    );
  }
}
