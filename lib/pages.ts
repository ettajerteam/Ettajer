import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface StorePageRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function listStorePages(storeId: string) {
  return prisma.storePage.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
}

export function serializeStorePage(page: {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): StorePageRow {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    content: page.content,
    status: page.status,
    createdAt: page.createdAt.toISOString(),
    updatedAt: page.updatedAt.toISOString(),
  };
}

export async function getStorePageBySlug(
  storeId: string,
  pageSlug: string,
  options?: { includeDraft?: boolean }
) {
  return prisma.storePage.findFirst({
    where: {
      storeId,
      slug: pageSlug,
      ...(options?.includeDraft ? {} : { status: "published" }),
    },
  });
}

export async function getStorePageById(id: string, storeId: string) {
  return prisma.storePage.findFirst({ where: { id, storeId } });
}

export async function updateStorePage(
  id: string,
  storeId: string,
  data: {
    title?: string;
    content?: string;
    status?: string;
    slug?: string;
  }
) {
  const page = await getStorePageById(id, storeId);
  if (!page) throw new Error("Page not found");

  let nextSlug = page.slug;
  if (data.slug !== undefined && data.slug.trim()) {
    let candidate = slugify(data.slug);
    const clash = await prisma.storePage.findFirst({
      where: { storeId, slug: candidate, NOT: { id } },
    });
    if (clash) candidate = `${candidate}-${Date.now().toString(36)}`;
    nextSlug = candidate;
  } else if (
    data.title !== undefined &&
    data.title.trim() &&
    data.title.trim() !== page.title &&
    page.status === "draft"
  ) {
    let candidate = slugify(data.title);
    const clash = await prisma.storePage.findFirst({
      where: { storeId, slug: candidate, NOT: { id } },
    });
    if (clash) candidate = `${candidate}-${Date.now().toString(36)}`;
    nextSlug = candidate;
  }

  const nextStatus = data.status ?? page.status;

  return prisma.storePage.update({
    where: { id },
    data: {
      title: data.title?.trim() || page.title,
      slug: nextSlug,
      content: data.content !== undefined ? data.content : page.content,
      status: nextStatus,
    },
  });
}

export async function createStorePage(
  storeId: string,
  data: { title: string; content: string; status?: string; slug?: string }
) {
  let slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
  const exists = await prisma.storePage.findFirst({ where: { storeId, slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  return prisma.storePage.create({
    data: {
      storeId,
      title: data.title,
      slug,
      content: data.content,
      status: data.status ?? "draft",
    },
  });
}

export async function deleteStorePage(id: string, storeId: string) {
  const page = await prisma.storePage.findFirst({ where: { id, storeId } });
  if (!page) throw new Error("Page not found");
  await prisma.storePage.delete({ where: { id } });
}

export async function duplicateStorePage(id: string, storeId: string) {
  const page = await getStorePageById(id, storeId);
  if (!page) throw new Error("Page not found");

  let slug = `${page.slug}-copy`;
  const clash = await prisma.storePage.findFirst({ where: { storeId, slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  return prisma.storePage.create({
    data: {
      storeId,
      title: `${page.title} (copy)`,
      slug,
      content: page.content,
      status: "draft",
    },
  });
}
