import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
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
  data: { title: string; content: string; excerpt?: string; image?: string; status?: string }
) {
  let slug = slugify(data.title);
  const exists = await prisma.blogPost.findFirst({ where: { storeId, slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  return prisma.blogPost.create({
    data: {
      storeId,
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt ?? null,
      image: data.image ?? null,
      status: data.status ?? "draft",
      publishedAt: data.status === "published" ? new Date() : null,
    },
  });
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
