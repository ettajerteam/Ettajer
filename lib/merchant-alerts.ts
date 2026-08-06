import { prisma } from "@/lib/db";
import { parseShopPreferences } from "@/lib/shop-preferences";

/** Whether the merchant opted in to new-order email alerts. */
export async function merchantWantsNewOrderEmail(storeId: string): Promise<boolean> {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId },
      select: { seo: true },
    });
    return parseShopPreferences(settings?.seo).alerts.merchantEmail;
  } catch {
    return true;
  }
}
