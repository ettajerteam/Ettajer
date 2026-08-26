import { describe, expect, it } from "vitest";
import {
  formatAdminDateTime,
  formatAdminInt,
  formatAdminRelative,
} from "@/lib/admin/format";

describe("formatAdminInt", () => {
  it("always uses en-US grouping (comma), never narrow space", () => {
    expect(formatAdminInt(15456.72)).toBe("15,457");
    expect(formatAdminInt(15456.72)).not.toMatch(/\u202f/);
    expect(formatAdminInt(22650.58)).toBe("22,651");
  });
});

describe("formatAdminDateTime", () => {
  it("is stable in Africa/Casablanca regardless of host TZ", () => {
    const iso = "2026-08-24T10:45:00.000Z";
    const a = formatAdminDateTime(iso);
    const b = formatAdminDateTime(new Date(iso));
    expect(a).toBe(b);
    expect(a).toMatch(/Aug 24,/);
    expect(formatAdminRelative(iso, new Date(iso).getTime() + 5 * 60000)).toBe(
      "5 min ago"
    );
    expect(
      formatAdminRelative(iso, new Date(iso).getTime() + 50 * 3600 * 1000)
    ).toBe(formatAdminDateTime(iso));
  });
});
