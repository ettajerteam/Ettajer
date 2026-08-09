import { NextResponse } from "next/server";
import type { RateLimitResult } from "@/lib/developer/rate-limit";

export type DeveloperErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INSUFFICIENT_SCOPE"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "INVALID_THEME_SECTION"
  | "INVALID_THEME_STYLE"
  | "INVALID_PRODUCT_REFERENCE"
  | "INVALID_COLLECTION_REFERENCE"
  | "INVALID_MEDIA_REFERENCE"
  | "INVALID_NAVIGATION"
  | "UNSAFE_MEDIA_URL"
  | "RATE_LIMITED"
  | "INVALID_TOKEN"
  | "INVALID_REQUEST"
  | "INVALID_CLIENT"
  | "INVALID_GRANT"
  | "UNSUPPORTED_GRANT_TYPE"
  | "IDEMPOTENCY_CONFLICT"
  | "INVALID_CURSOR"
  | "SERVER_ERROR";

const STATUS: Record<DeveloperErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INSUFFICIENT_SCOPE: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 400,
  INVALID_THEME_SECTION: 400,
  INVALID_THEME_STYLE: 400,
  INVALID_PRODUCT_REFERENCE: 400,
  INVALID_COLLECTION_REFERENCE: 400,
  INVALID_MEDIA_REFERENCE: 400,
  INVALID_NAVIGATION: 400,
  UNSAFE_MEDIA_URL: 400,
  RATE_LIMITED: 429,
  INVALID_TOKEN: 401,
  INVALID_REQUEST: 400,
  INVALID_CLIENT: 401,
  INVALID_GRANT: 400,
  UNSUPPORTED_GRANT_TYPE: 400,
  IDEMPOTENCY_CONFLICT: 409,
  INVALID_CURSOR: 400,
  SERVER_ERROR: 500,
};

export class DeveloperApiError extends Error {
  code: DeveloperErrorCode;
  status: number;
  details?: unknown;

  constructor(code: DeveloperErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "DeveloperApiError";
    this.code = code;
    this.status = STATUS[code];
    this.details = details;
  }
}

export type DeveloperErrorBody = {
  error: {
    code: DeveloperErrorCode | "TOOL_ERROR";
    message: string;
    details?: unknown;
    requestId?: string;
  };
};

export function buildDeveloperErrorBody(
  code: DeveloperErrorCode | "TOOL_ERROR",
  message: string,
  details?: unknown,
  requestId?: string,
): DeveloperErrorBody {
  return {
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };
}

export function developerErrorResponse(
  code: DeveloperErrorCode,
  message: string,
  details?: unknown,
  extras?: {
    requestId?: string;
    rateLimit?: RateLimitResult;
    rateLimitCap?: number;
    headers?: HeadersInit;
  },
) {
  const status = STATUS[code];
  const headers = new Headers(extras?.headers);
  headers.set("Cache-Control", "private, no-store");
  if (extras?.requestId) headers.set("X-Request-Id", extras.requestId);
  if (extras?.rateLimit && extras.rateLimitCap != null) {
    applyRateLimitHeaders(headers, extras.rateLimit, extras.rateLimitCap);
  }
  if (code === "RATE_LIMITED") {
    const retryAfter = extras?.rateLimit
      ? Math.max(1, Math.ceil((extras.rateLimit.resetAt - Date.now()) / 1000))
      : 60;
    headers.set("Retry-After", String(retryAfter));
  }

  return NextResponse.json(
    buildDeveloperErrorBody(code, message, details, extras?.requestId),
    { status, headers },
  );
}

export function applyRateLimitHeaders(
  headers: Headers,
  rateLimit: RateLimitResult,
  limit: number,
) {
  headers.set("X-RateLimit-Limit", String(limit));
  headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  headers.set(
    "X-RateLimit-Reset",
    String(Math.ceil(rateLimit.resetAt / 1000)),
  );
}

export function fromDeveloperError(
  err: unknown,
  extras?: {
    requestId?: string;
    rateLimit?: RateLimitResult;
    rateLimitCap?: number;
  },
) {
  if (err instanceof DeveloperApiError) {
    return developerErrorResponse(err.code, err.message, err.details, extras);
  }
  console.error("[developer-api]", err);
  return developerErrorResponse(
    "SERVER_ERROR",
    "An unexpected error occurred.",
    undefined,
    extras,
  );
}

/** Structured error object for MCP tool isError content (same shape as REST). */
export function developerErrorPayload(
  err: unknown,
  requestId?: string,
): DeveloperErrorBody {
  if (err instanceof DeveloperApiError) {
    return buildDeveloperErrorBody(
      err.code,
      err.message,
      err.details,
      requestId,
    );
  }
  return buildDeveloperErrorBody(
    "TOOL_ERROR",
    err instanceof Error ? err.message : "Tool failed",
    undefined,
    requestId,
  );
}
