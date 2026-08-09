import { absoluteUrl } from "@/lib/seo/site-config";
import {
  DEVELOPER_SCOPES,
  THEME_AI_DEFAULT_SCOPES,
  scopeDescription,
} from "@/lib/developer/scopes";

const bearer = [{ bearerAuth: [] as string[] }];

function op(
  operationId: string,
  summary: string,
  scopes: string | string[],
  extras: Record<string, unknown> = {},
) {
  const scopeList = Array.isArray(scopes) ? scopes : [scopes];
  return {
    operationId,
    summary,
    security: bearer,
    "x-required-scopes": scopeList,
    parameters: [
      {
        name: "X-Request-Id",
        in: "header",
        required: false,
        schema: { type: "string" },
        description: "Optional correlation id (echoed on response)",
      },
      ...(Array.isArray(extras.parameters) ? (extras.parameters as unknown[]) : []),
    ],
    responses: {
      "200": {
        description: "OK",
        headers: {
          "X-Request-Id": { schema: { type: "string" } },
          "X-RateLimit-Limit": { schema: { type: "integer" } },
          "X-RateLimit-Remaining": { schema: { type: "integer" } },
          "X-RateLimit-Reset": { schema: { type: "integer" } },
        },
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SuccessEnvelope" },
          },
        },
      },
      "400": { $ref: "#/components/responses/Error" },
      "401": { $ref: "#/components/responses/Error" },
      "403": { $ref: "#/components/responses/Error" },
      "404": { $ref: "#/components/responses/Error" },
      "409": { $ref: "#/components/responses/Error" },
      "429": { $ref: "#/components/responses/Error" },
      ...(extras.responses as object | undefined),
    },
    ...Object.fromEntries(
      Object.entries(extras).filter(([k]) => !["parameters", "responses"].includes(k)),
    ),
  };
}

const idempotencyHeader = {
  name: "Idempotency-Key",
  in: "header",
  required: false,
  schema: { type: "string", minLength: 8, maxLength: 256 },
  description: "Replay-safe key for POST/PATCH/DELETE mutations (24h TTL)",
};

const limitCursor = [
  {
    name: "limit",
    in: "query",
    schema: { type: "integer", minimum: 1, maximum: 100 },
  },
  {
    name: "cursor",
    in: "query",
    schema: { type: "string" },
    description: "Opaque cursor from previous pagination.nextCursor",
  },
];

const idParam = (name = "id") => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string" },
});

export function buildDeveloperOpenApi() {
  const base = absoluteUrl("/").replace(/\/$/, "");
  return {
    openapi: "3.1.0",
    info: {
      title: "Ettajer Developer API",
      version: "1.1.0",
      description:
        "OAuth/API-key secured platform API for AI tools. Success bodies use `{ data }` (+ optional `pagination`). Errors use `{ error: { code, message, details?, requestId } }`. AI controls presentation (themes); Ettajer controls commerce.",
    },
    servers: [{ url: base }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "OAuth access token (eta_…) or API key (etsk_live_…)",
        },
      },
      schemas: {
        ErrorBody: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: { type: "object" },
                requestId: { type: "string" },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          required: ["nextCursor", "hasMore", "limit"],
          properties: {
            nextCursor: { type: ["string", "null"] },
            hasMore: { type: "boolean" },
            limit: { type: "integer" },
          },
        },
        SuccessEnvelope: {
          type: "object",
          required: ["data"],
          properties: {
            data: {},
            pagination: { $ref: "#/components/schemas/Pagination" },
          },
        },
      },
      responses: {
        Error: {
          description: "Error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorBody" },
            },
          },
        },
      },
    },
    security: bearer,
    paths: {
      "/api/v1/context": {
        get: op("getContext", "Safe store context for theme AI", "store:read"),
      },
      "/api/v1/store": {
        get: op("getStore", "Store profile", "store:read"),
      },
      "/api/v1/store/settings": {
        get: op("getStoreSettings", "Sanitized store settings", "settings:read"),
      },
      "/api/v1/products": {
        get: op("listProducts", "List products", "products:read", {
          parameters: limitCursor,
        }),
      },
      "/api/v1/products/{id}": {
        get: op("getProduct", "Get product", "products:read", {
          parameters: [idParam()],
        }),
      },
      "/api/v1/collections": {
        get: op("listCollections", "List collections", "collections:read", {
          parameters: limitCursor,
        }),
      },
      "/api/v1/collections/{id}": {
        get: op("getCollection", "Get collection", "collections:read", {
          parameters: [idParam()],
        }),
      },
      "/api/v1/orders": {
        get: op("listOrders", "List orders", "orders:read", {
          parameters: limitCursor,
        }),
      },
      "/api/v1/orders/{id}": {
        get: op("getOrder", "Get order", "orders:read", {
          parameters: [idParam()],
        }),
      },
      "/api/v1/customers": {
        get: op("listCustomers", "List customers", "customers:read", {
          parameters: limitCursor,
        }),
      },
      "/api/v1/checkout": {
        get: op("getCheckout", "Checkout summary (no secrets)", "checkout:read"),
      },
      "/api/v1/media": {
        get: op("listMedia", "List media", "media:read", {
          parameters: limitCursor,
        }),
        post: op("uploadMedia", "Upload or register media", "media:write", {
          parameters: [idempotencyHeader],
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessEnvelope" },
                },
              },
            },
          },
        }),
      },
      "/api/v1/navigation": {
        get: op("getNavigation", "Get navigation", "navigation:read"),
        patch: op("updateNavigation", "Update navigation", "navigation:write", {
          parameters: [idempotencyHeader],
        }),
      },
      "/api/v1/themes": {
        get: op("listThemes", "List private themes", "themes:read"),
        post: op("createTheme", "Create draft theme", "themes:create", {
          parameters: [idempotencyHeader],
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SuccessEnvelope" },
                },
              },
            },
          },
        }),
      },
      "/api/v1/themes/schema": {
        get: op("getThemeSchema", "Canonical theme schema", "themes:read"),
      },
      "/api/v1/themes/{id}": {
        get: op("getTheme", "Get theme", "themes:read", {
          parameters: [idParam()],
        }),
        patch: op("updateTheme", "Update draft theme", "themes:write", {
          parameters: [idParam(), idempotencyHeader],
        }),
        delete: op("archiveTheme", "Archive theme", "themes:write", {
          parameters: [idParam(), idempotencyHeader],
        }),
      },
      "/api/v1/themes/{id}/duplicate": {
        post: op("duplicateTheme", "Duplicate theme", "themes:create", {
          parameters: [idParam(), idempotencyHeader],
        }),
      },
      "/api/v1/themes/{id}/publish": {
        post: op("publishTheme", "Publish theme", "themes:publish", {
          parameters: [idParam(), idempotencyHeader],
        }),
      },
      "/api/v1/themes/{id}/preview-token": {
        post: op(
          "createThemePreviewToken",
          "Issue signed preview URL",
          ["themes:read", "themes:preview"],
          { parameters: [idParam()] },
        ),
      },
      "/api/v1/themes/{id}/batch": {
        post: op(
          "applyThemeBatch",
          "Batch draft theme mutations (pages/sections/tokens/nav)",
          "themes:write",
          { parameters: [idParam(), idempotencyHeader] },
        ),
      },
      "/api/v1/themes/{id}/pages": {
        get: op("listThemePages", "List theme pages", "themes:read", {
          parameters: [idParam()],
        }),
        post: op("createThemePage", "Create theme page", ["themes:write", "pages:write"], {
          parameters: [idParam(), idempotencyHeader],
        }),
      },
      "/api/v1/themes/{id}/pages/{pageId}": {
        patch: op("updateThemePage", "Update theme page", ["themes:write", "pages:write"], {
          parameters: [idParam(), idParam("pageId"), idempotencyHeader],
        }),
        delete: op("deleteThemePage", "Delete theme page", ["themes:write", "pages:write"], {
          parameters: [idParam(), idParam("pageId"), idempotencyHeader],
        }),
      },
      "/api/v1/themes/{id}/sections": {
        get: op("listThemeSections", "List theme sections", "themes:read", {
          parameters: [idParam()],
        }),
        post: op("createThemeSection", "Create theme section", "themes:write", {
          parameters: [idParam(), idempotencyHeader],
        }),
      },
      "/api/v1/themes/{id}/sections/{sectionId}": {
        patch: op("updateThemeSection", "Update theme section", "themes:write", {
          parameters: [idParam(), idParam("sectionId"), idempotencyHeader],
        }),
        delete: op("deleteThemeSection", "Delete theme section", "themes:write", {
          parameters: [idParam(), idParam("sectionId"), idempotencyHeader],
        }),
      },
      "/api/v1/mcp": {
        post: op("mcpJsonRpc", "MCP JSON-RPC (tools/list, tools/call)", []),
        get: {
          operationId: "mcpDiscovery",
          summary: "MCP endpoint discovery",
          responses: { "200": { description: "Discovery" } },
        },
      },
      "/api/oauth/token": {
        post: {
          operationId: "oauthToken",
          summary: "OAuth token exchange / refresh",
          security: [],
          responses: { "200": { description: "Tokens" } },
        },
      },
    },
    "x-ettajer-scopes": DEVELOPER_SCOPES.map((s) => ({
      scope: s,
      description: scopeDescription(s),
    })),
    "x-ettajer-default-theme-scopes": THEME_AI_DEFAULT_SCOPES,
    "x-ettajer-response-contract": {
      success: "{ data: T }",
      list: "{ data: { <resource>: Item[] }, pagination: { nextCursor, hasMore, limit } }",
      error: "{ error: { code, message, details?, requestId } }",
      note: "v1 lists use a named resource key inside data (e.g. products), not a bare array.",
      headers: [
        "X-Request-Id",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Idempotency-Key (request)",
        "Retry-After (429)",
      ],
      compatibility:
        "v1 is the stable Developer API contract. Backward-compatible additions may be introduced. Breaking changes require a new API version (/api/v2).",
    },
  };
}

export function buildDevelopersLlmsTxt(): string {
  const lines = [
    "# Ettajer Developer Platform",
    "",
    "> AI controls presentation. Ettajer controls commerce.",
    "",
    "Ettajer is a COD ecommerce SaaS for Morocco. External AI tools (Claude, Cursor, ChatGPT agents) connect via OAuth or API keys to customize private storefront themes — not to mutate cart, checkout, payments, or the database.",
    "",
    "## Auth",
    "",
    `- Authorize: ${absoluteUrl("/oauth/authorize")}?client_id=…&redirect_uri=…&response_type=code&scope=…&state=…&code_challenge=…&code_challenge_method=S256`,
    `- Token: POST ${absoluteUrl("/api/oauth/token")}`,
    `- MCP: POST ${absoluteUrl("/api/v1/mcp")} with Authorization: Bearer <token>`,
    `- OpenAPI: ${absoluteUrl("/developers/openapi.json")}`,
    `- Quickstart: ${absoluteUrl("/developers/quickstart")}`,
    `- AI Integration: ${absoluteUrl("/developers/ai-integration")}`,
    `- AI System Prompt: ${absoluteUrl("/developers/ai-system-prompt.txt")}`,
    "",
    "## Response contract (v1.1)",
    "",
    "- Success: `{ \"data\": … }`",
    "- Lists: `{ \"data\": { … }, \"pagination\": { \"nextCursor\", \"hasMore\", \"limit\" } }`",
    "- Errors: `{ \"error\": { \"code\", \"message\", \"details?\", \"requestId\" } }`",
    "- Headers: X-Request-Id, X-RateLimit-*, Idempotency-Key on mutations",
    "",
    "## Default theme AI scopes",
    "",
    ...THEME_AI_DEFAULT_SCOPES.map((s) => `- ${s}: ${scopeDescription(s)}`),
    `- themes:publish: ${scopeDescription("themes:publish")} (opt-in)`,
    "",
    "## Key endpoints",
    "",
    "- GET /api/v1/context",
    "- GET /api/v1/products?limit=&cursor=",
    "- GET /api/v1/themes/schema",
    "- POST /api/v1/themes",
    "- POST /api/v1/themes/:id/batch",
    "- POST /api/v1/themes/:id/preview-token",
    "- POST /api/v1/themes/:id/publish",
    `- MCP: POST ${absoluteUrl("/api/v1/mcp")}`,
    "",
    "## Context-first AI workflow",
    "",
    "Always: get_context → follow workflow.next (state-aware objects with action+reason) → prefer apply_theme_batch → preview_theme.",
    "Never invent product IDs. Prefer merchant publish over agent publish.",
    "",
    "## Compatibility",
    "",
    "v1 is the stable Developer API contract. Backward-compatible additions may be introduced. Breaking changes require a new API version.",
    "",
    "## Rate limiting",
    "",
    "- RATE_LIMIT_BACKEND=memory (default) — local / single-instance only",
    "- RATE_LIMIT_BACKEND=redis — multi-instance production (Upstash REST)",
    "- In-memory rate limiting is NOT multi-instance safe",
    "",
    "## Restrictions",
    "",
    "- Never request DATABASE_URL, Prisma, Stripe secrets, or NextAuth secrets",
    "- Never trust client-supplied storeId — store comes from the token grant",
    "- Do not inject scripts or arbitrary React into themes",
    "- Reference products by productId; Ettajer remains source of truth for price/inventory",
    "- Preview tokens are purpose-bound (theme_preview only) and short-lived",
    "",
  ];
  return lines.join("\n");
}

export function buildDevelopersLlmsFullTxt(): string {
  return [
    buildDevelopersLlmsTxt(),
    "",
    "## MCP tools",
    "",
    "get_store, get_store_settings, get_context, get_products, get_product, get_collections, get_collection, get_orders, get_order, list_customers, get_checkout, get_themes, list_themes, get_theme, get_theme_schema, create_theme, update_theme, duplicate_theme, archive_theme, apply_theme_batch, create_page, update_page, delete_page, create_section, update_section, delete_section, get_media, upload_media, get_navigation, update_navigation, preview_theme, publish_theme",
    "",
    "## AI system prompt",
    "",
    absoluteUrl("/developers/ai-system-prompt.txt"),
    "",
    "## Theme document shape",
    "",
    "version, theme{theme,primaryColor,secondaryColor,font,logo}, navigation[], templates{home,product,collection,blogPost}, pages[{slug,title,layout,status}]",
    "",
    "Layouts use Ettajer HomeLayout sections (hero, product-grid, rich-text, …).",
    "",
  ].join("\n");
}
