import { DeveloperApiError } from "@/lib/developer/errors";

export type CursorPagination = {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: CursorPagination;
};

/** Clamp list limit to [1, max]. Default 50, max 100. */
export function clampListLimit(
  raw: number | undefined,
  defaults: { defaultLimit?: number; max?: number } = {},
): number {
  const defaultLimit = defaults.defaultLimit ?? 50;
  const max = defaults.max ?? 100;
  const n = Number.isFinite(raw) ? Number(raw) : defaultLimit;
  return Math.min(Math.max(Math.trunc(n) || defaultLimit, 1), max);
}

/**
 * Cursor pagination by id: fetch limit+1 rows, return page + nextCursor/hasMore.
 * Expects rows ordered consistently and identified by `id`.
 */
export function paginateRows<T extends { id: string }>(
  rows: T[],
  limit: number,
): Paginated<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;
  return {
    items,
    pagination: { nextCursor, hasMore, limit },
  };
}

/** Reject malformed cursors before hitting Prisma. */
export function assertListCursor(
  cursor: string | undefined | null,
): string | undefined {
  if (cursor == null || cursor === "") return undefined;
  const value = String(cursor).trim();
  if (value.length < 1 || value.length > 128 || !/^[\w-]+$/.test(value)) {
    throw new DeveloperApiError(
      "INVALID_CURSOR",
      "Pagination cursor is invalid.",
      {
        hint: "Use nextCursor exactly as returned by the previous list response. Do not invent cursors.",
      },
    );
  }
  return value;
}
