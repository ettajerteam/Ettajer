/**
 * Developer API public contract tests (envelope, headers, pagination,
 * idempotency, REST↔MCP parity, batch atomicity, AI-readable errors).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  authCtxFromApiKey,
  createTwoStoreFixture,
  hasTestDatabase,
} from "@/lib/developer/__tests__/helpers/test-fixtures";
import { buildStoreContext } from "@/lib/developer/commerce-read";
import { callMcpTool, listMcpTools } from "@/lib/developer/mcp-tools";
import {
  applyThemeBatch,
  createStoreTheme,
  createThemeSection,
} from "@/lib/developer/theme-service";
import { DeveloperApiError } from "@/lib/developer/errors";
import { assertListCursor } from "@/lib/developer/pagination";
import { buildWorkflowNext } from "@/lib/developer/workflow-next";
import { buildDeveloperOpenApi } from "@/lib/developer/docs-content";
import {
  detectOpenApiRouteDrift,
  discoverV1Routes,
} from "@/lib/developer/openapi-drift";
import { ALL_SECTION_TYPES } from "@/lib/sections/types";

const describeDb = hasTestDatabase ? describe : describe.skip;

describe("API contract — unit", () => {
  it("rejects invalid cursors with INVALID_CURSOR + hint", () => {
    expect(() => assertListCursor("!!!")).toThrow(DeveloperApiError);
    try {
      assertListCursor("bad cursor");
    } catch (err) {
      expect(err).toBeInstanceOf(DeveloperApiError);
      const e = err as DeveloperApiError;
      expect(e.code).toBe("INVALID_CURSOR");
      expect((e.details as { hint?: string }).hint).toMatch(/nextCursor/i);
    }
  });

  it("workflow.next prefers apply_theme_batch when a draft exists", () => {
    const withDraft = buildWorkflowNext({
      scopes: new Set([
        "themes:read",
        "themes:write",
        "themes:create",
        "products:read",
      ]),
      productCount: 3,
      collectionCount: 1,
      draftThemeIds: ["thm_draft"],
      activeThemeId: null,
      hasThemeSchemaAccess: true,
    });
    expect(withDraft.next.some((s) => s.action === "apply_theme_batch")).toBe(
      true,
    );
    expect(withDraft.next.some((s) => s.action === "create_theme")).toBe(false);
    expect(withDraft.next[0]?.action).toBe("get_theme_schema");
    expect(typeof withDraft.next[0]?.reason).toBe("string");
  });

  it("workflow.next recommends create_theme when no draft", () => {
    const fresh = buildWorkflowNext({
      scopes: new Set(["themes:read", "themes:create", "themes:write"]),
      productCount: 0,
      collectionCount: 0,
      draftThemeIds: [],
      activeThemeId: null,
      hasThemeSchemaAccess: true,
    });
    expect(fresh.next.some((s) => s.action === "create_theme")).toBe(true);
  });

  it("OpenAPI documents every discovered /api/v1 route method", () => {
    const routes = discoverV1Routes();
    const openapi = buildDeveloperOpenApi();
    const drift = detectOpenApiRouteDrift({ routes, openapi });
    // MCP GET discovery is optional in OpenAPI; filter noise if any.
    const undocumented = drift.undocumented.filter(
      (x) => !(x.path === "/api/v1/mcp" && x.method === "GET"),
    );
    expect(undocumented).toEqual([]);
    expect(drift.missingImplementation).toEqual([]);
  });

  it("MCP tools/list exposes name, description, inputSchema", () => {
    const tools = listMcpTools();
    expect(tools.length).toBeGreaterThan(10);
    for (const t of tools) {
      expect(t.name).toMatch(/^[a-z_]+$/);
      expect(t.description.length).toBeGreaterThan(12);
      expect(t.inputSchema).toMatchObject({ type: "object" });
    }
    const names = new Set(tools.map((t) => t.name));
    for (const required of [
      "get_context",
      "get_theme_schema",
      "get_products",
      "get_collection",
      "list_customers",
      "get_checkout",
      "archive_theme",
      "apply_theme_batch",
      "preview_theme",
    ]) {
      expect(names.has(required)).toBe(true);
    }
  });

  it("documents v1 list envelope as named resource object + pagination", () => {
    const openapi = buildDeveloperOpenApi() as {
      "x-ettajer-response-contract"?: { success?: string; list?: string };
    };
    expect(openapi["x-ettajer-response-contract"]?.success).toContain("data");
  });
});

describeDb("API contract — integration", () => {
  let fx: Awaited<ReturnType<typeof createTwoStoreFixture>>;
  let ctxA: ReturnType<typeof authCtxFromApiKey>;

  beforeAll(async () => {
    fx = await createTwoStoreFixture();
    ctxA = authCtxFromApiKey({
      applicationId: fx.appA.id,
      applicationName: fx.appA.name,
      userId: fx.userA.id,
      storeId: fx.storeA.id,
      scopes: fx.scopesA,
      apiKeyId: fx.apiKeyA.id,
      tokenKey: fx.apiKeyA.keyPrefix,
    });

    // Extra products for pagination
    for (let i = 0; i < 4; i++) {
      await fx.prisma.product.create({
        data: {
          title: `Extra ${i}`,
          slug: `extra-${fx.suffix}-${i}`,
          price: 10 + i,
          storeId: fx.storeA.id,
          status: "active",
        },
      });
    }
  }, 60_000);

  afterAll(async () => {
    await fx.cleanup();
  }, 60_000);

  it("REST products list returns envelope + pagination + request headers", async () => {
    const { GET } = await import("@/app/api/v1/products/route");
    const req = new Request("http://localhost/api/v1/products?limit=2", {
      headers: {
        Authorization: `Bearer ${fx.rawKeyA}`,
        "X-Request-Id": "req_contract_products_01",
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Request-Id")).toBe("req_contract_products_01");
    expect(res.headers.get("X-RateLimit-Limit")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Remaining")).toBeTruthy();
    expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
    const body = (await res.json()) as {
      data: { products: Array<{ id: string }> };
      pagination: { nextCursor: string | null; hasMore: boolean; limit: number };
    };
    expect(body.data.products.length).toBe(2);
    expect(body.pagination.limit).toBe(2);
    expect(body.pagination.hasMore).toBe(true);
    expect(body.pagination.nextCursor).toBeTruthy();

    const req2 = new Request(
      `http://localhost/api/v1/products?limit=2&cursor=${body.pagination.nextCursor}`,
      { headers: { Authorization: `Bearer ${fx.rawKeyA}` } },
    );
    const res2 = await GET(req2);
    const body2 = (await res2.json()) as {
      data: { products: Array<{ id: string }> };
      pagination: { hasMore: boolean };
    };
    const ids1 = new Set(body.data.products.map((p) => p.id));
    for (const p of body2.data.products) {
      expect(ids1.has(p.id)).toBe(false);
    }
  });

  it("REST and MCP get_products share service semantics", async () => {
    const { GET } = await import("@/app/api/v1/products/route");
    const rest = await (
      await GET(
        new Request("http://localhost/api/v1/products?limit=3", {
          headers: { Authorization: `Bearer ${fx.rawKeyA}` },
        }),
      )
    ).json();
    const mcp = (await callMcpTool(ctxA, "get_products", { limit: 3 })) as {
      products: Array<{ id: string }>;
      pagination: { limit: number };
    };
    expect(mcp.pagination.limit).toBe(3);
    expect(mcp.products.map((p) => p.id)).toEqual(
      rest.data.products.map((p: { id: string }) => p.id),
    );
  });

  it("invalid cursor returns AI-readable INVALID_CURSOR", async () => {
    const { GET } = await import("@/app/api/v1/products/route");
    const res = await GET(
      new Request("http://localhost/api/v1/products?cursor=not%20valid!", {
        headers: {
          Authorization: `Bearer ${fx.rawKeyA}`,
          "X-Request-Id": "req_bad_cursor_01",
        },
      }),
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as {
      error: { code: string; details?: { hint?: string }; requestId?: string };
    };
    expect(body.error.code).toBe("INVALID_CURSOR");
    expect(body.error.details?.hint).toMatch(/nextCursor/i);
    expect(body.error.requestId).toBe("req_bad_cursor_01");
    expect(res.headers.get("X-Request-Id")).toBe("req_bad_cursor_01");
  });

  it("Idempotency-Key replays create_theme and conflicts on different payload", async () => {
    const { POST } = await import("@/app/api/v1/themes/route");
    const key = `idem-theme-${fx.suffix}`;
    const make = (name: string) =>
      new Request("http://localhost/api/v1/themes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${fx.rawKeyA}`,
          "Content-Type": "application/json",
          "Idempotency-Key": key,
        },
        body: JSON.stringify({ name, provider: "cursor" }),
      });

    const first = await POST(make("Atlas Draft"));
    expect(first.status).toBe(201);
    const firstBody = (await first.json()) as { data: { theme: { id: string } } };
    const themeId = firstBody.data.theme.id;

    const second = await POST(make("Atlas Draft"));
    expect(second.status).toBe(201);
    expect(second.headers.get("X-Idempotency-Replayed")).toBe("true");
    const secondBody = (await second.json()) as {
      data: { theme: { id: string } };
    };
    expect(secondBody.data.theme.id).toBe(themeId);

    const conflict = await POST(make("Different Name"));
    expect(conflict.status).toBe(409);
    const conflictBody = (await conflict.json()) as {
      error: { code: string; details?: { hint?: string } };
    };
    expect(conflictBody.error.code).toBe("IDEMPOTENCY_CONFLICT");
    expect(conflictBody.error.details?.hint).toBeTruthy();
  });

  it("theme batch is fail-closed (invalid op commits nothing)", async () => {
    const theme = await createStoreTheme(ctxA, {
      name: `Batch Atomic ${fx.suffix}`,
      provider: "claude",
    });
    const before = await fx.prisma.storeTheme.findUnique({
      where: { id: theme.id },
    });
    const beforeDoc = JSON.stringify(before?.document);

    await expect(
      applyThemeBatch(ctxA, theme.id, [
        {
          op: "create_section",
          sectionType: "hero",
          settings: { headline: "OK" },
        },
        {
          op: "create_section",
          sectionType: "not-a-real-section-type-xyz",
          settings: {},
        },
      ]),
    ).rejects.toBeInstanceOf(DeveloperApiError);

    const after = await fx.prisma.storeTheme.findUnique({
      where: { id: theme.id },
    });
    expect(JSON.stringify(after?.document)).toBe(beforeDoc);
  });

  it("theme batch succeeds for valid multi-section homepage", async () => {
    const theme = await createStoreTheme(ctxA, {
      name: `Batch OK ${fx.suffix}`,
      provider: "claude",
    });
    const result = await applyThemeBatch(ctxA, theme.id, [
      {
        op: "create_section",
        sectionType: "hero",
        settings: { headline: "Premium" },
      },
      {
        op: "create_section",
        sectionType: "product-grid",
        settings: { productIds: [fx.productA.id] },
      },
      {
        op: "create_section",
        sectionType: "rich-text",
        settings: { body: "Editorial" },
      },
    ]);
    expect(result.applied.length).toBe(3);
    const home = (result.theme.document as { templates: { home: { sections: unknown[] } } })
      .templates.home.sections;
    expect(home.length).toBeGreaterThanOrEqual(3);
  });

  it("INVALID_PRODUCT_REFERENCE includes recovery hint", async () => {
    const theme = await createStoreTheme(ctxA, {
      name: `Bad Ref ${fx.suffix}`,
      provider: "claude",
    });
    try {
      await createThemeSection(ctxA, theme.id, {
        sectionType: "product-grid",
        settings: { productIds: [fx.productB.id] },
      });
      expect.fail("expected cross-store product ref to fail");
    } catch (err) {
      expect(err).toBeInstanceOf(DeveloperApiError);
      const e = err as DeveloperApiError;
      expect(e.code).toBe("INVALID_PRODUCT_REFERENCE");
      expect(JSON.stringify(e.details)).toMatch(/get_products/i);
    }
  });

  it("get_context is bounded and exposes actionable workflow.next", async () => {
    const context = (await buildStoreContext(ctxA)) as {
      counts: { products: number };
      products?: unknown[];
      workflow: {
        next: Array<{ action: string; reason: string }>;
        recommendedPath: string;
      };
      capabilities?: { sectionTypes: string[] };
      principle: unknown;
    };
    expect(context.counts.products).toBeGreaterThanOrEqual(1);
    expect(context.products?.length ?? 0).toBeLessThanOrEqual(24);
    expect(Array.isArray(context.workflow.next)).toBe(true);
    expect(context.workflow.next[0]).toMatchObject({
      action: expect.any(String),
      reason: expect.any(String),
    });
    expect(context.workflow.recommendedPath).toMatch(/preview_theme/);
    expect(context.capabilities?.sectionTypes?.length).toBeGreaterThan(0);
    expect(context.capabilities!.sectionTypes.length).toBeLessThanOrEqual(80);
    expect(context.principle).toBeTruthy();
    // Must not dump every section type definition object
    expect(JSON.stringify(context).length).toBeLessThan(200_000);
  });

  it("MCP apply_theme_batch matches REST service path", async () => {
    const theme = await createStoreTheme(ctxA, {
      name: `MCP Batch ${fx.suffix}`,
      provider: "cursor",
    });
    const mcpResult = (await callMcpTool(ctxA, "apply_theme_batch", {
      themeId: theme.id,
      ops: [
        {
          op: "create_section",
          sectionType: ALL_SECTION_TYPES.includes("footer" as never)
            ? "footer"
            : "rich-text",
          settings: { body: "Footer" },
        },
      ],
    })) as { applied: unknown[] };
    expect(mcpResult.applied.length).toBe(1);
  });

  it("INSUFFICIENT_SCOPE is AI-readable via MCP", async () => {
    const limited = authCtxFromApiKey({
      applicationId: fx.appA.id,
      applicationName: fx.appA.name,
      userId: fx.userA.id,
      storeId: fx.storeA.id,
      scopes: ["store:read"],
      apiKeyId: fx.apiKeyA.id,
      tokenKey: fx.apiKeyA.keyPrefix,
    });
    await expect(callMcpTool(limited, "create_theme", { name: "Nope" })).rejects.toMatchObject({
      code: "INSUFFICIENT_SCOPE",
    });
  });
});
