/**
 * Measures an efficient AI storefront-building path against a real test store.
 * Does not call Claude/Cursor — exercises the same service/MCP sequence an agent should use.
 *
 * Usage: npx tsx scripts/developer-ai-benchmark.ts
 * Requires DATABASE_URL.
 */
import fs from "fs";
import path from "path";
import { performance } from "perf_hooks";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env"));
loadEnvFile(path.resolve(process.cwd(), ".env.local"));

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL required");
    process.exit(1);
  }

  const {
    authCtxFromApiKey,
    createTwoStoreFixture,
  } = await import("../lib/developer/__tests__/helpers/test-fixtures");
  const { callMcpTool } = await import("../lib/developer/mcp-tools");
  const { buildCanonicalThemeSchema } = await import(
    "../lib/developer/theme-schema"
  );

  const fx = await createTwoStoreFixture();
  const ctx = authCtxFromApiKey({
    applicationId: fx.appA.id,
    applicationName: fx.appA.name,
    userId: fx.userA.id,
    storeId: fx.storeA.id,
    scopes: fx.scopesA,
    apiKeyId: fx.apiKeyA.id,
    tokenKey: fx.apiKeyA.keyPrefix,
  });

  const counters = {
    mcpCalls: 0,
    restEquivalent: 0,
    failedCalls: 0,
    retries: 0,
    batchOperations: 0,
    timeToDraftMs: null as number | null,
    timeToPreviewMs: null as number | null,
  };

  async function mcp(name: string, args: Record<string, unknown> = {}) {
    counters.mcpCalls += 1;
    counters.restEquivalent += 1;
    try {
      return await callMcpTool(ctx, name, args);
    } catch (err) {
      counters.failedCalls += 1;
      throw err;
    }
  }

  const t0 = performance.now();
  try {
    const context = (await mcp("get_context")) as {
      workflow?: { next?: Array<{ action: string }> };
    };
    await mcp("get_theme_schema");
    const products = (await mcp("get_products", { limit: 10 })) as {
      products: Array<{ id: string }>;
    };

    const created = (await mcp("create_theme", {
      name: `Benchmark ${fx.suffix}`,
      provider: "benchmark",
    })) as { theme: { id: string } };
    counters.timeToDraftMs = performance.now() - t0;

    const ops = [
      {
        op: "create_section",
        sectionType: "hero",
        settings: { headline: "Premium storefront" },
      },
      {
        op: "create_section",
        sectionType: "product-grid",
        settings: {
          productIds: products.products.slice(0, 4).map((p) => p.id),
        },
      },
      {
        op: "create_section",
        sectionType: "rich-text",
        settings: { body: "Editorial story" },
      },
      {
        op: "create_section",
        sectionType: "footer",
        settings: {},
      },
    ];
    counters.batchOperations = ops.length;
    await mcp("apply_theme_batch", { themeId: created.theme.id, ops });

    await mcp("preview_theme", { themeId: created.theme.id });
    counters.timeToPreviewMs = performance.now() - t0;

    console.log(
      JSON.stringify(
        {
          prompt:
            "Create a premium storefront draft (homepage sections) using real products; preview; do not publish.",
          workflowFromContext:
            context.workflow?.next?.map((s) => s.action) ?? [],
          schemaSectionCount: buildCanonicalThemeSchema().sections.length,
          ...counters,
          notes: [
            "Preferred path: get_context → get_theme_schema → create_theme → apply_theme_batch → preview_theme",
            "Avoid per-section create_section loops when batch is available",
            "Claude/Cursor manual connector tests are separate from this harness",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await fx.cleanup();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
