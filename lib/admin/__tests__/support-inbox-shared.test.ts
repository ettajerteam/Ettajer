import { describe, expect, it } from "vitest";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
  SUPPORT_TEAM_NAME,
} from "@/lib/admin/constants";
import {
  groupSupportConversations,
  type SupportMessageRow,
} from "@/lib/admin/support-inbox-shared";

function msg(
  partial: Partial<SupportMessageRow> & Pick<SupportMessageRow, "id" | "direction">
): SupportMessageRow {
  return {
    name: SUPPORT_TEAM_NAME,
    email: "demo@ettajer.test",
    topic: "Welcome",
    message: "Hi from Ettajer",
    articleRef: null,
    status: SUPPORT_MESSAGE_STATUS.READ,
    createdAt: "2026-08-18T10:00:00.000Z",
    updatedAt: "2026-08-18T10:00:00.000Z",
    ...partial,
  };
}

describe("groupSupportConversations", () => {
  it("does not label a welcome-only thread as Ettajer team", () => {
    const conversations = groupSupportConversations([
      msg({
        id: "welcome",
        direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND,
        customerName: "Demo Merchant",
      }),
    ]);

    expect(conversations).toHaveLength(1);
    expect(conversations[0]?.name).toBe("Demo Merchant");
    expect(conversations[0]?.email).toBe("demo@ettajer.test");
    expect(conversations[0]?.name).not.toBe(SUPPORT_TEAM_NAME);
  });

  it("uses the inbound merchant name when they have written in", () => {
    const conversations = groupSupportConversations([
      msg({
        id: "welcome",
        direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND,
        createdAt: "2026-08-18T10:00:00.000Z",
      }),
      msg({
        id: "hello",
        name: "Salwa",
        direction: SUPPORT_MESSAGE_DIRECTION.INBOUND,
        message: "Need help with my store",
        status: SUPPORT_MESSAGE_STATUS.NEW,
        createdAt: "2026-08-18T11:00:00.000Z",
      }),
    ]);

    expect(conversations[0]?.name).toBe("Salwa");
    expect(conversations[0]?.unreadCount).toBe(1);
    expect(conversations[0]?.lastPreview).toContain("Need help");
  });

  it("falls back to the email local-part when no person name exists", () => {
    const conversations = groupSupportConversations([
      msg({
        id: "welcome",
        direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND,
        email: "unknown.merchant@example.com",
      }),
    ]);

    expect(conversations[0]?.name).toBe("unknown.merchant");
  });
});
