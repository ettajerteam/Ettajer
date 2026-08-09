import { NextResponse } from "next/server";
import {
  runDeveloperGate,
  platformHeaders,
  withPlatformHeaders,
} from "@/app/api/v1/_lib/handler";
import {
  fromDeveloperError,
  developerErrorPayload,
} from "@/lib/developer/errors";
import {
  callMcpTool,
  listMcpTools,
  listMcpResources,
  readMcpResource,
} from "@/lib/developer/mcp-tools";

export const dynamic = "force-dynamic";

/**
 * MCP-compatible JSON-RPC over HTTP for Cursor / Claude agents.
 * Auth: Authorization: Bearer <access_token|etsk_live_…>
 * Uses the same Auth → rate-limit gate as REST.
 */
export async function POST(request: Request) {
  let gate: Awaited<ReturnType<typeof runDeveloperGate>> | undefined;
  try {
    gate = await runDeveloperGate(request);
    const headers = platformHeaders(gate);

    const body = (await request.json()) as {
      jsonrpc?: string;
      id?: string | number | null;
      method?: string;
      params?: Record<string, unknown>;
    };

    const id = body.id ?? null;

    const jsonRpc = (payload: Record<string, unknown>) =>
      NextResponse.json(payload, { headers });

    if (body.method === "initialize") {
      return jsonRpc({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
          },
          serverInfo: {
            name: "ettajer",
            version: "1.1.0",
            instructions:
              "Ettajer Developer MCP. AI controls presentation (themes). Ettajer controls commerce. START with get_context, then get_theme_schema. Prefer apply_theme_batch for multi-section drafts. Preview before publish.",
          },
        },
      });
    }

    if (
      body.method === "notifications/initialized" ||
      body.method === "initialized"
    ) {
      return jsonRpc({ jsonrpc: "2.0", id, result: {} });
    }

    if (body.method === "tools/list") {
      return jsonRpc({
        jsonrpc: "2.0",
        id,
        result: { tools: listMcpTools() },
      });
    }

    if (body.method === "tools/call") {
      const params = body.params ?? {};
      const name = String(params.name || "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      try {
        const result = await callMcpTool(gate.ctx, name, args, {
          requestId: gate.requestId,
        });
        return jsonRpc({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            _meta: { requestId: gate.requestId },
          },
        });
      } catch (err) {
        const payload = developerErrorPayload(err, gate.requestId);
        return jsonRpc({
          jsonrpc: "2.0",
          id,
          result: {
            isError: true,
            content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
            _meta: { requestId: gate.requestId },
          },
        });
      }
    }

    if (body.method === "resources/list") {
      return jsonRpc({
        jsonrpc: "2.0",
        id,
        result: { resources: listMcpResources() },
      });
    }

    if (body.method === "resources/read") {
      const uri = String((body.params ?? {}).uri || "");
      const contents = await readMcpResource(gate.ctx, uri);
      return jsonRpc({
        jsonrpc: "2.0",
        id,
        result: { contents },
      });
    }

    if (body.method === "ping") {
      return jsonRpc({ jsonrpc: "2.0", id, result: {} });
    }

    return jsonRpc({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${body.method}` },
    });
  } catch (err) {
    const response = fromDeveloperError(err, {
      requestId: gate?.requestId,
      rateLimit: gate?.rateLimit,
      rateLimitCap: gate?.rateLimitCap,
    });
    return gate ? withPlatformHeaders(response, gate) : response;
  }
}

export async function GET() {
  return NextResponse.json(
    {
      name: "Ettajer MCP",
      transport: "http",
      endpoint: "/api/v1/mcp",
      version: "1.1.0",
      auth: "Bearer OAuth access token or etsk_live_ API key",
      methods: [
        "initialize",
        "notifications/initialized",
        "tools/list",
        "tools/call",
        "resources/list",
        "resources/read",
        "ping",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
