import { prisma } from "@/lib/db";

function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GC-";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function listGiftCards(storeId: string) {
  return prisma.giftCard.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGiftCard(
  storeId: string,
  data: { balance: number; expiresAt?: Date | null }
) {
  let code = generateGiftCardCode();
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.giftCard.findFirst({ where: { storeId, code } });
    if (!exists) break;
    code = generateGiftCardCode();
    attempts++;
  }

  return prisma.giftCard.create({
    data: {
      storeId,
      code,
      initialBalance: data.balance,
      balance: data.balance,
      expiresAt: data.expiresAt ?? null,
    },
  });
}

export async function deactivateGiftCard(id: string, storeId: string) {
  const card = await prisma.giftCard.findFirst({ where: { id, storeId } });
  if (!card) throw new Error("Gift card not found");
  return prisma.giftCard.update({ where: { id }, data: { active: false } });
}
