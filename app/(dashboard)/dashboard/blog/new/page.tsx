import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { BlogEditorClient } from "@/components/blog/blog-editor-client";
import {
  BLOG_PAGE_TIPS,
  BlogTipsFooter,
} from "@/components/shared/dashboard-tips-button";

export const metadata = { title: "Write post" };

export default async function NewBlogPostPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({
    where: { userId: session.user.id },
  });
  if (!store) redirect("/onboarding");

  return (
    <DashboardLayout>
      <DashboardHeader
        title="Write post"
        description="Title, cover, and body — publish when shoppers should see it"
        tips={BLOG_PAGE_TIPS}
        tipsTitle="Writing tips"
        tipsDescription="Small habits that make journal posts convert."
        tipsFooter={<BlogTipsFooter />}
      />
      <DashboardPageContent>
        <BlogEditorClient storeSlug={store.slug} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
