import { AsyncLocalStorage } from "async_hooks";
import { NextResponse } from "next/server";
import {
  resolveDeveloperAuth,
  requireScopes,
  type DeveloperAuthContext,
} from "@/lib/developer/auth-context";
import {
  fromDeveloperError,
  DeveloperApiError,
  applyRateLimitHeaders,
} from "@/lib/developer/errors";
import {
  enforceDeveloperRateLimitsAsync,
  type RateLimitResult,
} from "@/lib/developer/rate-limit";
import type { DeveloperScope } from "@/lib/developer/scopes";
import type { CursorPagination } from "@/lib/developer/pagination";
import {
  beginIdempotency,
  finalizeIdempotency,
  type IdempotencyBegin,
} from "@/lib/developer/idempotency";

const TOKEN_RATE_LIMIT = 60;

export type DeveloperGate = {
  ctx: DeveloperAuthContext;
  requestId: string;
  rateLimit: RateLimitResult;
  rateLimitCap: number;
  ip: string;
};

type RequestStore = DeveloperGate;

const requestStore = new AsyncLocalStorage<RequestStore>();

export function getDeveloperRequestStore(): RequestStore | undefined {
  return requestStore.getStore();
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function resolveRequestId(request: Request): string {
  const inbound = request.headers.get("x-request-id")?.trim();
  if (inbound && inbound.length >= 8 && inbound.length <= 128 && /^[\w\-.:]+$/.test(inbound)) {
    return inbound;
  }
  return crypto.randomUUID();
}

/** Shared Auth → rate-limit gate for REST and MCP. */
export async function runDeveloperGate(request: Request): Promise<DeveloperGate> {
  const requestId = resolveRequestId(request);
  const ctx = await resolveDeveloperAuth(request);
  const rateLimit = await enforceDeveloperRateLimitsAsync({
    applicationId: ctx.applicationId,
    tokenKey: ctx.tokenKey,
    ip: clientIp(request),
  });
  if (!rateLimit.ok) {
    throw new DeveloperApiError(
      "RATE_LIMITED",
      "Too many requests. Try again shortly.",
    );
  }
  return {
    ctx,
    requestId,
    rateLimit,
    rateLimitCap: TOKEN_RATE_LIMIT,
    ip: clientIp(request),
  };
}

export function platformHeaders(gate: DeveloperGate): Headers {
  const headers = new Headers();
  headers.set("X-Request-Id", gate.requestId);
  headers.set("Cache-Control", "private, no-store");
  applyRateLimitHeaders(headers, gate.rateLimit, gate.rateLimitCap);
  return headers;
}

export function withPlatformHeaders(
  response: Response,
  gate: DeveloperGate,
): Response {
  const headers = new Headers(response.headers);
  if (!headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", gate.requestId);
  }
  if (!headers.has("X-RateLimit-Limit")) {
    applyRateLimitHeaders(headers, gate.rateLimit, gate.rateLimitCap);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export type V1Handler = (
  request: Request,
  ctx: DeveloperAuthContext,
  params: Record<string, string>,
  gate: DeveloperGate,
) => Promise<Response>;

export function withDeveloperApi(options: {
  scopes?: DeveloperScope | DeveloperScope[];
  /** Enable Idempotency-Key handling for POST/PATCH/DELETE. */
  idempotent?: boolean;
  handler: V1Handler;
}) {
  return async (
    request: Request,
    routeCtx?: { params?: Record<string, string> | Promise<Record<string, string>> },
  ) => {
    const requestIdEarly = resolveRequestId(request);
    let gate: DeveloperGate | undefined;
    try {
      gate = await runDeveloperGate(request);
      return await requestStore.run(gate, async () => {
        if (options.scopes) {
          requireScopes(gate!.ctx, options.scopes);
        }
        const params = routeCtx?.params
          ? await Promise.resolve(routeCtx.params)
          : {};

        let activeRequest = request;
        let idem: IdempotencyBegin | null = null;
        if (options.idempotent) {
          idem = await beginIdempotency({
            request,
            applicationId: gate!.ctx.applicationId,
            requestId: gate!.requestId,
          });
          if (idem.kind === "replay") {
            return withPlatformHeaders(idem.response, gate!);
          }
          if (idem.kind === "fresh") {
            activeRequest = idem.request;
          }
        }

        const response = await options.handler(
          activeRequest,
          gate!.ctx,
          params,
          gate!,
        );
        const wrapped = withPlatformHeaders(response, gate!);

        if (idem?.kind === "fresh") {
          await finalizeIdempotency(idem, wrapped);
        }

        return wrapped;
      });
    } catch (err) {
      return fromDeveloperError(err, {
        requestId: gate?.requestId ?? requestIdEarly,
        rateLimit: gate?.rateLimit,
        rateLimitCap: gate?.rateLimitCap ?? TOKEN_RATE_LIMIT,
      });
    }
  };
}

export type JsonDataOptions = {
  status?: number;
  headers?: HeadersInit;
  pagination?: CursorPagination;
};

/** REST success envelope: `{ data }` (+ optional `pagination`). */
export function jsonData<T>(data: T, options?: JsonDataOptions) {
  const store = getDeveloperRequestStore();
  const headers = new Headers(options?.headers);
  if (store) {
    if (!headers.has("X-Request-Id")) {
      headers.set("X-Request-Id", store.requestId);
    }
    if (!headers.has("X-RateLimit-Limit")) {
      applyRateLimitHeaders(headers, store.rateLimit, store.rateLimitCap);
    }
  }
  const body =
    options?.pagination !== undefined
      ? { data, pagination: options.pagination }
      : { data };
  return NextResponse.json(body, {
    status: options?.status ?? 200,
    headers,
  });
}

/** @deprecated Use jsonData — kept for gradual migration aliases. */
export function jsonOk<T>(data: T, init?: ResponseInit) {
  const status =
    typeof init?.status === "number" ? init.status : 200;
  return jsonData(data, { status, headers: init?.headers });
}
