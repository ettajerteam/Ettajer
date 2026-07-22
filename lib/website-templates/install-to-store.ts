import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { applyTemplate } from "@/lib/website-templates/installer";
import type { WebsiteTemplateId } from "@/lib/website-templates/types";
import { isWebsiteTemplateId } from "@/lib/website-templates/registry";

export async function installWebsiteTemplateOnStore(
  storeId: string,
  templateId: WebsiteTemplateId,
): Promise<void> {
  const result = applyTemplate(templateId);
  if (!result) {
    throw new Error(`Unknown website template: ${templateId}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.store.update({
      where: { id: storeId },
      data: {
        websiteTemplateId: templateId,
        theme: result.theme.theme,
        primaryColor: result.theme.primaryColor,
        secondaryColor: result.theme.secondaryColor,
        font: result.theme.font,
      },
    });

    await tx.storeSettings.update({
      where: { storeId },
      data: {
        homeLayout: result.homeLayout as unknown as Prisma.InputJsonValue,
        navigation: result.navigation as unknown as Prisma.InputJsonValue,
        ...(result.productLayout
          ? { productLayout: result.productLayout as unknown as Prisma.InputJsonValue }
          : {}),
        ...(result.collectionLayout
          ? { collectionLayout: result.collectionLayout as unknown as Prisma.InputJsonValue }
          : {}),
        ...(result.blogPostLayout
          ? { blogPostLayout: result.blogPostLayout as unknown as Prisma.InputJsonValue }
          : {}),
      },
    });

    for (const page of result.pages) {
      const existing = await tx.storePage.findFirst({
        where: { storeId, slug: page.slug },
      });
      if (existing) {
        await tx.storePage.update({
          where: { id: existing.id },
          data: {
            title: page.title,
            content: page.content,
            // Template install always wins on publish state so nav links resolve live.
            status: page.status ?? "published",
          },
        });
        continue;
      }

      await tx.storePage.create({
        data: {
          storeId,
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status ?? "published",
        },
      });
    }
  });
}

export function parseWebsiteTemplateId(value: unknown): WebsiteTemplateId | null {
  if (typeof value !== "string") return null;
  return isWebsiteTemplateId(value) ? value : null;
}
