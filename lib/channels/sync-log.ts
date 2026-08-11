import { prisma } from "@/lib/db";
import type { ChannelSyncLogStatus, ChannelSyncOperation } from "@/lib/channels/types";

export interface AppendChannelSyncLogInput {
  storeId: string;
  connectionId?: string | null;
  channel: string;
  operation: ChannelSyncOperation | string;
  status: ChannelSyncLogStatus;
  externalId?: string | null;
  durationMs?: number | null;
  errorCode?: string | null;
  correlationId?: string | null;
  message?: string | null;
}

const SECRET_LIKE_KEY_PATTERN = /token|secret|authorization|password/i;

/**
 * Defensive sanitizer: even though callers should never pass tokens here,
 * strip anything that looks like one before persisting a free-text message.
 */
function sanitizeMessage(message: string | null | undefined): string | null {
  if (!message) return null;
  let sanitized = message;
  const matches = Array.from(
    message.matchAll(
      /([a-zA-Z0-9_.-]*(?:token|secret)[a-zA-Z0-9_.-]*)\s*[:=]\s*["']?([\w.\-+/]{12,})["']?/gi
    )
  );
  for (const match of matches) {
    sanitized = sanitized.replace(match[2], "[redacted]");
  }
  return sanitized.slice(0, 4000);
}

function sanitizeObjectKeys(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (SECRET_LIKE_KEY_PATTERN.test(key)) delete obj[key];
  }
}

/** Append an entry to ChannelSyncLog. Never persists tokens or secrets. */
export async function appendChannelSyncLog(
  input: AppendChannelSyncLogInput
): Promise<void> {
  await prisma.channelSyncLog.create({
    data: {
      storeId: input.storeId,
      connectionId: input.connectionId ?? null,
      channel: input.channel,
      operation: input.operation,
      status: input.status,
      externalId: input.externalId ?? null,
      durationMs: input.durationMs ?? null,
      errorCode: input.errorCode ?? null,
      correlationId: input.correlationId ?? null,
      message: sanitizeMessage(input.message),
    },
  });
}

/** Helper for callers logging structured context — strips obvious secret keys. */
export function sanitizeLogContext<T extends Record<string, unknown>>(context: T): T {
  const clone = { ...context } as Record<string, unknown>;
  sanitizeObjectKeys(clone);
  return clone as T;
}
