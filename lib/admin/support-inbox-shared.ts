import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";

export type SupportMessageRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  articleRef: string | null;
  direction: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type SupportConversation = {
  email: string;
  name: string;
  lastMessageAt: Date;
  lastDirection: string;
  unreadCount: number;
  lastPreview: string;
  lastTopic: string;
  status: string;
  messages: SupportMessageRow[];
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function groupSupportConversations(
  messages: SupportMessageRow[]
): SupportConversation[] {
  const byEmail = new Map<string, SupportMessageRow[]>();

  for (const msg of messages) {
    const key = msg.email.trim().toLowerCase();
    const list = byEmail.get(key) ?? [];
    list.push(msg);
    byEmail.set(key, list);
  }

  const conversations: SupportConversation[] = [];

  for (const thread of Array.from(byEmail.values())) {
    const sorted = [...thread].sort(
      (a, b) => asDate(a.createdAt).getTime() - asDate(b.createdAt).getTime()
    );
    const last = sorted[sorted.length - 1]!;
    const customerMessage =
      [...sorted]
        .reverse()
        .find((m) => m.direction !== SUPPORT_MESSAGE_DIRECTION.OUTBOUND) ??
      sorted[0]!;
    const unreadCount = sorted.filter(
      (m) =>
        m.direction !== SUPPORT_MESSAGE_DIRECTION.OUTBOUND &&
        (m.status === SUPPORT_MESSAGE_STATUS.NEW ||
          m.status === SUPPORT_MESSAGE_STATUS.REVIEWING)
    ).length;

    conversations.push({
      email: customerMessage.email,
      name: customerMessage.name,
      lastMessageAt: asDate(last.createdAt),
      lastDirection: last.direction || SUPPORT_MESSAGE_DIRECTION.INBOUND,
      unreadCount,
      lastPreview: last.message.slice(0, 120),
      lastTopic: last.topic,
      status: last.status,
      messages: sorted,
    });
  }

  return conversations.sort(
    (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );
}
