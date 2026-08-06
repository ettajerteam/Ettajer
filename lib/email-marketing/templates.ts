import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  buildNewsletterComposeDefaults,
  getNewsletterTemplate,
  isNewsletterTemplateId,
  type NewsletterTemplateId,
} from "@/lib/email/newsletter-templates";
import { isNewsletterThemeId } from "@/lib/email/newsletter-themes";
import {
  parseEmailBlocks,
  type EmailBlock,
} from "@/lib/email-marketing/email-blocks";

export { listEmailGallery } from "@/lib/email-marketing/gallery";
export type { EmailGalleryItem } from "@/lib/email-marketing/gallery";
export { buildEmailTemplateHtml } from "@/lib/email-marketing/render";
export type { EmailTemplateRow } from "@/lib/email-marketing/types";

export function serializeEmailTemplate(row: {
  id: string;
  name: string;
  galleryId: string | null;
  themeId: string;
  subject: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  blocks?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): import("@/lib/email-marketing/types").EmailTemplateRow {
  return {
    id: row.id,
    name: row.name,
    galleryId: row.galleryId,
    themeId: row.themeId,
    subject: row.subject,
    title: row.title,
    body: row.body,
    ctaLabel: row.ctaLabel,
    ctaUrl: row.ctaUrl,
    blocks: parseEmailBlocks(row.blocks),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listEmailTemplates(storeId: string) {
  return prisma.emailTemplate.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getEmailTemplate(id: string, storeId: string) {
  return prisma.emailTemplate.findFirst({
    where: { id, storeId },
  });
}

export async function createEmailTemplateFromGallery(input: {
  storeId: string;
  galleryId: NewsletterTemplateId;
  storeName: string;
  name?: string;
}) {
  const gallery = getNewsletterTemplate(input.galleryId);
  if (!gallery) throw new Error("Unknown gallery template");
  const fields = buildNewsletterComposeDefaults(input.galleryId, input.storeName);
  return prisma.emailTemplate.create({
    data: {
      storeId: input.storeId,
      name: input.name?.trim() || gallery.name,
      galleryId: gallery.id,
      themeId: gallery.suggestedThemeId,
      subject: fields.subject,
      title: fields.title,
      body: fields.body,
      ctaLabel: fields.ctaLabel,
      ctaUrl: fields.ctaUrl,
    },
  });
}

export async function createEmailTemplate(input: {
  storeId: string;
  name: string;
  galleryId?: string | null;
  themeId: string;
  subject: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  blocks?: EmailBlock[];
}) {
  if (!isNewsletterThemeId(input.themeId)) {
    throw new Error("Unknown theme");
  }
  if (input.galleryId && !isNewsletterTemplateId(input.galleryId)) {
    throw new Error("Unknown gallery template");
  }
  const blocks = parseEmailBlocks(input.blocks ?? []);
  return prisma.emailTemplate.create({
    data: {
      storeId: input.storeId,
      name: input.name.trim(),
      galleryId: input.galleryId ?? null,
      themeId: input.themeId,
      subject: input.subject.trim(),
      title: input.title.trim(),
      body: input.body.trim(),
      ctaLabel: (input.ctaLabel ?? "").trim(),
      ctaUrl: (input.ctaUrl ?? "").trim(),
      blocks: blocks as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function updateEmailTemplate(
  id: string,
  storeId: string,
  input: {
    name: string;
    themeId: string;
    subject: string;
    title: string;
    body: string;
    ctaLabel?: string;
    ctaUrl?: string;
    blocks?: EmailBlock[];
  }
) {
  const existing = await getEmailTemplate(id, storeId);
  if (!existing) throw new Error("Template not found");
  if (!isNewsletterThemeId(input.themeId)) {
    throw new Error("Unknown theme");
  }
  const blocks = parseEmailBlocks(input.blocks ?? []);
  return prisma.emailTemplate.update({
    where: { id },
    data: {
      name: input.name.trim(),
      themeId: input.themeId,
      subject: input.subject.trim(),
      title: input.title.trim(),
      body: input.body.trim(),
      ctaLabel: (input.ctaLabel ?? "").trim(),
      ctaUrl: (input.ctaUrl ?? "").trim(),
      blocks: blocks as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function deleteEmailTemplate(id: string, storeId: string) {
  const existing = await getEmailTemplate(id, storeId);
  if (!existing) throw new Error("Template not found");

  const linked = await prisma.emailAutomation.count({
    where: { templateId: id, storeId },
  });
  if (linked > 0) {
    throw new Error(
      "This template is used by an automation. Unlink it first."
    );
  }

  await prisma.emailTemplate.delete({ where: { id } });
}
