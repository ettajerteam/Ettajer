import { describe, expect, it } from "vitest";
import { clampListLimit, paginateRows } from "@/lib/developer/pagination";
import {
  buildDeveloperErrorBody,
  DeveloperApiError,
} from "@/lib/developer/errors";

describe("pagination", () => {
  it("clamps limits", () => {
    expect(clampListLimit(undefined)).toBe(50);
    expect(clampListLimit(0)).toBe(50);
    expect(clampListLimit(200)).toBe(100);
    expect(clampListLimit(3)).toBe(3);
  });

  it("computes nextCursor and hasMore", () => {
    const rows = [
      { id: "a" },
      { id: "b" },
      { id: "c" },
    ];
    const page = paginateRows(rows, 2);
    expect(page.items.map((r) => r.id)).toEqual(["a", "b"]);
    expect(page.pagination.hasMore).toBe(true);
    expect(page.pagination.nextCursor).toBe("b");
    expect(page.pagination.limit).toBe(2);

    const last = paginateRows(rows.slice(0, 2), 2);
    expect(last.pagination.hasMore).toBe(false);
    expect(last.pagination.nextCursor).toBeNull();
  });
});

describe("error envelope", () => {
  it("includes requestId and hint details", () => {
    const err = new DeveloperApiError(
      "INVALID_PRODUCT_REFERENCE",
      "Product missing",
      { hint: "Use get_products" },
    );
    const body = buildDeveloperErrorBody(
      err.code,
      err.message,
      err.details,
      "req_123",
    );
    expect(body.error.requestId).toBe("req_123");
    expect((body.error.details as { hint: string }).hint).toContain("get_products");
  });

  it("maps IDEMPOTENCY_CONFLICT to 409", () => {
    const err = new DeveloperApiError(
      "IDEMPOTENCY_CONFLICT",
      "Key reused",
    );
    expect(err.status).toBe(409);
  });
});
