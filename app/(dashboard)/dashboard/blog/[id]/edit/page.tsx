import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { getBlogPost, serializeBlogPost } from "@/lib/blog";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { BlogEditorClient } from "@/components/blog/blog-editor-client";
import {
  BLOG_PAGE_TIPS,
  BlogTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "Edit post" };

export default async function EditBlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  const post = await getBlogPost(params.id, store.id);
  if (!post) notFound();

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Edit post"
        description="Update content, cover, and publish status"
        tips={BLOG_PAGE_TIPS}
        tipsTitle="Writing tips"
        tipsDescription="Small habits that make journal posts convert."
        tipsFooter={<BlogTipsFooter />}
      />
      <DashboardPageContent>
        <BlogEditorClient
          storeSlug={store.slug}
          post={serializeBlogPost(post)}
        />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
