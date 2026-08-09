import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/developer/crypto";
import { DeveloperApiError } from "@/lib/developer/errors";
import type { Prisma } from "@prisma/client";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const MUTATING = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export type IdempotencyBegin =
  | { kind: "skip" }
  | { kind: "replay"; response: Response }
  | {
      kind: "fresh";
      applicationId: string;
      keyHash: string;
      method: string;
      path: string;
      bodyHash: string;
      requestId: string;
      /** Request with body re-buffered for the handler. */
      request: Request;
    };

function normalizeKey(raw: string): string {
  const key = raw.trim();
  if (key.length < 8 || key.length > 256) {
    throw new DeveloperApiError(
      "VALIDATION_ERROR",
      "Idempotency-Key must be 8–256 characters.",
      { hint: "Send a stable UUID or similar in the Idempotency-Key header." },
    );
  }
  return key;
}

/**
 * Begin idempotency handling. Buffers the request body when a key is present
 * so the handler can still read JSON/form data.
 */
export async function beginIdempotency(input: {
  request: Request;
  applicationId: string;
  requestId: string;
}): Promise<IdempotencyBegin> {
  const method = input.request.method.toUpperCase();
  if (!MUTATING.has(method)) return { kind: "skip" };

  const rawKey = input.request.headers.get("idempotency-key");
  if (!rawKey?.trim()) return { kind: "skip" };

  const key = normalizeKey(rawKey);
  const keyHash = hashToken(`${input.applicationId}:${key}`);
  const path = new URL(input.request.url).pathname;

  const bodyText =
    method === "DELETE" ? "" : await input.request.clone().text();
  const bodyHash = hashToken(bodyText);

  const existing = await prisma.developerIdempotencyRecord.findUnique({
    where: {
      applicationId_keyHash: {
        applicationId: input.applicationId,
        keyHash,
      },
    },
  });

  if (existing) {
    if (existing.expiresAt.getTime() <= Date.now()) {
      await prisma.developerIdempotencyRecord
        .delete({ where: { id: existing.id } })
        .catch(() => undefined);
    } else if (
      existing.method !== method ||
      existing.path !== path ||
      existing.bodyHash !== bodyHash
    ) {
      throw new DeveloperApiError(
        "IDEMPOTENCY_CONFLICT",
        "Idempotency-Key was reused with a different request.",
        {
          hint: "Use a new Idempotency-Key for a different mutation, or retry with the exact same method/path/body.",
        },
      );
    } else if (existing.statusCode != null && existing.responseJson != null) {
      return {
        kind: "replay",
        response: NextResponse.json(existing.responseJson, {
          status: existing.statusCode,
          headers: {
            "X-Idempotency-Replayed": "true",
            ...(existing.requestId
              ? { "X-Request-Id": existing.requestId }
              : {}),
          },
        }),
      };
    }
  }

  const request =
    method === "DELETE"
      ? input.request
      : new Request(input.request.url, {
          method: input.request.method,
          headers: input.request.headers,
          body: bodyText,
          // @ts-expect-error duplex required for streaming body in some runtimes
          duplex: "half",
        });

  // Reserve the key (upsert) so concurrent duplicates collide cleanly
  await prisma.developerIdempotencyRecord.upsert({
    where: {
      applicationId_keyHash: {
        applicationId: input.applicationId,
        keyHash,
      },
    },
    create: {
      applicationId: input.applicationId,
      keyHash,
      method,
      path,
      bodyHash,
      requestId: input.requestId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
    update: {
      // If a prior incomplete record exists, allow same fingerprint to proceed
      method,
      path,
      bodyHash,
      requestId: input.requestId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
  });

  return {
    kind: "fresh",
    applicationId: input.applicationId,
    keyHash,
    method,
    path,
    bodyHash,
    requestId: input.requestId,
    request,
  };
}

export async function finalizeIdempotency(
  fresh: Extract<IdempotencyBegin, { kind: "fresh" }>,
  response: Response,
) {
  try {
    const clone = response.clone();
    const responseJson = (await clone.json()) as Prisma.InputJsonValue;
    await prisma.developerIdempotencyRecord.update({
      where: {
        applicationId_keyHash: {
          applicationId: fresh.applicationId,
          keyHash: fresh.keyHash,
        },
      },
      data: {
        statusCode: response.status,
        responseJson,
        requestId: fresh.requestId,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
      },
    });
  } catch (err) {
    console.error("[idempotency] finalize failed", err);
  }
}

/** MCP helper: run a mutation under an optional idempotencyKey argument. */
export async function withMcpIdempotency<T>(input: {
  applicationId: string;
  requestId: string;
  toolName: string;
  idempotencyKey?: string;
  argsFingerprint: unknown;
  run: () => Promise<T>;
}): Promise<T> {
  const key = input.idempotencyKey?.trim();
  if (!key) return input.run();

  const normalized = normalizeKey(key);
  const keyHash = hashToken(`${input.applicationId}:${normalized}`);
  const path = `mcp:${input.toolName}`;
  const bodyHash = hashToken(JSON.stringify(input.argsFingerprint ?? {}));
  const method = "POST";

  const existing = await prisma.developerIdempotencyRecord.findUnique({
    where: {
      applicationId_keyHash: {
        applicationId: input.applicationId,
        keyHash,
      },
    },
  });

  if (existing && existing.expiresAt.getTime() > Date.now()) {
    if (
      existing.method !== method ||
      existing.path !== path ||
      existing.bodyHash !== bodyHash
    ) {
      throw new DeveloperApiError(
        "IDEMPOTENCY_CONFLICT",
        "idempotencyKey was reused with different tool arguments.",
        {
          hint: "Use a new idempotencyKey for a different mutation.",
        },
      );
    }
    if (existing.statusCode != null && existing.responseJson != null) {
      return existing.responseJson as T;
    }
  }

  await prisma.developerIdempotencyRecord.upsert({
    where: {
      applicationId_keyHash: {
        applicationId: input.applicationId,
        keyHash,
      },
    },
    create: {
      applicationId: input.applicationId,
      keyHash,
      method,
      path,
      bodyHash,
      requestId: input.requestId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
    update: {
      method,
      path,
      bodyHash,
      requestId: input.requestId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
  });

  const result = await input.run();

  await prisma.developerIdempotencyRecord.update({
    where: {
      applicationId_keyHash: {
        applicationId: input.applicationId,
        keyHash,
      },
    },
    data: {
      statusCode: 200,
      responseJson: result as Prisma.InputJsonValue,
      requestId: input.requestId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    },
  });

  return result;
}
