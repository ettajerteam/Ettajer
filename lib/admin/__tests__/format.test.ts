import { describe, expect, it } from "vitest";
import { formatAdminInt } from "@/lib/admin/format";

describe("formatAdminInt", () => {
  it("always uses en-US grouping (comma), never narrow space", () => {
    expect(formatAdminInt(15456.72)).toBe("15,457");
    expect(formatAdminInt(15456.72)).not.toMatch(/\u202f/);
    expect(formatAdminInt(22650.58)).toBe("22,651");
  });
});
