import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-session";
import { prisma } from "@/lib/db";
import { listBlogPosts, serializeBlogPost } from "@/lib/blog";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardPageContent } from "@/components/shared/dashboard-page-content";
import { BlogClient } from "@/components/blog/blog-client";

export const metadata = { title: "Blog" };

export default async function BlogPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const store = await prisma.store.findFirst({ where: { userId: session.user.id } });
  if (!store) redirect("/onboarding");

  const posts = await listBlogPosts(store.id);

  return (
    <DashboardLayout>
      <DashboardHeader title="Online Store" description="Blog posts for your storefront" />
      <DashboardPageContent>
        <BlogClient initial={posts.map(serializeBlogPost)} />
      </DashboardPageContent>
    </DashboardLayout>
  );
}
