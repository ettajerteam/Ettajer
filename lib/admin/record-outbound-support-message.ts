import { prisma } from "@/lib/db";
import {
  SUPPORT_MESSAGE_DIRECTION,
  SUPPORT_MESSAGE_STATUS,
} from "@/lib/admin/constants";

export async function recordOutboundSupportMessage(params: {
  email: string;
  topic: string;
  message: string;
  articleRef?: string | null;
}) {
  return prisma.supportMessage.create({
    data: {
      name: "Ettajer Support",
      email: params.email.trim(),
      topic: params.topic,
      message: params.message,
      articleRef: params.articleRef ?? null,
      direction: SUPPORT_MESSAGE_DIRECTION.OUTBOUND,
      status: SUPPORT_MESSAGE_STATUS.READ,
    },
  });
}
