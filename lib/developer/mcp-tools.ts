import { z } from "zod";
import type { DeveloperAuthContext } from "@/lib/developer/auth-context";
import { requireScopes } from "@/lib/developer/auth-context";
import {
  buildStoreContext,
  getCheckoutSummary,
  getCollectionForStore,
  getNavigationForStore,
  getOrderForStore,
  getProductForStore,
  getStoreForContext,
  listCollectionsForStore,
  listCustomersForStore,
  listMediaForStore,
  listOrdersForStore,
  listProductsForStore,
  registerMediaUrlForStore,
} from "@/lib/developer/commerce-read";
import {
  applyThemeBatch,
  archiveStoreTheme,
  createStoreTheme,
  createThemePage,
  createThemeSection,
  deleteThemePage,
  deleteThemeSection,
  duplicateStoreTheme,
  getStoreTheme,
  listStoreThemes,
  publishStoreTheme,
  updateStoreTheme,
  updateThemePage,
  updateThemeSection,
  type ThemeBatchOp,
} from "@/lib/developer/theme-service";
import { prisma } from "@/lib/db";
import { asThemeDocument } from "@/lib/developer/theme-document";
import type { Prisma } from "@prisma/client";
import type { DeveloperScope } from "@/lib/developer/scopes";
import { DeveloperApiError } from "@/lib/developer/errors";
import { withMcpIdempotency } from "@/lib/developer/idempotency";

type ToolDef = {
  name: string;
  description: string;
  scopes: DeveloperScope | DeveloperScope[];
  inputSchema: z.ZodTypeAny;
  handler: (
    ctx: DeveloperAuthContext,
    args: Record<string, unknown>,
    meta?: { requestId?: string },
  ) => Promise<unknown>;
};

const tools: ToolDef[] = [
  {
    name: "get_store",
    description: "Get the connected Ettajer store profile (no secrets).",
    scopes: "store:read",
    inputSchema: z.object({}),
    handler: async (ctx) => ({ store: await getStoreForContext(ctx) }),
  },
  {
    name: "get_store_settings",
    description: "Get sanitized store settings (no payment/marketing secrets).",
    scopes: "settings:read",
    inputSchema: z.object({}),
    handler: async (ctx) => {
      const { getSanitizedStoreSettings } = await import(
        "@/lib/developer/commerce-read"
      );
      return { settings: await getSanitizedStoreSettings(ctx.storeId) };
    },
  },
  {
    name: "get_context",
    description:
      "START HERE. Rich store snapshot: branding, counts, product/collection samples, themes, section type ids, workflow.next. Prefer this before create_theme. REST: GET /api/v1/context",
    scopes: "store:read",
    inputSchema: z.object({}),
    handler: async (ctx) => buildStoreContext(ctx),
  },
  {
    name: "get_products",
    description:
      "List products with cursor pagination (nextCursor/hasMore). REST: GET /api/v1/products",
    scopes: "products:read",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
    handler: async (ctx, args) => {
      const page = await listProductsForStore(ctx.storeId, {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      });
      return { products: page.items, pagination: page.pagination };
    },
  },
  {
    name: "get_product",
    description: "Get one product by id. REST: GET /api/v1/products/:id",
    scopes: "products:read",
    inputSchema: z.object({ productId: z.string().min(1) }),
    handler: async (ctx, args) => ({
      product: await getProductForStore(ctx.storeId, String(args.productId)),
    }),
  },
  {
    name: "get_collections",
    description: "List collections with cursor pagination. REST: GET /api/v1/collections",
    scopes: "collections:read",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
    handler: async (ctx, args) => {
      const page = await listCollectionsForStore(ctx.storeId, {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      });
      return { collections: page.items, pagination: page.pagination };
    },
  },
  {
    name: "get_collection",
    description:
      "Get one collection by id (includes product refs). REST: GET /api/v1/collections/:id",
    scopes: "collections:read",
    inputSchema: z.object({ collectionId: z.string().min(1) }),
    handler: async (ctx, args) => ({
      collection: await getCollectionForStore(
        ctx.storeId,
        String(args.collectionId),
      ),
    }),
  },
  {
    name: "get_orders",
    description: "List recent orders (read-only) with pagination. REST: GET /api/v1/orders",
    scopes: "orders:read",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
    handler: async (ctx, args) => {
      const page = await listOrdersForStore(ctx.storeId, {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      });
      return { orders: page.items, pagination: page.pagination };
    },
  },
  {
    name: "get_order",
    description: "Get one order by id. REST: GET /api/v1/orders/:id",
    scopes: "orders:read",
    inputSchema: z.object({ orderId: z.string().min(1) }),
    handler: async (ctx, args) => ({
      order: await getOrderForStore(ctx.storeId, String(args.orderId)),
    }),
  },
  {
    name: "list_customers",
    description: "List customers (read-only) with pagination. REST: GET /api/v1/customers",
    scopes: "customers:read",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
    handler: async (ctx, args) => {
      const page = await listCustomersForStore(ctx.storeId, {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      });
      return { customers: page.items, pagination: page.pagination };
    },
  },
  {
    name: "get_checkout",
    description:
      "Checkout summary (COD + enabled gateway names only; no secrets). REST: GET /api/v1/checkout",
    scopes: "checkout:read",
    inputSchema: z.object({}),
    handler: async (ctx) => ({
      checkout: await getCheckoutSummary(ctx.storeId),
    }),
  },
  {
    name: "list_themes",
    description: "List private AI/merchant themes for the store. REST: GET /api/v1/themes",
    scopes: "themes:read",
    inputSchema: z.object({}),
    handler: async (ctx) => ({ themes: await listStoreThemes(ctx.storeId) }),
  },
  {
    name: "get_theme",
    description:
      "Read one private theme draft/active document. Use after create_theme to inspect, then update_theme / update_section iteratively (do not recreate the whole theme). Read-only.",
    scopes: "themes:read",
    inputSchema: z.object({ themeId: z.string().min(1) }),
    handler: async (ctx, args) => ({
      theme: await getStoreTheme(ctx.storeId, String(args.themeId)),
    }),
  },
  {
    name: "create_theme",
    description: "Creates a private draft theme for the authenticated Ettajer store. The theme is NOT live until publish_theme. Use get_theme_schema before creating complex themes. Mutates: yes (draft only). Live storefront: no.",
    scopes: "themes:create",
    inputSchema: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      provider: z.string().optional(),
      document: z.unknown().optional(),
    }),
    handler: async (ctx, args) => ({
      theme: await createStoreTheme(ctx, {
        name: String(args.name),
        description: args.description as string | undefined,
        provider: args.provider as string | undefined,
        document: args.document,
      }),
    }),
  },
  {
    name: "update_theme",
    description:
      "Update draft theme document or metadata. Prefer targeted edits after get_theme. Mutates draft only until publish_theme.",
    scopes: "themes:write",
    inputSchema: z.object({
      themeId: z.string().min(1),
      name: z.string().optional(),
      description: z.string().nullable().optional(),
      document: z.unknown().optional(),
      provider: z.string().optional(),
    }),
    handler: async (ctx, args) => ({
      theme: await updateStoreTheme(ctx, String(args.themeId), {
        name: args.name as string | undefined,
        description: args.description as string | null | undefined,
        document: args.document,
        provider: args.provider as string | undefined,
      }),
    }),
  },
  {
    name: "duplicate_theme",
    description: "Duplicate a theme into a new draft. REST: POST /api/v1/themes/:id/duplicate",
    scopes: "themes:create",
    inputSchema: z.object({ themeId: z.string().min(1) }),
    handler: async (ctx, args) => ({
      theme: await duplicateStoreTheme(ctx, String(args.themeId)),
    }),
  },
  {
    name: "archive_theme",
    description: "Archive a private theme (soft delete). REST: DELETE /api/v1/themes/:id",
    scopes: "themes:write",
    inputSchema: z.object({ themeId: z.string().min(1) }),
    handler: async (ctx, args) => ({
      theme: await archiveStoreTheme(ctx, String(args.themeId)),
    }),
  },
  {
    name: "apply_theme_batch",
    description:
      "PREFERRED for multi-section builds. Apply many draft ops in one validate/write. Fail-closed. REST: POST /api/v1/themes/:id/batch",
    scopes: "themes:write",
    inputSchema: z.object({
      themeId: z.string().min(1),
      ops: z.array(z.record(z.unknown())).min(1).max(50),
      idempotencyKey: z.string().optional(),
    }),
    handler: async (ctx, args, meta) => {
      const ops = args.ops as ThemeBatchOp[];
      const needsPages = ops.some((o) =>
        ["upsert_page", "update_page", "delete_page"].includes(o.op),
      );
      const needsNav = ops.some((o) => o.op === "set_navigation");
      if (needsPages) requireScopes(ctx, "pages:write");
      if (needsNav) requireScopes(ctx, "navigation:write");
      return withMcpIdempotency({
        applicationId: ctx.applicationId,
        requestId: meta?.requestId || crypto.randomUUID(),
        toolName: "apply_theme_batch",
        idempotencyKey: args.idempotencyKey as string | undefined,
        argsFingerprint: args,
        run: async () => applyThemeBatch(ctx, String(args.themeId), ops),
      });
    },
  },
  {
    name: "create_page",
    description: "Add a custom page to a theme (not cart/checkout/products).",
    scopes: ["themes:write", "pages:write"],
    inputSchema: z.object({
      themeId: z.string().min(1),
      slug: z.string().min(1),
      title: z.string().min(1),
      layout: z.unknown().optional(),
    }),
    handler: async (ctx, args) => ({
      theme: await createThemePage(ctx, String(args.themeId), {
        slug: String(args.slug),
        title: String(args.title),
        layout: args.layout,
      }),
    }),
  },
  {
    name: "update_page",
    description: "Update a theme page.",
    scopes: ["themes:write", "pages:write"],
    inputSchema: z.object({
      themeId: z.string().min(1),
      pageId: z.string().min(1),
      title: z.string().optional(),
      slug: z.string().optional(),
      layout: z.unknown().optional(),
      status: z.string().optional(),
    }),
    handler: async (ctx, args) => ({
      theme: await updateThemePage(ctx, String(args.themeId), String(args.pageId), {
        title: args.title as string | undefined,
        slug: args.slug as string | undefined,
        layout: args.layout,
        status: args.status as string | undefined,
      }),
    }),
  },
  {
    name: "create_section",
    description: "Append or insert a validated storefront section into a theme template/page.",
    scopes: "themes:write",
    inputSchema: z.object({
      themeId: z.string().min(1),
      sectionType: z.string().min(1),
      templateKey: z.enum(["home", "product", "collection", "blogPost"]).optional(),
      pageId: z.string().optional(),
      settings: z.record(z.unknown()).optional(),
      label: z.string().optional(),
      index: z.number().int().optional(),
    }),
    handler: async (ctx, args) =>
      createThemeSection(ctx, String(args.themeId), {
        sectionType: String(args.sectionType),
        templateKey: args.templateKey as
          | "home"
          | "product"
          | "collection"
          | "blogPost"
          | undefined,
        pageId: args.pageId as string | undefined,
        settings: args.settings as Record<string, unknown> | undefined,
        label: args.label as string | undefined,
        index: args.index as number | undefined,
      }),
  },
  {
    name: "update_section",
    description:
      "Update one section in a draft theme. Prefer this for iterative preview feedback instead of recreating the theme. Mutates draft only.",
    scopes: "themes:write",
    inputSchema: z.object({
      themeId: z.string().min(1),
      sectionId: z.string().min(1),
      templateKey: z.enum(["home", "product", "collection", "blogPost"]).optional(),
      pageId: z.string().optional(),
      settings: z.record(z.unknown()).optional(),
      label: z.string().optional(),
      visible: z.boolean().optional(),
      type: z.string().optional(),
    }),
    handler: async (ctx, args) =>
      updateThemeSection(ctx, String(args.themeId), String(args.sectionId), {
        templateKey: args.templateKey as
          | "home"
          | "product"
          | "collection"
          | "blogPost"
          | undefined,
        pageId: args.pageId as string | undefined,
        settings: args.settings as Record<string, unknown> | undefined,
        label: args.label as string | undefined,
        visible: args.visible as boolean | undefined,
        type: args.type as string | undefined,
      }),
  },
  {
    name: "delete_section",
    description: "Remove a section from a theme.",
    scopes: "themes:write",
    inputSchema: z.object({
      themeId: z.string().min(1),
      sectionId: z.string().min(1),
      templateKey: z.enum(["home", "product", "collection", "blogPost"]).optional(),
      pageId: z.string().optional(),
    }),
    handler: async (ctx, args) => ({
      theme: await deleteThemeSection(ctx, String(args.themeId), String(args.sectionId), {
        templateKey: args.templateKey as
          | "home"
          | "product"
          | "collection"
          | "blogPost"
          | undefined,
        pageId: args.pageId as string | undefined,
      }),
    }),
  },
  {
    name: "get_media",
    description: "List media assets with pagination. REST: GET /api/v1/media",
    scopes: "media:read",
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
    handler: async (ctx, args) => {
      const page = await listMediaForStore(ctx.storeId, {
        limit: args.limit as number | undefined,
        cursor: args.cursor as string | undefined,
      });
      return { media: page.items, pagination: page.pagination };
    },
  },
  {
    name: "get_navigation",
    description: "Get navigation for live store or a theme draft. REST: GET /api/v1/navigation",
    scopes: "navigation:read",
    inputSchema: z.object({ themeId: z.string().optional() }),
    handler: async (ctx, args) =>
      getNavigationForStore(
        ctx.storeId,
        args.themeId ? String(args.themeId) : undefined,
      ),
  },
  {
    name: "update_navigation",
    description:
      "Update navigation on a theme draft (preferred) or live store. Validates hrefs and sanitizes labels. Prefer themeId so changes stay draft until publish. Mutates: draft or live nav. Live storefront: only without themeId.",
    scopes: "navigation:write",
    inputSchema: z.object({
      navigation: z.array(z.record(z.unknown())),
      themeId: z.string().optional(),
    }),
    handler: async (ctx, args) => {
      const { validateNavigation, validateThemeDocument } = await import(
        "@/lib/developer/theme-validate"
      );
      const navigation = validateNavigation(args.navigation);
      if (args.themeId) {
        const theme = await prisma.storeTheme.findFirst({
          where: { id: String(args.themeId), storeId: ctx.storeId },
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
        return { navigation: validated.navigation, themeId: theme.id };
      }
      await prisma.storeSettings.update({
        where: { storeId: ctx.storeId },
        data: { navigation: navigation as unknown as Prisma.InputJsonValue },
      });
      return { navigation };
    },
  },
  {
    name: "preview_theme",
    description:
      "Create a short-lived signed preview URL for a private theme (read-only, 10 minutes). Does not publish. Requires themes:read. Never exposes OAuth credentials. Mutates: no. Live storefront: no.",
    scopes: "themes:read",
    inputSchema: z.object({ themeId: z.string().min(1) }),
    handler: async (ctx, args) => {
      const { createThemePreviewAccess } = await import("@/lib/developer/theme-preview");
      return createThemePreviewAccess(ctx, String(args.themeId));
    },
  },

  {
    name: "get_themes",
    description:
      "List private AI/merchant themes (alias of list_themes). Call early in DISCOVER with get_context + get_theme_schema. Read-only.",
    scopes: "themes:read",
    inputSchema: z.object({}),
    handler: async (ctx) => ({ themes: await listStoreThemes(ctx.storeId) }),
  },
  {
    name: "get_theme_schema",
    description:
      "Canonical Ettajer theme schema from real section/block capabilities. Call with get_context before create_theme. Read-only. Mutates: no.",
    scopes: "themes:read",
    inputSchema: z.object({}),
    handler: async () => {
      const { buildCanonicalThemeSchema } = await import("@/lib/developer/theme-schema");
      return buildCanonicalThemeSchema();
    },
  },
  {
    name: "delete_page",
    description: "Remove a custom page from a draft theme (not system commerce routes). Mutates draft only.",
    scopes: ["themes:write", "pages:write"],
    inputSchema: z.object({
      themeId: z.string().min(1),
      pageId: z.string().min(1),
    }),
    handler: async (ctx, args) => {
      const theme = await deleteThemePage(ctx, String(args.themeId), String(args.pageId));
      return { theme };
    },
  },
  {
    name: "upload_media",
    description: "Register a media URL on the authenticated store (use Ettajer-hosted URLs when possible). Mutates media library. Live theme: no until referenced and published.",
    scopes: "media:write",
    inputSchema: z.object({
      url: z.string().url(),
      filename: z.string().optional(),
      mimeType: z.string().optional(),
      kind: z.string().optional(),
      alt: z.string().optional(),
    }),
    handler: async (ctx, args) => ({
      media: await registerMediaUrlForStore(ctx, {
        url: String(args.url),
        filename: args.filename as string | undefined,
        mimeType: args.mimeType as string | undefined,
        kind: args.kind as string | undefined,
        alt: args.alt as string | undefined,
      }),
    }),
  },
  {
    name: "publish_theme",
    description:
      "Publishes a validated draft theme to the live storefront. Requires themes:publish. Transactional — validation failure leaves live store unchanged. Removes orphan custom pages not in the draft (never deletes products/collections/search/blog/cart/checkout). Mutates: live presentation only. Cart/checkout/orders unchanged.",
    scopes: "themes:publish",
    inputSchema: z.object({ themeId: z.string().min(1) }),
    handler: async (ctx, args) => {
      const theme = await publishStoreTheme(ctx, String(args.themeId));
      return {
        success: true,
        themeId: theme.id,
        status: theme.status,
        theme,
      };
    },
  },
];


export function listMcpTools() {
  return tools.map((t) => {
    const props = zodToJsonProperties(t.inputSchema);
    const required = zodRequired(t.inputSchema);
    return {
      name: t.name,
      description: t.description,
      inputSchema: {
        type: "object",
        properties: props,
        ...(required.length ? { required } : {}),
      },
    };
  });
}

function zodToJsonProperties(schema: z.ZodTypeAny): Record<string, unknown> {
  if (!(schema instanceof z.ZodObject)) return {};
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const props: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(shape)) {
    props[key] = { type: guessZodType(value), description: key };
  }
  return props;
}

function zodRequired(schema: z.ZodTypeAny): string[] {
  if (!(schema instanceof z.ZodObject)) return [];
  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const required: string[] = [];
  for (const [key, value] of Object.entries(shape)) {
    if (value instanceof z.ZodOptional || value instanceof z.ZodDefault) continue;
    required.push(key);
  }
  return required;
}

function guessZodType(schema: z.ZodTypeAny): string {
  let s: z.ZodTypeAny = schema;
  while (s instanceof z.ZodOptional || s instanceof z.ZodDefault) {
    s = s._def.innerType as z.ZodTypeAny;
  }
  if (s instanceof z.ZodString) return "string";
  if (s instanceof z.ZodNumber) return "number";
  if (s instanceof z.ZodBoolean) return "boolean";
  if (s instanceof z.ZodArray) return "array";
  if (s instanceof z.ZodEnum) return "string";
  return "object";
}

const ALIASES: Record<string, string> = {
  list_themes: "get_themes",
};

export async function callMcpTool(
  ctx: DeveloperAuthContext,
  name: string,
  args: Record<string, unknown>,
  meta?: { requestId?: string },
) {
  const tool =
    tools.find((t) => t.name === name) ||
    tools.find((t) => t.name === ALIASES[name]) ||
    tools.find((t) => ALIASES[t.name] === name);
  if (!tool) {
    throw new DeveloperApiError("NOT_FOUND", `Unknown tool: ${name}`, {
      hint: "Call tools/list for available tools.",
    });
  }
  requireScopes(ctx, tool.scopes);
  const parsed = tool.inputSchema.safeParse(args ?? {});
  if (!parsed.success) {
    throw new DeveloperApiError(
      "VALIDATION_ERROR",
      `Invalid arguments: ${parsed.error.message}`,
      { hint: "Check the tool inputSchema from tools/list." },
    );
  }
  return tool.handler(ctx, parsed.data as Record<string, unknown>, meta);
}

export function listMcpResources() {
  return [
    {
      uri: "ettajer://store",
      name: "Store",
      description: "Authenticated store profile (no secrets)",
      mimeType: "application/json",
    },
    {
      uri: "ettajer://context",
      name: "Store context",
      description: "Scoped store snapshot for theme AI",
      mimeType: "application/json",
    },
    {
      uri: "ettajer://theme-schema",
      name: "Theme schema",
      description: "Canonical Ettajer theme capabilities",
      mimeType: "application/json",
    },
    {
      uri: "ettajer://products",
      name: "Products",
      description: "Product catalog for the authenticated store",
      mimeType: "application/json",
    },
    {
      uri: "ettajer://collections",
      name: "Collections",
      description: "Collections for the authenticated store",
      mimeType: "application/json",
    },
    {
      uri: "ettajer://navigation",
      name: "Navigation",
      description: "Live store navigation",
      mimeType: "application/json",
    },
  ];
}

export async function readMcpResource(ctx: DeveloperAuthContext, uri: string) {
  requireScopes(ctx, "store:read");
  if (uri === "ettajer://store") {
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(await getStoreForContext(ctx), null, 2),
      },
    ];
  }
  if (uri === "ettajer://context") {
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(await buildStoreContext(ctx), null, 2),
      },
    ];
  }
  if (uri === "ettajer://theme-schema") {
    requireScopes(ctx, "themes:read");
    const { buildCanonicalThemeSchema } = await import("@/lib/developer/theme-schema");
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(buildCanonicalThemeSchema(), null, 2),
      },
    ];
  }
  if (uri === "ettajer://products") {
    requireScopes(ctx, "products:read");
    const page = await listProductsForStore(ctx.storeId, { limit: 50 });
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          { products: page.items, pagination: page.pagination },
          null,
          2,
        ),
      },
    ];
  }
  if (uri === "ettajer://collections") {
    requireScopes(ctx, "collections:read");
    const page = await listCollectionsForStore(ctx.storeId, { limit: 50 });
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(
          { collections: page.items, pagination: page.pagination },
          null,
          2,
        ),
      },
    ];
  }
  if (uri === "ettajer://navigation") {
    requireScopes(ctx, "navigation:read");
    const nav = await getNavigationForStore(ctx.storeId);
    return [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(nav, null, 2),
      },
    ];
  }
  throw new DeveloperApiError("NOT_FOUND", `Unknown resource: ${uri}`);
}
