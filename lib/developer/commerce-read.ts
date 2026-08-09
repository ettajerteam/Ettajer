import { prisma } from "@/lib/db";
import { DeveloperApiError } from "@/lib/developer/errors";
import type { DeveloperAuthContext } from "@/lib/developer/auth-context";
import {
  clampListLimit,
  paginateRows,
  assertListCursor,
} from "@/lib/developer/pagination";
import { buildWorkflowNext } from "@/lib/developer/workflow-next";

export async function getStoreForContext(ctx: DeveloperAuthContext) {
  const store = await prisma.store.findFirst({
    where: { id: ctx.storeId, userId: ctx.userId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      description: true,
      category: true,
      businessModel: true,
      websiteTemplateId: true,
      currency: true,
      primaryColor: true,
      secondaryColor: true,
      font: true,
      theme: true,
      contactEmail: true,
      phone: true,
      language: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!store) {
    throw new DeveloperApiError("NOT_FOUND", "Store not found for this token.");
  }
  return store;
}

export async function getSanitizedStoreSettings(storeId: string) {
  const settings = await prisma.storeSettings.findUnique({
    where: { storeId },
  });
  if (!settings) return null;

  return {
    customDomain: settings.customDomain,
    domainPrimary: settings.domainPrimary,
    seo: settings.seo,
    navigation: settings.navigation,
    homeLayoutSections: Array.isArray(settings.homeLayout)
      ? (settings.homeLayout as unknown[]).length
      : typeof settings.homeLayout === "object" &&
          settings.homeLayout &&
          "sections" in (settings.homeLayout as object)
        ? ((settings.homeLayout as { sections?: unknown[] }).sections?.length ?? 0)
        : 0,
    hasProductLayout: Boolean(settings.productLayout),
    hasCollectionLayout: Boolean(settings.collectionLayout),
  };
}

const productListSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  comparePrice: true,
  inventory: true,
  status: true,
  productType: true,
  images: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function listProductsForStore(
  storeId: string,
  opts?: { limit?: number; cursor?: string },
) {
  return fetchProducts(storeId, opts);
}

async function fetchProducts(
  storeId: string,
  opts?: { limit?: number; cursor?: string },
) {
  const limit = clampListLimit(opts?.limit);
  const cursor = assertListCursor(opts?.cursor);
  const rows = await prisma.product.findMany({
    where: { storeId },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: productListSelect,
  });
  return paginateRows(rows, limit);
}

export async function getProductForStore(storeId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      comparePrice: true,
      inventory: true,
      sku: true,
      status: true,
      productType: true,
      images: true,
      variants: true,
      tags: true,
      details: true,
      seo: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!product) throw new DeveloperApiError("NOT_FOUND", "Product not found.");
  return product;
}

export async function listCollectionsForStore(
  storeId: string,
  opts?: { limit?: number; cursor?: string },
) {
  const limit = clampListLimit(opts?.limit, { defaultLimit: 100 });
  const cursor = assertListCursor(opts?.cursor);
  const rows = await prisma.collection.findMany({
    where: { storeId },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      featured: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { products: true } },
    },
  });
  return paginateRows(rows, limit);
}

export async function getCollectionForStore(storeId: string, id: string) {
  const collection = await prisma.collection.findFirst({
    where: { id, storeId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      featured: true,
      products: {
        select: { id: true, title: true, slug: true, price: true, images: true },
        take: 50,
      },
    },
  });
  if (!collection) throw new DeveloperApiError("NOT_FOUND", "Collection not found.");
  return collection;
}

export async function listOrdersForStore(
  storeId: string,
  opts?: { limit?: number; cursor?: string },
) {
  const limit = clampListLimit(opts?.limit, { defaultLimit: 25 });
  const cursor = assertListCursor(opts?.cursor);
  const rows = await prisma.order.findMany({
    where: { storeId },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      total: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return paginateRows(rows, limit);
}

export async function getOrderForStore(storeId: string, id: string) {
  const order = await prisma.order.findFirst({
    where: { id, storeId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      paymentMethod: true,
      subtotal: true,
      shipping: true,
      total: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      shippingAddress: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          productId: true,
          variant: true,
        },
      },
    },
  });
  if (!order) throw new DeveloperApiError("NOT_FOUND", "Order not found.");
  return order;
}

export async function listCustomersForStore(
  storeId: string,
  opts?: { limit?: number; cursor?: string },
) {
  const limit = clampListLimit(opts?.limit);
  const cursor = assertListCursor(opts?.cursor);
  const rows = await prisma.customer.findMany({
    where: { storeId },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      tags: true,
      language: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return paginateRows(rows, limit);
}

export async function getCheckoutSummary(storeId: string) {
  const settings = await prisma.storeSettings.findUnique({
    where: { storeId },
    select: {
      shippingZones: true,
      paymentGateways: true,
    },
  });

  const gateways = (settings?.paymentGateways ?? {}) as Record<string, unknown>;
  const enabled: string[] = [];
  for (const [key, value] of Object.entries(gateways)) {
    if (value && typeof value === "object" && (value as { enabled?: boolean }).enabled) {
      enabled.push(key);
    }
  }

  return {
    cashOnDelivery: true,
    enabledGateways: enabled,
    shippingZoneCount: Array.isArray(settings?.shippingZones)
      ? settings!.shippingZones.length
      : 0,
  };
}

export async function listMediaForStore(
  storeId: string,
  opts?: { limit?: number; cursor?: string },
) {
  const limit = clampListLimit(opts?.limit);
  const cursor = assertListCursor(opts?.cursor);
  const rows = await prisma.mediaAsset.findMany({
    where: { storeId },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      url: true,
      filename: true,
      mimeType: true,
      kind: true,
      size: true,
      width: true,
      height: true,
      alt: true,
      title: true,
      createdAt: true,
    },
  });
  return paginateRows(rows, limit);
}

export async function registerMediaUrlForStore(
  ctx: DeveloperAuthContext,
  input: {
    url: string;
    filename?: string;
    mimeType?: string;
    kind?: string;
    alt?: string | null;
  },
) {
  const { assertSafeMediaUrl, sanitizeThemeText } = await import(
    "@/lib/developer/theme-validate"
  );
  const { logDeveloperAction } = await import("@/lib/developer/audit");
  assertSafeMediaUrl(input.url);
  const alt =
    typeof input.alt === "string"
      ? String(sanitizeThemeText(input.alt))
      : input.alt === null
        ? null
        : undefined;

  const asset = await prisma.mediaAsset.create({
    data: {
      storeId: ctx.storeId,
      url: input.url,
      filename: (input.filename || "remote-asset").slice(0, 255),
      mimeType: (input.mimeType || "application/octet-stream").slice(0, 128),
      kind: (input.kind || "image").slice(0, 64),
      size: 0,
      alt: alt ?? null,
    },
  });

  await logDeveloperAction({
    applicationId: ctx.applicationId,
    userId: ctx.userId,
    storeId: ctx.storeId,
    actorType: ctx.actor,
    action: "media.created",
    resource: "media",
    resourceId: asset.id,
  });

  return asset;
}

export async function getNavigationForStore(storeId: string, themeId?: string) {
  if (themeId) {
    const theme = await prisma.storeTheme.findFirst({
      where: { id: themeId, storeId },
      select: { document: true },
    });
    if (!theme) throw new DeveloperApiError("NOT_FOUND", "Theme not found.");
    const doc = theme.document as { navigation?: unknown };
    return { navigation: doc.navigation ?? [], themeId };
  }
  const settings = await prisma.storeSettings.findUnique({
    where: { storeId },
    select: { navigation: true },
  });
  return { navigation: settings?.navigation ?? [] };
}

export async function buildStoreContext(ctx: DeveloperAuthContext) {
  const store = await getStoreForContext(ctx);
  const scopes = new Set(ctx.scopes);

  const [
    productCount,
    collectionCount,
    mediaCount,
    draftThemeCount,
  ] = await Promise.all([
    scopes.has("products:read")
      ? prisma.product.count({ where: { storeId: store.id } })
      : Promise.resolve(0),
    scopes.has("collections:read")
      ? prisma.collection.count({ where: { storeId: store.id } })
      : Promise.resolve(0),
    scopes.has("media:read")
      ? prisma.mediaAsset.count({ where: { storeId: store.id } })
      : Promise.resolve(0),
    scopes.has("themes:read")
      ? prisma.storeTheme.count({
          where: { storeId: store.id, status: "draft" },
        })
      : Promise.resolve(0),
  ]);

  const result: Record<string, unknown> = {
    store: scopes.has("store:read") ? store : undefined,
    counts: {
      products: productCount,
      collections: collectionCount,
      media: mediaCount,
      draftThemes: draftThemeCount,
    },
  };

  if (scopes.has("settings:read")) {
    result.settings = await getSanitizedStoreSettings(store.id);
  }

  if (scopes.has("products:read")) {
    const page = await listProductsForStore(store.id, { limit: 24 });
    result.products = page.items.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      comparePrice: p.comparePrice,
      inventory: p.inventory,
      status: p.status,
      imageCount: Array.isArray(p.images) ? p.images.length : 0,
    }));
    result.productsPagination = page.pagination;
  }

  if (scopes.has("collections:read")) {
    const page = await listCollectionsForStore(store.id, { limit: 24 });
    result.collections = page.items.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      featured: c.featured,
      productCount: c._count.products,
      hasImage: Boolean(c.image),
    }));
  }

  if (scopes.has("navigation:read") || scopes.has("settings:read")) {
    const nav = await getNavigationForStore(store.id);
    result.navigation = nav.navigation;
  }

  if (scopes.has("themes:read")) {
    const themes = await prisma.storeTheme.findMany({
      where: { storeId: store.id, status: { in: ["draft", "active"] } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
        source: true,
        provider: true,
        status: true,
        visibility: true,
        updatedAt: true,
        publishedAt: true,
      },
    });
    result.themes = themes;
    result.theme = themes.find((t) => t.status === "active") ?? themes[0] ?? null;
    result.activeThemeId =
      themes.find((t) => t.status === "active")?.id ?? null;
    result.draftThemeIds = themes
      .filter((t) => t.status === "draft")
      .map((t) => t.id);
  }

  if (scopes.has("themes:read")) {
    try {
      const { buildCanonicalThemeSchema } = await import(
        "@/lib/developer/theme-schema"
      );
      const schema = buildCanonicalThemeSchema();
      result.capabilities = {
        sectionTypes: (schema.sections ?? [])
          .map((s: { type?: string }) => s.type)
          .filter((t: string | undefined): t is string => Boolean(t))
          .slice(0, 80),
      };
    } catch {
      result.capabilities = { sectionTypes: [] };
    }
  }

  result.workflow = buildWorkflowNext({
    scopes,
    productCount,
    collectionCount,
    draftThemeIds: (result.draftThemeIds as string[] | undefined) ?? [],
    activeThemeId: (result.activeThemeId as string | null | undefined) ?? null,
    hasThemeSchemaAccess: scopes.has("themes:read"),
  });

  result.limits = {
    maxPageSize: 100,
    defaultPageSize: 50,
    previewTokenTtlMinutes: 10,
  };

  for (const key of Object.keys(result)) {
    if (result[key] === undefined) delete result[key];
  }

  result.principle = {
    ai: "presentation / theme / layout / content structure",
    ettajer: "products / inventory / cart / checkout / payments / orders",
  };

  return result;
}
