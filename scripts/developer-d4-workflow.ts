/**
 * D4 real-store workflow against production MCP (API key auth).
 *
 * Usage (never commit the key):
 *   $env:D4_MCP_BEARER="etsk_live_…"
 *   npx tsx scripts/developer-d4-workflow.ts
 *
 * Does not publish. Does not print tokens.
 */
import fs from "fs";
import path from "path";

function loadEnvFiles() {
  for (const name of [".env", ".env.local"]) {
    const p = path.join(process.cwd(), name);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i <= 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

loadEnvFiles();

const BASE = (
  process.env.D4_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://www.ettajer.com"
).replace(/\/$/, "");
const BEARER = process.env.D4_MCP_BEARER?.trim();

if (!BEARER) {
  console.error("Set D4_MCP_BEARER to a scoped API key (no themes:publish).");
  process.exit(1);
}

type Metrics = {
  mcpCalls: number;
  failedCalls: number;
  retries: number;
  timeToDraftMs: number | null;
  timeToPreviewMs: number | null;
  timeToIterationMs: number | null;
  themeId: string | null;
  previewUrl: string | null;
  publishDenied: boolean | null;
  notes: string[];
};

async function mcp(method: string, params?: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/v1/mcp`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BEARER}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
  });
  const json = (await res.json()) as {
    result?: {
      content?: { text?: string }[];
      isError?: boolean;
      tools?: unknown[];
      resources?: unknown[];
      protocolVersion?: string;
    };
    error?: { message?: string };
  };
  return { status: res.status, json };
}

async function tool(name: string, args: Record<string, unknown> = {}) {
  const { status, json } = await mcp("tools/call", { name, arguments: args });
  const text = json.result?.content?.[0]?.text ?? "";
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  const failed = status >= 400 || Boolean(json.result?.isError) || Boolean(json.error);
  return { status, failed, parsed, raw: json };
}

async function main() {
  const t0 = performance.now();
  const metrics: Metrics = {
    mcpCalls: 0,
    failedCalls: 0,
    retries: 0,
    timeToDraftMs: null,
    timeToPreviewMs: null,
    timeToIterationMs: null,
    themeId: null,
    previewUrl: null,
    publishDenied: null,
    notes: [],
  };

  const track = async <T>(fn: () => Promise<T>): Promise<T> => {
    metrics.mcpCalls += 1;
    try {
      return await fn();
    } catch (e) {
      metrics.failedCalls += 1;
      throw e;
    }
  };

  await track(async () => {
    const init = await mcp("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "d4-workflow", version: "1.0" },
    });
    if (init.status !== 200 || !init.json.result?.protocolVersion) {
      throw new Error("initialize failed");
    }
  });

  const listed = await track(async () => mcp("tools/list"));
  const toolCount = listed.json.result?.tools?.length ?? 0;
  metrics.notes.push(`tools/list count=${toolCount}`);

  const ctx = await track(async () => tool("get_context", {}));
  if (ctx.failed) {
    metrics.failedCalls += 1;
    throw new Error("get_context failed");
  }
  const context = ctx.parsed as {
    store?: { name?: string; id?: string };
    workflow?: { next?: { action?: string }[] };
  };
  metrics.notes.push(`store=${context.store?.name ?? "?"}`);

  await track(async () => {
    const schema = await tool("get_theme_schema", {});
    if (schema.failed) {
      metrics.failedCalls += 1;
      throw new Error("get_theme_schema failed");
    }
  });

  const products = await track(async () => tool("get_products", { limit: 6 }));
  if (products.failed) metrics.failedCalls += 1;
  const productIds =
    ((products.parsed as { products?: { id: string }[] })?.products ?? []).map(
      (p) => p.id,
    );

  const collections = await track(async () =>
    tool("get_collections", { limit: 6 }),
  );
  if (collections.failed) metrics.failedCalls += 1;
  const collectionId = (
    (collections.parsed as { collections?: { id: string }[] })?.collections ?? []
  )[0]?.id;

  const created = await track(async () =>
    tool("create_theme", {
      name: "AI Minimal",
      provider: "d4-workflow",
    }),
  );
  if (created.failed) {
    metrics.failedCalls += 1;
    throw new Error("create_theme failed");
  }
  const themeId = (created.parsed as { theme?: { id?: string; status?: string } })
    ?.theme?.id;
  if (!themeId) throw new Error("missing theme id");
  metrics.themeId = themeId;
  metrics.timeToDraftMs = performance.now() - t0;

  const batchOps: unknown[] = [
    {
      op: "set_theme_tokens",
      theme: {
        fontFamily: "Inter",
        backgroundColor: "#ffffff",
        primaryColor: "#2563eb",
      },
    },
    {
      op: "create_section",
      sectionType: "hero",
      settings: {
        headline: "Designed with intent",
        subheadline: "Premium essentials for everyday life.",
        ctaLabel: "Shop now",
        ctaHref: "/products",
      },
    },
  ];
  if (collectionId) {
    batchOps.push({
      op: "create_section",
      sectionType: "featured-collections",
      settings: { collectionId, title: "Featured" },
    });
  }
  if (productIds.length) {
    batchOps.push({
      op: "create_section",
      sectionType: "product-grid",
      settings: { productIds: productIds.slice(0, 4), title: "Selected" },
    });
  }
  batchOps.push(
    {
      op: "create_section",
      sectionType: "rich-text",
      settings: {
        title: "Quiet luxury",
        body: "A calmer storefront. Less noise. More clarity.",
      },
    },
    {
      op: "create_section",
      sectionType: "footer",
      settings: {},
    },
  );

  const batch = await track(async () =>
    tool("apply_theme_batch", { themeId, ops: batchOps }),
  );
  if (batch.failed) {
    metrics.failedCalls += 1;
    metrics.notes.push(
      `batch failed: ${JSON.stringify(batch.parsed).slice(0, 240)}`,
    );
    throw new Error("apply_theme_batch failed");
  }

  const preview = await track(async () => tool("preview_theme", { themeId }));
  if (preview.failed) {
    metrics.failedCalls += 1;
    throw new Error("preview_theme failed");
  }
  const previewUrl = (preview.parsed as { previewUrl?: string })?.previewUrl;
  metrics.previewUrl = previewUrl ?? null;
  metrics.timeToPreviewMs = performance.now() - t0;

  if (previewUrl) {
    const absolutePreview = previewUrl.startsWith("http")
      ? previewUrl
      : `${BASE}${previewUrl.startsWith("/") ? "" : "/"}${previewUrl}`;
    metrics.previewUrl = absolutePreview;
    const open = await fetch(absolutePreview, { redirect: "follow" });
    metrics.notes.push(`preview_http=${open.status}`);
  }

  // Iteration: update hero via create_section replacement isn't ideal — fetch theme then update_section
  const themeGet = await track(async () => tool("get_theme", { themeId }));
  const sections =
    (
      (themeGet.parsed as {
        theme?: {
          document?: { templates?: { home?: { sections?: { id: string; type: string }[] } } };
        };
      })?.theme?.document?.templates?.home?.sections ?? []
    );
  const hero = sections.find((s) => s.type === "hero");
  if (hero) {
    const iterate = await track(async () =>
      tool("apply_theme_batch", {
        themeId,
        ops: [
          {
            op: "update_section",
            sectionId: hero.id,
            settings: {
              headline: "Clarity, elevated",
              subheadline: "A tighter hero. A stronger CTA.",
              ctaLabel: "Explore",
              ctaHref: "/products",
            },
          },
        ],
      }),
    );
    if (iterate.failed) metrics.failedCalls += 1;
    else {
      const preview2 = await track(async () => tool("preview_theme", { themeId }));
      if (!preview2.failed) metrics.timeToIterationMs = performance.now() - t0;
    }
  } else {
    metrics.notes.push("hero section id not found for iteration");
  }

  const publish = await track(async () => tool("publish_theme", { themeId }));
  metrics.publishDenied = Boolean(
    publish.failed ||
      (publish.parsed as { error?: { code?: string } })?.error?.code ===
        "INSUFFICIENT_SCOPE",
  );
  if (!metrics.publishDenied) {
    metrics.notes.push("WARNING: publish was not denied — check API key scopes");
  }

  console.log(JSON.stringify(metrics, null, 2));
}

main().catch((err) => {
  console.error(String(err?.message || err));
  process.exit(1);
});
