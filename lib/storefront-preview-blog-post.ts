export const PREVIEW_BLOG_POST_SLUG = "__preview__";

export function isPreviewBlogPostSlug(slug: string): boolean {
  return slug === PREVIEW_BLOG_POST_SLUG;
}

export interface PreviewBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  publishedAt: string | null;
}

export function getPreviewPlaceholderBlogPost(): PreviewBlogPost {
  return {
    title: "Your blog post",
    slug: PREVIEW_BLOG_POST_SLUG,
    excerpt: "Post excerpt will appear here when you publish journal entries from your dashboard.",
    content:
      "<p>Your article content will appear here. Use the blog in your dashboard to write stories, lookbook notes, and brand updates.</p>",
    image: null,
    publishedAt: null,
  };
}
