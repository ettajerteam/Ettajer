import type { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import type { StoreSection } from "@/lib/sections/types";
import { serializePageContent } from "@/lib/page-content";
import { logDeveloperAction } from "@/lib/developer/audit";
import type { DeveloperAuthContext } from "@/lib/developer/auth-context";
import { DeveloperApiError } from "@/lib/developer/errors";
import {
  asThemeDocument,
  emptyThemeDocument,
  type StoreThemeDocumentV1,
  type TemplateKey,
} from "@/lib/developer/theme-document";
import {
  assertSectionType,
  sanitizeThemeText,
  validateThemeDocument,
} from "@/lib/developer/theme-validate";
import { PROTECTED_LIVE_PAGE_SLUGS } from "@/lib/developer/storefront-theme-resolve";

function newId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function serializeTheme(theme: {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  source: string;
  provider: string;
  visibility: string;
  status: string;
  document: unknown;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdByApplicationId: string | null;
}) {
  const doc = asThemeDocument(theme.document);
  return {
    id: theme.id,
    storeId: theme.storeId,
    name: theme.name,
    description: theme.description,
    source: theme.source,
    provider: theme.provider,
    visibility: theme.visibility,
    status: theme.status,
    document: doc,
    sectionCount:
      doc.templates.home.sections.length +
      (doc.templates.product?.sections.length ?? 0) +
      (doc.templates.collection?.sections.length ?? 0) +
      doc.pages.reduce((n, p) => n + p.layout.sections.length, 0),
    publishedAt: theme.publishedAt?.toISOString() ?? null,
    createdAt: theme.createdAt.toISOString(),
    updatedAt: theme.updatedAt.toISOString(),
    createdByApplicationId: theme.createdByApplicationId,
  };
}

async function getOwnedTheme(storeId: string, themeId: string) {
  const theme = await prisma.storeTheme.findFirst({
    where: { id: themeId, storeId },
  });
  if (!theme) throw new DeveloperApiError("NOT_FOUND", "Theme not found.");
  return theme;
}

/** Exported for preview-token ownership checks. */
export async function assertOwnedTheme(storeId: string, themeId: string) {
  return getOwnedTheme(storeId, themeId);
}

export async function listStoreThemes(
  storeId: string,
  options?: { includeArchived?: boolean },
) {
  const themes = await prisma.storeTheme.findMany({
    where: {
      storeId,
      ...(options?.includeArchived ? {} : { status: { not: "archived" } }),
    },
    orderBy: { updatedAt: "desc" },
  });
  return themes.map(serializeTheme);
}

export async function getStoreTheme(storeId: string, themeId: string) {
  return serializeTheme(await getOwnedTheme(storeId, themeId));
}

export async function createStoreTheme(
  ctx: DeveloperAuthContext,
  input: {
    name: string;
    description?: string;
    provider?: string;
    document?: unknown;
  },
) {
  const base = emptyThemeDocument();
  const merged = input.document
    ? await validateThemeDocument(ctx.storeId, {
        ...base,
        ...(input.document as object),
      })
    : base;

  const theme = await prisma.storeTheme.create({
    data: {
      storeId: ctx.storeId,
      name: input.name.trim() || "Untitled theme",
      description: input.description?.trim() || null,
      source: "ai",
      provider: input.provider?.trim() || "other",
      visibility: "private",
      status: "draft",
      document: merged as unknown as Prisma.InputJsonValue,
      createdByApplicationId: ctx.applicationId,
      createdByUserId: ctx.userId,
    },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.created",
    resource: "theme",
    resourceId: theme.id,
    metadata: { name: theme.name, provider: theme.provider },
  });

  return serializeTheme(theme);
}

export async function updateStoreTheme(
  ctx: DeveloperAuthContext,
  themeId: string,
  input: {
    name?: string;
    description?: string | null;
    document?: unknown;
    provider?: string;
  },
) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  if (existing.status === "archived") {
    throw new DeveloperApiError("FORBIDDEN", "Archived themes cannot be edited.");
  }

  let document = asThemeDocument(existing.document);
  if (input.document !== undefined) {
    document = await validateThemeDocument(ctx.storeId, input.document);
  }

  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.provider !== undefined ? { provider: input.provider } : {}),
      document: document as unknown as Prisma.InputJsonValue,
      // Editing an active theme moves it back to draft until republished
      ...(existing.status === "active" && input.document !== undefined
        ? { status: "draft" }
        : {}),
    },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.updated",
    resource: "theme",
    resourceId: theme.id,
  });

  return serializeTheme(theme);
}

export async function duplicateStoreTheme(ctx: DeveloperAuthContext, themeId: string) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const document = await validateThemeDocument(ctx.storeId, existing.document);
  const theme = await prisma.storeTheme.create({
    data: {
      storeId: ctx.storeId,
      name: `${existing.name} (copy)`,
      description: existing.description,
      source: existing.source,
      provider: existing.provider,
      visibility: "private",
      status: "draft",
      document: document as unknown as Prisma.InputJsonValue,
      createdByApplicationId: ctx.applicationId,
      createdByUserId: ctx.userId,
    },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.duplicated",
    resource: "theme",
    resourceId: theme.id,
    metadata: { from: themeId },
  });

  return serializeTheme(theme);
}

export async function createThemePage(
  ctx: DeveloperAuthContext,
  themeId: string,
  input: { slug: string; title: string; layout?: unknown },
) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new DeveloperApiError("VALIDATION_ERROR", "Invalid page slug.");
  if (["products", "cart", "checkout", "collections", "search"].includes(slug)) {
    throw new DeveloperApiError(
      "VALIDATION_ERROR",
      "Cannot replace system commerce routes with a theme page.",
    );
  }
  if (doc.pages.some((p) => p.slug === slug)) {
    throw new DeveloperApiError("VALIDATION_ERROR", "Page slug already exists in theme.");
  }

  const layout = input.layout
    ? ((await validateThemeDocument(ctx.storeId, {
        ...doc,
        pages: [
          ...doc.pages,
          {
            slug,
            title: String(sanitizeThemeText(input.title) ?? slug),
            layout: input.layout as StoreThemeDocumentV1["pages"][0]["layout"],
          },
        ],
      })).pages.find((p) => p.slug === slug)?.layout ?? {
        version: 1 as const,
        sections: [],
      })
    : { version: 1 as const, sections: [] };

  doc.pages.push({
    id: newId("page"),
    slug,
    title: String(sanitizeThemeText(input.title.trim() || slug)),
    layout,
    status: "draft",
  });

  const validated = await validateThemeDocument(ctx.storeId, doc);

  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { document: validated as unknown as Prisma.InputJsonValue, status: "draft" },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "page.created",
    resource: "theme_page",
    resourceId: slug,
    metadata: { themeId },
  });

  return serializeTheme(theme);
}

export async function updateThemePage(
  ctx: DeveloperAuthContext,
  themeId: string,
  pageId: string,
  input: { title?: string; slug?: string; layout?: unknown; status?: string },
) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);
  const page = doc.pages.find((p) => p.id === pageId || p.slug === pageId);
  if (!page) throw new DeveloperApiError("NOT_FOUND", "Page not found.");

  if (input.title !== undefined) {
    page.title = String(sanitizeThemeText(input.title.trim()));
  }
  if (input.slug !== undefined) {
    page.slug = input.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (input.status === "published" || input.status === "draft") {
    page.status = input.status;
  }
  if (input.layout !== undefined) {
    page.layout = input.layout as StoreThemeDocumentV1["pages"][0]["layout"];
  }

  const validated = await validateThemeDocument(ctx.storeId, doc);

  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { document: validated as unknown as Prisma.InputJsonValue, status: "draft" },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "page.updated",
    resource: "theme_page",
    resourceId: page.slug,
    metadata: { themeId },
  });

  return serializeTheme(theme);
}

export async function deleteThemePage(
  ctx: DeveloperAuthContext,
  themeId: string,
  pageId: string,
) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);
  const before = doc.pages.length;
  doc.pages = doc.pages.filter((p) => p.id !== pageId && p.slug !== pageId);
  if (doc.pages.length === before) {
    throw new DeveloperApiError("NOT_FOUND", "Page not found.");
  }
  const validated = await validateThemeDocument(ctx.storeId, doc);
  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { document: validated as unknown as Prisma.InputJsonValue, status: "draft" },
  });
  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "page.deleted",
    resource: "theme_page",
    resourceId: pageId,
    metadata: { themeId },
  });
  return serializeTheme(theme);
}

export async function createThemeSection(
  ctx: DeveloperAuthContext,
  themeId: string,
  input: {
    templateKey?: TemplateKey;
    pageId?: string;
    sectionType: string;
    settings?: Record<string, unknown>;
    label?: string;
    index?: number;
  },
) {
  assertSectionType(input.sectionType);
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);

  const section: StoreSection = {
    id: newId("sec"),
    type: input.sectionType,
    settings: sanitizeThemeText(input.settings ?? {}) as StoreSection["settings"],
    visible: true,
    label: input.label,
  };

  const target = resolveMutableSections(doc, input.templateKey ?? "home", input.pageId);
  if (typeof input.index === "number" && input.index >= 0 && input.index <= target.length) {
    target.splice(input.index, 0, section);
  } else {
    target.push(section);
  }

  await validateThemeDocument(ctx.storeId, doc);

  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { document: doc as unknown as Prisma.InputJsonValue, status: "draft" },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.section_created",
    resource: "theme_section",
    resourceId: section.id,
    metadata: { themeId, type: section.type },
  });

  return { theme: serializeTheme(theme), section };
}

export async function updateThemeSection(
  ctx: DeveloperAuthContext,
  themeId: string,
  sectionId: string,
  input: {
    templateKey?: TemplateKey;
    pageId?: string;
    settings?: Record<string, unknown>;
    label?: string;
    visible?: boolean;
    type?: string;
  },
) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);
  const sections = resolveMutableSections(
    doc,
    input.templateKey ?? "home",
    input.pageId,
  );
  const section = sections.find((s) => s.id === sectionId);
  if (!section) throw new DeveloperApiError("NOT_FOUND", "Section not found.");

  if (input.type) {
    assertSectionType(input.type);
    section.type = input.type;
  }
  if (input.settings !== undefined) {
    section.settings = sanitizeThemeText(input.settings) as StoreSection["settings"];
  }
  if (input.label !== undefined) section.label = input.label;
  if (input.visible !== undefined) section.visible = input.visible;

  await validateThemeDocument(ctx.storeId, doc);

  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { document: doc as unknown as Prisma.InputJsonValue, status: "draft" },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.section_updated",
    resource: "theme_section",
    resourceId: sectionId,
    metadata: { themeId },
  });

  return { theme: serializeTheme(theme), section };
}

export async function deleteThemeSection(
  ctx: DeveloperAuthContext,
  themeId: string,
  sectionId: string,
  input?: { templateKey?: TemplateKey; pageId?: string },
) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);
  const sections = resolveMutableSections(
    doc,
    input?.templateKey ?? "home",
    input?.pageId,
  );
  const idx = sections.findIndex((s) => s.id === sectionId);
  if (idx < 0) throw new DeveloperApiError("NOT_FOUND", "Section not found.");
  sections.splice(idx, 1);

  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { document: doc as unknown as Prisma.InputJsonValue, status: "draft" },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.section_deleted",
    resource: "theme_section",
    resourceId: sectionId,
    metadata: { themeId },
  });

  return serializeTheme(theme);
}

function resolveMutableSections(
  doc: StoreThemeDocumentV1,
  templateKey: TemplateKey,
  pageId?: string,
): StoreSection[] {
  if (pageId) {
    const page = doc.pages.find((p) => p.id === pageId || p.slug === pageId);
    if (!page) throw new DeveloperApiError("NOT_FOUND", "Page not found.");
    return page.layout.sections;
  }
  if (templateKey === "home") return doc.templates.home.sections;
  if (templateKey === "product") {
    if (!doc.templates.product) doc.templates.product = { version: 1, sections: [] };
    return doc.templates.product.sections;
  }
  if (templateKey === "collection") {
    if (!doc.templates.collection) {
      doc.templates.collection = { version: 1, sections: [] };
    }
    return doc.templates.collection.sections;
  }
  if (templateKey === "blogPost") {
    if (!doc.templates.blogPost) doc.templates.blogPost = { version: 1, sections: [] };
    return doc.templates.blogPost.sections;
  }
  throw new DeveloperApiError("VALIDATION_ERROR", "Invalid template key.");
}

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Apply a validated theme document to the live store inside an existing transaction.
 * Idempotent: upserts by page slug, deletes orphan custom pages, no duplicates.
 */
export async function applyValidatedThemeToLiveStore(
  tx: TxClient,
  input: { storeId: string; themeId: string; doc: StoreThemeDocumentV1 },
) {
  const { storeId, themeId, doc } = input;

  await tx.store.update({
    where: { id: storeId },
    data: {
      theme: doc.theme.theme,
      primaryColor: doc.theme.primaryColor,
      secondaryColor: doc.theme.secondaryColor,
      font: doc.theme.font,
      ...(doc.theme.logo ? { logo: doc.theme.logo } : {}),
      websiteTemplateId: `private:${themeId}`,
    },
  });

  await tx.storeSettings.update({
    where: { storeId },
    data: {
      homeLayout: doc.templates.home as unknown as Prisma.InputJsonValue,
      navigation: doc.navigation as unknown as Prisma.InputJsonValue,
      ...(doc.templates.product
        ? { productLayout: doc.templates.product as unknown as Prisma.InputJsonValue }
        : {}),
      ...(doc.templates.collection
        ? { collectionLayout: doc.templates.collection as unknown as Prisma.InputJsonValue }
        : {}),
      ...(doc.templates.blogPost
        ? { blogPostLayout: doc.templates.blogPost as unknown as Prisma.InputJsonValue }
        : {}),
    },
  });

  const draftSlugs = Array.from(new Set(doc.pages.map((p) => p.slug)));
  const keepSlugs = Array.from(
    new Set([...draftSlugs, ...(PROTECTED_LIVE_PAGE_SLUGS as readonly string[])]),
  );

  for (const page of doc.pages) {
    const content = serializePageContent({
      body: "",
      layout: page.layout,
    });
    const existingPage = await tx.storePage.findFirst({
      where: { storeId, slug: page.slug },
    });
    if (existingPage) {
      await tx.storePage.update({
        where: { id: existingPage.id },
        data: {
          title: page.title,
          content,
          status: page.status === "draft" ? "draft" : "published",
        },
      });
    } else {
      await tx.storePage.create({
        data: {
          storeId,
          slug: page.slug,
          title: page.title,
          content,
          status: page.status === "draft" ? "draft" : "published",
        },
      });
    }
  }

  // Exact live representation: remove custom pages no longer in the draft.
  await tx.storePage.deleteMany({
    where: {
      storeId,
      slug: { notIn: keepSlugs },
    },
  });

  await tx.storeTheme.updateMany({
    where: { storeId, status: "active", id: { not: themeId } },
    data: { status: "archived" },
  });

  await tx.storeTheme.update({
    where: { id: themeId },
    data: {
      status: "active",
      publishedAt: new Date(),
      document: doc as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function publishStoreTheme(ctx: DeveloperAuthContext, themeId: string) {
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = await validateThemeDocument(ctx.storeId, existing.document);

  await prisma.$transaction(async (tx) => {
    await applyValidatedThemeToLiveStore(tx, {
      storeId: ctx.storeId,
      themeId,
      doc,
    });
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.published",
    resource: "theme",
    resourceId: themeId,
  });

  return getStoreTheme(ctx.storeId, themeId);
}

export async function archiveStoreTheme(ctx: DeveloperAuthContext, themeId: string) {
  await getOwnedTheme(ctx.storeId, themeId);
  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: { status: "archived" },
  });
  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.unpublished",
    resource: "theme",
    resourceId: themeId,
  });
  return serializeTheme(theme);
}

export type ThemeBatchOp =
  | {
      op: "upsert_page";
      slug: string;
      title: string;
      layout?: unknown;
      pageId?: string;
    }
  | {
      op: "update_page";
      pageId: string;
      title?: string;
      slug?: string;
      layout?: unknown;
      status?: string;
    }
  | { op: "delete_page"; pageId: string }
  | {
      op: "create_section";
      templateKey?: TemplateKey;
      pageId?: string;
      sectionType: string;
      settings?: Record<string, unknown>;
      label?: string;
      index?: number;
      sectionId?: string;
    }
  | {
      op: "update_section";
      sectionId: string;
      templateKey?: TemplateKey;
      pageId?: string;
      settings?: Record<string, unknown>;
      label?: string;
      visible?: boolean;
      type?: string;
    }
  | {
      op: "delete_section";
      sectionId: string;
      templateKey?: TemplateKey;
      pageId?: string;
    }
  | {
      op: "set_theme_tokens";
      theme?: Partial<StoreThemeDocumentV1["theme"]>;
      name?: string;
      description?: string | null;
    }
  | { op: "set_navigation"; navigation: unknown };

/**
 * Apply multiple draft theme mutations in one load/validate/write cycle.
 * Fail-closed: no DB write if any op or final validation fails.
 */
export async function applyThemeBatch(
  ctx: DeveloperAuthContext,
  themeId: string,
  ops: ThemeBatchOp[],
) {
  if (!Array.isArray(ops) || ops.length === 0) {
    throw new DeveloperApiError("VALIDATION_ERROR", "ops must be a non-empty array.", {
      hint: "Pass ops: [{ op: 'create_section', sectionType: 'hero', ... }, ...]",
    });
  }
  if (ops.length > 50) {
    throw new DeveloperApiError("VALIDATION_ERROR", "Batch limited to 50 operations.");
  }

  const { validateNavigation } = await import("@/lib/developer/theme-validate");
  const existing = await getOwnedTheme(ctx.storeId, themeId);
  const doc = asThemeDocument(existing.document);
  let name = existing.name;
  let description = existing.description;
  const applied: Array<{ op: string; ok: true; detail?: string }> = [];

  for (let i = 0; i < ops.length; i++) {
    const item = ops[i];
    try {
      switch (item.op) {
        case "set_theme_tokens": {
          if (item.theme) {
            doc.theme = {
              ...doc.theme,
              ...(sanitizeThemeText(item.theme) as StoreThemeDocumentV1["theme"]),
            };
          }
          if (item.name !== undefined) name = String(sanitizeThemeText(item.name)).trim() || name;
          if (item.description !== undefined) {
            description =
              item.description === null
                ? null
                : String(sanitizeThemeText(item.description));
          }
          applied.push({ op: item.op, ok: true });
          break;
        }
        case "set_navigation": {
          doc.navigation = validateNavigation(item.navigation);
          applied.push({ op: item.op, ok: true });
          break;
        }
        case "upsert_page": {
          const slug = item.slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]+/g, "-")
            .replace(/^-|-$/g, "");
          if (!slug) throw new DeveloperApiError("VALIDATION_ERROR", "Invalid page slug.");
          if (
            ["products", "cart", "checkout", "collections", "search"].includes(slug)
          ) {
            throw new DeveloperApiError(
              "VALIDATION_ERROR",
              "Cannot replace system commerce routes with a theme page.",
            );
          }
          let page = item.pageId
            ? doc.pages.find((p) => p.id === item.pageId || p.slug === item.pageId)
            : doc.pages.find((p) => p.slug === slug);
          if (!page) {
            page = {
              id: newId("page"),
              slug,
              title: String(sanitizeThemeText(item.title.trim() || slug)),
              layout: { version: 1 as const, sections: [] },
              status: "draft",
            };
            doc.pages.push(page);
          } else {
            page.slug = slug;
            page.title = String(sanitizeThemeText(item.title.trim() || slug));
          }
          if (item.layout !== undefined) {
            page.layout = item.layout as StoreThemeDocumentV1["pages"][0]["layout"];
          }
          applied.push({ op: item.op, ok: true, detail: page.id });
          break;
        }
        case "update_page": {
          const page = doc.pages.find(
            (p) => p.id === item.pageId || p.slug === item.pageId,
          );
          if (!page) throw new DeveloperApiError("NOT_FOUND", "Page not found.");
          if (item.title !== undefined) {
            page.title = String(sanitizeThemeText(item.title.trim()));
          }
          if (item.slug !== undefined) {
            page.slug = item.slug
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9-]+/g, "-")
              .replace(/^-|-$/g, "");
          }
          if (item.status === "published" || item.status === "draft") {
            page.status = item.status;
          }
          if (item.layout !== undefined) {
            page.layout = item.layout as StoreThemeDocumentV1["pages"][0]["layout"];
          }
          applied.push({ op: item.op, ok: true, detail: page.id });
          break;
        }
        case "delete_page": {
          const idx = doc.pages.findIndex(
            (p) => p.id === item.pageId || p.slug === item.pageId,
          );
          if (idx < 0) throw new DeveloperApiError("NOT_FOUND", "Page not found.");
          doc.pages.splice(idx, 1);
          applied.push({ op: item.op, ok: true });
          break;
        }
        case "create_section": {
          assertSectionType(item.sectionType);
          const section: StoreSection = {
            id: item.sectionId || newId("sec"),
            type: item.sectionType,
            settings: sanitizeThemeText(
              item.settings ?? {},
            ) as StoreSection["settings"],
            visible: true,
            label: item.label,
          };
          const target = resolveMutableSections(
            doc,
            item.templateKey ?? "home",
            item.pageId,
          );
          if (
            typeof item.index === "number" &&
            item.index >= 0 &&
            item.index <= target.length
          ) {
            target.splice(item.index, 0, section);
          } else {
            target.push(section);
          }
          applied.push({ op: item.op, ok: true, detail: section.id });
          break;
        }
        case "update_section": {
          const sections = resolveMutableSections(
            doc,
            item.templateKey ?? "home",
            item.pageId,
          );
          const section = sections.find((s) => s.id === item.sectionId);
          if (!section) throw new DeveloperApiError("NOT_FOUND", "Section not found.");
          if (item.type) {
            assertSectionType(item.type);
            section.type = item.type;
          }
          if (item.settings !== undefined) {
            section.settings = sanitizeThemeText(
              item.settings,
            ) as StoreSection["settings"];
          }
          if (item.label !== undefined) section.label = item.label;
          if (item.visible !== undefined) section.visible = item.visible;
          applied.push({ op: item.op, ok: true, detail: section.id });
          break;
        }
        case "delete_section": {
          const sections = resolveMutableSections(
            doc,
            item.templateKey ?? "home",
            item.pageId,
          );
          const idx = sections.findIndex((s) => s.id === item.sectionId);
          if (idx < 0) throw new DeveloperApiError("NOT_FOUND", "Section not found.");
          sections.splice(idx, 1);
          applied.push({ op: item.op, ok: true });
          break;
        }
        default:
          throw new DeveloperApiError(
            "VALIDATION_ERROR",
            `Unknown batch op at index ${i}.`,
            {
              hint: "Supported: upsert_page, update_page, delete_page, create_section, update_section, delete_section, set_theme_tokens, set_navigation",
            },
          );
      }
    } catch (err) {
      if (err instanceof DeveloperApiError) {
        throw new DeveloperApiError(err.code, err.message, {
          ...(typeof err.details === "object" && err.details
            ? (err.details as object)
            : {}),
          batchIndex: i,
          op: (item as { op?: string }).op,
          hint:
            (err.details as { hint?: string } | undefined)?.hint ??
            "Fix the failing op and retry the full batch. No partial writes occurred.",
        });
      }
      throw err;
    }
  }

  const validated = await validateThemeDocument(ctx.storeId, doc);
  const theme = await prisma.storeTheme.update({
    where: { id: themeId },
    data: {
      document: validated as unknown as Prisma.InputJsonValue,
      status: "draft",
      name,
      description,
    },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "theme.batch_updated",
    resource: "theme",
    resourceId: themeId,
    metadata: { ops: applied.length },
  });

  return { theme: serializeTheme(theme), applied };
}

/** Merchant-session publish helper (dashboard). */
export async function publishStoreThemeAsMerchant(input: {
  storeId: string;
  userId: string;
  themeId: string;
}) {
  const existing = await getOwnedTheme(input.storeId, input.themeId);
  const doc = await validateThemeDocument(input.storeId, existing.document);

  await prisma.$transaction(async (tx) => {
    await applyValidatedThemeToLiveStore(tx, {
      storeId: input.storeId,
      themeId: input.themeId,
      doc,
    });
  });

  await logDeveloperAction({
    userId: input.userId,
    storeId: input.storeId,
    actorType: "merchant",
    action: "theme.published",
    resource: "theme",
    resourceId: input.themeId,
  });

  return getStoreTheme(input.storeId, input.themeId);
}

/** Merchant-session draft save (visual editor Customize flow). */
export async function saveStoreThemeAsMerchant(input: {
  storeId: string;
  userId: string;
  themeId: string;
  document: unknown;
  name?: string;
  description?: string | null;
}) {
  await getOwnedTheme(input.storeId, input.themeId);
  const document = await validateThemeDocument(input.storeId, input.document);
  const theme = await prisma.storeTheme.update({
    where: { id: input.themeId },
    data: {
      document: document as unknown as Prisma.InputJsonValue,
      status: "draft",
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });
  await logDeveloperAction({
    userId: input.userId,
    storeId: input.storeId,
    actorType: "merchant",
    action: "theme.draft_saved",
    resource: "theme",
    resourceId: input.themeId,
  });
  return serializeTheme(theme);
}
