import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listBlogPosts(storeId: string) {
  return prisma.blogPost.findMany({
    where: { storeId },
    orderBy: { updatedAt: "desc" },
  });
}

export function serializeBlogPost(post: {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  image: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): BlogPostRow {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    image: post.image,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function createBlogPost(
  storeId: string,
  data: {
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    status?: string;
  }
) {
  let slug = slugify(data.title);
  const exists = await prisma.blogPost.findFirst({ where: { storeId, slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const status = data.status ?? "draft";
  return prisma.blogPost.create({
    data: {
      storeId,
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt ?? null,
      image: data.image ?? null,
      status,
      publishedAt: status === "published" ? new Date() : null,
    },
  });
}

export async function updateBlogPost(
  id: string,
  storeId: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string | null;
    image?: string | null;
    status?: string;
  }
) {
  const existing = await prisma.blogPost.findFirst({ where: { id, storeId } });
  if (!existing) throw new Error("Post not found");

  const nextStatus = data.status ?? existing.status;
  let nextSlug = existing.slug;

  if (
    data.title !== undefined &&
    data.title.trim() &&
    data.title.trim() !== existing.title &&
    existing.status === "draft"
  ) {
    let candidate = slugify(data.title);
    const clash = await prisma.blogPost.findFirst({
      where: { storeId, slug: candidate, NOT: { id } },
    });
    if (clash) candidate = `${candidate}-${Date.now().toString(36)}`;
    nextSlug = candidate;
  }

  let publishedAt = existing.publishedAt;
  if (nextStatus === "published" && !publishedAt) {
    publishedAt = new Date();
  }

  return prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title?.trim() || existing.title,
      slug: nextSlug,
      content: data.content !== undefined ? data.content : existing.content,
      excerpt: data.excerpt !== undefined ? data.excerpt : existing.excerpt,
      image: data.image !== undefined ? data.image : existing.image,
      status: nextStatus,
      publishedAt,
    },
  });
}

export async function getBlogPost(id: string, storeId: string) {
  return prisma.blogPost.findFirst({ where: { id, storeId } });
}

export async function listPublishedBlogPosts(storeId: string) {
  return prisma.blogPost.findMany({
    where: { storeId, status: "published" },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getPublishedBlogPost(storeId: string, slug: string) {
  return prisma.blogPost.findFirst({
    where: { storeId, slug, status: "published" },
  });
}

export async function deleteBlogPost(id: string, storeId: string) {
  const post = await prisma.blogPost.findFirst({ where: { id, storeId } });
  if (!post) throw new Error("Post not found");
  await prisma.blogPost.delete({ where: { id } });
}
